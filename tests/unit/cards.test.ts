import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getContainerRenderer } from '@astrojs/react/container-renderer';
import { loadRenderers } from 'astro:container';
import { beforeAll, describe, expect, it } from 'vitest';
import CloudBento from '@/components/patterns/CloudBento.astro';
import CloudCard from '@/components/patterns/CloudCard.astro';
import CoverCard from '@/components/patterns/CoverCard.astro';
import ProjectCard from '@/components/patterns/ProjectCard.astro';
import type { CloudStat } from '@/lib/derive';
import { project } from './fixtures';

let container: AstroContainer;

beforeAll(async () => {
  const renderers = await loadRenderers([getContainerRenderer()]);
  container = await AstroContainer.create({ renderers });
});

const render = (
  component: Parameters<AstroContainer['renderToString']>[0],
  props: Record<string, unknown>,
) => container.renderToString(component, { props });

const count = (html: string, pattern: RegExp) => html.match(pattern)?.length ?? 0;

const cloud = (fields: Partial<CloudStat> & Pick<CloudStat, 'id'>): CloudStat => ({
  label: fields.id,
  accent: 'cloud-sales',
  projectCount: 0,
  projectIds: [],
  certifications: [],
  projects: [],
  ...fields,
});

describe('CoverCard', () => {
  const props = {
    title: 'BRF',
    subtitle: 'Referral campaign',
    href: '/work/brf',
    cover: { preset: 'aurora' },
  };

  it('is a single link with the title as a heading and the cover text hidden', async () => {
    const html = await render(CoverCard, props);
    expect(count(html, /<a /g)).toBe(1);
    expect(html).toMatch(/^<a href="\/work\/brf"/);
    expect(html).toContain('<h3');
    expect(html).toMatch(/aria-hidden="true"[^>]*>\s*BRF/);
    expect(html).toContain('pf-cover--aurora');
  });

  it('shows the cover image only when it is approved', async () => {
    const image = { src: '/img/brf.webp', alt: 'BRF referral page' };
    const approved = await render(CoverCard, {
      ...props,
      cover: { preset: 'aurora', image: { ...image, approved: true } },
    });
    expect(approved).toContain('alt="BRF referral page"');
    expect(approved).not.toContain('pf-cover--aurora');

    const pending = await render(CoverCard, {
      ...props,
      cover: { preset: 'aurora', image: { ...image, approved: false } },
    });
    expect(pending).not.toContain('<img');
  });
});

describe('ProjectCard', () => {
  const cloudLabels = { a: 'Cloud A', b: 'Cloud B', c: 'Cloud C', d: 'Cloud D', e: 'Cloud E' };

  it('links the whole card to the case study and shows client and category', async () => {
    const html = await render(ProjectCard, {
      project: project({ id: 'brf', client: 'BRF S.A.', category: 'Digital campaigns' }),
      cloudLabels,
    });
    expect(count(html, /<a /g)).toBe(1);
    expect(html).toMatch(/^<a href="\/work\/brf"/);
    expect(html).toContain('Digital campaigns');
  });

  it('shows at most three cloud chips and counts the rest', async () => {
    const many = await render(ProjectCard, {
      project: project({ id: 'p', clouds: ['a', 'b', 'c', 'd', 'e'] }),
      cloudLabels,
      level: 2,
    });
    expect(many).toContain('Cloud C');
    expect(many).not.toContain('Cloud D');
    expect(many).toContain('+2');
    expect(many).toContain('2 more clouds');
    expect(many).toContain('<h2');

    const few = await render(ProjectCard, {
      project: project({ id: 'p', clouds: ['a', 'b', 'c'] }),
      cloudLabels,
    });
    expect(few).not.toContain('more clouds');
  });
});

describe('CloudCard', () => {
  it('links to Work filtered by the cloud and pluralises the stats', async () => {
    const html = await render(CloudCard, {
      cloud: cloud({ id: 'sales-cloud', projectCount: 1 }),
    });
    expect(html).toMatch(/^<a href="\/work\?cloud=sales-cloud"/);
    expect(html).toContain('1 project<');
    expect(html).not.toContain('certification');
    expect(html).toContain('--pf-c-cloud-accent: var(--pf-g-color-cloud-sales)');
  });

  it('lists certifications and at most three projects', async () => {
    const projects = ['p1', 'p2', 'p3', 'p4'].map((id) => ({ id, title: `Title ${id}` }));
    const html = await render(CloudCard, {
      cloud: cloud({
        id: 'platform',
        projectCount: 4,
        certifications: [
          { id: 'admin', label: 'Administrator' },
          { id: 'dev', label: 'Developer' },
        ],
        projects,
      }),
    });
    expect(html).toContain('4 projects · 2 certifications');
    expect(html).toContain('Title p3');
    expect(html).not.toContain('Title p4');
  });

  it('uses Orbitron only on the 2×2 card', async () => {
    const sales = cloud({ id: 'sales-cloud', projectCount: 7 });
    expect(await render(CloudCard, { cloud: sales, size: 'feature' })).toContain('font-display');
    expect(await render(CloudCard, { cloud: sales })).not.toContain('font-display');
  });
});

describe('CloudBento', () => {
  it('spans the top cloud 2×2 and widens clouds with at least half as many projects', async () => {
    const html = await render(CloudBento, {
      clouds: [
        cloud({ id: 'service-cloud', projectCount: 4 }),
        cloud({ id: 'sales-cloud', projectCount: 7 }),
        cloud({ id: 'data-cloud', projectCount: 1 }),
      ],
    });
    expect(html).toMatch(/data-size="feature"[^>]*>\s*<a href="\/work\?cloud=sales-cloud"/);
    expect(html).toMatch(/data-size="wide"[^>]*>\s*<a href="\/work\?cloud=service-cloud"/);
    expect(count(html, /<li/g)).toBe(3);
  });
});
