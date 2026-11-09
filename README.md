# Components

A personal library of React, TypeScript and Tailwind components. Apps copy a component's source rather than installing a package, so each app can adapt its copy. If a component's `meta.json` has `install`, add it with `npx shadcn@latest add <install>` instead.

**Live gallery: https://aliakseych.github.io/components/** — every component, block and template, with templates running live in a phone frame. It is rebuilt from `main` on every push.

## Quick start

```bash
pnpm install
pnpm exec playwright install chromium
pnpm run dev
```

The gallery runs at http://localhost:5199.

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
| `pnpm run link-skills` | Makes the skills available from every project |

## Find a component

The library has about 309 components and 17 blocks in 18 categories (`categories.json`).

Browse the [catalog](catalog/CATALOG.md) or the gallery. Agents search [`catalog/index.json`](catalog/index.json). [`tags.json`](tags.json) lists every allowed tag.

It also has templates: whole apps in [`templates/`](templates) that run on their own on sample data, such as [`invest-app`](templates/invest-app). The gallery shows each one live in a phone frame, screen by screen.

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

To check it works, ask the agent from another project: "Does my component library have a kanban board?" It should search `catalog/index.json` and answer with `planning/kanban`.

## Learn more

- [Component conventions](docs/conventions.md)
- [Adding a component](docs/adding-a-component.md)
- [Metadata schema](docs/metadata-schema.md)
