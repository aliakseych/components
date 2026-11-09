from datetime import date
from decimal import Decimal
from functools import partial

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import models, router, transaction
from django.db.models import Sum
from django.utils import timezone

Money = partial(models.DecimalField, max_digits=18, decimal_places=2)
Qty = partial(models.DecimalField, max_digits=10, decimal_places=2)
Pct = partial(models.DecimalField, max_digits=5, decimal_places=2)


class Investor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="investor")
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, unique=True)
    balance = Money(default=0)
    onboarded = models.BooleanField(default=False)
    strategy = models.CharField(max_length=20, blank=True, default="", choices=[
        ("conservative", "Консервативная"), ("balanced", "Сбалансированная"), ("growth", "Рост"),
    ])
    risk_level = models.CharField(max_length=10, blank=True, default="", choices=[
        ("low", "Низкий"), ("medium", "Средний"), ("high", "Высокий"),
    ])
    horizon_days = models.PositiveSmallIntegerField(null=True, blank=True)
    monthly_amount = Money(null=True, blank=True)
    categories = models.JSONField(default=list, blank=True)

    class Meta:
        verbose_name = "инвестор"
        verbose_name_plural = "инвесторы"

    def __str__(self):
        return f"{self.name} ({self.phone})"


class Business(models.Model):
    user = models.OneToOneField(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="business_profile")
    name = models.CharField(max_length=200)
    kind = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    rating = models.CharField(max_length=1, choices=[("A", "A"), ("B", "B"), ("C", "C")])
    uzex_since = models.PositiveSmallIntegerField()
    uzex_deals = models.PositiveIntegerField()
    uzex_paid_pct = Pct()
    repayment_source = models.TextField()
    legal_name = models.CharField(max_length=250, blank=True)
    legal_form = models.CharField(max_length=50, default="ООО", blank=True)
    inn = models.CharField(max_length=9, blank=True)
    orginfo_id = models.CharField(max_length=32, blank=True, default="")
    orginfo_checked_at = models.DateTimeField(null=True, blank=True)
    director = models.CharField(max_length=200, blank=True)
    registered_at = models.DateField(null=True, blank=True)
    charter_capital = Money(null=True, blank=True)
    employees = models.PositiveIntegerField(null=True, blank=True)
    activity = models.CharField(max_length=250, blank=True)
    address = models.CharField(max_length=300, blank=True)
    founders = models.JSONField(default=list, blank=True)
    halal = models.BooleanField(default=True)
    halal_note = models.TextField(blank=True)
    tax_debt = models.BooleanField(default=False)
    court_cases = models.PositiveSmallIntegerField(default=0)
    pledged_assets = models.BooleanField(default=False)

    class Meta:
        verbose_name = "бизнес"
        verbose_name_plural = "бизнесы"

    def __str__(self):
        return self.name


class Deal(models.Model):
    STATUS = [("collecting", "Сбор"), ("active", "Выкуп"), ("completed", "Завершена")]
    CATEGORY = [("fuel", "Топливо"), ("agro", "Агро"), ("food", "Продукты"), ("construction", "Стройка")]

    business = models.ForeignKey(Business, on_delete=models.PROTECT, related_name="deals")
    title = models.CharField(max_length=200)
    ticker = models.CharField(max_length=12, default="", blank=True)
    request_text = models.TextField()
    commodity = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY)
    quantity = Qty()
    unit = models.CharField(max_length=10, default="т")
    warehouse = models.CharField(max_length=200)
    warehouse_region = models.CharField(max_length=100)
    exchange_price = Money()
    goods_amount = Money()
    exchange_fee = Money()
    down_payment_pct = Pct()
    down_payment = Money()
    investors_amount = Money()
    bank_amount = Money()
    markup = Money()
    business_total = Money()
    investor_rate = Pct()
    business_rate = Pct()
    term_days = models.PositiveSmallIntegerField(default=60)
    min_investment = Money(default=1_000_000)
    loss_threshold_pct = Pct()
    bank_threshold_pct = Pct()
    worst_drop_pct = Pct()
    current_price = Money()
    price_history = models.JSONField(default=list)
    agent_checks = models.JSONField(default=list)
    status = models.CharField(max_length=20, choices=STATUS, default="collecting")
    collected_amount = Money(default=0)
    collect_deadline = models.DateField(null=True, blank=True)
    started_at = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "сделка"
        verbose_name_plural = "сделки"

    def __str__(self):
        return self.title


