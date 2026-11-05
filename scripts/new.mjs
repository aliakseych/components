import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { COMPONENTS } from "./lib.mjs";

const target = process.argv[2];
if (!/^[a-z0-9-]+\/[a-z0-9-]+$/.test(target ?? "")) {
  console.error("Usage: pnpm run new <category>/<slug>  (kebab-case)");
  process.exit(1);
}

const dir = join(COMPONENTS, target);
if (existsSync(dir)) {
  console.error(`Already exists: components/${target}`);
  process.exit(1);
}

const slug = target.split("/")[1];
const words = slug.split("-").map((word) => word[0].toUpperCase() + word.slice(1));
const title = words.join(" ");
const pascal = words.join("");

mkdirSync(join(dir, "demos"), { recursive: true });
writeFileSync(
  join(dir, "index.tsx"),
  `import type { ComponentPropsWithoutRef } from "react";

export type ${pascal}Props = ComponentPropsWithoutRef<"div">;

export function ${pascal}(props: ${pascal}Props) {
  return <div {...props} />;
}
`,
);
writeFileSync(
  join(dir, "demos", "default.tsx"),
  `import { ${pascal} } from "../index";

export default function Demo() {
  return <${pascal}>${title}</${pascal}>;
}
`,
);
writeFileSync(
  join(dir, "meta.json"),
  `${JSON.stringify(
    {
      name: title,
      summary: "TODO",
      tags: [],
      useWhen: ["TODO"],
      avoidWhen: ["TODO"],
      dependencies: [],
      source: "TODO",
      status: "experimental",
    },
    null,
    2,
  )}\n`,
);
writeFileSync(
  join(dir, "README.md"),
  `# ${title}\n\nTODO: describe usage, props, origin and caveats.\n`,
);
console.log(`Created components/${target}`);
