import { AlertTriangle, Moon } from "lucide-react";

export function HalalBadge({ halal, note, size = "small" }: { halal: boolean; note?: string; size?: "small" | "large" }) {
  const Icon = halal ? Moon : AlertTriangle;
  return (
    <div>
      <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${size === "large" ? "px-3 py-2 text-sm" : "px-2.5 py-1 text-xs"} ${halal ? "bg-lime text-lime-foreground" : "bg-amber-100 text-amber-900"}`}>
        <Icon className="size-3.5" />
        {halal ? "Халяль" : "Не халяль"}
      </span>
      {!halal && note && <p className="mt-1 text-sm text-muted-foreground">{note}</p>}
    </div>
  );
}
