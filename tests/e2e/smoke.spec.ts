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

test('the language switcher keeps the page and remembers the choice', async ({
  page,
}, testInfo) => {
  await page.goto('/en/work/');
  const switcher = page.locator('[data-locale-link="pt"]').first();
  test.skip((await switcher.count()) === 0, 'Only one language is built.');
  if (testInfo.project.name === 'mobile')
    await page.getByRole('button', { name: 'Open menu' }).click();
  await page.locator('[data-language-menu] summary:visible').click();
  await page.locator('[data-locale-link="pt"]:visible').click();
  await expect(page).toHaveURL((url) => url.pathname === '/pt/work/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await page.goto('/');
  await expect(page).toHaveURL((url) => url.pathname === '/pt/');
});

test('the desktop rail collapses and stays collapsed on the next page', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'The rail is desktop only.');
  await page.goto('/en/');
  const rail = page.locator('nav:has([data-rail-toggle])');
  await rail.getByRole('button', { name: 'Collapse menu' }).click();
  await expect(rail.getByRole('link', { name: 'Work' })).toBeHidden();
  await page.goto('/en/work/');
  const toggle = rail.getByRole('button', { name: 'Expand menu' });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(rail.getByRole('link', { name: 'Work' })).toBeVisible();
});

test('collapsed, the rail is a circle that follows the Home section', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'The rail is desktop only.');
  await page.goto('/en/');
  const rail = page.locator('nav:has([data-rail-toggle])');
  await rail.getByRole('button', { name: 'Collapse menu' }).click();
  // The pill folds into the circle over a transition (L-32), so wait for the shape to settle.
  await expect
    .poll(async () => {
      const box = (await rail.boundingBox())!;
      return Math.round(box.height) - Math.round(box.width);
    })
    .toBe(0);
  await page.locator('#clouds').scrollIntoViewIfNeeded();
  await expect(rail.locator('[data-rail-toggle]')).toHaveAttribute(
    'aria-label',
    /^Expand menu, current: /,
  );
  await expect(rail.locator('[data-rail-section]')).not.toHaveText('01');
  await rail.locator('[data-rail-toggle]').click();
});

test('the hero globe shows its poster and cloud links, and its toggle stops the moons', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'the arc and the live globe are desktop-only');
  await page.goto('/en/');
  const globe = page.locator('[data-hero-globe]');
  await expect(globe.locator('img.pf-globe__poster').first()).toBeAttached();
  const moons = globe.locator('[data-moon] a');
  expect(await moons.count()).toBeGreaterThan(0);
  await expect(moons.first()).toHaveAttribute('href', /\/en\/work\?cap=/);

  const webgl2 = await page.evaluate(() => !!document.createElement('canvas').getContext('webgl2'));
  test.skip(!webgl2, 'no WebGL2 in this browser');
  await expect(globe).toHaveAttribute('data-live', '', { timeout: 15_000 });
  const toggle = page.locator('[data-globe-toggle]');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  const moon = globe.locator('[data-moon]').first();
  const before = await moon.evaluate((element) => element.style.transform);
  await page.waitForTimeout(600);
  expect(await moon.evaluate((element) => element.style.transform)).toBe(before);
});
