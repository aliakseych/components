"""Fictional demo data (idempotent). Mirrors src/sample/data.ts so the app looks the same on the
mock API and on this server. Companies, people and INNs are invented."""
import math
from datetime import date, timedelta
from decimal import Decimal

from django.conf import settings
from django.contrib.auth.models import User
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import transaction

from api import services
from api.models import Business, Deal, Installment, Investment, Investor, Operation, ProcurementRequest, Shipment
from api.services import DAYS, q2

DEMO_PHONE = "998901234567"
YEAR = date.today().year

# name, kind, region, rating, years on exchange, deals, paid on time %, repayment source
BUSINESSES = [
    ("Северный агро", "агропереработчик", "Северная область", "A", 5, 140, "98.80",
     "Продажи масла и шрота: выписки банка за 6 месяцев"),
    ("Вектор Топливо", "сеть АЗС", "Приозёрная область", "A", 4, 118, "98.40",
     "Розничная выручка 14 АЗС: выписки банка за 6 месяцев"),
    ("Пекарня Рассвет", "хлебокомбинат", "Южная область", "A", 6, 260, "99.20",
     "Выручка 40 пекарен и договоры с магазинами"),
    ("Сладкий берег", "кондитерская фабрика", "Восточная область", "B", 2, 30, "100.00",
     "Договоры с торговыми сетями, счета-фактуры за 3 месяца"),
    ("Каменный мост", "строительная компания", "Центральный округ", "B", 1, 14, "91.50",
     "Договор подряда с застройщиком, акт выполненных работ"),
    ("Транзит-Логистик", "автотранспортное предприятие", "Западная область", "A", 3, 62, "100.00",
     "Договоры перевозок с оплатой по графику"),
]

# legal name, INN, director, registered, charter capital, employees, activity, address, founders
LEGAL_DATA = {
    "Северный агро": ("ООО «Северный агро»", "300000001", "Иванова Мария Сергеевна", date(2014, 4, 2), 900000000, 120,
                      "Переработка масличных культур", "Северная область, г. Примерный, ул. Полевая, 12",
                      [("Иванова Мария Сергеевна", 60), ("Петров Олег Николаевич", 40)]),
    "Вектор Топливо": ("ООО «Вектор Топливо»", "300000002", "Смирнов Андрей Викторович", date(2015, 9, 18), 1200000000, 85,
                       "Розничная торговля топливом", "Приозёрная область, г. Озёрный, пр. Энергетиков, 3",
                       [("Смирнов Андрей Викторович", 100)]),
    "Пекарня Рассвет": ("ООО «Пекарня Рассвет»", "300000003", "Кузнецова Елена Павловна", date(2012, 2, 27), 650000000, 210,
                        "Производство хлеба и выпечки", "Южная область, г. Солнечный, ул. Хлебная, 7",
                        [("Кузнецова Елена Павловна", 55), ("Орлов Денис Игоревич", 45)]),
    "Сладкий берег": ("ООО «Сладкий берег»", "300000004", "Волков Игорь Андреевич", date(2019, 6, 11), 300000000, 64,
                      "Производство кондитерских изделий", "Восточная область, г. Речной, ул. Набережная, 21",
                      [("Волков Игорь Андреевич", 70), ("Волкова Анна Олеговна", 30)]),
    "Каменный мост": ("ООО «Каменный мост»", "300000005", "Соколов Павел Дмитриевич", date(2022, 10, 5), 50000000, 26,
                      "Строительство зданий", "Центральный округ, г. Примерный, ул. Строителей, 40",
                      [("Соколов Павел Дмитриевич", 95), ("Лебедев Артём Сергеевич", 5)]),
    "Транзит-Логистик": ("ООО «Транзит-Логистик»", "300000006", "Морозов Кирилл Антонович", date(2017, 3, 22), 400000000, 140,
                         "Грузовые автоперевозки", "Западная область, г. Дорожный, ул. Транспортная, 9",
                         [("Морозов Кирилл Антонович", 50), ("Зайцев Роман Ильич", 50)]),
}
RISKY = {"Каменный мост"}


def item(commodity, quantity, price, warehouse, region):
    return dict(commodity=commodity, quantity=quantity, unit="т", price=price, warehouse=warehouse, warehouse_region=region)


