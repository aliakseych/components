import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./IntegrationGrid.css";

export interface IntegrationGridItem {
  name: string;
  icon: ReactNode;
}

export interface IntegrationGridProps {
  title?: ReactNode;
  items: IntegrationGridItem[];
  /** Fade the bottom of the grid out (default true). */
  blurBottom?: boolean;
  /** Viewport height in px (default 320, 200 under 480px). */
  blurHeight?: number;
  className?: string;
}

const HEADING_FONT = `-apple-system, system-ui, "SF Pro Display", "Helvetica Neue", Arial, sans-serif`;
const ROWS = 3;
const COLS = 8;

/** Perspective grid of integration tiles: staggered reveal, hover lift and click ripples. */
export function IntegrationGrid({ title, items, blurBottom = true, blurHeight, className }: IntegrationGridProps) {
  const demoRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const demo = demoRef.current, viewport = viewportRef.current, parent = parentRef.current, grid = gridRef.current;
    if (!demo || !viewport || !parent || !grid) return;
    const touchLayout = matchMedia("(max-width:800px)");
    const hoverPointer = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    type Tile = { button: HTMLButtonElement; wrapper: HTMLElement; shadow: HTMLElement | null; row: number; col: number; hover: boolean; focus: boolean; level: number };
    const tiles: Tile[] = [...grid.querySelectorAll<HTMLButtonElement>(".ig-tile")].map((button) => ({
      button, wrapper: button.parentElement as HTMLElement, shadow: button.previousElementSibling as HTMLElement | null,
      row: Number(button.dataset.row), col: Number(button.dataset.col), hover: false, focus: false, level: 0,
    }));

    const resize = () => {
      const widthScale = parent.clientWidth / 3856;
      const angle = parseFloat(getComputedStyle(demo).getPropertyValue("--grid-angle"));
      const projectedHeight = 1432 * Math.cos((angle * Math.PI) / 180);
      const heightScale = (parent.clientHeight / projectedHeight) * 0.88;
      const multiplier = parent.clientWidth < 640 ? 1.8 : parent.clientWidth < 1024 ? 1.35 : 1;
      const scale = Math.min(Math.max(widthScale, Math.min(heightScale, widthScale * multiplier)), 1);
      grid.style.setProperty("--grid-scale", String(scale));
    };
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    resize();

    let inView = false, active = false, frame = 0, last = 0, pausedAt = performance.now();
    let pulses: { row: number; col: number; strength: number; start: number }[] = [];
    let idleTimer: ReturnType<typeof setTimeout> | 0 = 0, idleRemaining = 3500, idleDeadline = 0;

    const paint = (tile: Tile) => {
      const level = tile.level;
      const scaleAmount = tile.col === 0 ? 0 : tile.col === 7 ? 0.04 : 0.1;
      tile.button.style.transform = `translateY(${-40 * level}px) scale(${1 + scaleAmount * level})`;
      if (tile.shadow) {
        tile.shadow.style.opacity = String(0.88 - 0.5 * level);
        tile.shadow.style.transform = `scale(${1 + 0.32 * level},${1 + 0.24 * level})`;
      }
      tile.wrapper.classList.toggle("is-lifted", level > 0.01 || tile.hover || tile.focus);
    };
    const tick = (now: number) => {
      frame = 0;
      if (!active) return;
      if (touchLayout.matches && last && now - last < 32) { frame = requestAnimationFrame(tick); return; }
      const deltaMs = Math.min(last ? now - last : 16, 50);
      last = now;
      pulses = pulses.filter((p) => now - p.start <= 700 + Math.hypot(7, 2) * 85);
      let moving = pulses.length > 0;
      for (const tile of tiles) {
        let rippleTarget = 0;
        for (const p of pulses) {
          const distance = Math.hypot(tile.row - p.row, tile.col - p.col);
          const progress = (now - p.start - distance * 85) / 700;
          if (progress >= 0 && progress <= 1) rippleTarget = Math.max(rippleTarget, Math.sin(progress * Math.PI) * p.strength * Math.exp(-distance * 0.4));
        }
        const target = Math.max(tile.hover || tile.focus ? 1 : 0, rippleTarget);
        const prev = tile.level;
        tile.level += (target - tile.level) * (1 - Math.exp(-deltaMs / 65));
        if (Math.abs(target - tile.level) < 0.0001) tile.level = target;
        else moving = true;
        if (Math.abs(prev - tile.level) > 0.00001) paint(tile);
      }
      if (moving) frame = requestAnimationFrame(tick);
      else last = 0;
    };
    const wake = () => { if (active && !frame) frame = requestAnimationFrame(tick); };
    const ripple = (tile: Tile, strength: number) => {
      if (!active) return;
      pulses.push({ row: tile.row, col: tile.col, strength, start: performance.now() });
      wake();
    };
    const stopIdle = () => {
      if (idleTimer) {
        idleRemaining = Math.max(0, idleDeadline - performance.now());
        clearTimeout(idleTimer);
        idleTimer = 0;
      }
    };
    const scheduleIdle = () => {
      if (!active || idleTimer) return;
      idleDeadline = performance.now() + idleRemaining;
      idleTimer = setTimeout(() => {
        idleTimer = 0;
        ripple(tiles[Math.floor(Math.random() * tiles.length)], 0.4);
        idleRemaining = 4500 + Math.random() * 2200;
        scheduleIdle();
      }, idleRemaining);
    };
    const updateActivity = () => {
      const next = inView && !document.hidden && !reduced.matches;
      if (next !== active) {
        const now = performance.now();
        active = next;
        if (active) {
          pulses.forEach((p) => { p.start += now - pausedAt; });
          last = 0;
          wake();
        } else {
          pausedAt = now;
          cancelAnimationFrame(frame);
          frame = 0;
          last = 0;
          stopIdle();
        }
      }
      scheduleIdle();
    };

    const cleanups: (() => void)[] = [];
    tiles.forEach((tile) => {
      const on = <K extends keyof HTMLElementEventMap>(t: K, fn: () => void) => {
        tile.button.addEventListener(t, fn);
        cleanups.push(() => tile.button.removeEventListener(t, fn));
      };
      on("pointerenter", () => { if (!hoverPointer.matches) return; tile.hover = true; wake(); });
      on("pointerleave", () => { tile.hover = false; wake(); });
      on("focus", () => { tile.focus = true; wake(); });
      on("blur", () => { tile.focus = false; wake(); });
      on("click", () => ripple(tile, 0.6));
    });
    demo.classList.add("motion-enabled");
    const io = new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.35;
      demo.classList.toggle("is-visible", inView || reduced.matches);
      updateActivity();
    }, { threshold: [0, 0.35] });
    io.observe(viewport);
    document.addEventListener("visibilitychange", updateActivity);
    const onReduced = () => {
      pulses = [];
      tiles.forEach((t) => { t.level = 0; paint(t); });
      demo.classList.toggle("is-visible", inView || reduced.matches);
      updateActivity();
    };
    reduced.addEventListener("change", onReduced);
    if (reduced.matches) demo.classList.add("is-visible");

    return () => {
      cancelAnimationFrame(frame);
      stopIdle();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", updateActivity);
      reduced.removeEventListener("change", onReduced);
      cleanups.forEach((fn) => fn());
      demo.classList.remove("motion-enabled", "is-visible");
    };
  }, []);

  const slots = Array.from({ length: ROWS * COLS }, (_, i) => items.length ? items[i % items.length] : null);

  return (
    <section className={cn("w-full overflow-hidden bg-background px-4 pb-6 pt-20 text-foreground min-[801px]:px-8 min-[801px]:pb-12 min-[801px]:pt-36", className)}>
      {title ? (
        <h2 style={{ fontFamily: HEADING_FONT }} className="mx-auto max-w-5xl text-center font-[590] text-[clamp(32px,7vw,44px)] leading-[1.08] tracking-[-0.23px] min-[1025px]:text-[56px]">{title}</h2>
      ) : null}
      <div ref={demoRef} className="ig">
        <div ref={viewportRef} className={cn("ig-viewport", !blurBottom && "ig-nomask")} style={blurHeight ? { height: blurHeight } : undefined}>
          <div ref={parentRef} className="ig-perspective">
            <div ref={gridRef} className="ig-grid">
              {slots.map((item, i) => {
                const row = Math.floor(i / COLS), col = i % COLS;
                const origin = col === 0 ? "left center" : col === COLS - 1 ? "right center" : "center center";
                return (
                  <div key={i} className="ig-slot" style={{ "--row": row, "--tile-origin": origin } as CSSProperties}>
                    <span className="ig-ground" aria-hidden="true" />
                    <button type="button" className="ig-tile" aria-label={item?.name ?? `Integration ${i + 1}`} data-row={row} data-col={col}>
                      <span className="ig-icon" aria-hidden="true">{item?.icon}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default IntegrationGrid;
