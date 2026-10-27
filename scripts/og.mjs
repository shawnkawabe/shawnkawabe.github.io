// Regenerates public/og/*.png (SPEC §4.5, BACKLOG P3-05): starts the dev server, screenshots the
// dev-only /dev/og card for every page and case study at 1200×630, then stops the server.
// Re-run after changing a project title, subtitle or cover, adding a project, or approving a
// language. English cards live in public/og/, translated ones in public/og/{locale}/. Only reviewed
// languages get cards, since public/ ships as is; `--drafts` adds the rest for a local preview.
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { chromium } from '@playwright/test';
import { withDevServer } from './dev-server.mjs';

const PAGES = ['work', 'skills', 'about', 'contact'];

const locales = Object.entries(JSON.parse(readFileSync('src/i18n/locales.json', 'utf8')))
  .filter(([, info]) => info.reviewed || process.argv.includes('--drafts'))
  .map(([locale]) => locale);
const projects = JSON.parse(readFileSync('content/en/projects.json', 'utf8'));
const routes = ['', ...PAGES, ...projects.map((project) => `work/${project.id}`)];
const cards = locales.flatMap((locale) => {
  const prefix = locale === 'en' ? '' : `${locale}/`;
  return routes.map((route) => ({
    route: `${prefix}${route}`,
    file: `public/og/${prefix}${route || 'default'}.png`,
  }));
});

await withDevServer('/dev/og', async (base) => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    for (const { route, file } of cards) {
      await page.goto(`${base}/dev/og/${route}`);
      await page.evaluate('document.fonts.ready');
      mkdirSync(dirname(file), { recursive: true });
      await page.screenshot({ path: file });
      console.log(`og: ${file}`);
    }
  } finally {
    await browser.close();
  }
});
