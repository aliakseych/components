import { useEffect, useRef, useState, type ReactNode } from "react";
import { features } from "@/sample/content";
import { cn } from "@/lib/utils";
import { Container, GradientFrame, type Gradient } from "./ui";

const tones = {
  blue: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-400/30",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/30",
  amber: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/30",
  rose: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-400/30",
  neutral: "bg-white text-olive-700 ring-olive-200 dark:bg-white/5 dark:text-olive-300 dark:ring-white/15",
} as const;
type Tone = keyof typeof tones;

const marks = {
  amber: "bg-amber-100 text-amber-900 dark:bg-amber-400/20 dark:text-amber-200",
  emerald: "bg-emerald-100 text-emerald-900 dark:bg-emerald-400/20 dark:text-emerald-200",
  rose: "bg-rose-100 text-rose-900 dark:bg-rose-400/20 dark:text-rose-200",
};
const bars = { amber: "bg-amber-400", emerald: "bg-emerald-400", rose: "bg-rose-400" };

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div aria-hidden="true" className="h-full w-full overflow-hidden bg-panel text-olive-950 select-none dark:text-olive-100">
      <div className={cn("p-6", className)}>{children}</div>
    </div>
  );
}

function TimelineMock() {
  const t = features.timeline;
  return (
    <Panel>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium">{t.title}</p>
        <span className={cn("rounded-full px-2 py-0.5 text-[9px] whitespace-nowrap ring-1", tones.blue)}>{t.next}</span>
      </div>
      <div className="mt-6 grid grid-cols-6 text-center text-[9px] tracking-wide uppercase">
        {t.months.map((m, i) => (
          <div key={m} className={cn("flex flex-col items-center gap-1", i === t.active ? "font-medium text-blue-600 dark:text-blue-300" : "text-olive-500")}>
            {m}
            <span className={cn("h-[3px] w-6 rounded-full", i === t.active ? "bg-blue-500" : "bg-transparent")} />
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {t.chips.map((c) => (
          <div key={c.label} className="grid grid-cols-6 gap-1">
            <span
              style={{ gridColumn: `${c.start + 1} / span ${c.span}` }}
              className={cn("truncate rounded-md px-2 py-1.5 text-[9px] font-medium ring-1", tones[c.tone as Tone])}
            >
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ScholarshipMock() {
  const s = features.scholarships;
  return (
    <Panel>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium">{s.title}</p>
        <span className="text-[9px] text-olive-500">{s.count}</span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {s.items.map((it) => (
          <div key={it.name} className="rounded-lg border border-panel-line p-3">
            <div className="flex items-start justify-between">
              <span className={cn("flex size-6 items-center justify-center rounded-full text-[9px] font-semibold ring-1", tones[it.tone as Tone])}>{it.letter}</span>
              <span className={cn("rounded-sm px-1.5 py-0.5 text-[8px] font-medium", tones[it.tone as Tone])}>{it.match}</span>
            </div>
            <p className="mt-3 truncate text-[11px] font-medium">{it.name}</p>
            <p className="mt-1 flex justify-between text-[10px]">
              <span className="font-semibold">{it.amount}</span>
              <span className="text-olive-500">{it.date}</span>
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function EssayMock() {
  const e = features.essay;
  return (
    <Panel className="grid grid-cols-[1fr_140px] gap-5">
      <article className="flex flex-col gap-3 text-[11px] leading-[1.6]">
        {e.paragraphs.map((p, i) => (
          <p key={i}>
            {p.map((seg, j) =>
              seg.mark ? (
                <mark key={j} className={cn("rounded-sm px-0.5", marks[seg.mark as keyof typeof marks])}>
                  {seg.text}
                </mark>
              ) : (
                <span key={j}>{seg.text}</span>
              ),
            )}
          </p>
        ))}
      </article>
      <aside className="flex flex-col gap-2">
        {e.comments.map((c) => (
          <div key={c.text} className="rounded-sm border border-panel-line p-2 text-[9px] leading-[1.6] text-olive-700 dark:text-olive-300">
            <span className={cn("mb-1.5 block h-1 w-6 rounded-full", bars[c.tone as keyof typeof bars])} />
            {c.text}
          </div>
        ))}
      </aside>
    </Panel>
  );
}

function AdmittedMock() {
  const a = features.admitted;
  return (
    <Panel>
      <div className="flex items-center gap-2 text-[9px]">
        <span className={cn("rounded-sm px-1.5 py-0.5 font-medium", tones.emerald)}>{a.tag}</span>
        <span className="text-olive-500">{a.school}</span>
      </div>
      <p className="mt-2 text-xs font-medium">{a.title}</p>
      {a.paragraphs.map((p) => (
        <p key={p} className="mt-2 text-[10px] leading-[1.7] text-olive-800 dark:text-olive-300">
          {p}
        </p>
      ))}
      <p className="mt-3 border-t border-panel-line pt-2 text-[9px] text-olive-500">{a.footer}</p>
    </Panel>
  );
}

function RewriteMock() {
  const r = features.rewrite;
  return (
    <Panel className="grid grid-cols-2 gap-0">
      <div className="pr-6">
        <p className="text-[9px] text-olive-500">Original</p>
        <p className="mt-2 text-[11px] leading-[1.7]">
          {r.original.map((s, i) => (
            <span key={i} className={s.cut ? "text-rose-600 line-through decoration-rose-400 dark:text-rose-300" : undefined}>
              {s.text}
            </span>
          ))}
        </p>
      </div>
      <div className="min-h-40 border-l border-panel-line pl-6">
        <p className="text-[9px] text-emerald-700 dark:text-emerald-300">Rewrite in your voice</p>
        <p className="mt-2 text-[11px] leading-[1.7]">
          {r.revised.map((s, i) => (
            <span key={i} className={s.add ? "rounded-sm bg-emerald-50 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200" : undefined}>
              {s.text}
            </span>
          ))}
        </p>
        <div className="mt-4 flex gap-1.5 text-[9px]">
          <span className="rounded-sm bg-olive-950 px-2 py-1 text-white dark:bg-white dark:text-olive-950">{r.keep}</span>
          <span className="rounded-sm border border-panel-line px-2 py-1 text-olive-700 dark:text-olive-300">{r.retry}</span>
        </div>
      </div>
    </Panel>
  );
}

/** Completion ring: fills from 0 once scrolled into view (instant under reduced motion via CSS). */
function FinalReadMock() {
  const f = features.finalRead;
  const ring = useRef<SVGSVGElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ring.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const c = 2 * Math.PI * 28;
  return (
    <Panel>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium">{f.title}</p>
          <p className="mt-0.5 text-[8px] tracking-wide text-olive-500 uppercase">{f.subtitle}</p>
        </div>
        <div className="relative size-16">
          <svg ref={ring} viewBox="0 0 64 64" className="size-16 -rotate-90">
            <circle cx="32" cy="32" r="28" fill="none" strokeWidth="6" className="stroke-olive-950/10 dark:stroke-white/10" />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={seen ? c * (1 - f.done / f.total) : c}
              className="stroke-emerald-500 transition-[stroke-dashoffset] duration-700"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold">
            {f.done}/{f.total}
          </span>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-2">
        {f.rows.map((r) => (
          <div key={r.name} className="flex items-center gap-2 text-[9px]">
            <span className={cn("h-1 shrink-0 rounded-full", r.ready ? "w-[45%] bg-emerald-500" : "w-[40%] bg-amber-400")} />
            <span className="min-w-0 flex-1 truncate">{r.name}</span>
            <span className="text-olive-500">{r.school}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

const cards: { gradient: Gradient; Mock: () => ReactNode }[] = [
  { gradient: "purple", Mock: TimelineMock },
  { gradient: "brown", Mock: ScholarshipMock },
  { gradient: "blue", Mock: EssayMock },
  { gradient: "green", Mock: AdmittedMock },
  { gradient: "brown", Mock: RewriteMock },
  { gradient: "green", Mock: FinalReadMock },
];

export function Features() {
  return (
    <section id="features" className="py-16">
      <Container className="flex flex-col gap-10 sm:gap-16">
        <div className="flex max-w-2xl flex-col gap-6">
          <h2 className="font-serif text-[2rem] leading-[1.1] tracking-tight text-pretty text-olive-950 sm:text-5xl sm:leading-[1.1] dark:text-white">
            {features.title[0]}
            <br />
            {features.title[1]}
          </h2>
          <div className="text-base/7 text-olive-700 dark:text-olive-400">
            <p>{features.body}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
          {cards.map(({ gradient, Mock }, i) => (
            <div key={i} className="rounded-2xl bg-olive-950/[0.025] p-2 dark:bg-white/5">
              <div className="overflow-hidden rounded-xl">
                <GradientFrame gradient={gradient} inset="corner" className="aspect-[4/3]">
                  <Mock />
                </GradientFrame>
              </div>
              <div className="p-6 sm:p-10 lg:p-6">
                <h3 className="text-base/8 text-olive-950 dark:text-white">{features.cards[i].title}</h3>
                <p className="mt-2 text-sm/7 text-olive-700 dark:text-olive-400">{features.cards[i].body}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
