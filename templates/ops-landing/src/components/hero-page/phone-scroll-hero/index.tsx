"use client";

import Lenis from "lenis";
import { DollarSign, HardHat, ShieldCheck, Truck } from "lucide-react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@/lib/utils";
import frame from "./assets/iphone-frame.webp";
import { ChatScreen } from "./chat-screen";
import {
  HeroProgressContext,
  clamp,
  createHeroStore,
  ease,
  lerp,
  smooth,
} from "./progress";

export { ChatScreen, defaultChat, type ChatScreenProps, type ChatBrief } from "./chat-screen";
export { useHeroStore, type HeroProgress, type HeroStore } from "./progress";

export type HeroMode = "day" | "night";

export type HeroSource = {
  /** Badge label, e.g. "Fleet". */
  label: string;
  /** Metric headline, e.g. "Nine slots still open". */
  title: string;
  /** Body copy; each entry is one line on wide screens. */
  lines: string[];
  icon?: ReactNode;
};

export type PhoneScrollHeroProps = {
  /** Text beside the laurels. */
  badge?: ReactNode;
  /** Headline; a function receives the current time of day. */
  title?: ReactNode | ((mode: HeroMode) => ReactNode);
  description?: ReactNode;
  cta?: { label: string; href: string };
  /** Up to four cards placed around the phone, left and right alternately. */
  sources?: HeroSource[];
  /** The phone screen, drawn at 402 by 876 CSS px and scaled into the frame. Defaults to the chat and brief demo. */
  children?: ReactNode;
  /** "auto" follows the visitor's clock: night 20:00 to 07:59. */
  mode?: HeroMode | "auto";
  /** Sky gradient stops, top to bottom, for each mode. */
  sky?: Record<HeroMode, string[]>;
  /** Height of a sticky header above the hero; the stage pins below it. */
  headerOffset?: number;
  /** Wheel speed through the hero with Lenis smooth scrolling on desktop; 1 disables the slowdown. */
  scrollSpeed?: number;
  /** Smooth wheel scrolling with Lenis on desktop pointers. */
  smoothScroll?: boolean;
  /** Zero-height element marking where the hero ends, for a header that collapses after it. */
  endRef?: RefObject<HTMLDivElement | null>;
  endId?: string;
  className?: string;
};

export const defaultSources: HeroSource[] = [
  {
    label: "Trucks",
    title: "Eight units still open",
    lines: ["Matched drivers to tomorrow's", "loads and flagged two units", "that are due for service."],
    icon: <Truck />,
  },
  {
    label: "Claims",
    title: "One claim waiting on paperwork",
    lines: ["The insurer asked for photos", "and a repair estimate before", "it pays out."],
    icon: <ShieldCheck />,
  },
  {
    label: "Compliance",
    title: "Annual checks this week",
    lines: ["Most checks have a slot.", "One tractor still needs a", "date before the weekend."],
    icon: <HardHat />,
  },
  {
    label: "Revenue",
    title: "Gross ahead of last week",
    lines: ["Lanes out of Texas carried it.", "A recovery invoice is waiting", "for your sign-off."],
    icon: <DollarSign />,
  },
];

export const defaultSky: Record<HeroMode, string[]> = {
  night: ["#101c46", "#1d2d5b", "#293d70", "#475481", "#656a91", "#a08da7", "#c5b7c8"],
  day: ["#315b89", "#4b739d", "#658bb0", "#83a1be", "#a1b6cb", "#d9cad0", "#f0dece"],
};

const SKY_OFFSETS = [0.10724, 0.22433, 0.34143, 0.4268, 0.51216, 0.64225, 0.77234];

