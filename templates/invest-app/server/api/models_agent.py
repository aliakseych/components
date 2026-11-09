from django.db import models
from django.utils import timezone

from .models import Investor, Deal, Money


class AgentToken(models.Model):
    investor = models.ForeignKey(Investor, on_delete=models.CASCADE, related_name="agent_tokens", verbose_name="инвестор")
    name = models.CharField("название", max_length=60)
    token_hash = models.CharField("хеш токена", max_length=64, unique=True)
    prefix = models.CharField("префикс", max_length=12)
    created_at = models.DateTimeField("создан", default=timezone.now)
    last_used_at = models.DateTimeField("последнее использование", null=True, blank=True)
    revoked_at = models.DateTimeField("отозван", null=True, blank=True)

    class Meta:
        verbose_name = "токен агента"
        verbose_name_plural = "токены агентов"
        ordering = ["-created_at", "-id"]

    def __str__(self):
        return self.name


class AgentAction(models.Model):
    KIND = [("invest", "Вложение"), ("topup", "Пополнение")]
    STATUS = [("pending", "Ожидает"), ("executed", "Выполнено"), ("rejected", "Отклонено"), ("failed", "Ошибка")]

    investor = models.ForeignKey(Investor, on_delete=models.CASCADE, related_name="agent_actions", verbose_name="инвестор")
    token = models.ForeignKey(AgentToken, on_delete=models.SET_NULL, null=True, blank=True, related_name="actions", verbose_name="токен")
    source = models.CharField("источник", max_length=60)
    kind = models.CharField("тип", max_length=10, choices=KIND)
    deal = models.ForeignKey(Deal, on_delete=models.SET_NULL, null=True, blank=True, related_name="agent_actions", verbose_name="сделка")
    amount = Money("сумма")
    title = models.CharField("название", max_length=140)
    reason = models.TextField("обоснование")
    status = models.CharField("статус", max_length=10, choices=STATUS, default="pending")
    result = models.TextField("результат", blank=True)
    created_at = models.DateTimeField("создано", default=timezone.now)
    executed_at = models.DateTimeField("выполнено", null=True, blank=True)

    class Meta:
        verbose_name = "действие агента"
        verbose_name_plural = "действия агентов"
        ordering = ["-created_at", "-id"]

    def __str__(self):
        return self.title


def action_json(action):
    return {
        "id": action.pk, "source": action.source, "kind": action.kind,
        "deal_id": action.deal_id, "deal_title": action.deal.title if action.deal_id else None,
        "amount": action.amount, "title": action.title, "reason": action.reason,
        "status": action.status, "result": action.result, "created_at": action.created_at,
        "executed_at": action.executed_at,
    }
