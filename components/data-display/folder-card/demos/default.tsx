import {
  Landmark, Scale, Users, ShieldCheck, Fingerprint, Car, Megaphone, ShoppingCart, Building2,
} from "lucide-react";
import { FolderCard, FolderCardGrid } from "../index";
import emblem from "./emblem.webp";

const items = [
  { title: "Constitution", icon: Landmark, views: 48210 },
  { title: "Code of Civil Procedure", icon: Scale, views: 31842 },
  { title: "Family Code", icon: Users, views: 27415 },
  { title: "Consumer Rights Protection Act", icon: ShieldCheck, views: 22093 },
  { title: "Personal Data Protection Law", icon: Fingerprint, views: 18764 },
  { title: "Road Traffic Regulations", icon: Car, views: 15330 },
  { title: "Advertising Law", icon: Megaphone, views: 9871 },
  { title: "E-commerce Regulation", icon: ShoppingCart, views: 8412 },
  { title: "Law on Limited Liability Companies", icon: Building2, views: 7208 },
];

export default function Demo() {
  return (
    <div className="w-full max-w-4xl p-4">
      <FolderCardGrid>
        {items.map((i) => (
          <FolderCard key={i.title} {...i} watermark={emblem} href="#" />
        ))}
      </FolderCardGrid>
    </div>
  );
}