# Same deals as src/sample/data.ts: key, title, business, ticker, category, items, rate, down payment %,
# drift of current price %, worst drop %, status, collected share, deadline days, started days ago,
# installments paid, request, agent checks.
DEALS = [
    dict(key="D1", title="60т АИ-92 для сети АЗС", business="Вектор Топливо", ticker="AI92", category="fuel",
         items=[item("Бензин АИ-92", 60, 13_500_000, "Нефтебаза «Озёрная»", "Приозёрная область")],
         rate="19.97", dp=30, drift=-1.1, worst="34.20", status="collecting", collected="0.62", deadline=3,
         request="Нужно 60т АИ-92 на два месяца, забирать четырьмя партиями",
         checks=["Лоты на 6 нефтебазах, выбрана ближайшая к АЗС", "Цена — средняя по сделкам за последнюю неделю",
                 "Выручка АЗС покрывает каждый платёж графика",
                 "Взнос 30%: запас по цене 40,3%, худшее падение за 3 года — 34,2%"]),
    dict(key="D2", title="100т семян подсолнечника для маслозавода", business="Северный агро", ticker="SUNF", category="agro",
         items=[item("Семена подсолнечника, 1 класс", 100, 4_580_000, "Элеватор «Северный»", "Северная область")],
         rate="19.50", dp=30, drift=-3.9, worst="26.50", status="collecting", collected="0.35", deadline=6,
         request="100т семян 1 класса на 60 дней, забираем партиями по 20–30т",
         checks=["47 сделок за неделю, средняя цена 4 580 000 сум/т", "Источник погашения — продажи масла и шрота",
                 "Сезон сбора: взнос 30% вместо 20%", "Худшие 60 дней в котировках — минус 26,5%"]),
    dict(key="D3", title="30т муки 1 сорта для хлебокомбината", business="Пекарня Рассвет", ticker="FLR1", category="food",
         items=[item("Мука пшеничная 1 сорта", 30, 4_300_000, "Мельница «Колос»", "Южная область")],
         rate="18.50", dp=20, drift=0.8, worst="12.40", status="collecting", collected="0.18", deadline=9,
         request="30т муки на 60 дней для 40 пекарен",
         checks=["Мука — товар с низкой волатильностью: худшее падение 12,4%",
                 "260 сделок на бирже, 99,2% оплачены в срок", "Выручка пекарен покрывает график с запасом"]),
    dict(key="D4", title="200т цемента и 15т арматуры для стройки", business="Каменный мост", ticker="CMNT", category="construction",
         items=[item("Портландцемент М400", 200, 700_000, "Склад «Цемтранс»", "Центральный округ"),
                item("Арматура А500С, 12мм", 15, 8_450_000, "Металлобаза «Прокат»", "Центральный округ")],
         rate="21.00", dp=30, drift=1.6, worst="18.00", status="collecting", collected="0.80", deadline=4,
         request="Цемент и арматура под договор подряда, поставка в два этапа",
         checks=["Два товара в корзине: цена — средневзвешенная за тонну",
                 "Компания на бирже 1 год: 14 сделок, 91,5% оплат в срок",
                 "Два судебных дела в реестре — ставка выше на 1%"]),
    dict(key="D5", title="25т сахара для кондитерской фабрики", business="Сладкий берег", ticker="SUGR", category="food",
         items=[item("Сахар-песок", 25, 11_900_000, "Склад «Восточный»", "Восточная область")],
         rate="19.00", dp=25, drift=2.3, worst="15.60", status="collecting", collected="0.92", deadline=2,
         request="25т сахара на 60 дней под заказы торговых сетей",
         checks=["Договоры с 3 торговыми сетями на 4 месяца вперёд", "100% оплат в срок по 30 сделкам",
                 "Запас по цене 36,1% при худшем падении 15,6%"]),
    dict(key="D6", title="20т дизтоплива для автопарка", business="Транзит-Логистик", ticker="DSL1", category="fuel",
         items=[item("Дизельное топливо Евро-5", 20, 12_800_000, "Нефтебаза «Западная»", "Западная область")],
         rate="19.97", dp=30, drift=1.2, worst="30.10", status="active", started=25, paid=1,
         request="20т дизтоплива для 60 грузовиков на два месяца",
         checks=["Договоры перевозок покрывают график", "62 сделки, 100% оплат в срок"]),
    dict(key="D7", title="80т хлопкового шрота для фермы", business="Северный агро", ticker="MEAL", category="agro",
         items=[item("Шрот хлопковый", 80, 2_900_000, "Элеватор «Северный»", "Северная область")],
         rate="19.00", dp=30, drift=-2.0, worst="22.00", status="active", started=38, paid=2,
         request="80т шрота на корма, забираем партиями", checks=["Стабильный спрос на корма", "140 сделок на бирже"]),
    dict(key="D8", title="120т цемента для жилого комплекса", business="Каменный мост", ticker="CM40", category="construction",
         items=[item("Портландцемент М400", 120, 720_000, "Склад «Цемтранс»", "Центральный округ")],
         rate="21.00", dp=30, drift=0.5, worst="18.00", status="active", started=12, paid=0,
         request="120т цемента под второй этап строительства",
         checks=["Акт выполненных работ подтверждён", "Ставка выше из-за короткой истории"]),
    dict(key="D9", title="35т муки высшего сорта", business="Пекарня Рассвет", ticker="FLRH", category="food",
         items=[item("Мука пшеничная высшего сорта", 35, 4_800_000, "Мельница «Колос»", "Южная область")],
         rate="18.50", dp=20, drift=1.9, worst="12.40", status="completed", started=95, paid=4,
         request="35т муки высшего сорта для кондитерского цеха", checks=["Все 4 платежа получены в срок"]),
    dict(key="D10", title="40т АИ-95 для сети АЗС", business="Вектор Топливо", ticker="AI95", category="fuel",
         items=[item("Бензин АИ-95", 40, 14_200_000, "Нефтебаза «Озёрная»", "Приозёрная область")],
         rate="19.97", dp=30, drift=2.8, worst="34.20", status="completed", started=120, paid=4,
         request="40т АИ-95 на два месяца", checks=["Выплачено полностью, без просрочек"]),
]
# The demo investor's money: deal key -> amount.
DEMO_INVESTMENTS = {"D6": 5_000_000, "D7": 3_000_000, "D9": 3_000_000, "D1": 2_000_000}


