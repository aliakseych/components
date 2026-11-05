import { existsSync, lstatSync, mkdirSync, readdirSync, readlinkSync, symlinkSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { ROOT } from "./lib.mjs";

const source = join(ROOT, ".claude/skills");
const target = join(homedir(), ".claude/skills");
mkdirSync(target, { recursive: true });

let failed = false;
for (const name of readdirSync(source)) {
  const from = join(source, name);
  const to = join(target, name);
  const present = existsSync(to) || lstatExists(to);
  if (!present) {
    symlinkSync(from, to);
    console.log(`Linked ${name}`);
  } else if (lstatSync(to).isSymbolicLink() && readlinkSync(to) === from) {
    console.log(`Already linked ${name}`);
  } else {
    console.error(`Skipped ${name}: ${to} already exists`);
    failed = true;
  }
}
if (failed) process.exit(1);

function lstatExists(path) {
  try {
    lstatSync(path);
    return true;
  } catch {
    return false;
  }
}
