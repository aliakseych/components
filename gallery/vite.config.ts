import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));
const repo = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");

// Serves the generated llms.txt from the repo root at <site>/llms.txt, in dev and in the build.
const llmsTxt = (): Plugin => ({
  name: "llms-txt",
  configureServer(server) {
    server.middlewares.use("/llms.txt", (_req, res) => {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end(readFileSync(`${repo}/llms.txt`));
    });
  },
  generateBundle() {
    this.emitFile({ type: "asset", fileName: "llms.txt", source: readFileSync(`${repo}/llms.txt`) });
  },
});

/** templates/<slug> folder of the importing file, if it is inside a template. */
const templateOf = (importer?: string) => importer?.match(/^(.*\/templates\/[^/]+)\//)?.[1];

// Library code imports "@/..." from the repo root. A template is its own project, where "@/..."
// means its src/ and "next/*" means its Next.js shims, so imports resolve by who is importing.
const scopedImports = (): Plugin => ({
  name: "scoped-imports",
  enforce: "pre",
  resolveId(source, importer, options) {
    const template = templateOf(importer);
    let target: string | undefined;
    if (source.startsWith("@/")) {
      target = `${template ? `${template}/src` : repo}/${source.slice(2)}`;
    } else if (template && /^next(\/|$)/.test(source)) {
      target = `${template}/src/shims/next/${source.replace(/^next\/?/, "") || "index"}`;
    }
    return target ? this.resolve(target, importer, { ...options, skipSelf: true }) : null;
  },
});

export default defineConfig({
  root,
  // GitHub Pages serves the site from /<repo>/; set BASE_PATH there. Local dev stays at /.
  base: process.env.BASE_PATH ?? "/",
  plugins: [scopedImports(), llmsTxt(), react(), tailwindcss()],
  build: {
    outDir: `${repo}/dist`,
    emptyOutDir: true,
    rollupOptions: {
      // The gallery, and the page that runs one template screen inside the phone frame.
      input: { main: `${root}index.html`, template: `${root}template.html` },
    },
  },
  server: {
    port: 5199,
    fs: { allow: [repo] },
  },
});
