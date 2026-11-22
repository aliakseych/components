// Entry used by the gallery: renders one screen in the requested theme. The intro plays only with ?intro.
import { createRoot, type Root } from "react-dom/client";
import { App } from "./app";
import "./index.css";

const roots = new WeakMap<HTMLElement, Root>();

export function mount(element: HTMLElement, { path, theme }: { path: string; theme: string }) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  let root = roots.get(element);
  if (!root) {
    root = createRoot(element);
    roots.set(element, root);
  }
  const intro = new URL(path, "http://x").searchParams.has("intro");
  root.render(<App key={`${path}-${theme}`} intro={intro} />);
}
