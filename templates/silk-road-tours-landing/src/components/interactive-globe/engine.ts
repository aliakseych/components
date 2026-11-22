// Canvas orthographic globe with HTML pins and an anchored popover on top. Rendering runs on demand only while the
// globe is on screen; the camera flies once from the initial view to the target when ≥40% of it is visible.
import { geoBounds, geoDistance, geoGraticule, geoOrthographic, geoPath, type GeoProjection } from "d3-geo";
import { clampBounds, merc, unmerc, worldGeo, type GeoBounds, type Geometry, type LonLat } from "./geo";

/** Camera: rotation centre, zoom (globe radius / fitted radius) and the screen point the centre lands on. */
export interface View {
  c: LonLat;
  k: number;
  x: number;
  y: number;
}
export interface HighlightShape {
  id: string;
  geometry: Geometry;
}
export interface EngineMarker {
  id: string;
  lng: number;
  lat: number;
}
export interface EngineTarget {
  /** Centre and zoom; `fit` overrides both with a fit to these shapes. */
  c?: LonLat;
  k?: number;
  fit?: Geometry[];
}
export interface EngineOptions {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  pin: (id: string) => HTMLElement | null;
  popover: () => HTMLElement | null;
  maxZoom: number;
  onBackgroundClick: () => void;
  onZoomChange: (s: { canZoomIn: boolean; canZoomOut: boolean; zoomed: boolean }) => void;
  onSatelliteLoaded: (loaded: boolean) => void;
}

