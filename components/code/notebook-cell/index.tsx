"use client";

import type { ComponentPropsWithoutRef, CSSProperties, KeyboardEvent, ReactNode } from "react";
import { Fragment, isValidElement, useEffect, useState } from "react";
import { Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NotebookCellLanguage = "python" | "javascript" | "typescript" | "sql" | "text";
export type NotebookCellStatus = "idle" | "running" | "ok" | "error";

export type NotebookCellTableOutput = {
  type: "table";
  columns: string[];
  rows: (string | number)[][];
};

/** Plain text, a table, or any React node. */
export type NotebookCellOutput = ReactNode | NotebookCellTableOutput;

/**
 * Colours for the code tokens and the running state. Each value is any CSS
 * colour; unset keys fall back to theme tokens.
 */
export type NotebookCellColors = {
  keyword?: string;
  string?: string;
  comment?: string;
  number?: string;
  accent?: string;
};

export type NotebookCellProps = Omit<ComponentPropsWithoutRef<"section">, "children"> & {
  /** Source code. Omit for an output-only cell. */
  code?: string;
  /** Selects the highlighter and the badge. Omit for no badge. */
  language?: NotebookCellLanguage;
  /** Shown as [n] in the gutter. Omit to show an empty [ ]. */
  executionCount?: number;
  status?: NotebookCellStatus;
  output?: NotebookCellOutput;
  /** Shown beside the status. */
  durationMs?: number;
  /** Adds a Run button. Ctrl or Cmd + Enter runs from the editor too. */
  onRun?: () => void;
  /** Makes the code editable. Pair with `onCodeChange` to control it. */
  editable?: boolean;
  onCodeChange?: (code: string) => void;
  colors?: NotebookCellColors;
};

type TokenKind = "plain" | "keyword" | "string" | "comment" | "number";
type Segment = { kind: TokenKind; text: string };

type LanguageRule = {
  pattern: RegExp;
  keywords: Set<string>;
  caseInsensitive: boolean;
};

const NEVER = "(?!)";
const DOUBLE_QUOTED = /"(?:\\.|[^"\\])*"/.source;
const SINGLE_QUOTED = /'(?:\\.|[^'\\])*'/.source;
const BACKTICK = /`(?:\\.|[^`\\])*`/.source;

function createRule(
  comment: string,
  string: string,
  keywords: string,
  caseInsensitive = false,
): LanguageRule {
  return {
    pattern: new RegExp(
      `(?<comment>${comment})|(?<string>${string})|(?<number>\\b\\d[\\d_]*(?:\\.\\d+)?\\b)|(?<word>[A-Za-z_]\\w*)`,
      "g",
    ),
    keywords: new Set(
      keywords.split(" ").map((word) => (caseInsensitive ? word.toLowerCase() : word)),
    ),
    caseInsensitive,
  };
}

const JS_KEYWORDS =
  "async await break case catch class const continue default delete do else export extends false finally for function if import in instanceof let new null of return super switch this throw true try typeof undefined var void while yield";

const RULES: Partial<Record<NotebookCellLanguage, LanguageRule>> = {
  python: createRule(
    /#.*/.source,
    `${DOUBLE_QUOTED}|${SINGLE_QUOTED}`,
    "False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield",
  ),
  javascript: createRule(
    /\/\/.*|\/\*[\s\S]*?\*\//.source,
    `${DOUBLE_QUOTED}|${SINGLE_QUOTED}|${BACKTICK}`,
    JS_KEYWORDS,
  ),
  typescript: createRule(
    /\/\/.*|\/\*[\s\S]*?\*\//.source,
    `${DOUBLE_QUOTED}|${SINGLE_QUOTED}|${BACKTICK}`,
    `${JS_KEYWORDS} as implements interface keyof namespace private protected public readonly type enum`,
  ),
  sql: createRule(
    /--.*/.source,
    `'(?:''|[^'])*'|"[^"]*"`,
    "select from where group by order having join left right inner outer on as and or not null is in like between case when then else end insert into values update set delete create table drop alter limit offset distinct union all with desc asc count sum avg min max",
    true,
  ),
};

