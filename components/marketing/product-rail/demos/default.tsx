import { ProductRail, type RailItem } from "../index";

const items: RailItem[] = [
  { id: "linen-tee", name: "Linen tee", price: "$48", kind: "tee", color: "#e9e2d0", description: "Heavy linen, cut boxy with a dropped shoulder." },
  { id: "ink-hoodie", name: "Ink hoodie", price: "$96", kind: "hoodie", color: "#1f2328", description: "Brushed fleece with a double hood and kangaroo pocket." },
  { id: "sky-coat", name: "Sky coat", price: "$188", kind: "coat", color: "#9fb8d6", description: "A knee-length wool coat with a notched lapel." },
  { id: "moss-dress", name: "Moss dress", price: "$124", kind: "dress", color: "#5b6b4a", description: "A bias-cut midi with a tied waist and a soft drape." },
  { id: "fog-tee", name: "Fog tee", price: "$42", kind: "tee", color: "#c9ccd1", description: "Cotton jersey with a ribbed collar and a relaxed fit." },
  { id: "lilac-hoodie", name: "Lilac hoodie", price: "$88", kind: "hoodie", color: "#c7b3e6", description: "Soft cotton fleece in a washed lilac with a cropped hem." },
  { id: "rust-coat", name: "Rust coat", price: "$212", kind: "coat", color: "#b5623d", description: "A structured coat in a washed rust twill." },
  { id: "chalk-dress", name: "Chalk dress", price: "$118", kind: "dress", color: "#f2f2f2", description: "A slip dress in chalk crepe with thin straps." },
];

export default function Demo() {
  return (
    <ProductRail
      eyebrow="New season · eight pieces on the rail"
      headline="Pick a piece off the rail."
      items={items}
    />
  );
}
