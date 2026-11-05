import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { createServer } from "vite";
import { ROOT, selectComponents } from "./lib.mjs";

const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 390, height: 844 },
};
const THEMES = ["light", "dark"];
const WORKERS = 6;
// Charts animate for up to about 1.5 seconds, so wait for their final state.
const SETTLE_MS = 2000;

const selected = selectComponents(process.argv[2]);
const server = await createServer({
  configFile: join(ROOT, "gallery/vite.config.ts"),
  logLevel: "error",
  server: { port: 5198 },
});
await server.listen();
const base = server.resolvedUrls.local[0];
const browser = await chromium.launch();
const failures = [];

const tasks = [];
for (const component of selected) {
  const output = join(component.dir, "previews");
  rmSync(output, { recursive: true, force: true });
  mkdirSync(output, { recursive: true });
  for (const demo of component.demos) {
    for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
      for (const theme of THEMES) {
        tasks.push({ component, demo, viewportName, viewport, theme, output });
      }
    }
  }
}

// Parts that animate in on scroll stay empty below the fold, so a tall page is scrolled
// through once, as a reader would, before its screenshot.
async function revealBelowFold(page) {
  const tall = await page.evaluate(async () => {
    const height = document.documentElement.scrollHeight;
    if (height <= innerHeight) return false;
    for (let top = 0; top < height; top += Math.floor(innerHeight / 2)) {
      scrollTo(0, top);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    scrollTo(0, 0);
    return true;
  });
  if (tall) await page.waitForTimeout(SETTLE_MS);
}

async function capture({ component, demo, viewportName, viewport, theme, output }) {
  const label = `${component.id}/${demo} (${viewportName}, ${theme})`;
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  try {
    await page.goto(`${base}?bare=1&theme=${theme}#/${component.id}/${demo}`);
    await page.waitForSelector("[data-demo-ready]", { state: "attached", timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(SETTLE_MS);
    await revealBelowFold(page);
    await page
      .locator("#demo-stage")
      .screenshot({ path: join(output, `${demo}.${viewportName}.${theme}.png`), animations: "disabled" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) errors.push("horizontal overflow");
  } catch (error) {
    errors.push(error.message);
  }

  if (errors.length > 0) {
    failures.push(label);
    console.error(`✗ ${label}\n  - ${[...new Set(errors)].join("\n  - ")}`);
  } else {
    console.log(`✓ ${label}`);
  }
  await context.close();
}

// Warm the dev server so its first dependency scan doesn't reload pages mid-capture.
const warm = await browser.newPage();
await warm.goto(base);
await warm.waitForTimeout(5000);
await warm.close();

try {
  await Promise.all(
    Array.from({ length: WORKERS }, async () => {
      while (tasks.length > 0) await capture(tasks.shift());
    }),
  );
} finally {
  await browser.close();
  await server.close();
}

if (failures.length > 0) {
  console.error(`${failures.length} capture(s) failed`);
  process.exit(1);
}
