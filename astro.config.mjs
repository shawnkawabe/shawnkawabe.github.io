// @ts-check

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { cn } from 'cn/vite';

// Dev pages live outside src/pages, so only the dev server can serve them (ARCHITECTURE §4.3).
const devRoutes = [
  { pattern: '/dev/components', entrypoint: './src/dev/components.astro' },
  { pattern: '/dev/og/[...route]', entrypoint: './src/dev/og.astro' },
  { pattern: '/dev/globe-poster/[theme]', entrypoint: './src/dev/globe-poster.astro' },
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
  // English-only launch URLs now live under /en/ (ADR 0003); static meta-refresh redirect pages.
  // /work/[id] is src/pages/work/[id].astro: config redirects cannot add a locale to a dynamic route.
  redirects: {
    '/work': '/en/work',
    '/skills': '/en/skills',
    '/about': '/en/about',
    '/contact': '/en/contact',
  },
  integrations: [
    react(),
    // Only localized pages: the root and the legacy URLs just redirect.
    sitemap({
      filter: (page) => /^\/(en|pt|es)\//.test(new URL(page).pathname),
    }),
    devGallery(),
  ],
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
