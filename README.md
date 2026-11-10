# Components

A personal library of React, TypeScript and Tailwind components. Apps copy a component's source rather than installing a package, so each app can adapt its copy. If a component's `meta.json` has `install`, add it with `npx shadcn@latest add <install>` instead.

The gallery shows every component, block and template, with templates running live in a phone frame. It is not published to GitHub Pages; run it locally with `pnpm run dev` or in Docker together with the MCP server.

## Quick start

```bash
pnpm install
pnpm exec playwright install chromium
pnpm run dev
```

The gallery runs at http://localhost:5199.

## Run in Docker

```bash
docker compose up -d --build
```

One container serves the built gallery at http://localhost:8080 and the MCP server at http://localhost:8080/mcp. Rebuild after changing components so the catalog in the image is current.

CI publishes the same image as `ghcr.io/aliakseych/components:latest` on every push to `main`. To run the published image and keep it current, use it with [Watchtower](https://github.com/nicholas-fedor/watchtower) and the label `com.centurylinklabs.watchtower.enable=true`.

## CI and security

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) type-checks, validates and confirms `catalog/` and `llms.txt` are regenerated, then builds the image. Trivy scans the image and the repository (dependencies, secrets, Dockerfile and workflow misconfiguration), and CodeQL analyses the code; all results upload as SARIF to the repository's Security tab. Critical fixable image vulnerabilities fail the build. Pull requests also run dependency review. [`dependabot.yml`](.github/dependabot.yml) updates npm packages, actions and the Docker base image weekly. Actions are pinned by commit SHA.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm run dev` | Opens the gallery |
| `pnpm run new <category>/<slug>` | Creates a component from the template |
| `pnpm run validate [slug]` | Checks files, metadata and dependencies |
| `pnpm run capture [slug]` | Screenshots each demo, or each screen of a template, and fails on errors or horizontal overflow |
| `pnpm run index` | Regenerates `catalog/` |
| `pnpm run check` | Runs type checks, validation, capture and indexing |
| `pnpm run build` | Builds the gallery into `dist/` (set `BASE_PATH` when it is served from a subfolder) |
| `pnpm run mcp` | Starts the MCP server over stdio |
| `pnpm run serve` | Serves `dist/` and the MCP server over HTTP on `PORT` (default 8080) |
| `pnpm run link-skills` | Makes the skills available from every project |

For language models, [`llms.txt`](llms.txt) maps every template and component to its README, following [llmstxt.org](https://llmstxt.org). The gallery serves it at `/llms.txt`. `pnpm run index` regenerates it.

## MCP server

[`mcp/server.mjs`](mcp/server.mjs) lets any MCP client search the library. It reads `catalog/index.json`, so run `pnpm run index` (or `check`) after changes.

| Tool | Returns |
| --- | --- |
| `search_components` | Best matches for a query, optionally filtered by `category` or `tag`; includes templates |
| `get_component` | Metadata, README, files and install command; `includeSource: true` adds the source |
| `list_categories` | Categories with descriptions and counts |
| `list_tags` | Allowed tags with descriptions and counts |
| `get_block` | A block's slots and options; no `id` lists blocks |
| `list_templates` | Whole-app templates and their screens |

Connect over stdio (Claude Code shown; other clients take the same command):

```bash
claude mcp add components -- node /Users/aliakseych/Projects/components/mcp/server.mjs
```

Or over HTTP when the Docker container runs:

```bash
claude mcp add --transport http components http://localhost:8080/mcp
```

## Find a component

The library has about 345 components and 26 blocks in 19 categories (`categories.json`), including complete ready-made screens under `pages`.

Browse the [catalog](catalog/CATALOG.md) or the gallery. Agents search [`catalog/index.json`](catalog/index.json). [`tags.json`](tags.json) lists every allowed tag.

It also has templates: whole apps in [`templates/`](templates) that run on their own on sample data: [`invest-app`](templates/invest-app), a mobile investing app with an AI assistant, and [`telegram-app`](templates/telegram-app), a Telegram-style messenger. The gallery shows each one live in a phone frame, screen by screen.

## Use the skills in other agents

The skills in [`.claude/skills/`](.claude/skills) teach an agent to find, preview, use, harvest and create components. Each one is a plain Markdown file, so any agent that can read files can follow them.

Do this once for every machine, whichever agent you use.

1. Clone the repository and install it:

   ```bash
   git clone https://github.com/aliakseych/components.git
   ```

   ```bash
   cd components && pnpm install
   ```

2. If your clone isn't at `/Users/aliakseych/Projects/components`, point the skills at it. They name that path on purpose, because they run from other projects. Run this from the clone:

   ```bash
   grep -rl /Users/aliakseych/Projects/components .claude/skills | xargs perl -pi -e "s|/Users/aliakseych/Projects/components|$PWD|g"
   ```

Then connect your agent.

**Claude Code:** link the skills into `~/.claude/skills`, so they work from every project:

```bash
pnpm run link-skills
```

**An agent with its own skills folder:** symlink each skill there. Check your agent's documentation for the folder, then set `SKILLS_DIR` to it and run this from the clone:

```bash
for skill in .claude/skills/*; do ln -s "$PWD/$skill" "$SKILLS_DIR/"; done
```

**Any other agent:** add these lines to the file of instructions it loads, such as `AGENTS.md` for Codex, `GEMINI.md` for Gemini CLI or a rule in `.cursor/rules/` for Cursor. Replace `<path>` with the path to your clone.

```markdown
## Component library

A UI component library is at `<path>`. Before building a UI component, read `<path>/.claude/skills/find-component/SKILL.md` and follow it.
For other component work, follow the matching skill in `<path>/.claude/skills/`: `use-component`, `preview-component`, `harvest-component` or `create-component`.
```

To check it works, ask the agent from another project: "Does my component library have a kanban board?" It should search `catalog/index.json` (or call `search_components`) and answer with `planning/kanban`.

## Learn more

- [Component conventions](docs/conventions.md)
- [Adding a component](docs/adding-a-component.md)
- [Metadata schema](docs/metadata-schema.md)
