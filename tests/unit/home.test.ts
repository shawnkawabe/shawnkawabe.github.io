import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getContainerRenderer } from '@astrojs/react/container-renderer';
import { loadRenderers } from 'astro:container';
import { beforeAll, describe, expect, it } from 'vitest';
import CredentialTickets from '@/components/patterns/CredentialTickets.astro';
import CompanyList from '@/components/patterns/CompanyList.astro';
import Hero from '@/components/patterns/Hero.astro';
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
    intro: 'I build **engines** that work.',
    links: { resume: 'https://example.com/cv.pdf' },
  };

  it('renders the name as h1, the intro emphasis and both actions', async () => {
    const html = await render(Hero, { site });
    expect(html).toMatch(/<h1[^>]*><span class="sr-only">Ada Lovelace<\/span>/);
    expect(html).toMatch(/<strong[^>]*>engines<\/strong> that work\./);
    expect(html).toContain('href="/en/work"');
    expect(html).toMatch(/href="https:\/\/example\.com\/cv\.pdf" target="_blank"/);
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

describe('CredentialTickets', () => {
  const skills = [
    { id: 'platform', label: 'Salesforce Platform', group: 'development' as const },
    { id: 'sales-cloud', label: 'Sales Cloud', group: 'clouds' as const, accent: 'cloud-sales' },
  ];
  const certifications = [
    {
      id: 'admin',
      label: 'Salesforce Certified Administrator',
      skills: ['platform', 'sales-cloud', 'unknown'],
    },
  ];

  it('splits the issuer off the title and lists known skills, clouds first', async () => {
    const html = await render(CredentialTickets, { certifications, skills, credentialsUrl: '' });
    expect(html).toContain('Salesforce Certified</p>');
    expect(html).toMatch(
      /<h3[^>]*><span class="sr-only">Salesforce Certified <\/span>Administrator<\/h3>/,
    );
    expect(html.indexOf('Sales Cloud')).toBeLessThan(html.indexOf('Salesforce Platform'));
    expect(html).not.toContain('unknown');
    expect(html).toContain('--pf-c-cloud-accent: var(--pf-g-color-cloud-sales)');
    expect(html).not.toContain('<a');
  });

  it('links the whole ticket to the credentials page in a new tab', async () => {
    const html = await render(CredentialTickets, {
      certifications,
      skills,
      credentialsUrl: 'https://example.com/badges',
    });
    expect(html).toMatch(/<a href="https:\/\/example\.com\/badges" target="_blank"/);
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
