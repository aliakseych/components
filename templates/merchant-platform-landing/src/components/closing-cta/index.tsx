import { useRef, useState, type FormEvent } from "react";
import { gsap, prefersReducedMotion, useGsap } from "@/lib/motion";

export type ClosingCtaProps = {
  title: string;
  sub: string;
  company: string;
  phone: string;
  phonePlaceholder: string;
  submit: string;
  note: string;
  privacy: string;
  privacyLink: string;
  thanks: string;
};

const field = "mt-2 w-full rounded-xl border border-field-line bg-field px-4 py-3.5 text-[15px] text-fg outline-none transition-colors placeholder:text-body-gray/70 focus-visible:border-deep focus-visible:ring-2 focus-visible:ring-deep/30 dark:focus-visible:border-sky dark:focus-visible:ring-sky/30";

/** Closing lead form (company + phone) over a pulsing blue glow. Submit is local-only: wire it to your backend. */
export function ClosingCta(p: ClosingCtaProps) {
  const ref = useRef<HTMLElement>(null);
  const [sent, setSent] = useState(false);

  useGsap(ref, () => {
    gsap.from("[data-cta] > *", { y: 48, autoAlpha: 0, duration: 1, stagger: 0.14, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 72%", once: true } });
    if (!prefersReducedMotion()) gsap.fromTo("[data-cta-glow]", { opacity: 0.3, scale: 1 }, { opacity: 0.5, scale: 1.15, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 });
  });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (new FormData(e.currentTarget).get("website")) return;
    setSent(true);
  };

  return (
    <section id="cta" ref={ref} className="relative overflow-hidden bg-gradient-to-b from-[#0b0b0c] to-[#020203] py-16 md:py-24 lg:py-28">
      <div
        data-cta-glow
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 opacity-30"
        style={{ background: "radial-gradient(ellipse, rgba(27,88,133,0.5) 0%, transparent 70%)", filter: "blur(70px)" }}
      />
      <div data-cta className="container-own relative grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:gap-20">
        <div>
          <h2 className="max-w-xl font-display text-[34px] leading-tight tracking-[-0.88px] text-white sm:text-[44px] sm:leading-[48.4px]">{p.title}</h2>
          <p className="mt-5 max-w-xl text-lg font-light text-white/80 sm:text-xl">{p.sub}</p>
        </div>
        <form onSubmit={onSubmit} className="rounded-[24px] bg-page p-6 shadow-xl sm:p-8 dark:border dark:border-line">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
          <label className="block text-sm font-medium text-fg">
            {p.company}
            <input name="company" required autoComplete="organization" className={field} />
          </label>
          <label className="mt-5 block text-sm font-medium text-fg">
            {p.phone}
            <input name="phone" type="tel" required autoComplete="tel" placeholder={p.phonePlaceholder} className={field} />
          </label>
          <button type="submit" className="mt-6 w-full rounded-xl bg-[#09090b] px-6 py-4 text-[16px] font-medium text-white transition-[scale] duration-300 outline-none hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep dark:bg-white dark:text-ink dark:focus-visible:outline-sky">
            {p.submit}
          </button>
          <p role="status" className="mt-4 text-sm text-body-gray">
            {sent ? p.thanks : p.note}
          </p>
          <p className="mt-2 text-sm text-body-gray">
            {p.privacy} <a href="#cta" className="underline underline-offset-2 hover:text-fg">{p.privacyLink}</a>
          </p>
        </form>
      </div>
    </section>
  );
}
