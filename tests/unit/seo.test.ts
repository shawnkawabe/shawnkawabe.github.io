import { describe, expect, it } from 'vitest';
import { siteSchema } from '@/lib/schemas';
import {
  creativeWorkJsonLd,
  DEFAULT_OG_IMAGE,
  format,
  ogImageFor,
  pageMeta,
  personJsonLd,
  serializeJsonLd,
} from '@/lib/seo';
import siteJson from '../../content/site.json';

const site = siteSchema.parse(siteJson);

describe('format', () => {
  it('fills named placeholders and leaves unknown ones untouched', () => {
    expect(format('{title} — {name} {missing}', { title: 'Work', name: 'Ada' })).toBe(
      'Work — Ada {missing}',
    );
  });
});

describe('pageMeta (SPEC §4.5)', () => {
  it('uses the home title and site description on Home', () => {
    expect(pageMeta(site, { page: 'home' })).toEqual({
      title: site.seo.homeTitle,
      description: site.seo.description,
    });
  });

  it('uses "{page title} — {name}" and the page description elsewhere', () => {
    expect(pageMeta(site, { page: 'work' })).toEqual({
      title: `${site.seo.pages.work.title} — ${site.name}`,
      description: site.seo.pages.work.description,
    });
  });

  it('uses the project title and summary on case studies', () => {
    const project = { title: 'Dealer portal', summary: 'A portal for dealers.' };
    expect(pageMeta(site, { project })).toEqual({
      title: `Dealer portal — ${site.name}`,
      description: 'A portal for dealers.',
    });
  });
});

describe('ogImageFor (SPEC §4.5)', () => {
  const generated = new Set(['/og/work.png', '/og/work/brf.png']);
  const exists = (path: string) => generated.has(path);

  it('uses the generated card for the route, with or without slashes', () => {
    expect(ogImageFor('/work/', exists)).toBe('/og/work.png');
    expect(ogImageFor('/work', exists)).toBe('/og/work.png');
    expect(ogImageFor('/work/brf/', exists)).toBe('/og/work/brf.png');
  });

  it('falls back to the default card on Home and for routes not generated yet', () => {
    expect(ogImageFor('/', exists)).toBe(DEFAULT_OG_IMAGE);
    expect(ogImageFor('/work/new-project/', exists)).toBe(DEFAULT_OG_IMAGE);
    expect(ogImageFor('/404', exists)).toBe(DEFAULT_OG_IMAGE);
  });
});

describe('personJsonLd', () => {
  it('describes Shawn from site.json only', () => {
    const person = personJsonLd(site, 'https://shawnkawabe.github.io/');
    expect(person).toMatchObject({
      '@type': 'Person',
      name: site.name,
      jobTitle: site.role,
      url: 'https://shawnkawabe.github.io/',
      email: `mailto:${site.links.email}`,
      sameAs: [site.links.linkedin, site.links.github],
    });
  });
});

describe('serializeJsonLd', () => {
  it('escapes < so content cannot close the script element', () => {
    const json = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(json).not.toContain('<');
    expect(JSON.parse(json).name).toBe('</script><script>alert(1)</script>');
  });
});

describe('creativeWorkJsonLd', () => {
  it('describes a case study with Shawn as creator and the client as organisation', () => {
    const work = creativeWorkJsonLd(
      site,
      { title: 'BRF', summary: 'Referral campaign.', client: 'BRF S.A.' },
      'https://shawnkawabe.github.io/work/brf',
    );
    expect(work).toMatchObject({
      '@type': 'CreativeWork',
      name: 'BRF',
      description: 'Referral campaign.',
      url: 'https://shawnkawabe.github.io/work/brf',
      creator: { name: site.name },
      sourceOrganization: { name: 'BRF S.A.' },
    });
    expect(JSON.stringify(work)).not.toMatch(/date/i);
  });
});