const LOD0 = 1.6;
const LOD1 = 2.6;
const INTRO_MS = 1600;
const MOVE_MS = 900;
const PIN_R = 12;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function createGlobe(o: EngineOptions): GlobeEngine {
  const { root, canvas } = o;
  const ctx = canvas.getContext("2d")!;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const world = worldGeo();
  const sphere = { type: "Sphere" } as const;
  const graticule = geoGraticule().step([20, 20])();
  const proj: GeoProjection = geoOrthographic().precision(0.3);
  const path = geoPath(proj, ctx);

  let W = 0;
  let H = 0;
  let dpr = 1;
  let R0 = 1;
  let markers: EngineMarker[] = [];
  let highlight: HighlightShape[] = [];
  let selected: string | null = null;
  let target: EngineTarget = {};
  let initial: EngineTarget = {};
  let introDone = false;
  let inView = false;
  let visible = false;
  let raf = 0;
  let cam: View = { c: [0, 20], k: 1, x: 0, y: 0 };
  let anim: { from: View; to: View; t0: number; ms: number } | null = null;
  let destroyed = false;

  // ---------- Colours: read from the root's CSS custom properties (theme tokens resolved by the browser) ----------
  let C = { water: "", land: "", border: "", highlight: "", outline: "", graticule: "", marker: "" };
  function readColors() {
    const cs = getComputedStyle(root);
    const v = (n: string) => cs.getPropertyValue(`--interactive-globe-${n}`).trim();
    C = {
      water: v("water"),
      land: v("land"),
      border: v("border"),
      highlight: v("highlight"),
      outline: v("outline"),
      graticule: v("graticule"),
      marker: v("marker"),
    };
  }

  // ---------- Satellite raster: one Mercator image drawn through the projection in affine cells ----------
  type Raster = { img: HTMLImageElement; b: { w: number; e: number; s: number; n: number }; t0: number };
  let raster: Raster | null = null;
  let rasterReq: { src: string; bounds: GeoBounds } | null = null;
  let rasterImg: HTMLImageElement | null = null;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  const lowData = Boolean(conn?.saveData) || ["slow-2g", "2g"].includes(conn?.effectiveType ?? "");
  function loadRaster() {
    if (!rasterReq || rasterImg || lowData) return;
    const req = rasterReq;
    const img = new Image();
    rasterImg = img;
    img.decoding = "async";
    img.onload = () => {
      if (destroyed || rasterImg !== img) return;
      const [w, s, e, n] = clampBounds(req.bounds);
      raster = { img, b: { w, s, e, n }, t0: performance.now() };
      o.onSatelliteLoaded(true);
      request();
    };
    img.onerror = () => console.warn(`interactive-globe: satellite image failed to load (${req.src})`);
    img.src = req.src;
  }
  const fadeOf = (r: Raster, now: number) => (reduced.matches ? 1 : clamp((now - r.t0) / 300));
  function drawRaster({ img, b }: Raster, alpha: number, N: number, M: number, bleed = 0.75) {
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const mN = merc(b.n);
    const mS = merc(b.s);
    const ll = (u: number, v: number): LonLat => [b.w + (b.e - b.w) * u, unmerc(mN + (mS - mN) * v)];
    const pt = (u: number, v: number) => proj(ll(u, v))!;
    ctx.save();
    ctx.beginPath();
    path(sphere);
    ctx.clip();
    // With a highlight, imagery only fills those shapes: no hard image edges floating over the flat map.
    if (highlight.length) {
      ctx.beginPath();
      for (const h of highlight) path(h.geometry);
      ctx.clip();
    }
    ctx.globalAlpha = alpha;
    for (let j = 0; j < M; j++)
      for (let i = 0; i < N; i++) {
        // Cells on the far side of the globe would fold back over the front: skip them.
        if (geoDistance(ll((i + 0.5) / N, (j + 0.5) / M), cam.c) > Math.PI / 2 - 0.02) continue;
        const p00 = pt(i / N, j / M);
        const p10 = pt((i + 1) / N, j / M);
        const p01 = pt(i / N, (j + 1) / M);
        const p11x = p10[0] + p01[0] - p00[0];
        const p11y = p10[1] + p01[1] - p00[1];
        const xs = [p00[0], p10[0], p01[0], p11x];
        const ys = [p00[1], p10[1], p01[1], p11y];
        if (Math.max(...xs) < 0 || Math.min(...xs) > W || Math.max(...ys) < 0 || Math.min(...ys) > H) continue;
        const x0 = (i * iw) / N;
        const y0 = (j * ih) / M;
        const cw = iw / N;
        const ch = ih / M;
        const a = (p10[0] - p00[0]) / cw;
        const bb = (p10[1] - p00[1]) / cw;
        const c = (p01[0] - p00[0]) / ch;
        const d = (p01[1] - p00[1]) / ch;
        ctx.setTransform(dpr * a, dpr * bb, dpr * c, dpr * d, dpr * (p00[0] - a * x0 - c * y0), dpr * (p00[1] - bb * x0 - d * y0));
        // Grow each cell by `bleed` screen px so anti-aliasing and the parallelogram approximation leave no seams.
        const px = bleed / Math.max(1e-3, Math.min(Math.hypot(a, bb), Math.hypot(c, d)));
        const sx = Math.max(0, x0 - px);
        const sy = Math.max(0, y0 - px);
        const sw = Math.min(x0 + cw + px, iw) - sx;
        const sh = Math.min(y0 + ch + px, ih) - sy;
        ctx.drawImage(img, sx, sy, sw, sh, sx, sy, sw, sh);
      }
    ctx.restore();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ---------- Camera ----------
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R0 = Math.max(1, Math.min(W, H) / 2 - 8);
  }
  function fitK(c: LonLat, shapes: Geometry[], pad: number) {
    const p = geoOrthographic()
      .rotate([-c[0], -c[1]])
      .fitExtent(
        [
          [pad, pad],
          [W - pad, H - pad],
        ],
        { type: "GeometryCollection", geometries: shapes } as never,
      );
    return p.scale() / R0;
  }
  function centreOf(shapes: Geometry[]): LonLat {
    const [[w, s], [e, n]] = geoBounds({ type: "GeometryCollection", geometries: shapes } as never);
    // Bounds that cross the antimeridian come back with west > east.
    const lng = e >= w ? (w + e) / 2 : (((w + e + 360) / 2 + 180) % 360) - 180;
    return [lng, (s + n) / 2];
  }
  const FIT_MAX_K = 5;
  const kMax = () => o.maxZoom;
  function resolve(t: EngineTarget): View {
    if (t.fit?.length) {
      const c = centreOf(t.fit);
      // Fit the shapes into the middle ~55% of the frame, capped so small countries keep the curved limb and their
      // neighbours in view instead of filling the frame at a scale the outlines were not drawn for.
      const k = Math.min(fitK(c, t.fit, Math.min(W, H) * 0.225), FIT_MAX_K);
      return { c, k: clamp(k, 1, kMax()), x: W / 2, y: H / 2 };
    }
    return { c: t.c ?? cam.c, k: clamp(t.k ?? 1, 0.5, kMax()), x: W / 2, y: H / 2 };
  }
  const homeView = () => resolve(target.c || target.fit ? target : initial);

  function moveTo(to: View, ms: number) {
    if (reduced.matches || ms === 0) {
      anim = null;
      cam = to;
    } else anim = { from: { ...cam }, to, t0: performance.now(), ms };
    request();
  }
  function step(now: number) {
    if (!anim) return false;
    const t = clamp((now - anim.t0) / anim.ms);
    const e = easeIO(t);
    const { from: a, to: b } = anim;
    const lerp = (p: number, q: number) => p + (q - p) * e;
    // Shortest way round in longitude.
    const dl = ((((b.c[0] - a.c[0]) % 360) + 540) % 360) - 180;
    cam = {
      c: [a.c[0] + dl * e, lerp(a.c[1], b.c[1])],
      k: Math.exp(lerp(Math.log(a.k), Math.log(b.k))),
      x: lerp(a.x, b.x),
      y: lerp(a.y, b.y),
    };
    if (t >= 1) anim = null;
    return Boolean(anim);
  }

  // ---------- Drawing ----------
  const shape = (g: Geometry) => {
    ctx.beginPath();
    path(g);
  };
  const fill = (color: string, alpha = 1) => {
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
  };
  const stroke = (color: string, width: number, alpha = 1) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.globalAlpha = alpha;
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  function drawMap(now: number) {
    const k = cam.k;
    const R = R0 * k;
    const rA = clamp((k - LOD0) / (LOD1 - LOD0));
    const gA = 1 - rA;
    shape(sphere);
    fill(C.water);
    if (gA > 0) {
      // Soft limb shading and a graticule while the whole globe shows; both fade out as the camera closes in.
      const g = ctx.createRadialGradient(cam.x - R * 0.25, cam.y - R * 0.3, R * 0.4, cam.x, cam.y, R);
      g.addColorStop(0, "transparent");
      g.addColorStop(1, C.graticule);
      ctx.fillStyle = g;
      ctx.globalAlpha = 0.6 * gA;
      ctx.fill();
      ctx.globalAlpha = 1;
      shape(graticule);
      stroke(C.graticule, 0.6, 0.6 * gA);
    }
    shape(world.land);
    fill(C.land);
    for (const h of highlight) {
      shape(h.geometry);
      fill(C.highlight);
    }

    // Real-colour imagery over the flat fills once zoomed in (clipped to the highlight when there is one).
    if (raster && rA > 0) drawRaster(raster, rA * fadeOf(raster, now), 24, 16);

    shape(world.borders);
    stroke(C.border, 0.9);
    shape(sphere);
    stroke(C.graticule, 1.5, gA);
    ctx.lineJoin = "round";
    const w = 1.4 + 0.8 * clamp(k - 1.5);
    for (const h of highlight) {
      shape(h.geometry);
      stroke(C.outline, w);
    }
  }

  // ---------- Pins: projected, back-facing ones hidden, overlapping ones pushed apart with a leader line ----------
  type Placed = { el: HTMLElement; id: string; ax: number; ay: number; x: number; y: number };
  const facing = (ll: LonLat) => geoDistance(ll, cam.c) < Math.PI / 2 - 0.08;
  const anchors = new Map<string, { x: number; y: number; on: boolean }>();
  function declutter(list: Placed[], gap: number) {
    for (let it = 0; it < 60; it++) {
      let moved = false;
      for (let i = 0; i < list.length; i++)
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i];
          const b = list[j];
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let d = Math.hypot(dx, dy);
          const min = 2 * PIN_R + gap;
          if (d >= min) continue;
          if (d < 0.01) {
            dx = 1;
            dy = 0.3;
            d = Math.hypot(dx, dy);
          }
          const push = (min - d) / 2;
          a.x -= (dx / d) * push;
          a.y -= (dy / d) * push;
          b.x += (dx / d) * push;
          b.y += (dy / d) * push;
          moved = true;
        }
      if (!moved) break;
    }
  }
  function placePins() {
    const placed: Placed[] = [];
    anchors.clear();
    for (const m of markers) {
      const el = o.pin(m.id);
      if (!el) continue;
      const ll: LonLat = [m.lng, m.lat];
      const p = proj(ll);
      const on = Boolean(p) && facing(ll) && p![0] > -PIN_R && p![0] < W + PIN_R && p![1] > -PIN_R && p![1] < H + PIN_R;
      el.hidden = !on;
      if (on) placed.push({ el, id: m.id, ax: p![0], ay: p![1], x: p![0], y: p![1] });
    }
    declutter(placed, 4);
    for (const p of placed) {
      p.el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`;
      anchors.set(p.id, { x: p.x, y: p.y, on: true });
      if (Math.hypot(p.x - p.ax, p.y - p.ay) < PIN_R) continue;
      ctx.beginPath();
      ctx.moveTo(p.ax, p.ay);
      ctx.lineTo(p.x, p.y);
      stroke(C.outline, 1.5, 0.7);
      ctx.beginPath();
      ctx.arc(p.ax, p.ay, 3, 0, Math.PI * 2);
      fill(C.outline);
    }
  }

  /** Popover: above the pin (below when there is no room), clamped to the globe box and the viewport. */
  function placePopover() {
    const el = o.popover();
    if (!el) return;
    const a = selected ? anchors.get(selected) : undefined;
    el.style.visibility = a ? "visible" : "hidden";
    if (!a) return;
    const pw = el.offsetWidth;
    const ph = el.offsetHeight;
    const box = root.getBoundingClientRect();
    const pad = 8;
    // Arrow (8px) tip lands 2px off the pin's edge.
    const gap = PIN_R + 10;
    // Horizontal room: the globe box intersected with the viewport.
    const minX = Math.max(pad, pad - box.left);
    const maxX = Math.min(W - pad, innerWidth - box.left - pad) - pw;
    const x = clamp(a.x - pw / 2, minX, Math.max(minX, maxX));
    const minY = Math.max(pad, pad - box.top);
    const maxY = Math.min(H - pad, innerHeight - box.top - pad) - ph;
    const above = a.y - gap - ph >= minY;
    const y = clamp(above ? a.y - gap - ph : a.y + gap, minY, Math.max(minY, maxY));
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    el.dataset.side = above ? "top" : "bottom";
    el.style.setProperty("--arrow-x", `${clamp(a.x - x, 16, pw - 16).toFixed(1)}px`);
  }

  let zoomState = "";
  function syncZoom() {
    const k = anim ? anim.to.k : cam.k;
    const home = homeView();
    const s = { canZoomIn: k < kMax() * 0.999, canZoomOut: k > 1.001, zoomed: Math.abs(k - home.k) > home.k * 0.02 || geoDistance(cam.c, home.c) > 0.01 };
    const key = JSON.stringify(s);
    if (key === zoomState) return;
    zoomState = key;
    root.toggleAttribute("data-zoomed", k > 1.02);
    o.onZoomChange(s);
  }

  function draw(now: number) {
    const moving = step(now);
    proj.rotate([-cam.c[0], -cam.c[1]]).scale(R0 * cam.k).translate([cam.x, cam.y]);
    ctx.clearRect(0, 0, W, H);
    drawMap(now);
    placePins();
    placePopover();
    syncZoom();
    // Preload right away so the imagery is ready when the fly-in ends; it is only drawn once zoomed in.
    loadRaster();
    return moving || Boolean(raster && fadeOf(raster, now) < 1);
  }
  const loop = (now: number) => {
    raf = 0;
    if (!visible || destroyed) return;
    if (draw(now)) raf = requestAnimationFrame(loop);
  };
  function request() {
    if (visible && !raf && !destroyed) raf = requestAnimationFrame(loop);
  }

  function intro() {
    if (introDone || !inView || W === 0) return;
    introDone = true;
    moveTo(homeView(), INTRO_MS);
  }

  // ---------- Zoom and drag: +/− buttons, ctrl/⌘ + wheel, pinch, drag to rotate ----------
  function zoomBy(f: number, ms = 320) {
    const from = anim ? anim.to : cam;
    moveTo({ ...from, k: clamp(from.k * f, 1, kMax()) }, ms);
  }
  function rotateBy(dx: number, dy: number) {
    anim = null;
    const deg = 180 / (Math.PI * R0 * cam.k);
    cam = { ...cam, c: [cam.c[0] - dx * deg, clamp(cam.c[1] + dy * deg, -80, 80)] };
    request();
  }
  let dragged = 0;
  const onWheel = (e: WheelEvent) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    anim = null;
    cam = { ...cam, k: clamp(cam.k * Math.exp(-clamp(d, -100, 100) * 0.01), 1, kMax()) };
    request();
  };
  const touches = new Map<number, { x: number; y: number }>();
  const local = (e: PointerEvent) => {
    const b = canvas.getBoundingClientRect();
    return { x: e.clientX - b.left, y: e.clientY - b.top };
  };
  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    touches.set(e.pointerId, local(e));
    if (touches.size === 1) dragged = 0;
    canvas.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    const prev = touches.get(e.pointerId);
    if (!prev) return;
    const p = local(e);
    if (touches.size >= 2) {
      const [a0, b0] = [...touches.values()];
      touches.set(e.pointerId, p);
      const [a1, b1] = [...touches.values()];
      const d0 = Math.hypot(a0.x - b0.x, a0.y - b0.y);
      const d1 = Math.hypot(a1.x - b1.x, a1.y - b1.y);
      rotateBy((a1.x + b1.x - a0.x - b0.x) / 2, (a1.y + b1.y - a0.y - b0.y) / 2);
      if (d0 > 0) cam = { ...cam, k: clamp(cam.k * (d1 / d0), 1, kMax()) };
      dragged = 99;
      return;
    }
    touches.set(e.pointerId, p);
    // A finger rotates only when zoomed in; otherwise the page scrolls (touch-action) and the browser cancels it.
    if (e.pointerType === "touch" && !root.hasAttribute("data-zoomed")) return;
    dragged += Math.hypot(p.x - prev.x, p.y - prev.y);
    if (dragged > 6) canvas.dataset.dragging = "";
    rotateBy(p.x - prev.x, p.y - prev.y);
  };
  const onUp = (e: PointerEvent) => {
    touches.delete(e.pointerId);
    if (!touches.size) delete canvas.dataset.dragging;
  };
  const onClick = () => {
    if (dragged <= 6) o.onBackgroundClick();
  };
  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("click", onClick);

  // ---------- Observers ----------
  const visIO = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) request();
  });
  const introIO = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting) {
        inView = true;
        intro();
      }
    },
    { threshold: 0.4 },
  );
  const ro = new ResizeObserver(() => {
    resize();
    if (introDone) moveTo({ ...(anim ? anim.to : cam), x: W / 2, y: H / 2 }, 0);
    else {
      cam = { ...resolve(initial), x: W / 2, y: H / 2 };
      if (reduced.matches) {
        introDone = true;
        cam = homeView();
      }
      intro();
    }
    request();
  });
  // Theme switches: class/style/data-theme on <html> or the OS colour scheme.
  const themeMO = new MutationObserver(() => {
    readColors();
    request();
  });
  const scheme = matchMedia("(prefers-color-scheme: dark)");
  const onScheme = () => {
    readColors();
    request();
  };
  readColors();
  visIO.observe(root);
  introIO.observe(root);
  ro.observe(canvas);
  themeMO.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
  scheme.addEventListener("change", onScheme);

  return {
    setMarkers(m: EngineMarker[]) {
      markers = m;
      request();
    },
    setHighlight(h: HighlightShape[]) {
      highlight = h;
      request();
    },
    setInitial(t: EngineTarget) {
      initial = t;
      if (!introDone && W) cam = { ...resolve(initial), x: W / 2, y: H / 2 };
      request();
    },
    /** New target: flies there if the intro already ran, otherwise the intro picks it up. */
    setTarget(t: EngineTarget) {
      target = t;
      if (introDone) moveTo(homeView(), MOVE_MS);
      request();
    },
    setSatellite(s: { src: string; bounds: GeoBounds } | null) {
      if (s?.src === rasterReq?.src) return;
      rasterReq = s;
      if (rasterImg) rasterImg.onload = rasterImg.onerror = null;
      rasterImg = null;
      raster = null;
      o.onSatelliteLoaded(false);
      request();
    },
    /** Select a pin; the camera brings it to the centre without zooming out. */
    select(id: string | null, ll?: LonLat) {
      selected = id;
      if (id && ll) {
        const from = anim ? anim.to : cam;
        moveTo({ c: ll, k: from.k, x: W / 2, y: H / 2 }, MOVE_MS);
      }
      request();
    },
    zoomBy,
    reset() {
      moveTo(homeView(), MOVE_MS);
    },
    refreshColors: onScheme,
    request,
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      visIO.disconnect();
      introIO.disconnect();
      ro.disconnect();
      themeMO.disconnect();
      scheme.removeEventListener("change", onScheme);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("click", onClick);
      if (rasterImg) rasterImg.onload = rasterImg.onerror = null;
      rasterImg = null;
      raster = null;
      // Release the backing store right away instead of waiting for GC.
      canvas.width = 0;
      canvas.height = 0;
    },
  };
}

export interface GlobeEngine {
  setMarkers(m: EngineMarker[]): void;
  setHighlight(h: HighlightShape[]): void;
  setInitial(t: EngineTarget): void;
  setTarget(t: EngineTarget): void;
  setSatellite(s: { src: string; bounds: GeoBounds } | null): void;
  select(id: string | null, ll?: LonLat): void;
  zoomBy(f: number, ms?: number): void;
  reset(): void;
  refreshColors(): void;
  request(): void;
  destroy(): void;
}
