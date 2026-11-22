/**
 * The journey map's places: types and the validator for the places data (src/sample/journey.json in the template).
 *
 * Conventions
 * - coords are [lon, lat]; province holds ISO 3166-2:UZ codes without "UZ-".
 * - priority: lower shows first; at a zoom where circles would overlap, the higher number hides.
 * - photos are media keys with the source size; the caller turns a key into a URL (RenderOptions.media) and keeps
 *   the credits (src/sample/media-manifest.json). craft and suzani are optional extra paths, unused by the page.
 * - text.en is required (name, tagline, 3 highlights); other locales may give any field and fall back to en.
 * - climate arrays run January → December (monthly mean daily high / low, °C) with a source URL.
 */

export type LonLat = [number, number];
export const PLACE_KINDS = ['stop', 'city', 'spot'] as const;
export const ATTRACTION_KINDS = ['historical', 'natural', 'craft', 'food', 'modern'] as const;
export const HIGHLIGHT_LABELS = ['knownFor', 'taste', 'dontMiss'] as const;
export const LEG_MODES = ['train', 'road', 'flight'] as const;

export interface MediaPhoto { key: string; w: number; h: number }
export interface Attraction { id: string; kind: (typeof ATTRACTION_KINDS)[number]; coords: LonLat; photo?: MediaPhoto; far?: boolean }
export interface Highlight { label: (typeof HIGHLIGHT_LABELS)[number]; text: string }
export interface PlaceText {
  name: string;
  tagline: string;
  highlights: Highlight[];
  /** Caption of the craft cutout on the pin. */
  craft?: string;
  bestTimeNote?: string;
  /** Plain paragraphs. */
  body?: string[];
  attractions?: Record<string, { name: string; blurb: string }>;
}
export interface Place {
  id: string;
  kind: (typeof PLACE_KINDS)[number];
  /** Route position, stops only. */
  order?: number;
  priority: number;
  coords: LonLat;
  province: string[];
  photos: MediaPhoto[];
  craft?: string;
  climate?: { highC: number[]; lowC: number[]; source: string };
  bestMonths?: number[];
  attractions: Attraction[];
  text: { en: PlaceText } & Record<string, Partial<PlaceText>>;
}
export interface Leg { from: string; to: string; mode: (typeof LEG_MODES)[number]; hours: number; km: number }
export interface Journey { places: Place[]; legs: Leg[]; suzani: Record<string, string> }

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isLonLat = (v: unknown): v is LonLat =>
  Array.isArray(v) && v.length === 2 && isNum(v[0]) && isNum(v[1]) && Math.abs(v[0]) <= 180 && Math.abs(v[1]) <= 90;
const isPhoto = (v: unknown): v is MediaPhoto => isObj(v) && isStr(v.key) && isNum(v.w) && isNum(v.h);
const oneOf = <T extends readonly string[]>(list: T, v: unknown): v is T[number] => list.includes(v as string);
const twelve = (v: unknown) => Array.isArray(v) && v.length === 12 && v.every(isNum);

