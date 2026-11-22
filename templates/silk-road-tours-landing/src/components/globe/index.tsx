// Journey globe, as on the site: render.ts builds the pins and panel views, globe.ts draws the canvas map and runs the
// levels country → city → attraction. This component renders the shell and starts both when the section nears the viewport.
import { useEffect, useRef } from "react";
import { Section } from "@/components/landing/section";
import type { Journey } from "./schema";
import type { Labels } from "./render";
import "./globe.css";

export type JourneyStrings = {
  heading: string;
  mapLabel: string;
  citiesLabel: string;
  chooseCity: string;
  back: string;
  close: string;
  zoomIn: string;
  zoomOut: string;
  imageryCredit: string;
  labels: Labels;
};

type Props = {
  journey: Journey;
  media: (key: string, w: number) => string;
  asset: (path: string) => string;
  strings: JourneyStrings;
  locale?: string;
  lang?: string;
};

/** Approximate geographic centre of Uzbekistan, [lon, lat]; the map's resting centre. */
const centroid: [number, number] = [64.5, 41.4];

const Icon = ({ d }: { d: string }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export function Globe({ journey, media, asset, strings: s, locale = "en", lang = "en" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = ref.current?.querySelector<HTMLElement>("#journey");
    if (!section) return;
    section.classList.add("is-live");
    let stop: (() => void) | undefined;
    let gone = false;
    const io = new IntersectionObserver(
      async ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const [{ renderJourney }, { initJourney }] = await Promise.all([import("./render"), import("./globe")]);
        if (gone) return;
        renderJourney(section, journey, { locale, lang, media, asset, labels: s.labels });
        const suzani = Object.fromEntries(Object.entries(journey.suzani).map(([code, path]) => [code, asset(path)]));
        stop = initJourney(section, { places: journey.places, suzani, centroid });
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(section);
    return () => { gone = true; io.disconnect(); stop?.(); };
  }, [journey, media, asset, s, locale, lang]);

  return (
    <div ref={ref} style={{ display: "contents" }}>
      <Section tone="paper" edge="band" id="journey" labelledby="journey-h" className="j-section">
        <h2 id="journey-h" className="sr-only">{s.heading}</h2>
        <div className="j-explore" data-j-explore data-level="country">
          <canvas data-j-canvas className="j-canvas" role="img" aria-label={s.mapLabel} />
          <div className="j-pins" role="group" aria-label={s.citiesLabel} data-j-pins />
          <p className="j-hint" aria-hidden="true">{s.chooseCity}</p>
          <button type="button" className="j-back" data-j-back hidden>
            <Icon d="M15 5l-7 7 7 7" />
            {s.back}
          </button>
          <p className="j-credit" data-j-credit hidden>
            <a href="https://s2maps.eu" target="_blank" rel="noopener">{s.imageryCredit}</a>
          </p>
          <div className="j-zoom" role="group">
            <button type="button" className="j-zoom-btn" data-j-zoom="in" aria-label={s.zoomIn}><Icon d="M12 5v14M5 12h14" /></button>
            <button type="button" className="j-zoom-btn" data-j-zoom="out" aria-label={s.zoomOut}><Icon d="M5 12h14" /></button>
          </div>
          <div className="j-panel" data-j-panel role="region" aria-labelledby="j-panel-title" hidden>
            <div className="j-panel-head">
              <p className="j-kicker" data-j-kicker />
              <h3 id="j-panel-title" className="j-title" data-j-title tabIndex={-1} />
            </div>
            <div className="j-panel-body" data-j-body data-lenis-prevent />
          </div>
          <div className="j-viewer" data-j-viewer role="dialog" aria-modal="false" aria-labelledby="j-viewer-title" hidden>
            <div className="j-viewer-card">
              <img data-j-viewer-img alt="" className="j-viewer-img" />
              <div className="j-viewer-text">
                <p id="j-viewer-title" className="j-viewer-title" data-j-viewer-title />
                <p className="j-viewer-note" data-j-viewer-note data-lenis-prevent />
              </div>
              <button type="button" className="j-viewer-close" data-j-viewer-close aria-label={s.close}><Icon d="M6 6l12 12M18 6L6 18" /></button>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
