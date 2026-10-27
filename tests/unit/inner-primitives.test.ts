import { getContainerRenderer } from '@astrojs/react/container-renderer';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { beforeAll, describe, expect, it } from 'vitest';
import InlineLinkList from '@/components/ui/InlineLinkList.astro';
import LedgerRow from '@/components/ui/LedgerRow.astro';
import MetaList from '@/components/ui/MetaList.astro';
import PageHeader from '@/components/ui/PageHeader.astro';
import SectionRow from '@/components/ui/SectionRow.astro';

// ADR 0008 inner-page primitives (BACKLOG-LANDING L-21).
let container: AstroContainer;

beforeAll(async () => {
  const renderers = await loadRenderers([getContainerRenderer()]);
  container = await AstroContainer.create({ renderers });
});

const render = (
  component: Parameters<AstroContainer['renderToString']>[0],
  props: Record<string, unknown>,
  slots: Record<string, string> = {},
) =>
  container.renderToString(component, {
    props,
    slots,
    request: new Request('https://shawnkawabe.github.io/en/work/'),
  });

describe('PageHeader', () => {
  it('shows the lead and the actions row only when given', async () => {
    const bare = await render(PageHeader, { title: 'Work' });
    expect(bare).toMatch(/<h1[^>]*>Work<\/h1>/);
    expect(bare).not.toContain('<p ');
    expect(bare).not.toContain('flex-wrap');

    const full = await render(
      PageHeader,
      { title: 'About', lead: 'Short bio.' },
      { actions: '<a href="/cv.pdf">Resume</a>' },
    );
    expect(full).toContain('Short bio.');
    expect(full).toMatch(/flex-wrap[^>]*><a href="\/cv.pdf">Resume<\/a>/);
  });
});

describe('SectionRow', () => {
  it('labels its section with the heading at the chosen level', async () => {
    const html = await render(
      SectionRow,
      { label: 'Approach', id: 'approach', level: 3 },
      {
        default: '<p>Body</p>',
      },
    );
    expect(html).toContain('aria-labelledby="approach"');
    expect(html).toMatch(/<h3 id="approach"[^>]*>\s*Approach\s*<\/h3>/);
    expect(html).toContain('<p>Body</p>');
  });
});

describe('LedgerRow', () => {
  it('makes the whole row one link and leaves out what is not given', async () => {
    const html = await render(LedgerRow, { href: '/en/work/a/', title: 'Portal' });
    expect(html.match(/<a /g)).toHaveLength(1);
    expect(html).toMatch(/<h3[^>]*>\s*Portal\s*<\/h3>/);
    expect(html).not.toContain('<p ');
    expect(html).not.toContain('target="_blank"');
  });

  it('shows subtitle, meta and tags as text, and marks external links', async () => {
    const html = await render(LedgerRow, {
      href: 'https://example.com',
      title: 'Credential',
      subtitle: 'Issuer',
      meta: 'Client · Employer',
      tags: ['Apex', 'LWC'],
      external: true,
    });
    expect(html).toContain('Issuer');
    expect(html).toContain('Client · Employer');
    expect(html).toContain('Apex · LWC');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('(opens in a new tab)');
  });
});

describe('MetaList', () => {
  it('drops empty facts, joins lists, and renders nothing when every fact is empty', async () => {
    const html = await render(MetaList, {
      items: [
        { label: 'Client', value: 'Volkswagen Group' },
        { label: 'Team size', value: '' },
        { label: 'Industry', value: null },
        { label: 'Clouds', value: ['Service Cloud', 'Experience Cloud'] },
      ],
    });
    expect(html.match(/<dt/g)).toHaveLength(2);
    expect(html).toContain('Service Cloud, Experience Cloud');
    expect(html).not.toContain('Team size');

    expect(
      await render(MetaList, { items: [{ label: 'Client', value: undefined }] }),
    ).not.toContain('<dl');
  });
});

describe('InlineLinkList', () => {
  it('links only items with a destination and hides the separators', async () => {
    const html = await render(InlineLinkList, {
      items: [{ label: 'Apex', href: '/en/work/?cap=apex' }, { label: 'Shell' }],
    });
    expect(html).toContain('<a href="/en/work/?cap=apex">Apex</a>');
    expect(html).toMatch(/<span class="text-on-surface-1">Shell<\/span>/);
    expect(html.match(/aria-hidden="true"/g)).toHaveLength(1);
    expect(await render(InlineLinkList, { items: [] })).not.toContain('<ul');
  });
});
