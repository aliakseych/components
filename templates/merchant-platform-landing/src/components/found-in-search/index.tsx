import { useRef, type ReactNode } from "react";
import { gsap, useGsap } from "@/lib/motion";

export type FoundInSearchProps = {
  title: string;
  sub: string;
  items: { title: string; body: string; icon: ReactNode }[];
  cardTitle: string;
  cardBody: string;
  diagram: ReactNode;
};

/** Three feature rows beside a diagram card. */
export function FoundInSearch({ title, sub, items, cardTitle, cardBody, diagram }: FoundInSearchProps) {
  const ref = useRef<HTMLElement>(null);
  useGsap(ref, () => {
    gsap.from("[data-feat-heading] > *", { y: 48, autoAlpha: 0, duration: 1, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: "[data-feat-heading]", start: "top 80%", once: true } });
    gsap.from("[data-feat-item]", { y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: "[data-feat-grid]", start: "top 75%", once: true } });
  });
  return (
    <section id="features" ref={ref} className="bg-page py-24 lg:py-28">
      <div className="container-own">
        <div data-feat-heading className="max-w-3xl">
          <h2 className="font-display text-[34px] leading-tight tracking-[-0.88px] text-fg sm:text-[44px] sm:leading-[48.4px]">{title}</h2>
          <p className="pt-4 text-lg leading-7 text-body-gray">{sub}</p>
        </div>
        <div data-feat-grid className="mt-16 grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <ul className="flex flex-col gap-8">
            {items.map((it) => (
              <li key={it.title} data-feat-item>
                <span className="grid size-11 place-items-center rounded-[10px] border border-[#d5d7da] text-fg shadow-[0_1px_2px_rgba(10,13,18,0.05)] dark:border-field-line">{it.icon}</span>
                <h3 className="pt-4 text-base font-semibold text-fg">{it.title}</h3>
                <p className="max-w-md pt-1.5 text-sm leading-5 text-body-gray">{it.body}</p>
              </li>
            ))}
          </ul>
          <div data-feat-item className="rounded-2xl bg-panel p-6 lg:p-10">
            <div className="overflow-hidden rounded-xl bg-white">{diagram}</div>
            <h3 className="pt-6 text-2xl text-fg lg:pt-8">{cardTitle}</h3>
            <p className="pt-2 text-lg leading-7 text-body-gray">{cardBody}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