def price_history(today, price, drift, seed):
    """Weekly points for 24 weeks ending today; same curve as priceHistory() in data.ts."""
    points = []
    for i in range(23, -1, -1):
        k = 23 - i
        wave = math.sin(k * 0.65 + seed) * 0.025 + math.cos(k * 0.31 + seed * 2) * 0.015
        trend = drift / 100 * (k / 23)
        points.append([str(today - timedelta(days=i * 7)), round(price * (1 + wave * (i / 23) + trend))])
    return points


def deal_specs(today):
    specs = []
    for index, spec in enumerate(DEALS, start=1):
        quantity = sum(Decimal(i["quantity"]) for i in spec["items"])
        goods = sum(q2(Decimal(i["quantity"]) * Decimal(i["price"])) for i in spec["items"])
        exchange_price = float(q2(goods / quantity))
        started = today - timedelta(days=spec["started"]) if "started" in spec else None
        specs.append(dict(
            key=spec["key"], title=spec["title"], business=spec["business"], ticker=spec["ticker"],
            category=spec["category"], items=spec["items"], investor_rate=Decimal(spec["rate"]),
            down_payment_pct=Decimal(spec["dp"]), worst_drop_pct=Decimal(spec["worst"]),
            current_price=q2(Decimal(str(exchange_price * (1 + spec["drift"] / 100)))),
            collect_deadline=today + timedelta(days=spec["deadline"]) if started is None else started,
            request_text=spec["request"], agent_checks=spec["checks"],
            price_history=price_history(today, exchange_price, spec["drift"], index),
        ))
    return specs


