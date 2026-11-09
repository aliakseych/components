import base64
import binascii
import fcntl
import hashlib
import json
import logging
import os
import re
import time

from django.conf import settings
from django.core.cache import cache

from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from . import services
from .agent import create_action
from .models import Business, Deal
from .models_agent import AgentToken, action_json


logger = logging.getLogger(__name__)
VERSIONS = ("2026-07-28", "2025-11-25", "2025-06-18", "2025-03-26")
SERVER_INFO = {"name": re.sub(r"[^a-z0-9]+", "-", settings.APP_NAME.lower()).strip("-") or "invest-app",
               "title": settings.APP_NAME, "version": "1.0"}
INSTRUCTIONS = (f"{settings.APP_NAME} позволяет инвестировать в товарные сделки. Это не банковский вклад. "
                "Действия лишь предлагаются: человек должен проверить и подтвердить их свайпом в приложении.")


def tool(name, title, description, properties, required=(), read_only=True):
    return {"name": name, "title": title, "description": description,
            "inputSchema": {"type": "object", "properties": properties, "required": list(required), "additionalProperties": False},
            "annotations": {"readOnlyHint": read_only}}


TOOLS = [
    tool("list_deals", "Список сделок", "Найти сделки / List available deals.", {
        "status": {"type": "string"}, "category": {"type": "string"}, "q": {"type": "string"}}),
    tool("get_deal", "Сделка", "Подробности сделки / Get deal details.",
         {"deal_id": {"type": "integer", "minimum": 1}}, ("deal_id",)),
    tool("get_company", "Компания", "Сведения о компании / Get company details.",
         {"company_id": {"type": "integer", "minimum": 1}}, ("company_id",)),
    tool("get_portfolio", "Портфель", "Баланс, вложения и выплаты / Get portfolio.", {}),
    tool("get_profile", "Профиль", "Профиль инвестора / Get investor profile.", {}),
    tool("get_operations", "Операции", "История операций / Get account operations.",
         {"limit": {"type": "integer", "minimum": 1, "maximum": 100}}),
    tool("propose_action", "Предложить действие", "Предложить вложение или пополнение для подтверждения человеком / Propose an action for human confirmation.", {
        "kind": {"type": "string", "enum": ["invest", "topup"]},
        "deal_id": {"type": "integer", "minimum": 1},
        "amount": {"type": "number", "exclusiveMinimum": 0, "description": "Сумма в сумах"},
        "title": {"type": "string", "minLength": 1, "maxLength": 140},
        "reason": {"type": "string", "minLength": 1},
    }, ("kind", "amount", "title", "reason"), read_only=False),
]


def call_tool(name, args, investor, token):
    from .views import company_view, deal_detail, deal_summary, me_json

    if not isinstance(args, dict):
        raise ValueError("Аргументы должны быть объектом")
    if name == "list_deals":
        deals = Deal.objects.select_related("business").prefetch_related("items", "installments")
        status = args.get("status")
        if status == "open":
            status = "collecting"
        if status == "closed":
            deals = deals.filter(status__in=["active", "completed"])
        elif status:
            deals = deals.filter(status=status)
        if args.get("category"):
            deals = deals.filter(category=args["category"])
        if args.get("q"):
            from .search import search_deals
            deals = search_deals(deals, str(args["q"]).strip())
        return {"items": [deal_summary(deal, investor) for deal in deals]}
    if name == "get_deal":
        deal_id = args.get("deal_id")
        if type(deal_id) is not int or deal_id <= 0:
            raise ValueError("Укажите сделку")
        deal = Deal.objects.select_related("business").filter(pk=deal_id).first()
        if deal is None:
            raise ValueError("Сделка не найдена")
        return deal_detail(deal, investor)
    if name == "get_company":
        company_id = args.get("company_id")
        if type(company_id) is not int or company_id <= 0:
            raise ValueError("Укажите компанию")
        company = Business.objects.filter(pk=company_id).first()
        if company is None:
            raise ValueError("Компания не найдена")
        request = HttpRequest()
        request.method = "GET"
        request.user = investor.user
        return json.loads(company_view(request, company.pk).content)
    if name == "get_portfolio":
        account = me_json(investor)
        items = [deal_summary(i.deal, investor) | services.personal_schedule(i.deal, i)
                 for i in investor.investments.select_related("deal__business")]
        return {"balance": account["balance"], "invested": account["invested"],
                "next_payout": account["next_payout"], "items": items}
    if name == "get_profile":
        return me_json(investor)
    if name == "get_operations":
        limit = args.get("limit", 50)
        if type(limit) is not int or not 1 <= limit <= 100:
            raise ValueError("Лимит должен быть от 1 до 100")
        return {"items": [{"id": o.id, "kind": o.kind, "amount": o.amount, "deal_id": o.deal_id,
                            "deal_title": o.deal.title if o.deal_id else None, "created_at": o.created_at}
                           for o in investor.operations.select_related("deal")[:limit]]}
    if name == "propose_action":
        if over_limit(f"propose:{token.pk}", PROPOSE_PER_MINUTE):
            raise ValueError(f"Не больше {PROPOSE_PER_MINUTE} предложений в минуту, повторите позже")
        action = create_action(investor, args, source=token.name, token=token)
        return {"action": action_json(action), "message": "Предложение отправлено в приложение, человек подтвердит свайпом"}
    raise KeyError(name)


