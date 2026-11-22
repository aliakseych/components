import { InteractiveGlobe, type GlobeMarker } from "../index";

const markers: GlobeMarker[] = [
  { id: "lisbon", lat: 38.7223, lng: -9.1393, title: "Lisbon", description: "Office · 42 people" },
  { id: "nairobi", lat: -1.2921, lng: 36.8219, title: "Nairobi", description: "Office · 18 people" },
  { id: "bengaluru", lat: 12.9716, lng: 77.5946, title: "Bengaluru", description: "Office · 65 people" },
  { id: "sao-paulo", lat: -23.5505, lng: -46.6333, title: "São Paulo", description: "Office · 27 people" },
];

export default function Demo() {
  return (
    <div className="w-full max-w-xl">
      <InteractiveGlobe
        markers={markers}
        highlight={["Portugal", "Kenya", "India", "Brazil"]}
        zoomTo={{ lat: 10, lng: 15, zoom: 1 }}
        label="Office locations"
        className="aspect-square h-auto"
      />
    </div>
  );
}
