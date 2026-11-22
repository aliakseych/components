import { InteractiveGlobe, type GlobeMarker } from "../index";

const markers: GlobeMarker[] = [
  { id: "tokyo", lat: 35.6762, lng: 139.6503, title: "Tokyo", description: "Capital and largest city, on Tokyo Bay.", href: "#tokyo" },
  { id: "kyoto", lat: 35.0116, lng: 135.7681, title: "Kyoto", description: "Former imperial capital with over 1,600 temples.", href: "#kyoto" },
  { id: "osaka", lat: 34.6937, lng: 135.5023, title: "Osaka", description: "Port city known for its castle and street food." },
  { id: "sapporo", lat: 43.0618, lng: 141.3545, title: "Sapporo", description: "Hokkaido's capital, host of the winter snow festival." },
  { id: "fukuoka", lat: 33.5904, lng: 130.4017, title: "Fukuoka", description: "Gateway to Kyushu on the Hakata Bay." },
];

export default function Demo() {
  return (
    <div className="w-full max-w-3xl">
      <InteractiveGlobe
        markers={markers}
        highlight={["Japan"]}
        initialView={{ lat: 20, lng: 60 }}
        satellite
        className="h-[32rem] rounded-xl"
      />
    </div>
  );
}
