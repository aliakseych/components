import type { GeoPermissibleObjects } from "d3-geo";
import { BORDERS, COUNTRIES, Q } from "./countries-data";

export type LonLat = [number, number];
/** West, south, east, north in degrees. */
export type GeoBounds = [number, number, number, number];

export interface Country {
  id: string;
  name: string;
  geometry: MultiPolygon;
}

function line(a: number[], q = Q): LonLat[] {
  const out: LonLat[] = new Array(a.length / 2);
  let x = 0;
  let y = 0;
  for (let i = 0; i < a.length; i += 2) {
    x += a[i];
    y += a[i + 1];
    out[i / 2] = [x / q, y / q];
  }
  return out;
}

// Rounding can collapse tiny islands; d3 needs at least 4 points per ring.
const decodePolys = (polys: number[][][], q = Q): LonLat[][][] =>
  polys.map((p) => p.map((r) => line(r, q)).filter((r) => r.length >= 4)).filter((p) => p.length > 0);

type MultiPolygon = { type: "MultiPolygon"; coordinates: LonLat[][][] };
let cache: { countries: Country[]; land: MultiPolygon; borders: { type: "MultiLineString"; coordinates: LonLat[][] } } | null = null;

/** Decodes the bundled Natural Earth 1:110m countries once per page. */
export function worldGeo() {
  if (cache) return cache;
  const countries = COUNTRIES.map(([id, name, polys]) => ({
    id,
    name,
    geometry: { type: "MultiPolygon", coordinates: decodePolys(polys) } as MultiPolygon,
  }));
  cache = {
    countries,
    land: { type: "MultiPolygon", coordinates: countries.flatMap((c) => c.geometry.coordinates) },
    borders: { type: "MultiLineString", coordinates: BORDERS.map((b) => line(b)) },
  };
  return cache;
}

/** Country by ISO 3166-1 numeric id ("392" or 392) or Natural Earth name, case-insensitive. */
export function findCountry(key: string) {
  const k = key.trim().toLowerCase();
  const numeric = /^\d+$/.test(k) ? k.padStart(3, "0") : null;
  return worldGeo().countries.find((c) => (numeric ? c.id === numeric : c.name.toLowerCase() === k));
}

const detailed = new Map<string, Promise<MultiPolygon | null>>();
/**
 * Natural Earth 1:50m outline for a country, from a lazily imported chunk (~140 KB gzipped) so close zooms on a
 * highlighted country look right while the always-loaded world stays at 1:110m.
 */
export function loadDetailedCountry(c: Country) {
  let p = detailed.get(c.name);
  if (!p) {
    p = import("./countries-50m").then(({ COUNTRIES_50M, Q50 }) => {
      const hit = COUNTRIES_50M[c.name.toLowerCase()];
      return hit ? { type: "MultiPolygon" as const, coordinates: decodePolys(hit[1], Q50) } : null;
    });
    detailed.set(c.name, p);
  }
  return p;
}

// Web Mercator latitude helpers: satellite rasters are Mercator images placed through the globe projection.
const R_EARTH = 6378137;
export const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
export const unmerc = (m: number) => ((2 * Math.atan(Math.exp(m)) - Math.PI / 2) * 180) / Math.PI;
const MAX_LAT = 85;

export function clampBounds([w, s, e, n]: GeoBounds): GeoBounds {
  return [Math.max(-180, w), Math.max(-MAX_LAT, s), Math.min(180, e), Math.min(MAX_LAT, n)];
}

/**
 * Keyless default imagery: EOX Sentinel-2 cloudless 2016 (CC BY 4.0) through its public WMS, one Web Mercator image
 * for the bounds. Only the 2016 layer is CC BY; later years are non-commercial.
 */
export function eoxSatelliteUrl(bounds: GeoBounds, maxSide = 2048) {
  const [w, s, e, n] = clampBounds(bounds);
  const x0 = (w * Math.PI * R_EARTH) / 180;
  const x1 = (e * Math.PI * R_EARTH) / 180;
  const y0 = merc(s) * R_EARTH;
  const y1 = merc(n) * R_EARTH;
  const ratio = (x1 - x0) / (y1 - y0);
  const width = Math.round(ratio >= 1 ? maxSide : maxSide * ratio);
  const height = Math.round(ratio >= 1 ? maxSide / ratio : maxSide);
  const q = new URLSearchParams({
    service: "WMS",
    request: "GetMap",
    version: "1.1.1",
    layers: "s2cloudless_3857",
    styles: "",
    srs: "EPSG:3857",
    bbox: [x0, y0, x1, y1].map((v) => v.toFixed(0)).join(","),
    width: String(width),
    height: String(height),
    format: "image/jpeg",
  });
  return `https://tiles.maps.eox.at/wms?${q}`;
}

export const EOX_ATTRIBUTION =
  "Sentinel-2 cloudless – s2maps.eu by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2016)";

export type Geometry = GeoPermissibleObjects;
