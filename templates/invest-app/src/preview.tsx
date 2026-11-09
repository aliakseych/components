// Gallery entry: the component library renders one screen per iframe with this.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { InvestApp } from "./app";
import "./index.css";

export function mount(element: HTMLElement, { path, theme }: { path: string; theme: string }) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  createRoot(element).render(
    <StrictMode>
      <InvestApp mode="memory" initialPath={path} />
    </StrictMode>,
  );
}
