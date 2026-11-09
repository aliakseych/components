from datetime import timedelta

from django.http import JsonResponse
from django.utils import timezone

from .orginfo import resolve_orginfo_id
from .views import business_get, company_json


@business_get
def company(request, business):
    now = timezone.now()
    if (business.inn and not business.orginfo_id and
            (business.orginfo_checked_at is None or business.orginfo_checked_at < now - timedelta(days=7))):
        business.orginfo_id = resolve_orginfo_id(business.inn)
        business.orginfo_checked_at = now
        business.save(update_fields=["orginfo_id", "orginfo_checked_at"])
    return JsonResponse(company_json(business))
