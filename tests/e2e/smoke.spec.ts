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

  await page.goto('/');
  for (const [name, path] of [
    ['Work', '/work'],
    ['Skills', '/skills'],
    ['About', '/about'],
    ['Contact', '/contact'],
    ['Home', '/'],
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
