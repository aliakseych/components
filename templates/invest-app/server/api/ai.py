import logging
import hashlib
import json
import os
import math
import re
import time
from datetime import date
from decimal import Decimal
from urllib.error import URLError
from urllib.request import Request, urlopen

from django.core.serializers.json import DjangoJSONEncoder
from django.conf import settings
from django.core.cache import cache

from . import services
from .models import Business, Deal
from .models_agent import action_json

log = logging.getLogger("api.ai")

class AiUnavailable(Exception):
    pass


SYSTEM = (
    f'Ты «ИИ-помощник {settings.APP_NAME}». Объясняй человеку без финансовых знаний, '
    'короткими предложениями. Ответ — 2–3 коротких абзаца по 1–2 предложения, разделённых пустой строкой, или вводная фраза и список. Не пиши сплошным абзацем. Отвечай на языке пользователя '
    '(русский или узбекский), используй числа из данных. Не пиши фраз вроде «доход не гарантирован» '
    'и «не гарантирует доход»: не обещай доход, но и не добавляй таких оговорок. '
    'Упоминай, что это не банковский вклад, только когда уместно. Не выдумывай сделки: '
    'используй только предоставленные данные. Слитно: «5млн», «19,97%», «60т»; '
    'через пробел слова: «60 дней», «1 000 000 сум». Вместо «5млн сум» пиши «5млн». '
    'Остатки меньше 1 000 сум считай округлением и не упоминай. '
    'Завершённые сделки упоминай только как «выплачено полностью», без остатков и сумм. '
    f'Отвечай только о платформе {settings.APP_NAME}, сделках, компаниях, деньгах пользователя и '
    'биржевых товарах. На посторонние темы вежливо откажись одной фразой и предложи вопрос '
    'по инвестициям. Никогда не обсуждай наркотики, оружие, обход закона и другую '
    'незаконную деятельность — только короткий отказ. '
    'Возвращай только JSON по указанной схеме.'
)

def money(value):
    return f"{Decimal(value):,.0f}".replace(",", " ") + " сум"


def pct(value):
    return f"{value:.2f}".replace(".", ",") + "%"


def model_data(value):
    money_keys = {
        "min", "price", "exchange_price", "current_price", "goods_amount", "investors_amount",
        "bank_amount", "down_payment", "business_total", "investors_principal", "investors_income",
        "balance", "invested", "amount", "received", "expected", "outstanding", "monthly_amount",
    }
    if isinstance(value, list):
        return [model_data(item) for item in value]
    if not isinstance(value, dict):
        return value
    if value.get("status") == "completed" and "outstanding" in value:
        return {key: value[key] for key in ("deal_id", "title", "category", "status")} | {
            "settlement": "выплачено полностью",
        }
    result = {}
    for key, item in value.items():
        if key == "price_history":
            result[key] = [[point[0], money(point[1])] for point in item]
        elif key in money_keys and item is not None:
            result[key] = money(item)
        else:
            result[key] = model_data(item)
    return result


def complete(system, messages, *, timeout=60):
    base = os.environ.get("LLM_BASE_URL", "").rstrip("/")
    key = os.environ.get("LLM_API_KEY", "")
    models = [os.environ.get("LLM_MODEL", ""), os.environ.get("LLM_FALLBACK_MODEL", "")]
    if not base or not key or not models[0]:
        raise AiUnavailable()
    url = base if base.endswith("/chat/completions") else base + "/chat/completions"
    # Общий бюджет на обе попытки меньше --timeout gunicorn (90с в Dockerfile),
    # чтобы воркер не убили посреди запасной модели.
    deadline = time.monotonic() + timeout
    for model in dict.fromkeys(m for m in models if m):
        remaining = deadline - time.monotonic()
        if remaining < 5:
            break
        payload = json.dumps({
            "model": model, "messages": [{"role": "system", "content": system}] + messages,
            "response_format": {"type": "json_object"},
        }, ensure_ascii=False).encode("utf-8")
        request = Request(url, data=payload, headers={
            "Content-Type": "application/json", "Authorization": f"Bearer {key}",
            "User-Agent": "invest-app/1.0",
        }, method="POST")
        try:
            with urlopen(request, timeout=min(40, remaining)) as response:
                result = json.load(response)
            content = result["choices"][0]["message"]["content"]
            if not isinstance(content, str) or not content.strip():
                raise ValueError("empty response")
            parsed = parse_reply(content)
            if parsed is not None:
                return parsed
            reply = salvage_reply(content)
            if reply is None:
                raise ValueError(f"unparseable JSON: {content[:300]!r}")  # → запасная модель или «ИИ недоступен»
            return {"reply": reply, "suggestions": [], "deal_ids": []}
        except (URLError, TimeoutError, OSError, ValueError, KeyError, IndexError, TypeError) as error:
            detail = error.read()[:300] if hasattr(error, "read") else ""
            log.warning("LLM %s failed after %.1fs: %r %s", model, timeout - (deadline - time.monotonic()), error, detail)
            continue
    raise AiUnavailable()


