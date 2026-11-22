"use client";

import { geoBounds, type GeoGeometryObjects } from "d3-geo";
import { ArrowUpRight, Minus, Plus, RotateCcw, X } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { createGlobe, type EngineTarget, type GlobeEngine, type HighlightShape } from "./engine";
import {
  EOX_ATTRIBUTION,
  eoxSatelliteUrl,
  findCountry,
  loadDetailedCountry,
  type GeoBounds,
  type Geometry,
} from "./geo";

export type { GeoBounds } from "./geo";

export interface GlobeMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: ReactNode;
  /** Photo shown at the top of the popover. */
  image?: string | { src: string; alt: string };
  /** Adds a link at the bottom of the popover. */
  href?: string;
  /** When pins overlap, higher priority stays visible and the rest hide until zoomed in. Defaults to 0; ties keep array order. */
  priority?: number;
}

/** A camera position. `zoom` 1 fits the whole globe in the box; 2 doubles its radius. */
export interface GlobeView {
  lat: number;
  lng: number;
  zoom?: number;
}

/**
 * A highlighted region: a country by ISO 3166-1 numeric id ("392") or Natural Earth name ("Japan"),
 * or any GeoJSON geometry (provinces, parks, custom areas) with an id.
 */
export type GlobeHighlight = string | { id: string; geometry: GeoGeometryObjects };

export interface GlobeSatellite {
  /** Area covered by the image. Defaults to the highlighted regions (or the zoom target) plus a margin. */
  bounds?: GeoBounds;
  /** Web Mercator image URL for `bounds`, or a builder. Defaults to keyless EOX Sentinel-2 cloudless 2016 (CC BY 4.0). */
  src?: string | ((bounds: GeoBounds) => string);
  /** Credit shown once the image loads. Required by most imagery licences. */
  attribution?: ReactNode;
}

export interface InteractiveGlobeColors {
  water?: string;
  land?: string;
  border?: string;
  highlight?: string;
  outline?: string;
  graticule?: string;
  marker?: string;
}

export interface InteractiveGlobeProps {
  markers?: GlobeMarker[];
  highlight?: GlobeHighlight[];
  /** Where the camera starts. Defaults to the whole globe. */
  initialView?: GlobeView;
  /**
   * Where the camera flies once the globe is 40% on screen, and again whenever this changes.
   * `"highlight"` fits the highlighted regions. Defaults to `"highlight"` when there are highlights.
   */
  zoomTo?: GlobeView | "highlight" | null;
  /** Deepest zoom, as a multiple of the whole-globe fit. */
  maxZoom?: number;
  /** Satellite imagery fades in over the flat map once zoomed in. `true` uses the keyless default. */
  satellite?: boolean | GlobeSatellite;
  /** Controlled selection. */
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  onMarkerSelect?: (marker: GlobeMarker | null) => void;
  colors?: InteractiveGlobeColors;
  /** Accessible name of the globe. */
  label?: string;
  linkLabel?: string;
  className?: string;
}

const DEFAULT_COLORS: Required<InteractiveGlobeColors> = {
  water: "var(--muted)",
  land: "var(--border)",
  border: "var(--background)",
  highlight: "var(--chart-3)",
  outline: "var(--foreground)",
  graticule: "var(--ring)",
  marker: "var(--chart-1)",
};

/** Liquid glass surface shared by the popover, the pin labels and the controls. */
const glass =
  "border border-white/50 bg-popover/95 text-popover-foreground shadow-[0_8px_32px_-8px_rgb(0_0_0/0.25),inset_0_1px_0_rgb(255_255_255/0.6)] backdrop-blur-sm dark:border-white/10 dark:bg-popover/90 dark:shadow-[0_8px_32px_-8px_rgb(0_0_0/0.6),inset_0_1px_0_rgb(255_255_255/0.08)]";

function resolveHighlight(list: GlobeHighlight[]): HighlightShape[] {
  return list.flatMap((h) => {
    if (typeof h !== "string") return [{ id: h.id, geometry: h.geometry }];
    const c = findCountry(h);
    if (!c) console.warn(`interactive-globe: unknown country "${h}"`);
    return c ? [{ id: c.id, geometry: c.geometry }] : [];
  });
}

