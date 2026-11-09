from django.contrib import admin, messages

from . import services
from .models import Business, BusinessAction, Deal, DealItem, Installment, Investment, Investor, Operation, ProcurementRequest, Shipment


@admin.register(Investor)
class InvestorAdmin(admin.ModelAdmin):
    list_display = ["name", "phone", "balance", "onboarded", "strategy", "risk_level", "horizon_days", "monthly_amount", "categories"]
    search_fields = ["name", "phone"]


@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    list_display = ["name", "inn", "orginfo_id", "kind", "region", "rating", "halal", "user"]
    search_fields = ["name", "legal_name", "inn"]
    list_filter = ["halal", "tax_debt", "pledged_assets"]
    autocomplete_fields = ["user"]

@admin.register(BusinessAction)
class BusinessActionAdmin(admin.ModelAdmin):
    list_display = ["title", "business", "kind", "status", "created_at"]
    list_filter = ["kind", "status"]



class DealItemInline(admin.TabularInline):
    model = DealItem
    extra = 0


class InstallmentInline(admin.TabularInline):
    model = Installment
    extra = 0
    fields = ["number", "day", "due_date", "business_payment", "quantity_released",
              "investors_principal", "investors_income", "bank_payout", "paid_at"]


@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = ["title", "status", "category", "collected_amount", "investors_amount"]
    list_filter = ["status", "category"]
    inlines = [DealItemInline, InstallmentInline]


@admin.register(DealItem)
class DealItemAdmin(admin.ModelAdmin):
    list_display = ["deal", "position", "commodity", "quantity", "unit", "price"]
    search_fields = ["commodity", "deal__title", "deal__business__name"]

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("deal")


@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ["item", "quantity", "status", "planned_date", "dispatched_at", "delivered_at"]
    list_filter = ["status"]
    list_select_related = ["item", "item__deal"]
    search_fields = ["item__commodity", "item__deal__title", "reference"]
    autocomplete_fields = ["item"]
    readonly_fields = ["created_at"]


@admin.register(ProcurementRequest)
class ProcurementRequestAdmin(admin.ModelAdmin):
    list_display = ["id", "business", "commodity", "quantity", "unit", "status", "created_at"]
    list_filter = ["status", "category"]
    list_select_related = ["business"]
    search_fields = ["business__name", "commodity"]
    fields = [
        "business", "commodity", "category", "quantity", "unit", "region", "request_text",
        "delivery_address", "desired_delivery_date", "delivery_terms",
        "created_at", "updated_at", "status", "review_note", "deal",
    ]
    readonly_fields = [
        "business", "commodity", "category", "quantity", "unit", "region", "request_text",
        "delivery_address", "desired_delivery_date", "delivery_terms",
        "created_at", "updated_at",
    ]

    def has_add_permission(self, request):
        return False


@admin.register(Installment)
class InstallmentAdmin(admin.ModelAdmin):
    list_display = ["deal", "number", "due_date", "paid_at"]
    list_filter = ["deal"]
    actions = ["mark_paid"]

    @admin.action(description="Отметить оплаченным и выплатить инвесторам")
    def mark_paid(self, request, queryset):
        for inst in queryset.select_related("deal").order_by("deal", "number"):
            try:
                services.pay_installment(inst)
                self.message_user(request, f"{inst}: оплачен")
            except services.DomainError as e:
                self.message_user(request, f"{inst}: {e}", level=messages.ERROR)


@admin.register(Investment)
class InvestmentAdmin(admin.ModelAdmin):
    list_display = ["investor", "deal", "amount", "created_at"]


@admin.register(Operation)
class OperationAdmin(admin.ModelAdmin):
    list_display = ["investor", "kind", "amount", "deal", "created_at"]
    list_filter = ["kind"]

from . import admin_agent  # noqa: E402,F401 — регистрация моделей ИИ-агентов

from .models import BusinessAgentToken  # noqa: E402


@admin.register(BusinessAgentToken)
class BusinessAgentTokenAdmin(admin.ModelAdmin):
    list_display = ["name", "business", "created_at", "last_used_at", "revoked_at"]
    readonly_fields = ["token_hash", "prefix", "created_at", "last_used_at", "revoked_at"]

    def has_add_permission(self, request):
        return False
