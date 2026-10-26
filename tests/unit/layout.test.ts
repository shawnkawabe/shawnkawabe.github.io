import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import BaseLayout from '@/layouts/BaseLayout.astro';
import siteJson from '../../content/site.json';

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

const meta = { title: 'Work — Shawn Kawabe', description: 'Projects.' };
const render = (props: Record<string, unknown>) =>
  container.renderToString(BaseLayout, {
    props,
    request: new Request('https://shawnkawabe.github.io/work/'),
    slots: { default: '<h1>Page</h1>' },
  });

describe('BaseLayout', () => {
  it('renders title, description, canonical and absolute social image URLs', async () => {
    const html = await render({ meta });
    expect(html).toContain('<title>Work — Shawn Kawabe</title>');
    expect(html).toContain('<meta name="description" content="Projects.">');
    expect(html).toContain('<link rel="canonical" href="https://shawnkawabe.github.io/work/">');
    expect(html).toContain(
      '<meta property="og:image" content="https://shawnkawabe.github.io/og/default.png">',
    );
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
  });

  it('applies the theme before paint, in <head>', async () => {
    const html = await render({ meta });
    const head = html.slice(0, html.indexOf('</head>'));
    expect(head).toContain("localStorage.getItem('pf-theme')");
  });

  it('puts the skip link first in <body>, targeting <main>', async () => {
    const html = await render({ meta });
    const body = html.slice(html.indexOf('<body'));
    expect(body.indexOf('href="#content"')).toBeLessThan(body.indexOf('<main'));
    expect(body.indexOf('href="#content"')).toBeLessThan(body.indexOf('<h1>'));
    expect(body).toContain('<main id="content"');
  });

  it('renders JSON-LD only when given', async () => {
    expect(await render({ meta })).not.toContain('application/ld+json');
    const html = await render({ meta, jsonLd: { '@type': 'Person', name: 'Shawn' } });
    expect(html).toContain('<script type="application/ld+json">{"@type":"Person","name":"Shawn"}');
  });

  it('carries the trademark notice in the footer', async () => {
    const html = await render({ meta });
    const footer = html.slice(html.indexOf('<footer'));
    expect(footer).toContain(siteJson.trademarkNotice);
  });

  it('uses a per-page social image when provided', async () => {
    const html = await render({ meta, ogImage: '/og/work.png' });
    expect(html).toContain('content="https://shawnkawabe.github.io/og/work.png"');
  });
});
