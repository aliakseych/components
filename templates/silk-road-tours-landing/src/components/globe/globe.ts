// Journey explorer: canvas orthographic globe with HTML pins on top. No scroll coupling: the page scrolls over it.
// Loaded lazily by index.tsx when #journey nears the viewport; the geo data is fetched from here (hashed assets).
//
// Levels: country (city pins) → city (panel + attraction pins) → attraction (panel view + photo slider) → viewer.
// On first view (≥40% visible) the camera flies once from the world to Uzbekistan; afterwards it moves only on clicks.
//
// Layout contract: the map renders into its canvas's OWN box (ResizeObserver on the canvas), fits the globe and the
// region to that box, paints its own background, and keeps the open panel's area out of the camera's focus rect.
//
// Map levels (scripts/geo.mjs): globe = Natural Earth 1:50m, region = 1:10m inside meta.box. Strokes crossfade over
// k ∈ [1.6, 2.6]; outside the region box the globe layer always draws. Fills draw both levels opaque in the crossfade.
import { geoOrthographic, geoPath, geoGraticule, geoDistance, type GeoProjection, type GeoSphere, type GeoPermissibleObjects } from 'd3-geo';
import globeUrl from './geo/globe.json?url';
import regionUrl from './geo/region.json?url';
import provincesUrl from './geo/provinces.json?url';
import { decodeGeo, type GlobeGeo, type RegionGeo } from './decode';
import type { Place } from './schema';
import mapMeta from '@/assets/map/meta.json';

// Sentinel-2 cloudless 2016 rasters (scripts/map-imagery.mjs): bounds in lon/lat, pixels in Web Mercator.
type Bounds = { w: number; e: number; s: number; n: number };
const mapBounds = mapMeta as Record<string, Bounds>;
const mapUrls = import.meta.glob<string>('/src/assets/map/*.webp', { eager: true, query: '?url', import: 'default' });
const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const unmerc = (m: number) => ((2 * Math.atan(Math.exp(m)) - Math.PI / 2) * 180) / Math.PI;

type LonLat = [number, number];
interface Config {
  /** Places from sample/journey.json, in priority order. */
  places: Place[];
  /** Suzani pattern URL per province code. */
  suzani: Record<string, string>;
  centroid: LonLat;
}
/** Camera: rotation centre, zoom (scale / globe radius) and the screen point the centre lands on. */
interface View { c: LonLat; k: number; x: number; y: number }
type Level = 'country' | 'city' | 'attraction';

/** Water: the --c-water token (#EDD9A6); kept here so the canvas does not depend on the token landing first. */
const WATER = '#EDD9A6';
/** Crossfade window (k = scale / globe radius). */
const LOD0 = 1.6, LOD1 = 2.6;
const EASE = 'cubic-bezier(.22,1,.36,1)';
const INTRO_MS = 1600, MOVE_MS = 900, PANEL_MS = 420;
/** Deepest automatic zoom per level and the manual zoom cap, as multiples of the country fit. */
const K_CITY = 4, K_ATTR = 5, K_MAX = 5, TOWN_K = 2.2;
/** Uzbekistan's bounding box (≈56.0–73.1°E, 37.2–45.6°N) plus 1°: the view centre stays inside it. */
const BOUNDS = { x0: 55, x1: 74.2, y0: 36.2, y1: 46.6 };
const WORLD: LonLat = [38, 32];

// Fetch now (module import happens before the section enters view).
const fetchJson = (u: string) => fetch(u).then((r) => { if (!r.ok) throw new Error(`${r.status} ${u}`); return r.json(); });
const geoReady = Promise.all([fetchJson(globeUrl), fetchJson(regionUrl), fetchJson(provincesUrl)]).then(([g, r, p]) => ({
  globe: decodeGeo(g) as unknown as GlobeGeo,
  region: decodeGeo(r) as unknown as RegionGeo,
  provinces: decodeGeo(p) as unknown as Record<string, GeoJSON.MultiPolygon>,
}));

