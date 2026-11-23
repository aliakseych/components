import { useRef, type ReactNode } from "react";
import { gsap, useGsap } from "@/lib/motion";

export type RunEveryChannelProps = {
  eyebrow: string;
  title: string;
  sub: string;
  items: { title: string; body: string; icon: ReactNode }[];
  stats: { value: string; title: string; body: string }[];
};

const tileBg = [
  "linear-gradient(120deg,#5b9dc9 0%,#74b6de 55%,#89cff1 100%)",
  "linear-gradient(120deg,#61a4cb 0%,#7dc0e4 60%,#8fd3f4 100%)",
  "linear-gradient(120deg,#82c9eb 0%,#8fd3f4 50%,#a5e0fb 100%)",
];

/** "Run every channel from one place": six advantages on a navy field with an azure glow, and three gradient stat tiles that straddle a white strip. */
export function RunEveryChannel({ eyebrow, title, sub, items, stats }: RunEveryChannelProps) {
  const ref = useRef<HTMLElement>(null);

  useGsap(ref, () => {
    gsap.from("[data-adv-heading] > *", { y: 24, autoAlpha: 0, duration: 1, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: "[data-adv-heading]", start: "top 80%", once: true } });
    gsap.from("[data-adv-copy]", { y: 16, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: "[data-adv-grid]", start: "top 85%", once: true } });
    gsap.utils.toArray<HTMLElement>("[data-stat-tile]").forEach((tile, i) => {
      gsap.from(tile, { y: 80, autoAlpha: 0, duration: 1, delay: 0.12 * i, ease: "power3.out", scrollTrigger: { trigger: tile, start: "top 88%", once: true } });
    });
  });

  return (
    <section id="advantages" ref={ref} className="relative z-10 overflow-hidden bg-night">
      <div aria-hidden className="glow-azure pointer-events-none absolute -bottom-[400px] -left-[420px] h-[900px] w-[980px]" />
      <div className="container-own relative pt-28">
        <div data-adv-heading className="max-w-[940px]">
          <p className="pb-3 text-base font-medium tracking-[-0.16px] text-sky uppercase">{eyebrow}</p>
          <h2 className="font-display text-[36px] leading-tight tracking-[-0.96px] text-white sm:text-[48px] sm:leading-[56px]">{title}</h2>
          <p className="pt-4 text-xl leading-7 font-light text-white/60">{sub}</p>
        </div>
        <div data-adv-grid className="mt-16 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <article key={it.title} className="relative z-10 flex min-w-0 flex-col gap-6">
              <span className="grid size-16 shrink-0 place-items-center rounded-full bg-sky text-ink">{it.icon}</span>
              <div data-adv-copy>
                <h3 className="font-display text-2xl tracking-[-0.48px] text-white">{it.title}</h3>
                <p className="pt-2 text-lg leading-[25.2px] font-light text-white/60">{it.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="relative mt-20 pb-0">
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[38%] bg-page" />
        <div className="container-own relative grid gap-0 pb-16 lg:grid-cols-3 lg:gap-4">
          {stats.map((s, i) => (
            <div key={s.title} data-stat-tile className="flex min-w-0 flex-col p-8 lg:px-6 xl:p-8" style={{ background: tileBg[i % 3] }}>
              <p className="font-display text-[40px] leading-none text-black">{s.value}</p>
              <h3 className="pt-2 font-display text-2xl tracking-[-0.48px] text-black">{s.title}</h3>
              <p className="pt-2 text-lg font-light text-black/60">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
