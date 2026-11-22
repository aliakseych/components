// Decodes globe.json / region.json (written by scripts/geo.mjs): every line or ring is a flat array of integer
// deltas at 1/meta.q degrees, [x0, y0, dx1, dy1, …]. Shared by globe.ts (fetched) and StaticMap.astro (build time).
type Enc = { type: 'MultiPolygon' | 'MultiLineString'; coordinates: unknown[] };
export interface GeoMeta { source: string; maxScale: number; q: number; box?: [number, number, number, number] }

function line(a: number[], q: number): [number, number][] {
  const out: [number, number][] = new Array(a.length / 2);
  let x = 0, y = 0;
  for (let i = 0; i < a.length; i += 2) {
    x += a[i]; y += a[i + 1];
    out[i / 2] = [x / q, y / q];
  }
  return out;
}

export function decodeGeo<K extends string>(raw: { meta: GeoMeta } & Record<K, Enc>) {
  const q = raw.meta.q;
  const out = { meta: raw.meta } as { meta: GeoMeta } & Record<K, GeoJSON.MultiPolygon | GeoJSON.MultiLineString>;
  for (const [k, g] of Object.entries(raw) as unknown as [string, Enc][]) {
    if (k === 'meta') continue;
    const coordinates = g.type === 'MultiPolygon'
      ? (g.coordinates as number[][][]).map((p) => p.map((r) => line(r, q)))
      : (g.coordinates as number[][]).map((l) => line(l, q));
    (out as Record<string, unknown>)[k] = { type: g.type, coordinates };
  }
  return out;
}

export type GlobeGeo = { meta: GeoMeta; land: GeoJSON.MultiPolygon; borders: GeoJSON.MultiLineString; uz: GeoJSON.MultiPolygon; lakes: GeoJSON.MultiPolygon };
export type RegionGeo = GlobeGeo & { coast: GeoJSON.MultiLineString; rivers: GeoJSON.MultiLineString };
