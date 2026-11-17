import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type PhoneFeatureItem = {
  title: string;
  /** Shown under the active title (desktop) and in the summary (mobile). */
  description: string;
  /** Content of the phone screen; it is laid out in a 313 x 640 box. */
  screen: ReactNode;
};

export type PhoneFeatureTabsProps = {
  items: PhoneFeatureItem[];
  heading?: ReactNode;
  /** Index selected on mount. */
  defaultIndex?: number;
  className?: string;
};

const EASE = "cubic-bezier(.4,0,.2,1)";
const PHONE_W = 313;
const PHONE_H = 640;
const POSE = {
  front: "translateX(0px) scale(1)",
  rear: "translateX(195px) scale(.89375)",
  left: "translateX(-380px) scale(1)",
  right: "translateX(540px) scale(.89375)",
};

type Role = "front" | "rear" | "hidden";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function useMedia(query: string) {
  const [matches, setMatches] = useState(false);
  useIsoLayoutEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}

/**
 * A list of expandable capabilities synced to a carousel of phone screens.
 * Desktop: the active row expands and a second phone peeks behind the front one.
 * Narrow (<= 800px): chips under the phone; choosing one expands a summary with prev/next.
 */
export function PhoneFeatureTabs({ items, heading, defaultIndex = 0, className }: PhoneFeatureTabsProps) {
  const uid = useId();
  const count = items.length;
  const mobile = useMedia("(max-width:800px)");
  const [current, setCurrent] = useState(Math.min(defaultIndex, count - 1));
  const [expanded, setExpanded] = useState(false); // mobile only
  const [status, setStatus] = useState(items[current]?.title ?? "");
  if (count > 0 && current > count - 1) setCurrent(count - 1);

  const panelRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const screenRefs = useRef<(HTMLDivElement | null)[]>([]);
  const roles = useRef<Role[]>([]);
  const screenAnims = useRef<Animation[]>([]);
  const screenRun = useRef(0);
  const cardAnims = useRef<Animation[]>([]);
  const panelAnim = useRef<Animation[]>([]);
  const currentRef = useRef(current);
  currentRef.current = current;
  const mobileRef = useRef(mobile);
  mobileRef.current = mobile;

  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Once-only scroll reveal: heading 800ms / panel 1000ms, fires when the element is 35% above the viewport bottom.
  const headingRef = useRef<HTMLHeadingElement>(null);
  useIsoLayoutEffect(() => {
    if (reducedMotion() || !("IntersectionObserver" in window)) return;
    const targets: [HTMLElement | null, boolean][] = [[headingRef.current, false], [panelRef.current, true]];
    targets.forEach(([el]) => el && (el.style.opacity = "0"));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return;
          io.unobserve(target);
          const el = target as HTMLElement;
          const card = el === panelRef.current;
          el.style.removeProperty("opacity");
          el.animate(
            [{ opacity: 0, translate: card ? "0 32px" : "0 18px", scale: card ? ".96" : "1" }, { opacity: 1, translate: "0 0", scale: "1" }],
            { duration: card ? 1000 : 800, easing: "cubic-bezier(.25,.1,.25,1)", fill: "backwards" },
          );
        }),
      { threshold: 0, rootMargin: `0px 0px -${Math.round(window.innerHeight * 0.35)}px 0px` },
    );
    targets.forEach(([el]) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  // Scale the phone track to the stage.
  useIsoLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      stage.style.setProperty("--phone-scale", String(Math.min(1, width / (mobileRef.current ? PHONE_W : 475), height / PHONE_H)));
    });
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  const moveScreens = useCallback(
    (index: number, direction: 1 | -1, initial: boolean, instant: boolean) => {
      const layers = layerRefs.current;
      const run = ++screenRun.current;
      const snap = layers.map((layer, i) => {
        const screen = screenRefs.current[i];
        const cs = layer ? getComputedStyle(layer) : null;
        return {
          transform: cs?.transform ?? "none",
          opacity: cs?.opacity ?? "0",
          visibility: cs?.visibility ?? "hidden",
          imageOpacity: screen ? getComputedStyle(screen).opacity : "1",
          role: roles.current[i] ?? "hidden",
        };
      });
      screenAnims.current.forEach((a) => a.cancel());
      screenAnims.current = [];
      const n = layers.length;
      const next = (index + 1) % n;
      const reduced = instant || reducedMotion();
      const oldIndex = snap.findIndex((s) => s.role === "front");
      const distance = (index - oldIndex + n) % n;
      const crossfade = !initial && distance > 1 && distance < n - 1;
      const nextRoles: Role[] = layers.map((_, i) => (i === index ? "front" : i === next ? "rear" : "hidden"));

      layers.forEach((layer, i) => {
        if (!layer) return;
        const s = snap[i];
        const role = nextRoles[i];
        const visible = role !== "hidden";
        const wasVisible = s.visibility !== "hidden" && Number(s.opacity) > 0;
        const entrance = role === "front" ? POSE.front : POSE.rear;
        const from = wasVisible ? s.transform : crossfade ? entrance : direction < 0 ? POSE.left : POSE.right;
        const to = visible ? entrance : crossfade ? from : direction < 0 ? POSE.right : POSE.left;
        layer.dataset.role = role;
        layer.style.zIndex = String(role === "front" ? 4 : s.role === "front" ? 3 : 1);
        layer.style.transform = to;
        layer.style.opacity = visible ? "1" : "0";
        layer.style.visibility = visible || wasVisible ? "visible" : "hidden";
        layer.dataset.suppressed = String(s.role !== "front" && role !== "front");
        const screen = screenRefs.current[i];
        if (!screen) return;
        screen.style.opacity = role === "rear" ? ".6" : "1";
        if (!initial && !reduced && (visible || wasVisible)) {
          const movement = { duration: crossfade ? 320 : 560, easing: EASE, fill: "both" as const };
          const fade = { duration: 320, easing: EASE, fill: "both" as const };
          screenAnims.current.push(layer.animate([{ transform: from }, { transform: to }], movement));
          screenAnims.current.push(layer.animate([{ opacity: wasVisible ? Number(s.opacity) : 0 }, { opacity: visible ? 1 : 0 }], fade));
          screenAnims.current.push(screen.animate([{ opacity: Number(s.imageOpacity) }, { opacity: role === "rear" ? 0.6 : 1 }], fade));
        }
      });
      roles.current = nextRoles;
      const anims = [...screenAnims.current];
      const settle = () => {
        if (run !== screenRun.current) return;
        layers.forEach((layer, i) => {
          if (!layer) return;
          layer.style.visibility = nextRoles[i] === "hidden" ? "hidden" : "visible";
          layer.style.zIndex = nextRoles[i] === "front" ? "3" : "1";
          layer.dataset.suppressed = "false";
        });
        anims.forEach((a) => a.cancel());
        screenAnims.current = [];
      };
      if (anims.length) Promise.all(anims.map((a) => a.finished.catch(() => {}))).then(settle);
      else settle();
    },
    [],
  );

  // Initial pose (and re-pose when the layout switches between desktop and mobile).
  useIsoLayoutEffect(() => {
    roles.current = [];
    layerRefs.current.length = Math.min(layerRefs.current.length, count);
    screenRefs.current.length = Math.min(screenRefs.current.length, count);
    layerRefs.current.forEach((l) => l && (l.style.transition = "none"));
    moveScreens(currentRef.current, 1, true, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobile, count]);

  // Rows animate their height on mobile expand/collapse.
  const animatePanel = (change: () => void, toExpanded: boolean) => {
    const panel = panelRef.current!;
    const from = panel.getBoundingClientRect().height;
    panelAnim.current.forEach((a) => a.cancel());
    panelAnim.current = [];
    flushSync(change);
    if (!mobileRef.current || reducedMotion()) return;
    const to = panel.getBoundingClientRect().height;
    if (Math.abs(to - from) > 1) {
      const a = panel.animate([{ height: `${from}px`, minHeight: "0px" }, { height: `${to}px`, minHeight: "0px" }], { duration: 420, easing: EASE });
      a.onfinish = () => a.cancel();
      panelAnim.current.push(a);
    }
    const content = panel.querySelector<HTMLElement>(toExpanded ? "[data-summary]" : "[data-chips]");
    if (content) {
      panelAnim.current.push(
        content.animate([{ opacity: 0, translate: "0 5px" }, { opacity: 1, translate: "0 0" }], {
          duration: 260,
          delay: toExpanded ? 80 : 0,
          easing: "cubic-bezier(.25,.1,.25,1)",
          fill: "backwards",
        }),
      );
    }
  };

  const select = (index: number, direction?: 1 | -1, keyboard = false) => {
    const dir = direction ?? (index < currentRef.current ? -1 : 1);
    setStatus(items[index].title);
    if (mobileRef.current) {
      const was = expanded;
      const expand = () => {
        setExpanded(true);
        setCurrent(index);
      };
      if (!was && !keyboard) animatePanel(expand, true);
      else expand();
      if (index !== currentRef.current) moveScreens(index, dir, false, keyboard);
      if (!was) requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("[data-close]")?.focus({ preventScroll: true }));
      return;
    }
    if (index === currentRef.current) return;
    const skip = keyboard || reducedMotion();
    panelRef.current?.querySelectorAll("[data-departing]").forEach((n) => n.remove());
    const opts = optionRefs.current as HTMLButtonElement[];
    const prev = opts[currentRef.current];
    const outgoing = prev?.querySelector<HTMLElement>("[data-description]")?.cloneNode(true) as HTMLElement | undefined;
    const old = opts.map((c) => c.getBoundingClientRect());
    cardAnims.current.forEach((a) => a.cancel());
    cardAnims.current = [];
    flushSync(() => setCurrent(index));
    const nxt = opts.map((c) => c.getBoundingClientRect());
    const desc = opts[index].querySelector<HTMLElement>("[data-description]")!;
    if (!skip) {
      const w = desc.getBoundingClientRect().width;
      desc.style.width = `${w}px`;
      desc.style.maxWidth = "none";
      if (outgoing && prev) {
        outgoing.removeAttribute("id");
        outgoing.removeAttribute("data-description");
        outgoing.setAttribute("data-departing", "");
        outgoing.setAttribute("aria-hidden", "true");
        outgoing.className = "pointer-events-none absolute left-7 top-14 block w-[300px] max-w-none text-[20px] leading-[25px] tracking-[-.45px] text-muted-foreground";
        prev.appendChild(outgoing);
        outgoing.animate([{ opacity: 1 }, { opacity: 0, transform: "translateY(-4px)" }], { duration: 260, easing: EASE, fill: "forwards" }).onfinish = () => outgoing.remove();
      }
      opts.forEach((card, i) => {
        const a = card.animate(
          [{ transform: `translate(${old[i].left - nxt[i].left}px,${old[i].top - nxt[i].top}px)` }, { transform: "translate(0,0)" }],
          { duration: 360, easing: EASE },
        );
        cardAnims.current.push(a);
        a.onfinish = () => {
          if (i === index) {
            desc.style.removeProperty("width");
            desc.style.removeProperty("max-width");
          }
        };
      });
      desc.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, fill: "backwards", easing: EASE });
    }
    moveScreens(index, dir, false, keyboard);
  };

  const close = () => {
    animatePanel(() => setExpanded(false), false);
    requestAnimationFrame(() => {
      const el = optionRefs.current[currentRef.current];
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" as ScrollBehavior });
    });
  };

  const onKey = (e: KeyboardEvent, i: number) => {
    let n: number | undefined;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") n = (i + 1) % count;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = (i + count - 1) % count;
    if (e.key === "Home") n = 0;
    if (e.key === "End") n = count - 1;
    if (n === undefined) return;
    e.preventDefault();
    optionRefs.current[n]?.focus();
    select(n, e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 1, true);
  };

  const step = (d: 1 | -1) => select((currentRef.current + d + count) % count, d);

  // Leaving mobile resets the expanded state.
  useIsoLayoutEffect(() => {
    if (!mobile) setExpanded(false);
  }, [mobile]);

  const showChips = mobile && !expanded;
  const showSummary = mobile && expanded;
  const active = items[current];

  const circle =
    "grid size-[52px] shrink-0 place-items-center rounded-full bg-muted text-foreground transition-[background-color,transform] duration-200 hover:bg-accent active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring max-[800px]:size-11 motion-reduce:transition-none";

  return (
    <section className={cn("w-full text-foreground", className)}>
      {heading ? (
        <h2 ref={headingRef} className="text-center text-[clamp(32px,7vw,44px)] font-semibold leading-[1.08] tracking-[-.23px] min-[801px]:text-[56px]">{heading}</h2>
      ) : null}
      <div
        ref={panelRef}
        className={cn(
          "relative mt-10 overflow-hidden bg-card text-card-foreground min-[801px]:mt-16",
          "max-[800px]:grid max-[800px]:min-h-[620px] max-[800px]:grid-cols-[minmax(0,1fr)] max-[800px]:grid-rows-[44px_minmax(0,1fr)_auto] max-[800px]:gap-5 max-[800px]:rounded-[28px] max-[800px]:px-3 max-[800px]:pb-6 max-[800px]:pt-4 max-[380px]:min-h-[570px]",
          "min-[801px]:flex min-[801px]:h-[756px] min-[801px]:items-start min-[801px]:gap-8 min-[801px]:rounded-[36px] min-[801px]:p-10 min-[1051px]:gap-12 min-[1200px]:gap-[84px] min-[1200px]:p-12",
        )}
      >
        {/* Mobile close */}
        {showSummary ? (
          <button
            type="button"
            data-close
            aria-label="Collapse capabilities"
            onClick={close}
            className="z-[5] row-start-1 mr-1 grid size-11 shrink-0 place-items-center justify-self-end rounded-full bg-muted text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <X className="size-6" aria-hidden />
          </button>
        ) : null}

        {/* List column */}
        <div className={cn("flex min-w-0 flex-col gap-6 min-[801px]:h-full min-[801px]:w-[356px] min-[801px]:flex-none max-[1050px]:min-[801px]:w-[320px]", mobile && "contents")}>
          <div
            data-chips={showChips ? "" : undefined}
            role="group"
            aria-label="Explore capabilities"
            className={cn(
              "flex min-w-0 flex-col items-start gap-4 min-[801px]:w-full",
              mobile && "row-start-3 w-full flex-row gap-2.5 overflow-x-auto overscroll-x-contain p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              showSummary && "hidden",
            )}
          >
            {items.map((item, i) => {
              const isActive = !mobile && i === current;
              const mobileActive = mobile && expanded && i === current;
              return (
                <button
                  key={item.title}
                  ref={(el) => {
                    optionRefs.current[i] = el;
                  }}
                  type="button"
                  id={`${uid}-feature-${i}`}
                  aria-expanded={isActive || mobileActive}
                  aria-controls={`${uid}-desc-${i}`}
                  onClick={(e) => select(i, undefined, e.detail === 0)}
                  onKeyDown={(e) => onKey(e, i)}
                  className={cn(
                    "relative block w-max max-w-full cursor-pointer select-none overflow-hidden rounded-[32px] bg-muted py-3.5 pl-3.5 pr-8 text-left text-foreground focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ring",
                    isActive && "px-7 py-6 max-[1199px]:px-7 max-[380px]:p-[22px]",
                    mobile && "max-w-none flex-none py-3.5 pl-3.5 pr-5",
                  )}
                >
                  <span className={cn("flex items-center gap-3 whitespace-nowrap text-[20px] font-semibold leading-[25px] tracking-[-.45px]", isActive && "text-[22px] font-bold leading-7 tracking-[-.26px] max-[1199px]:text-[20px]")}>
                    {!isActive ? (
                      <span className="flex size-6 flex-none items-center justify-center" aria-hidden>
                        <Plus className="size-6" strokeWidth={1.75} />
                      </span>
                    ) : null}
                    <span>{item.title}</span>
                  </span>
                  <span
                    id={`${uid}-desc-${i}`}
                    data-description
                    className={cn(
                      "mt-1 w-[300px] max-w-full whitespace-normal text-[20px] font-normal leading-[25px] tracking-[-.45px] text-muted-foreground max-[1199px]:text-[18px]",
                      isActive ? "block" : "hidden",
                    )}
                  >
                    {item.description}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Controls: below the list on desktop, overlaying the summary row on mobile */}
          {!mobile || showSummary ? (
            <div
              className={cn(
                "flex gap-2 min-[801px]:mt-auto",
                mobile && "pointer-events-none z-[3] col-start-1 row-start-3 m-0 items-center justify-between self-center",
              )}
            >
              <button type="button" aria-label="Previous capability" onClick={() => step(-1)} className={cn(circle, mobile && "pointer-events-auto")}>
                <ChevronLeft className="size-6" aria-hidden />
              </button>
              <button type="button" aria-label="Next capability" onClick={() => step(1)} className={cn(circle, mobile && "pointer-events-auto")}>
                <ChevronRight className="size-6" aria-hidden />
              </button>
            </div>
          ) : null}
          <span className="sr-only" aria-live="polite">
            {status}
          </span>
        </div>

        {showSummary ? (
          <div
            data-summary
            aria-live="polite"
            className="col-start-1 row-start-3 mx-[52px] min-w-0 rounded-3xl bg-muted p-5 text-base leading-[23px] text-muted-foreground max-[380px]:p-3.5"
          >
            <strong className="font-semibold text-foreground">{active.title}. </strong>
            {active.description}
          </div>
        ) : null}

        {/* Phone stage */}
        <div
          ref={stageRef}
          className={cn(
            "relative min-w-0 [--phone-scale:1] min-[801px]:h-full min-[801px]:flex-1 min-[801px]:self-stretch",
            "max-[800px]:col-start-1 max-[800px]:row-start-2 max-[800px]:h-[440px] max-[800px]:w-full max-[800px]:self-center max-[380px]:h-[390px]",
          )}
        >
          <div
            className={cn("absolute bottom-0 left-1/2 h-[640px] origin-bottom [transform:translateX(-50%)_scale(var(--phone-scale))]", mobile ? "w-[313px]" : "w-[475px]")}
          >
            {items.map((item, i) => (
              <div
                key={item.title}
                ref={(el) => {
                  layerRefs.current[i] = el;
                }}
                data-role="hidden"
                aria-hidden={i !== current}
                inert={i !== current}
                className="absolute bottom-0 left-0 h-[640px] w-[313px] origin-bottom-left invisible will-change-transform data-[role=rear]:max-[800px]:hidden data-[suppressed=true]:max-[800px]:hidden"
              >
                <div
                  ref={(el) => {
                    screenRefs.current[i] = el;
                  }}
                  className="absolute inset-0 h-[640px] w-[313px] will-change-[opacity]"
                >
                  {/* Device: 6px transparent margin, 9px black bezel, 46px outer radius, metal rim, drop shadow. */}
                  <div className="absolute inset-[6px] overflow-hidden rounded-[46px] bg-card">
                    <div className="absolute -left-[6px] -top-[6px] h-[640px] w-[313px]">{item.screen}</div>
                  </div>
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-[6px] rounded-[46px] border-[9px] border-[#0e0e10] shadow-[0_0_0_1.5px_#7a7a80,inset_0_0_0_1px_rgb(255_255_255/.14),0_22px_40px_-16px_rgb(0_0_0/.38)]"
                  />
                  <div aria-hidden className="pointer-events-none absolute left-1/2 top-[17px] h-[25px] w-[88px] -translate-x-1/2 rounded-full bg-[#0e0e10]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default PhoneFeatureTabs;
