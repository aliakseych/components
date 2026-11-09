from datetime import date, datetime, time, timedelta
from decimal import ROUND_HALF_UP, Decimal
import re

from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import F
from django.utils import timezone

from .models import Deal, DealItem, Installment, Investment, Investor, Operation, ProcurementRequest

Q = Decimal("0.01")
RATIOS = (Decimal("0.2"), Decimal("0.3"), Decimal("0.2"), Decimal("0.3"))
DAYS = (15, 30, 45, 60)
EXCHANGE_FEE_PCT = Decimal("0.0018")
MARKUP_PCT = Decimal("0.0239")
BANK_SHARE = Decimal("0.15")


class DomainError(Exception):
    pass


def validate_procurement_request_data(business, data):
    required = {"commodity", "category", "quantity", "unit", "region", "request_text"}
    optional = {"delivery_address", "desired_delivery_date", "delivery_terms"}
    if not isinstance(data, dict) or not required <= data.keys() or data.keys() - required - optional:
        raise DomainError("Некорректные данные запроса")

    text_fields = {
        "commodity": (1, 200, "Укажите товар: от 1 до 200 символов"),
        "unit": (1, 10, "Укажите единицу измерения: от 1 до 10 символов"),
        "region": (1, 100, "Укажите регион: от 1 до 100 символов"),
        "request_text": (10, 4000, "Опишите потребность: от 10 до 4000 символов"),
        "delivery_address": (0, 500, "Адрес доставки должен содержать не более 500 символов"),
        "delivery_terms": (0, 1000, "Условия доставки должны содержать не более 1000 символов"),
    }
    cleaned = {}
    for field, (minimum, maximum, message) in text_fields.items():
        value = data.get(field, "")
        if not isinstance(value, str):
            raise DomainError(message)
        value = value.strip()
        if not minimum <= len(value) <= maximum or "\x00" in value:
            raise DomainError(message)
        try:
            value.encode("utf-8")
        except UnicodeEncodeError as exc:
            raise DomainError(message) from exc
        cleaned[field] = value

    category = data["category"]
    if not isinstance(category, str) or category.strip() not in dict(Deal.CATEGORY):
        raise DomainError("Выберите категорию товара")
    cleaned["category"] = category.strip()

    quantity = data["quantity"]
    if not isinstance(quantity, str) or not re.fullmatch(r"[0-9]{1,8}(?:\.[0-9]{1,2})?", quantity.strip()):
        raise DomainError("Укажите объём числом до 99999999.99 с не более чем двумя знаками после точки")
    quantity = Decimal(quantity.strip())
    if quantity <= 0:
        raise DomainError("Объём должен быть больше нуля")
    cleaned["quantity"] = quantity

    delivery_date = data.get("desired_delivery_date")
    if delivery_date is not None:
        if not isinstance(delivery_date, str) or not re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", delivery_date.strip()):
            raise DomainError("Укажите дату доставки в формате ГГГГ-ММ-ДД")
        try:
            delivery_date = date.fromisoformat(delivery_date.strip())
        except ValueError as exc:
            raise DomainError("Укажите корректную дату доставки") from exc
        if delivery_date < timezone.localdate():
            raise DomainError("Дата доставки не может быть в прошлом")
    cleaned["desired_delivery_date"] = delivery_date
    return cleaned


def create_procurement_request(business, data):
    cleaned = validate_procurement_request_data(business, data)

    procurement_request = ProcurementRequest(business=business, **cleaned)
    try:
        procurement_request.full_clean()
    except ValidationError as exc:
        raise DomainError("Некорректные данные заявки") from exc
    procurement_request.save(force_insert=True)
    return procurement_request


def q2(x):
    return Decimal(x).quantize(Q, rounding=ROUND_HALF_UP)


def sum_text(x):
    return f"{int(x):,}".replace(",", " ")


def moment(when):
    if when is None:
        return timezone.now()
    return datetime.combine(when, time(12, 0), tzinfo=timezone.get_current_timezone())


def deal_numbers(goods_amount, down_payment_pct):
    goods_amount, dp = q2(goods_amount), Decimal(down_payment_pct)
    exchange_fee = q2(goods_amount * EXCHANGE_FEE_PCT)
    down_payment = q2((goods_amount + exchange_fee) * dp / 100)
    pool = goods_amount + exchange_fee - down_payment
    investors_amount = q2(pool * (1 - BANK_SHARE))
    markup = q2(pool * MARKUP_PCT)
    return {
        "goods_amount": goods_amount,
        "exchange_fee": exchange_fee,
        "down_payment": down_payment,
        "investors_amount": investors_amount,
        "bank_amount": pool - investors_amount,
        "markup": markup,
        "business_total": goods_amount + exchange_fee + markup,
        "bank_threshold_pct": q2(dp - Decimal("0.2")),
        "loss_threshold_pct": q2(dp + 15 * (100 - dp) / 100 - Decimal("0.2")),
    }


def build_installments(deal):
    payable = deal.business_total - deal.down_payment
    outstanding = deal.investors_amount
    paid_to_investors = Decimal(0)
    rows = []
    for i, (ratio, day) in enumerate(zip(RATIOS, DAYS), start=1):
        payment = q2(payable * ratio) if i < 4 else payable - sum(r["business_payment"] for r in rows)
        income = q2(outstanding * deal.investor_rate / 100 * 15 / 365)
        if i < 4:
            principal = min(outstanding, payment - income)
            bank = Decimal(0)
        else:
            principal = outstanding
            bank = payable - paid_to_investors - principal - income
        paid_to_investors += principal + income
        outstanding -= principal
        rows.append({
            "number": i,
            "day": day,
            "due_date": deal.started_at + timedelta(days=day) if deal.started_at else None,
            "business_payment": payment,
            "quantity_released": q2(deal.quantity * ratio),
            "investors_principal": principal,
            "investors_income": income,
            "bank_payout": bank,
        })
    return rows


