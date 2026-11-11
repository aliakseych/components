import { Scale } from "lucide-react";
import { FolderCard } from "../index";
import emblem from "./emblem.webp";

export default function Demo() {
  return (
    <div className="w-full max-w-xs p-4">
      <FolderCard title="Code of Civil Procedure" icon={Scale} views={31842} watermark={emblem} onClick={() => {}} />
    </div>
  );
}
