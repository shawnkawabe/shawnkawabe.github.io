import { getContainerRenderer } from '@astrojs/react/container-renderer';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { beforeAll, describe, expect, it } from 'vitest';
import Chip from '@/components/ui/Chip.astro';
import Heading from '@/components/ui/Heading.astro';
import Icon from '@/components/ui/Icon.astro';
import Surface from '@/components/ui/Surface.astro';
import Text from '@/components/ui/Text.astro';

let container: AstroContainer;

beforeAll(async () => {
  const renderers = await loadRenderers([getContainerRenderer()]);
  container = await AstroContainer.create({ renderers });
});

const render = (component: Parameters<AstroContainer['renderToString']>[0], props = {}) =>
  container.renderToString(component, { props, slots: { default: 'Label' } });

describe('Chip', () => {
  it('renders a span by default and a link when href is set', async () => {
    expect(await render(Chip)).toMatch(/^<span/);
    expect(await render(Chip, { href: '/work?cloud=sales-cloud' })).toMatch(
      /^<a href="\/work\?cloud=sales-cloud"/,
    );
  });

  it('marks the selected state for styling and tests', async () => {
    const html = await render(Chip, { selected: true });
    expect(html).toContain('data-selected="true"');
    expect(html).toContain('border-accent-1');
    expect(await render(Chip)).not.toContain('data-selected');
  });

  it('adds a decorative dot in the cloud accent only when asked', async () => {
    const html = await render(Chip, { accent: 'cloud-sales' });
    expect(html).toContain('var(--pf-g-color-cloud-sales)');
    expect(html).toContain('aria-hidden="true"');
    expect(await render(Chip)).not.toContain('--pf-g-color-cloud');
  });

  it('uses uppercase mono for labels', async () => {
    expect(await render(Chip, { mono: true })).toContain('font-mono');
  });
});

describe('Heading', () => {
  it('keeps the semantic level independent of the visual size', async () => {
    const html = await render(Heading, { level: 2, size: 9 });
    expect(html).toMatch(/^<h2/);
    expect(html).toContain('text-9');
  });

  it('defaults the size from the level', async () => {
    expect(await render(Heading, { level: 1 })).toContain('text-8');
    expect(await render(Heading, { level: 4 })).toContain('text-5');
  });

  it('switches to the display face', async () => {
    expect(await render(Heading, { level: 1, display: true })).toContain('font-display');
    expect(await render(Heading, { level: 1 })).toContain('font-heading');
  });
});

describe('Icon', () => {
  it('is hidden from assistive tech when decorative', async () => {
    const html = await render(Icon, { name: 'home' });
    expect(html).toContain('<svg');
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain('role="img"');
  });

  it('is announced as an image when labelled', async () => {
    const html = await render(Icon, { name: 'contact', label: 'Email' });
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Email"');
  });

  it('uses the 1.5px stroke and the requested size', async () => {
    const html = await render(Icon, { name: 'work', size: 16 });
    expect(html).toContain('stroke-width="1.5"');
    expect(html).toContain('width="16"');
  });
});

describe('Text and Surface', () => {
  it('Text renders the requested element, size and tone', async () => {
    const html = await render(Text, { as: 'span', size: 2, tone: 3, mono: true });
    expect(html).toMatch(/^<span/);
    expect(html).toContain('text-2');
    expect(html).toContain('text-on-surface-3');
    expect(html).toContain('font-mono');
  });

  it('Surface applies level, radius, border and elevation', async () => {
    const html = await render(Surface, { as: 'article', level: 3, radius: 'lg', elevated: true });
    expect(html).toMatch(/^<article/);
    expect(html).toContain('bg-surface-3');
    expect(html).toContain('rounded-lg');
    expect(html).toContain('border-border-1');
    expect(html).toContain('shadow-1');
    expect(await render(Surface, { bordered: false })).not.toContain('border-border-1');
  });
});