/** The site's sky: one radial gradient in a 1440 by 1587.3 sheet, stretched to the viewport. */
function skyImage(stops: string[]) {
  const s = stops
    .map((color, i) => {
      // The site's seven stops keep their exact offsets; other counts spread over the same range.
      const offset = stops.length === 7 ? SKY_OFFSETS[i] : 0.10724 + (i / Math.max(1, stops.length - 1)) * 0.6651;
      return `<stop stop-color="${color}" offset="${offset}"/>`;
    })
    .join("");
  const svg = `<svg viewBox="0 0 1440 1587.3" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><rect width="100%" height="100%" fill="url(#s)"/><defs><radialGradient id="s" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="10" gradientTransform="matrix(-0.0000090905 249.37 -380.36 -0.000012403 720 -324.27)">${s}</radialGradient></defs></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const clockMode = (): HeroMode => {
  const hour = new Date().getHours();
  return hour >= 20 || hour < 8 ? "night" : "day";
};

function useMode(mode: HeroMode | "auto") {
  const [current, setCurrent] = useState<HeroMode>(mode === "auto" ? "night" : mode);
  useEffect(() => {
    if (mode !== "auto") {
      setCurrent(mode);
      return;
    }
    const apply = () => setCurrent(clockMode());
    const visible = () => {
      if (!document.hidden) apply();
    };
    apply();
    const timer = setInterval(apply, 60000);
    document.addEventListener("visibilitychange", visible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [mode]);
  return current;
}

/** Nearest scrolling ancestor, or null for the window. */
function scrollParent(el: HTMLElement): HTMLElement | null {
  for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll") return node;
  }
  return null;
}

function Laurel({ flip }: { flip?: boolean }) {
  const leaves = [
    { y: 37, r: -58 },
    { y: 30, r: -48 },
    { y: 23, r: -38 },
    { y: 16, r: -26 },
    { y: 9, r: -12 },
  ];
  return (
    <svg
      viewBox="0 0 28 43"
      className="h-[43px] w-7 flex-none opacity-65 max-[800px]:h-[38px] max-[800px]:w-[25px]"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden
      fill="currentColor"
    >
      <path d="M22 41 C10 34 7 20 13 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      {leaves.map((leaf, i) => {
        const x = 13 - (Math.cos((leaf.y / 43) * Math.PI) * 4 + 1);
        return (
          <g key={i} transform={`translate(${x + 1.5} ${leaf.y}) rotate(${leaf.r})`}>
            <ellipse cx="-5" cy="0" rx="5.2" ry="2.1" />
            <ellipse cx="4.6" cy="-1" rx="4.6" ry="1.9" transform="rotate(64)" />
          </g>
        );
      })}
      <ellipse cx="13.6" cy="3" rx="1.9" ry="3.6" transform="rotate(18 13.6 3)" />
    </svg>
  );
}

const CONNECTOR_PATH =
  "M1 18C28 -2 60 -4 90 18C122 40 150 38 172 18";

function Connector({ mirror, delay, lineRef }: { mirror: boolean; delay: number; lineRef: (el: HTMLDivElement | null) => void }) {
  const id = useId().replace(/:/g, "");
  return (
    <div ref={lineRef} className="psh-connector absolute top-0 left-0 h-[36.1304px] w-[172.711px] origin-top-left">
      <svg
        viewBox="0 0 172.711 36.1304"
        width="172.711"
        height="36.1304"
        overflow="visible"
        preserveAspectRatio="none"
        className="block"
        style={mirror ? { transform: "scaleX(-1)" } : undefined}
        fill="none"
      >
        <defs>
          <linearGradient id={id} x1="0.852787" y1="18.0652" x2="171.841" y2="18.0652" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" />
            <stop offset="0.25" stopColor="white" stopOpacity="0" />
            <stop offset="0.5" stopColor="white" />
            <stop offset="0.75" stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="white" />
          </linearGradient>
        </defs>
        <path d={CONNECTOR_PATH} strokeWidth="2" stroke={`url(#${id})`} vectorEffect="non-scaling-stroke" />
      </svg>
      <svg
        viewBox="0 0 172.711 36.1304"
        width="172.711"
        height="36.1304"
        overflow="visible"
        preserveAspectRatio="none"
        className="psh-glow absolute top-0 left-0"
        style={{ animationDelay: `${-delay}s`, ...(mirror ? { transform: "scaleX(-1)" } : {}) }}
        fill="none"
      >
        <path d={CONNECTOR_PATH} strokeWidth="2" stroke="white" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

const STYLES = `
.psh-glow{filter:drop-shadow(0 0 3px #fff);mask-image:linear-gradient(90deg,transparent,#000,transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000,transparent);mask-size:22px 100%;-webkit-mask-size:22px 100%;mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat;animation:psh-pulse 2.4s linear infinite paused}
.psh-pulsing .psh-glow{animation-play-state:running}
@keyframes psh-pulse{from{mask-position:-24px 0;-webkit-mask-position:-24px 0}to{mask-position:200px 0;-webkit-mask-position:200px 0}}
@keyframes psh-dot{50%{opacity:.4;transform:translateY(-3px)}}
@media(prefers-reduced-motion:reduce){.psh-glow{animation:none}}
`;

const DESIGN_WIDTH = 402;
const DESIGN_HEIGHT = 876;

export function PhoneScrollHero({
  badge = "Trusted by working fleets",
  title = (mode) => (
    <>
      Your fleet's {mode} crew, <br />
      always on call
    </>
  ),
  description = "An assistant that watches trucks, mail and compliance while you rest, then hands you a short list of what to do first.",
  cta = { label: "Get a demo", href: "#demo" },
  sources = defaultSources,
  children,
  mode = "auto",
  sky = defaultSky,
  headerOffset = 64,
  scrollSpeed = 0.7,
  smoothScroll = true,
  endRef,
  endId,
  className,
}: PhoneScrollHeroProps) {
  const current = useMode(mode);
  const rootRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const sourcesRef = useRef<HTMLDivElement>(null);
  const connectorsRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const requestRef = useRef<() => void>(() => {});
  const lenisRef = useRef<Lenis | null>(null);
  const store = useMemo(() => createHeroStore(() => requestRef.current()), []);
  const shown = sources.slice(0, 4);
  const offsetRef = useRef(headerOffset);
  offsetRef.current = headerOffset;

  // Scene: chat pacing hand-off, source arrival, screen expansion, detail scrub and sky travel.
  useEffect(() => {
    const root = rootRef.current!;
    const story = storyRef.current!;
    const stage = stageRef.current!;
    const phone = phoneRef.current!;
    const screen = screenRef.current!;
    const skySheet = skyRef.current!;
    const scroller = scrollParent(root);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = matchMedia("(max-width:700px)");
    const scrollTop = () => (scroller ? scroller.scrollTop : window.scrollY);
    const viewHeight = () => (scroller ? scroller.clientHeight : window.innerHeight);
    const viewWidth = () => (scroller ? scroller.clientWidth : window.innerWidth);
    const topOf = (el: HTMLElement) =>
      el.getBoundingClientRect().top - (scroller ? scroller.getBoundingClientRect().top : 0) + scrollTop();
    const timing = () => (mobileQuery.matches ? { open: 0.43, close: 0.32 } : { open: 1, close: 0.82 });
    const states = {
      nodes: { value: 0, from: 0, target: 0, start: 0 },
      expand: { value: 0, from: 0, target: 0, start: 0 },
    };
    type Tween = (typeof states)["nodes"];
    const tween = (s: Tween, target: number, time: number, duration: number) => {
      if (target !== s.target) {
        s.from = s.value;
        s.target = target;
        s.start = time;
      }
      s.value = lerp(s.from, s.target, smooth((time - s.start) / duration));
      return s.value;
    };
    let frame = 0;
    let seen = -1;
    let nodesGoal = 0;
    let expandGoal = 0;
    let initialized = false;
    let heroVisible = true;
    let contentStarted: number | null = null;
    let expandedAt = 0;
    let closedAt = 0;
    let readerAnchor: number | null = null;
    let lockY: number | null = null;
    let touching = false;
    let freshInput = false;
    // Set by anchor navigation (a "psh:programmatic-scroll" window event); such scrolls cross thresholds without a hold.
    let programmatic = false;
    let programmaticTimer = 0;
    const endProgrammatic = () => {
      programmatic = false;
      clearTimeout(programmaticTimer);
    };
    const startProgrammatic = () => {
      if (reduced.matches) return;
      programmatic = true;
      if (lockY !== null) release();
      clearTimeout(programmaticTimer);
      programmaticTimer = window.setTimeout(endProgrammatic, 250);
      request();
    };
    let detailPosition = 0;
    const REVEAL_TOTAL = 290 + 400;
    // Scroll offsets where the story opens and closes the detail view.
    const threshold = (at: number) => topOf(story) - offsetRef.current + viewHeight() * at;
    // Jumps in place, cancelling Lenis momentum without stopping it.
    const jumpTo = (y: number) => {
      const lenis = lenisRef.current;
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else (scroller ?? window).scrollTo({ top: y, behavior: "instant" });
    };

    const request = () => {
      if (!frame && !document.hidden) frame = requestAnimationFrame(render);
    };
    requestRef.current = request;

    // Scrolling across a threshold holds the page there until the expansion finishes.
    function hold(target: number) {
      if (lockY !== null || reduced.matches) return;
      const t = timing();
      lockY = threshold(target ? t.open + 0.001 : t.close - 0.001);
      expandedAt = closedAt = 0;
      freshInput = false;
      expandGoal = target;
      if (target) {
        readerAnchor = null;
        contentStarted = null;
        detailPosition = 0;
        nodesGoal = mobileQuery.matches ? 0 : 1;
      }
      jumpTo(lockY);
      request();
    }
    function release() {
      const y = lockY;
      lockY = null;
      if (y !== null) jumpTo(y);
    }
    // A key or find-in-page jump that lands past a threshold finishes the scene in place
    // rather than pulling the visitor back to it.
    function settle(target: number, time: number) {
      expandGoal = target;
      expandedAt = closedAt = 0;
      freshInput = false;
      if (!target) return;
      nodesGoal = mobileQuery.matches ? 0 : 1;
      Object.assign(states.nodes, { value: nodesGoal, from: nodesGoal, target: nodesGoal });
      Object.assign(states.expand, { value: 1, from: 1, target: 1 });
      readerAnchor = threshold(timing().open + 0.001);
      expandedAt = time;
      contentStarted = time - REVEAL_TOTAL;
    }
    function wheel(event: WheelEvent) {
      if (event.ctrlKey || reduced.matches) return;
      endProgrammatic();
      const t = timing();
      const vh = viewHeight();
      const y = scrollTop();
      if (lockY !== null) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? vh : 1);
      const at = threshold(t.open);
      const back = threshold(t.close);
      if ((delta > 0 && expandGoal === 0 && y < at && y + delta >= at) || (delta < 0 && expandGoal === 1 && y > back && y + delta <= back)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        hold(delta > 0 ? 1 : 0);
        return;
      }
      if (states.expand.value > 0.999 && readerAnchor !== null) freshInput = true;
    }

    function render(time: number) {
      frame = 0;
      const offset = offsetRef.current;
      const vh = viewHeight();
      const top = topOf(story);
      const heroTop = topOf(root);
      const y = scrollTop();
      const mobile = mobileQuery.matches;
      const still = reduced.matches;
      const t = timing();
      const phase = Math.max(0, ((lockY ?? y) - top + offset) / vh);
      root.style.setProperty("--psh-vh", `${vh}px`);
      root.style.setProperty("--psh-offset", `${offset}px`);

      if (!initialized) {
        initialized = true;
        // A page that loads past the threshold shows the finished scene.
        if (phase > t.open) settle(1, time);
      }
      if (mobile) nodesGoal = 0;
      else if (phase > 0.46) nodesGoal = 1;
      else if (phase < 0.3) nodesGoal = 0;
      if (lockY === null) {
        // Scrolling across a threshold holds; a jump of more than half a screen settles.
        const jumped = (at: number) => Math.abs(y - threshold(at)) > vh * 0.5;
        if (phase > t.open && expandGoal === 0) {
          if (programmatic || jumped(t.open)) settle(1, time);
          else hold(1);
        } else if (phase < t.close && expandGoal === 1) {
          if (programmatic || jumped(t.close)) settle(0, time);
          else hold(0);
        }
      }

      const nodes = still ? 0 : tween(states.nodes, nodesGoal, time, 480);
      const ready = store.isReady();
      const expansion = still ? 0 : tween(states.expand, (mobile || nodes > 0.999) && ready ? expandGoal : 0, time, 760);
      if (expansion > 0.5 && expandGoal === 1 && contentStarted === null) contentStarted = time;
      if (expansion < 0.00001 && expandGoal === 0) {
        contentStarted = null;
        detailPosition = 0;
        readerAnchor = null;
        if (!closedAt) closedAt = time;
      }
      const contentElapsed = contentStarted === null ? -1e4 : time - contentStarted;
      const contentComplete = contentElapsed >= REVEAL_TOTAL;
      if (expansion > 0.99999 && contentComplete && expandGoal === 1 && !expandedAt) {
        expandedAt = time;
        readerAnchor = lockY ?? y;
        freshInput = false;
      }
      // The hold lasts only as long as the animation; continued wheel momentum must not extend it.
      const settled = expandGoal ? expandedAt : closedAt;
      if (lockY !== null && settled && time - settled > 80 && !touching) {
        if (expandGoal) readerAnchor = lockY;
        release();
      }
      const bodyStart = (readerAnchor ?? threshold(t.open + 0.001)) + vh * 0.04;
      if (!still && expansion > 0.99999 && contentComplete && lockY === null && freshInput)
        detailPosition = clamp((y - bodyStart) / (vh * 0.48));
      const detailProgress = still ? 0 : detailPosition;

      // The phone's full height is reserved in the sticky stage; at the end it leaves with the section.
      const scale = phone.clientWidth / 450;
      const phoneHeight = phone.getBoundingClientRect().height;
      stage.style.setProperty("--phone-height", `${phoneHeight}px`);
      if (!still) story.style.height = `${Math.max(mobile ? 0 : vh - offset, phoneHeight) + vh * (t.open + 0.04 + 0.48 + 0.08)}px`;
      else story.style.removeProperty("height");
      screen.style.setProperty("--psh-screen-scale", String(screen.parentElement!.clientWidth / DESIGN_WIDTH));

      seen = still ? 1 : Math.max(seen, phase);
      store.set({ phase, seen, nodes, expansion, contentElapsed, detailProgress, mobile, reduced: still });

      const visibility = mobile ? 0 : 1;
      const alpha = nodes * visibility;
      const sceneScale = Math.min(1, viewWidth() / 1440, vh / 900);
      stage.style.setProperty("--scene-scale", String(sceneScale));
      const sourcesEl = sourcesRef.current;
      const connectors = connectorsRef.current;
      if (sourcesEl && connectors) {
        sourcesEl.setAttribute("aria-hidden", String(alpha < 0.1));
        connectors.style.opacity = mobile ? "0" : String(alpha);
        // The glow repaints every frame, so it runs only while the connectors can be seen.
        connectors.classList.toggle("psh-pulsing", heroVisible && !mobile && alpha > 0.01);
        const cards = cardRefs.current;
        cards.forEach((card, i) => {
          if (!card) return;
          const arrival = ease((nodes - i * 0.07) / 0.79);
          card.style.opacity = String(arrival * visibility);
          card.style.transform = `translateY(${(1 - arrival) * 24}px) scale(${(mobile ? 1 : Math.min(0.9, sceneScale)) * lerp(0.97, 1, arrival)})`;
        });
        // Fixed diagram geometry: neither end follows the arriving cards.
        const layout = layoutRef.current;
        if (!mobile && layout) {
          const l = layout.getBoundingClientRect();
          const box = stage.getBoundingClientRect();
          const phoneLeft = (box.width - phone.clientWidth) / 2;
          cards.forEach((card, i) => {
            const line = lineRefs.current[i];
            if (!card || !line) return;
            const left = i % 2 === 0;
            const cardScale = Math.min(0.9, sceneScale);
            const badgeEl = card.firstElementChild as HTMLElement;
            const bodyEl = card.lastElementChild as HTMLElement;
            const badgeHeight = badgeEl.offsetHeight + parseFloat(getComputedStyle(badgeEl).marginBottom);
            const sourceTop = (i < 2 ? 163.5 : 505.5) * sceneScale;
            const x1 = (left ? l.left + 356 * cardScale : l.right - 356 * cardScale) - box.left;
            const y1 = l.top - box.top + sourceTop + (badgeHeight + bodyEl.offsetHeight / 2) * cardScale;
            const x2 = phoneLeft + (left ? 24 : 426) * scale;
            const y2 = (i < 2 ? 388 : 570) * scale;
            const dx = x2 - x1;
            const dy = y2 - y1;
            line.style.transform = `translate(${x1}px,${y1}px) rotate(${Math.atan2(dy, dx)}rad) scale(${Math.hypot(dx, dy) / 172.711},${Math.max(0.4, sceneScale)}) translateY(-18.0652px)`;
          });
        }
      }

      // The sky travels up through the first part of the scene, then holds.
      const skyHeight = Math.max(1587.3, vh * 1.7637);
      const freezeAt = Math.max(1, top - heroTop - offset + vh * 0.46);
      const skyY = still ? 0 : -(skyHeight - vh) * clamp((y - heroTop) / freezeAt);
      skySheet.style.height = `${skyHeight}px`;
      skySheet.style.transform = `translateY(${skyY.toFixed(3)}px)`;

      const moving = Object.values(states).some((s) => Math.abs(s.value - s.target) > 0.000001) || (expandGoal && nodes > 0.999 && expansion < 1);
      if (!still && (moving || lockY !== null || (contentStarted !== null && !contentComplete && expansion > 0.01))) request();
    }

    const target: HTMLElement | Window = scroller ?? window;
    const onScroll = () => {
      const y = scrollTop();
      if (programmatic) {
        clearTimeout(programmaticTimer);
        programmaticTimer = window.setTimeout(endProgrammatic, 250);
      }
      if (lockY !== null && Math.abs(y - lockY) > 1) jumpTo(lockY);
      else if (readerAnchor !== null && expandedAt && performance.now() - expandedAt > 120 && Math.abs(y - readerAnchor) > 1)
        freshInput = true;
      if (heroVisible || lockY !== null) request();
    };
    const touchStart = () => {
      touching = true;
      endProgrammatic();
      if (readerAnchor !== null && lockY === null) freshInput = true;
    };
    const touchEnd = () => {
      touching = false;
      request();
    };
    const touchMove = (event: TouchEvent) => {
      if (lockY !== null) event.preventDefault();
    };
    const reducedChange = () => {
      if (lockY !== null) release();
      request();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        heroVisible = entry!.isIntersecting;
        request();
      },
      { root: scroller },
    );
    observer.observe(root);
    const resize = new ResizeObserver(request);
    resize.observe(phone);
    if (scroller) resize.observe(scroller);
    target.addEventListener("scroll", onScroll, { passive: true });
    target.addEventListener("wheel", wheel as EventListener, { passive: false, capture: true });
    target.addEventListener("touchstart", touchStart, { passive: true });
    target.addEventListener("touchend", touchEnd, { passive: true });
    target.addEventListener("touchcancel", touchEnd, { passive: true });
    target.addEventListener("touchmove", touchMove as EventListener, { passive: false });
    window.addEventListener("resize", request, { passive: true });
    document.addEventListener("visibilitychange", request);
    reduced.addEventListener("change", reducedChange);
    mobileQuery.addEventListener("change", request);
    window.addEventListener("psh:programmatic-scroll", startProgrammatic);
    request();
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(programmaticTimer);
      window.removeEventListener("psh:programmatic-scroll", startProgrammatic);
      requestRef.current = () => {};
      observer.disconnect();
      resize.disconnect();
      target.removeEventListener("scroll", onScroll);
      target.removeEventListener("wheel", wheel as EventListener, { capture: true });
      target.removeEventListener("touchstart", touchStart);
      target.removeEventListener("touchend", touchEnd);
      target.removeEventListener("touchcancel", touchEnd);
      target.removeEventListener("touchmove", touchMove as EventListener);
      window.removeEventListener("resize", request);
      document.removeEventListener("visibilitychange", request);
      reduced.removeEventListener("change", reducedChange);
      mobileQuery.removeEventListener("change", request);
    };
  }, [store, shown.length]);

  // Lenis on desktop pointers. Wheel distance through the hero is mapped at `scrollSpeed`,
  // including gestures crossing its boundary; all distance beyond the hero stays 1:1.
  useEffect(() => {
    if (!smoothScroll) return;
    const root = rootRef.current!;
    const scroller = scrollParent(root);
    const desktop = matchMedia("(min-width:801px) and (hover:hover) and (pointer:fine)");
    const reduced = matchMedia("(prefers-reduced-motion:reduce)");
    let instance: Lenis | null = null;
    let frame = 0;
    const scrollTop = () => (scroller ? scroller.scrollTop : window.scrollY);
    const heroWheel = (input: { deltaY: number; event: WheelEvent | TouchEvent }) => {
      if ((input.event as WheelEvent).ctrlKey || !input.deltaY) return true;
      const speed = scrollSpeed;
      if (speed <= 0 || speed >= 1) return true;
      const start = root.getBoundingClientRect().top - (scroller ? scroller.getBoundingClientRect().top : 0) + scrollTop();
      const end = start + root.offsetHeight;
      const toWheel = (y: number) =>
        y <= start ? y : y < end ? start + (y - start) / speed : start + (end - start) / speed + y - end;
      const wheelEnd = start + (end - start) / speed;
      const fromWheel = (y: number) =>
        y <= start ? y : y < wheelEnd ? start + (y - start) * speed : end + y - wheelEnd;
      const position = instance?.targetScroll ?? scrollTop();
      input.deltaY = fromWheel(toWheel(position) + input.deltaY) - position;
      return true;
    };
    const destroy = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      instance?.destroy();
      instance = lenisRef.current = null;
    };
    const tick = (time: number) => {
      if (!instance || document.hidden) return;
      instance.raf(time);
      frame = requestAnimationFrame(tick);
    };
    const update = () => {
      if (!desktop.matches || reduced.matches) {
        destroy();
        return;
      }
      if (instance) return;
      instance = new Lenis({
        ...(scroller ? { wrapper: scroller, content: scroller.firstElementChild ?? scroller } : {}),
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: false,
        autoRaf: false,
        anchors: false,
        stopInertiaOnNavigate: true,
        virtualScroll: heroWheel,
        prevent: (node) => node.hasAttribute?.("data-lenis-prevent") || !!node.closest?.('[role="dialog"]'),
      });
      lenisRef.current = instance;
      if (!document.hidden) frame = requestAnimationFrame(tick);
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (!document.hidden && instance) {
        instance.resize();
        instance.scrollTo(scrollTop(), { immediate: true, force: true });
        frame = requestAnimationFrame(tick);
      }
    };
    desktop.addEventListener("change", update);
    reduced.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    update();
    return () => {
      destroy();
      desktop.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [smoothScroll, scrollSpeed]);

  const heading = typeof title === "function" ? title(current) : title;

  return (
    <div
      ref={rootRef}
      data-hero-mode={current}
      data-scroll-speed={scrollSpeed}
      className={cn("relative isolate text-white [--psh-ease:cubic-bezier(.22,1,.36,1)]", className)}
    >
      <style>{STYLES}</style>
      <div aria-hidden className="absolute inset-0 -z-10 overflow-clip">
        <div className="sticky top-0 h-[var(--psh-vh,100svh)] overflow-hidden">
          <div
            ref={skyRef}
            className="h-[1587.3px] w-full bg-[length:100%_100%] bg-no-repeat will-change-transform"
            style={{ backgroundImage: skyImage(sky[current]) }}
          />
        </div>
      </div>

      <section className="px-12 pt-16 pb-6 text-center max-[800px]:px-6 max-[800px]:pt-12">
        <div className="mb-3 flex h-[43px] items-center justify-center gap-1.5 text-[20px] leading-[25px] font-[590] tracking-[-0.45px] text-[#f5f5f5] max-[800px]:text-[17px] max-[800px]:leading-[22px]">
          <Laurel flip />
          <span>{badge}</span>
          <Laurel />
        </div>
        <h1 className="m-0 text-[80px] leading-[1.08] font-[590] tracking-[-0.23px] text-balance max-[800px]:text-[clamp(34px,7.4vw,56px)]">
          {heading}
        </h1>
        <p className="mx-auto mt-4 mb-9 max-w-[620px] text-[22px] leading-[28px] text-pretty text-white/85 max-[800px]:max-w-[600px] max-[800px]:text-[18px] max-[800px]:leading-[25px]">
          {description}
        </p>
        {cta && (
          <a
            href={cta.href}
            className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-white px-6 py-3 text-[17px] leading-[22px] font-[590] tracking-[-0.43px] whitespace-nowrap text-[#111214] transition-transform duration-300 ease-[var(--psh-ease)] hover:scale-[1.03] focus-visible:outline-3 focus-visible:outline-offset-[5px] focus-visible:outline-sky-300"
          >
            {cta.label}
          </a>
        )}

        <div ref={storyRef} className="relative -mx-12 mt-16 h-[475svh] text-left max-[800px]:-mx-6 max-[800px]:mt-12 motion-reduce:!h-[972.267px]">
          <div
            ref={stageRef}
            className="sticky top-[var(--psh-offset,64px)] isolate h-[max(calc(var(--psh-vh,100svh)-var(--psh-offset,64px)),var(--phone-height,932.267px))] max-[700px]:h-[var(--phone-height,700px)] motion-reduce:relative motion-reduce:top-0 motion-reduce:!h-full"
          >
            <div className="absolute top-0 left-1/2 z-[4] w-[min(456px,calc(100%-48px),calc((100%-120px-712px*min(.9,var(--scene-scale,1)))/.895))] -translate-x-1/2 max-[800px]:w-[min(390px,calc(100%-48px))] max-[700px]:w-[min(390px,calc((var(--psh-vh,100svh)-88px)*.48913),calc(100%-48px))]">
              <div ref={phoneRef} className="relative aspect-[456/932.267]">
                {/* Screen cutout of the frame image: 407.4 by 887.7 at 24, 23 in a 456 wide phone, 62px radius. */}
                <div className="absolute top-[2.467%] left-[5.263%] h-[95.219%] w-[89.342%] overflow-hidden rounded-[15.22%/6.984%] bg-background">
                  <div
                    ref={screenRef}
                    className="absolute top-0 left-0 origin-top-left text-foreground"
                    style={{ width: DESIGN_WIDTH, height: DESIGN_HEIGHT, transform: "scale(var(--psh-screen-scale,1))" }}
                  >
                    <HeroProgressContext.Provider value={store}>{children ?? <ChatScreen />}</HeroProgressContext.Provider>
                  </div>
                </div>
                <img src={frame} alt="" aria-hidden draggable={false} className="pointer-events-none absolute inset-0 z-20 size-full select-none" />
              </div>
            </div>

            {shown.length > 0 && (
              <>
                <div
                  ref={connectorsRef}
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[calc(var(--psh-vh,100svh)-var(--psh-offset,64px))] opacity-0 max-[700px]:hidden motion-reduce:hidden"
                >
                  {shown.map((_, i) => (
                    <Connector key={i} mirror={i === 1 || i === 2} delay={i * 0.6} lineRef={(el) => void (lineRefs.current[i] = el)} />
                  ))}
                </div>
                <div
                  ref={sourcesRef}
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-[calc(var(--psh-vh,100svh)-var(--psh-offset,64px))] max-[700px]:hidden motion-reduce:hidden"
                >
                  <div
                    ref={layoutRef}
                    className="absolute top-1/2 left-1/2 h-[calc(900px*var(--scene-scale,1))] w-[min(1296px,calc(100%-96px))] -translate-x-1/2 -translate-y-1/2"
                  >
                    {shown.map((source, i) => (
                      <article
                        key={source.label}
                        ref={(el) => void (cardRefs.current[i] = el)}
                        className={cn(
                          "absolute w-[356px] opacity-0 will-change-[transform,opacity]",
                          i % 2 === 0 ? "left-0 origin-top-left" : "right-0 origin-top-right",
                          i < 2 ? "top-[calc(163.5px*var(--scene-scale,1))]" : "top-[calc(505.5px*var(--scene-scale,1))]",
                        )}
                      >
                        <div className="mx-auto mb-4 flex h-[60px] w-max items-center justify-center gap-3 rounded-full bg-white/45 py-2 pr-5 pl-4 text-[20px] leading-[25px] font-semibold tracking-[-0.45px] text-neutral-900 shadow-[1.25px_0_0_-.75px_#d0d0d0,-1.25px_0_0_-.75px_#d0d0d0,0_0_0_.5px_#e8e8e8,0_8px_15px_#00000005] backdrop-blur-[16px] dark:bg-[#161618]/60 dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgb(255_255_255/.1),0_8px_20px_rgb(0_0_0/.25)] [&_svg]:size-7 [&_svg]:text-neutral-800 dark:[&_svg]:text-[#f5f5f7]">
                          {source.icon}
                          <span>{source.label}</span>
                        </div>
                        <div className="w-[356px] rounded-[36px] bg-white/80 px-7 py-6 dark:bg-[#1c1c1e]/80 dark:shadow-[0_0_0_1px_rgb(255_255_255/.1),0_12px_32px_rgb(0_0_0/.25)] dark:backdrop-blur-[16px]">
                          <h3 className="m-0 text-[22px] leading-[28px] font-bold tracking-[-0.26px] text-neutral-900 dark:text-[#f5f5f7]">{source.title}</h3>
                          <p className="mt-1 text-[20px] leading-[25px] tracking-[-0.45px] text-neutral-600 dark:text-[#a1a1a6]">
                            {source.lines.map((line, j) => (
                              <span key={j}>
                                {line}
                                {j < source.lines.length - 1 && " "}
                                {j < source.lines.length - 1 && <br />}
                              </span>
                            ))}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      <div ref={endRef} id={endId} aria-hidden className="h-0" />
    </div>
  );
}
