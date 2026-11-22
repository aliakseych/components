// Sample places for the journey globe: Uzbekistan's cities, photos from Wikimedia Commons (credits in
// ./media-manifest.json, listed in the footer's "Photos used" dialog). Replace journey.json, ./media and ./data with your own.
import raw from "./journey.json";
import manifest from "./media-manifest.json";
import { parseJourney } from "./schema";

const photos = import.meta.glob<string>("./media/**/*.webp", { eager: true, query: "?url", import: "default" });

export const journey = parseJourney(raw, (msg) => console.warn("journey.json:", msg));

/** Photo `key` (e.g. "cities/khiva/west-gate") at width 640 or 1280. */
export const mediaUrl = (key: string, w: number) => photos[`./media/${key}-${w}.webp`] ?? "";

export type Credit = { file: string; author?: string; license?: string; licenseUrl?: string; source?: string };
export const credits = Object.values(manifest as Record<string, Credit>).filter((e) => e.author);

const files = import.meta.glob<string>("./data/**/*.{webp,svg}", { eager: true, query: "?url", import: "default" });

/** A data path from journey.json ("/data/crafts/khiva.webp") as a bundled URL. */
export const assetUrl = (path: string) => files[`.${path}`] ?? path;
