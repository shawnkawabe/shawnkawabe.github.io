import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getContainerRenderer } from '@astrojs/react/container-renderer';
import { loadRenderers } from 'astro:container';
import { beforeAll, describe, expect, it } from 'vitest';
import NavRail from '@/components/patterns/NavRail.astro';
import { siteSchema } from '@/lib/schemas';
import { externalLinks, isActive, pageLinks } from '@/lib/nav';
import siteJson from '../../content/en/site.json';

const site = siteSchema.parse(siteJson);

describe('isActive', () => {
  it('matches Home only on the root', () => {
    expect(isActive('/', '/')).toBe(true);
    expect(isActive('/work', '/')).toBe(false);
  });

  it('ignores the locale prefix on both sides', () => {
    expect(isActive('/pt/', '/pt/')).toBe(true);
    expect(isActive('/pt/work/brf/', '/pt/work')).toBe(true);
    expect(isActive('/pt/work/', '/pt/')).toBe(false);
  });

  it('matches a section and its sub-pages, with or without a trailing slash', () => {
    expect(isActive('/work', '/work')).toBe(true);
    expect(isActive('/work/', '/work')).toBe(true);
    expect(isActive('/work/brf', '/work')).toBe(true);
    expect(isActive('/workshop', '/work')).toBe(false);
  });
});

describe('links', () => {
  it('lists the five pages in SPEC §4.1 order, inside the locale', () => {
    expect(pageLinks('pt').map((link) => link.href)).toEqual([
      '/pt/',
      '/pt/work',
      '/pt/skills',
      '/pt/about',
      '/pt/contact',
    ]);
    expect(pageLinks('en')[1]).toMatchObject({ href: '/en/work', label: 'Work' });
  });

  it('takes external links from site.json', () => {
    expect(externalLinks(site, 'en').map((link) => link.href)).toEqual([
      site.links.linkedin,
      site.links.github,
      site.links.resume,
    ]);
    expect(externalLinks(site, 'en').every((link) => link.external)).toBe(true);
  });
});

describe('NavRail', () => {
  let container: AstroContainer;

  beforeAll(async () => {
    const renderers = await loadRenderers([getContainerRenderer()]);
    container = await AstroContainer.create({ renderers });
  });

  const render = (path: string) =>
    container.renderToString(NavRail, {
      request: new Request(`https://shawnkawabe.github.io${path}`),
    });

  it('marks the current section with aria-current, including on sub-pages', async () => {
    const html = await render('/en/work/brf/');
    const current = [...html.matchAll(/<a href="([^"]+)"[^>]*aria-current="page"/g)];
    expect(current.map(([, href]) => href)).toEqual(['/en/work']);
  });

  it('opens external links in a new tab and says so', async () => {
    const html = await render('/en/');
    expect(html).toContain(`href="${site.links.resume}"`);
    expect(html.match(/target="_blank" rel="noopener noreferrer"/g)).toHaveLength(3);
    expect(html).toContain('opens in a new tab');
  });
});
