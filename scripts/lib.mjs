import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const COMPONENTS = join(ROOT, "components");
export const CATALOG = join(ROOT, "catalog");

const directories = (path) =>
  existsSync(path)
    ? readdirSync(path, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort()
    : [];

export const files = (path, pattern) =>
  existsSync(path)
    ? readdirSync(path)
        .filter((name) => pattern.test(name))
        .sort()
    : [];

/** Shared source trees that aren't library components. */
export const VENDORED = new Set(["ui", "dashboardblocks", "icons"]);

/** Lists every component as { id, category, slug, dir, demos }. */
export function listComponents() {
  return directories(COMPONENTS).filter((category) => !VENDORED.has(category)).flatMap((category) =>
    directories(join(COMPONENTS, category)).map((slug) => {
      const dir = join(COMPONENTS, category, slug);
      return {
        id: `${category}/${slug}`,
        category,
        slug,
        dir,
        demos: files(join(dir, "demos"), /\.tsx$/).map((name) => name.slice(0, -4)),
      };
    }),
  );
}

export const readMeta = (component) =>
  JSON.parse(readFileSync(join(component.dir, "meta.json"), "utf8"));

export const TEMPLATES = join(ROOT, "templates");

/** Lists every template as { id, slug, dir, meta }. A template is a whole app in templates/<slug>/. */
export function listTemplates() {
  return directories(TEMPLATES)
    .filter((slug) => existsSync(join(TEMPLATES, slug, "template.json")))
    .map((slug) => {
      const dir = join(TEMPLATES, slug);
      return { id: `templates/${slug}`, slug, dir, meta: JSON.parse(readFileSync(join(dir, "template.json"), "utf8")) };
    });
}

/** Selects all components, or the one matching "slug" or "category/slug". */
export function selectComponents(target) {
  const all = listComponents();
  if (!target) return all;
  const matches = all.filter((item) => item.id === target || item.slug === target);
  if (matches.length === 0) throw new Error(`No component matches "${target}"`);
  return matches;
}
