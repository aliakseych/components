import json
import re
from datetime import date, timedelta
from decimal import Decimal, InvalidOperation
from functools import wraps

from django.contrib.auth.models import User
from django.db import IntegrityError, transaction
from django.contrib.auth import authenticate, login, logout
from django.db import connection
from django.db.models import Case, DecimalField, F, IntegerField, Sum, Value, When
from django.db.models.functions import Floor, Least, NullIf
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.utils import timezone
from django.views.decorators.cache import cache_control
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.debug import sensitive_variables

from . import ai, services
from .models import Business, Deal, Installment, Investment, Investor, Operation, ProcurementRequest
from .orginfo import orginfo_url, resolve_orginfo_id
from .search import search_deals
from .services import DomainError

STATUS_ORDER = {"collecting": 0, "active": 1, "completed": 2}
PORTFOLIO_ORDER = {"active": 0, "collecting": 1, "completed": 2}
DEMO_COMPANY_NAME = "Демо-компания"

POOL_INFO = {
    "fuel": ("Топливо", "АЗС и автопарки"),
    "agro": ("Агро", "Маслозаводы и фермы"),
    "food": ("Продукты", "Хлебозаводы и кондитеры"),
    "construction": ("Стройка", "Цемент и арматура"),
}


def health(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
    return JsonResponse({"status": "ok"})


def body(request):
    return json.loads(request.body or b"{}")


def current_investor(request):
    if request.user.is_authenticated:
        return Investor.objects.filter(user=request.user).first()
    return None


def current_business(request):
    if request.user.is_authenticated and request.user.is_active:
        return Business.objects.filter(user=request.user).first()
    return None


def error(msg, status=400):
    return JsonResponse({"error": msg}, status=status)


def unauthorized():
    return error("Не авторизован", 401)


def only_post(request):
    return None if request.method == "POST" else error("Только POST", 405)


def parse_amount(request):
    try:
        return Decimal(str(body(request).get("amount")))
    except (InvalidOperation, ValueError, TypeError):
        raise DomainError("Введите сумму")


def business_json(b):
    return {
        "id": b.id, "name": b.name, "kind": b.kind, "region": b.region, "rating": b.rating,
        "uzex_since": b.uzex_since, "uzex_deals": b.uzex_deals, "uzex_paid_pct": b.uzex_paid_pct,
        "repayment_source": b.repayment_source, "halal": b.halal,
        "inn": b.inn, "halal_note": b.halal_note,
    }


def company_stability(b):
    years = max(0, date.today().year - b.uzex_since)
    capital = b.charter_capital or Decimal("0")
    capital_mln = format((capital / Decimal("1000000")).normalize(), "f").replace(".", ",")
    paid_pct = format(b.uzex_paid_pct.normalize(), "f").replace(".", ",")
    concentrated = any(Decimal(str(f.get("share_pct", 0))) > 90 for f in b.founders)
    checks = [
        (f"На бирже {years}лет", years >= 2, "Опыт работы на бирже", 10),
        (f"Оплаты в срок {paid_pct}%", b.uzex_paid_pct >= 95, "Доля своевременных оплат", 15),
        (f"Сделок на бирже {b.uzex_deals}", b.uzex_deals >= 50, "История сделок", 10),
        (f"Уставный капитал {capital_mln}млн", capital >= 100_000_000, "Размер капитала", 10),
        ("Долги по налогам", not b.tax_debt, "Нет долгов" if not b.tax_debt else "Есть долги", 15),
        ("Суды", b.court_cases == 0, f"Дел: {b.court_cases}", 15),
        ("Учредители", not concentrated, "Доля одного учредителя выше 90%" if concentrated else "Нет высокой концентрации", 10),
        ("Имущество в залоге", not b.pledged_assets, "Есть залог" if b.pledged_assets else "Нет залога", 15),
    ]
    score = 100 - sum(penalty for _, ok, _, penalty in checks if not ok)
    return {
        "score": score,
        "level": "good" if score >= 80 else "ok" if score >= 60 else "risk",
        "factors": [{"label": label, "ok": ok, "text": text} for label, ok, text, _ in checks],
    }


def company_json(b):
    return business_json(b) | {
        "legal_name": b.legal_name, "legal_form": b.legal_form, "director": b.director,
        "registered_at": b.registered_at, "charter_capital": b.charter_capital,
        "employees": b.employees, "activity": b.activity, "address": b.address,
        "founders": b.founders, "orginfo_url": orginfo_url(b), "orginfo_direct": bool(b.orginfo_id),
        "stability": company_stability(b),
    }


def company_view(request, company_id):
    if request.method != "GET":
        return error("Только GET", 405)
    business = Business.objects.filter(pk=company_id).first()
    if business is None:
        return error("Компания не найдена", 404)
    now = timezone.now()
    if (business.inn and not business.orginfo_id and
            (business.orginfo_checked_at is None or business.orginfo_checked_at < now - timedelta(days=7))):
        business.orginfo_id = resolve_orginfo_id(business.inn)
        business.orginfo_checked_at = now
        business.save(update_fields=["orginfo_id", "orginfo_checked_at"])
    deals = list(company_deal_queryset(business))
    deals.sort(key=lambda d: STATUS_ORDER.get(d.status, 3))
    paid = Installment.objects.filter(deal__business=business, paid_at__isnull=False)
    paid_count = paid.count()
    on_time = paid.filter(due_date__isnull=False, paid_at__lte=F("due_date")).count()
    raised = sum((d.investors_amount for d in deals if d.status in ("active", "completed")), Decimal("0.00"))
    return JsonResponse(company_json(business) | {
        "deals": [deal_summary(d, current_investor(request)) for d in deals],
        "totals": {"deals": len(deals), "raised": str(raised),
                   "paid_on_time_pct": round(on_time * 100 / paid_count, 2) if paid_count else 100},
    })


def procurement_request_json(item):
    return {
        "id": item.id,
        "commodity": item.commodity,
        "category": item.category,
        "quantity": f"{item.quantity:.2f}",
        "unit": item.unit,
        "region": item.region,
        "request_text": item.request_text,
        "delivery_address": item.delivery_address,
        "desired_delivery_date": item.desired_delivery_date,
        "delivery_terms": item.delivery_terms,
        "status": item.status,
        "review_note": item.review_note,
        "created_at": item.created_at,
        "updated_at": item.updated_at,
        "deal_id": item.deal_id,
    }


def company_deal_queryset(business):
    return (
        Deal.objects.filter(business=business)
        .select_related("business")
        .prefetch_related("installments", "items")
        .order_by("-created_at", "-id")
    )


def company_schedule(deal):
    paid = Decimal("0.00")
    remaining = Decimal("0.00")
    released = Decimal("0.00")
    next_installment = None
    for installment in deal.installments.all():
        if installment.paid_at is not None:
            paid += installment.business_payment
            released += installment.quantity_released
        else:
            remaining += installment.business_payment
            if next_installment is None or (
                installment.due_date is None, installment.due_date or date.max, installment.number
            ) < (
                next_installment.due_date is None, next_installment.due_date or date.max, next_installment.number
            ):
                next_installment = installment
    return paid, remaining, released, next_installment


def empty_company_financing():
    return {
        "investors_principal_remaining": Decimal("0.00"),
        "investors_income_remaining": Decimal("0.00"),
        "bank_remaining": Decimal("0.00"),
        "investors_principal_paid": Decimal("0.00"),
        "investors_income_paid": Decimal("0.00"),
        "bank_paid": Decimal("0.00"),
    }


def add_company_financing(totals, installment):
    suffix = "paid" if installment.paid_at is not None else "remaining"
    totals[f"investors_principal_{suffix}"] += installment.investors_principal
    totals[f"investors_income_{suffix}"] += installment.investors_income
    totals[f"bank_{suffix}"] += installment.bank_payout


def company_financing_json(totals):
    return {key: f"{amount:.2f}" for key, amount in totals.items()}


def company_item_json(item):
    return {
        "id": item.id,
        "position": item.position,
        "commodity": item.commodity,
        "quantity": f"{item.quantity:.2f}",
        "unit": item.unit,
        "price": f"{item.price:.2f}",
        "amount": f"{services.q2(item.quantity * item.price):.2f}",
        "warehouse": item.warehouse,
        "warehouse_region": item.warehouse_region,
    }


def company_shipment_json(shipment, item):
    return {
        "id": shipment.id,
        "item_id": item.id,
        "commodity": item.commodity,
        "unit": item.unit,
        "quantity": f"{shipment.quantity:.2f}",
        "status": shipment.status,
        "planned_date": shipment.planned_date,
        "dispatched_at": shipment.dispatched_at,
        "delivered_at": shipment.delivered_at,
        "destination": shipment.destination,
        "reference": shipment.reference,
    }


def company_next_payment(installment):
    if installment is None:
        return None
    return {
        "number": installment.number,
        "due_date": installment.due_date,
        "business_payment": f"{installment.business_payment:.2f}",
    }


def company_installment_json(installment):
    return {
        "number": installment.number,
        "day": installment.day,
        "due_date": installment.due_date,
        "business_payment": f"{installment.business_payment:.2f}",
        "investors_principal": f"{installment.investors_principal:.2f}",
        "investors_income": f"{installment.investors_income:.2f}",
        "bank_payout": f"{installment.bank_payout:.2f}",
        # This is the schedule allocation, not an operator-confirmed physical shipment.
        "quantity_released": f"{installment.quantity_released:.2f}",
        "paid_at": installment.paid_at,
    }


def company_deal_json(deal):
    paid, remaining, released, next_installment = company_schedule(deal)
    # Legacy commodity/quantity/unit describe one real item, never a mixed-product sum.
    items = list(deal.items.all())
    first_item = items[0] if items else None
    financing = empty_company_financing()
    for installment in deal.installments.all():
        add_company_financing(financing, installment)
    if deal.investors_amount <= 0 or deal.collected_amount <= 0:
        collected_pct = 0
    elif deal.collected_amount >= deal.investors_amount:
        collected_pct = 100
    else:
        collected_pct = int(deal.collected_amount * 100 / deal.investors_amount)
    return {
        "id": deal.id,
        "title": deal.title,
        "commodity": first_item.commodity if first_item else deal.commodity,
        "category": deal.category,
        "quantity": f"{(first_item.quantity if first_item else deal.quantity):.2f}",
        "unit": first_item.unit if first_item else deal.unit,
        "status": deal.status,
        "created_at": deal.created_at,
        "goods_amount": f"{deal.goods_amount:.2f}",
        "exchange_fee": f"{deal.exchange_fee:.2f}",
        "down_payment_pct": f"{deal.down_payment_pct:.2f}",
        "down_payment": f"{deal.down_payment:.2f}",
        "investors_amount": f"{deal.investors_amount:.2f}",
        "collected_amount": f"{deal.collected_amount:.2f}",
        "bank_amount": f"{deal.bank_amount:.2f}",
        "markup": f"{deal.markup:.2f}",
        "business_total": f"{deal.business_total:.2f}",
        "business_rate": f"{deal.business_rate:.2f}",
        "term_days": deal.term_days,
        "collect_deadline": deal.collect_deadline,
        "started_at": deal.started_at,
        "warehouse": first_item.warehouse if first_item else deal.warehouse,
        "warehouse_region": first_item.warehouse_region if first_item else deal.warehouse_region,
        "paid_installments_amount": f"{paid:.2f}",
        "remaining_installments_amount": f"{remaining:.2f}",
        "released_quantity": f"{released:.2f}",
        "next_payment": company_next_payment(next_installment),
        "items": [company_item_json(item) for item in items],
        "financing": company_financing_json(financing),
        "collected_pct": collected_pct,
    }


def my_investment(d, investor):
    if investor is None:
        return None
    return Investment.objects.filter(investor=investor, deal=d).first()


def deal_summary(d, investor):
    inv = my_investment(d, investor)
    nxt = d.installments.filter(paid_at__isnull=True).first()
    return {
        "id": d.id, "title": d.title, "commodity": d.commodity, "category": d.category,
        "ticker": d.ticker, "items_count": d.items.count(),
        "sparkline": [int(point[1]) for point in d.price_history[-12:]],
        "price_change_pct": round(float((d.current_price / d.exchange_price - 1) * 100), 1),
        "quantity": d.quantity, "unit": d.unit,
        "business": {"id": d.business.id, "name": d.business.name, "kind": d.business.kind,
                     "region": d.business.region, "rating": d.business.rating, "halal": d.business.halal},
        "investor_rate": d.investor_rate, "term_days": d.term_days, "status": d.status,
        "investors_amount": d.investors_amount, "collected_amount": d.collected_amount,
        "collected_pct": int(min(100, d.collected_amount * 100 / d.investors_amount)),
        "investors_count": d.investments.count(), "min_investment": d.min_investment,
        "collect_deadline": d.collect_deadline,
        "days_left": (d.collect_deadline - date.today()).days if d.collect_deadline else None,
        "started_at": d.started_at,
        "next_due": nxt.due_date if nxt else None,
        "my_investment": inv.amount if inv else None,
    }


def installment_json(i):
    return {
        "number": i.number, "day": i.day, "due_date": i.due_date,
        "business_payment": i.business_payment, "quantity_released": i.quantity_released,
        "investors_payout": i.investors_principal + i.investors_income,
        "investors_income": i.investors_income, "bank_payout": i.bank_payout, "paid_at": i.paid_at,
    }


def deal_detail(d, investor):
    inv = my_investment(d, investor)
    change = round(float((d.current_price / d.exchange_price - 1) * 100), 1)
    return deal_summary(d, investor) | {
        "request_text": d.request_text, "warehouse": d.warehouse, "warehouse_region": d.warehouse_region,
        "exchange_price": d.exchange_price, "goods_amount": d.goods_amount, "exchange_fee": d.exchange_fee,
        "down_payment_pct": d.down_payment_pct, "down_payment": d.down_payment,
        "bank_amount": d.bank_amount, "markup": d.markup, "business_total": d.business_total,
        "business_rate": d.business_rate, "loss_threshold_pct": d.loss_threshold_pct,
        "bank_threshold_pct": d.bank_threshold_pct, "worst_drop_pct": d.worst_drop_pct,
        "current_price": d.current_price, "price_change_pct": change,
        "margin_left_pct": round(float(d.loss_threshold_pct) + change, 1),
        "price_history": d.price_history, "agent_checks": d.agent_checks,
        "business": business_json(d.business),
        "items": [{
            "commodity": item.commodity, "quantity": item.quantity, "unit": item.unit,
            "price": item.price, "amount": services.q2(item.quantity * item.price),
            "warehouse": item.warehouse, "warehouse_region": item.warehouse_region,
        } for item in d.items.all()],
        "installments": [installment_json(i) for i in d.installments.all()],
        "my_investment": services.personal_schedule(d, inv) if inv else None,
    }


def profile_json(investor):
    return {
        "onboarded": investor.onboarded,
        "strategy": investor.strategy or None,
        "risk_level": investor.risk_level or None,
        "horizon_days": investor.horizon_days,
        "monthly_amount": investor.monthly_amount,
        "categories": investor.categories,
    }


def me_json(investor):
    invested = Decimal("0.00")
    income_expected = Decimal("0.00")
    income_received = Decimal("0.00")
    next_payout = None
    for inv in investor.investments.select_related("deal"):
        p = services.personal_schedule(inv.deal, inv)
        income_expected += p["income_expected"]
        income_received += p["income_received"]
        if inv.deal.status != "completed":
            # Сколько тела ещё в сделке: возвращённое уже зачислено в баланс.
            invested += inv.amount - (p["received_total"] - p["income_received"])
        nxt = p["next_payout"]
        if inv.deal.status == "active" and nxt and nxt["due_date"]:
            if next_payout is None or nxt["due_date"] < next_payout["due_date"]:
                next_payout = nxt | {"deal_id": inv.deal.id, "deal_title": inv.deal.title}
    return {
        "id": investor.id, "name": investor.name, "phone": investor.phone, "balance": investor.balance,
        "invested": invested, "income_expected": income_expected, "income_received": income_received,
        "next_payout": next_payout, "profile": profile_json(investor),
    }


@cache_control(private=True, no_store=True)
def business_csrf(request):
    if request.method != "GET":
        return error("Только GET", 405)
    return JsonResponse({"csrf_token": get_token(request)})


@cache_control(private=True, no_store=True)
@sensitive_variables()
def business_login(request):
    if resp := only_post(request):
        return resp
    try:
        data = body(request)
    except (ValueError, UnicodeDecodeError):
        return error("Некорректные данные запроса")
    if not isinstance(data, dict):
        return error("Некорректные данные запроса")
    guest = set(data) == {"guest"} and data["guest"] is True
    if guest:
        business = Business.objects.select_related("user").filter(
            user__username="business_demo", user__is_active=True,
            name=DEMO_COMPANY_NAME,
        ).first()
        user = business.user if business else None
    elif (
        set(data) == {"username", "password"}
        and isinstance(data["username"], str)
        and isinstance(data["password"], str)
    ):
        user = authenticate(request, username=data["username"].strip(), password=data["password"])
        business = Business.objects.filter(user=user).first() if user is not None and user.is_active else None
    else:
        return error("Некорректные данные запроса")
    if business is None:
        return error("Неверный логин или пароль")
    login(request, user)
    request.session["business_guest"] = guest
    return JsonResponse(business_json(business))


@cache_control(private=True, no_store=True)
def business_logout(request):
    if resp := only_post(request):
        return resp
    if not request.user.is_authenticated:
        return unauthorized()
    if current_business(request) is None:
        return error("Нет доступа к кабинету компании", 403)
    try:
        data = body(request)
    except (ValueError, UnicodeDecodeError):
        return error("Некорректные данные запроса")
    if not isinstance(data, dict) or data:
        return error("Некорректные данные запроса")
    logout(request)
    return JsonResponse({"status": "ok"})


@cache_control(private=True, no_store=True)
def business_me(request):
    if request.method != "GET":
        return error("Только GET", 405)
    if not request.user.is_authenticated:
        return unauthorized()
    business = current_business(request)
    if business is None:
        return error("Нет доступа к кабинету компании", 403)
    return JsonResponse(business_json(business) | {"guest": request.session.get("business_guest") is True})


def business_get(view):
    @wraps(view)
    @cache_control(private=True, no_store=True)
    def wrapped(request, *args, **kwargs):
        if request.method != "GET":
            return error("Только GET", 405)
        if not request.user.is_authenticated:
            return unauthorized()
        business = current_business(request)
        if business is None:
            return error("Нет доступа к кабинету компании", 403)
        return view(request, business, *args, **kwargs)
    return wrapped


@business_get
def business_overview(request, business):
    active_count = 0
    remaining_total = Decimal("0.00")
    next_payment = None
    next_payment_key = None
    financing = empty_company_financing()
    schedule = {}
    for deal in Deal.objects.filter(business=business, status="active").prefetch_related("installments"):
        active_count += 1
        _, remaining, _, installment = company_schedule(deal)
        remaining_total += remaining
        for entry in deal.installments.all():
            add_company_financing(financing, entry)
            if entry.paid_at is None and entry.due_date is not None:
                grouped = schedule.setdefault(entry.due_date, {
                    "business_payment": Decimal("0.00"),
                    "investors_principal": Decimal("0.00"),
                    "investors_income": Decimal("0.00"),
                    "bank_payout": Decimal("0.00"),
                })
                for field in grouped:
                    grouped[field] += getattr(entry, field)
        if installment is not None and installment.due_date is not None:
            key = (installment.due_date, deal.id, installment.number)
            if next_payment_key is None or key < next_payment_key:
                next_payment_key = key
                next_payment = company_next_payment(installment) | {
                    "deal_id": deal.id,
                    "deal_title": deal.title,
                }
    recent_deals = company_deal_queryset(business)[:5]
    return JsonResponse({
        "active_deals_count": active_count,
        "remaining_installments_amount": f"{remaining_total:.2f}",
        "next_payment": next_payment,
        "financing": company_financing_json(financing),
        "payment_schedule": [
            {"due_date": due_date, **{field: f"{amount:.2f}" for field, amount in amounts.items()}}
            for due_date, amounts in sorted(schedule.items())
        ],
        "recent_deals": [company_deal_json(deal) for deal in recent_deals],
    })


@business_get
def business_deals(request, business):
    from django.contrib.postgres.search import SearchQuery, SearchVector, TrigramSimilarity, TrigramWordSimilarity
    from django.db.models import F, Q
    from django.db.models.functions import Greatest

    statuses = request.GET.getlist("status")
    if len(statuses) > 1 or (statuses and statuses[0] not in dict(Deal.STATUS)):
        return error("Некорректный статус сделки")
    categories = request.GET.get("category", "").split(",")
    categories = [category for category in categories if category]
    if any(category not in dict(Deal.CATEGORY) for category in categories):
        return error("Некорректная категория сделки")
    sort = request.GET.get("sort", "newest")
    if sort not in ("newest", "amount", "closing"):
        return error("Некорректная сортировка")
    deals = company_deal_queryset(business)
    if statuses:
        deals = deals.filter(status=statuses[0])
    if categories:
        deals = deals.filter(category__in=categories)
    q = " ".join(request.GET.get("q", "").split())
    if q:
        from .search import search_deals

        # The investor search covers item commodities; include the deal's own
        # commodity too, including fuzzy matches for deals without item rows.
        vector = SearchVector("commodity", config="russian")
        query = SearchQuery(q, search_type="websearch", config="russian")
        commodity_matches = deals.annotate(
            commodity_vector=vector,
            commodity_similarity=Greatest(
                TrigramSimilarity("commodity", q), TrigramWordSimilarity(q, "commodity")
            ),
        ).filter(Q(commodity_vector=query) | Q(commodity_similarity__gte=0.3) | Q(commodity__icontains=q))
        deals = deals.filter(Q(pk__in=search_deals(deals, q).values("pk")) | Q(pk__in=commodity_matches.values("pk")))
    ordering = {
        "newest": ("-created_at", "-id"),
        "amount": ("-goods_amount", "-id"),
        "closing": (F("collect_deadline").asc(nulls_last=True), "-id"),
    }
    deals = deals.order_by(*ordering[sort])
    return JsonResponse({"items": [company_deal_json(deal) for deal in deals]})


@business_get
def business_deal_detail(request, business, deal_id):
    deal = (
        company_deal_queryset(business)
        .select_related("procurement_request")
        .prefetch_related("items__shipments")
        .filter(pk=deal_id)
        .first()
    )
    if deal is None:
        return error("Сделка не найдена", 404)
    linked = getattr(deal, "procurement_request", None)
    linked_request = None
    if linked is not None and linked.business_id == business.id:
        linked_request = {
            "id": linked.id,
            "delivery_address": linked.delivery_address,
            "desired_delivery_date": linked.desired_delivery_date,
            "delivery_terms": linked.delivery_terms,
        }
    return JsonResponse(company_deal_json(deal) | {
        "request_text": deal.request_text,
        "installments": [company_installment_json(i) for i in deal.installments.all()],
        "shipments": [
            company_shipment_json(shipment, item)
            for item in deal.items.all()
            for shipment in item.shipments.all()
        ],
        "linked_request": linked_request,
    })


@business_get
def business_payments(request, business):
    installments = (
        Installment.objects.filter(deal__business=business)
        .select_related("deal")
        .only(
            "deal_id", "number", "day", "due_date", "business_payment", "quantity_released",
            "investors_principal", "investors_income", "bank_payout",
            "paid_at", "deal__title", "deal__status",
        )
        .order_by(F("due_date").asc(nulls_last=True), "deal_id", "number")
    )
    return JsonResponse({"items": [
        company_installment_json(installment) | {
            "deal_id": installment.deal_id,
            "deal_title": installment.deal.title,
            "deal_status": installment.deal.status,
        }
        for installment in installments
    ]})


@cache_control(private=True, no_store=True)
def business_requests(request):
    if request.method not in ("GET", "POST"):
        return error("Только GET или POST", 405)
    if not request.user.is_authenticated:
        return unauthorized()
    business = current_business(request)
    if business is None:
        return error("Нет доступа к кабинету компании", 403)
    if request.method == "GET":
        requests = ProcurementRequest.objects.filter(business=business).order_by("-created_at", "-id")
        return JsonResponse({"items": [procurement_request_json(item) for item in requests]})
    if request.session.get("business_guest") is True:
        return error("Гостевой режим: только просмотр. Войдите, чтобы создавать заявки.", 403)
    try:
        data = body(request)
    except (ValueError, UnicodeDecodeError):
        return error("Некорректные данные запроса")
    try:
        item = services.create_procurement_request(business, data)
    except DomainError as exc:
        return error(str(exc))
    return JsonResponse(procurement_request_json(item), status=201)


@business_get
def business_request_detail(request, business, request_id):
    item = ProcurementRequest.objects.filter(business=business, pk=request_id).first()
    if item is None:
        return error("Заявка не найдена", 404)
    return JsonResponse(procurement_request_json(item))


@csrf_exempt
def register(request):
    if resp := only_post(request):
        return resp
    try:
        data = body(request)
        if not isinstance(data, dict):
            raise ValueError
    except (ValueError, UnicodeDecodeError):
        return error("Некорректные данные запроса")
    name = data.get("name")
    phone = data.get("phone")
    password = data.get("password")
    if not isinstance(name, str) or not name.strip() or len(name.strip()) > 100:
        return error("Введите имя")
    digits = re.sub(r"\D", "", phone) if isinstance(phone, str) else ""
    if not 9 <= len(digits) <= 12 or not digits.isascii():
        return error("Неверный телефон")
    if not isinstance(password, str) or len(password) < 6:
        return error("Пароль от 6 символов")
    try:
        with transaction.atomic():
            if User.objects.filter(username=digits).exists() or Investor.objects.filter(phone=digits).exists():
                return error("Телефон уже зарегистрирован")
            user = User.objects.create_user(username=digits, password=password)
            investor = Investor.objects.create(user=user, name=name.strip(), phone=digits)
    except IntegrityError:
        return error("Телефон уже зарегистрирован")
    login(request, user)
    return JsonResponse(me_json(investor))


@csrf_exempt
def profile(request):
    investor = current_investor(request)
    if investor is None:
        return unauthorized()
    if request.method == "GET":
        return JsonResponse(profile_json(investor))
    if resp := only_post(request):
        return resp
    try:
        data = body(request)
        if not isinstance(data, dict) or set(data) - {
            "onboarded", "strategy", "risk_level", "horizon_days", "monthly_amount", "categories"
        }:
            raise ValueError
        changes = {}
        for key, choices in (("strategy", {"conservative", "balanced", "growth"}),
                             ("risk_level", {"low", "medium", "high"})):
            if key in data:
                value = data[key]
                if value is not None and (not isinstance(value, str) or value not in choices):
                    raise ValueError
                changes[key] = value or ""
        if "onboarded" in data:
            if type(data["onboarded"]) is not bool:
                raise ValueError
            changes["onboarded"] = data["onboarded"]
        if "horizon_days" in data:
            value = data["horizon_days"]
            if value is not None and (type(value) is not int or not 0 <= value <= 32767):
                raise ValueError
            changes["horizon_days"] = value
        if "monthly_amount" in data:
            value = data["monthly_amount"]
            if value is not None:
                if isinstance(value, bool):
                    raise ValueError
                value = Decimal(str(value))
                if not value.is_finite() or value < 0 or value >= Decimal("10000000000000000") or value.as_tuple().exponent < -2:
                    raise ValueError
            changes["monthly_amount"] = value
        if "categories" in data:
            value = data["categories"]
            if not isinstance(value, list) or any(not isinstance(c, str) or c not in dict(Deal.CATEGORY) for c in value):
                raise ValueError
            changes["categories"] = value
    except (ValueError, TypeError, InvalidOperation, UnicodeDecodeError):
        return error("Неверные данные")
    for key, value in changes.items():
        setattr(investor, key, value)
    if changes:
        investor.save(update_fields=list(changes))
    return JsonResponse(profile_json(investor))


@csrf_exempt
def ai_chat(request):
    if resp := only_post(request):
        return resp
    try:
        data = body(request)
        messages = data.get("messages") if isinstance(data, dict) else None
        context = data.get("context", {}) if isinstance(data, dict) else {}
        if not isinstance(messages, list) or not messages or not isinstance(context, dict):
            raise ValueError
        messages = messages[-20:]
        if any(not isinstance(m, dict) or m.get("role") not in ("user", "assistant")
               or not isinstance(m.get("content"), str) or not m["content"].strip() for m in messages):
            raise ValueError
        if messages[-1]["role"] != "user":
            raise ValueError
    except (ValueError, UnicodeDecodeError):
        return error("Пустое сообщение")
    try:
        return JsonResponse(ai.chat(messages, context, current_investor(request)))
    except ai.AiUnavailable:
        return error("ИИ сейчас недоступен", 503)


def ai_insights(request):
    if request.method != "GET":
        return error("Только GET", 405)
    investor = current_investor(request)
    if investor is None:
        return unauthorized()
    return JsonResponse({"items": ai.insights(investor)})


def ai_deal(request, deal_id):
    if request.method != "GET":
        return error("Только GET", 405)
    deal = Deal.objects.select_related("business").filter(pk=deal_id).first()
    if deal is None:
        return error("Сделка не найдена", 404)
    investor = current_investor(request)
    return JsonResponse(ai.cached_deal_opinion(deal, investor))


@csrf_exempt
def login_view(request):
    if resp := only_post(request):
        return resp
    data = body(request)
    digits = re.sub(r"\D", "", str(data.get("phone", "")))
    user = authenticate(request, username=digits, password=data.get("password", ""))
    if user is None or not Investor.objects.filter(user=user).exists():
        return error("Неверный телефон или пароль")
    login(request, user)
    return JsonResponse(me_json(user.investor))


@csrf_exempt
def logout_view(request):
    if resp := only_post(request):
        return resp
    logout(request)
    return JsonResponse({"status": "ok"})


def me(request):
    investor = current_investor(request)
    return JsonResponse(me_json(investor)) if investor else unauthorized()


def stats(request):
    funded = Deal.objects.filter(status__in=["active", "completed"])
    paid = Installment.objects.filter(paid_at__isnull=False)
    on_time = sum(1 for i in paid if i.due_date and i.paid_at <= i.due_date)
    return JsonResponse({
        "tons_financed": funded.aggregate(s=Sum("quantity"))["s"] or 0,
        "deals_count": Deal.objects.count(),
        "businesses_count": Business.objects.filter(deals__isnull=False).distinct().count(),
        "regions_count": Business.objects.filter(deals__isnull=False).values("region").distinct().count(),
        "investors_count": Investor.objects.filter(investments__isnull=False).distinct().count(),
        "on_time_pct": round(on_time * 100 / paid.count()) if paid.count() else 100,
    })


def pools(request):
    grouped = {key: [] for key in POOL_INFO}
    for deal in Deal.objects.all():
        if deal.category in grouped:
            grouped[deal.category].append(deal)
    result = []
    for key, (title, subtitle) in POOL_INFO.items():
        deals = grouped[key]
        if not deals:
            continue
        collecting = [deal for deal in deals if deal.status == "collecting"]
        histories = []
        for deal in deals:
            prices = [Decimal(str(point[1])) for point in deal.price_history[-12:]]
            if prices and prices[0]:
                histories.append([price * 100 / prices[0] for price in prices])
        length = max((len(history) for history in histories), default=0)
        sparkline = []
        for index in range(-length, 0):
            values = [history[index] for history in histories if len(history) >= -index]
            sparkline.append(round(sum(values) / len(values)))
        result.append({
            "key": key, "title": title, "subtitle": subtitle,
            "deals_count": len(deals), "collecting_count": len(collecting),
            "rate_max": max(deal.investor_rate for deal in deals),
            "target_total": sum((deal.investors_amount for deal in collecting), Decimal("0.00")),
            "collected_total": sum((deal.collected_amount for deal in collecting), Decimal("0.00")),
            "sparkline": sparkline,
        })
    return JsonResponse({"items": result})


def deal_list(request):
    investor = current_investor(request)
    deals = Deal.objects.select_related("business").prefetch_related("items", "installments")
    query = " ".join(request.GET.get("q", "").split())
    if query:
        deals = search_deals(deals, query)

    status = request.GET.get("status")
    if status:
        if status == "open":
            status = "collecting"
        if status == "closed":
            deals = deals.filter(status__in=["active", "completed"])
        else:
            deals = deals.filter(status=status)

    categories = [
        category.strip()
        for value in request.GET.getlist("category")
        for category in value.split(",")
        if category.strip()
    ]
    if categories:
        deals = deals.filter(category__in=categories)

    try:
        for parameter, field in (
            ("min_rate", "investor_rate__gte"),
            ("max_min_investment", "min_investment__lte"),
        ):
            value = request.GET.get(parameter)
            if value is not None:
                number = Decimal(value)
                if not number.is_finite():
                    raise ValueError
                deals = deals.filter(**{field: number})
        value = request.GET.get("max_days_left")
        if value is not None:
            deadline = date.today() + timedelta(days=int(value))
            deals = deals.filter(collect_deadline__lte=deadline)
    except (InvalidOperation, ValueError, OverflowError):
        return error("Неверный фильтр")

    sort = request.GET.get("sort") or ("relevance" if query else None)
    if sort == "relevance" and query:
        deals = deals.order_by("-rank", "id")
    elif sort == "rate":
        deals = deals.order_by("-investor_rate", "id")
    elif sort == "collected":
        percentage = Floor(
            F("collected_amount") * Value(100, output_field=DecimalField())
            / NullIf(F("investors_amount"), Value(0))
        )
        deals = deals.annotate(sort_collected_pct=Least(percentage, Value(100, output_field=DecimalField())))
        deals = deals.order_by(F("sort_collected_pct").desc(nulls_last=True), "id")
    elif sort == "deadline":
        deals = deals.order_by(F("collect_deadline").asc(nulls_last=True), "id")
    elif sort == "new":
        deals = deals.order_by("-created_at", "id")
    elif sort == "amount":
        deals = deals.order_by("-investors_amount", "id")
    else:
        deals = deals.order_by(
            Case(
                When(status="collecting", then=0),
                When(status="active", then=1),
                When(status="completed", then=2),
                default=3,
                output_field=IntegerField(),
            ),
            "id",
        )
    items = [deal_summary(deal, investor) for deal in deals]
    return JsonResponse({"items": items, "count": len(items)})


def get_deal(deal_id):
    return Deal.objects.select_related("business").filter(pk=deal_id).first()


def deal_detail_view(request, deal_id):
    d = get_deal(deal_id)
    if d is None:
        return error("Сделка не найдена", 404)
    return JsonResponse(deal_detail(d, current_investor(request)))


@csrf_exempt
def deal_invest(request, deal_id):
    if resp := only_post(request):
        return resp
    investor = current_investor(request)
    if investor is None:
        return unauthorized()
    d = get_deal(deal_id)
    if d is None:
        return error("Сделка не найдена", 404)
    try:
        services.invest(investor, d, parse_amount(request))
    except DomainError as e:
        return error(str(e))
    return JsonResponse(deal_detail(get_deal(deal_id), investor))


def installment_pay(request, deal_id, number):
    if resp := only_post(request):
        return resp
    if not request.user.is_authenticated:
        return unauthorized()
    if not request.user.is_active or not request.user.is_staff or not request.user.has_perm("api.change_installment"):
        return error("Нет доступа к подтверждению платежей", 403)
    inst = Installment.objects.select_related("deal").filter(deal_id=deal_id, number=number).first()
    if inst is None:
        return error("Платёж не найден", 404)
    try:
        inst = services.pay_installment(inst)
    except DomainError as e:
        return error(str(e))
    return JsonResponse(installment_json(inst))


def portfolio(request):
    investor = current_investor(request)
    if investor is None:
        return unauthorized()
    invs = sorted(investor.investments.select_related("deal__business"),
                  key=lambda i: (PORTFOLIO_ORDER[i.deal.status], i.deal.id))
    items = [deal_summary(i.deal, investor) | services.personal_schedule(i.deal, i) for i in invs]
    return JsonResponse({"items": items})


def operations(request):
    investor = current_investor(request)
    if investor is None:
        return unauthorized()
    ops = investor.operations.select_related("deal")
    return JsonResponse({"items": [{
        "id": o.id, "kind": o.kind, "amount": o.amount, "deal_id": o.deal_id,
        "deal_title": o.deal.title if o.deal else None, "created_at": o.created_at,
    } for o in ops]})


@csrf_exempt
def topup_view(request):
    if resp := only_post(request):
        return resp
    investor = current_investor(request)
    if investor is None:
        return unauthorized()
    try:
        services.topup(investor, parse_amount(request))
    except DomainError as e:
        return error(str(e))
    return JsonResponse(me_json(investor))
