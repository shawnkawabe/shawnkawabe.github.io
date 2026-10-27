import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getContainerRenderer } from '@astrojs/react/container-renderer';
import { loadRenderers } from 'astro:container';
import { beforeAll, describe, expect, it } from 'vitest';
import CredentialLedger from '@/components/patterns/CredentialLedger.astro';
import CompanyList from '@/components/patterns/CompanyList.astro';
import Hero from '@/components/patterns/Hero.astro';
import FeaturedIndex from '@/components/patterns/FeaturedIndex.astro';
import HeroGlobe from '@/components/patterns/HeroGlobe.astro';
import LandingSection from '@/components/patterns/LandingSection.astro';
import RoundAction from '@/components/ui/RoundAction.astro';
import SculptedShape from '@/components/ui/SculptedShape.astro';
import SkillGroups from '@/components/patterns/SkillGroups.astro';
import SplitWords from '@/components/ui/SplitWords.astro';

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
    headline: 'Engines that compute.',
    intro: 'I build **engines** that work.',
    location: 'London',
    links: { resume: 'https://example.com/cv.pdf' },
  };

  it('names Ada in the h1, outlines the last word of the claim and offers both actions', async () => {
    const html = await render(Hero, { site });
    expect(html).toMatch(/<h1[^>]*><span class="sr-only">Ada Lovelace<\/span>/);
    expect(html).toMatch(/Engines that <span class="pf-outline[^"]*">compute\.<\/span>/);
    expect(html).toMatch(/<strong[^>]*>engines<\/strong> that work\./);
    expect(html).toContain('London');
    expect(html).toContain('href="/en/work"');
    expect(html).toMatch(/href="https:\/\/example\.com\/cv\.pdf" target="_blank"/);
    expect(html).not.toContain('<aside');
  });

  it('drops the claim and the location when they are empty', async () => {
    const html = await render(Hero, { site: { ...site, headline: '', location: '' } });
    expect(html).not.toContain('pf-outline');
    expect(html).not.toContain('London');
  });
});

describe('RoundAction (L-37)', () => {
  it('is one link named by its visible label, with the circle hidden from assistive tech', async () => {
    const html = await render(RoundAction, { href: '/en/work', label: 'See my work' });
    expect(html).toMatch(/<a href="\/en\/work"[^>]*>/);
    expect(html).not.toContain('target="_blank"');
    expect(html).toMatch(/<span aria-hidden="true"[^>]*bg-accent-1/);
    expect(html).toMatch(/See my work\s*<\/span>/);
  });

  it('opens external targets in a new tab and says so', async () => {
    const html = await render(RoundAction, { href: 'https://x.dev', label: 'CV', external: true });
    expect(html).toContain('target="_blank" rel="noopener noreferrer"');
    expect(html).toContain('(opens in a new tab)');
  });
});

describe('HeroGlobe (L-35)', () => {
  const clouds = ['sales', 'service', 'experience', 'commerce', 'data', 'marketing', 'field'].map(
    (id) => ({ id: `${id}-cloud`, label: `${id} cloud` }),
  );

  it('links up to six clouds to Work filtered by the cloud, centred on the arc', async () => {
    const html = await render(HeroGlobe, { clouds });
    expect(html.match(/data-moon/g)).toHaveLength(6);
    expect(html).toContain('href="/en/work?cap=sales-cloud"');
    expect(html).not.toContain('field-cloud');
    expect(html).toContain('data-angle="205"');
    expect(html).toContain('data-angle="335"');
    expect(html).toContain('aria-label="Clouds I work in"');
    expect(html).toMatch(/<button[^>]*data-globe-toggle[^>]*hidden/);
  });

  it('keeps the poster but drops the list when no cloud has a project', async () => {
    const html = await render(HeroGlobe, { clouds: [] });
    expect(html).not.toContain('data-moon');
    expect(html).toContain('pf-globe__poster');
  });
});

describe('SplitWords', () => {
  it('reads the sentence whole and animates one hidden span per word', async () => {
    const html = await render(SplitWords, { text: ' Senior  Salesforce Developer ' });
    expect(html).toContain('<span class="sr-only"> Senior  Salesforce Developer </span>');
    expect(html).toContain('<span aria-hidden="true">');
    expect(html.match(/class="pf-word"/g)).toHaveLength(3);
    expect(html).toContain('style="--pf-word-index: 2"');
    const after = await render(SplitWords, { text: 'Next line', offset: 3 });
    expect(after).toContain('style="--pf-word-index: 3"');
    expect(after).toContain('style="--pf-word-index: 4"');
    expect(html).toMatch(
      /Senior<\/span> <span[^>]*>Salesforce<\/span> <span[^>]*>Developer<\/span><\/span>/,
    );
  });
});

