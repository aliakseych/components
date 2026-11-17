"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { PhoneScrollHero } from "../index";

const sections = [
  { title: "Overnight checks", body: "The assistant reads load boards, ELD alerts and your inbox while you sleep." },
  { title: "Morning brief", body: "One short read with what changed, what needs you and what is already handled." },
  { title: "Next steps", body: "Drafted emails, claims and approvals wait for one tap." },
];

// The hero scrolls inside its own frame, so the demo stays one screen tall.
// The page background lives here, because the hero paints none.
export default function Demo() {
  const endRef = useRef<HTMLDivElement>(null);
  const [past, setPast] = useState(false);

  // The header collapses once the hero's end boundary scrolls above it. A scroll
  // listener (not an IntersectionObserver) also catches jumps straight past it.
  useEffect(() => {
    const end = endRef.current;
    const scroller = end?.closest<HTMLElement>("[data-demo-scroll]");
    if (!end || !scroller) return;
    const update = () => setPast(end.getBoundingClientRect().top - scroller.getBoundingClientRect().top < 64);
    update();
    scroller.addEventListener("scroll", update, { passive: true });
    return () => scroller.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      data-demo-scroll
      className="h-[calc(100svh-4rem)] w-full overflow-y-auto bg-background text-foreground"
      tabIndex={0}
      role="region"
      aria-label="Scrollable hero demo"
    >
      <div>
        <header
          className={cn(
            "sticky top-0 z-50 mx-auto flex h-16 items-center justify-between px-5 transition-[max-width,margin,border-radius,background-color] duration-300",
            past ? "mt-2 max-w-md rounded-full border bg-card/90 shadow-sm backdrop-blur" : "max-w-full bg-transparent text-white",
          )}
        >
          <span className="font-semibold">Dispatch</span>
          <a href="#demo" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            Get a demo
          </a>
        </header>
        <div className="-mt-16">
          <PhoneScrollHero endRef={endRef} />
        </div>
        {sections.map((section) => (
          <section key={section.title} className="mx-auto flex min-h-[70svh] max-w-2xl flex-col justify-center px-6">
            <h2 className="text-3xl font-semibold tracking-tight">{section.title}</h2>
            <p className="mt-3 text-lg text-muted-foreground">{section.body}</p>
          </section>
        ))}
        <section id="demo" className="mx-auto max-w-2xl px-6 pb-24 text-muted-foreground">
          Get a demo to see the assistant on your own fleet.
        </section>
      </div>
    </div>
  );
}