const toTarget = (v: GlobeView): EngineTarget => ({ c: [v.lng, v.lat], k: v.zoom ?? 1 });

function satelliteBounds(shapes: HighlightShape[], view?: GlobeView): GeoBounds {
  if (shapes.length) {
    const [[w, s], [e, n]] = geoBounds({ type: "GeometryCollection", geometries: shapes.map((h) => h.geometry) } as never);
    const east = e < w ? e + 360 : e;
    const mx = Math.max(1, (east - w) * 0.25);
    const my = Math.max(1, (n - s) * 0.25);
    return [w - mx, s - my, Math.min(180, east + mx), n + my];
  }
  if (view) {
    const span = 90 / (view.zoom ?? 1);
    return [view.lng - span, view.lat - span / 1.5, view.lng + span, view.lat + span / 1.5];
  }
  return [-180, -85, 180, 85];
}

const NO_MARKERS: GlobeMarker[] = [];
const NO_HIGHLIGHT: GlobeHighlight[] = [];

export function InteractiveGlobe({
  markers = NO_MARKERS,
  highlight = NO_HIGHLIGHT,
  initialView,
  zoomTo,
  maxZoom = 24,
  satellite = false,
  selectedId,
  defaultSelectedId = null,
  onMarkerSelect,
  colors,
  label = "Interactive globe",
  linkLabel = "Learn more",
  className,
}: InteractiveGlobeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const pins = useRef(new Map<string, HTMLButtonElement>());
  const engine = useRef<GlobeEngine | null>(null);
  const focusOnOpen = useRef(false);
  const popoverId = useId();
  const [inner, setInner] = useState<string | null>(defaultSelectedId);
  const selected = selectedId !== undefined ? selectedId : inner;
  const current = markers.find((m) => m.id === selected) ?? null;
  const [zoom, setZoom] = useState({ canZoomIn: true, canZoomOut: false, zoomed: false });
  const [satLoaded, setSatLoaded] = useState(false);

  const markersRef = useRef(markers);
  markersRef.current = markers;
  const onSelectRef = useRef(onMarkerSelect);
  onSelectRef.current = onMarkerSelect;

  const select = useCallback(
    (id: string | null, opts: { focusPopover?: boolean; returnFocus?: boolean } = {}) => {
      const prev = selected;
      focusOnOpen.current = Boolean(opts.focusPopover);
      if (selectedId === undefined) setInner(id);
      onSelectRef.current?.(markersRef.current.find((m) => m.id === id) ?? null);
      if (!id && prev && opts.returnFocus) pins.current.get(prev)?.focus({ preventScroll: true });
    },
    [selected, selectedId],
  );
  const selectRef = useRef(select);
  selectRef.current = select;

  // Engine lifetime: created once per mount (before the layout effects below push props into it).
  useLayoutEffect(() => {
    const e = createGlobe({
      root: rootRef.current!,
      canvas: canvasRef.current!,
      pin: (id) => pins.current.get(id) ?? null,
      popover: () => popoverRef.current,
      maxZoom,
      onBackgroundClick: () => selectRef.current(null),
      onZoomChange: setZoom,
      onSatelliteLoaded: setSatLoaded,
    });
    engine.current = e;
    return () => {
      e.destroy();
      engine.current = null;
    };
  }, [maxZoom]);

  const shapes = useMemo(() => resolveHighlight(highlight), [highlight]);
  const initialTarget = useMemo<EngineTarget>(
    () => (initialView ? toTarget(initialView) : { c: [0, 20], k: 1 }),
    [initialView?.lat, initialView?.lng, initialView?.zoom],
  );
  const zoomTarget = useMemo<EngineTarget>(() => {
    const t = zoomTo === undefined ? (shapes.length ? "highlight" : null) : zoomTo;
    if (t === "highlight") return shapes.length ? { fit: shapes.map((s) => s.geometry) } : {};
    return t ? toTarget(t) : {};
  }, [zoomTo === undefined || zoomTo === null || zoomTo === "highlight" ? zoomTo : `${zoomTo.lat},${zoomTo.lng},${zoomTo.zoom}`, shapes]);
  const sat = useMemo(() => {
    if (!satellite) return null;
    const cfg = satellite === true ? {} : satellite;
    const bounds = cfg.bounds ?? satelliteBounds(shapes, zoomTo && zoomTo !== "highlight" ? zoomTo : undefined);
    const src = typeof cfg.src === "string" ? cfg.src : (cfg.src ?? eoxSatelliteUrl)(bounds);
    return { src, bounds, attribution: cfg.attribution ?? (cfg.src ? null : EOX_ATTRIBUTION) };
  }, [satellite, shapes, zoomTo]);

  useLayoutEffect(() => engine.current?.setHighlight(shapes), [shapes, maxZoom]);
  // Swap named countries to their 1:50m outline once the lazy chunk arrives; framing keeps using the 1:110m shapes.
  useEffect(() => {
    let live = true;
    Promise.all(
      highlight.map(async (h): Promise<HighlightShape | null> => {
        if (typeof h !== "string") return { id: h.id, geometry: h.geometry };
        const c = findCountry(h);
        const geometry = c && (await loadDetailedCountry(c));
        return c ? { id: c.id, geometry: geometry ?? c.geometry } : null;
      }),
    ).then((detailed) => {
      const next = detailed.filter((s): s is HighlightShape => s !== null);
      if (live && highlight.some((h) => typeof h === "string")) engine.current?.setHighlight(next);
    });
    return () => {
      live = false;
    };
  }, [shapes, maxZoom]);
  useLayoutEffect(() => engine.current?.setInitial(initialTarget), [initialTarget, maxZoom]);
  useLayoutEffect(() => engine.current?.setTarget(zoomTarget), [zoomTarget, maxZoom]);
  useLayoutEffect(
    () => engine.current?.setSatellite(sat && { src: sat.src, bounds: sat.bounds }),
    [sat?.src, maxZoom],
  );
  useLayoutEffect(
    () => engine.current?.setMarkers(markers.map(({ id, lat, lng, priority }) => ({ id, lat, lng, priority }))),
    [markers, maxZoom],
  );
  useLayoutEffect(() => {
    const m = markersRef.current.find((x) => x.id === selected);
    engine.current?.select(m ? m.id : null, m && focusOnOpen.current ? [m.lng, m.lat] : undefined);
    // The popover stays hidden (unfocusable) until the engine anchors it on the next frame.
    if (m && focusOnOpen.current)
      requestAnimationFrame(() => requestAnimationFrame(() => popoverRef.current?.focus({ preventScroll: true })));
    focusOnOpen.current = false;
  }, [selected, maxZoom]);
  useLayoutEffect(() => engine.current?.refreshColors(), [colors]);

  // Esc closes the popover and returns focus to its pin; a press outside the globe closes it.
  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      const a = document.activeElement;
      if (e.key !== "Escape" || (a && a !== document.body && !rootRef.current?.contains(a))) return;
      e.preventDefault();
      selectRef.current(null, { returnFocus: true });
    };
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) selectRef.current(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [current]);

  const style = Object.fromEntries(
    Object.entries({ ...DEFAULT_COLORS, ...colors }).map(([k, v]) => [`--interactive-globe-${k}`, v]),
  ) as CSSProperties;

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={label}
      style={style}
      className={cn("relative isolate h-[28rem] w-full min-w-0 overflow-hidden select-none", className)}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 size-full cursor-grab touch-pan-y data-[dragging]:cursor-grabbing [[data-zoomed]>&]:touch-none"
      />

      {markers.map((m) => (
        <button
          key={m.id}
          ref={(el) => {
            if (el) pins.current.set(m.id, el);
            else pins.current.delete(m.id);
          }}
          type="button"
          aria-label={m.title}
          aria-haspopup="dialog"
          aria-expanded={m.id === selected}
          aria-controls={m.id === selected ? popoverId : undefined}
          onClick={() => select(m.id === selected ? null : m.id, { focusPopover: m.id !== selected })}
          style={{ transform: "translate(-999px, -999px)" }}
          className="group/pin absolute top-0 left-0 -mt-3 -ml-3 grid size-6 place-items-center rounded-full outline-none transition-opacity duration-200 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          <span className="size-[calc(0.75rem*var(--pin-s,1))] rounded-full bg-(--interactive-globe-marker) shadow-[0_1px_4px_rgb(0_0_0/0.35)] ring-2 ring-background transition-transform group-hover/pin:scale-125 group-aria-expanded/pin:scale-150 motion-reduce:transition-none" />
          <span
            className={cn(
              glass,
              "pointer-events-none absolute top-full left-1/2 mt-1 -translate-x-1/2 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap opacity-0 transition-opacity group-hover/pin:opacity-100 group-focus-visible/pin:opacity-100 group-aria-expanded/pin:opacity-0 motion-reduce:transition-none",
            )}
          >
            {m.title}
          </span>
        </button>
      ))}

      {current && (
        <GlobePopover
          ref={popoverRef}
          id={popoverId}
          marker={current}
          linkLabel={linkLabel}
          onClose={() => select(null, { returnFocus: true })}
          // Hidden until the engine anchors it to the pin on the next frame.
          style={{ visibility: "hidden" }}
          className="absolute top-0 left-0 z-10"
        />
      )}

      <div className={cn(glass, "absolute right-3 bottom-3 flex flex-col overflow-hidden rounded-xl")}>
        {(
          [
            ["Zoom in", Plus, () => engine.current?.zoomBy(1.6), zoom.canZoomIn],
            ["Zoom out", Minus, () => engine.current?.zoomBy(1 / 1.6), zoom.canZoomOut],
            ["Reset view", RotateCcw, () => engine.current?.reset(), zoom.zoomed],
          ] as const
        ).map(([name, Icon, run, enabled]) => (
          <button
            key={name}
            type="button"
            aria-label={name}
            title={name}
            disabled={!enabled}
            onClick={run}
            className="grid size-9 place-items-center outline-none transition-colors hover:bg-foreground/10 focus-visible:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:opacity-35 disabled:hover:bg-transparent"
          >
            <Icon className="size-4" aria-hidden />
          </button>
        ))}
      </div>

      {sat?.attribution && satLoaded && (
        <p className="pointer-events-none absolute bottom-1 left-2 max-w-[60%] text-[10px] leading-tight text-muted-foreground">
          {sat.attribution}
        </p>
      )}
    </div>
  );
}

