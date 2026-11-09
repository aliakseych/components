import hashlib
from decimal import Decimal

from django.core.cache import cache
from django.http import JsonResponse

from . import ai
from .business_ai import SYSTEM, _company_context
from .models import Deal, ProcurementRequest
from .views import business_get, error


def _context(business, deal_id=None):
    deals = list(Deal.objects.filter(business=business).prefetch_related("installments", "items__shipments"))
    requests = list(ProcurementRequest.objects.filter(business=business))
    return _company_context(business, deals, requests, {"mode": "analysis", "deal_id": deal_id})


def _fallback_insights(data):
    today = data["today"]
    payments = [(d, p) for d in data["deals"] if d["status"] == "active" for p in d["installments"] if not p["paid_at"] and p["due_date"]]
    payments.sort(key=lambda pair: pair[1]["due_date"])
    if payments:
        deal, payment = payments[0]
        overdue = payment["due_date"] < today
        payment_item = {"tone": "warning" if overdue else "tip", "title": "Срок платежа прошёл" if overdue else "Ближайший платёж", "text": f"{payment['due_date']}: {ai.money(payment['business_payment'])} по сделке «{deal['title']}», оплата не отмечена.", "link": f"/deals/{deal['id']}"}
    else:
        payment_item = {"tone": "tip", "title": "График платежей", "text": "Нет неоплаченных платежей с назначенной датой по активным сделкам.", "link": "/payments"}
    collecting = [d for d in data["deals"] if d["status"] == "collecting"]
    if collecting:
        deal = collecting[0]
        progress = Decimal(deal["collected_amount"]) * 100 / Decimal(deal["investors_amount"]) if Decimal(deal["investors_amount"]) else Decimal(0)
        collection_item = {"tone": "tip", "title": "Сбор инвестиций", "text": f"«{deal['title']}»: собрано {ai.pct(progress)} от суммы инвесторов.", "link": f"/deals/{deal['id']}"}
    else:
        collection_item = {"tone": "tip", "title": "Сбор инвестиций", "text": "Сделок на стадии сбора сейчас нет.", "link": "/deals"}
    statuses = {}
    for request in data["requests"]:
        statuses[request["status"]] = statuses.get(request["status"], 0) + 1
    labels = dict(ProcurementRequest.STATUS)
    text = "; ".join(f"{labels.get(status, status)}: {count}" for status, count in statuses.items()) if statuses else "Заявок пока нет."
    request_item = {"tone": "tip", "title": "Статусы заявок", "text": text, "link": "/requests"}
    totals = {}
    for deal in data["deals"]:
        if deal["status"] != "completed":
            totals[deal["category"]] = totals.get(deal["category"], Decimal(0)) + Decimal(deal["goods_amount"])
    total = sum(totals.values(), Decimal(0))
    if total:
        category, amount = max(totals.items(), key=lambda pair: pair[1])
        share = amount * 100 / total
        text = f"{dict(Deal.CATEGORY).get(category, category)}: {ai.pct(share)} стоимости товаров в незавершённых сделках."
        concentration = {"tone": "warning" if share > 70 else "positive", "title": "Концентрация сделок", "text": text, "link": "/deals"}
    else:
        concentration = {"tone": "tip", "title": "Концентрация сделок", "text": "Нет незавершённых сделок для оценки концентрации.", "link": "/deals"}
    return [payment_item, collection_item, request_item, concentration]


def _fallback_deal(deal):
    unpaid = [p for p in deal["installments"] if not p["paid_at"] and p["due_date"]]
    unpaid.sort(key=lambda p: p["due_date"])
    risks = ["Условия и сроки сделки могут измениться."]
    tips = ["Сверьте условия сделки и график платежей."]
    if unpaid:
        payment = unpaid[0]
        risks.append(f"Ближайший неоплаченный платёж: {payment['due_date']}, {ai.money(payment['business_payment'])}.")
    if deal["status"] == "collecting":
        tips.append(f"Следите за сбором: {ai.money(deal['collected_amount'])} из {ai.money(deal['investors_amount'])}.")
    else:
        tips.append("Проверяйте статус платежей и отгрузок.")
    return {"summary": f"«{deal['title']}»: {dict(Deal.STATUS).get(deal['status'], deal['status'])}, стоимость товара {ai.money(deal['goods_amount'])}.", "risks": risks, "tips": tips}


def _cached(kind, business, data, fallback, prompt, validate):
    payload = ai.dump(data)
    key = "business-ai:" + kind + ":" + hashlib.sha256((str(business.pk) + payload).encode()).hexdigest()
    result = cache.get(key)
    if result is None:
        result = fallback
        try:
            candidate = ai.complete(SYSTEM + " " + prompt + " Данные: " + payload, [{"role": "user", "content": "Проанализируй данные компании."}])
            if validate(candidate):
                result = candidate
        except ai.AiUnavailable:
            pass
        cache.set(key, result, 300 if result == fallback else 6 * 3600)
    return result


def _valid_insights(result, ids):
    items = result.get("items")
    return isinstance(items, list) and 3 <= len(items) <= 4 and all(isinstance(item, dict) and item.get("tone") in ("positive", "warning", "tip") and isinstance(item.get("title"), str) and item["title"].strip() and isinstance(item.get("text"), str) and item["text"].strip() and (item.get("link") is None or isinstance(item["link"], str) and item["link"] in {"/deals", "/payments", "/requests", *(f"/deals/{id}" for id in ids)}) for item in items)


def _valid_deal(result):
    return isinstance(result.get("summary"), str) and bool(result["summary"].strip()) and all(isinstance(result.get(k), list) and 1 <= len(result[k]) <= 3 and all(isinstance(s, str) and s.strip() for s in result[k]) for k in ("risks", "tips"))


@business_get
def insights(request, business):
    data = _context(business)
    fallback = {"items": _fallback_insights(data)}
    ids = {deal["id"] for deal in data["deals"]}
    result = _cached("insights", business, data, fallback, 'Верни JSON {"items":[{"tone":"positive|warning|tip","title":"заголовок","text":"наблюдение","link":"/deals, /payments, /requests или /deals/ID"}]}, 3–4 наблюдения о платежах, сборе, заявках и концентрации. Не придумывай факты.', lambda candidate: _valid_insights(candidate, ids))
    return JsonResponse(result)


@business_get
def deal_opinion(request, business, deal_id):
    data = _context(business, deal_id)
    deal = next((d for d in data["deals"] if d["id"] == deal_id), None)
    if deal is None:
        return error("Сделка не найдена", 404)
    data["deals"] = [deal]
    data["requests"] = [r for r in data["requests"] if r["deal_id"] == deal_id]
    fallback = _fallback_deal(deal)
    result = _cached("deal", business, data, fallback, 'Верни JSON {"summary":"краткое резюме", "risks":["риск"], "tips":["совет"]}. Оцени выбранную сделку компании, не придумывай факты.', _valid_deal)
    return JsonResponse({k: result[k] for k in ("summary", "risks", "tips")})
