import { getContainerRenderer } from '@astrojs/react/container-renderer';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { beforeAll, describe, expect, it } from 'vitest';
import ProductIndex from '@/components/patterns/ProductIndex.astro';

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
