import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { NOT_FOUND, revealAll, siteRoutes, THEMES, useTheme } from './routes';

// WCAG 2.2 AA plus axe best practices (CLAUDE.md rule 11), every route in both themes.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

for (const theme of THEMES) {
  for (const route of [...siteRoutes(), NOT_FOUND]) {
    test(`${route} has no axe violations (${theme})`, async ({ page }) => {
      await useTheme(page, theme);
      await page.goto(route);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await revealAll(page);
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(
        violations.map(({ id, nodes }) => `${id}: ${nodes.map((node) => node.target).join(', ')}`),
      ).toEqual([]);
    });
  }
}
