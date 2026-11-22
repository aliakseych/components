// Journey section, as on the site: the library InteractiveGlobe full-bleed and one screen tall. Choosing a city flies
// the camera to it, swaps in that city's Sentinel-2 tile and opens the city panel (craft cutout, photo, highlights,
// best-time chart, attractions). Attractions show as extra markers; one opens a photo slider and a full-size viewer.
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import { InteractiveGlobe, type GlobeMarker, type GlobeSatellite, type GlobeView } from "@/components/interactive-globe";
import { textFor, type Attraction, type Journey as JourneyData, type MediaPhoto } from "@/sample/schema";
import mapMeta from "@/assets/map/meta.json";
import "./journey.css";

const maps = import.meta.glob<string>("/src/assets/map/*.webp", { eager: true, query: "?url", import: "default" });
const icons = import.meta.glob<string>("/src/assets/icons/*.webp", { eager: true, query: "?url", import: "default" });
const ICON: Record<Attraction["kind"], string> = { historical: "dome", natural: "mountain", craft: "rishtan-plate", food: "kazan", modern: "city" };
const bounds = mapMeta as Record<string, { w: number; e: number; s: number; n: number }>;

export type JourneyStrings = {
  heading: string;
  label: string;
  imageryCredit: string;
  back: string;
  close: string;
  photos: string;
  prev: string;
  next: string;
  highlights: string;
  bestTime: string;
  highsLabel: string;
  goodMonth: string;
  attractions: string;
  stopOf: (n: number, total: number) => string;
  leg: (hours: number, mode: "train" | "road" | "flight") => string;
  hl: Record<"knownFor" | "taste" | "dontMiss", string>;
  kind: Record<Attraction["kind"], string>;
};

type Props = {
  journey: JourneyData;
  media: (key: string, w: number) => string;
  asset: (path: string) => string;
  strings: JourneyStrings;
  locale?: string;
};

function satelliteFor(slug: string, credit: GlobeSatellite["attribution"]): GlobeSatellite {
  const b = bounds[slug] ?? bounds.country;
  return { bounds: [b.w, b.s, b.e, b.n], src: maps[`/src/assets/map/${slug}.webp`] ?? maps["/src/assets/map/country.webp"], attribution: credit };
}

