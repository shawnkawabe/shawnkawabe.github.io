// @ts-check

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// The component gallery lives outside src/pages, so only the dev server can serve it (ARCHITECTURE §4.3).
const devGallery = () => ({
  name: 'dev-gallery',
  hooks: {
    /** @param {{ command: string; injectRoute: (route: { pattern: string; entrypoint: string }) => void }} options */
    'astro:config:setup': ({ command, injectRoute }) => {
      if (command === 'dev')
        injectRoute({ pattern: '/dev/components', entrypoint: './src/dev/components.astro' });
    },
  },
});

// https://astro.build/config
export default defineConfig({
  site: 'https://shawnkawabe.github.io',
  output: 'static',
  integrations: [react(), sitemap(), devGallery()],
  vite: {
    plugins: [tailwindcss()],
  },
});
