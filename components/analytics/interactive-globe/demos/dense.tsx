import { InteractiveGlobe, type GlobeMarker } from "../index";

// Many close-together cities: pins shrink when zoomed out and lower-priority ones hide until you zoom in.
const cities: [string, number, number, number][] = [
  ["London", 51.5072, -0.1276, 3],
  ["Paris", 48.8566, 2.3522, 3],
  ["Berlin", 52.52, 13.405, 3],
  ["Madrid", 40.4168, -3.7038, 3],
  ["Rome", 41.9028, 12.4964, 3],
  ["Amsterdam", 52.3676, 4.9041, 2],
  ["Brussels", 50.8503, 4.3517, 2],
  ["Vienna", 48.2082, 16.3738, 2],
  ["Prague", 50.0755, 14.4378, 2],
  ["Warsaw", 52.2297, 21.0122, 2],
  ["Zurich", 47.3769, 8.5417, 2],
  ["Munich", 48.1351, 11.582, 1],
  ["Hamburg", 53.5511, 9.9937, 1],
  ["Frankfurt", 50.1109, 8.6821, 1],
  ["Lyon", 45.764, 4.8357, 1],
  ["Marseille", 43.2965, 5.3698, 1],
  ["Barcelona", 41.3851, 2.1734, 1],
  ["Milan", 45.4642, 9.19, 1],
  ["Lisbon", 38.7223, -9.1393, 2],
  ["Dublin", 53.3498, -6.2603, 2],
  ["Copenhagen", 55.6761, 12.5683, 2],
  ["Stockholm", 59.3293, 18.0686, 2],
  ["Budapest", 47.4979, 19.0402, 1],
  ["Geneva", 46.2044, 6.1432, 0],
  ["Antwerp", 51.2194, 4.4025, 0],
  ["Rotterdam", 51.9244, 4.4777, 0],
  ["Cologne", 50.9375, 6.9603, 0],
  ["Stuttgart", 48.7758, 9.1829, 0],
  ["Turin", 45.0703, 7.6869, 0],
  ["Valencia", 39.4699, -0.3763, 0],
].map(([t, lat, lng, p]) => [t, lat, lng, p] as [string, number, number, number]);

const markers: GlobeMarker[] = cities.map(([title, lat, lng, priority]) => ({
  id: title.toLowerCase(),
  title,
  lat,
  lng,
  priority,
  description: "Partner office",
}));

export default function Demo() {
  return (
    <div className="w-full max-w-xl">
      <InteractiveGlobe
        markers={markers}
        zoomTo={{ lat: 48, lng: 8, zoom: 1.6 }}
        label="European offices"
        className="aspect-square h-auto"
      />
    </div>
  );
}
