import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getContainerRenderer } from '@astrojs/react/container-renderer';
import { loadRenderers } from 'astro:container';
import { beforeAll, describe, expect, it } from 'vitest';
import DecisionCards from '@/components/patterns/DecisionCards.astro';
import Outcomes from '@/components/patterns/Outcomes.astro';
import PrevNext from '@/components/patterns/PrevNext.astro';
import SectionBand from '@/components/patterns/SectionBand.astro';
import SnapshotBar from '@/components/patterns/SnapshotBar.astro';
import { skill } from './fixtures';

let container: AstroContainer;

beforeAll(async () => {
  const renderers = await loadRenderers([getContainerRenderer()]);
  container = await AstroContainer.create({ renderers });
});

const render = (
  component: Parameters<AstroContainer['renderToString']>[0],
  props: Record<string, unknown>,
) => container.renderToString(component, { props });

describe('SnapshotBar', () => {
  const base = { client: 'BRF S.A.', role: 'Developer', clouds: ['sales-cloud'] };
  const skills = [skill('sales-cloud', 'clouds', 'cloud-sales')];

  it('lists only the facts that exist, with the clouds as chips', async () => {
    const html = await render(SnapshotBar, { project: base, deliveredVia: '', skills });
    expect(html).toContain('BRF S.A.');
    expect(html).not.toContain('Team size');
    expect(html).not.toContain('Delivered via');
    expect(html).toContain('sales cloud');

    const full = await render(SnapshotBar, {
      project: { ...base, teamSize: '6' },
      deliveredVia: 'Nescara · Globant',
      skills,
    });
    expect(full).toContain('Team size');
    expect(full).toContain('Nescara · Globant');
  });
});

describe('Outcomes', () => {
  it('shows a value only when it was measured', async () => {
    const html = await render(Outcomes, {
      items: [
        { label: 'Faster quotes', value: '−40%', measured: true },
        { label: 'Happier team', value: '99%', measured: false },
      ],
    });
    expect(html).toContain('−40%');
    expect(html).toContain('Happier team');
    expect(html).not.toContain('99%');
  });
});

describe('DecisionCards', () => {
  it('renders the trade-off only when given', async () => {
    const html = await render(DecisionCards, {
      items: [
        { decision: 'Use Flow', why: 'Admins maintain it', tradeoff: 'Less control' },
        { decision: 'Use Apex', why: 'Volume' },
      ],
    });
    expect(html.match(/Trade-off/g)).toHaveLength(1);
  });
});

describe('PrevNext', () => {
  it('links both neighbours, one at an end, none for a single project', async () => {
    const both = await render(PrevNext, {
      prev: { id: 'a', title: 'A' },
      next: { id: 'c', title: 'C' },
    });
    expect(both).toContain('href="/en/work/a"');
    expect(both).toContain('href="/en/work/c"');

    const end = await render(PrevNext, { prev: { id: 'a', title: 'A' }, next: undefined });
    expect(end).not.toContain('Next project');

    expect(await render(PrevNext, { prev: undefined, next: undefined })).not.toContain('<nav');
  });
});

describe('SectionBand', () => {
  it('clamps the tilt to ±2° and keeps the text out of the rotated layer', async () => {
    const html = await render(SectionBand, { tone: 'b', tilt: -5 });
    expect(html).toContain('--pf-c-band-tilt: -2deg');
    expect(html).toContain('bg-band-b');
    expect(html).toMatch(/aria-hidden="true"[^>]*><\/div>/);
  });
});
