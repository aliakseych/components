import { useId, useState } from "react";
import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { ChevronRight, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type NoteNotebook = {
  name: string;
  documents: string[];
};

export type NoteBlock = {
  type: "heading" | "paragraph" | "list" | "quote" | "code";
  /** Heading depth, 1 to 3. Only used for headings. */
  level?: 1 | 2 | 3;
  text: string;
  /** Items for a list block. */
  items?: string[];
};

export type NoteSelection = {
  notebook: string;
  document: string;
};

/** Colour roles. Each is any CSS colour and defaults to a theme token. */
export type NoteOutlineColors = {
  /** Background of the open document in the tree. Default `var(--accent)`. */
  accent?: string;
  /** Document panel surface. Default `var(--card)`. */
  surface?: string;
  /** Code block background. Default `var(--muted)`. */
  code?: string;
  /** Secondary text. Default `var(--muted-foreground)`. */
  muted?: string;
};

export type NoteOutlineProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  notebooks: NoteNotebook[];
  /** The open document. Its title is `selected.document`. */
  selected: NoteSelection;
  /** The document body. The outline is built from its heading blocks. */
  blocks: NoteBlock[];
  onSelect?: (selection: NoteSelection) => void;
  colors?: NoteOutlineColors;
};

function themeStyle(colors: NoteOutlineColors | undefined): CSSProperties {
  return {
    "--note-outline-accent": colors?.accent ?? "var(--accent)",
    "--note-outline-surface": colors?.surface ?? "var(--card)",
    "--note-outline-code": colors?.code ?? "var(--muted)",
    "--note-outline-muted": colors?.muted ?? "var(--muted-foreground)",
  } as CSSProperties;
}

const headingTag = { 1: "h2", 2: "h3", 3: "h4" } as const;
const headingClass = {
  1: "scroll-mt-4 text-xl font-semibold tracking-tight",
  2: "scroll-mt-4 text-lg font-semibold",
  3: "scroll-mt-4 text-base font-semibold",
} as const;

type OutlineItem = { id: string; text: string; level: 1 | 2 | 3 };

