import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import "./index.css";
import { RouterProvider } from "./lib/router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider mode="history">
      <App />
    </RouterProvider>
  </StrictMode>,
);
