// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

import node from "@astrojs/node";

export default defineConfig({
  site: "https://london.js.org",

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react()],
  output: "server",

  adapter: node({
    mode: "standalone",
  }),

  experimental: {
    session: true
  }
});