/** Splits one line into plain and coloured segments. Strings and comments stay within a line. */
function tokenize(line: string, language: NotebookCellLanguage): Segment[] {
  const rule = RULES[language];
  if (!rule) return [{ kind: "plain", text: line }];

  const segments: Segment[] = [];
  let last = 0;
  for (const match of line.matchAll(rule.pattern)) {
    const start = match.index ?? 0;
    const text = match[0];
    if (start > last) segments.push({ kind: "plain", text: line.slice(last, start) });

    const groups = match.groups ?? {};
    let kind: TokenKind = "plain";
    if (groups.comment !== undefined) kind = "comment";
    else if (groups.string !== undefined) kind = "string";
    else if (groups.number !== undefined) kind = "number";
    else if (groups.word !== undefined) {
      const key = rule.caseInsensitive ? text.toLowerCase() : text;
      if (rule.keywords.has(key)) kind = "keyword";
    }

    segments.push({ kind, text });
    last = start + text.length;
  }
  if (last < line.length) segments.push({ kind: "plain", text: line.slice(last) });
  return segments;
}

const statusMeta: Record<NotebookCellStatus, { label: string; dot: string; text: string }> = {
  idle: { label: "Idle", dot: "bg-muted-foreground", text: "text-muted-foreground" },
  running: { label: "Running", dot: "", text: "text-muted-foreground" },
  ok: { label: "OK", dot: "bg-chart-2", text: "text-muted-foreground" },
  error: { label: "Error", dot: "bg-destructive", text: "text-destructive" },
};

