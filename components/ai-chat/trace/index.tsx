import type { ComponentProps, CSSProperties, ReactNode } from "react";
import * as UI from "@/components/ui/trace";
import { cn } from "@/lib/utils";

export * from "@/components/ui/trace";

export function Trace({ className, ...props }: ComponentProps<typeof UI.Trace>) {
  return <UI.Trace className={cn("gap-2.5", className)} {...props} />;
}

export function TraceLine({ className, ...props }: ComponentProps<typeof UI.TraceLine>) {
  return <UI.TraceLine className={cn("data-[status=running]:text-foreground", className)} {...props} />;
}

export function TraceTitle({ className, ...props }: ComponentProps<typeof UI.TraceTitle>) {
  return <UI.TraceTitle className={cn("font-medium", className)} {...props} />;
}

export function TraceDescription({ className, ...props }: ComponentProps<typeof UI.TraceDescription>) {
  return <UI.TraceDescription className={cn("text-xs font-normal text-muted-foreground", className)} {...props} />;
}

export function TraceCollapsibleContent({ className, ...props }: ComponentProps<typeof UI.TraceCollapsibleContent>) {
  return <UI.TraceCollapsibleContent className={cn("text-sm", className)} {...props} />;
}

export type ToolTimelineStatus = "running" | "done" | "error";

export type ToolTimelineItem = {
  id: string;
  title: string;
  tool?: string;
  icon?: ReactNode;
  status?: ToolTimelineStatus;
  /** Call arguments, shown on hover or focus. */
  args?: string;
  /** Result snippet, shown on hover or focus. */
  result?: string;
};

export type ToolTimelineColors = Partial<{
  line: string;
  node: string;
  accent: string;
  running: string;
  done: string;
  error: string;
}>;

export type ToolTimelineProps = Omit<ComponentProps<"ol">, "children"> & {
  items: ToolTimelineItem[];
  /** Any CSS colour. Unset keys fall back to theme tokens. */
  colors?: ToolTimelineColors;
};

const STATUS_LABEL: Record<ToolTimelineStatus, string> = {
  running: "Running",
  done: "Done",
  error: "Failed",
};

/**
 * Vertical timeline of tool calls. One continuous line runs through every item,
 * each card leans slightly, and hover or focus straightens, lifts and reveals details.
 */
export function ToolTimeline({ items, colors, className, style, ...props }: ToolTimelineProps) {
  const vars = {
    "--trace-line": colors?.line ?? "var(--border)",
    "--trace-node": colors?.node ?? "var(--muted-foreground)",
    "--trace-accent": colors?.accent ?? "var(--primary)",
    "--trace-running": colors?.running ?? "var(--chart-1)",
    "--trace-done": colors?.done ?? "var(--chart-2)",
    "--trace-error": colors?.error ?? "var(--destructive)",
  } as CSSProperties;

  return (
    <ol
      data-slot="tool-timeline"
      className={cn("relative flex w-full min-w-0 flex-col gap-3", className)}
      style={{ ...vars, ...style }}
      {...props}
    >
      <span aria-hidden="true" className="pointer-events-none absolute top-0 bottom-0 left-[11.5px] w-px bg-[var(--trace-line)]" />
      {items.map((item, index) => {
        const status = item.status ?? "done";
        return (
          <li key={item.id} data-status={status} className="group/item relative min-w-0 pl-9">
            <span
              aria-hidden="true"
              data-status={status}
              className="absolute top-2.5 left-0 flex size-6 items-center justify-center rounded-full border border-[var(--trace-node)] bg-card text-muted-foreground transition-[box-shadow,border-color] duration-200 ease-out motion-reduce:transition-none group-hover/item:shadow-[0_0_0_4px_color-mix(in_oklab,var(--trace-accent)_24%,transparent)] group-focus-within/item:shadow-[0_0_0_4px_color-mix(in_oklab,var(--trace-accent)_24%,transparent)] data-[status=done]:border-[var(--trace-done)] data-[status=done]:text-[var(--trace-done)] data-[status=error]:border-[var(--trace-error)] data-[status=error]:text-[var(--trace-error)] data-[status=running]:border-[var(--trace-running)] data-[status=running]:text-[var(--trace-running)] [&_svg]:size-3.5"
            >
              {status === "running" && (
                <span className="absolute inset-0 animate-ping rounded-full bg-[var(--trace-running)] opacity-40 motion-reduce:animate-none" />
              )}
              <span className="relative flex items-center justify-center">
                {item.icon ?? <span className="size-1.5 rounded-full bg-current" />}
              </span>
            </span>

            <div
              tabIndex={0}
              style={{ "--trace-tilt": index % 2 === 0 ? "-1.5deg" : "1.5deg" } as CSSProperties}
              className="relative min-w-0 rounded-xl border bg-card px-3 py-2.5 shadow-sm outline-none transition-[rotate,translate,box-shadow] duration-200 ease-out motion-reduce:transition-none focus-visible:ring-3 focus-visible:ring-ring/50 [rotate:var(--trace-tilt)] group-hover/item:-translate-y-0.5 group-hover/item:shadow-lg group-hover/item:[rotate:0deg] group-focus-within/item:-translate-y-0.5 group-focus-within/item:shadow-lg group-focus-within/item:[rotate:0deg]"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className={cn("min-w-0 text-sm font-medium break-words", status === "error" && "text-destructive")}>
                  {item.title}
                  <span className="sr-only"> ({STATUS_LABEL[status]})</span>
                </span>
                {item.tool && <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">{item.tool}</span>}
              </div>

              {(item.args || item.result) && (
                <div className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none group-hover/item:grid-rows-[1fr] group-hover/item:opacity-100 group-focus-within/item:grid-rows-[1fr] group-focus-within/item:opacity-100">
                  <div className="min-h-0 overflow-hidden">
                    <div className="mt-2 flex flex-col gap-1.5">
                      {item.args && (
                        <code className="block rounded-md bg-muted px-2.5 py-1.5 font-mono text-xs break-all text-muted-foreground">{item.args}</code>
                      )}
                      {item.result && (
                        <code className="block rounded-md bg-muted px-2.5 py-1.5 font-mono text-xs break-all text-muted-foreground">{item.result}</code>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
