// Each template is its own TypeScript project (its "@/" means its own src/), so it is checked separately.
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { ROOT, listTemplates } from "./lib.mjs";

let failed = false;
for (const template of listTemplates()) {
  try {
    execFileSync(join(ROOT, "node_modules/.bin/tsc"), ["-p", template.dir, "--noEmit"], { stdio: "inherit" });
    console.log(`✓ ${template.id}`);
  } catch {
    failed = true;
    console.error(`✗ ${template.id}`);
  }
}
if (failed) process.exit(1);
