import { useRef } from "react";
import { ScrollPillHeader } from "../index";

export default function Demo() {
  const hero = useRef<HTMLDivElement>(null);
  return (
    <div className="min-h-[2400px] w-full bg-background text-foreground">
      <div ref={hero} className="relative h-[720px] bg-gradient-to-b from-slate-900 via-indigo-900 to-sky-700 text-white">
        <ScrollPillHeader boundary={hero} onDark />
        <div className="px-6 pt-24 text-center">
          <h1 className="text-[clamp(34px,5vw,56px)] font-semibold tracking-tight">Run operations with calm</h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-white/70">Scroll down: the header folds into a floating pill.</p>
        </div>
      </div>
      <section id="manifesto" className="mx-auto max-w-2xl px-6 py-24 text-muted-foreground">
        <h2 className="mb-4 text-3xl font-semibold text-foreground">Manifesto</h2>
        <p>Content continues here while the pill stays pinned to the top of the viewport.</p>
      </section>
    </div>
  );
}
