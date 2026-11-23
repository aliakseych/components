import { useRef, useState } from "react";
import { gsap, useGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type FaqProps = { title: string; openId?: string; items: { id: string; q: string; a: string }[] };

/** Single-open accordion on a deep-blue rounded sheet. Closed panels are inert and animate via grid-template-rows. */
export function Faq({ title, items, openId }: FaqProps) {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<string | null>(openId ?? items[0]?.id ?? null);
  useGsap(ref, () => {
    gsap.from("[data-faq-copy]", { y: 48, autoAlpha: 0, duration: 1, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 78%", once: true } });
  });
  return (
    <section id="faq" ref={ref} className="scroll-mt-24 bg-page">
      <div className="rounded-t-[48px] bg-deep px-6 pt-16 pb-24 md:px-[90px]">
        <div className="mx-auto max-w-[720px]">
          <h2 data-faq-copy className="font-display text-[40px] tracking-[-1.12px] text-white sm:text-[56px] sm:leading-[60.5px]">{title}</h2>
          <div data-faq-copy className="mt-10">
            {items.map((it) => {
              const isOpen = open === it.id;
              return (
                <div key={it.id} className="border-b border-white/15">
                  <h3>
                    <button
                      type="button"
                      id={`faq-btn-${it.id}`}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${it.id}`}
                      onClick={() => setOpen(isOpen ? null : it.id)}
                      className="flex w-full items-center justify-between gap-6 py-7 text-left text-xl font-semibold text-white outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    >
                      <span>{it.q}</span>
                      <span aria-hidden className="relative grid size-10 shrink-0 place-items-center rounded-full bg-white text-deep">
                        <span className="absolute h-[1.5px] w-4 bg-current" />
                        <span className={cn("absolute h-4 w-[1.5px] bg-current transition-transform duration-300", isOpen ? "scale-y-0" : "scale-y-100")} />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`faq-panel-${it.id}`}
                    role="region"
                    aria-labelledby={`faq-btn-${it.id}`}
                    inert={!isOpen}
                    className={cn("grid transition-[grid-template-rows,opacity] duration-500 ease-in-out motion-reduce:transition-none", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-7 text-lg leading-7 text-white/80">{it.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