def seed_business_demo(today):
    call_command("provision_business_demo")
    business = Business.objects.get(user__username="business_demo")
    Business.objects.filter(pk=business.pk).update(
        legal_name="ООО «Демо Трейд»", legal_form="ООО", inn="300000099",
        director="Демидов Артём Олегович", registered_at=date(2019, 3, 14),
        charter_capital=Decimal("1500000000"), employees=48,
        activity="Оптовая торговля продовольствием, топливом и стройматериалами",
        address="Центральный округ, г. Примерный, ул. Торговая, 1",
        founders=[{"name": "Демидов Артём Олегович", "share": 60}, {"name": "Демидова Ольга Ивановна", "share": 40}],
        halal=True,
    )
    business.refresh_from_db()
    products = [
        ("Мука пшеничная 1 сорта", "food", 30, 4300000, "Южная область", "Мельница «Колос»"),
        ("Бензин АИ-92", "fuel", 40, 13500000, "Приозёрная область", "Нефтебаза «Озёрная»"),
        ("Сахар-песок", "food", 25, 11900000, "Восточная область", "Склад «Восточный»"),
        ("Портландцемент", "construction", 100, 700000, "Центральный округ", "Склад «Цемтранс»"),
        ("Мука пшеничная высшего сорта", "food", 35, 4800000, "Южная область", "Мельница «Колос»"),
        ("Цемент М400", "construction", 80, 750000, "Западная область", "Склад «Западный»"),
    ]
    demo_deals = []
    for index, (commodity, category, quantity, price, region, warehouse) in enumerate(products):
        status = ("collecting", "collecting", "active", "active", "completed", "completed")[index]
        started_at = None if status == "collecting" else today - timedelta(days=35 if status == "active" else 76)
        deal = services.create_deal(
            title=f"Демо: {commodity}", business=business, ticker=f"DEMO{index + 1}",
            category=category, request_text=f"Закупка {quantity} т: {commodity}, {region}.",
            items=[dict(commodity=commodity, quantity=quantity, unit="т", price=price,
                        warehouse=warehouse, warehouse_region=region)],
            down_payment_pct=Decimal("30.00"), investor_rate=Decimal("19.97"),
            business_rate=Decimal("22.27"), worst_drop_pct=Decimal("20.00"),
            current_price=Decimal(price), status=status, started_at=started_at,
            collect_deadline=today + timedelta(days=5) if started_at is None else started_at,
        )
        deal.collected_amount = deal.investors_amount if started_at else q2(deal.investors_amount / 2)
        deal.save(update_fields=["collected_amount"])
        for installment in deal.installments.all():
            installment.paid_at = (
                installment.due_date if status == "completed" or (status == "active" and installment.number == 1)
                else None
            )
            installment.save(update_fields=["paid_at"])
        demo_deals.append(deal)

        if status != "collecting":
            first = deal.items.get(position=1)
            shipment_status = "delivered" if status == "completed" else ("planned" if index == 2 else "dispatched")
            Shipment.objects.update_or_create(
                item=first, reference=f"DEMO-SHIP-{index + 1}",
                defaults={
                    "quantity": Decimal(quantity) / 2 if status == "active" else Decimal(quantity), "status": shipment_status,
                    "planned_date": today + timedelta(days=5) if shipment_status == "planned" else started_at + timedelta(days=10),
                    "dispatched_at": started_at + timedelta(days=9) if shipment_status != "planned" else None,
                    "delivered_at": started_at + timedelta(days=10) if shipment_status == "delivered" else None,
                    "destination": f"{region}, склад демо-компании",
                },
            )
    # Ещё по одной отгрузке на каждой активной сделке, не превышая объём товара.
    for index in (2, 3):
        first = demo_deals[index].items.get(position=1)
        status = "dispatched" if index == 2 else "planned"
        Shipment.objects.update_or_create(
            item=first, reference=f"DEMO-SHIP-EXTRA-{index + 1}",
            defaults={"quantity": first.quantity / 2, "status": status,
                      "planned_date": today + timedelta(days=3),
                      "dispatched_at": today if status == "dispatched" else None,
                      "delivered_at": None, "destination": f"{first.warehouse_region}, склад демо-компании"},
        )

    for index in range(8):
        commodity, category, quantity, _, region, _ = products[index - 4 if index in (4, 5) else index % len(products)]
        status = ("submitted", "submitted", "reviewing", "reviewing", "linked", "linked", "rejected", "rejected")[index]
        text = f"Демо-заявка {index + 1}: закупка {quantity} т товара «{commodity}» для поставки в {region}."
        ProcurementRequest.objects.update_or_create(
            business=business, request_text=text,
            defaults={
                "commodity": commodity, "category": category, "quantity": quantity, "unit": "т",
                "region": region, "delivery_address": f"{region}, склад демо-компании",
                "desired_delivery_date": today + timedelta(days=20), "delivery_terms": "Поставка партиями.",
                "status": status, "deal": demo_deals[index - 4] if status == "linked" else None,
                "review_note": {
                    "submitted": "Заявка получена оператором.",
                    "reviewing": "Оператор проверяет наличие товара и документы.",
                    "linked": "Заявка согласована и связана со сделкой.",
                    "rejected": "Уточните объём и адрес поставки перед повторной подачей.",
                }[status],
            },
        )


