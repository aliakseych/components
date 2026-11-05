import { StrictMode, Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentProps, ComponentType, LazyExoticComponent } from "react";
import { createRoot } from "react-dom/client";
import {
  BarChart3Icon,
  BlocksIcon,
  BotIcon,
  BriefcaseIcon,
  CalendarRangeIcon,
  ChevronRightIcon,
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

function Browse({
  categoryId,
  query,
  results,
  theme,
}: {
  categoryId?: string;
  query: string;
  results: Entry[];
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
  const categoryId = category && !slug && categories[category] ? category : undefined;

  const results = useMemo(() => searchEntries(query), [query]);
  const blockResults = useMemo(() => searchBlocks(query), [query]);
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
        ...(blockItems.length ? [{ label: "Blocks", items: blockItems }] : []),
        ...present.map((group) => ({
          label: group.info.name,
          items: group.items.map((item) => ({ ...item, icon: categoryIcons[group.id] ?? FolderIcon })),
        })),
      ];
    }

    return [
      { items: [{ title: "All components", url: "/", match: "exact" as const, icon: LayoutGridIcon }] },
      {
        label: "Recipes",
        items: [{ title: "Blocks", url: "/blocks", icon: BlocksIcon, items: blockItems }],
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
  }, [results, blockResults, searching]);

  const crumbs = selected
    ? [
        { label: categories[category]?.name ?? category, href: `#/${category}` },
        { label: selected.meta.name },
      ]
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
                {results.length + blockResults.length} results
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
        {selectedBlock ? (
          <BlockView block={selectedBlock.block} id={selectedBlock.id} key={selectedBlock.id} />
        ) : selected ? (
          <Details entry={selected} demoName={demoName} key={selected.id} />
        ) : (
          <Browse categoryId={categoryId} query={query} results={results} theme={resolved} />
        )}
      </SidebarInset>
    </>
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
