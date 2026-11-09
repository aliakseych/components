from django.contrib import admin

from .models_agent import AgentAction, AgentToken


@admin.register(AgentToken)
class AgentTokenAdmin(admin.ModelAdmin):
    list_display = ("name", "investor", "prefix", "created_at", "last_used_at", "revoked_at")
    readonly_fields = ("token_hash", "prefix", "created_at", "last_used_at")
    search_fields = ("name", "investor__name")

    def has_add_permission(self, request):
        return False


@admin.register(AgentAction)
class AgentActionAdmin(admin.ModelAdmin):
    list_display = ("title", "investor", "source", "kind", "amount", "status", "created_at")
    list_filter = ("kind", "status", "source")
    search_fields = ("title", "investor__name")
    readonly_fields = tuple(field.name for field in AgentAction._meta.fields)

    def has_add_permission(self, request):
        return False
