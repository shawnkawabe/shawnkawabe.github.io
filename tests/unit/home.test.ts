import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getContainerRenderer } from '@astrojs/react/container-renderer';
import { loadRenderers } from 'astro:container';
import { beforeAll, describe, expect, it } from 'vitest';
import CredentialLedger from '@/components/patterns/CredentialLedger.astro';
import CompanyList from '@/components/patterns/CompanyList.astro';
import Hero from '@/components/patterns/Hero.astro';
import HeroGlobe from '@/components/patterns/HeroGlobe.astro';
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

  it('renders the name as h1, the headline, the intro emphasis and both actions', async () => {
    const html = await render(Hero, { site });
    expect(html).toMatch(/<h1[^>]*><span class="sr-only">Ada Lovelace<\/span>/);
    expect(html).toContain('Engines that compute.');
    expect(html).toMatch(/<strong[^>]*>engines<\/strong> that work\./);
    expect(html).toContain('href="/en/work"');
    expect(html).toMatch(/href="https:\/\/example\.com\/cv\.pdf" target="_blank"/);
  });

  it('lists the facts it has in the card and drops empty rows (L-16)', async () => {
    const html = await render(Hero, {
      site,
      facts: { clouds: ['Sales Cloud', 'Data Cloud'], certifications: [] },
    });
    expect(html).toContain('<aside aria-label="At a glance"');
    expect(html).toMatch(/<dt[^>]*>Clouds<\/dt>\s*<dd[^>]*>Sales Cloud, Data Cloud<\/dd>/);
    expect(html).toMatch(/<dt[^>]*>Based in<\/dt>\s*<dd[^>]*>London<\/dd>/);
    expect(html).not.toContain('>Certifications</dt>');
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
  it('links skills with projects, with a pluralised count, and leaves the rest as text', async () => {
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
    expect(html).toMatch(/<a href="\/en\/work\?cap=apex"[^>]*>[\s\S]*Apex[\s\S]*1 project</);
    expect(html).toMatch(/<span[^>]*>\s*Aura\s*<\/span>/);
    expect(html).not.toContain('0 projects');
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
