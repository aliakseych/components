from decimal import Decimal

from django.contrib.auth.hashers import check_password
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.db import IntegrityError, transaction
from django.db.models import Q
from django.utils import timezone

from api.models import Business, Investor
from api.views import DEMO_COMPANY_NAME


DEMO_USERNAME = "business_demo"
DEMO_PASSWORD = "DemoBusiness2026!"
DEMO_BUSINESS_FIELDS = {
    "name": DEMO_COMPANY_NAME,
    "kind": "Демонстрационный кабинет",
    "region": "Центральный округ",
    "rating": "B",
    "uzex_deals": 6,
    "uzex_paid_pct": Decimal("92.00"),
    "repayment_source": "Демонстрационный кабинет; финансирование не подтверждено.",
}


class Command(BaseCommand):
    help = "Создать отдельную публичную демо-компанию и её учётную запись."

    def handle(self, *args, **options):
        try:
            with transaction.atomic():
                users = list(
                    User.objects.select_for_update().filter(username__iexact=DEMO_USERNAME)
                )
                if len(users) > 1 or (users and users[0].username != DEMO_USERNAME):
                    raise CommandError("Логин демо-кабинета конфликтует с существующей учётной записью")

                company_filter = Q(name__iexact=DEMO_BUSINESS_FIELDS["name"])
                if users:
                    company_filter |= Q(user_id=users[0].pk)
                companies = list(Business.objects.select_for_update().filter(company_filter))

                if users:
                    user = users[0]
                    if (
                        len(companies) != 1
                        or companies[0].user_id != user.pk
                        or any(
                            getattr(companies[0], field) != value
                            for field, value in DEMO_BUSINESS_FIELDS.items()
                        )
                        # Preserve the original creation year across New Year's Day.
                        or companies[0].uzex_since != timezone.localdate(user.date_joined).year
                        or companies[0].uzex_since > timezone.localdate().year
                        or not user.is_active
                        or user.is_staff
                        or user.is_superuser
                        or user.first_name
                        or user.last_name
                        or user.email
                        or user.groups.exists()
                        or user.user_permissions.exists()
                        or Investor.objects.filter(user_id=user.pk).exists()
                    ):
                        raise CommandError("Существующая учётная запись или компания не является изолированным демо")
                    # User.check_password() may transparently rehash and save an existing password.
                    if not check_password(DEMO_PASSWORD, user.password):
                        raise CommandError("Пароль существующей демо-учётной записи не совпадает; пароль не изменён")
                else:
                    if companies:
                        raise CommandError("Компания с именем демо-кабинета уже существует")
                    created_at = timezone.now()
                    user = User(username=DEMO_USERNAME, date_joined=created_at)
                    business = Business(
                        **DEMO_BUSINESS_FIELDS,
                        uzex_since=timezone.localdate(created_at).year,
                    )
                    validate_password(DEMO_PASSWORD, user)
                    user.set_password(DEMO_PASSWORD)
                    user.full_clean()
                    business.full_clean()
                    user.save(force_insert=True)
                    business.user = user
                    business.full_clean()
                    business.save(force_insert=True)
        except ValidationError as exc:
            raise CommandError("; ".join(exc.messages)) from exc
        except IntegrityError as exc:
            raise CommandError("Данные демо-кабинета конфликтуют с существующими записями") from exc

        self.stdout.write(f"{DEMO_USERNAME} — {DEMO_BUSINESS_FIELDS['name']}")
