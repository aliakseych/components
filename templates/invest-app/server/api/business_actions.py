from django.db import transaction
from django.http import JsonResponse
from django.utils import timezone

from . import services
from .models import BusinessAction
from .views import current_business, error, unauthorized


def action_json(action):
    return {"id": action.pk, "kind": action.kind, "title": action.title, "payload": action.payload,
            "status": action.status, "created_at": action.created_at.isoformat(),
            "resolved_at": action.resolved_at.isoformat() if action.resolved_at else None}


def create_action(business, data):
    if not isinstance(data, dict):
        raise services.DomainError("Некорректное действие")
    kind, title, payload = data.get("kind"), data.get("title"), data.get("payload")
    if not isinstance(title, str) or not title.strip() or len(title) > 200 or not isinstance(payload, dict):
        raise services.DomainError("Некорректное действие")
    if kind == "create_request":
        services.validate_procurement_request_data(business, payload)
    elif kind == "payment_reminder":
        note = payload.get("note")
        if set(payload) != {"note"} or not isinstance(note, str) or not note.strip() or len(note) > 1000:
            raise services.DomainError("Укажите текст напоминания")
        payload = {"note": note.strip()}
    else:
        raise services.DomainError("Неизвестное действие")
    return BusinessAction.objects.create(business=business, kind=kind, title=title.strip(), payload=payload)


def actions(request):
    if request.method != "GET":
        return error("Только GET", 405)
    business = current_business(request)
    if not business:
        return unauthorized()
    items = BusinessAction.objects.filter(business=business)
    status = request.GET.get("status")
    if status:
        if status not in {"pending", "executed", "rejected"}:
            return error("Неизвестный статус")
        items = items.filter(status=status)
    return JsonResponse({"items": [action_json(item) for item in items]})


def _resolve(request, action_id, execute):
    if request.method != "POST":
        return error("Только POST", 405)
    business = current_business(request)
    if not business:
        return unauthorized()
    if request.session.get("business_guest"):
        return error("Гостевой режим: изменения недоступны", 403)
    with transaction.atomic():
        action = BusinessAction.objects.select_for_update().filter(pk=action_id, business=business).first()
        if not action:
            return error("Действие не найдено", 404)
        if action.status != "pending":
            return error("Действие уже обработано", 409)
        if execute and action.kind == "create_request":
            try:
                services.create_procurement_request(business, action.payload)
            except services.DomainError as exc:
                return error(str(exc))
        action.status = "executed" if execute else "rejected"
        action.resolved_at = timezone.now()
        action.save(update_fields=["status", "resolved_at"])
    return JsonResponse(action_json(action))


def execute_action(request, action_id):
    return _resolve(request, action_id, True)


def reject_action(request, action_id):
    return _resolve(request, action_id, False)