def parse_reply(content):
    """JSON-объект из ответа модели: целиком или первый {...} внутри текста."""
    for candidate in (content, content[content.find("{"):content.rfind("}") + 1] if "{" in content else ""):
        try:
            parsed = json.loads(candidate)
        except ValueError:
            continue
        if isinstance(parsed, dict):
            return parsed
    return None


REPLY_FIELD = re.compile(r'"reply"\s*:\s*"((?:[^"\\]|\\.)*)"', re.S)
JSON_TAIL = re.compile(r'"\s*,\s*"(?:suggestions|deal_ids|chart|action)"\s*:.*$', re.S)


def salvage_reply(text):
    """Текст ответа из сломанного JSON. Возвращает None, если целую строку reply достать
    нельзя, — тогда лучше повторить запрос, чем показать человеку обрывки JSON."""
    match = REPLY_FIELD.search(text)
    if match:
        try:
            return json.loads(f'"{match.group(1)}"')
        except ValueError:
            return None
    # Модель иногда теряет начало JSON: «текст ответа","suggestions":[…». Берём текст до хвоста
    # служебных полей и раскодируем его как JSON-строку (\n, \").
    head = JSON_TAIL.split(text, maxsplit=1)[0] if JSON_TAIL.search(text) else text
    if "{" in head or '"reply"' in head:
        return None
    try:
        return json.loads(f'"{head}"').strip() or None
    except ValueError:
        return head.replace("\\n", "\n").strip() or None


def deal_data(deal, full=False):
    data = {
        "id": deal.id, "title": deal.title, "ticker": deal.ticker, "status": deal.status,
        "category": deal.category, "rate": deal.investor_rate, "term_days": deal.term_days,
        "min": deal.min_investment,
        "collected_pct": min(100, round(deal.collected_amount * 100 / deal.investors_amount, 2)) if deal.investors_amount else 0,
        "days_left": (deal.collect_deadline - date.today()).days if deal.collect_deadline else None,
        "business": {"name": deal.business.name, "rating": deal.business.rating},
        "down_payment_pct": deal.down_payment_pct, "loss_threshold_pct": deal.loss_threshold_pct,
        "items": [{"commodity": i.commodity, "quantity": i.quantity, "unit": i.unit,
                   "price": i.price, "warehouse": i.warehouse, "warehouse_region": i.warehouse_region}
                  for i in deal.items.all()],
    }
    if full:
        data.update({
            "commodity": deal.commodity, "request_text": deal.request_text,
            "warehouse": deal.warehouse, "warehouse_region": deal.warehouse_region,
            "quantity": deal.quantity, "unit": deal.unit, "exchange_price": deal.exchange_price,
            "current_price": deal.current_price, "worst_drop_pct": deal.worst_drop_pct,
            "bank_threshold_pct": deal.bank_threshold_pct, "goods_amount": deal.goods_amount,
            "investors_amount": deal.investors_amount, "bank_amount": deal.bank_amount,
            "down_payment": deal.down_payment, "business_total": deal.business_total,
            "price_history": deal.price_history, "agent_checks": deal.agent_checks,
            "installments": [{"day": i.day, "due_date": i.due_date, "paid_at": i.paid_at,
                              "investors_principal": i.investors_principal, "investors_income": i.investors_income}
                             for i in deal.installments.all()],
        })
    return data


