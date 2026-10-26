import { readFileSync } from 'node:fs';
import type { Page } from '@playwright/test';

/** Every published route, read from the built sitemap so new projects are covered automatically. */
export function siteRoutes(): string[] {
  const sitemap = readFileSync('dist/sitemap-0.xml', 'utf8');
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => new URL(url).pathname);
}

export const NOT_FOUND = '/this-page-does-not-exist/';

export const THEMES = ['dark', 'light'] as const;

/** Sets the stored theme before any page script runs, as a returning visitor would have it. */
export async function useTheme(page: Page, theme: (typeof THEMES)[number]) {
  await page.addInitScript((value) => localStorage.setItem('pf-theme', value), theme);
}

/** Shows every scroll-reveal section at once so checks see the final state (ADR 0005). */
export async function revealAll(page: Page) {
  await page.evaluate(() => {
    for (const element of document.querySelectorAll('[data-reveal]')) {
      element.setAttribute('data-revealed', '');
    }
  });
  await page.waitForTimeout(500);
}
