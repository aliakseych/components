import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ComponentPropsWithoutRef,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export type GarmentKind = "tee" | "hoodie" | "coat" | "dress";

export type RailItem = {
  id: string;
  name: string;
  price: string;
  kind: GarmentKind;
  /** Any CSS colour. It is passed in as data and is the only garment colour. */
  color: string;
  description: string;
  /** Real photos to show instead of the drawn art. `side` falls back to the drawn profile. */
  images?: { front?: string; side?: string };
};

export type ProductRailColors = {
  /** Base colour of the chrome rail. */
  rail?: string;
  /** Background of the price tags. */
  tag?: string;
  /** Colour of the cast shadows. */
  shadow?: string;
};

export type ProductRailProps = ComponentPropsWithoutRef<"section"> & {
  eyebrow: string;
  headline: string;
  items: RailItem[];
  colors?: ProductRailColors;
  onSelect?: (item: RailItem, index: number) => void;
  /** Called when the active garment is clicked. Without it, a detail overlay opens inline. */
  onOpen?: (item: RailItem, index: number) => void;
  onShop?: (item: RailItem, index: number) => void;
};

const EASE = "cubic-bezier(.16,1,.3,1)";
const GARMENT_TOP = 36;
const SPREAD = 0.35;
const TILT_MAX = 18;
const TILT_GAIN = 18;
const TILT_DECAY = 0.9;
const TILT_SMOOTH = 0.15;

const KIND_LABEL: Record<GarmentKind, string> = {
  tee: "T-shirt",
  hoodie: "Hoodie",
  coat: "Coat",
  dress: "Dress",
};

const RAIL_GRADIENT =
  "linear-gradient(180deg, color-mix(in oklab, var(--pr-rail) 45%, white) 0%, var(--pr-rail) 40%, color-mix(in oklab, var(--pr-rail) 55%, black) 72%, color-mix(in oklab, var(--pr-rail) 80%, white) 100%)";

const CSS = `
@keyframes pr-sway { from { transform: rotate(-1.5deg); } to { transform: rotate(1.5deg); } }
@keyframes pr-tag { from { transform: rotate(-14deg); } to { transform: rotate(-10deg); } }
@keyframes pr-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.pr-item { transition: transform 500ms ${EASE}; }
.pr-sway { transform-origin: 50% 0; animation: pr-sway 8s ease-in-out infinite alternate; }
.pr-tag { transform-origin: 50% 0; animation: pr-tag 3.6s ease-in-out infinite alternate; }
.pr-ry { transition: transform 600ms ${EASE}; transform-style: preserve-3d; }
.pr-layer { transition: opacity 600ms ${EASE}; }
.pr-fade { animation: pr-fade 400ms ${EASE} both; }
@media (prefers-reduced-motion: reduce) {
  .pr-item, .pr-ry, .pr-layer { transition: none !important; }
  .pr-sway, .pr-tag, .pr-fade { animation: none !important; }
}
`;

