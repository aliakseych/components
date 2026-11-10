#!/usr/bin/env node
// MCP server for the component library.
// stdio (default): `node mcp/server.mjs`
// HTTP: `node mcp/server.mjs --http` serves MCP at /mcp and, if built, the gallery from dist/.
import { readFile, readdir, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const catalog = JSON.parse(await readFile(join(root, "catalog/index.json"), "utf8"));

const text = (value) => ({
  content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }],
});
const fail = (message) => ({ isError: true, content: [{ type: "text", text: message }] });

function brief(c) {
  return { id: c.id, summary: c.summary, tags: c.tags, status: c.status };
}

function score(item, terms) {
  const fields = [
    [item.id, 5],
    [item.name, 4],
    [(item.tags ?? []).join(" "), 3],
    [item.summary, 2],
    [[item.useWhen, item.avoidWhen].flat().filter(Boolean).join(" "), 1],
  ];
  let total = 0;
  for (const term of terms) {
    let hit = 0;
    for (const [value, weight] of fields) if (String(value ?? "").toLowerCase().includes(term)) hit += weight;
    if (!hit) return 0; // every term must match somewhere
    total += hit;
  }
  return total;
}

function findComponent(id) {
  return catalog.components.find((c) => c.id === id || c.slug === id);
}

async function listFiles(dir) {
  const out = [];
  for (const entry of await readdir(join(root, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      if (entry.name !== "previews" && entry.name !== "node_modules") out.push(...(await listFiles(rel)));
    } else out.push(rel);
  }
  return out;
}

function buildServer() {
  const server = new McpServer({ name: "components", version: "1.0.0" });

  server.registerTool(
    "search_components",
    {
      description:
        "Search library components and templates by words matched against id, name, tags, summary and useWhen. Returns best matches first.",
      inputSchema: {
        query: z.string().describe("Words to match, e.g. 'chat composer' or 'gantt'"),
        category: z.string().optional().describe("Limit to one category from list_categories"),
        tag: z.string().optional().describe("Limit to components with this tag"),
        limit: z.number().int().min(1).max(50).default(10),
      },
    },
    async ({ query, category, tag, limit }) => {
      const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      const pool = [
        ...catalog.components.filter((c) => (!category || c.category === category) && (!tag || c.tags?.includes(tag))),
        ...(category || tag ? [] : catalog.templates.map((t) => ({ ...t, kind: "template" }))),
      ];
      const hits = pool
        .map((item) => ({ item, s: terms.length ? score(item, terms) : 1 }))
        .filter((h) => h.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, limit)
        .map(({ item }) => (item.kind === "template" ? { ...brief(item), kind: "template" } : brief(item)));
      return text(hits.length ? hits : `No matches for "${query}".`);
    },
  );

  server.registerTool(
    "get_component",
    {
      description:
        "Get a component's metadata, README, file list and install command. Set includeSource to also return its source files.",
      inputSchema: {
        id: z.string().describe("Component id 'category/slug' or a unique slug"),
        includeSource: z.boolean().default(false),
      },
    },
    async ({ id, includeSource }) => {
      const c = findComponent(id);
      if (!c) return fail(`Unknown component "${id}". Use search_components.`);
      const meta = JSON.parse(await readFile(join(root, c.path, "meta.json"), "utf8"));
      const readme = await readFile(join(root, c.path, "README.md"), "utf8").catch(() => "");
      const files = await listFiles(c.path);
      const result = {
        ...c,
        install: meta.install ? `npx shadcn@latest add ${meta.install}` : null,
        composes: meta.composes ?? [],
        files,
        readme,
      };
      if (includeSource) {
        result.source = {};
        for (const f of files.filter((f) => /\.(tsx?|css)$/.test(f))) result.source[f] = await readFile(join(root, f), "utf8");
      }
      return text(result);
    },
  );

  server.registerTool(
    "list_categories",
    { description: "List categories with descriptions and component counts.", inputSchema: {} },
    async () =>
      text(
        Object.entries(catalog.categories).map(([id, c]) => ({
          id,
          name: c.name,
          description: c.description,
          count: c.components.length,
        })),
      ),
  );

  server.registerTool(
    "list_tags",
    { description: "List allowed tags and how many components use each.", inputSchema: {} },
    async () =>
      text(Object.fromEntries(Object.entries(catalog.tags).map(([tag, t]) => [tag, { description: t.description, count: t.components.length }]))),
  );

  server.registerTool(
    "get_block",
    {
      description:
        "Get a block: a recipe of slots for one kind of screen, each listing alternative components. Omit id to list blocks.",
      inputSchema: { id: z.string().optional() },
    },
    async ({ id }) => {
      if (!id) return text(catalog.blocks.map((b) => ({ id: b.id, name: b.name, summary: b.summary })));
      const block = catalog.blocks.find((b) => b.id === id);
      return block ? text(block) : fail(`Unknown block "${id}".`);
    },
  );

  server.registerTool(
    "list_templates",
    { description: "List whole-app templates that run on sample data.", inputSchema: {} },
    async () => text(catalog.templates.map(({ id, name, summary, screens, stack, path }) => ({ id, name, summary, screens, stack, path }))),
  );

  return server;
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

async function serveStatic(req, res, dist) {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
  let file = join(dist, path);
  if (!file.startsWith(dist + sep) && file !== dist) return res.writeHead(403).end();
  const info = await stat(file).catch(() => null);
  if (!info || info.isDirectory()) file = join(dist, "index.html");
  const body = await readFile(file).catch(() => null);
  if (!body) return res.writeHead(404).end("Not found");
  res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" }).end(body);
}

async function startHttp(port) {
  const dist = join(root, "dist");
  const http = createServer(async (req, res) => {
    if (req.url.startsWith("/mcp")) {
      // Stateless: one server and transport per request.
      const server = buildServer();
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      res.on("close", () => {
        transport.close();
        server.close();
      });
      await server.connect(transport);
      return transport.handleRequest(req, res);
    }
    if (req.url === "/healthz") return res.writeHead(200).end("ok");
    return serveStatic(req, res, dist);
  });
  http.listen(port, "0.0.0.0", () => console.error(`Gallery on http://localhost:${port}, MCP on /mcp`));
}

if (process.argv.includes("--http")) await startHttp(Number(process.env.PORT ?? 8080));
else await buildServer().connect(new StdioServerTransport());