def investor_data(investor):
    from .views import me_json

    account = me_json(investor)
    portfolio = []
    for investment in investor.investments.select_related("deal").prefetch_related("deal__installments"):
        schedule = services.personal_schedule(investment.deal, investment)
        portfolio.append({"deal_id": investment.deal_id, "title": investment.deal.title,
                          "category": investment.deal.category, "status": investment.deal.status,
                          "amount": investment.amount, "received": schedule["received_total"],
                          "expected": schedule["expected_total"],
                          "outstanding": max(Decimal(0), investment.amount - schedule["received_total"] + schedule["income_received"])})
    for item in portfolio:
        if item["outstanding"] < 1000:
            item["outstanding"] = Decimal(0)
    payout = account["next_payout"]
    if payout and payout["amount"] < 1000:
        payout = None
    invested = account["invested"] if account["invested"] >= 1000 else Decimal(0)
    return {"balance": account["balance"], "invested": invested,
            "next_payout": payout, "profile": account["profile"], "portfolio": portfolio}


def deal_opinion_cache_key(deal, investor):
    profile = (investor.pk, investor.strategy, investor.risk_level, investor.horizon_days, tuple(investor.categories or ())) if investor else None
    return "ai-deal:" + hashlib.sha1(repr((deal.pk, deal.status, str(deal.collected_amount), profile)).encode()).hexdigest()


def cached_deal_opinion(deal, investor):
    key = deal_opinion_cache_key(deal, investor)
    opinion = cache.get(key)
    if opinion is None:
        opinion = deal_opinion(deal, investor)
        cache.set(key, opinion, 300 if opinion == fallback_deal(deal, investor) else 6 * 3600)
    return opinion


def context_data(investor, deal_id=None, company_id=None, pool=None):
    deals = list(Deal.objects.select_related("business").prefetch_related("items", "installments"))
    selected = next((d for d in deals if d.pk == deal_id), None)
    result = {}
    if selected:
        result["selected_deal"] = deal_data(selected, full=True)
        opinion = cache.get(deal_opinion_cache_key(selected, investor))
        if opinion is not None:
            result["shown_opinion"] = opinion
    if company_id:
        company = Business.objects.filter(pk=company_id).first()
        if company:
            from .views import company_json
            result["selected_company"] = company_json(company)
    if isinstance(pool, str) and pool in dict(Deal.CATEGORY):
        result["selected_pool"] = {"category": pool, "title": dict(Deal.CATEGORY)[pool],
                                   "deals": [deal_data(d) for d in deals if d.category == pool]}
    result["rules"] = "Пул: инвесторы 85%, банк 15%; выплаты каждые 15 дней; залог — товары на складе; банк принимает первые убытки."
    result["deals"] = [deal_data(d) for d in deals]
    if investor:
        result["investor"] = investor_data(investor)
    return result


def dump(value):
    return json.dumps(model_data(value), cls=DjangoJSONEncoder, ensure_ascii=False, separators=(",", ":"))


# Детерминированная типографика: сокращения слитно, слова через пробел.
_UNITS = r"млн\b|млрд\b|тыс\.?|т\b|%"
_TYPO = [
    (re.compile(r"(?<!\d)(\d{4})-(\d{2})-(\d{2})(?!\d)"), r"\3.\2.\1"),                # ISO-дата → ДД.ММ.ГГГГ
    (re.compile(r"(?<![\d.,])(\d+)\.(\d{1,2})(?![\d.])(?=\s*(?:млн|млрд|тыс|%))"), r"\1,\2"),  # 2.35млн → 2,35млн
    (re.compile(rf"(\d)[ \u00a0\u202f]+(?=(?:{_UNITS}))", re.I), r"\1"),               # 5 млн → 5млн
    (re.compile(r"(млн|млрд|тыс\.?)\s*сум\b", re.I), r"\1"),                         # 5млн сум → 5млн
    (re.compile(r"(\d)(?=(?:дней|дня|день|сум)\b|дн\.(?!\w))", re.I), r"\1 "),       # пробел перед словами
    (re.compile(r"(?<=\S) - (?=\S)"), " — "),                                             # дефис → тире
]


def typograph(text):
    lines = []
    for line in text.replace("\r\n", "\n").split("\n"):
        bullet = re.match(r"^(\s*(?:[-*]|\d+\.)\s+)?(.*)$", line)
        head, body = bullet[1] or "", bullet[2]
        for pattern, repl in _TYPO:
            if pattern.pattern == r"(?<=\S) - (?=\S)" and body.lstrip().startswith("|"):
                continue
            body = pattern.sub(repl, body)
        lines.append(head + body)
    text = "\n".join(lines)
    # Оговорки «доход не гарантирован» не показываем: вырезаем такие предложения/части.
    text = re.sub(r"[;,]\s*(?:но\s+|а\s+)?(?:доход|выплаты|ставка|он|она)[^.!\n;]*не\s+гарантир[^.!\n]*[.!]?", ".", text, flags=re.I)
    text = re.sub(r"[^.!\n]*не\s+гарантир[^.!\n]*[.!]?", "", text, flags=re.I)
    text = re.sub(r"\.\s*\.", ".", text)
    return re.sub(r"\n{3,}", "\n\n", text).strip()


