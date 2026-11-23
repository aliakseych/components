import { useRef } from "react";
import { PortraitArt } from "@/sample/art";
import { gsap, useGsap } from "@/lib/motion";

export type TestimonialProps = { label: string; quote: string; name: string; role: string };

/** Customer quote; the portrait is revealed with a left-to-right clip wipe, the copy rises in after it. */
export function Testimonial({ label, quote, name, role }: TestimonialProps) {
  const ref = useRef<HTMLElement>(null);
  useGsap(ref, () => {
    gsap.from("[data-quote-img]", { clipPath: "inset(0 100% 0 0)", duration: 1.2, ease: "power3.inOut", scrollTrigger: { trigger: ref.current, start: "top 70%", once: true } });
    gsap.from("[data-quote-copy] > *", { y: 40, autoAlpha: 0, duration: 1, stagger: 0.15, delay: 0.3, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 70%", once: true } });
  });
  return (
    <section ref={ref} className="bg-smoke py-16 lg:py-28">
      <div className="container-own">
        <h2 className="text-base font-medium tracking-[-0.16px] text-sky uppercase">{label}</h2>
        <figure className="mt-8 grid items-center gap-8 lg:mt-12 lg:grid-cols-[320px_1fr] lg:gap-16 lg:px-12">
          <div data-quote-img className="aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-lg lg:max-w-none">
            <PortraitArt className="size-full object-cover" />
          </div>
          <div data-quote-copy>
            <blockquote className="max-w-[620px] font-display text-[26px] leading-snug font-light text-white sm:text-[32px]">“{quote}”</blockquote>
            <figcaption className="pt-8 text-base text-white/60">
              <cite className="font-medium text-white not-italic">{name}</cite>, {role}
            </figcaption>
          </div>
        </figure>
      </div>
    </section>
  );
}
