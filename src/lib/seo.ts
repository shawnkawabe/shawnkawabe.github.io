// Page metadata and structured data (SPEC §4.5). Pure: layouts only render what this returns.
import en from '@/i18n/en.json';
import type { Project, Site } from './schemas';

export type SeoPage = keyof Site['seo']['pages'];

export type PageMeta = { title: string; description: string };

export type MetaSource =
  { page: 'home' } | { page: SeoPage } | { project: Pick<Project, 'title' | 'summary'> };

/** Fills `{key}` placeholders; strings stay whole so no sentence is built by concatenation. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export function pageMeta(site: Site, source: MetaSource): PageMeta {
  if ('project' in source) {
    const { title, summary } = source.project;
    return { title: format(en.titleTemplate, { title, name: site.name }), description: summary };
  }
  if (source.page === 'home') {
    return { title: site.seo.homeTitle, description: site.seo.description };
  }
  const { title, description } = site.seo.pages[source.page];
  return { title: format(en.titleTemplate, { title, name: site.name }), description };
}

/** schema.org Person for the home page; every value comes from site.json. */
export function personJsonLd(site: Site, siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    jobTitle: site.role,
    description: site.seo.description,
    url: siteUrl,
    email: `mailto:${site.links.email}`,
    sameAs: [site.links.linkedin, site.links.github],
  };
}

/** schema.org CreativeWork for a case study; no dates, as everywhere on the site. */
export function creativeWorkJsonLd(
  site: Site,
  project: Pick<Project, 'title' | 'summary' | 'client'>,
  url: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.summary,
    url,
    creator: { '@type': 'Person', name: site.name },
    sourceOrganization: { '@type': 'Organization', name: project.client },
  };
}

/** JSON for a <script> element: `<` is escaped so content can never close the tag. */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
