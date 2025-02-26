// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";


export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ["vite.fais.al"]
    }
  },

  integrations: [react()]
});