MARKDOWN_RULES = (
    'Поле reply — Markdown (GFM), который рендерится в чате на телефоне шириной 360px. '
    'Форма по содержанию: один факт — одно-два предложения без списков. Несколько параллельных '
    'пунктов — маркированный список «- », не больше 5 пунктов. Сравнение 2–5 сделок по 2–3 '
    'параметрам — маленькая таблица GFM с единицей в заголовке столбца («Ставка, %»), главный '
    'вывод — одним предложением над таблицей, не повторяй её числа. Ключевое число или вывод '
    'выделяй **жирным**, не больше двух выделений. Без заголовков #, без кода, без HTML, без '
    'эмодзи, без ссылок. Абзацы и пункты разделяй настоящим переводом строки (\\n в JSON). '
    'Большие суммы округляй до млн с двумя знаками («2,35млн»), даты — ДД.ММ.ГГГГ, дробная '
    'часть через запятую. '
)


def chat(messages, context, investor):
    deal_id = context.get("deal_id")
    if type(deal_id) is not int:
        deal_id = None
    company_id = context.get("company_id")
    if type(company_id) is not int:
        company_id = None
    system = SYSTEM + (
        ' Схема: {"reply":"текст","suggestions":["короткий вопрос"],"deal_ids":[числовой id],'
        '"chart":null или {"type":"bar|line|area|pie","title":"заголовок","unit":"единица",'
        '"data":[{"label":"подпись","value":число}]},'
        '"action":null или {"kind":"invest|topup","deal_id":число или null,'
        '"amount":число в сумах,"title":"название","reason":"причина"},'
        '"calc":null или {"deal_id":число,"amount":число в сумах или null}}. '
        'Calc заполняй, когда спрашивают, сколько можно заработать, какой доход или выплаты с суммы, '
        'или просят посчитать/калькулятор: в чате откроется интерактивный калькулятор этой сделки, '
        'поэтому в тексте дай только итог одной фразой без формул. '
        + MARKDOWN_RULES +
        'Предложи 2–4 вопроса до 40 символов. График до 12 точек добавляй, когда числа '
        'помогают понять выплаты, сравнение или распределение. Action заполняй только если '
        'пользователь явно попросил вложить или пополнить баланс и назвал сумму. '
        'Это только предложение: исполнение возможно лишь после подтверждения человеком.'
    )
    if context.get("mode") == "onboarding":
        system += " Помоги выбрать стратегию. Подбор сделок: вводная фраза, затем список «- **Сделка** — почему подходит», затем одна строка о риске."
    page_context = {key: context[key][:500] for key in ("page",)
                    if isinstance(context.get(key), str)}
    block = context.get("block")
    if isinstance(block, str) and block:
        system += f" Пользователь спросил из блока «{block[:60]}» — отвечай про него."
    filters = context.get("filters")
    if isinstance(filters, str) and filters:
        system += f" Активные фильтры списка: {filters[:120]} — подбирай среди них."
    data = context_data(investor, deal_id, company_id, context.get("pool"))
    if "shown_opinion" in data:
        system += " Не противоречь уже показанному мнению (shown_opinion)."
    system += " Контекст страницы: " + dump(page_context) + ". Данные: " + dump(data)
    result = complete(system, [{"role": m["role"], "content": m["content"]} for m in messages])
    reply = result.get("reply")
    if not isinstance(reply, str) or not reply.strip():
        raise AiUnavailable()
    reply = typograph(JSON_TAIL.sub("", reply.replace("\\n", "\n")))
    suggestions = result.get("suggestions")
    suggestions = [s for s in suggestions if isinstance(s, str) and 0 < len(s) <= 40][:4] if isinstance(suggestions, list) else []
    ids = result.get("deal_ids")
    ids = list(dict.fromkeys(i for i in ids if type(i) is int and i > 0)) if isinstance(ids, list) else []
    valid = set(Deal.objects.filter(id__in=ids).values_list("id", flat=True))
    chart = result.get("chart")
    if not (
        isinstance(chart, dict) and chart.get("type") in ("bar", "line", "area", "pie")
        and isinstance(chart.get("title"), str) and isinstance(chart.get("unit"), str)
        and isinstance(chart.get("data"), list) and 0 < len(chart["data"]) <= 12
        and all(isinstance(point, dict) and isinstance(point.get("label"), str)
                and type(point.get("value")) in (int, float) and math.isfinite(point["value"])
                for point in chart["data"])
    ):
        chart = None
    action = None
    intent = result.get("action")
    last_user = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
    action_words = r"влож|инвестир|пополн|закин|зачисл|invest|top[\s-]*up|deposit|sarmoya|investits|to.ldir"
    if investor and isinstance(intent, dict) and re.search(action_words, last_user, re.IGNORECASE):
        from .agent import create_action
        try:
            action = action_json(create_action(investor, intent, source="ИИ-помощник"))
        except services.DomainError:
            pass
    calc = result.get("calc")
    calc_deal = calc.get("deal_id") if isinstance(calc, dict) else None
    if type(calc_deal) is not int or not Deal.objects.filter(pk=calc_deal).exists():
        calc_deal = deal_id  # на странице сделки калькулятор — по ней
    if not isinstance(calc, dict) or calc_deal is None:
        calc = None
    else:
        amount = calc.get("amount")
        calc = {"deal_id": calc_deal, "amount": int(amount) if isinstance(amount, (int, float)) and 0 < amount < 10**12 else None}
    # «Покажи график выплат»: строим график сами из расписания сделки, не полагаясь на модель.
    schedule_deal = calc["deal_id"] if calc else deal_id
    if schedule_deal and re.search(r"график|выплат|получу", last_user, re.IGNORECASE):
        deal = Deal.objects.filter(pk=schedule_deal).first()
        found = re.search(r"(\d+(?:[.,]\d+)?)\s*млн", last_user)
        amount = (calc or {}).get("amount") or (Decimal(found[1].replace(",", ".")) * 1_000_000 if found else Decimal(10_000_000))
        if deal and deal.investors_amount:
            share = Decimal(amount) / deal.investors_amount
            chart = {"type": "bar", "title": f"Выплаты на {money(amount)}", "unit": "сум", "data": [
                {"label": i.due_date.strftime("%d.%m") if i.due_date else f"{i.day} день",
                 "value": float(round((i.investors_principal + i.investors_income) * share))}
                for i in deal.installments.order_by("number")]}
    return {"reply": reply, "suggestions": suggestions, "deal_ids": [i for i in ids if i in valid],
            "chart": chart, "action": action, "calc": calc}


