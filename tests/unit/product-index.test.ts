import { getContainerRenderer } from '@astrojs/react/container-renderer';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { beforeAll, describe, expect, it } from 'vitest';
import ProductIndex from '@/components/patterns/ProductIndex.astro';
import ProductTicker from '@/components/patterns/ProductTicker.astro';

let container: AstroContainer;

beforeAll(async () => {
  const renderers = await loadRenderers([getContainerRenderer()]);
  container = await AstroContainer.create({ renderers });
});

const render = (items: { id: string; label: string; projectCount: number }[]) =>
  container.renderToString(ProductIndex, {
    props: { items },
    request: new Request('https://shawnkawabe.github.io/pt/'),
  });

describe('ProductIndex', () => {
  it('numbers rows and links used products to Work filtered by them', async () => {
    const html = await render([
      { id: 'grax', label: 'GRAX', projectCount: 2 },
      { id: 'fonteva', label: 'Fonteva', projectCount: 1 },
    ]);
    expect(html).toMatch(/<ol/);
    expect(html).toContain('href="/pt/work?cap=grax"');
    expect(html).toContain('href="/pt/work?cap=fonteva"');
    expect(html).toMatch(/aria-hidden="true"[^>]*>\s*01\s*</);
    expect(html).toMatch(/aria-hidden="true"[^>]*>\s*02\s*</);
    expect(html).toContain('2 projetos');
    expect(html).toContain('1 projeto');
  });

  it('renders an unused product as plain text with no count', async () => {
    const html = await render([{ id: 'aura', label: 'Aura', projectCount: 0 }]);
    expect(html).not.toContain('<a ');
    expect(html).toContain('Aura');
    expect(html).not.toMatch(/projeto/);
  });
});

describe('ProductTicker', () => {
  const items = [
    { id: 'grax', label: 'GRAX', projectCount: 2 },
    { id: 'fonteva', label: 'Fonteva', projectCount: 0 },
  ];

  it('announces and focuses only the first copy, with counts for screen readers', async () => {
    const html = await container.renderToString(ProductTicker, {
      props: { items, id: 'ticker' },
      request: new Request('https://shawnkawabe.github.io/en/'),
    });
    const links = [...html.matchAll(/<a href="\/en\/work\?cap=grax"([^>]*)>/g)];
    // Two rows × two copies; only the first is reachable by keyboard.
    expect(links).toHaveLength(4);
    expect(links.filter(([, attrs]) => !attrs.includes('tabindex="-1"'))).toHaveLength(1);
    expect(html).toContain('(2 projects)');
    expect(html.match(/aria-hidden="true"/g)!.length).toBeGreaterThan(2);
    expect(html).toMatch(/data-ticker-toggle[^>]*aria-pressed="false"/);
    expect(html).not.toMatch(/href="\/en\/work\?cap=fonteva"/);
  });
});
