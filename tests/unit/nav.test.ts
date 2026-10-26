import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getContainerRenderer } from '@astrojs/react/container-renderer';
import { loadRenderers } from 'astro:container';
import { beforeAll, describe, expect, it } from 'vitest';
import NavRail from '@/components/patterns/NavRail.astro';
import { siteSchema } from '@/lib/schemas';
import { externalLinks, isActive, pageLinks } from '@/lib/nav';
import siteJson from '../../content/site.json';

const site = siteSchema.parse(siteJson);

describe('isActive', () => {
  it('matches Home only on the root', () => {
    expect(isActive('/', '/')).toBe(true);
    expect(isActive('/work', '/')).toBe(false);
  });

  it('matches a section and its sub-pages, with or without a trailing slash', () => {
    expect(isActive('/work', '/work')).toBe(true);
    expect(isActive('/work/', '/work')).toBe(true);
    expect(isActive('/work/brf', '/work')).toBe(true);
    expect(isActive('/workshop', '/work')).toBe(false);
  });
});

describe('links', () => {
  it('lists the five pages in SPEC §4.1 order', () => {
    expect(pageLinks.map((link) => link.href)).toEqual([
      '/',
      '/work',
      '/skills',
      '/about',
      '/contact',
    ]);
  });

  it('takes external links from site.json', () => {
    expect(externalLinks(site).map((link) => link.href)).toEqual([
      site.links.linkedin,
      site.links.github,
      site.links.resume,
    ]);
    expect(externalLinks(site).every((link) => link.external)).toBe(true);
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
    const html = await render('/work/brf');
    const current = [...html.matchAll(/<a href="([^"]+)"[^>]*aria-current="page"/g)];
    expect(current.map(([, href]) => href)).toEqual(['/work']);
  });

  it('opens external links in a new tab and says so', async () => {
    const html = await render('/');
    expect(html).toContain(`href="${site.links.resume}"`);
    expect(html.match(/target="_blank" rel="noopener noreferrer"/g)).toHaveLength(3);
    expect(html).toContain('opens in a new tab');
  });
});
