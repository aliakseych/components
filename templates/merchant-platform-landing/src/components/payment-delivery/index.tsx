import { useRef, type ReactNode } from "react";
import { gsap, useGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type PaymentDeliveryRow = { label: string; title: string; badge?: string; art: ReactNode };
export type PaymentDeliveryProps = { title: string; sub: string; rows: PaymentDeliveryRow[]; logos: ReactNode[] };

/** "Payments and delivery your customers already use": three alternating image/text rows and a pausable partner-logo marquee. */
export function PaymentDelivery({ title, sub, rows, logos }: PaymentDeliveryProps) {
  const ref = useRef<HTMLElement>(null);
  const marquee = useRef<HTMLDivElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);

  useGsap(ref, () => {
    gsap.from("[data-conn-heading] > *", { y: 48, autoAlpha: 0, duration: 1, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: "[data-conn-heading]", start: "top 80%", once: true } });
    gsap.utils.toArray<HTMLElement>("[data-conn-row]").forEach((row) => {
      gsap.from(row.querySelectorAll("[data-conn-cell]"), { y: 56, autoAlpha: 0, duration: 1, stagger: 0.15, ease: "power3.out", scrollTrigger: { trigger: row, start: "top 80%", once: true } });
    });
    tween.current = gsap.to(marquee.current, { xPercent: -50, duration: 28, ease: "none", repeat: -1 });
  });

  return (
    <section id="connections" ref={ref} className="relative z-0 overflow-hidden bg-page py-24 lg:py-32">
      <div data-conn-heading className="container-own text-center">
        <h2 className="mx-auto max-w-3xl font-display text-[34px] leading-tight tracking-[-0.88px] text-fg sm:text-[44px] sm:leading-[48.4px]">{title}</h2>
        <p className="mx-auto max-w-2xl pt-4 text-lg leading-7 text-body-gray">{sub}</p>
      </div>
      <div className="container-own mt-16 flex flex-col gap-16 lg:mt-20 lg:gap-20">
        {rows.map((r, i) => (
          <div key={r.title} data-conn-row className={cn("flex min-w-0 flex-col items-center gap-8 lg:gap-16", i % 2 ? "lg:flex-row-reverse" : "lg:flex-row")}>
            <div data-conn-cell className="flex w-full max-w-[440px] justify-center p-10 lg:w-2/5">
              <div className="w-full max-w-[360px]">{r.art}</div>
            </div>
            <div data-conn-cell className="min-w-0 lg:w-3/5">
              <p className="flex items-center gap-2 text-sm font-medium text-body-gray">
                {r.label}
                {r.badge && (
                  <span className="inline-flex items-center gap-1.5 text-[#6941c6]">
                    <span aria-hidden className="size-1.5 rounded-full bg-current" />
                    {r.badge}
                  </span>
                )}
              </p>
              <h3 className="max-w-xl pt-3 text-[28px] leading-snug tracking-[-0.64px] text-fg sm:text-[32px]">{r.title}</h3>
            </div>
          </div>
        ))}
      </div>
      <div
        className="marquee-mask mt-20"
        onMouseEnter={() => tween.current?.pause()}
        onMouseLeave={() => tween.current?.play()}
      >
        <div ref={marquee} className="flex w-max items-center gap-20">
          {[...logos, ...logos].map((logo, i) => (
            <div key={i} aria-hidden={i >= logos.length} className="h-8 shrink-0 text-fg opacity-60 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0">
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
