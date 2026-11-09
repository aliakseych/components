// Standalone entry: `pnpm dev` in this folder.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { InvestApp } from "./app";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <InvestApp mode="history" config={{ apiUrl: import.meta.env.VITE_API_URL ?? "" }} />
  </StrictMode>,
);
