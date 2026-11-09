# Investing app API

Optional Django backend for the template: investors, deals, payout schedules, an LLM assistant
(`api/ai.py`), agent actions with human confirmation (`api/agent.py`) and an MCP endpoint for external
agents (`api/mcp.py`). Without it the app runs on `src/lib/mock-api.ts` and `src/sample/data.ts`.

## Environment

Copy `.env.example` to `.env`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `postgres://invest:invest@localhost:5432/invest` | PostgreSQL (search uses `pg_trgm`) |
| `DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS`, `DJANGO_CSRF_TRUSTED_ORIGINS` | dev values | Django |
| `APP_NAME` | `Northwind Invest` | Product name in AI prompts and MCP server info |
| `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`, `LLM_FALLBACK_MODEL` | empty | OpenAI-compatible provider. Without them the AI endpoints fall back to rule-based answers or return 503 |
| `ORGINFO_LOOKUP` | `false` | Opt-in scraping of the public registry orginfo.uz to link company cards. Off: links go to the registry search by INN |
| `CACHE_DIR` | `/tmp/invest-cache` | File cache and MCP rate-limit lock |

## Run

```sh
uv run python manage.py migrate && uv run python manage.py seed && uv run python manage.py runserver
```

`seed` loads the same fictional data as `src/sample/data.ts`. Demo investor: `998901234567` / `demo1234`;
admin: `admin` / `admin`.

## Point the app at it

```sh
VITE_API_URL=/ pnpm dev
```

The Vite dev server proxies `/api` to `http://localhost:8000`.

## Known leftovers

Model fields `uzex_since`, `uzex_deals` and `uzex_paid_pct` (years, deals and on-time share on the
exchange) keep their original names, as do the migrations and the API fields in `src/lib/types.ts`.
Renaming them needs a migration and a type change.
