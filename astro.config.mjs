// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://london.js.org',
  vite: {
    // @ts-expect-error - type mismatch between @tailwindcss/vite and Astro's bundled Vite types
    plugins: [tailwindcss()],
  },
  integrations: [react()],
});