const OUTLINE: CSSProperties = {
  fill: "none",
  stroke: "color-mix(in oklab, var(--garment) 45%, var(--foreground))",
  strokeWidth: 1.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const POCKET: CSSProperties = {
  fill: "color-mix(in oklab, var(--garment) 80%, black)",
  stroke: "none",
};

const FRONT_BODY: Record<GarmentKind, string> = {
  tee: "M40 4 Q60 18 80 4 L112 22 L120 56 L100 62 L100 156 L20 156 L20 62 L0 56 L8 22 Z",
  hoodie: "M36 14 L8 26 L0 58 L20 64 L20 156 L100 156 L100 64 L120 58 L112 26 L84 14 Q60 30 36 14 Z",
  coat: "M38 4 L60 14 L82 4 L110 20 L118 128 L104 130 L100 72 L100 156 L20 156 L20 72 L16 130 L2 128 L10 20 Z",
  dress: "M46 6 L74 6 L78 26 Q98 40 102 80 L112 156 L8 156 L18 80 Q22 40 42 26 Z",
};

const SIDE_BODY: Record<GarmentKind, string> = {
  tee: "M18 4 L42 4 L52 26 L45 29 L40 22 L40 156 L20 156 L20 22 L15 29 L8 26 Z",
  hoodie: "M14 0 Q30 -10 46 0 L52 26 L45 29 L40 22 L40 156 L20 156 L20 22 L15 29 L8 26 Z",
  coat: "M20 2 L40 2 L48 40 L42 43 L42 156 L18 156 L18 43 L12 40 Z",
  dress: "M20 4 L40 4 L46 30 L48 156 L12 156 L14 30 Z",
};

function hash(text: string) {
  let h = 0;
  for (const char of text) h = (h * 31 + char.charCodeAt(0)) >>> 0;
  return h;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Hanger({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 32"
      className={cn("pointer-events-none text-foreground/70", className)}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 1a3 3 0 0 1 3 3c0 2-3 3.5-3 6" />
      <path d="M20 10 L4 26 Q2 28.5 5 28.5 H35 Q38 28.5 36 26 Z" />
    </svg>
  );
}

const BODY_STYLE: CSSProperties = {
  fill: "var(--garment)",
  stroke: "color-mix(in oklab, var(--garment) 45%, var(--foreground))",
  strokeWidth: 1.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const FOLD_STYLE: CSSProperties = {
  fill: "color-mix(in oklab, var(--garment) 78%, black)",
  stroke: "none",
};

const SIDE_FOLD: Record<GarmentKind, string> = {
  tee: "M8 26 L15 29 L20 22 L20 30 L14 34 Z",
  hoodie: "M8 26 L15 29 L20 22 L20 30 L14 34 Z",
  coat: "M12 40 L18 43 L18 60 L14 58 Z",
  dress: "M12 30 L14 30 L18 40 L16 60 Z",
};

const FRONT_FOLD = "M20 60 L28 62 L28 156 L20 156 Z";

function FrontDetails({ kind, back }: { kind: GarmentKind; back: boolean }): ReactNode {
  if (back) {
    return <path d="M22 44 Q60 56 98 44" fill="none" style={OUTLINE} />;
  }
  switch (kind) {
    case "tee":
      return <path d="M40 4 Q60 18 80 4" fill="none" style={OUTLINE} />;
    case "hoodie":
      return (
        <>
          <path d="M36 14 Q60 30 84 14" fill="none" style={OUTLINE} />
          <path d="M36 116 L84 116 L90 146 L30 146 Z" style={POCKET} />
          <path d="M52 30 L50 56 M68 30 L70 56" fill="none" style={OUTLINE} />
        </>
      );
    case "coat":
      return (
        <>
          <path d="M46 14 L60 56 L74 14 M60 56 L60 156" fill="none" style={OUTLINE} />
          <circle cx="60" cy="84" r="2" style={POCKET} />
          <circle cx="60" cy="108" r="2" style={POCKET} />
          <circle cx="60" cy="132" r="2" style={POCKET} />
        </>
      );
    case "dress":
      return (
        <>
          <path d="M46 6 Q60 22 74 6" fill="none" style={OUTLINE} />
          <path d="M20 84 L100 84" fill="none" style={{ ...OUTLINE, strokeWidth: 5 }} />
        </>
      );
  }
}

function GarmentArt({
  item,
  view,
  id,
}: {
  item: RailItem;
  view: "front" | "side" | "back";
  id: string;
}) {
  const image = view === "side" ? item.images?.side : item.images?.front;
  if (image) {
    return <img src={image} alt="" draggable={false} className="h-full w-full object-contain" />;
  }

  if (view === "side") {
    return (
      <svg aria-hidden="true" data-art={id} viewBox="0 -10 60 170" preserveAspectRatio="xMidYMid meet" className="h-full w-full overflow-visible">
        <path d={SIDE_BODY[item.kind]} style={BODY_STYLE} />
        <path d={SIDE_FOLD[item.kind]} style={FOLD_STYLE} />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" data-art={id} viewBox="0 -10 120 170" preserveAspectRatio="xMidYMid meet" className="h-full w-full overflow-visible">
      {item.kind === "hoodie" && view === "front" ? (
        <path d="M36 14 Q32 -8 60 -8 Q88 -8 84 14 Q60 30 36 14 Z" style={BODY_STYLE} />
      ) : null}
      <path d={FRONT_BODY[item.kind]} style={BODY_STYLE} />
      {view === "front" ? <path d={FRONT_FOLD} style={FOLD_STYLE} /> : null}
      <FrontDetails kind={item.kind} back={view === "back"} />
    </svg>
  );
}

type TiltState = {
  x: number;
  t: number;
  vel: number;
  lastMove: number;
  el: HTMLElement | null;
  values: Map<HTMLElement, number>;
  raf: number;
};

/** Eases each tilted garment toward its pointer-driven angle, then back to 0. Runs only while needed. */
function tiltFrame(s: TiltState) {
  s.raf = 0;
  const moving = performance.now() - s.lastMove < 60;
  if (!moving) s.vel *= TILT_DECAY;
  if (moving && s.el && !s.values.has(s.el)) s.values.set(s.el, 0);
  const target = clamp(-s.vel * TILT_GAIN, -TILT_MAX, TILT_MAX);

  for (const [el, value] of s.values) {
    const next = moving && el === s.el ? target : value * TILT_DECAY;
    if (Math.abs(next) < 0.05) {
      el.style.removeProperty("--tilt");
      s.values.delete(el);
    } else {
      el.style.setProperty("--tilt", `${next.toFixed(2)}deg`);
      s.values.set(el, next);
    }
  }

  if (s.values.size > 0 || moving) s.raf = requestAnimationFrame(() => tiltFrame(s));
}

export function ProductRail({
  eyebrow,
  headline,
  items,
  colors,
  onSelect,
  onOpen,
  onShop,
  className,
  style,
  ...props
}: ProductRailProps) {
  const headingId = useId();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [active, setActive] = useState<number | null>(null);
  const [overlay, setOverlay] = useState<{ index: number; back: boolean } | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const closeButton = useRef<HTMLButtonElement | null>(null);
  const tilt = useRef<TiltState>({ x: 0, t: 0, vel: 0, lastMove: 0, el: null, values: new Map(), raf: 0 });

  const count = items.length;
  const openIndex = overlay?.index ?? null;
  const overlayItem = overlay ? items[overlay.index] : undefined;
  const activeItem = active !== null ? items[active] : undefined;
  // The row is centred on the active garment; with nothing selected it centres on the middle one.
  const ref = active ?? (count - 1) / 2;

  useEffect(() => {
    const state = tilt.current;
    return () => cancelAnimationFrame(state.raf);
  }, []);

  useEffect(() => {
    if (openIndex === null) return;
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOverlay(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      buttons.current[openIndex]?.focus();
    };
  }, [openIndex]);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || prefersReducedMotion()) return;
    const s = tilt.current;
    const now = performance.now();
    if (s.t) {
      const dt = Math.max(1, now - s.t);
      const v = (event.clientX - s.x) / dt;
      s.vel += (v - s.vel) * TILT_SMOOTH;
    }
    s.x = event.clientX;
    s.t = now;
    s.lastMove = now;
    s.el = (event.target as HTMLElement).closest<HTMLElement>("[data-tilt]");
    if (!s.raf) s.raf = requestAnimationFrame(() => tiltFrame(s));
  }

  function handlePointerLeave() {
    const s = tilt.current;
    s.el = null;
    s.lastMove = 0;
    if (!s.raf) s.raf = requestAnimationFrame(() => tiltFrame(s));
  }

  function handleItem(index: number) {
    const item = items[index];
    if (!item) return;
    if (active === index) {
      if (onOpen) onOpen(item, index);
      else setOverlay({ index, back: false });
      return;
    }
    setActive(index);
    onSelect?.(item, index);
  }

  const sectionVars = {
    "--pr-rail": colors?.rail ?? "color-mix(in oklab, var(--foreground) 70%, var(--background))",
    "--pr-tag": colors?.tag ?? "white",
    "--pr-shadow": colors?.shadow ?? "var(--foreground)",
  } as CSSProperties;

  // Sizes follow the rail's own width (container units), so the row fits wherever the section sits.
  const stageVars = {
    "--step": "min(174px, max(58px, 14cqw))",
    "--gw": "min(132px, max(88px, 22cqw))",
    "--gh": "calc(var(--gw) * 1.6)",
    containerType: "inline-size",
  } as CSSProperties;

  return (
    <section
      aria-labelledby={headingId}
      className={cn("relative isolate overflow-hidden py-16 text-foreground md:py-24", className)}
      style={{ ...sectionVars, ...style }}
      {...props}
    >
      <style>{CSS}</style>

      <header className="px-6 text-center md:px-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">{eyebrow}</p>
        <h2
          id={headingId}
          className="mx-auto mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight md:text-5xl"
        >
          {headline}
        </h2>
      </header>

      <div
        className="relative mt-10 w-full md:mt-14"
        style={{ ...stageVars, height: 320 }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        inert={openIndex !== null}
      >
        {/* Chrome rail, full width, with a blurred shadow beneath and brackets at both ends. */}
        <div aria-hidden="true" className="absolute inset-x-0 top-3 h-3 blur-md" style={{ background: "var(--pr-shadow)", opacity: 0.3 }} />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-3" style={{ background: RAIL_GRADIENT }} />
        <span aria-hidden="true" className="absolute left-0 top-[-8px] h-7 w-4 rounded-[3px]" style={{ background: RAIL_GRADIENT }} />
        <span aria-hidden="true" className="absolute right-0 top-[-8px] h-7 w-4 rounded-[3px]" style={{ background: RAIL_GRADIENT }} />

        <ul aria-label="Garments on the rail" className="absolute inset-0 m-0 list-none p-0">
          {items.map((item, index) => {
            const isActive = active === index;
            const offset = index - ref;
            const spread = active === null || isActive ? 0 : Math.sign(offset) * SPREAD;
            const k = (offset + spread).toFixed(3);
            const swayDelay = -((hash(item.id) % 800) / 100);
            const tagDelay = -((hash(`${item.id}-tag`) % 360) / 100);
            const itemUid = `${uid}-${index}`;

            return (
              <li
                key={item.id}
                className="pr-item absolute left-1/2 top-0 w-[var(--gw)]"
                style={{
                  transform: `translateX(calc(-50% + ${k} * var(--step)))`,
                  zIndex: isActive ? 40 : 20 - Math.round(Math.abs(offset)),
                  "--garment": item.color,
                } as CSSProperties}
              >
                <div className="pr-sway absolute inset-0" style={{ animationDelay: `${swayDelay}s` }}>
                  <span
                    aria-hidden="true"
                    className="absolute left-0 w-[var(--gw)] rounded-[50%] blur-[3px]"
                    style={{
                      top: `calc(${GARMENT_TOP}px + var(--gh) - 6px)`,
                      height: 18,
                      background: "var(--pr-shadow)",
                      opacity: 0.16,
                      transform: "translate(13px, 14px) scaleX(.34)",
                    }}
                  />

                  <button
                    ref={(el) => {
                      buttons.current[index] = el;
                    }}
                    type="button"
                    aria-pressed={isActive}
                    aria-label={`${item.name}, ${item.price}`}
                    onClick={() => handleItem(index)}
                    className="absolute left-0 block w-[var(--gw)] cursor-pointer rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                    style={{ top: GARMENT_TOP, height: "var(--gh)" }}
                  >
                    <span className="block h-full w-full" style={{ perspective: 1100 }}>
                      <span className="pr-ry block h-full w-full" style={{ transform: `rotateY(${isActive ? 0 : 70}deg)` }}>
                        <span
                          data-tilt=""
                          className="block h-full w-full"
                          style={{ transformStyle: "preserve-3d", transform: "rotateY(var(--tilt, 0deg))" }}
                        >
                          <span className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
                            <span className="pr-layer absolute inset-0" style={{ opacity: isActive ? 0 : 1 }}>
                              <GarmentArt item={item} view="side" id={`${itemUid}-s`} />
                            </span>
                            <span className="pr-layer absolute inset-0" style={{ opacity: isActive ? 1 : 0 }}>
                              <GarmentArt item={item} view="front" id={`${itemUid}-f`} />
                            </span>
                          </span>
                          <span className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                            <GarmentArt item={item} view="back" id={`${itemUid}-b`} />
                          </span>
                        </span>
                      </span>
                    </span>
                  </button>

                  <span
                    aria-hidden="true"
                    className="pr-tag absolute flex flex-col items-center"
                    style={{
                      left: "calc(var(--gw) * .74)",
                      top: `calc(${GARMENT_TOP}px + var(--gh) * .06)`,
                      animationDelay: `${tagDelay}s`,
                    }}
                  >
                    <span className="h-[14px] w-px" style={{ background: "color-mix(in oklab, var(--foreground) 55%, transparent)" }} />
                    <span
                      className="rounded-[2px] px-1.5 py-0.5 text-[10px] font-semibold leading-none tabular-nums shadow-sm"
                      style={{ background: "var(--pr-tag)", color: "black" }}
                    >
                      {item.price}
                    </span>
                  </span>

                  <Hanger
                    className="absolute left-1/2 top-0 -translate-x-1/2"
                    style={{ width: "calc(var(--gw) * .42)", height: "calc(var(--gw) * .34)" }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mx-auto mt-6 flex min-h-[8.5rem] max-w-md flex-col items-center px-6 text-center" aria-live="polite">
        <div key={activeItem?.id ?? "none"} className="pr-fade flex flex-col items-center">
          {activeItem && active !== null ? (
            <>
              <p className="text-lg font-semibold">
                {activeItem.name} <span className="tabular-nums text-muted-foreground">{activeItem.price}</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{activeItem.description}</p>
              <button
                type="button"
                onClick={() => onShop?.(activeItem, active)}
                className="mt-5 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Shop the edit
              </button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Pick a piece on the rail to see it turn.</p>
          )}
        </div>
      </div>

      {overlayItem && overlay ? (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/60 p-6 backdrop-blur-md"
          style={{ "--garment": overlayItem.color } as CSSProperties}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${headingId}-detail`}
            className="grid w-full max-w-3xl gap-8 rounded-2xl border bg-card p-6 text-card-foreground shadow-xl md:grid-cols-2 md:p-10"
          >
            <div className="relative mx-auto h-[330px] w-[200px] shrink-0">
              <span aria-hidden="true" className="absolute left-1/2 top-0 h-6 w-px -translate-x-1/2 bg-foreground/50" />
              <Hanger className="absolute left-1/2 top-[10px] -translate-x-1/2" style={{ width: 64, height: 51 }} />
              <span className="absolute inset-x-0 bottom-0 top-[60px] block" style={{ perspective: 1100 }}>
                <span className="pr-ry block h-full w-full" style={{ transform: `rotateY(${overlay.back ? 180 : 0}deg)` }}>
                  <span className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
                    <GarmentArt item={overlayItem} view="front" id={`${uid}-overlay-f`} />
                  </span>
                  <span className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                    <GarmentArt item={overlayItem} view="back" id={`${uid}-overlay-b`} />
                  </span>
                </span>
              </span>
            </div>

            <div className="flex min-w-0 flex-col">
              <p className="text-xs font-medium tabular-nums tracking-[0.2em] text-muted-foreground">
                {String(overlay.index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </p>
              <h3 id={`${headingId}-detail`} className="mt-3 text-balance text-3xl font-semibold tracking-tight">
                {overlayItem.name}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{overlayItem.description}</p>
              <ul className="mt-5 flex flex-wrap gap-2 p-0">
                <li className="list-none rounded-full border px-3 py-1 text-xs">{KIND_LABEL[overlayItem.kind]}</li>
                <li className="list-none rounded-full border px-3 py-1 text-xs tabular-nums">{overlayItem.price}</li>
              </ul>

              <div role="group" aria-label="Garment face" className="mt-6 inline-flex w-fit rounded-full border p-1 text-sm">
                <button
                  type="button"
                  aria-pressed={!overlay.back}
                  onClick={() => setOverlay({ index: overlay.index, back: false })}
                  className={cn("rounded-full px-4 py-1.5", !overlay.back ? "bg-foreground text-background" : "text-muted-foreground")}
                >
                  Front
                </button>
                <button
                  type="button"
                  aria-pressed={overlay.back}
                  onClick={() => setOverlay({ index: overlay.index, back: true })}
                  className={cn("rounded-full px-4 py-1.5", overlay.back ? "bg-foreground text-background" : "text-muted-foreground")}
                >
                  Back
                </button>
              </div>

              <div className="mt-auto flex justify-end pt-8">
                <button
                  ref={closeButton}
                  type="button"
                  onClick={() => setOverlay(null)}
                  className="rounded-full border px-4 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Close ×
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
