import { useState } from "react";

export type ConsentBannerProps = { ariaLabel: string; title: string; body: string; link: string; deny: string; allow: string };

const KEY = "merchant-landing-consent";

/** Fixed privacy-choice card. The choice is kept in localStorage; replace `save` with your consent manager. */
export function ConsentBanner(p: ConsentBannerProps) {
  const [shown, setShown] = useState(() => {
    try {
      return !localStorage.getItem(KEY);
    } catch {
      return true;
    }
  });
  const save = (value: "necessary" | "analytics") => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* storage unavailable: just dismiss */
    }
    setShown(false);
  };
  if (!shown) return null;
  return (
    <aside aria-label={p.ariaLabel} style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }} className="fixed inset-x-3 z-[100] mx-auto max-w-3xl rounded-3xl border border-white/15 bg-[#0b0b0c] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:inset-x-6 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <h2 className="font-display text-xl">{p.title}</h2>
          <p className="mt-2 text-sm leading-6 text-white/70">
            {p.body} <a href="#cta" className="text-sky underline underline-offset-2">{p.link}</a>
          </p>
        </div>
        <div className="flex shrink-0 flex-col-reverse gap-2 sm:flex-row">
          <button type="button" onClick={() => save("necessary")} className="min-h-12 rounded-full border border-white/20 px-5 text-sm font-semibold transition-colors outline-none hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky">{p.deny}</button>
          <button type="button" onClick={() => save("analytics")} className="min-h-12 rounded-full bg-white px-5 text-sm font-semibold text-ink transition-colors outline-none hover:bg-sky focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky">{p.allow}</button>
        </div>
      </div>
    </aside>
  );
}
