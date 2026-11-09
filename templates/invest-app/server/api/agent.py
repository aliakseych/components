import hashlib
import json
import secrets
from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from . import services
from .models import Deal
from .models_agent import AgentAction, AgentToken, action_json
from .views import current_investor, error, unauthorized


def token_json(token):
    return {"id": token.pk, "name": token.name, "created_at": token.created_at, "last_used_at": token.last_used_at}


def create_action(investor, data, source, token=None):
    if not isinstance(data, dict):
        raise services.DomainError("Неверные параметры действия")
    kind = data.get("kind")
    if kind not in ("invest", "topup"):
        raise services.DomainError("Неверный тип действия")
    try:
        raw = data.get("amount")
        if isinstance(raw, bool):
            raise ValueError
        amount = Decimal(str(raw))
        if not amount.is_finite() or amount <= 0 or amount >= Decimal("10000000000000000") or amount.as_tuple().exponent < -2:
            raise ValueError
    except (InvalidOperation, ValueError, TypeError):
        raise services.DomainError("Введите корректную сумму")
    title, reason = data.get("title"), data.get("reason")
    if not isinstance(title, str) or not title.strip() or len(title.strip()) > 140:
        raise services.DomainError("Введите название действия")
    if not isinstance(reason, str) or not reason.strip():
        raise services.DomainError("Введите обоснование действия")
    deal = None
    if kind == "invest":
        deal_id = data.get("deal_id")
        if type(deal_id) is not int or deal_id <= 0:
            raise services.DomainError("Укажите сделку")
        deal = Deal.objects.filter(pk=deal_id, status="collecting").first()
        if deal is None:
            raise services.DomainError("Сделка не найдена или сбор завершён")
        if amount < deal.min_investment:
            raise services.DomainError("Сумма меньше минимального вложения")
    return AgentAction.objects.create(investor=investor, token=token, source=source, kind=kind,
                                      deal=deal, amount=amount, title=title.strip(), reason=reason.strip())


@csrf_exempt
def tokens(request):
    investor = current_investor(request)
    if investor is None:
        return unauthorized()
    if request.method == "GET":
        return JsonResponse({"items": [token_json(t) for t in investor.agent_tokens.filter(revoked_at__isnull=True)]})
    if request.method != "POST":
        return error("Только GET или POST", 405)
    try:
        data = json.loads(request.body or b"{}")
        name = data.get("name")
        if not isinstance(name, str) or not name.strip() or len(name.strip()) > 60:
            raise ValueError
    except (ValueError, TypeError, AttributeError):
        return error("Введите название токена")
    raw = "agt_" +secrets.token_urlsafe(32)
    token = AgentToken.objects.create(investor=investor, name=name.strip(), prefix=raw[:12],
                                      token_hash=hashlib.sha256(raw.encode()).hexdigest())
    return JsonResponse(token_json(token) | {"token": raw}, status=201)


@csrf_exempt
def revoke_token(request, token_id):
    investor = current_investor(request)
    if investor is None:
        return unauthorized()
    if request.method != "POST":
        return error("Только POST", 405)
    token = investor.agent_tokens.filter(pk=token_id, revoked_at__isnull=True).first()
    if token is None:
        return error("Токен не найден", 404)
    token.revoked_at = timezone.now()
    token.save(update_fields=["revoked_at"])
    return JsonResponse({"status": "ok"})


def actions(request):
    investor = current_investor(request)
    if investor is None:
        return unauthorized()
    if request.method != "GET":
        return error("Только GET", 405)
    items = investor.agent_actions.select_related("deal")
    if request.GET.get("status"):
        items = items.filter(status=request.GET["status"])
    return JsonResponse({"items": [action_json(item) for item in items]})


@csrf_exempt
def execute_action(request, action_id):
    investor = current_investor(request)
    if investor is None:
        return unauthorized()
    if request.method != "POST":
        return error("Только POST", 405)
    with transaction.atomic():
        action = AgentAction.objects.select_for_update().filter(pk=action_id, investor=investor).first()
        if action is None:
            return error("Действие не найдено", 404)
        if action.status != "pending":
            return error("Действие уже выполнено")
        amount_text = f"{action.amount:,.2f}".replace(",", " ").rstrip("0").rstrip(".")
        try:
            with transaction.atomic():
                if action.kind == "invest":
                    if action.deal_id is None:
                        raise services.DomainError("Сделка не найдена")
                    services.invest(investor, action.deal, action.amount)
                    action.result = f"Вложено {amount_text} сум в {action.deal.title}"
                elif action.kind == "topup":
                    services.topup(investor, action.amount)
                    action.result = f"Баланс пополнен на {amount_text} сум"
                else:
                    raise services.DomainError("Неизвестный тип действия")
        except services.DomainError as exc:
            action.status = "failed"
            action.result = str(exc)
            action.save(update_fields=["status", "result"])
            return error(str(exc))
        action.status = "executed"
        action.executed_at = timezone.now()
        action.save(update_fields=["status", "result", "executed_at"])
        return JsonResponse(action_json(action))


@csrf_exempt
def reject_action(request, action_id):
    investor = current_investor(request)
    if investor is None:
        return unauthorized()
    if request.method != "POST":
        return error("Только POST", 405)
    with transaction.atomic():
        action = AgentAction.objects.select_for_update().filter(pk=action_id, investor=investor).first()
        if action is None:
            return error("Действие не найдено", 404)
        if action.status != "pending":
            return error("Действие уже выполнено")
        action.status = "rejected"
        action.save(update_fields=["status"])
        return JsonResponse(action_json(action))