class ProcurementRequest(models.Model):
    STATUS = [
        ("submitted", "Отправлена"),
        ("reviewing", "На рассмотрении"),
        ("linked", "Связана со сделкой"),
        ("rejected", "Отклонена"),
    ]

    business = models.ForeignKey(
        Business, verbose_name="компания", on_delete=models.PROTECT, related_name="procurement_requests"
    )
    commodity = models.CharField("товар", max_length=200)
    category = models.CharField("категория", max_length=20, choices=Deal.CATEGORY)
    quantity = Qty(verbose_name="объём")
    unit = models.CharField("единица измерения", max_length=10, default="т")
    region = models.CharField("регион", max_length=100)
    request_text = models.TextField("описание потребности")
    delivery_address = models.CharField("адрес доставки", max_length=500, blank=True, default="")
    desired_delivery_date = models.DateField("желаемая дата доставки", null=True, blank=True)
    delivery_terms = models.TextField("условия доставки", max_length=1000, blank=True, default="")
    status = models.CharField("статус", max_length=20, choices=STATUS, default="submitted")
    review_note = models.TextField("комментарий оператора", blank=True, default="")
    deal = models.OneToOneField(
        Deal,
        verbose_name="сделка",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="procurement_request",
        help_text=(
            "Связывайте заявку с уже подготовленной оператором сделкой. "
            "Создание заявки само по себе не публикует её инвесторам."
        ),
    )
    created_at = models.DateTimeField("дата подачи", default=timezone.now)
    updated_at = models.DateTimeField("дата обновления", auto_now=True)

    class Meta:
        verbose_name = "заявка на закупку"
        verbose_name_plural = "заявки на закупку"
        ordering = ["-created_at", "-id"]

    def clean(self):
        super().clean()
        errors = {}
        if self.status == "linked":
            if self.deal_id is None:
                errors["deal"] = "Для связанной заявки выберите сделку."
            else:
                try:
                    deal = self.deal
                except Deal.DoesNotExist:
                    pass  # Отсутствующую сделку проверяет поле deal.
                else:
                    if deal.business_id != self.business_id:
                        errors["deal"] = "Можно связать только сделку той же компании."
        elif self.deal_id is not None:
            errors["deal"] = "Сделку можно указать только для связанной заявки."
        if self.status == "rejected" and not (self.review_note or "").strip():
            errors["review_note"] = "Укажите причину отклонения заявки."
        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f"Заявка {self.pk} — {self.commodity}"


class DealItem(models.Model):
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name="items")
    position = models.PositiveSmallIntegerField()
    commodity = models.CharField(max_length=200)
    quantity = Qty()
    unit = models.CharField(max_length=10, default="т")
    price = Money()
    warehouse = models.CharField(max_length=200)
    warehouse_region = models.CharField(max_length=100)

    class Meta:
        verbose_name = "товар сделки"
        verbose_name_plural = "товары сделки"
        ordering = ["deal", "position"]

    def __str__(self):
        return f"{self.deal} — {self.commodity}"


