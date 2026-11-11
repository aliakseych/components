import { StrictMode, Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentProps, ComponentType, LazyExoticComponent } from "react";
import { createRoot } from "react-dom/client";
import {
  AppWindowIcon,
  BarChart3Icon,
  BlocksIcon,
  BotIcon,
  BriefcaseIcon,
  CalendarRangeIcon,
  ChevronRightIcon,
  CheckIcon,
  CopyIcon,
  PlugIcon,
  CodeIcon,
  FolderIcon,
  ImageIcon,
  LayoutDashboardIcon,
  LayoutGridIcon,
  MailIcon,
  MegaphoneIcon,
  MessageSquareIcon,
  MonitorIcon,
  MoonIcon,
  MousePointerClickIcon,
  PanelsTopLeftIcon,
  SearchIcon,
  SettingsIcon,
  SparklesIcon,
  SunIcon,
  TableIcon,
  TextCursorInputIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import {
  GlassSidebar,
  GlassSidebarProvider,
  SidebarBrand,
  type GlassNavGroup,
  type RenderNavLink,
} from "@/components/app-interface/sidebar-glass";
import { SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./styles.css";

type Meta = {
  name: string;
  summary: string;
  tags: string[];
  useWhen: string[];
  avoidWhen: string[];
  dependencies: string[];
  status: string;
  install?: string;
};
type Demo = { name: string; Component: LazyExoticComponent<ComponentType> };
type Entry = { id: string; meta: Meta; demos: Demo[] };

const metas = import.meta.glob<Meta>("../components/*/*/meta.json", {
  eager: true,
  import: "default",
});
const demoModules = import.meta.glob<{ default: ComponentType }>(
  "../components/*/*/demos/*.tsx",
);
const previews = import.meta.glob<string>("../components/*/*/previews/*.desktop.*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

const entries: Entry[] = Object.entries(metas)
  .map(([path, meta]) => {
    const id = path.split("/").slice(2, 4).join("/");
    const demos = Object.entries(demoModules)
      .filter(([demoPath]) => demoPath.includes(`/components/${id}/demos/`))
      .map(([demoPath, load]) => ({
        name: demoPath.split("/").pop()!.replace(/\.tsx$/, ""),
        Component: lazy(load),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return { id, meta, demos };
  })
  .sort((a, b) => a.id.localeCompare(b.id));

type Block = {
  name: string;
  summary: string;
  category: string;
  slots: { id: string; label: string; description: string; options: string[] }[];
};

const blocks = Object.entries(
  import.meta.glob<Block>("../blocks/*.json", { eager: true, import: "default" }),
)
  .map(([path, block]) => ({
    id: path.split("/").pop()!.replace(/\.json$/, ""),
    block,
  }))
  .sort((a, b) => a.block.name.localeCompare(b.block.name));

type Template = {
  name: string;
  summary: string;
  tags: string[];
  stack: string[];
  themes?: string[];
  useWhen: string[];
  avoidWhen: string[];
  status: string;
  screens: { id: string; title: string; path: string }[];
};

const templatePreviews = import.meta.glob<string>("../templates/*/previews/*.mobile.*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

const templates = Object.entries(
  import.meta.glob<Template>("../templates/*/template.json", { eager: true, import: "default" }),
)
  .map(([path, template]) => ({ id: path.split("/")[2], template }))
  .sort((a, b) => a.template.name.localeCompare(b.template.name));

const screenPreview = (id: string, screen: string, theme: string) =>
  templatePreviews[`../templates/${id}/previews/${screen}.mobile.${theme}.png`] ??
  templatePreviews[`../templates/${id}/previews/${screen}.mobile.light.png`];

function searchTemplates(query: string) {
  const needles = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (needles.length === 0) return templates;
  return templates.filter(({ id, template }) =>
    score(needles, template.name, id, template.tags, [template.summary, ...template.stack].join(" ")) > 0,
  );
}

const categories = import.meta.glob<Record<string, { name: string }>>("../categories.json", {
  eager: true,
  import: "default",
})["../categories.json"];

const categoryIcons: Record<string, ComponentType<{ className?: string }>> = {
  actions: MousePointerClickIcon,
  "ai-chat": BotIcon,
  "app-interface": PanelsTopLeftIcon,
  code: CodeIcon,
  collaboration: UsersIcon,
  "data-display": TableIcon,
  forms: TextCursorInputIcon,
  "hero-page": SparklesIcon,
  marketing: MegaphoneIcon,
  media: ImageIcon,
  messaging: MessageSquareIcon,
  planning: CalendarRangeIcon,
  analytics: BarChart3Icon,
  dashboard: LayoutDashboardIcon,
  business: BriefcaseIcon,
  workspace: FolderIcon,
  operations: SettingsIcon,
  email: MailIcon,
};

/** Every word must match somewhere. Names count most, then tags, then descriptions. */
function score(needles: string[], name: string, id: string, tags: string[], text: string) {
  const lowerName = name.toLowerCase();
  const lowerId = id.toLowerCase();
  const lowerTags = tags.join(" ").toLowerCase();
  const lowerText = text.toLowerCase();
  let total = 0;
  for (const needle of needles) {
    if (lowerName.startsWith(needle)) total += 8;
    else if (lowerName.includes(needle)) total += 6;
    else if (lowerId.includes(needle)) total += 5;
    else if (lowerTags.includes(needle)) total += 4;
    else if (lowerText.includes(needle)) total += 1;
    else return 0;
  }
  return total;
}

function searchEntries(query: string) {
  const needles = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (needles.length === 0) return entries;
  return entries
    .map((entry) => {
      const category = categories[entry.id.split("/")[0]]?.name ?? "";
      const text = [entry.meta.summary, category, ...entry.meta.useWhen].join(" ");
      return { entry, value: score(needles, entry.meta.name, entry.id, entry.meta.tags, text) };
    })
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value || a.entry.meta.name.localeCompare(b.entry.meta.name))
    .map((item) => item.entry);
}

function searchBlocks(query: string) {
  const needles = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (needles.length === 0) return blocks;
  return blocks.filter(
    ({ id, block }) => score(needles, block.name, id, [], block.summary) > 0,
  );
}

/** Some vendored summaries contain markdown links to pages that aren't here. */
const plain = (text: string) => text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

function useHash() {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => {
    const update = () => setHash(location.hash);
    addEventListener("hashchange", update);
    return () => removeEventListener("hashchange", update);
  }, []);
  return hash;
}

function Stage({ demo, bare = false }: { demo: Demo; bare?: boolean }) {
  return (
    <div
      id={bare ? "demo-stage" : undefined}
      className="flex min-h-60 items-center justify-center bg-background p-8 text-foreground"
    >
      <Suspense fallback={null}>
        <demo.Component />
        {bare && <span data-demo-ready hidden />}
      </Suspense>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <h2 className="text-sm font-medium">{title}</h2>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function BlockView({ id, block }: { id: string; block: Block }) {
  const [choices, setChoices] = useState<Record<string, string>>({});

  return (
    <article className="mx-auto w-full max-w-6xl space-y-8 p-4 md:p-8">
      <header>
        <p className="font-mono text-xs text-muted-foreground">blocks/{id}.json</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-balance">{block.name}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{block.summary}</p>
      </header>
      {block.slots.map((slot) => {
        const chosen = choices[slot.id] ?? slot.options[0];
        const [category, slug, demoName] = chosen.split("/");
        const demo = entries
          .find((entry) => entry.id === `${category}/${slug}`)
          ?.demos.find((item) => item.name === demoName);

        return (
          <section className="space-y-3" key={slot.id}>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-medium">{slot.label}</h2>
                <p className="text-sm text-muted-foreground">{slot.description}</p>
              </div>
              <label className="sr-only" htmlFor={`slot-${slot.id}`}>
                Option for {slot.label}
              </label>
              <select
                className="h-9 w-full max-w-xs rounded-lg border bg-card px-2 font-mono text-xs"
                id={`slot-${slot.id}`}
                onChange={(event) =>
                  setChoices((current) => ({ ...current, [slot.id]: event.target.value }))
                }
                value={chosen}
              >
                {slot.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            {demo && (
              <div className="overflow-x-auto rounded-xl border">
                <Stage demo={demo} key={chosen} />
              </div>
            )}
          </section>
        );
      })}
    </article>
  );
}

function Details({ entry, demoName }: { entry: Entry; demoName?: string }) {
  const demos = demoName
    ? entry.demos.filter((demo) => demo.name === demoName)
    : entry.demos;

  return (
    <article className="mx-auto w-full max-w-6xl space-y-8 p-4 md:p-8">
      <header>
        <p className="font-mono text-xs text-muted-foreground">
          components/{entry.id} · {entry.meta.status}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-balance">
          {entry.meta.name}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{plain(entry.meta.summary)}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {entry.meta.tags.map((tag) => (
            <span
              className="rounded-md border bg-card px-1.5 py-0.5 text-xs text-muted-foreground"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
        {entry.meta.install && (
          <code className="mt-3 block w-fit max-w-full overflow-x-auto rounded-lg border bg-card px-3 py-2 font-mono text-xs">
            npx shadcn@latest add {entry.meta.install}
          </code>
        )}
      </header>
      <div className="space-y-6">
        {demos.map((demo) => (
          <section key={demo.name}>
            <a
              className="mb-2 inline-block font-mono text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              href={`#/${entry.id}/${demo.name}`}
            >
              {demo.name}
            </a>
            <div className="overflow-x-auto rounded-xl border">
              <Stage demo={demo} />
            </div>
          </section>
        ))}
      </div>
      <section className="grid gap-4 sm:grid-cols-2">
        <List title="Use when" items={entry.meta.useWhen} />
        <List title="Avoid when" items={entry.meta.avoidWhen} />
      </section>
    </article>
  );
}

/** A live, scaled phone screen running one template route in its own page. */
function PhoneFrame({ id, path, theme }: { id: string; path: string; theme: string }) {
  const query = new URLSearchParams({ t: id, path, theme });
  return (
    <div className="mx-auto w-[316px] shrink-0 rounded-[2.75rem] border bg-card p-3 shadow-sm">
      <div className="h-[675px] w-[292px] overflow-hidden rounded-[2.1rem] border bg-background">
        {/* 390×900 rendered at 0.75 so the phone keeps a real device width inside the frame. */}
        <iframe
          className="h-[900px] w-[390px] origin-top-left scale-75 border-0"
          key={query.toString()}
          src={`template.html?${query}`}
          title={`${id} ${path}`}
        />
      </div>
    </div>
  );
}

function TemplateView({ id, template, screenId, theme }: { id: string; template: Template; screenId?: string; theme: string }) {
  const screen = template.screens.find((item) => item.id === screenId) ?? template.screens[0];
  const frameTheme = (template.themes ?? ["light", "dark"]).includes(theme) ? theme : "light";

  return (
    <article className="mx-auto w-full max-w-6xl space-y-8 p-4 md:p-8">
      <header>
        <p className="font-mono text-xs text-muted-foreground">
          templates/{id} · {template.status}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-balance">{template.name}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{template.summary}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {template.stack.map((item) => (
            <span className="rounded-md border bg-card px-1.5 py-0.5 text-xs text-muted-foreground" key={item}>
              {item}
            </span>
          ))}
        </div>
        <code className="mt-3 block w-fit max-w-full overflow-x-auto rounded-lg border bg-card px-3 py-2 font-mono text-xs">
          cp -r templates/{id} my-app && cd my-app && pnpm install && pnpm dev
        </code>
      </header>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="space-y-3 lg:sticky lg:top-16">
          <PhoneFrame id={id} path={screen.path} theme={frameTheme} />
          <p className="text-center font-mono text-xs text-muted-foreground">{screen.path}</p>
        </div>
        <section aria-label="Screens" className="min-w-0 flex-1 space-y-3">
          <h2 className="font-medium">
            Screens <span className="text-xs text-muted-foreground tabular-nums">{template.screens.length}</span>
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-3">
            {template.screens.map((item) => {
              const preview = screenPreview(id, item.id, frameTheme);
              return (
                <a
                  aria-current={item.id === screen.id ? "page" : undefined}
                  className="group overflow-hidden rounded-xl border bg-card outline-none transition-colors hover:border-foreground/25 focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:border-foreground/60 aria-[current=page]:ring-1 aria-[current=page]:ring-foreground/20"
                  href={`#/templates/${id}/${item.id}`}
                  key={item.id}
                >
                  <div className="aspect-[390/844] overflow-hidden border-b bg-background">
                    {preview ? (
                      <img alt="" className="size-full object-cover object-top" decoding="async" loading="lazy" src={preview} />
                    ) : (
                      <span className="flex size-full items-center justify-center text-xs text-muted-foreground">No preview</span>
                    )}
                  </div>
                  <p className="truncate px-2 py-1.5 text-xs font-medium">{item.title}</p>
                </a>
              );
            })}
          </div>
          <div className="grid gap-4 pt-4 sm:grid-cols-2">
            <List items={template.useWhen} title="Use when" />
            <List items={template.avoidWhen} title="Avoid when" />
          </div>
        </section>
      </div>
    </article>
  );
}

function TemplateCard({ id, template, theme }: { id: string; template: Template; theme: string }) {
  const shots = template.screens.slice(0, 3).map((screen) => screenPreview(id, screen.id, theme));
  return (
    <a
      className="group flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card outline-none transition-colors hover:border-foreground/25 focus-visible:ring-2 focus-visible:ring-ring"
      href={`#/templates/${id}`}
    >
      <div className="flex aspect-[16/10] items-end justify-center gap-3 overflow-hidden border-b bg-muted/40 px-4 pt-5">
        {shots.map((shot, index) =>
          shot ? (
            <img
              alt=""
              className="h-full w-auto translate-y-3 rounded-t-xl border border-b-0 bg-background object-cover object-top shadow-sm transition-transform group-hover:translate-y-1"
              decoding="async"
              key={index}
              loading="lazy"
              src={shot}
            />
          ) : null,
        )}
        {shots.every((shot) => !shot) && <span className="self-center text-xs text-muted-foreground">No preview yet</span>}
      </div>
      <div className="min-w-0 p-3">
        <h3 className="truncate text-sm font-medium">{template.name}</h3>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{template.summary}</p>
      </div>
    </a>
  );
}

function ComponentCard({ entry, theme }: { entry: Entry; theme: string }) {
  const demo = entry.demos[0]?.name ?? "default";
  const preview = previews[`../components/${entry.id}/previews/${demo}.desktop.${theme}.png`];

  return (
    <a
      className="group flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card outline-none transition-colors hover:border-foreground/25 focus-visible:ring-2 focus-visible:ring-ring"
      href={`#/${entry.id}`}
    >
      <div className="flex aspect-[16/10] items-center justify-center overflow-hidden border-b bg-background">
        {preview ? (
          <img
            alt=""
            className="size-full object-contain object-center p-2"
            decoding="async"
            loading="lazy"
            src={preview}
          />
        ) : (
          <span className="text-xs text-muted-foreground">No preview yet</span>
        )}
      </div>
      <div className="min-w-0 p-3">
        <h3 className="truncate text-sm font-medium">{entry.meta.name}</h3>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{plain(entry.meta.summary)}</p>
      </div>
    </a>
  );
}

function Grid({ items, theme }: { items: Entry[]; theme: string }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4">
      {items.map((entry) => (
        <ComponentCard entry={entry} key={entry.id} theme={theme} />
      ))}
    </div>
  );
}

function TemplateGrid({ items, theme }: { items: typeof templates; theme: string }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-4">
      {items.map(({ id, template }) => (
        <TemplateCard id={id} key={id} template={template} theme={theme} />
      ))}
    </div>
  );
}

function Browse({
  categoryId,
  query,
  results,
  templateResults,
  theme,
}: {
  categoryId?: string;
  query: string;
  results: Entry[];
  templateResults: typeof templates;
  theme: string;
}) {
  const searching = query.trim().length > 0;
  const scoped = categoryId
    ? results.filter((entry) => entry.id.startsWith(`${categoryId}/`))
    : results;
  const title = categoryId ? categories[categoryId].name : "Components";
  const count = `${scoped.length} ${scoped.length === 1 ? "component" : "components"}`;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-4 md:p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground tabular-nums">
          {searching ? `${count} match “${query.trim()}”` : count}
        </p>
      </header>
      {!categoryId && templateResults.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-baseline gap-2 font-medium">
            <a className="underline-offset-4 hover:underline" href="#/templates">
              Templates
            </a>
            <span className="text-xs text-muted-foreground tabular-nums">{templateResults.length}</span>
          </h2>
          <TemplateGrid items={templateResults} theme={theme} />
        </section>
      )}
      {scoped.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nothing matches. Try fewer words, or a tag such as “chart” or “form”.
        </p>
      ) : searching || categoryId ? (
        <Grid items={scoped} theme={theme} />
      ) : (
        Object.entries(categories).map(([id, info]) => {
          const items = scoped.filter((entry) => entry.id.startsWith(`${id}/`));
          if (items.length === 0) return null;
          return (
            <section className="space-y-3" key={id}>
              <h2 className="flex items-baseline gap-2 font-medium">
                <a className="underline-offset-4 hover:underline" href={`#/${id}`}>
                  {info.name}
                </a>
                <span className="text-xs text-muted-foreground tabular-nums">{items.length}</span>
              </h2>
              <Grid items={items} theme={theme} />
            </section>
          );
        })
      )}
    </div>
  );
}

const logo = (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <rect fill="var(--foreground)" height="24" width="24" />
    <path d="M6 6h5v5H6zM13 13h5v5h-5z" fill="var(--background)" />
    <path d="M13 6h5v5h-5zM6 13h5v5H6z" fill="var(--background)" opacity="0.45" />
  </svg>
);

function SearchBox({
  query,
  onChange,
  inputRef,
}: {
  query: string;
  onChange: (value: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const { setOpen, state } = useSidebar();

  if (state === "collapsed") {
    return (
      <button
        aria-label="Search components"
        className="hidden size-8 items-center justify-center rounded-lg outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring md:flex"
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        type="button"
      >
        <SearchIcon aria-hidden="true" className="size-4" />
      </button>
    );
  }

  return (
    <div className="relative">
      <SearchIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        aria-label="Search components"
        className="h-9 w-full rounded-lg border border-sidebar-border bg-background/60 pr-8 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring [&::-webkit-search-cancel-button]:hidden"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") onChange("");
        }}
        placeholder="Search…"
        ref={inputRef}
        type="search"
        value={query}
      />
      {query ? (
        <button
          aria-label="Clear search"
          className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          type="button"
        >
          <XIcon aria-hidden="true" className="size-3.5" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded border border-sidebar-border px-1 font-mono text-[10px] text-muted-foreground md:block">
          /
        </kbd>
      )}
    </div>
  );
}

const themes = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
];

function ThemeSwitch({ theme, onChange }: { theme: string; onChange: (value: string) => void }) {
  const { state } = useSidebar();
  const current = themes.find((item) => item.value === theme) ?? themes[0];

  if (state === "collapsed") {
    const next = themes[(themes.indexOf(current) + 1) % themes.length];
    return (
      <button
        aria-label={`Theme: ${current.label}. Switch to ${next.label}.`}
        className="hidden size-8 items-center justify-center rounded-lg hover:bg-sidebar-accent md:flex"
        onClick={() => onChange(next.value)}
        type="button"
      >
        <current.icon aria-hidden="true" className="size-4" />
      </button>
    );
  }

  return (
    <div aria-label="Theme" className="flex gap-0.5 rounded-lg bg-sidebar-accent/60 p-0.5" role="group">
      {themes.map((item) => (
        <button
          aria-label={item.label}
          aria-pressed={item.value === theme}
          className="flex h-7 flex-1 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-xs"
          key={item.value}
          onClick={() => onChange(item.value)}
          type="button"
        >
          <item.icon aria-hidden="true" className="size-3.5" />
        </button>
      ))}
    </div>
  );
}

function readTheme() {
  const fromUrl = new URLSearchParams(location.search).get("theme");
  if (fromUrl) return fromUrl;
  try {
    return localStorage.getItem("gallery-theme") ?? "system";
  } catch {
    return "system";
  }
}

function useResolvedTheme(theme: string) {
  const [systemDark, setSystemDark] = useState(
    () => matchMedia("(prefers-color-scheme: dark)").matches,
  );
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const resolved = theme === "system" ? (systemDark ? "dark" : "light") : theme;
  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [resolved]);
  return resolved;
}

function Shell({ hash }: { hash: string }) {
  const { isMobile, setOpen, setOpenMobile } = useSidebar();
  const [theme, setTheme] = useState(readTheme);
  const resolved = useResolvedTheme(theme);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const path = hash.replace(/^#\/?/, "");
  const [category, slug, demoName] = path.split("/");
  const selected = entries.find((entry) => entry.id === `${category}/${slug}`);
  const selectedBlock = category === "blocks" ? blocks.find((item) => item.id === slug) : undefined;
  const selectedTemplate = category === "templates" ? templates.find((item) => item.id === slug) : undefined;
  const templateIndex = category === "templates" && !slug;
  const connectPage = category === "connect";
  const categoryId = category && !slug && categories[category] ? category : undefined;

  const results = useMemo(() => searchEntries(query), [query]);
  const blockResults = useMemo(() => searchBlocks(query), [query]);
  const templateResults = useMemo(() => searchTemplates(query), [query]);
  const searching = query.trim().length > 0;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing = target.closest("input, textarea, select, [contenteditable]");
      const shortcut = (event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !typing);
      if (!shortcut) return;
      event.preventDefault();
      if (isMobile) setOpenMobile(true);
      else setOpen(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [isMobile, setOpen, setOpenMobile]);

  useEffect(() => {
    document.getElementById("gallery-main")?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, [hash]);

  const changeTheme = (next: string) => {
    setTheme(next);
    try {
      localStorage.setItem("gallery-theme", next);
    } catch {
      // Storage can be blocked. The choice then lasts until the page closes.
    }
  };

  const renderLink: RenderNavLink = ({ href, onClick, ...props }) => (
    <a
      {...(props as ComponentProps<"a">)}
      href={`#${href}`}
      onClick={(event) => {
        onClick?.(event);
        setOpenMobile(false);
      }}
    />
  );

  const nav = useMemo<GlassNavGroup[]>(() => {
    const templateItems = templateResults.map(({ id, template }) => ({
      title: template.name,
      url: `/templates/${id}`,
      icon: searching ? AppWindowIcon : undefined,
    }));
    const blockItems = blockResults.map(({ id, block }) => ({
      title: block.name,
      url: `/blocks/${id}`,
      icon: searching ? BlocksIcon : undefined,
    }));
    const present = Object.entries(categories)
      .map(([id, info]) => ({
        id,
        info,
        items: results
          .filter((entry) => entry.id.startsWith(`${id}/`))
          .map((entry) => ({ title: entry.meta.name, url: `/${entry.id}` })),
      }))
      .filter((group) => group.items.length > 0);

    if (searching) {
      // Results stay flat so that every match is visible without opening anything.
      return [
        ...(templateItems.length ? [{ label: "Templates", items: templateItems }] : []),
        ...(blockItems.length ? [{ label: "Blocks", items: blockItems }] : []),
        ...present.map((group) => ({
          label: group.info.name,
          items: group.items.map((item) => ({ ...item, icon: categoryIcons[group.id] ?? FolderIcon })),
        })),
      ];
    }

    return [
      { items: [{ title: "All components", url: "/", match: "exact" as const, icon: LayoutGridIcon }] },
      { items: [{ title: "Connect (MCP · llms.txt)", url: "/connect", match: "exact" as const, icon: PlugIcon }] },
      {
        label: "Recipes",
        items: [
          { title: "Templates", url: "/templates", icon: AppWindowIcon, items: templateItems },
          { title: "Blocks", url: "/blocks", icon: BlocksIcon, items: blockItems },
        ],
      },
      {
        label: "Library",
        items: present.map((group) => ({
          title: group.info.name,
          url: `/${group.id}`,
          icon: categoryIcons[group.id] ?? FolderIcon,
          items: group.items,
        })),
      },
    ];
  }, [results, blockResults, templateResults, searching]);

  const crumbs = selected
    ? [
        { label: categories[category]?.name ?? category, href: `#/${category}` },
        { label: selected.meta.name },
      ]
    : selectedTemplate
      ? [{ label: "Templates", href: "#/templates" }, { label: selectedTemplate.template.name }]
      : templateIndex
        ? [{ label: "Templates" }]
        : connectPage
          ? [{ label: "Connect" }]
        : selectedBlock
      ? [{ label: "Blocks" }, { label: selectedBlock.block.name }]
      : categoryId
        ? [{ label: categories[categoryId].name }]
        : [];

  return (
    <>
      <GlassSidebar
        brand={
          <div className="space-y-2">
            <SidebarBrand href="/" logo={logo} name="Components" renderLink={renderLink} />
            <SearchBox inputRef={inputRef} onChange={setQuery} query={query} />
            {searching && (
              <p
                aria-live="polite"
                className="px-1 text-xs text-muted-foreground tabular-nums group-data-[collapsible=icon]:hidden"
              >
                {results.length + blockResults.length + templateResults.length} results
              </p>
            )}
          </div>
        }
        footer={<ThemeSwitch onChange={changeTheme} theme={theme} />}
        nav={nav}
        pathname={`/${path}`}
        renderLink={renderLink}
      />
      <SidebarInset className="min-w-0 bg-background" id="gallery-main">
        <div className="sticky top-0 z-20 flex h-12 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur md:px-8">
          <SidebarTrigger className="-ml-1.5 md:hidden" />
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
            <a className="text-muted-foreground hover:text-foreground" href="#/">
              Components
            </a>
            {crumbs.map((crumb) => (
              <span className="flex min-w-0 items-center gap-1.5" key={crumb.label}>
                <ChevronRightIcon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
                {"href" in crumb && crumb.href ? (
                  <a className="truncate text-muted-foreground hover:text-foreground" href={crumb.href}>
                    {crumb.label}
                  </a>
                ) : (
                  <span aria-current="page" className="truncate font-medium">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        </div>
        {connectPage ? (
          <ConnectView />
        ) : selectedTemplate ? (
          <TemplateView
            id={selectedTemplate.id}
            key={selectedTemplate.id}
            screenId={demoName}
            template={selectedTemplate.template}
            theme={resolved}
          />
        ) : templateIndex ? (
          <div className="mx-auto w-full max-w-6xl space-y-8 p-4 md:p-8">
            <header>
              <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Whole apps to start a project from. Each runs on its own and on sample data.
              </p>
            </header>
            <TemplateGrid items={templateResults} theme={resolved} />
          </div>
        ) : selectedBlock ? (
          <BlockView block={selectedBlock.block} id={selectedBlock.id} key={selectedBlock.id} />
        ) : selected ? (
          <Details entry={selected} demoName={demoName} key={selected.id} />
        ) : (
          <Browse
            categoryId={categoryId}
            query={query}
            results={results}
            templateResults={templateResults}
            theme={resolved}
          />
        )}
      </SidebarInset>
    </>
  );
}

function CopyBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium">{label}</h2>
        <button
          className="inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => {
            void navigator.clipboard?.writeText(text).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
          type="button"
        >
          {copied ? <CheckIcon aria-hidden="true" className="size-3.5" /> : <CopyIcon aria-hidden="true" className="size-3.5" />}
          <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="overflow-x-auto rounded-xl border bg-muted/50 p-4 font-mono text-xs leading-relaxed">{text}</pre>
    </section>
  );
}

/** How to point an agent at this deployment: the MCP endpoint and llms.txt. */
function ConnectView() {
  const origin = location.origin;
  const mcp = `${origin}/mcp`;
  const json = JSON.stringify({ mcpServers: { components: { type: "http", url: mcp } } }, null, 2);
  return (
    <article className="mx-auto w-full max-w-3xl space-y-8 p-4 md:p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Connect an agent</h1>
        <p className="mt-2 text-muted-foreground">
          This gallery serves an MCP server at <code className="font-mono text-sm">{mcp}</code> (Streamable HTTP, no
          auth) and a plain-text index at{" "}
          <a className="font-mono text-sm underline underline-offset-4" href="/llms.txt">
            /llms.txt
          </a>
          .
        </p>
      </header>
      <CopyBlock label="Claude Code" text={`claude mcp add --transport http components ${mcp}`} />
      <CopyBlock label="Cursor, omp and other mcp.json clients" text={json} />
      <CopyBlock label="llms.txt (paste into any agent)" text={`${origin}/llms.txt`} />
      <CopyBlock
        label="Test the endpoint"
        text={`curl -s ${mcp} -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' \\\n  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`}
      />
    </article>
  );
}

function App() {
  const hash = useHash();
  const params = new URLSearchParams(location.search);

  if (params.has("bare")) return <Bare hash={hash} theme={params.get("theme") ?? "light"} />;

  return (
    <GlassSidebarProvider storageKey="gallery-sidebar">
      <Shell hash={hash} />
    </GlassSidebarProvider>
  );
}

/** The route screenshots use: one demo with no gallery around it. */
function Bare({ hash, theme }: { hash: string; theme: string }) {
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  const [category, slug, demoName] = hash.replace(/^#\/?/, "").split("/");
  const demo = entries
    .find((entry) => entry.id === `${category}/${slug}`)
    ?.demos.find((item) => item.name === demoName);
  if (!demo) throw new Error(`Demo not found: ${hash}`);
  return <Stage demo={demo} bare />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
