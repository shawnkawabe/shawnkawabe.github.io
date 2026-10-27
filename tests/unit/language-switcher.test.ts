import { getContainerRenderer } from '@astrojs/react/container-renderer';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { beforeAll, describe, expect, it } from 'vitest';
import LanguageSwitcher from '@/components/patterns/LanguageSwitcher.astro';

let container: AstroContainer;

beforeAll(async () => {
  const renderers = await loadRenderers([getContainerRenderer()]);
  container = await AstroContainer.create({ renderers });
});

const render = (props: Record<string, unknown>, path: string) =>
  container.renderToString(LanguageSwitcher, {
    props,
    request: new Request(`https://shawnkawabe.github.io${path}`),
  });

describe('LanguageSwitcher', () => {
  it('links to the same page in each language and marks the current one', async () => {
    const html = await render({ variant: 'sheet', locales: ['en', 'pt', 'es'] }, '/pt/work/brf/');
    const links = [...html.matchAll(/<a href="([^"]+)" hreflang="([^"]+)"/g)].map(
      ([, href, hreflang]) => [href, hreflang],
    );
    expect(links).toEqual([
      ['/en/work/brf/', 'en'],
      ['/pt/work/brf/', 'pt-BR'],
      ['/es/work/brf/', 'es-419'],
    ]);
    expect(html).toMatch(/href="\/pt\/work\/brf\/"[^>]*aria-current="true"/);
    expect(html.match(/aria-current/g)).toHaveLength(1);
    expect(html).toMatch(/>Português<span[^>]*>pt<\/span><\/a>/);
  });

  it('is a disclosure that shows the current code on the rail, named for screen readers', async () => {
    const html = await render({ variant: 'rail', locales: ['en', 'es'] }, '/es/');
    expect(html).toContain('<details data-language-menu');
    expect(html).toMatch(
      /<summary[^>]*>es<span class="sr-only"> Español, Idioma<\/span><\/summary>/,
    );
  });

  it('names the current language on the sheet', async () => {
    const html = await render({ variant: 'sheet', locales: ['en', 'pt'] }, '/en/');
    expect(html).toMatch(/<span class="sr-only">Language: <\/span>English/);
  });

  it('renders nothing while only one language is built', async () => {
    const html = await render({ variant: 'rail', locales: ['en'] }, '/en/');
    expect(html).not.toContain('<details');
  });
});
