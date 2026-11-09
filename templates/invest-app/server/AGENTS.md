# backend — Django

Общие правила лежат в [../AGENTS.md](../AGENTS.md). Команды запускай из `backend/` через `uv run`.

## Структура

- Весь код в одном приложении `api/`: `models.py`, `views.py`, `admin.py`. Новые Django-приложения не создавай.
- Маршруты прописывай в `config/urls.py`. Эндпоинт — функция в `api/views.py`, по образцу `health`:

```python
def deal_list(request):
    deals = Deal.objects.values("id", "title", "amount")
    return JsonResponse({"items": list(deals)})
```

- POST читается так: `json.loads(request.body)`. На время MVP вьюхи с POST помечай `@csrf_exempt`.
- Каждую модель регистрируй в `admin.py`: админка служит и интерфейсом для данных, и способом проверки.
- Демо-данные — это management command `api/management/commands/seed.py`. Она должна быть идемпотентной (`update_or_create`).

## Миграции — только простые

- Разрешено: новая модель, новое поле с `null=True` или `default`.
- Переименование и смена типа поля запрещены. Вместо этого добавь новое поле, а старое удали, когда его перестанут читать.
- После правки моделей запусти `uv run python manage.py makemigrations` и закоммить миграцию вместе с моделью.
- Миграция не применяется или конфликтует — локальную базу можно пересоздать: `docker compose down -v && mise run db && mise run backend`, затем снова `seed`.
- Деньги храни в `DecimalField(max_digits=18, decimal_places=2)`.
