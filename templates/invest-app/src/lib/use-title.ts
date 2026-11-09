import { useEffect } from "react";
import { getConfig } from "@/template.config";

/** Sets document.title as "<title> · <brand>" (brand alone without a title). */
export function useTitle(title?: string | null) {
  useEffect(() => {
    const brand = getConfig().brand.name;
    document.title = title ? `${title} · ${brand}` : brand;
  }, [title]);
}
