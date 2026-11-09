import hashlib
import json
import secrets

from django.http import HttpRequest, HttpResponse, JsonResponse
from django.utils import timezone
from django.views.decorators.cache import cache_control
from django.views.decorators.csrf import csrf_exempt

from . import mcp, views
from .agent import token_json
from .models import BusinessAgentToken


INSTRUCTIONS = "Данные относятся только к компании владельца ключа. Предложенные действия требуют подтверждения человеком в кабинете."
TOOLS = [
    mcp.tool("get_overview", "Обзор", "Обзор компании и финансирования", {}),
    mcp.tool("list_deals", "Сделки", "Список сделок компании", {"status": {"type": "string"}, "category": {"type": "string"}, "q": {"type": "string"}, "sort": {"type": "string"}}),
    mcp.tool("get_deal", "Сделка", "Подробности сделки компании", {"deal_id": {"type": "integer", "minimum": 1}}, ("deal_id",)),
    mcp.tool("list_payments", "Платежи", "Платежи компании", {}),
    mcp.tool("list_requests", "Заявки", "Заявки компании", {}),
    mcp.tool("get_company", "Компания", "Профиль компании", {}),
    mcp.tool("propose_action", "Предложить действие", "Предложить создание заявки или напоминание для подтверждения человеком", {
        "kind": {"type": "string", "enum": ["create_request", "payment_reminder"]},
        "title": {"type": "string", "minLength": 1, "maxLength": 200},
        "payload": {"type": "object", "description": "Поля заявки либо note для напоминания"},
    }, ("kind", "title", "payload"), read_only=False),
]


def call_tool(name, args, business):
    if not isinstance(args, dict):
        raise ValueError("Аргументы должны быть объектом")
    if name == "propose_action":
        from .business_actions import action_json, create_action
        return {"action": action_json(create_action(business, args)), "message": "Предложение ожидает подтверждения человеком"}
    request = HttpRequest()
    request.method = "GET"
    request.user = business.user
    if name == "get_deal":
        deal_id = args.get("deal_id")
        if type(deal_id) is not int or deal_id <= 0:
            raise ValueError("Укажите сделку")
        response = views.business_deal_detail(request, deal_id)
    elif name == "list_deals":
        request.GET = request.GET.copy()
        for field in ("status", "category", "q", "sort"):
            if field in args:
                if not isinstance(args[field], str):
                    raise ValueError("Некорректный фильтр")
                request.GET[field] = args[field]
        response = views.business_deals(request)
    elif name == "get_overview":
        response = views.business_overview(request)
    elif name == "list_payments":
        response = views.business_payments(request)
    elif name == "list_requests":
        response = views.business_requests(request)
    elif name == "get_company":
        return views.company_json(business)
    else:
        raise KeyError(name)
    data = json.loads(response.content)
    if response.status_code >= 400:
        raise ValueError(data.get("error", "Не удалось получить данные"))
    return data


@csrf_exempt
def endpoint(request):
    origin = request.headers.get("Origin")
    if origin is not None and origin != "http://localhost:3001" and not mcp.allowed_origin(origin):
        return mcp.rpc_error(None, -32000, "Forbidden origin", status=403, include_id=False)
    if request.method != "POST":
        response = HttpResponse(status=405)
        response["Allow"] = "POST"
        return response
    scheme, separator, raw = request.headers.get("Authorization", "").partition(" ")
    token = None
    if separator and scheme.lower() == "bearer" and raw.startswith("uzxb_"):
        digest = hashlib.sha256(raw.encode()).hexdigest()
        token = BusinessAgentToken.objects.select_related("business__user").filter(token_hash=digest, revoked_at__isnull=True, business__user__is_active=True).first()
    if token is None:
        response = mcp.rpc_error(None, -32001, "Требуется действующий токен", status=401)
        response["WWW-Authenticate"] = "Bearer"
        return response
    BusinessAgentToken.objects.filter(pk=token.pk).update(last_used_at=timezone.now())
    return mcp.handle_rpc(request, token, TOOLS, lambda name, args: call_tool(name, args, token.business), INSTRUCTIONS)


@cache_control(private=True, no_store=True)
def tokens(request):
    business = views.current_business(request)
    if business is None:
        return views.unauthorized()
    if request.method == "GET":
        return JsonResponse({"items": [token_json(item) for item in business.agent_tokens.filter(revoked_at__isnull=True)]})
    if request.method != "POST":
        return views.error("Только GET или POST", 405)
    if request.session.get("business_guest") is True:
        return views.error("Гостевой режим: только просмотр", 403)
    try:
        data = json.loads(request.body or b"{}")
        name = data.get("name")
        if not isinstance(name, str) or not name.strip() or len(name.strip()) > 60:
            raise ValueError
    except (ValueError, TypeError, AttributeError):
        return views.error("Введите название токена")
    raw = "uzxb_" + secrets.token_urlsafe(32)
    token = BusinessAgentToken.objects.create(business=business, name=name.strip(), prefix=raw[:12], token_hash=hashlib.sha256(raw.encode()).hexdigest())
    return JsonResponse(token_json(token) | {"token": raw}, status=201)


@cache_control(private=True, no_store=True)
def revoke_token(request, token_id):
    business = views.current_business(request)
    if business is None:
        return views.unauthorized()
    if request.method != "POST":
        return views.error("Только POST", 405)
    if request.session.get("business_guest") is True:
        return views.error("Гостевой режим: только просмотр", 403)
    token = business.agent_tokens.filter(pk=token_id, revoked_at__isnull=True).first()
    if token is None:
        return views.error("Токен не найден", 404)
    token.revoked_at = timezone.now()
    token.save(update_fields=["revoked_at"])
    return JsonResponse({"status": "ok"})
