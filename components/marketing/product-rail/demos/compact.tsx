import { ProductRail, type RailItem } from "../index";

const items: RailItem[] = [
  { id: "sand-tee", name: "Sand tee", price: "$42", kind: "tee", color: "#d8c9a8", description: "Cotton jersey with a ribbed collar." },
  { id: "slate-hoodie", name: "Slate hoodie", price: "$88", kind: "hoodie", color: "#5d6670", description: "Brushed fleece with a kangaroo pocket." },
  { id: "navy-coat", name: "Navy coat", price: "$196", kind: "coat", color: "#2f3d5c", description: "A long wool coat with a notched lapel." },
  { id: "clay-dress", name: "Clay dress", price: "$124", kind: "dress", color: "#b98b74", description: "A midi dress with a tied waist." },
];

export default function Demo() {
  return (
    <ProductRail
      eyebrow="Edit · four pieces"
      headline="Four pieces, one rail."
      items={items}
      colors={{ rail: "#8a9099", tag: "#fff8e8", shadow: "#1b1f24" }}
    />
  );
}
