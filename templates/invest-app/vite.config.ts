import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const src = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^@\/(.*)$/, replacement: `${src}/$1` },
      // The screens were written for Next.js; these shims provide the same imports on a client router.
      { find: /^next$/, replacement: `${src}/shims/next/index.ts` },
      { find: /^next\/(.*)$/, replacement: `${src}/shims/next/$1` },
    ],
  },
  server: {
    port: 3000,
    // With VITE_API_URL unset the app runs on sample data. Point it at server/ to use the real API.
    proxy: { "/api": "http://localhost:8000" },
  },
});
