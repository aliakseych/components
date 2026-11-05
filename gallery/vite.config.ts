import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root,
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "") } },
  server: {
    port: 5199,
    fs: { allow: [fileURLToPath(new URL("..", import.meta.url))] },
  },
});