describe('CredentialLedger (L-17)', () => {
  const skills = [
    { id: 'platform', label: 'Salesforce Platform', group: 'development' as const },
    { id: 'sales-cloud', label: 'Sales Cloud', group: 'clouds' as const, accent: 'cloud-sales' },
  ];
  const certifications = [
    {
      id: 'dev',
      label: 'Salesforce Certified Platform Developer I',
      domain: 'development' as const,
      skills: ['platform'],
    },
    {
      id: 'admin',
      label: 'Salesforce Certified Administrator',
      domain: 'admin' as const,
      skills: ['platform', 'sales-cloud', 'unknown'],
    },
  ];

  it('names a shared issuer once and groups rows by domain, in domain order', async () => {
    const html = await render(CredentialLedger, { certifications, skills, credentialsUrl: '' });
    expect(html.match(/>Salesforce Certified</g)).toHaveLength(1);
    expect(html).toContain('<span class="sr-only">Salesforce Certified </span>Administrator');
    expect(html.indexOf('>Development</h3>')).toBeLessThan(
      html.indexOf('>Administration and foundations</h3>'),
    );
    expect(html).not.toContain('Data and AI');
    expect(html).toContain('Sales Cloud · Salesforce Platform');
    expect(html).not.toContain('unknown');
    expect(html).not.toContain('<a');
  });

  it('keeps full labels when issuers differ and links rows when a URL is set', async () => {
    const html = await render(CredentialLedger, {
      certifications: [
        ...certifications,
        { id: 'other', label: 'Other credential', domain: 'data-ai' as const, skills: [] },
      ],
      skills,
      credentialsUrl: 'https://example.com/badges',
    });
    expect(html).toContain('Salesforce Certified Administrator');
    expect(html).not.toContain('sr-only">Salesforce Certified');
    expect(html.match(/<a href="https:\/\/example\.com\/badges" target="_blank"/g)).toHaveLength(3);
    expect(html).toContain('opens in a new tab');
  });
});

describe('SkillGroups (Skills page)', () => {
  it('gives each group a labelled row and links only skills with projects, with no counts (L-25)', async () => {
    const html = await render(SkillGroups, {
      groups: [
        {
          id: 'development',
          label: 'Development',
          skills: [
            { id: 'apex', label: 'Apex', count: 1, href: '/en/work?cap=apex' },
            { id: 'aura', label: 'Aura', count: 0 },
          ],
        },
      ],
    });
    expect(html).toContain('aria-labelledby="skills-development"');
    expect(html).toMatch(/<a href="\/en\/work\?cap=apex" class="underline">\s*Apex\s*<\/a>/);
    expect(html).toMatch(/<span class="text-on-surface-1">Aura<\/span>/);
    expect(html).not.toMatch(/\d project/);
  });
});

describe('CompanyList (About page)', () => {
  it('lists each company with its role and project links, skipping unknown ids', async () => {
    const html = await render(CompanyList, {
      experience: [
        { id: 'globant', employer: 'Globant', role: 'Developer', projectIds: ['brf', 'gone'] },
        { id: 'intern', employer: 'MyVillage', role: 'Intern', projectIds: [] },
      ],
      projects: [{ id: 'brf', title: 'BRF' }],
    });
    expect(html).toContain('Globant');
    expect(html).toMatch(/<a href="\/en\/work\/brf"[^>]*>\s*BRF/);
    expect(html).not.toContain('/en/work/gone');
    expect(html.match(/<ul/g)).toHaveLength(2);
  });
});

describe('LandingSection shapes (L-38)', () => {
  it('draws no shape by default', async () => {
    const html = await render(LandingSection, { id: 'work' });
    expect(html).not.toContain('<svg');
    expect(html).not.toContain('isolate');
  });

  it('puts a hidden shape behind the content, clipped sideways under the rail gutter, with a gradient unique to the section', async () => {
    const html = await render(LandingSection, { id: 'work', shape: 'ring' });
    expect(html).toMatch(/<section[^>]*class="[^"]*isolate/);
    expect(html).toMatch(
      /<div aria-hidden="true"[^>]*-z-10 overflow-x-clip lg:-left-30[^>]*>\s*<svg[^>]*data-shape="ring"/,
    );
    expect(html).toContain('id="work-shape"');
    expect(html).toContain('stroke="url(#work-shape)"');
    expect(html.indexOf('<svg')).toBeLessThan(html.indexOf('data-landing-content'));
  });
});

describe('SculptedShape', () => {
  it('fills the blob and strokes the line shapes, fading the far end out', async () => {
    const blob = await render(SculptedShape, { variant: 'blob', id: 'b' });
    expect(blob).toContain('fill="url(#b)"');
    expect(blob).toContain('stop-opacity: 0');
    const tube = await render(SculptedShape, { variant: 'tube', id: 't' });
    expect(tube).toContain('fill="none"');
    expect(tube).toContain('stroke="url(#t)"');
  });
});

describe('FeaturedIndex (L-40)', () => {
  it('lists each project as one numbered link, with no cover, and the subtitle only when given', async () => {
    const html = await render(FeaturedIndex, {
      projects: [
        { id: 'engine', title: 'Analytical Engine', subtitle: 'Punched-card programs' },
        { id: 'notes', title: 'Notes' },
      ],
    });
    expect(html.match(/<a /g)).toHaveLength(2);
    expect(html).toContain('/work/engine"');
    expect(html).toContain('>01<');
    expect(html).toContain('>02<');
    expect(html).toContain('Punched-card programs');
    expect(html.match(/text-3 text-on-surface-2/g)).toHaveLength(1);
    expect(html).not.toContain('<img');
  });
});
