import { expect, test, type Page } from '@playwright/test';
import { NOT_FOUND, siteRoutes } from './routes';

/** Console errors and uncaught exceptions, minus the 404 document's own failed load. */
function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    if (message.text().includes('status of 404')) return;
    errors.push(message.text());
  });
  return errors;
}

for (const route of siteRoutes()) {
  test(`${route} loads with one h1 and no console errors`, async ({ page }) => {
    const errors = collectErrors(page);
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toBeVisible();
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });
}

test('unknown routes get the 404 page', async ({ page }) => {
  const errors = collectErrors(page);
  const response = await page.goto(NOT_FOUND);
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  expect(errors).toEqual([]);
});

const trimSlash = (path: string) => path.replace(/(.)\/$/, '$1');

test('the navigation reaches every page and marks the current one', async ({ page }, testInfo) => {
  const mobile = testInfo.project.name === 'mobile';
  // On narrow screens the links live in the menu sheet, so open it first.
  const mainNav = async () => {
    if (!mobile) return page.getByRole('navigation', { name: 'Main' });
    await page.getByRole('button', { name: 'Open menu' }).click();
    return page.getByRole('dialog').getByRole('navigation', { name: 'Main' });
  };

  await page.goto('/en/');
  for (const [name, path] of [
    ['Work', '/en/work'],
    ['Skills', '/en/skills'],
    ['About', '/en/about'],
    ['Contact', '/en/contact'],
    ['Home', '/en'],
  ] as const) {
    await (await mainNav()).getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL((url) => trimSlash(url.pathname) === path);
    await expect((await mainNav()).getByRole('link', { name, exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
    if (mobile) await page.keyboard.press('Escape');
  }
});

// ADR 0003: `/` picks a language; old unprefixed URLs keep working by redirecting to English.
test('the root sends a visitor to their language home', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL((url) => url.pathname === '/en/');
});

test('a stored language choice wins at the root when it has pages', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('pf-locale', 'en'));
  await page.goto('/');
  await expect(page).toHaveURL((url) => url.pathname === '/en/');
});

for (const legacy of ['/work', '/about']) {
  test(`legacy ${legacy} redirects into /en`, async ({ page }) => {
    await page.goto(legacy);
    await expect(page).toHaveURL((url) => trimSlash(url.pathname) === `/en${legacy}`);
  });
}

test('legacy case-study URLs redirect into /en', async ({ page }) => {
  const caseStudy = siteRoutes().find((route) => /^\/en\/work\/[^/]+\/$/.test(route));
  expect(caseStudy).toBeDefined();
  const legacy = caseStudy!.replace(/^\/en/, '');
  await page.goto(legacy);
  await expect(page).toHaveURL((url) => url.pathname === caseStudy);
});