class Shipment(models.Model):
    STATUS = [
        ("planned", "Запланирована"),
        ("dispatched", "Отправлена"),
        ("delivered", "Доставлена"),
    ]

    item = models.ForeignKey(
        DealItem, verbose_name="товар сделки", on_delete=models.PROTECT, related_name="shipments"
    )
    quantity = Qty(verbose_name="количество")
    status = models.CharField("статус", max_length=20, choices=STATUS, default="planned")
    planned_date = models.DateField("плановая дата", null=True, blank=True)
    dispatched_at = models.DateField("дата отправки", null=True, blank=True)
    delivered_at = models.DateField("дата доставки", null=True, blank=True)
    destination = models.TextField("адрес назначения", max_length=500, blank=True, default="")
    reference = models.CharField("номер документа", max_length=100, blank=True, default="")
    created_at = models.DateTimeField("дата записи", default=timezone.now)

    class Meta:
        verbose_name = "отгрузка"
        verbose_name_plural = "отгрузки"
        ordering = ["created_at", "id"]

    def clean(self):
        super().clean()
        errors = {}
        quantity_valid = isinstance(self.quantity, Decimal) and self.quantity.is_finite()
        if quantity_valid and self.quantity <= 0:
            errors["quantity"] = "Количество должно быть больше нуля."
        elif quantity_valid and isinstance(self.item_id, int):
            try:
                item = self.item
            except DealItem.DoesNotExist:
                pass  # Отсутствующий товар проверяет поле item.
            else:
                other_quantity = (
                    Shipment.objects.filter(item_id=self.item_id)
                    .exclude(pk=self.pk)
                    .aggregate(total=Sum("quantity"))["total"]
                    or Decimal("0")
                )
                if self.quantity + other_quantity > item.quantity:
                    errors["quantity"] = "Общее количество отгрузок превышает количество товара."

        if self.status == "dispatched" and self.dispatched_at is None:
            errors["dispatched_at"] = "Укажите дату отправки."
        if self.status == "delivered" and self.delivered_at is None:
            errors["delivered_at"] = "Укажите дату доставки."
        if type(self.dispatched_at) is date and type(self.delivered_at) is date:
            if self.delivered_at < self.dispatched_at:
                errors["delivered_at"] = "Дата доставки не может быть раньше даты отправки."
        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        using = kwargs.get("using") or router.db_for_write(type(self), instance=self)
        try:
            item_id = DealItem._meta.pk.to_python(self.item_id)
        except (ValidationError, TypeError, ValueError):
            item_id = None
        with transaction.atomic(using=using):
            # Serialize competing shipment writes for the same item before revalidating the total.
            if item_id is not None:
                item = DealItem.objects.using(using).select_for_update().filter(pk=item_id).first()
                if item is not None:
                    self.item = item
            self.full_clean()
            return super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.item} — {self.quantity} ({self.get_status_display()})"


class Installment(models.Model):
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name="installments")
    number = models.PositiveSmallIntegerField()
    day = models.PositiveSmallIntegerField()
    due_date = models.DateField(null=True, blank=True)
    business_payment = Money()
    quantity_released = Qty()
    investors_principal = Money()
    investors_income = Money()
    bank_payout = Money()
    paid_at = models.DateField(null=True, blank=True)

    class Meta:
        verbose_name = "платёж"
        verbose_name_plural = "платежи"
        unique_together = [("deal", "number")]
        ordering = ["deal", "number"]

    def __str__(self):
        return f"{self.deal} — платёж {self.number}"


class Investment(models.Model):
    investor = models.ForeignKey(Investor, on_delete=models.CASCADE, related_name="investments")
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name="investments")
    amount = Money()
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "вложение"
        verbose_name_plural = "вложения"
        unique_together = [("investor", "deal")]

    def __str__(self):
        return f"{self.investor.name} → {self.deal}"


class Operation(models.Model):
    KIND = [("topup", "Пополнение"), ("invest", "Вложение"), ("payout", "Выплата")]
    investor = models.ForeignKey(Investor, on_delete=models.CASCADE, related_name="operations")
    kind = models.CharField(max_length=10, choices=KIND)
    amount = Money()
    deal = models.ForeignKey(Deal, on_delete=models.SET_NULL, null=True, blank=True)
    installment = models.ForeignKey(Installment, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "операция"
        verbose_name_plural = "операции"
        ordering = ["-created_at", "-id"]

    def __str__(self):
        return f"{self.get_kind_display()} {self.amount}"


class BusinessAction(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name="actions")
    kind = models.CharField(max_length=30, choices=[("create_request", "Создание заявки"), ("payment_reminder", "Напоминание о платеже")])
    title = models.CharField(max_length=200)
    payload = models.JSONField()
    status = models.CharField(max_length=20, default="pending", choices=[("pending", "Ожидает"), ("executed", "Подтверждено"), ("rejected", "Отклонено")])
    created_at = models.DateTimeField(default=timezone.now)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        verbose_name = "действие ИИ компании"
        verbose_name_plural = "действия ИИ компаний"

    def __str__(self):
        return self.title


class BusinessAgentToken(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name="agent_tokens")
    name = models.CharField(max_length=60)
    token_hash = models.CharField(max_length=64, unique=True)
    prefix = models.CharField(max_length=12)
    created_at = models.DateTimeField(default=timezone.now)
    last_used_at = models.DateTimeField(null=True, blank=True)
    revoked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        verbose_name = "токен агента компании"
        verbose_name_plural = "токены агентов компаний"

    def __str__(self):
        return self.name


from .models_agent import AgentAction, AgentToken  # noqa: E402,F401 — модели ИИ-агентов в отдельном модуле
