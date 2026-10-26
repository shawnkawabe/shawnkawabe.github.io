// @ts-check

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { cn } from 'cn/vite';

// Dev pages live outside src/pages, so only the dev server can serve them (ARCHITECTURE §4.3).
const devRoutes = [
  { pattern: '/dev/components', entrypoint: './src/dev/components.astro' },
  { pattern: '/dev/og', entrypoint: './src/dev/og.astro' },
];

const devGallery = () => ({
  name: 'dev-gallery',
  hooks: {
    /** @param {{ command: string; injectRoute: (route: { pattern: string; entrypoint: string }) => void }} options */
    'astro:config:setup': ({ command, injectRoute }) => {
      if (command === 'dev') devRoutes.forEach((route) => injectRoute(route));
    },
  },
});

// https://astro.build/config
export default defineConfig({
  site: 'https://shawnkawabe.github.io',
  output: 'static',
  integrations: [react(), sitemap(), devGallery()],
  vite: {
    plugins: [
      tailwindcss(),
      // Class-merge tables fitted to the classes this project uses (3 KB instead of ~15 KB).
      cn({
        content: ['src/**/*.{astro,ts,tsx}'],
        css: 'src/styles/global.css',
        out: 'src/lib/cn-tables.ts',
      }),
    ],
  },
});