function formatDuration(ms: number) {
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(2)} s`;
}

function isTableOutput(output: NotebookCellOutput): output is NotebookCellTableOutput {
  return (
    typeof output === "object" &&
    output !== null &&
    !isValidElement(output) &&
    !Array.isArray(output) &&
    "type" in output &&
    output.type === "table" &&
    "columns" in output
  );
}

function renderOutput(output: NotebookCellOutput) {
  if (isTableOutput(output)) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-xs">
          <thead>
            <tr>
              {output.columns.map((column, columnIndex) => (
                <th
                  key={columnIndex}
                  scope="col"
                  className={cn(
                    "border-b px-2 py-1.5 font-medium text-muted-foreground",
                    output.rows.some((row) => typeof row[columnIndex] === "number")
                      ? "text-right"
                      : "text-left",
                  )}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {output.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b last:border-0">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={cn("px-2 py-1.5", typeof cell === "number" && "text-right tabular-nums")}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (typeof output === "string") {
    return <pre className="font-mono text-xs leading-5 whitespace-pre-wrap break-words">{output}</pre>;
  }

  return <div className="min-w-0">{output}</div>;
}

/** Line-numbered, highlighted code. Shared by the read-only and editable views. */
function CodeLines({ source, language }: { source: string; language: NotebookCellLanguage }) {
  return (
    <pre className="m-0 py-2 pr-4 font-mono text-xs leading-6 whitespace-pre-wrap break-words">
      <code className="block">
        {source.split("\n").map((line, index) => (
          <span key={index} className="flex">
            <span
              aria-hidden="true"
              className="w-10 shrink-0 pr-2 text-right tabular-nums text-muted-foreground select-none"
            >
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">
              {tokenize(line, language).map((segment, segmentIndex) =>
                segment.kind === "plain" ? (
                  <Fragment key={segmentIndex}>{segment.text}</Fragment>
                ) : (
                  <span
                    key={segmentIndex}
                    className={cn(segment.kind === "comment" && "italic")}
                    style={{ color: `var(--nb-${segment.kind})` }}
                  >
                    {segment.text}
                  </span>
                ),
              )}
              {line === "" ? " " : null}
            </span>
          </span>
        ))}
      </code>
    </pre>
  );
}

/**
 * A notebook cell. Every part is optional: the code input with its language
 * badge and highlighting, the execution count and Run button, and the output
 * with status and timing. Colours come from the `colors` prop as CSS custom
 * properties, falling back to the theme's chart tokens.
 */
export function NotebookCell({
  code,
  language,
  executionCount,
  status = "idle",
  output,
  durationMs,
  onRun,
  editable = false,
  onCodeChange,
  colors,
  className,
  style,
  ...props
}: NotebookCellProps) {
  const [draft, setDraft] = useState(code ?? "");
  useEffect(() => {
    setDraft(code ?? "");
  }, [code]);

  const hasInput = editable || code !== undefined;
  const source = editable ? draft : (code ?? "");
  const hasOutput = output !== undefined && output !== null && output !== false && output !== "";
  const showHeader = hasInput || onRun !== undefined || executionCount !== undefined || language !== undefined;
  const showStatus = status !== "idle" || durationMs !== undefined;
  const meta = statusMeta[status];
  const countLabel = status === "running" ? "*" : (executionCount ?? " ");
  const highlightLanguage = language ?? "text";

  const cssVars = {
    "--nb-keyword": colors?.keyword ?? "var(--chart-1)",
    "--nb-string": colors?.string ?? "var(--chart-2)",
    "--nb-comment": colors?.comment ?? "var(--muted-foreground)",
    "--nb-number": colors?.number ?? "var(--chart-3)",
    "--nb-accent": colors?.accent ?? "var(--chart-4)",
  } as CSSProperties;

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey) && onRun && status !== "running") {
      event.preventDefault();
      onRun();
    }
  }

  return (
    <section
      aria-label={executionCount !== undefined ? `Cell ${executionCount}` : "Code cell"}
      className={cn("overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs", className)}
      style={{ ...cssVars, ...style }}
      {...props}
    >
      {showHeader ? (
        <header className="flex items-center gap-2 border-b px-3 py-2">
          <span className="w-10 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
            [{countLabel}]
          </span>
          {language ? (
            <Badge variant="outline" className="font-mono font-normal">
              {language}
            </Badge>
          ) : null}
          <span className="flex-1" />
          {onRun ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRun}
              disabled={status === "running"}
            >
              <Play />
              Run
            </Button>
          ) : null}
        </header>
      ) : null}

      {hasInput ? (
        editable ? (
          <div className="relative focus-within:ring-2 focus-within:ring-ring/50 focus-within:ring-inset">
            <CodeLines source={source} language={highlightLanguage} />
            <textarea
              aria-label="Cell code"
              spellCheck={false}
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                onCodeChange?.(event.target.value);
              }}
              onKeyDown={handleKeyDown}
              style={{ caretColor: "var(--foreground)", tabSize: 4 }}
              className="absolute inset-0 h-full w-full resize-none overflow-hidden bg-transparent py-2 pr-4 pl-10 font-mono text-xs leading-6 break-words text-transparent outline-none"
            />
          </div>
        ) : (
          <CodeLines source={source} language={highlightLanguage} />
        )
      ) : null}

      {hasOutput || showStatus ? (
        <div className={cn("px-3 py-3 text-xs", hasInput && "border-t bg-muted/40")}>
          {showStatus ? (
            <div className={cn("flex items-center justify-between gap-3", hasOutput && "mb-2")}>
              <span aria-live="polite" className={cn("inline-flex items-center gap-1.5", meta.text)}>
                <span
                  aria-hidden="true"
                  className={cn("size-1.5 rounded-full", meta.dot, status === "running" && "motion-safe:animate-pulse")}
                  style={status === "running" ? { backgroundColor: "var(--nb-accent)" } : undefined}
                />
                {meta.label}
              </span>
              {durationMs !== undefined ? (
                <span className="tabular-nums text-muted-foreground">{formatDuration(durationMs)}</span>
              ) : null}
            </div>
          ) : null}
          {hasOutput ? renderOutput(output) : null}
        </div>
      ) : null}
    </section>
  );
}
