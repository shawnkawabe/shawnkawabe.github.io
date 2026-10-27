// Renders the hero globe poster (BACKLOG-LANDING L-35): screenshots the dev-only globe stage in each
// theme and keeps the top half of the sphere, the only part the hero ever shows. Astro's image
// pipeline makes the AVIF/WebP sizes at build. Re-run after changing the globe's look or tokens.
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { withDevServer } from './dev-server.mjs';

const SIZE = 2400;

await withDevServer('/dev/globe-poster/dark', async (base) => {
  const browser = await chromium.launch({
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  try {
    const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE } });
    mkdirSync('src/assets/globe', { recursive: true });
    for (const theme of ['dark', 'light']) {
      await page.goto(`${base}/dev/globe-poster/${theme}`);
      await page.waitForSelector('[data-stage][data-ready]', {
        state: 'attached',
        timeout: 60_000,
      });
      const png = await page.screenshot({
        omitBackground: true,
        clip: { x: 0, y: 0, width: SIZE, height: SIZE / 2 },
      });
      const file = `src/assets/globe/poster-${theme}.webp`;
      await sharp(png).webp({ quality: 90, alphaQuality: 90 }).toFile(file);
      console.log(`globe:poster: ${file}`);
    }
  } finally {
    await browser.close();
  }
});