def fallback_insights(investor, data):
    items = []
    open_deals = list(Deal.objects.filter(status="collecting").select_related("business"))
    matching = [d for d in open_deals if (not investor.categories or d.category in investor.categories)
                and (not investor.horizon_days or d.term_days <= investor.horizon_days)]
    affordable = [d for d in matching if d.min_investment <= investor.balance]
    best = max(affordable, key=lambda d: d.investor_rate, default=None)
    if investor.balance > 1000000:
        text = f"На балансе {money(investor.balance)}."
        if best:
            text += f" Обратите внимание на «{best.title}»: {pct(best.investor_rate)} в год."
        items.append({"title": "Деньги лежат без дела", "text": text, "tone": "info", "deal_id": best.id if best else None})
    payout = data["next_payout"]
    if payout:
        items.append({"title": "Ближайшая выплата", "text": f"{payout['due_date']}: {money(payout['amount'])} по сделке «{payout['deal_title']}».", "tone": "good", "deal_id": payout["deal_id"]})
    totals = {}
    for item in data["portfolio"]:
        if item["status"] != "completed":
            totals[item["category"]] = totals.get(item["category"], Decimal(0)) + item["outstanding"]
    total = sum(totals.values(), Decimal(0))
    if total:
        category, amount = max(totals.items(), key=lambda pair: pair[1])
        percent = amount * 100 / total
        if percent > 70:
            items.append({"title": "Много вложено в одну категорию", "text": f"{pct(percent)} портфеля — {dict(Deal.CATEGORY).get(category, category)}. Распределение по категориям снижает концентрацию риска.", "tone": "warn", "deal_id": None})
    if len(items) < 2 and best:
        items.append({"title": "Подходящая сделка", "text": f"«{best.title}»: от {money(best.min_investment)}, ставка {pct(best.investor_rate)} в год, срок {best.term_days} дней.", "tone": "info", "deal_id": best.id})
    if len(items) < 2:
        items.append({"title": "Ваш баланс", "text": f"На балансе {money(investor.balance)}; в сделках {money(data['invested'])}.", "tone": "info", "deal_id": None})
    if len(items) < 2:
        items.append({"title": "Профиль инвестора", "text": f"В портфеле сделок: {len(data['portfolio'])}. Настройте профиль, чтобы подобрать подходящие предложения.", "tone": "info", "deal_id": None})
    return items[:4]