class Command(BaseCommand):
    help = f"Демо-данные {settings.APP_NAME} (идемпотентно)"

    @transaction.atomic
    def handle(self, *args, **options):
        today = date.today()
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser("admin", password="admin")

        user, _ = User.objects.update_or_create(username=DEMO_PHONE, defaults={"first_name": "Анна"})
        user.set_password("demo1234")
        user.save()
        demo, _ = Investor.objects.update_or_create(
            user=user, defaults={
                "name": "Анна Демо", "phone": DEMO_PHONE, "onboarded": True,
                "strategy": "balanced", "risk_level": "medium", "horizon_days": 60,
                "monthly_amount": Decimal(5_000_000), "categories": ["fuel", "food"],
            })
        fillers = {}
        for i in range(1, 81):
            u, _ = User.objects.get_or_create(username=f"filler{i:02d}")
            u.set_unusable_password()
            u.save()
            fillers[i], _ = Investor.objects.update_or_create(
                user=u, defaults={"name": f"Инвестор {i}", "phone": f"9989000000{i:02d}"})

        try:
            from api.models_agent import AgentAction
        except ImportError:
            AgentAction = None
        if AgentAction is not None:
            AgentAction.objects.all().delete()
        Operation.objects.all().delete()
        Investment.objects.all().delete()
        Installment.objects.update(paid_at=None, due_date=None)
        Investor.objects.update(balance=0)
        Deal.objects.update(collected_amount=0, status="collecting", started_at=None)
        biz = {}
        for name, kind, region, rating, years, cnt, paid, source in BUSINESSES:
            legal_name, inn, director, registered, capital, employees, activity, address, founders = LEGAL_DATA[name]
            risky = name in RISKY
            biz[name], _ = Business.objects.update_or_create(name=name, defaults=dict(
                kind=kind, region=region, rating=rating, uzex_since=YEAR - years, uzex_deals=cnt,
                uzex_paid_pct=Decimal(paid), repayment_source=source, legal_name=legal_name,
                legal_form="ООО", inn=inn, director=director, registered_at=registered,
                charter_capital=capital, employees=employees, activity=activity, address=address,
                founders=[{"name": founder, "share_pct": share} for founder, share in founders],
                halal=not risky, halal_note="Финансируется процентным кредитом банка" if risky else "",
                tax_debt=False, court_cases=2 if risky else 0, pledged_assets=False))

        d = {}
        for spec in deal_specs(today):
            key = spec.pop("key")
            spec["business"] = biz[spec["business"]]
            spec |= {"term_days": 60, "business_rate": Decimal("22.27"), "min_investment": Decimal(1_000_000)}
            d[key] = services.create_deal(**spec)

        def fresh(deal):
            return Deal.objects.get(pk=deal.pk)

        def put(inv, deal, amount, when):
            fresh_investor = Investor.objects.get(pk=inv.pk)
            if inv.pk != demo.pk:
                services.topup(fresh_investor, amount, when)
            services.invest(fresh_investor, fresh(deal), amount, when)

        def fill_to(deal, target, nums, when):
            rest = target - fresh(deal).collected_amount
            if rest <= 0:
                return
            part = q2(rest / len(nums))
            for n, i in enumerate(nums):
                amount = part if n < len(nums) - 1 else target - fresh(deal).collected_amount
                put(fillers[i], deal, amount, when)

        def pay(deal, number, when):
            services.pay_installment(Installment.objects.select_related("deal").get(deal=deal, number=number), when)

        demo.refresh_from_db()
        services.topup(demo, Decimal(32_000_000), today - timedelta(days=180))
        filler = 1
        for spec in DEALS:
            deal = d[spec["key"]]
            start = today - timedelta(days=spec.get("started", 2))
            if spec["key"] in DEMO_INVESTMENTS:
                put(demo, deal, Decimal(DEMO_INVESTMENTS[spec["key"]]), start)
            share = Decimal(spec.get("collected", "1"))
            nums = list(range(filler, filler + 8))
            filler = filler % 72 + 8
            fill_to(deal, q2(fresh(deal).investors_amount * share), nums, start)
            for number in range(1, spec.get("paid", 0) + 1):
                pay(deal, number, start + timedelta(days=DAYS[number - 1]))
        seed_business_demo(today)

        demo.refresh_from_db()
        self.stdout.write(self.style.SUCCESS(
            f"Сделок: {Deal.objects.count()}, баланс демо-инвестора: {demo.balance}\n"
            f"Кабинет: {DEMO_PHONE} / demo1234, админка: admin / admin"))
