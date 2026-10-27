import { getContainerRenderer } from '@astrojs/react/container-renderer';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { beforeAll, describe, expect, it } from 'vitest';
import BaseLayout from '@/layouts/BaseLayout.astro';
import siteJson from '../../content/en/site.json';

let container: AstroContainer;

beforeAll(async () => {
  // The layout renders the nav islands, so it needs the React renderer.
  const renderers = await loadRenderers([getContainerRenderer()]);
  container = await AstroContainer.create({ renderers });
});

const meta = { title: 'Work | Shawn Kawabe', description: 'Projects.' };
/** Attribute values come out HTML-escaped (the role contains `&`). */
const attr = (value: string) => value.replaceAll('&', '&amp;');
const render = (props: Record<string, unknown>, path = '/work/') =>
  container.renderToString(BaseLayout, {
    props,
    request: new Request(`https://shawnkawabe.github.io${path}`),
    slots: { default: '<h1>Page</h1>' },
  });

describe('BaseLayout', () => {
  it('renders title, description, canonical and absolute social image URLs', async () => {
    const html = await render({ meta });
    expect(html).toContain('<title>Work | Shawn Kawabe</title>');
    expect(html).toContain('<meta name="description" content="Projects.">');
    expect(html).toContain('<link rel="canonical" href="https://shawnkawabe.github.io/work/">');
    expect(html).toContain(
      '<meta property="og:image" content="https://shawnkawabe.github.io/og/work.png">',
    );
    expect(html).toContain(
      `<meta property="og:image:alt" content="${attr(`Work | Shawn Kawabe, ${siteJson.role}`)}">`,
    );
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
  });

  it('marks a noindex page (404) for robots and drops its canonical link', async () => {
    const html = await render({ meta, noindex: true });
    expect(html).toContain('<meta name="robots" content="noindex">');
    expect(html).not.toContain('rel="canonical"');
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

  it('falls back to the default card for routes without a generated one', async () => {
    const html = await render({ meta }, '/work/not-generated-yet/');
    expect(html).toContain(
      '<meta property="og:image" content="https://shawnkawabe.github.io/og/default.png">',
    );
    expect(html).toContain(
      `<meta property="og:image:alt" content="${attr(`${siteJson.name}, ${siteJson.role}`)}">`,
    );
  });

  it('uses an explicit social image when provided', async () => {
    const html = await render({ meta, ogImage: '/og/skills.png' });
    expect(html).toContain('content="https://shawnkawabe.github.io/og/skills.png"');
  });
});
