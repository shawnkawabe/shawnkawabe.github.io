import { getContainerRenderer } from '@astrojs/react/container-renderer';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { beforeAll, describe, expect, it } from 'vitest';
import CloudPanels from '@/components/patterns/CloudPanels.astro';
import type { CloudStat } from '@/lib/derive';

let container: AstroContainer;

beforeAll(async () => {
  const renderers = await loadRenderers([getContainerRenderer()]);
  container = await AstroContainer.create({ renderers });
});

const cloud = (id: string, projects: number, certifications: string[] = []): CloudStat => ({
  id,
  label: `${id} label`,
  accent: `cloud-${id.split('-')[0]}`,
  projectCount: projects,
  projectIds: Array.from({ length: projects }, (_, index) => `${id}-p${index}`),
  projects: Array.from({ length: projects }, (_, index) => ({
    id: `${id}-p${index}`,
    title: `${id} project ${index}`,
  })),
  certifications: certifications.map((label) => ({ id: label, label })),
});

const render = (clouds: CloudStat[]) =>
  container.renderToString(CloudPanels, {
    props: { clouds },
    request: new Request('https://shawnkawabe.github.io/en/'),
  });

describe('CloudPanels', () => {
  it('opens the first panel and names every button with its cloud', async () => {
    const html = await render([cloud('sales-cloud', 2), cloud('data-cloud', 1)]);
    const states = [...html.matchAll(/aria-expanded="(true|false)"/g)].map(([, state]) => state);
    expect(states).toEqual(['true', 'false']);
    expect(html).toContain('aria-controls="cloud-panel-sales-cloud"');
    expect(html).toContain('<span class="sr-only">sales-cloud label</span>');
    expect(html).toContain('--pf-c-cloud-accent: var(--pf-g-color-cloud-sales)');
  });

  it('shows the project count and the filtered Work link, no names (L-18)', async () => {
    const html = await render([cloud('sales-cloud', 6, ['Administrator'])]);
    expect(html).toContain('6 projects');
    expect(html).toContain('href="/en/work?cloud=sales-cloud"');
    expect(html).not.toMatch(/href="\/en\/work\/sales-cloud-p\d"/);
    expect(html).not.toContain('Administrator');
    expect(html).not.toContain('certification');
  });
});
