import { useRef } from "react";
import { gsap, useGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type CompareProps = {
  title: string;
  sub: string;
  closer: string;
  columns: Record<"physical" | "marketplace" | "own", { name: string; verdict: string; badge?: string }>;
  rows: { label: string; physical: string; marketplace: string; own: string }[];
};

/** Three-way channel comparison: a table from lg, stacked cards below. */
export function Compare({ title, sub, closer, columns, rows }: CompareProps) {
  const ref = useRef<HTMLElement>(null);
  useGsap(ref, () => {
    gsap.from("[data-cmp-heading] > *", { y: 48, autoAlpha: 0, duration: 1, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: "[data-cmp-heading]", start: "top 80%", once: true } });
    gsap.from("[data-cmp-body]", { y: 48, autoAlpha: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: "[data-cmp-body]", start: "top 82%", once: true } });
  });
  const order = ["physical", "marketplace", "own"] as const;
  return (
    <section id="compare" ref={ref} tabIndex={-1} className="scroll-mt-24 bg-page pt-8 pb-28 outline-none lg:pb-32">
      <div className="container-own">
        <div data-cmp-heading className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[34px] leading-tight tracking-[-0.88px] text-fg sm:text-[44px] sm:leading-[48.4px]">{title}</h2>
          <p className="pt-4 text-lg leading-7 text-fg/80">{sub}</p>
        </div>
        <div data-cmp-body className="mt-16">
          <div className="hidden overflow-hidden rounded-2xl border border-line shadow-[0_12px_40px_rgba(16,24,40,0.08)] lg:block">
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr>
                  <th scope="col" className="w-[22%] bg-page p-6"><span className="sr-only">Criteria</span></th>
                  {order.map((k) => (
                    <th key={k} scope="col" className={cn("p-6 align-top", k === "own" ? "bg-deep text-white" : "bg-page text-fg")}>
                      <span className="flex items-center gap-3 text-lg font-semibold">
                        {columns[k].name}
                        {columns[k].badge && <span className="rounded-full border border-white/60 px-2.5 py-0.5 text-xs font-medium">{columns[k].badge}</span>}
                      </span>
                      <span className={cn("block pt-1 text-sm font-normal", k === "own" ? "text-white/80" : "text-body-gray")}>{columns[k].verdict}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.label} className={i % 2 ? "bg-page" : "bg-mist"}>
                    <th scope="row" className={cn("px-6 py-4 text-sm font-semibold text-fg", i < rows.length - 1 && "border-b border-line")}>{r.label}</th>
                    {order.map((k) => (
                      <td key={k} className={cn("px-6 py-4 text-sm", i < rows.length - 1 && "border-b border-line", k === "own" ? "border-b-white/10 bg-deep font-medium text-white" : "text-body-gray")}>{r[k]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-4 lg:hidden">
            {(["own", "marketplace", "physical"] as const).map((k) => (
              <article key={k} className={cn("rounded-2xl border p-5", k === "own" ? "border-deep bg-deep text-white" : "border-line bg-page text-fg")}>
                <h3 className="flex items-center gap-3 text-lg font-semibold">
                  {columns[k].name}
                  {columns[k].badge && <span className="rounded-full border border-white/60 px-2.5 py-0.5 text-xs font-medium">{columns[k].badge}</span>}
                </h3>
                <p className={cn("pt-1 text-sm", k === "own" ? "text-white/80" : "text-body-gray")}>{columns[k].verdict}</p>
                <dl className="mt-3 flex flex-col gap-0">
                  {rows.map((r) => (
                    <div key={r.label} className={cn("flex items-baseline justify-between gap-4 border-t py-3.5", k === "own" ? "border-white/20" : "border-line")}>
                      <dt className={cn("text-xs font-medium", k === "own" ? "text-white/70" : "text-body-gray")}>{r.label}</dt>
                      <dd className="text-right text-sm font-medium">{r[k]}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </div>
        <p data-cmp-body className="pt-8 text-center text-lg text-fg/80">{closer}</p>
      </div>
    </section>
  );
}
