# Invest App

A mobile-first investing app: a catalogue of commodity deals grouped into pools, deal and company pages, a portfolio with personal payout schedules, top-up and invest drawers, an onboarding chat, and an AI assistant that answers inside the app with charts, deal cards, an income calculator and actions the user confirms.

It runs in two modes:

- **Sample data (default).** No server needed. `src/lib/mock-api.ts` answers every request from `src/sample/data.ts`, including the AI assistant, and keeps changes (top-ups, investments, actions) in memory.
- **Real API.** `server/` is the Django + Postgres API with the LLM assistant, deal analysis, insights and an MCP endpoint for outside agents. Set `VITE_API_URL` and the same screens talk to it.

## Run it

```bash
cp -r templates/invest-app my-app && cd my-app
pnpm install
pnpm dev            # http://localhost:3000 on sample data
```

With the real API (see [server/README.md](server/README.md)):

```bash
pnpm server                 # migrate, seed and run Django on :8000
VITE_API_URL=/ pnpm dev     # "/" goes through the Vite proxy to :8000
```

## Make it yours

Everything product-specific is in [`src/template.config.tsx`](src/template.config.tsx):

| Setting | What it changes |
| --- | --- |
| `brand.name`, `brand.wordmark`, `brand.mark` | Product name, the two-line wordmark and the square mark in the header. The default mark is a neutral placeholder. |
| `brand.storageKey` | Prefix for browser storage and events |
| `locale`, `currency` | Number, date and money formatting |
| `apiUrl` | Empty for sample data, or the API base URL |
| `sample` | The data the mock API starts from |

Pass overrides to the app instead of editing the file if you embed it:

```tsx
<InvestApp config={{ brand: { name: "Acme Invest", wordmark: ["Acme", "Invest"] }, currency: "USD" }} />
```

Colors, radius and fonts are tokens at the top of [`src/index.css`](src/index.css).

## Layout

| Path | What |
| --- | --- |
| `src/app.tsx` | App shell: router, tab bar, AI button, toasts |
| `src/routes.tsx` | Route table |
| `src/app/**/page.tsx` | Screens, one folder per route as in the original Next.js app |
| `src/components/ai/` | Assistant: chat, answers with charts, deal chips, insights, deal analysis |
| `src/components/agent/` | Actions proposed by the assistant or outside agents, and API tokens for them |
| `src/components/` | Deal, company, pool and portfolio parts, drawers, charts |
| `src/lib/api.ts`, `use-api.ts` | Requests and the data hook |
| `src/lib/mock-api.ts`, `src/sample/` | The sample-data backend |
| `src/shims/` | A small client router that provides `next/link` and `next/navigation`, so screens keep their Next.js imports |
| `server/` | Django API, LLM assistant (`api/ai.py`), agent actions (`api/agent.py`) and MCP server (`api/mcp.py`) |

## Moving back to Next.js

The screens keep Next.js imports (`next/link`, `next/navigation`). To run them on Next.js again, delete `src/shims`, drop the aliases in `vite.config.ts` and `tsconfig.json`, and move data loading from `useApi` back into server components if you want server rendering.

## Limits

- The UI copy is Russian, as in the source app.
- One light theme. The `.dark` tokens are the shadcn defaults and are not designed.
- Some API field names still carry the source app's naming (for example `uzex_since`), because the server's database schema uses them.
- Sample-data mode keeps state in memory; a reload starts over.
