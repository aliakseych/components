"""Company card links on the public registry orginfo.uz.

resolve_orginfo_id() scrapes the registry search page. It is off by default: set
ORGINFO_LOOKUP=true to enable it. Without it, links point to the registry search by INN.
"""
import re
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.conf import settings


def search_url(inn):
    return f"https://orginfo.uz/ru/search/organizations/?{urlencode({'q': inn})}"


def resolve_orginfo_id(inn):
    if not settings.ORGINFO_LOOKUP:
        return ""
    try:
        request = Request(search_url(inn), headers={"User-Agent": "Mozilla/5.0"})
        with urlopen(request, timeout=4) as response:
            html = response.read().decode("utf-8", errors="replace")
        match = re.search(r"/organization/([0-9a-f]{12})", html)
        return match.group(1) if match else ""
    except Exception:
        return ""


def orginfo_url(business):
    if business.orginfo_id:
        return f"https://orginfo.uz/ru/organization/{business.orginfo_id}/"
    return search_url(business.inn)