/** Starts the map; the returned function stops the loop, observers and document listeners (call on unmount). */
export function initJourney(section: HTMLElement, cfg: Config) {
  const off = new AbortController();
  const root = section.querySelector<HTMLElement>('[data-j-explore]')!;
  const canvas = root.querySelector<HTMLCanvasElement>('[data-j-canvas]')!;
  const ctx = canvas.getContext('2d')!;
  const panel = root.querySelector<HTMLElement>('[data-j-panel]')!;
  const body = panel.querySelector<HTMLElement>('[data-j-body]')!;
  const titleEl = panel.querySelector<HTMLElement>('[data-j-title]')!;
  const kickerEl = panel.querySelector<HTMLElement>('[data-j-kicker]')!;
  const backBtn = root.querySelector<HTMLButtonElement>('[data-j-back]')!;
  const viewer = root.querySelector<HTMLElement>('[data-j-viewer]')!;
  const viewerImg = viewer.querySelector<HTMLImageElement>('[data-j-viewer-img]')!;
  const views = new Map([...body.querySelectorAll<HTMLElement>('[data-j-view]')].map((v) => [v.dataset.jView!, v]));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  const css = getComputedStyle(document.documentElement);
  const col = (n: string) => css.getPropertyValue(`--c-${n}`).trim();
  const C = { sun: col('sun'), sunDeep: col('sun-deep'), sand: col('sand'), ink: col('ink'), ink2: col('ink-2'), sandInk: col('sand-ink'), paper: col('paper'), cream: col('cream'), water: col('water') || WATER, land: col('land') };
  // Suzani textures for the open place's province, one motif per province (journey.json `suzani`), loaded on demand.
  // Tiles are drawn at 2× for sharp edges, so the pattern is scaled by 0.5; it is anchored at the place on screen,
  // which keeps the motif the same size at every zoom while it moves with the map.
  const patterns = new Map<string, CanvasPattern | 'loading'>();
  function patternFor(code: string) {
    const url = cfg.suzani[code], got = patterns.get(code);
    if (!url) return null;
    if (got) return got === 'loading' ? null : got;
    patterns.set(code, 'loading');
    const img = new Image();
    img.onload = () => { const p = ctx.createPattern(img, 'repeat'); if (p) patterns.set(code, p); request(); };
    img.onerror = () => console.warn(`journey: suzani ${url} failed to load`);
    img.src = url;
    return null;
  }

  // ---------- Imagery: loaded lazily, never on save-data or slow links; the vector map is always the fallback ----------
  type Raster = { img: HTMLImageElement; b: Bounds; t0: number };
  const rasters = new Map<string, Raster | 'loading'>();
  const credit = root.querySelector<HTMLElement>('[data-j-credit]')!;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  const lowData = Boolean(conn?.saveData) || ['slow-2g', '2g', '3g'].includes(conn?.effectiveType ?? '');
  function loadRaster(slug: string) {
    if (lowData || rasters.has(slug) || !mapBounds[slug]) return;
    rasters.set(slug, 'loading');
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      rasters.set(slug, { img, b: mapBounds[slug], t0: performance.now() });
      if (slug === 'country') credit.hidden = false;
      request();
    };
    // The template ships the WebP tiles only (the site also has AVIF twins).
    img.src = mapUrls[`/src/assets/map/${slug}.webp`];
  }
  const fadeOf = (r: Raster, now: number) => (reduced.matches ? 1 : clamp((now - r.t0) / 300));
  const fading = (now: number) => [...rasters.values()].some((r) => typeof r === 'object' && fadeOf(r, now) < 1);
  /** Draw a Mercator raster through the current projection in N×M affine cells (exact at the cell corners). */
  function drawRaster({ img, b }: Raster, alpha: number, N: number, M: number, bleed = 0.75) {
    const iw = img.naturalWidth, ih = img.naturalHeight, mN = merc(b.n), mS = merc(b.s);
    const pt = (u: number, v: number) => proj([b.w + (b.e - b.w) * u, unmerc(mN + (mS - mN) * v)])!;
    ctx.globalAlpha = alpha;
    for (let j = 0; j < M; j++) for (let i = 0; i < N; i++) {
      const p00 = pt(i / N, j / M), p10 = pt((i + 1) / N, j / M), p01 = pt(i / N, (j + 1) / M);
      const p11x = p10[0] + p01[0] - p00[0], p11y = p10[1] + p01[1] - p00[1];
      const xs = [p00[0], p10[0], p01[0], p11x], ys = [p00[1], p10[1], p01[1], p11y];
      if (Math.max(...xs) < 0 || Math.min(...xs) > W || Math.max(...ys) < 0 || Math.min(...ys) > H) continue;
      const x0 = (i * iw) / N, y0 = (j * ih) / M, cw = iw / N, ch = ih / M;
      const a = (p10[0] - p00[0]) / cw, bb = (p10[1] - p00[1]) / cw, c = (p01[0] - p00[0]) / ch, d = (p01[1] - p00[1]) / ch;
      ctx.setTransform(dpr * a, dpr * bb, dpr * c, dpr * d, dpr * (p00[0] - a * x0 - c * y0), dpr * (p00[1] - bb * x0 - d * y0));
      // Grow each cell by `bleed` screen px on every side (in image px) so anti-aliasing and the parallelogram
      // approximation of the fourth corner never leave seams. Gaps grow with cell size², so far layers need more.
      const px = bleed / Math.max(1e-3, Math.min(Math.hypot(a, bb), Math.hypot(c, d)));
      const sx = Math.max(0, x0 - px), sy = Math.max(0, y0 - px);
      const sw = Math.min(x0 + cw + px, iw) - sx, sh = Math.min(y0 + ch + px, ih) - sy;
      ctx.drawImage(img, sx, sy, sw, sh, sx, sy, sw, sh);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
  }

  const bySlug = new Map(cfg.places.map((s) => [s.id, s]));
  const cityPins = new Map([...root.querySelectorAll<HTMLButtonElement>('[data-j-city]')].map((b) => [b.dataset.jCity!, b]));
  const attrPins = new Map([...root.querySelectorAll<HTMLButtonElement>('[data-j-attr]')].map((b) => [b.dataset.jAttr!, b]));
  const attrCoords = new Map<string, LonLat>(cfg.places.flatMap((s) => s.attractions.map((a) => [`${s.id}/${a.id}`, a.coords] as [string, LonLat])));
  const hintEl = root.querySelector<HTMLElement>('.j-hint')!;
  const sphere: GeoSphere = { type: 'Sphere' };
  const graticule = geoGraticule().step([20, 20])();

  let geo: Awaited<typeof geoReady> | null = null;
  let boxPoly: GeoJSON.Polygon | null = null;
  const proj: GeoProjection = geoOrthographic().precision(0.3);
  const path = geoPath(proj, ctx);
  let W = 0, H = 0, dpr = 1, rect = { x: 0, y: 0, w: 0, h: 0 }, R0 = 1, kUz = 4, narrow = false;
  // drawMap's one-shot country pulse is not used here (the fly-in replaces it).
  const uzPulseAt = 0, PULSE = 1800;
  const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  // ---------- State ----------
  let level: Level = 'country';
  let city = '';
  let attr = '';
  let introDone = false;
  let cam: View = { c: WORLD, k: 1, x: 0, y: 0 };
  let anim: { from: View; to: View; t0: number; ms: number } | null = null;

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    narrow = W < 520;
    // The map fills its whole box: no inner padding.
    rect = { x: 0, y: 0, w: Math.max(1, W), h: Math.max(1, H) };
    R0 = Math.max(Math.min(rect.w, rect.h) / 2, narrow ? 170 : 0);
  }

  /** The part of the map the panel does not cover. */
  function focus() {
    if (panel.hidden || level === 'country') return { x: 0, y: 0, w: W, h: H };
    const m = root.getBoundingClientRect(), p = panel.getBoundingClientRect();
    if (innerWidth >= 1024) return { x: 0, y: 0, w: Math.max(200, p.left - m.left), h: H };
    return { x: 0, y: 56, w: W, h: Math.max(160, p.top - m.top - 56) };
  }
  function fitView(c: LonLat, obj: GeoPermissibleObjects, f: { x: number; y: number; w: number; h: number }, pad: number) {
    const p = geoOrthographic().rotate([-c[0], -c[1]]).fitExtent([[f.x + pad, f.y + pad], [f.x + f.w - pad, f.y + f.h - pad]], obj as never);
    return p.scale() / R0;
  }
  function countryView(): View {
    // Between the fixed nav (or the hint below it) and the bottom edge with a 24px margin, so the whole country shows.
    const navClear = parseFloat(css.getPropertyValue('--nav-clear')) || 112;
    const top = Math.max(navClear, hintEl.offsetTop + hintEl.offsetHeight + 8);
    const f = { x: 0, y: top, w: W, h: H - top - 24 };
    // The whole country always fits, phones included (an enlarged phone fit cropped Karakalpakstan and Fergana).
    if (geo) kUz = fitView(cfg.centroid, { type: 'Feature', properties: {}, geometry: geo.region.uz }, f, narrow ? 4 : 8);
    return { c: cfg.centroid, k: kUz, x: f.x + f.w / 2, y: f.y + f.h / 2 };
  }
  function cityView(slug: string): View {
    const s = bySlug.get(slug)!, f = focus();
    // Centred on the city; zoomed so the farthest attraction fits (each point mirrored through the centre).
    const c = s.coords;
    // A place without attractions: show its province around it.
    if (!s.attractions.length) return { c, k: kUz * TOWN_K, x: f.x + f.w / 2, y: f.y + f.h / 2 };
    const pts = s.attractions.filter((a) => !a.far).flatMap((a) => [a.coords, [2 * c[0] - a.coords[0], 2 * c[1] - a.coords[1]] as LonLat]);
    // Capped so the city and its neighbours stay readable (deeper zoom fills the frame with flat yellow).
    const k = clamp(fitView(c, { type: 'MultiPoint', coordinates: pts }, f, narrow ? 56 : 80), kUz * 1.6, kUz * K_CITY);
    return { c, k, x: f.x + f.w / 2, y: f.y + f.h / 2 };
  }
  function attrView(key: string): View {
    const base = cityView(key.split('/')[0]);
    const at = attrCoords.get(key)!;
    // Nudge: centre on the attraction, a little closer in.
    return { ...base, c: at, k: Math.min(base.k * 1.5, kUz * K_ATTR) };
  }
  const target = (): View => (level === 'country' ? countryView() : level === 'city' ? cityView(city) : attrView(attr));

  function moveTo(to: View, ms: number) {
    if (reduced.matches || ms === 0) { anim = null; cam = to; }
    else anim = { from: { ...cam }, to, t0: performance.now(), ms };
    request();
  }
  const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  function step(now: number) {
    if (!anim) return false;
    const t = clamp((now - anim.t0) / anim.ms), e = easeIO(t), { from: a, to: b } = anim;
    const lerp = (p: number, q: number) => p + (q - p) * e;
    cam = { c: [lerp(a.c[0], b.c[0]), lerp(a.c[1], b.c[1])], k: Math.exp(lerp(Math.log(a.k), Math.log(b.k))), x: lerp(a.x, b.x), y: lerp(a.y, b.y) };
    if (t >= 1) anim = null;
    return Boolean(anim);
  }

  const stroke = (color: string, width: number, alpha = 1) => {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.globalAlpha = alpha; ctx.stroke(); ctx.globalAlpha = 1;
  };
  const fill = (color: string, alpha = 1) => { ctx.fillStyle = color; ctx.globalAlpha = alpha; ctx.fill(); ctx.globalAlpha = 1; };
  const shape = (g: GeoPermissibleObjects) => { ctx.beginPath(); path(g); };
  /** Clip to the region box (inside) or to everything else (outside). */
  const clipBox = (inside: boolean) => {
    ctx.beginPath();
    if (!inside) ctx.rect(0, 0, W, H);
    path(boxPolygon());
    ctx.clip(inside ? 'nonzero' : 'evenodd');
  };
  function boxPolygon() {
    if (boxPoly) return boxPoly;
    // Edges densified along parallels (0.5°), matching how geo.mjs clipped the regional data in plain lon/lat.
    // Inset by 0.3° so the clip never lands on the region data's own cut line along the box (the faint seam at k≈2).
    const [b0, c0, b1, c1] = geo!.region.meta.box!;
    const x0 = b0 + 0.3, y0 = c0 + 0.3, x1 = b1 - 0.3, y1 = c1 - 0.3;
    const ring: LonLat[] = [];
    for (let x = x0; x < x1; x += 0.5) ring.push([x, y0]);
    for (let y = y0; y < y1; y += 0.5) ring.push([x1, y]);
    for (let x = x1; x > x0; x -= 0.5) ring.push([x, y1]);
    for (let y = y1; y > y0; y -= 0.5) ring.push([x0, y]);
    ring.push([x0, y0]);
    // d3 wants exteriors clockwise as seen on the globe: this ring runs counter-clockwise, so reverse it.
    return (boxPoly = { type: 'Polygon', coordinates: [ring.reverse()] });
  }

  function drawMap(k: number, now: number) {
    const cx = rect.x + rect.w / 2, cy = rect.y + rect.h / 2, R = R0 * k;
    const rA = clamp((k - LOD0) / (LOD1 - LOD0)), gA = 1 - rA;

    // Sea: pale cream with a soft sand limb on the globe; land is the filled shape (classic map reading).
    shape(sphere); fill(C.cream);
    if (gA > 0) {
      const g = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.3, R * 0.4, cx, cy, R);
      g.addColorStop(0, C.cream + '00'); g.addColorStop(1, C.water);
      ctx.fillStyle = g; ctx.globalAlpha = 0.6 * gA; ctx.fill(); ctx.globalAlpha = 1;
      shape(graticule); stroke(C.sand, 0.6, 0.3 * gA);
    }
    if (!geo) return;
    const { globe, region } = geo;

    // Fills: opaque. The globe level fills everywhere until the crossfade ends, then only outside the region box.
    const globeFills = () => {
      shape(globe.land); fill(C.land);
      shape(globe.uz); fill(C.sun);
      shape(globe.lakes); fill(C.cream);
    };
    if (gA > 0) globeFills();
    else { ctx.save(); clipBox(false); globeFills(); ctx.restore(); }
    if (rA > 0) {
      ctx.save(); clipBox(true);
      shape(region.land); fill(C.land);
      shape(region.uz); fill(C.sun);
      shape(region.lakes); fill(C.cream);
      ctx.restore();
    }

    // Real-colour imagery over the flat fills: the wide low-res layer, the country raster, then the open city's
    // detail raster (all with feathered edges); outside Uzbekistan it is dimmed with paper so the country stays the subject.
    const wide = rasters.get('wide'), country = rasters.get('country'), detail = level !== 'country' ? rasters.get(city) : undefined;
    const imagery = rA > 0 && typeof country === 'object';
    if (imagery) {
      if (typeof wide === 'object') drawRaster(wide, rA * fadeOf(wide, now), 32, 32, 2);
      drawRaster(country, rA * fadeOf(country, now), 24, 16);
      if (typeof detail === 'object') drawRaster(detail, rA * fadeOf(detail, now), 12, 8);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); path(region.uz); ctx.clip('evenodd');
      ctx.globalAlpha = 0.55 * rA; ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
      ctx.restore(); ctx.globalAlpha = 1;
    }

    // The open city's province: suzani texture under a dark ink tint, so the city's region stands apart
    // (lighter over imagery, so the terrain still shows through).
    if (level !== 'country') {
      const here = proj(bySlug.get(city)!.coords) ?? [0, 0];
      for (const code of bySlug.get(city)!.province) {
        const g = geo.provinces[code], pat = patternFor(code);
        if (!g || !pat) continue;
        pat.setTransform(new DOMMatrix().translate(here[0], here[1]).scale(0.5));
        shape(g); ctx.globalAlpha = imagery ? 0.6 : 1; ctx.fillStyle = pat; ctx.fill(); ctx.globalAlpha = 1; fill(C.ink, 0.3);
      }
    }

    // Globe strokes: full outside the region box, fading inside it.
    const globeStrokes = (a: number) => {
      if (a <= 0) return;
      shape(globe.borders); stroke(C.paper, 0.9, a);
      shape(globe.land); stroke(C.sandInk, 0.8, 0.6 * a);
      shape(globe.lakes); stroke(C.sandInk, 0.8, 0.5 * a);
    };
    if (rA === 0) globeStrokes(1);
    else {
      ctx.save(); clipBox(false); globeStrokes(1); ctx.restore();
      ctx.save(); clipBox(true); globeStrokes(gA); ctx.restore();
      ctx.save(); clipBox(true);
      shape(region.rivers); stroke(C.sand, 1, 0.45 * rA);
      shape(region.borders); stroke(C.paper, 3, rA);
      shape(region.borders); stroke(C.sandInk, 0.9, 0.7 * rA);
      shape(region.coast); stroke(C.sandInk, 1, 0.6 * rA);
      shape(region.lakes); stroke(C.sandInk, 1, 0.6 * rA);
      ctx.restore();
    }
    shape(sphere); stroke(C.sand, 1.5, gA);

    // Uzbekistan outline: 1px on the globe → 1.5px zoomed, round joins, no glow.
    ctx.lineJoin = 'round';
    const uzW = 1.6 + 0.8 * clamp(k - 1.5);
    if (gA > 0) { shape(globe.uz); stroke(C.ink, uzW, gA); }
    if (rA > 0) { shape(region.uz); stroke(C.ink, uzW, rA); }

    // One ring pulse while the country is small.
    if (k < 1.5 && uzPulseAt && now - uzPulseAt < PULSE) {
      const p = proj(cfg.centroid);
      if (p) {
        const a = clamp((1.5 - k) / 0.3), ph = (now - uzPulseAt) / PULSE;
        ctx.beginPath(); ctx.arc(p[0], p[1], 18 + ph * 40, 0, Math.PI * 2); stroke(C.ink, 2, (1 - ph) * 0.7 * a);
      }
    }
  }


  // ---------- Pins: placed from the projection, then pushed apart so discs never overlap ----------
  type Placed = { el: HTMLButtonElement; ax: number; ay: number; x: number; y: number; r: number };
  function declutter(list: Placed[], gap: number) {
    for (let it = 0; it < 60; it++) {
      let moved = false;
      for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
        const a = list[i], b = list[j];
        let dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
        const min = a.r + b.r + gap;
        if (d >= min) continue;
        if (d < 0.01) { dx = 1; dy = 0.3; d = Math.hypot(dx, dy); }
        const push = (min - d) / 2;
        a.x -= (dx / d) * push; a.y -= (dy / d) * push; b.x += (dx / d) * push; b.y += (dy / d) * push;
        moved = true;
      }
      if (!moved) break;
    }
    const f = focus();
    for (const p of list) {
      // City discs carry a craft cutout below-right of the disc: keep it inside the frame too.
      const cr = p.el.dataset.jCity ? p.r * 1.45 : p.r;
      p.x = clamp(p.x, f.x + p.r + 6, f.x + f.w - cr - 6);
      p.y = clamp(p.y, f.y + p.r + 6, f.y + f.h - cr - 30);
    }
  }
  const radius = (el: HTMLElement) => el.offsetWidth / 2 || 28;
  const facing = (ll: LonLat) => geoDistance(ll, cam.c) < Math.PI / 2 - 0.08;

  type Box = { x0: number; y0: number; x1: number; y1: number };
  /** Map controls that town pins must not sit under. */
  const uiEls = [root.querySelector<HTMLElement>('.j-hint')!, backBtn, root.querySelector<HTMLElement>('.j-zoom')!];
  const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
  /** A pin's box: disc plus its name label (below, or above when flipped by `is-up`). */
  const discBox = ({ el, x, y, r }: Placed, pad: number): Box => {
    const name = el.querySelector<HTMLElement>('.j-name');
    const nw = name ? name.offsetWidth / 2 : 0, nh = name ? name.offsetHeight + 4 : 0;
    const up = el.classList.contains('is-up');
    return { x0: x - Math.max(r, nw) - pad, y0: y - r - (up ? nh : 0) - pad, x1: x + Math.max(r, nw) + pad, y1: y + r + (up ? 0 : nh) + pad };
  };

  function placePins(): Placed[] {
    const placed: Placed[] = [];
    const cities: Placed[] = [];
    // City discs appear once the country fills most of the frame.
    const cityA = level === 'country' ? clamp((cam.k / kUz - 0.55) / 0.35) : 0;
    for (const [slug, el] of cityPins) {
      const ll = bySlug.get(slug)!.coords, p = proj(ll);
      const on = cityA > 0.02 && p && facing(ll);
      el.hidden = !on;
      el.classList.toggle('is-off', cityA < 0.98);
      if (on) cities.push({ el, ax: p[0], ay: p[1], x: p[0], y: p[1], r: radius(el) });
    }
    if (level !== 'country') {
      for (const [key, el] of attrPins) {
        if (!key.startsWith(`${city}/`)) { el.hidden = true; continue; }
        el.hidden = false;
        el.classList.toggle('is-current', key === attr);
        const p = proj(attrCoords.get(key)!)!;
        placed.push({ el, ax: p[0], ay: p[1], x: p[0], y: p[1], r: radius(el) });
      }
    } else for (const el of attrPins.values()) el.hidden = true;
    declutter(placed, 10);
    // An attraction whose true spot left the frame hides instead of piling up at the edge.
    for (const p of placed) p.el.classList.toggle('is-off', p.ax < 0 || p.ax > W || p.ay < 0 || p.ay > H);
    // Places never move. Route stops always show; every other place, in priority order (the DOM order), shows only
    // where its circle and name overlap no earlier place or map control. Zooming in spreads them out.
    const taken: Box[] = [];
    for (const el of uiEls) if (el.offsetParent) taken.push({ x0: el.offsetLeft, y0: el.offsetTop, x1: el.offsetLeft + el.offsetWidth, y1: el.offsetTop + el.offsetHeight });
    const isStop = (p: Placed) => p.el.dataset.kind === 'stop';
    for (const p of [...cities.filter(isStop), ...cities.filter((c) => !isStop(c))]) {
      const box = discBox(p, 2);
      const fits = isStop(p) || (box.x0 >= 0 && box.x1 <= W && box.y0 >= 0 && box.y1 <= H && !taken.some((t) => overlaps(box, t)));
      // The name flips above the circle near the bottom edge so it stays on screen.
      p.el.classList.toggle('is-up', p.y + p.r + 18 > H);
      if (fits) taken.push(box);
      else p.el.classList.add('is-off');
    }
    placed.push(...cities);
    for (const p of placed) p.el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`;
    return placed;
  }

  function draw(now: number) {
    const moving = step(now);
    proj.rotate([-cam.c[0], -cam.c[1]]).scale(R0 * cam.k).translate([cam.x, cam.y]);
    ctx.globalAlpha = 1;
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
    drawMap(cam.k, now);

    const placed = placePins();
    // Leaders from a pin pushed off its true spot back to that spot.
    for (const p of placed) {
      if (p.el.classList.contains('is-off') || Math.hypot(p.x - p.ax, p.y - p.ay) < p.r) continue;
      ctx.beginPath(); ctx.moveTo(p.ax, p.ay); ctx.lineTo(p.x, p.y); stroke(C.ink, 1.5, 0.7);
      ctx.beginPath(); ctx.arc(p.ax, p.ay, 3.5, 0, Math.PI * 2); fill(C.ink);
    }
    syncZoomUI();
    if (level !== 'country') {
      const p = proj(bySlug.get(city)!.coords);
      if (p) { ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, Math.PI * 2); fill(C.ink); ctx.lineWidth = 2; ctx.strokeStyle = C.sun; ctx.stroke(); }
    }
    return moving || fading(now);
  }

  // Render on demand while visible.
  let visible = false, raf = 0;
  const loop = (now: number) => {
    raf = 0;
    if (!visible) return;
    if (draw(now)) raf = requestAnimationFrame(loop);
  };
  const request = () => { if (visible && !raf) raf = requestAnimationFrame(loop); };

  // ---------- Panel: FLIP between views (height, title size, content fade) ----------
  let panelAnims: Animation[] = [];
  function showView(key: string | null) {
    const was = !panel.hidden;
    const from = was ? panel.getBoundingClientRect().height : 0;
    const t0 = was ? titleEl.getBoundingClientRect() : null;
    const fs0 = was ? parseFloat(getComputedStyle(titleEl).fontSize) : 0;
    panelAnims.forEach((a) => a.cancel());
    panelAnims = [];
    root.dataset.level = level;
    if (!key) {
      if (!was) return;
      if (reduced.matches) { panel.hidden = true; return; }
      const a = panel.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(12px)' }], { duration: 240, easing: EASE });
      a.onfinish = () => { panel.hidden = true; views.forEach((v) => (v.hidden = true)); };
      panelAnims.push(a);
      return;
    }
    const v = views.get(key)!;
    views.forEach((x, k) => (x.hidden = k !== key));
    v.querySelectorAll<HTMLImageElement>('img').forEach((img) => (img.loading = 'eager'));
    titleEl.textContent = v.dataset.title ?? '';
    kickerEl.textContent = v.dataset.kicker ?? '';
    panel.hidden = false;
    body.scrollTop = 0;
    const desc = v.querySelector<HTMLElement>('.j-desc');
    if (desc) desc.scrollTop = 0;
    setupSlider(v);
    if (reduced.matches) return;
    const to = panel.getBoundingClientRect().height;
    if (!was) {
      panelAnims.push(panel.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: PANEL_MS, easing: EASE }));
    } else if (Math.abs(to - from) > 1) {
      panelAnims.push(panel.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: PANEL_MS, easing: EASE }));
    }
    if (t0) {
      const t1 = titleEl.getBoundingClientRect(), s = fs0 / parseFloat(getComputedStyle(titleEl).fontSize);
      panelAnims.push(titleEl.animate(
        [{ transform: `translate(${t0.left - t1.left}px, ${t0.top - t1.top}px) scale(${s})` }, { transform: 'none' }],
        { duration: PANEL_MS, easing: EASE },
      ));
    }
    for (const el of [v, kickerEl]) {
      panelAnims.push(el.animate([{ opacity: 0, translate: '0 5px' }, { opacity: 1, translate: '0 0' }], { duration: 260, delay: 80, easing: 'cubic-bezier(.25,.1,.25,1)', fill: 'backwards' }));
    }
  }

  function setLevel(next: Level, slug = city, key = '') {
    level = next; city = slug; attr = key;
    if (slug) loadRaster(slug);
    // Pins start hidden, where lazy images never start in WebKit: load this city's now.
    if (slug) for (const [k, el] of attrPins) if (k.startsWith(`${slug}/`)) el.querySelectorAll('img').forEach((img) => (img.loading = 'eager'));
    disarm();
    backBtn.hidden = level === 'country';
    showView(level === 'country' ? null : level === 'city' ? city : attr);
    // The camera aims at the area the panel leaves free, measured after the panel opened.
    setLimits();
    moveTo(target(), MOVE_MS);
  }
  function back() {
    if (!viewer.hidden) return closeViewer();
    if (level === 'attraction') { const k = attr; setLevel('city', city); attrPins.get(k)?.focus({ preventScroll: true }); }
    else if (level === 'city') { const s = city; setLevel('country', ''); cityPins.get(s)?.focus({ preventScroll: true }); }
  }

  // ---------- Pins: hover/focus via CSS; touch = first tap arms (descriptor), second tap opens ----------
  let pointer = '';
  const disarm = () => root.querySelectorAll('.j-pin.is-armed').forEach((p) => p.classList.remove('is-armed'));
  root.addEventListener('pointerdown', (e) => { pointer = e.pointerType; }, { capture: true, passive: true });
  root.addEventListener('click', (e) => {
    const pin = (e.target as Element).closest<HTMLButtonElement>('.j-pin');
    if (!pin) {
      // Click-out: empty map goes up one level (a touch-armed pin just disarms; a drag is not a click).
      if ((e.target as Element).closest('.j-panel, .j-viewer, .j-back, .j-zoom') || dragged > 6) return;
      if (root.querySelector('.j-pin.is-armed')) disarm(); else back();
      return;
    }
    if (pointer === 'touch' && !pin.classList.contains('is-armed')) { disarm(); pin.classList.add('is-armed'); pointer = ''; return; }
    pointer = '';
    if (pin.dataset.jCity) setLevel('city', pin.dataset.jCity);
    else if (pin.dataset.jAttr) setLevel('attraction', pin.dataset.jAttr.split('/')[0], pin.dataset.jAttr);
  });
  backBtn.addEventListener('click', back);
  document.addEventListener('keydown', (e) => {
    const a = document.activeElement;
    if (a && a !== document.body && !section.contains(a)) return;
    if (e.key !== 'Escape' || (level === 'country' && viewer.hidden)) return;
    e.preventDefault();
    back();
  }, { signal: off.signal });

  // ---------- Slider: snap, side slides blurred; arrows step one slide ----------
  function setupSlider(v: HTMLElement) {
    const list = v.querySelector<HTMLElement>('[data-j-slides]');
    if (!list) return;
    list.scrollLeft = 0;
    const slides = [...list.children] as HTMLElement[];
    const prev = v.querySelector<HTMLButtonElement>('[data-j-prev]'), next = v.querySelector<HTMLButtonElement>('[data-j-next]');
    const update = () => {
      const mid = list.scrollLeft + list.clientWidth / 2;
      let best = 0, bd = Infinity;
      slides.forEach((s, i) => { const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
      slides.forEach((s, i) => s.classList.toggle('is-center', i === best));
      if (prev) prev.disabled = best === 0;
      if (next) next.disabled = best === slides.length - 1;
      return best;
    };
    update();
    if (list.dataset.ready) return;
    list.dataset.ready = '1';
    list.addEventListener('scroll', update, { passive: true });
    const go = (d: number) => {
      const s = slides[clamp(update() + d, 0, slides.length - 1)];
      list.scrollTo({ left: s.offsetLeft + s.offsetWidth / 2 - list.clientWidth / 2, behavior: reduced.matches ? 'instant' : 'smooth' });
    };
    prev?.addEventListener('click', () => go(-1));
    next?.addEventListener('click', () => go(1));
    list.addEventListener('click', (e) => {
      const btn = (e.target as Element).closest<HTMLButtonElement>('[data-j-slide]');
      if (!btn) return;
      // A side slide first comes to the centre; the centred one opens the viewer.
      if (!btn.parentElement!.classList.contains('is-center')) { go(slides.indexOf(btn.parentElement!) - update()); return; }
      openViewer(btn);
    });
  }

  // ---------- Viewer: FLIP the slide photo up into the larger card ----------
  let opener: HTMLButtonElement | null = null;
  function openViewer(btn: HTMLButtonElement) {
    const img = btn.querySelector('img')!;
    opener = btn;
    // The slide shows the small variant: start from it (already decoded), then swap to the widest one of the same format.
    viewerImg.src = img.currentSrc || img.src;
    const ext = viewerImg.src.split('.').pop();
    const set = [...(img.closest('picture')?.querySelectorAll('source') ?? [])].find((s) => s.type === `image/${ext}`)?.srcset;
    const big = set?.split(',').pop()?.trim().split(' ')[0];
    if (big) { const pre = new Image(); pre.onload = () => { if (opener === btn) viewerImg.src = big; }; pre.src = big; }
    viewerImg.alt = img.alt;
    viewerImg.width = img.naturalWidth || img.width;
    viewerImg.height = img.naturalHeight || img.height;
    viewer.querySelector('[data-j-viewer-title]')!.textContent = btn.dataset.title ?? '';
    viewer.querySelector('[data-j-viewer-note]')!.textContent = btn.dataset.note ?? '';
    viewer.hidden = false;
    viewer.querySelector<HTMLElement>('[data-j-viewer-close]')!.focus({ preventScroll: true });
    if (reduced.matches) return;
    const a = img.getBoundingClientRect(), b = viewerImg.getBoundingClientRect();
    viewerImg.animate(
      [{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`, borderRadius: '12px' }, { transform: 'none', borderRadius: '0' }],
      { duration: PANEL_MS, easing: EASE },
    );
    viewer.animate([{ backgroundColor: 'transparent' }, {}], { duration: PANEL_MS, easing: EASE });
    viewer.querySelector('.j-viewer-text')!.animate([{ opacity: 0, translate: '0 5px' }, { opacity: 1, translate: '0 0' }], { duration: 260, delay: 160, easing: EASE, fill: 'backwards' });
  }
  function closeViewer() {
    const done = () => { viewer.hidden = true; opener?.focus({ preventScroll: true }); };
    if (reduced.matches) return done();
    viewer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: EASE }).onfinish = done;
  }
  viewer.querySelector('[data-j-viewer-close]')!.addEventListener('click', closeViewer);
  viewer.addEventListener('click', (e) => { if (e.target === viewer) closeViewer(); });

  // ---------- Zoom and pan: +/− buttons, ctrl/⌘ + wheel, pinch, drag. A plain wheel keeps scrolling the page. ----------
  const zoomIn = root.querySelector<HTMLButtonElement>('[data-j-zoom="in"]')!;
  const zoomOut = root.querySelector<HTMLButtonElement>('[data-j-zoom="out"]')!;
  let kMax = 1, homeK = 1, dragged = 0;
  /** Zoom runs from the country fit to K_MAX× it at every level, so cities and borders stay readable. */
  function setLimits() {
    countryView();
    kMax = kUz * K_MAX;
    homeK = target().k;
  }
  /** Shift the view so the centre of the free area stays inside BOUNDS. */
  function bound(v: View): View {
    const f = focus(), cx = f.x + f.w / 2, cy = f.y + f.h / 2;
    proj.rotate([-v.c[0], -v.c[1]]).scale(R0 * v.k).translate([v.x, v.y]);
    const ll = proj.invert!([cx, cy]);
    if (!ll) return v;
    const t: LonLat = [clamp(ll[0], BOUNDS.x0, BOUNDS.x1), clamp(ll[1], BOUNDS.y0, BOUNDS.y1)];
    if (t[0] === ll[0] && t[1] === ll[1]) return v;
    const p = proj(t)!;
    return { ...v, x: v.x + cx - p[0], y: v.y + cy - p[1] };
  }
  /** Zoom by f keeping the screen point (px, py) fixed: exact, since only scale and translate change. */
  function zoomAbout(px: number, py: number, f: number, ms = 0) {
    const from = anim ? anim.to : cam;
    const k = clamp(from.k * f, kUz, kMax), r = k / from.k;
    moveTo(bound({ ...from, k, x: px - (px - from.x) * r, y: py - (py - from.y) * r }), ms);
  }
  function panBy(dx: number, dy: number) {
    anim = null;
    cam = bound({ ...cam, x: cam.x + dx, y: cam.y + dy });
    request();
  }
  function syncZoomUI() {
    const k = anim ? anim.to.k : cam.k;
    zoomIn.disabled = k >= kMax * 0.999;
    zoomOut.disabled = k <= kUz * 1.001;
    root.toggleAttribute('data-zoomed', k > homeK * 1.02);
  }
  for (const [btn, f] of [[zoomIn, 1.6], [zoomOut, 1 / 1.6]] as const) {
    btn.addEventListener('click', () => { const r = focus(); zoomAbout(r.x + r.w / 2, r.y + r.h / 2, f, 320); });
  }
  root.addEventListener('wheel', (e) => {
    if (!(e.ctrlKey || e.metaKey) || (e.target as Element).closest('.j-panel, .j-viewer')) return;
    e.preventDefault(); e.stopPropagation();
    const b = canvas.getBoundingClientRect(), d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    zoomAbout(e.clientX - b.left, e.clientY - b.top, Math.exp(-clamp(d, -100, 100) * 0.01));
  }, { passive: false });

  const touches = new Map<number, { x: number; y: number }>();
  const local = (e: PointerEvent) => { const b = canvas.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
  canvas.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    touches.set(e.pointerId, local(e));
    if (touches.size === 1) dragged = 0;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    const prev = touches.get(e.pointerId);
    if (!prev) return;
    const p = local(e);
    if (touches.size >= 2) {
      const [a0, b0] = [...touches.values()];
      touches.set(e.pointerId, p);
      const [a1, b1] = [...touches.values()];
      const d0 = Math.hypot(a0.x - b0.x, a0.y - b0.y), d1 = Math.hypot(a1.x - b1.x, a1.y - b1.y);
      const mx = (a1.x + b1.x) / 2, my = (a1.y + b1.y) / 2;
      panBy(mx - (a0.x + b0.x) / 2, my - (a0.y + b0.y) / 2);
      if (d0 > 0) zoomAbout(mx, my, d1 / d0);
      dragged = 99;
      return;
    }
    touches.set(e.pointerId, p);
    // A finger pans only when zoomed in; otherwise the page scrolls (touch-action) and the browser cancels this pointer.
    if (e.pointerType === 'touch' && !root.hasAttribute('data-zoomed')) return;
    dragged += Math.hypot(p.x - prev.x, p.y - prev.y);
    if (dragged > 6) canvas.classList.add('is-dragging');
    panBy(p.x - prev.x, p.y - prev.y);
  });
  const release = (e: PointerEvent) => {
    touches.delete(e.pointerId);
    if (!touches.size) canvas.classList.remove('is-dragging');
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  // ---------- Start ----------
  loadRaster('wide');
  loadRaster('country');
  resize();
  cam = { c: WORLD, k: 1, x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
  let inView = false;
  const intro = () => {
    if (introDone || !geo || !inView) return;
    introDone = true;
    moveTo(countryView(), INTRO_MS);
  };
  const ioVisible = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) request(); });
  ioVisible.observe(root);
  const ioIntro = new IntersectionObserver(([e]) => { if (e.isIntersecting) { inView = true; intro(); } }, { threshold: 0.4 });
  ioIntro.observe(root);
  const ro = new ResizeObserver(() => {
    resize();
    if (introDone) { setLimits(); moveTo(target(), 0); }
    else cam = { ...cam, x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
    request();
  });
  ro.observe(canvas);
  geoReady.then((g) => {
    geo = g;
    if (reduced.matches) { introDone = true; cam = countryView(); }
    setLimits(); intro(); request();
  }).catch((err) => console.error('journey map data', err));
  section.classList.add('is-ready');
  return () => { off.abort(); ioVisible.disconnect(); ioIntro.disconnect(); ro.disconnect(); cancelAnimationFrame(raf); visible = false; };
}
