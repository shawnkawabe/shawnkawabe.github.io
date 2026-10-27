import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// ADR 0008 / BACKLOG-LANDING L-22: the inner pages and the parts they render carry no tilt, no
// glow or lift on hover, and no uppercase labels. Home's landing sections are out of scope.
const INNER = [
  'src/pages/[locale]/work/index.astro',
  'src/pages/[locale]/work/[id].astro',
  'src/pages/[locale]/skills.astro',
  'src/pages/[locale]/about.astro',
  'src/pages/[locale]/contact.astro',
  'src/components/patterns/CloudCard.astro',
  'src/components/patterns/CoverCard.astro',
  'src/components/patterns/ProjectCard.astro',
  'src/components/patterns/PrevNext.astro',
  'src/components/patterns/SnapshotBar.astro',
  'src/components/patterns/Gallery.astro',
  'src/components/patterns/DecisionCards.astro',
  'src/components/patterns/WorkFilters.tsx',
  'src/components/ui/Chip.astro',
];

describe('calm shell on inner pages (L-22)', () => {
  it.each(INNER)('%s has no tilt, hover glow or lift, or uppercase labels', (path) => {
    const source = readFileSync(path, 'utf8');
    expect(source).not.toMatch(/data-tilt|bindTilt/);
    expect(source).not.toMatch(/shadow-(cloud-)?glow/);
    expect(source).not.toContain('hover:-translate-y');
    expect(source).not.toMatch(/\buppercase\b/);
  });
});