function NotebookTree({
  label,
  notebooks,
  selected,
  onSelect,
}: {
  label: string;
  notebooks: NoteNotebook[];
  selected: NoteSelection;
  onSelect?: (selection: NoteSelection) => void;
}) {
  return (
    <nav aria-label={label}>
      <ul className="grid gap-4">
        {notebooks.map((notebook) => (
          <li key={notebook.name}>
            <p className="px-2 pb-1 text-xs font-semibold text-foreground">{notebook.name}</p>
            <ul className="grid gap-0.5">
              {notebook.documents.map((document) => {
                const isSelected =
                  notebook.name === selected.notebook && document === selected.document;
                return (
                  <li key={document}>
                    <button
                      type="button"
                      aria-current={isSelected ? "page" : undefined}
                      onClick={() => onSelect?.({ notebook: notebook.name, document })}
                      className={cn(
                        "w-full truncate rounded-md px-2 py-1.5 text-left text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                        isSelected
                          ? "bg-(--note-outline-accent) font-medium text-foreground"
                          : "text-(--note-outline-muted) hover:bg-accent/60 hover:text-foreground",
                      )}
                    >
                      {document}
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * A notebook tree, a document with breadcrumb and blocks, and an outline
 * built from the heading blocks. Outline entries scroll their heading into
 * view. On small screens the tree opens in a sheet and the outline folds
 * into a disclosure above the document.
 */
export function NoteOutline({
  notebooks,
  selected,
  blocks,
  onSelect,
  colors,
  className,
  style,
  ...props
}: NoteOutlineProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [sheetOpen, setSheetOpen] = useState(false);

  const outline: OutlineItem[] = blocks.flatMap((block, index) =>
    block.type === "heading"
      ? [{ id: `${uid}-heading-${index}`, text: block.text, level: block.level ?? 1 }]
      : [],
  );

  function jumpTo(id: string) {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    document
      .getElementById(id)
      ?.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
  }

  const outlineList = outline.length ? (
    <ul className="grid gap-0.5">
      {outline.map((item) => (
        <li key={item.id} style={{ paddingLeft: `${(item.level - 1) * 0.75}rem` }}>
          <button
            type="button"
            onClick={() => jumpTo(item.id)}
            className="w-full truncate rounded px-2 py-1 text-left text-xs text-(--note-outline-muted) outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {item.text}
          </button>
        </li>
      ))}
    </ul>
  ) : (
    <p className="px-2 text-xs text-(--note-outline-muted)">No headings.</p>
  );

  return (
    <div
      className={cn(
        "grid gap-4 md:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[200px_minmax(0,1fr)_200px]",
        className,
      )}
      style={{ ...themeStyle(colors), ...style }}
      {...props}
    >
      <aside aria-label="Notebooks" className="hidden min-w-0 md:block">
        <NotebookTree label="Notebooks" notebooks={notebooks} selected={selected} onSelect={onSelect} />
      </aside>

      <div className="min-w-0">
        <div className="mb-3 md:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <PanelLeft aria-hidden="true" />
                Notebooks
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Notebooks</SheetTitle>
                <SheetDescription>Choose a document to open.</SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-4">
                <NotebookTree
                  label="Notebooks"
                  notebooks={notebooks}
                  selected={selected}
                  onSelect={(next) => {
                    setSheetOpen(false);
                    onSelect?.(next);
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <article aria-labelledby={`${uid}-title`} className="min-w-0 rounded-xl border bg-(--note-outline-surface)">
          <div className="border-b px-5 py-3">
            <nav aria-label="Breadcrumb">
              <ol className="flex min-w-0 items-center gap-1.5 text-xs text-(--note-outline-muted)">
                <li className="truncate">{selected.notebook}</li>
                <ChevronRight aria-hidden="true" className="size-3.5 shrink-0" />
                <li aria-current="page" className="truncate text-foreground">
                  {selected.document}
                </li>
              </ol>
            </nav>
          </div>
          <div className="max-h-[560px] overflow-y-auto px-5 py-6">
            <details className="mb-5 rounded-lg border p-3 xl:hidden">
              <summary className="cursor-pointer text-sm font-medium">On this page</summary>
              <div className="mt-2">{outlineList}</div>
            </details>
            <h1 id={`${uid}-title`} className="text-2xl font-semibold tracking-tight">
              {selected.document}
            </h1>
            <div className="mt-6 grid gap-4">
              {blocks.map((block, index) => {
                const key = `${uid}-block-${index}`;
                switch (block.type) {
                  case "heading": {
                    const level = block.level ?? 1;
                    const Tag = headingTag[level];
                    return (
                      <Tag key={key} id={`${uid}-heading-${index}`} className={headingClass[level]}>
                        {block.text}
                      </Tag>
                    );
                  }
                  case "paragraph":
                    return (
                      <p key={key} className="text-sm leading-7">
                        {block.text}
                      </p>
                    );
                  case "list":
                    return (
                      <ul key={key} className="grid list-disc gap-1 pl-5 text-sm leading-6">
                        {(block.items ?? []).map((item, itemIndex) => (
                          <li key={itemIndex}>{item}</li>
                        ))}
                      </ul>
                    );
                  case "quote":
                    return (
                      <blockquote
                        key={key}
                        className="border-l-2 pl-4 text-sm italic text-(--note-outline-muted)"
                      >
                        {block.text}
                      </blockquote>
                    );
                  case "code":
                    return (
                      <pre key={key} className="overflow-x-auto rounded-lg bg-(--note-outline-code) p-3 font-mono text-xs leading-5">
                        <code>{block.text}</code>
                      </pre>
                    );
                }
              })}
            </div>
          </div>
        </article>
      </div>

      <nav aria-label="Outline" className="hidden min-w-0 xl:block">
        <p className="px-2 pb-2 text-xs font-semibold">On this page</p>
        {outlineList}
      </nav>
    </div>
  );
}