function Photo({ photo, alt, media, className }: { photo: MediaPhoto; alt: string; media: Props["media"]; className?: string }) {
  return (
    <img
      src={media(photo.key, 640)}
      srcSet={`${media(photo.key, 640)} 640w, ${media(photo.key, 1280)} 1280w`}
      sizes="(min-width: 1024px) 360px, 100vw"
      width={photo.w}
      height={photo.h}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
}

export function Journey({ journey, media, asset, strings: s, locale = "en" }: Props) {
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [attrId, setAttrId] = useState<string | null>(null);
  const [viewer, setViewer] = useState<{ photo: MediaPhoto; title: string; note: string } | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const slidesRef = useRef<HTMLUListElement>(null);

  const place = journey.places.find((p) => p.id === placeId) ?? null;
  const attr = place?.attractions.find((a) => a.id === attrId) ?? null;
  const stops = journey.places.filter((p) => p.kind === "stop");
  const names = useMemo(() => new Map(journey.places.map((p) => [p.id, textFor(p, locale).name])), [journey, locale]);
  const credit = (
    <a href="https://s2maps.eu" target="_blank" rel="noopener">
      {s.imageryCredit}
    </a>
  );

  const markers = useMemo<GlobeMarker[]>(() => {
    const list: GlobeMarker[] = journey.places.map((p) => ({ id: p.id, lng: p.coords[0], lat: p.coords[1], title: textFor(p, locale).name }));
    if (place) {
      const copy = textFor(place, locale).attractions ?? {};
      for (const a of place.attractions) list.push({ id: `${place.id}/${a.id}`, lng: a.coords[0], lat: a.coords[1], title: copy[a.id]?.name ?? a.id });
    }
    return list;
  }, [journey, place, locale]);

  const zoomTo: GlobeView | "highlight" = attr
    ? { lng: attr.coords[0], lat: attr.coords[1], zoom: 48 }
    : place
      ? { lng: place.coords[0], lat: place.coords[1], zoom: place.kind === "spot" ? 36 : 28 }
      : "highlight";

  const select = (m: GlobeMarker | null) => {
    if (!m) return;
    const [p, a] = m.id.split("/");
    setPlaceId(p);
    setAttrId(a ?? null);
  };
  const back = () => (attrId ? setAttrId(null) : setPlaceId(null));

  useEffect(() => {
    if (place) titleRef.current?.focus({ preventScroll: true });
  }, [place, attr]);
  useEffect(() => {
    if (!place) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (viewer) setViewer(null);
      else back();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const t = place && textFor(place, locale);
  const leg = place && journey.legs.find((l) => l.to === place.id);
  const months = Array.from({ length: 12 }, (_, i) => new Date(Date.UTC(2024, i, 1)));
  const fmtLong = new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" });
  const fmtNarrow = new Intl.DateTimeFormat(locale, { month: "narrow", timeZone: "UTC" });
  const suzani = place?.province.map((c) => journey.suzani[c]).find(Boolean);

  // Attraction slides: its own photo first, then the place's other photos, each with its own caption.
  const slides = (() => {
    if (!place || !attr || !t) return [];
    const copy = t.attractions ?? {};
    const list = [attr.photo, ...place.photos].filter((x): x is MediaPhoto => Boolean(x));
    return list
      .filter((x, i) => list.findIndex((y) => y.key === x.key) === i)
      .map((photo) => {
        const other = place.attractions.find((x) => x.photo?.key === photo.key);
        const oc = other && copy[other.id];
        return { photo, title: oc ? oc.name : t.name, note: oc ? oc.blurb : t.tagline };
      });
  })();
  const slide = (dir: number) => {
    const el = slidesRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section id="journey" data-tone="paper" aria-labelledby="journey-h" className="j-section relative">
      <div className="edge-band" aria-hidden="true" />
      <h2 id="journey-h" className="sr-only">
        {s.heading}
      </h2>
      <div className="j-explore" data-level={attr ? "attraction" : place ? "city" : "country"}>
        <InteractiveGlobe
          className="j-globe"
          markers={markers}
          highlight={["Uzbekistan"]}
          zoomTo={zoomTo}
          maxZoom={60}
          selectedId={null}
          onMarkerSelect={select}
          satellite={satelliteFor(attr ? placeId! : (placeId ?? "country"), credit)}
          colors={{
            water: "var(--c-water)",
            land: "var(--c-land)",
            border: "var(--c-paper)",
            highlight: "var(--c-sun)",
            outline: "var(--c-ink)",
            graticule: "var(--c-line)",
            marker: "var(--c-sun)",
          }}
          label={s.label}
        />

        {place && t && (
          <div className="j-panel" role="region" aria-labelledby="j-panel-title">
            <div className="j-panel-head" style={suzani ? { ["--suzani" as string]: `url("${asset(suzani)}")` } : undefined}>
              <button type="button" className="j-back" onClick={back}>
                <ArrowLeft size={18} strokeWidth={2} aria-hidden="true" />
                {s.back}
              </button>
              <p className="j-kicker">
                {attr ? `${t.name} · ${s.kind[attr.kind]}` : place.kind === "stop" ? s.stopOf(place.order ?? 0, stops.length) : ""}
              </p>
              <h3 id="j-panel-title" ref={titleRef} tabIndex={-1} className="j-title">
                {attr ? (t.attractions?.[attr.id]?.name ?? attr.id) : t.name}
              </h3>
              {!attr && place.craft && <img src={asset(place.craft)} alt="" width={128} height={128} className="j-craft" />}
            </div>
            <div className="j-panel-body" data-lenis-prevent>
              {attr ? (
                <>
                  <p className="j-desc">{t.attractions?.[attr.id]?.blurb}</p>
                  {slides.length > 0 && (
                    <div className="j-slider" role="group" aria-label={s.photos}>
                      <ul className="j-slides" ref={slidesRef}>
                        {slides.map((sl) => (
                          <li key={sl.photo.key} className="j-slide">
                            <button type="button" className="j-slide-btn" onClick={() => setViewer(sl)} aria-label={sl.title}>
                              <Photo photo={sl.photo} alt={sl.title} media={media} className="j-slide-photo" />
                            </button>
                          </li>
                        ))}
                      </ul>
                      {slides.length > 1 && (
                        <>
                          <button type="button" className="j-arrow is-prev" onClick={() => slide(-1)} aria-label={s.prev}>
                            <ChevronLeft size={18} aria-hidden="true" />
                          </button>
                          <button type="button" className="j-arrow is-next" onClick={() => slide(1)} aria-label={s.next}>
                            <ChevronRight size={18} aria-hidden="true" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {place.photos[0] && <Photo photo={place.photos[0]} alt={t.name} media={media} className="j-hero" />}
                  <p className="j-tagline">{t.tagline}</p>
                  {leg && (
                    <p className="j-leg">
                      {names.get(leg.from)} → {t.name} · {s.leg(leg.hours, leg.mode)}
                    </p>
                  )}
                  <dl className="j-highlights" aria-label={s.highlights}>
                    {t.highlights.map((h) => (
                      <div key={h.label} className="j-hl">
                        <dt className="j-hl-label">{s.hl[h.label]}</dt>
                        <dd>{h.text}</dd>
                      </div>
                    ))}
                  </dl>
                  {place.attractions.length > 0 && (
                    <section className="mt-4">
                      <h4 className="j-sub">{s.attractions}</h4>
                      <ul className="j-attrs">
                        {place.attractions.map((a) => (
                          <li key={a.id}>
                            <button type="button" className="j-attr" onClick={() => setAttrId(a.id)}>
                              <img src={icons[`/src/assets/icons/${ICON[a.kind]}.webp`]} alt="" width={36} height={36} />
                              <span>
                                <span className="j-attr-name">{t.attractions?.[a.id]?.name ?? a.id}</span>
                                <span className="j-attr-kind">{s.kind[a.kind]}</span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  {place.climate && (
                    <section className="mt-4">
                      <h4 className="j-sub">{s.bestTime}</h4>
                      <ol className="j-months" aria-label={s.highsLabel}>
                        {months.map((d, i) => {
                          const good = place.bestMonths?.includes(i + 1);
                          return (
                            <li key={i} className={good ? "j-month is-good" : "j-month"}>
                              <span className="sr-only">
                                {fmtLong.format(d)}
                                {good ? `, ${s.goodMonth}` : ""}:{" "}
                              </span>
                              <span aria-hidden="true" className="j-month-l">
                                {fmtNarrow.format(d)}
                              </span>
                              <span className="j-month-t">{Math.round(place.climate!.highC[i])}°</span>
                            </li>
                          );
                        })}
                      </ol>
                      <p className="mt-2 text-xs text-ink-2">
                        {t.bestTimeNote}{" "}
                        <a href={place.climate.source} target="_blank" rel="noopener" className="underline">
                          {new URL(place.climate.source).host}
                        </a>
                      </p>
                    </section>
                  )}
                  {t.body?.map((x) => (
                    <p key={x} className="j-text">
                      {x}
                    </p>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {viewer && (
          <div className="j-viewer" role="dialog" aria-modal="true" aria-labelledby="j-viewer-title" onClick={(e) => e.target === e.currentTarget && setViewer(null)}>
            <div className="j-viewer-card">
              <img src={media(viewer.photo.key, 1280)} alt={viewer.title} width={viewer.photo.w} height={viewer.photo.h} className="j-viewer-img" />
              <div className="j-viewer-text">
                <p id="j-viewer-title" className="j-viewer-title">
                  {viewer.title}
                </p>
                <p className="j-viewer-note">{viewer.note}</p>
              </div>
              <button type="button" className="j-viewer-close" onClick={() => setViewer(null)} aria-label={s.close} autoFocus>
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
