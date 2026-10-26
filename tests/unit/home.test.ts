import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getContainerRenderer } from '@astrojs/react/container-renderer';
import { loadRenderers } from 'astro:container';
import { beforeAll, describe, expect, it } from 'vitest';
import CertificationStrip from '@/components/patterns/CertificationStrip.astro';
import Hero from '@/components/patterns/Hero.astro';
import Marquee from '@/components/patterns/Marquee.astro';

let container: AstroContainer;

beforeAll(async () => {
  const renderers = await loadRenderers([getContainerRenderer()]);
  container = await AstroContainer.create({ renderers });
});

const render = (
  component: Parameters<AstroContainer['renderToString']>[0],
  props: Record<string, unknown>,
) => container.renderToString(component, { props });

describe('Hero', () => {
  const site = {
    name: 'Ada Lovelace',
    role: 'Engineer',
    intro: 'I build **engines** that work.',
    availability: 'Open to roles',
    links: { resume: 'https://example.com/cv.pdf' },
  };

  it('renders the name as h1, the intro emphasis and both actions', async () => {
    const html = await render(Hero, { site });
    expect(html).toMatch(/<h1[^>]*>Ada Lovelace<\/h1>/);
    expect(html).toMatch(/<strong[^>]*>engines<\/strong> that work\./);
    expect(html).toContain('href="/work"');
    expect(html).toMatch(/href="https:\/\/example\.com\/cv\.pdf" target="_blank"/);
    expect(html).toContain('Open to roles');
  });

  it('leaves out the availability chip when it is empty', async () => {
    const html = await render(Hero, { site: { ...site, availability: '' } });
    expect(html).not.toContain('Open to roles');
  });
});

describe('CertificationStrip', () => {
  const certifications = [{ id: 'admin', label: 'Administrator' }];

  it('renders plain chips when there is no credentials page', async () => {
    const html = await render(CertificationStrip, { certifications, credentialsUrl: '' });
    expect(html).toContain('Administrator');
    expect(html).not.toContain('<a');
  });

  it('links every chip to the credentials page in a new tab', async () => {
    const html = await render(CertificationStrip, {
      certifications,
      credentialsUrl: 'https://example.com/badges',
    });
    expect(html).toMatch(/<a href="https:\/\/example\.com\/badges" target="_blank"/);
    expect(html).toContain('opens in a new tab');
  });
});

describe('Marquee', () => {
  it('announces the list once and controls it with a pause button', async () => {
    const html = await render(Marquee, { items: ['GRAX', 'D4Sign'], id: 'm' });
    expect(html.match(/GRAX/g)).toHaveLength(2);
    expect(html).toMatch(/<ul aria-hidden="true"/);
    expect(html).toMatch(/aria-controls="m"[^>]*aria-pressed="false"/);
  });
});