def rpc_error(identifier, code, message, status=200, data=None, include_id=True):
    payload = {"jsonrpc": "2.0", "error": {"code": code, "message": message}}
    if include_id:
        payload["id"] = identifier
    if data is not None:
        payload["error"]["data"] = data
    return JsonResponse(payload, status=status)


# Рейт-лимит MCP: фиксированное окно в минуту в общем кэше (файловый, общий для воркеров).
TOKEN_PER_MINUTE = 60
IP_PER_MINUTE = 120
PROPOSE_PER_MINUTE = 10


def over_limit(key, limit):
    # incr у файлового кэша — это get+set, не атомарно: сериализуем flock'ом на все потоки и воркеры.
    bucket = f"mcp-rl:{key}:{int(time.time() // 60)}"
    os.makedirs(settings.CACHE_DIR, exist_ok=True)
    with open(os.path.join(settings.CACHE_DIR, "mcp-rl.lock"), "a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        try:
            count = (cache.get(bucket) or 0) + 1
            cache.set(bucket, count, 90)
        finally:
            fcntl.flock(lock, fcntl.LOCK_UN)
    return count > limit


def rate_limited():
    response = rpc_error(None, -32029, "Слишком много запросов, повторите через минуту", status=429, include_id=False)
    response["Retry-After"] = str(60 - int(time.time()) % 60)
    return response

def allowed_origin(origin):
    if origin in (*settings.CSRF_TRUSTED_ORIGINS, "http://localhost:3000"):
        return True
    match = re.fullmatch(r"http://127\.0\.0\.1:([0-9]{1,5})", origin)
    return bool(match and 1 <= int(match.group(1)) <= 65535)


def decode_name_header(value):
    if value.startswith("=?base64?") and value.endswith("?="):
        return base64.b64decode(value[9:-2], validate=True).decode("utf-8")
    if value != value.strip() or any(ord(char) < 32 or ord(char) > 126 for char in value):
        raise ValueError("Invalid header characters")
    return value


@csrf_exempt
def mcp(request):
    origin = request.headers.get("Origin")
    if origin is not None and not allowed_origin(origin):
        return rpc_error(None, -32000, "Forbidden origin", status=403, include_id=False)
    if request.method != "POST":
        response = HttpResponse(status=405)
        response["Allow"] = "POST"
        return response
    # IP-лимит до проверки токена — заодно защищает от перебора ключей.
    ip = request.headers.get("X-Forwarded-For", request.META.get("REMOTE_ADDR", "")).split(",")[0].strip()
    if over_limit(f"ip:{ip}", IP_PER_MINUTE):
        return rate_limited()
    authorization = request.headers.get("Authorization", "")
    scheme, separator, raw = authorization.partition(" ")
    token = None
    if separator and scheme.lower() == "bearer" and raw.startswith("agt_"):
        digest = hashlib.sha256(raw.encode()).hexdigest()
        token = AgentToken.objects.select_related("investor").filter(token_hash=digest, revoked_at__isnull=True).first()
    if token is None:
        response = rpc_error(None, -32001, "Требуется действующий токен", status=401)
        response["WWW-Authenticate"] = "Bearer"
        return response
    if over_limit(f"token:{token.pk}", TOKEN_PER_MINUTE):
        return rate_limited()
    AgentToken.objects.filter(pk=token.pk).update(last_used_at=timezone.now())
    return handle_rpc(request, token, TOOLS, lambda name, args: call_tool(name, args, token.investor, token), INSTRUCTIONS)


def handle_rpc(request, token, tools, invoke, instructions):
    try:
        message = json.loads(request.body)
    except (ValueError, UnicodeDecodeError):
        return rpc_error(None, -32700, "Parse error", status=400)
    if not isinstance(message, dict) or message.get("jsonrpc") != "2.0" or not isinstance(message.get("method"), str):
        return rpc_error(None, -32600, "Invalid Request", status=400)
    identifier = message.get("id")
    is_notification = "id" not in message
    method = message["method"]
    params = message.get("params", {})
    if not isinstance(params, dict):
        return rpc_error(identifier, -32602, "Invalid params", status=400, include_id=not is_notification)
    meta = params.get("_meta", {})
    if not isinstance(meta, dict):
        return rpc_error(identifier, -32602, "Invalid request metadata", status=400, include_id=not is_notification)
    version_header = request.headers.get("MCP-Protocol-Version")
    body_version = meta.get("io.modelcontextprotocol/protocolVersion")
    mismatch = lambda text: rpc_error(identifier, -32020, text, status=400, include_id=not is_notification)
    if version_header is not None and body_version is not None and version_header != body_version:
        return mismatch("Header mismatch: MCP-Protocol-Version")
    version = version_header if version_header is not None else "2025-03-26"
    if version not in VERSIONS:
        return rpc_error(identifier, -32022, "Unsupported protocol version", status=400,
                         data={"supported": list(VERSIONS), "requested": version},
                         include_id=not is_notification)
    modern_request = version == VERSIONS[0] and not is_notification
    if modern_request and body_version is None:
        return mismatch("Missing protocol version in request metadata")
    method_header = request.headers.get("Mcp-Method")
    if (modern_request and method_header is None) or (method_header is not None and method_header != method):
        return mismatch("Header mismatch: Mcp-Method")
    name_header = request.headers.get("Mcp-Name")
    name_field = {"tools/call": "name", "resources/read": "uri", "prompts/get": "name"}.get(method)
    if name_field:
        if modern_request and name_header is None:
            return mismatch("Missing Mcp-Name header")
        if name_header is not None:
            try:
                decoded_name = decode_name_header(name_header)
            except (ValueError, UnicodeDecodeError, binascii.Error):
                return mismatch("Malformed Mcp-Name header")
            if decoded_name != params.get(name_field):
                return mismatch("Header mismatch: Mcp-Name")
    if modern_request and not isinstance(meta.get("io.modelcontextprotocol/clientCapabilities"), dict):
        return rpc_error(identifier, -32602, "Missing client capabilities", status=400)
    if is_notification:
        return HttpResponse(status=202)
    if method == "initialize" and version != VERSIONS[0]:
        requested_version = params.get("protocolVersion")
        result = {"protocolVersion": requested_version if requested_version in VERSIONS else VERSIONS[0],
                  "capabilities": {"tools": {"listChanged": False}}, "serverInfo": SERVER_INFO,
                  "instructions": instructions}
    elif method == "ping" and version != VERSIONS[0]:
        result = {}
    elif method == "server/discover":
        result = {"resultType": "complete", "supportedVersions": list(VERSIONS),
                  "capabilities": {"tools": {"listChanged": False}},
                  "_meta": {"io.modelcontextprotocol/serverInfo": SERVER_INFO},
                  "instructions": instructions}
    elif method == "tools/list":
        result = {"resultType": "complete", "tools": tools, "ttlMs": 0, "cacheScope": "private"}
    elif method == "tools/call":
        name = params.get("name")
        if not isinstance(name, str) or name not in {item["name"] for item in tools}:
            return rpc_error(identifier, -32602, "Unknown tool")
        try:
            data = invoke(name, params.get("arguments", {}))
            text = json.dumps(data, cls=DjangoJSONEncoder, ensure_ascii=False)
            result = {"resultType": "complete", "content": [{"type": "text", "text": text}], "structuredContent": json.loads(text)}
        except (ValueError, TypeError, services.DomainError) as exc:
            result = {"resultType": "complete", "content": [{"type": "text", "text": str(exc)}], "isError": True}
        except Exception:
            logger.exception("Ошибка инструмента MCP %s", name)
            result = {"resultType": "complete", "content": [{"type": "text", "text": "Не удалось выполнить инструмент"}], "isError": True}
    else:
        return rpc_error(identifier, -32601, "Method not found", status=404)
    if version == VERSIONS[0]:
        result.setdefault("resultType", "complete")
        result.setdefault("_meta", {})["io.modelcontextprotocol/serverInfo"] = SERVER_INFO
    return JsonResponse({"jsonrpc": "2.0", "id": identifier, "result": result})
