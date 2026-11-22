import { InteractiveGlobe, type GlobeMarker } from "../index";

const markers: GlobeMarker[] = [
  {
    id: "reykjavik",
    lat: 64.1466,
    lng: -21.9426,
    title: "Reykjavík",
    description: "The world's northernmost capital, a base for the Golden Circle and the Reykjanes peninsula.",
    href: "#reykjavik",
  },
  { id: "akureyri", lat: 65.6885, lng: -18.1262, title: "Akureyri", description: "Fjord town in the north, close to Lake Mývatn." },
  { id: "vik", lat: 63.4186, lng: -19.006, title: "Vík í Mýrdal", description: "Black sand beaches and sea stacks on the south coast." },
];

export default function Demo() {
  return (
    <div className="w-full max-w-3xl">
      <InteractiveGlobe
        markers={markers}
        highlight={["Iceland"]}
        initialView={{ lat: 64.9, lng: -19, zoom: 3 }}
        defaultSelectedId="reykjavik"
        className="h-[28rem] rounded-xl"
      />
    </div>
  );
}
