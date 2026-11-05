import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, files, selectComponents, listComponents } from "./lib.mjs";

const TAGS = JSON.parse(readFileSync(join(ROOT, "tags.json"), "utf8"));
const STATUSES = ["experimental", "stable", "deprecated"];
const TEXT_FIELDS = ["name", "summary", "source"];
const LIST_FIELDS = ["tags", "useWhen", "avoidWhen", "dependencies"];
const NON_EMPTY_LISTS = ["tags", "useWhen", "avoidWhen"];
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const BUILT_IN = new Set(["react", "react-dom"]);
const IMPORT = /(?:from\s+|import\s+|import\()\s*["']([^"']+)["']/g;

const packageName = (specifier) =>
  specifier.split("/").slice(0, specifier.startsWith("@") ? 2 : 1).join("/");

const hasTodo = (value) => /\bTODO\b/.test(JSON.stringify(value));

export function validateComponent(component) {
  const errors = [];
  if (!(component.category in CATEGORIES)) {
    errors.push(`unknown category "${component.category}"; use one from categories.json`);
  }
  if (!KEBAB.test(component.slug)) errors.push("slug must be kebab-case");

  for (const name of ["index.tsx", "README.md", "meta.json"]) {
    if (!existsSync(join(component.dir, name))) errors.push(`missing ${name}`);
  }
  if (component.demos.length === 0) errors.push("needs at least one demos/*.tsx");
  if (errors.some((error) => error.startsWith("missing"))) return errors;

  let meta;
  try {
    meta = JSON.parse(readFileSync(join(component.dir, "meta.json"), "utf8"));
  } catch (error) {
    return [...errors, `meta.json is invalid: ${error.message}`];
  }

  for (const field of TEXT_FIELDS) {
    if (typeof meta[field] !== "string" || !meta[field].trim()) {
      errors.push(`meta.${field} must be a non-empty string`);
    }
  }
  for (const field of LIST_FIELDS) {
    if (!Array.isArray(meta[field]) || meta[field].some((item) => typeof item !== "string")) {
      errors.push(`meta.${field} must be a list of strings`);
    }
  }
  for (const field of NON_EMPTY_LISTS) {
    if (Array.isArray(meta[field]) && meta[field].length === 0) {
      errors.push(`meta.${field} must not be empty`);
    }
  }
  if (!STATUSES.includes(meta.status)) {
    errors.push(`meta.status must be one of: ${STATUSES.join(", ")}`);
  }
  if (hasTodo(meta)) errors.push("meta.json still contains TODO");
  if (/\bTODO\b/.test(readFileSync(join(component.dir, "README.md"), "utf8"))) {
    errors.push("README.md still contains TODO");
  }

  for (const tag of Array.isArray(meta.tags) ? meta.tags : []) {
    if (!(tag in TAGS)) errors.push(`unknown tag "${tag}"; use one from tags.json`);
  }
  for (const field of ["shadcn", "composes"]) {
    if (meta[field] !== undefined && !Array.isArray(meta[field])) {
      errors.push(`meta.${field} must be a list of strings`);
    }
  }
  const ids = new Set(listComponents().map((item) => item.id));
  for (const id of meta.composes ?? []) {
    if (!ids.has(id)) errors.push(`meta.composes names a missing component: ${id}`);
  }

  const sources = [
    ...files(component.dir, /\.[jt]sx?$/).map((name) => join(component.dir, name)),
  ];
  const declared = new Set(Array.isArray(meta.dependencies) ? meta.dependencies : []);
  for (const source of sources) {
    const code = readFileSync(source, "utf8");
    for (const [, specifier] of code.matchAll(IMPORT)) {
      if (specifier.startsWith("..")) {
        errors.push(`${source.split("/").pop()} imports outside its folder: ${specifier}`);
      } else if (specifier === "@/lib/utils") {
        continue;
      } else if (specifier.startsWith("@/components/ui/")) {
        const item = specifier.slice("@/components/ui/".length);
        if (!(meta.shadcn ?? []).includes(item)) {
          errors.push(`undeclared shadcn component: ${item}`);
        }
      } else if (specifier.startsWith("@/components/dashboardblocks/")) {
        if (typeof meta.install !== "string" || !meta.install.startsWith("@dashboardblocks/")) {
          errors.push("imports from dashboardblocks need meta.install set to its @dashboardblocks item");
        }
      } else if (specifier.startsWith("@/components/")) {
        const id = specifier.slice("@/components/".length);
        if (!(meta.composes ?? []).includes(id)) {
          errors.push(`undeclared composed component: ${id}`);
        }
      } else if (specifier.startsWith("@/")) {
        errors.push(`unsupported alias import: ${specifier}`);
      } else if (!specifier.startsWith(".")) {
        const name = packageName(specifier);
        if (!BUILT_IN.has(name) && !declared.has(name)) {
          errors.push(`undeclared dependency: ${name}`);
        }
      }
    }
  }
  return errors;
}

const CATEGORIES = JSON.parse(readFileSync(join(ROOT, "categories.json"), "utf8"));
const BLOCKS_DIR = join(ROOT, "blocks");

function validateBlock(name) {
  const errors = [];
  const block = JSON.parse(readFileSync(join(BLOCKS_DIR, name), "utf8"));
  for (const field of ["name", "summary", "category"]) {
    if (typeof block[field] !== "string" || !block[field].trim()) {
      errors.push(`${field} must be a non-empty string`);
    }
  }
  if (!(block.category in CATEGORIES)) errors.push(`unknown category "${block.category}"`);
  if (!Array.isArray(block.slots) || block.slots.length === 0) errors.push("needs at least one slot");
  const all = listComponents();
  for (const slot of block.slots ?? []) {
    if (!slot.id || !slot.label || !slot.description) {
      errors.push("each slot needs id, label and description");
    }
    if (!Array.isArray(slot.options) || slot.options.length === 0) {
      errors.push(`slot "${slot.id}" needs at least one option`);
    }
    for (const option of slot.options ?? []) {
      const [category, slug, demo] = option.split("/");
      const component = all.find((item) => item.id === `${category}/${slug}`);
      if (!component?.demos.includes(demo)) {
        errors.push(`slot "${slot.id}" names a missing demo: ${option}`);
      }
    }
  }
  return errors;
}

const target = process.argv[2];
const selected = selectComponents(target);
let failed = false;

const slugs = listComponents().map((component) => component.slug);
for (const slug of new Set(slugs.filter((value, index) => slugs.indexOf(value) !== index))) {
  console.error(`✗ slug is used more than once: ${slug}`);
  failed = true;
}

for (const component of selected) {
  const errors = validateComponent(component);
  if (errors.length === 0) {
    console.log(`✓ ${component.id}`);
  } else {
    failed = true;
    console.error(`✗ ${component.id}`);
    for (const error of errors) console.error(`  - ${error}`);
  }
}
if (!target) {
  for (const name of files(BLOCKS_DIR, /\.json$/)) {
    const errors = validateBlock(name);
    if (errors.length === 0) {
      console.log(`✓ blocks/${name}`);
    } else {
      failed = true;
      console.error(`✗ blocks/${name}`);
      for (const error of errors) console.error(`  - ${error}`);
    }
  }
}
if (failed) process.exit(1);