def insights(investor):
    data = investor_data(investor)
    try:
        result = complete(SYSTEM + ' Схема: {"items":[{"title":"заголовок","text":"текст с конкретными числами","tone":"good|info|warn","deal_id":число или null}]}. Дай 2–4 наблюдения о портфеле, выплатах, балансе и подходящих сделках. Данные: ' + dump(context_data(investor)), [{"role": "user", "content": "Проанализируй мой портфель."}])
        items = result.get("items")
        valid_ids = set(Deal.objects.values_list("id", flat=True))
        if isinstance(items, list) and 2 <= len(items) <= 4 and all(
            isinstance(i, dict) and isinstance(i.get("title"), str) and i["title"].strip()
            and isinstance(i.get("text"), str) and i["text"].strip() and i.get("tone") in ("good", "info", "warn")
            and (i.get("deal_id") is None or type(i["deal_id"]) is int and i["deal_id"] in valid_ids) for i in items
        ):
            return [{k: i.get(k) for k in ("title", "text", "tone", "deal_id")} for i in items]
    except AiUnavailable:
        pass
    return fallback_insights(investor, data)


def fallback_deal(deal, investor):
    change = (deal.current_price / deal.exchange_price - 1) * 100 if deal.exchange_price else Decimal(0)
    margin = deal.loss_threshold_pct + change
    pros = [f"Аванс бизнеса — {pct(deal.down_payment_pct)}", f"Запас до порога убытков — {pct(margin)}"]
    if deal.business.rating == "A":
        pros.insert(0, "Рейтинг бизнеса — A")
    risks = [f"Историческое падение — {pct(deal.worst_drop_pct)}", "Цена товара может снизиться"]
    if deal.collect_deadline:
        risks.append(f"До конца сбора — {(deal.collect_deadline - date.today()).days} дн.")
    fit = fit_text = None
    if investor and (investor.categories or investor.horizon_days):
        matches_category = not investor.categories or deal.category in investor.categories
        matches_horizon = not investor.horizon_days or deal.term_days <= investor.horizon_days
        fit = "good" if matches_category and matches_horizon else "ok" if matches_category or matches_horizon else "poor"
        fit_text = "Указанные предпочтения по категории и сроку совпадают." if fit == "good" else "Проверьте категорию и срок относительно вашего профиля."
    return {"summary": f"«{deal.title}»: ставка {pct(deal.investor_rate)} в год, срок {deal.term_days} дней.",
            "pros": pros[:3], "risks": risks[:3], "fit": fit, "fit_text": fit_text}


def deal_opinion(deal, investor):
    try:
        result = complete(SYSTEM + ' Схема: {"summary":"1–2 предложения", "pros":["до 60 символов"], "risks":["до 60 символов"], "fit":"good|ok|poor" или null, "fit_text":"объяснение" или null}. Дай 2–3 плюса и 2–3 риска на основе чисел; fit сравни с профилем, без профиля null. Данные: ' + dump(context_data(investor, deal.id)), [{"role": "user", "content": "Оцени эту сделку."}])
        lists_valid = all(isinstance(result.get(k), list) and 2 <= len(result[k]) <= 3 and all(isinstance(s, str) and 0 < len(s) <= 60 for s in result[k]) for k in ("pros", "risks"))
        if (isinstance(result.get("summary"), str) and result["summary"].strip() and lists_valid
                and result.get("fit") in (None, "good", "ok", "poor")
                and (result.get("fit_text") is None or isinstance(result["fit_text"], str))):
            if not investor:
                result["fit"] = result["fit_text"] = None
            result["summary"] = typograph(result["summary"]) or fallback_deal(deal, investor)["summary"]
            result["risks"] = [r for r in result["risks"] if "гарантир" not in r.lower()]
            return {k: result.get(k) for k in ("summary", "pros", "risks", "fit", "fit_text")}
    except AiUnavailable:
        pass
    return fallback_deal(deal, investor)
