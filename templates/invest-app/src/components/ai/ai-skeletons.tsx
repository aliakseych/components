import { Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/viz/glass-card";

// Loading placeholders shaped like the finished AI blocks.

function Lines({ widths }: { widths: string[] }) {
  return <div className="space-y-2">{widths.map((w, i) => <Skeleton key={i} className="h-3.5 rounded-full" style={{ width: w }} />)}</div>;
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="flex items-center gap-2 text-lg font-semibold"><Sparkles className="size-5" /> {children}</h2>;
}

export function InsightsSkeleton() {
  return (
    <GlassCard aria-busy className="rise space-y-4 bg-accent/40">
      <div className="flex items-center justify-between gap-2"><Heading>ИИ-аналитика</Heading><Skeleton className="h-9 w-32 rounded-full" /></div>
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2 pt-1"><Skeleton className="h-4 w-1/2 rounded-full" /><Lines widths={["100%", "80%"]} /></div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export function DealAiSkeleton() {
  return (
    <GlassCard aria-busy className="rise space-y-4 bg-accent/40">
      <Heading>Мнение ИИ</Heading>
      <Lines widths={["100%", "95%", "70%"]} />
      <Skeleton className="h-8 w-36 rounded-full" />
      <div className="grid grid-cols-2 gap-2">
        {[0, 1].map((col) => <div key={col} className="space-y-2">{[0, 1].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>)}
      </div>
      <div className="flex justify-end"><Skeleton className="h-9 w-32 rounded-full" /></div>
    </GlassCard>
  );
}

/** Assistant answer in progress: bubble with shimmering lines, optionally a chart placeholder. */
export function AnswerSkeleton({ chart = true }: { chart?: boolean }) {
  return (
    <div aria-busy aria-label="ИИ печатает ответ" className="rise space-y-2">
      <div className="flex items-end gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground"><Sparkles className="size-4" /></span>
        <div className="flex-1 space-y-3 rounded-[20px] rounded-bl-md bg-card px-4 py-3">
          <span className="flex gap-1">{[0, 150, 300].map((d) => <span key={d} className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: `${d}ms` }} />)}</span>
          <Lines widths={["92%", "100%", "64%"]} />
        </div>
      </div>
      {chart && <div className="ml-10 rounded-[24px] bg-card p-4"><Skeleton className="mb-3 h-4 w-1/3 rounded-full" /><div className="flex h-40 items-end gap-2">{[45, 70, 55, 90, 65].map((h, i) => <Skeleton key={i} className="flex-1 rounded-t-md rounded-b-none" style={{ height: `${h}%` }} />)}</div></div>}
    </div>
  );
}