/** Problems with one place, empty when it is valid. */
function placeErrors(p: Obj): string[] {
  const e: string[] = [];
  if (!isStr(p.id) || !/^[a-z0-9-]+$/.test(p.id)) e.push('id must be kebab-case');
  if (!oneOf(PLACE_KINDS, p.kind)) e.push(`kind must be one of ${PLACE_KINDS.join('/')}`);
  if (p.kind === 'stop' && !isNum(p.order)) e.push('a stop needs order');
  if (!isNum(p.priority)) e.push('priority must be a number');
  if (!isLonLat(p.coords)) e.push('coords must be [lon, lat]');
  if (!Array.isArray(p.province) || !p.province.every(isStr)) e.push('province must be a list of codes');
  if (!Array.isArray(p.photos) || !p.photos.length || !p.photos.every(isPhoto)) e.push('photos must be [{ key, w, h }, …], at least one');
  if (p.craft !== undefined && !isStr(p.craft)) e.push('craft must be a URL');
  if (p.climate !== undefined && !(isObj(p.climate) && twelve(p.climate.highC) && twelve(p.climate.lowC) && isStr(p.climate.source))) e.push('climate needs 12 highC, 12 lowC and a source');
  if (p.bestMonths !== undefined && !(Array.isArray(p.bestMonths) && p.bestMonths.every((m) => isNum(m) && m >= 1 && m <= 12))) e.push('bestMonths must be 1–12');
  if (!Array.isArray(p.attractions)) e.push('attractions must be a list');
  else for (const a of p.attractions) {
    if (!isObj(a) || !isStr(a.id) || !oneOf(ATTRACTION_KINDS, a.kind) || !isLonLat(a.coords) || (a.photo !== undefined && !isPhoto(a.photo))) {
      e.push(`attraction ${isObj(a) ? String(a.id) : '?'} needs id, kind, coords and an optional photo { key, w, h }`);
    }
  }
  const en = isObj(p.text) ? p.text.en : undefined;
  if (!isObj(en) || !isStr(en.name) || !isStr(en.tagline)) e.push('text.en needs name and tagline');
  else {
    const h = en.highlights;
    if (!Array.isArray(h) || h.length !== 3 || !h.every((x) => isObj(x) && oneOf(HIGHLIGHT_LABELS, x.label) && isStr(x.text) && x.text.length <= 90)) {
      e.push('text.en.highlights needs 3 items { label: knownFor|taste|dontMiss, text ≤ 90 chars }');
    }
    const names = isObj(en.attractions) ? en.attractions : {};
    if (Array.isArray(p.attractions)) for (const a of p.attractions) if (isObj(a) && isStr(a.id) && !isObj(names[a.id])) e.push(`text.en.attractions.${a.id} missing`);
  }
  return e;
}

/**
 * Validate the file. Bad places, legs and suzani entries are reported and skipped, so one broken entry never takes
 * the map down; the build passes a reporter that throws, which fails it instead.
 */
export function parseJourney(raw: unknown, report: (msg: string) => void): Journey {
  const out: Journey = { places: [], legs: [], suzani: {} };
  if (!isObj(raw)) { report('journey.json: not an object'); return out; }
  const seen = new Set<string>();
  for (const p of Array.isArray(raw.places) ? raw.places : []) {
    const errs = isObj(p) ? placeErrors(p) : ['not an object'];
    const id = isObj(p) && isStr(p.id) ? p.id : '?';
    if (seen.has(id)) errs.push('duplicate id');
    if (errs.length) { report(`journey.json: place "${id}" skipped: ${errs.join('; ')}`); continue; }
    seen.add(id);
    out.places.push(p as unknown as Place);
  }
  for (const l of Array.isArray(raw.legs) ? raw.legs : []) {
    if (isObj(l) && seen.has(l.from as string) && seen.has(l.to as string) && oneOf(LEG_MODES, l.mode) && isNum(l.hours) && isNum(l.km)) out.legs.push(l as unknown as Leg);
    else report(`journey.json: leg ${JSON.stringify(l)} skipped`);
  }
  if (isObj(raw.suzani)) for (const [k, v] of Object.entries(raw.suzani)) {
    if (isStr(v)) out.suzani[k] = v;
    else report(`journey.json: suzani.${k} skipped`);
  }
  out.places.sort((a, b) => a.priority - b.priority);
  return out;
}

/** The place's text in `locale`, field by field over en. */
export function textFor(p: Place, locale: string): PlaceText {
  const en = p.text.en, loc = p.text[locale] ?? {};
  const attractions = { ...en.attractions };
  for (const [k, v] of Object.entries(loc.attractions ?? {})) attractions[k] = { ...attractions[k], ...v };
  return { ...en, ...loc, highlights: loc.highlights?.length === 3 ? loc.highlights : en.highlights, attractions };
}