@transaction.atomic
def create_deal(**fields):
    items = fields.pop("items")
    quantity = sum((Decimal(str(item["quantity"])) for item in items), Decimal(0))
    goods_amount = sum(
        (q2(Decimal(str(item["quantity"])) * Decimal(str(item["price"]))) for item in items),
        Decimal(0),
    )
    first = items[0]
    fields.update(
        quantity=quantity, commodity=first["commodity"], unit=first.get("unit", "т"),
        exchange_price=q2(goods_amount / quantity), warehouse=first["warehouse"],
        warehouse_region=first["warehouse_region"],
    )
    fields |= deal_numbers(goods_amount, fields["down_payment_pct"])
    title = fields.pop("title")
    deal, _ = Deal.objects.update_or_create(title=title, defaults=fields)
    for position, item in enumerate(items, start=1):
        DealItem.objects.update_or_create(deal=deal, position=position, defaults=item)
    deal.items.filter(position__gt=len(items)).delete()
    for row in build_installments(deal):
        number = row.pop("number")
        Installment.objects.update_or_create(deal=deal, number=number, defaults=row)
    return deal


def credit(investor_id, amount):
    Investor.objects.filter(pk=investor_id).update(balance=F("balance") + amount)


@transaction.atomic
def topup(investor, amount, when=None):
    if amount <= 0:
        raise DomainError("Введите сумму")
    credit(investor.pk, amount)
    Operation.objects.create(investor=investor, kind="topup", amount=amount, created_at=moment(when))
    investor.refresh_from_db(fields=["balance"])


@transaction.atomic
def invest(investor, deal, amount, when=None):
    # Порядок блокировок везде один: сделка, потом инвестор.
    deal = Deal.objects.select_for_update().get(pk=deal.pk)
    investor = Investor.objects.select_for_update().get(pk=investor.pk)
    if deal.status != "collecting":
        raise DomainError("Сбор по этой сделке завершён")
    if amount < deal.min_investment:
        raise DomainError(f"Минимальное вложение — {sum_text(deal.min_investment)} сум")
    if amount > investor.balance:
        raise DomainError("Недостаточно средств на счёте")
    remaining = deal.investors_amount - deal.collected_amount
    if amount > remaining:
        raise DomainError(f"Осталось собрать {sum_text(remaining)} сум")
    investor.balance -= amount
    investor.save(update_fields=["balance"])
    investment, _ = Investment.objects.get_or_create(
        investor=investor, deal=deal, defaults={"amount": 0, "created_at": moment(when)}
    )
    investment.amount += amount
    investment.save(update_fields=["amount"])
    deal.collected_amount += amount
    Operation.objects.create(investor=investor, kind="invest", amount=-amount, deal=deal, created_at=moment(when))
    if deal.collected_amount >= deal.investors_amount:
        deal.status = "active"
        deal.started_at = when or date.today()
        for inst in deal.installments.all():
            inst.due_date = deal.started_at + timedelta(days=inst.day)
            inst.save(update_fields=["due_date"])
    deal.save()
    return investment


@transaction.atomic
def pay_installment(installment, when=None):
    deal = Deal.objects.select_for_update().get(pk=installment.deal_id)
    installment = Installment.objects.get(pk=installment.pk)
    if installment.paid_at:
        raise DomainError("Платёж уже оплачен")
    if deal.status != "active":
        raise DomainError("Сделка не в стадии выкупа")
    prev = deal.installments.filter(number=installment.number - 1).first()
    if prev and not prev.paid_at:
        raise DomainError("Сначала предыдущий платёж")
    installment.paid_at = when or date.today()
    installment.save(update_fields=["paid_at"])
    to_investors = installment.investors_principal + installment.investors_income
    for inv in deal.investments.all():
        payout = q2(to_investors * inv.amount / deal.investors_amount)
        credit(inv.investor_id, payout)
        Operation.objects.create(
            investor_id=inv.investor_id, kind="payout", amount=payout, deal=deal,
            installment=installment, created_at=moment(when),
        )
    if not deal.installments.filter(paid_at__isnull=True).exists():
        deal.status = "completed"
        deal.save(update_fields=["status"])
    return installment


def personal_schedule(deal, investment):
    share = investment.amount / deal.investors_amount
    schedule = []
    for i in deal.installments.all():
        schedule.append({
            "number": i.number,
            "day": i.day,
            "due_date": i.due_date,
            "amount": q2((i.investors_principal + i.investors_income) * share),
            "income": q2(i.investors_income * share),
            "paid_at": i.paid_at,
        })
    paid = [r for r in schedule if r["paid_at"]]
    unpaid = [r for r in schedule if not r["paid_at"]]
    return {
        "amount": investment.amount,
        "share_pct": float(round(share * 100, 2)),
        "schedule": schedule,
        "expected_total": investment.amount + sum((r["income"] for r in schedule), Decimal(0)),
        "received_total": sum((r["amount"] for r in paid), Decimal("0.00")),
        "income_expected": sum((r["income"] for r in unpaid), Decimal("0.00")),
        "income_received": sum((r["income"] for r in paid), Decimal("0.00")),
        "next_payout": {"due_date": unpaid[0]["due_date"], "amount": unpaid[0]["amount"]} if unpaid else None,
    }
