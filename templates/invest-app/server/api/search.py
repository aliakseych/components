import re

from django.contrib.postgres.aggregates import StringAgg
from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector, TrigramSimilarity, TrigramWordSimilarity
from django.db.models import Case, CharField, F, OuterRef, Q, Subquery, Value, When
from django.db.models.functions import Coalesce, Greatest, Lower, Replace

from .models import DealItem


def search_deals(qs, q):
    q = " ".join(q.split())
    if not q:
        return qs

    commodities = (
        DealItem.objects.filter(deal_id=OuterRef("pk"))
        .order_by()
        .values("deal_id")
        .annotate(text=StringAgg("commodity", delimiter=" "))
        .values("text")
    )
    commodity_text = Coalesce(Subquery(commodities, output_field=CharField()), Value(""))
    category_text = Case(
        When(category="fuel", then=Value("топливо бензин дизель АЗС")),
        When(category="agro", then=Value("хлопок хлопчатник семена масло")),
        When(category="food", then=Value("продукты мука сахар хлеб")),
        When(category="construction", then=Value("стройка цемент арматура стройматериалы")),
        default=Value(""),
        output_field=CharField(),
    )
    vector = (
        SearchVector("title", "ticker", weight="A", config="russian")
        + SearchVector(commodity_text, "business__name", category_text, weight="B", config="russian")
        + SearchVector("business__kind", "business__region", "warehouse", "warehouse_region", weight="C", config="russian")
    )
    web_query = SearchQuery(q, search_type="websearch", config="russian")
    tokens = re.findall(r"[^\W_]+", q, flags=re.UNICODE)
    prefix_query = SearchQuery(" & ".join(f"{token}:*" for token in tokens), search_type="raw", config="russian") if tokens else None
    similarity = Greatest(TrigramSimilarity("title", q), TrigramSimilarity("ticker", q))
    word_similarity = Greatest(
        TrigramWordSimilarity(q, "title"),
        TrigramWordSimilarity(q, commodity_text),
        TrigramWordSimilarity(q, "business__name"),
    )
    normalized = re.sub(r"[\s-]+", "", q).lower().translate(str.maketrans({"а": "a", "и": "i"}))
    qs = qs.annotate(
        search_vector=vector,
        search_similarity=similarity,
        search_word_similarity=word_similarity,
        normalized_ticker=Replace(Replace(Lower("ticker"), Value("-"), Value("")), Value(" "), Value("")),
    )
    matches = (
        Q(search_vector=web_query)
        | Q(search_similarity__gte=0.2)
        | Q(search_word_similarity__gte=0.3)
        | Q(ticker__iexact=q)
        | Q(title__icontains=q)
    )
    rank = SearchRank(F("search_vector"), web_query)
    if prefix_query is not None:
        matches |= Q(search_vector=prefix_query)
        rank = Greatest(rank, SearchRank(F("search_vector"), prefix_query))
    if normalized:
        matches |= Q(normalized_ticker=normalized)
    return qs.filter(matches).annotate(rank=rank + Greatest(F("search_similarity"), F("search_word_similarity")))