export interface GlobePopoverProps {
  id?: string;
  marker: GlobeMarker;
  linkLabel?: string;
  onClose: () => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * Liquid glass popover for one marker. Inside `InteractiveGlobe` the engine positions it (transform, `data-side`,
 * `--arrow-x`); on its own it renders in place.
 */
export const GlobePopover = forwardRef<HTMLDivElement, GlobePopoverProps>(function GlobePopover(
  { id, marker, linkLabel = "Learn more", onClose, className, style },
  ref,
) {
  const titleId = `${id ?? marker.id}-title`;
  const img = typeof marker.image === "string" ? { src: marker.image, alt: "" } : marker.image;
  return (
    <div
      ref={ref}
      id={id}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      data-side="top"
      style={style}
      className={cn(
        glass,
        "group/pop relative w-72 max-w-[calc(100%-1rem)] rounded-2xl p-3 outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute left-[calc(var(--arrow-x)-0.5rem)] h-2 w-4 bg-popover/95 group-data-[side=bottom]/pop:bottom-full group-data-[side=bottom]/pop:[clip-path:polygon(50%_0,100%_100%,0_100%)] group-data-[side=top]/pop:top-full group-data-[side=top]/pop:[clip-path:polygon(0_0,100%_0,50%_100%)] dark:bg-popover/90"
      />
      {img && (
        <img
          src={img.src}
          alt={img.alt}
          loading="lazy"
          className="mb-3 aspect-video w-full rounded-xl object-cover"
        />
      )}
      <div className="flex items-start gap-2">
        <h3 id={titleId} className="min-w-0 flex-1 text-sm leading-snug font-semibold">
          {marker.title}
        </h3>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="-mt-1 -mr-1 grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      {marker.description && <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{marker.description}</div>}
      {marker.href && (
        <a
          href={marker.href}
          className="mt-3 inline-flex items-center gap-1 rounded-md text-xs font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          {linkLabel}
          <ArrowUpRight className="size-3.5" aria-hidden />
        </a>
      )}
    </div>
  );
});
