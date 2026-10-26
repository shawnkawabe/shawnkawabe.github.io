// Typed getters: the only way pages, layouts and src/lib read content (ARCHITECTURE §1).
// Every getter takes the page's locale and reads content/{locale}/ (ADR 0003). Getters return
// entries in the file order of their JSON arrays; sorting lives in derive.ts.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection } from 'astro:content';
import enCertifications from '../../content/en/certifications.json';
import enExperience from '../../content/en/experience.json';
import enProjects from '../../content/en/projects.json';
import enSite from '../../content/en/site.json';
import enSkills from '../../content/en/skills.json';
import esCertifications from '../../content/es/certifications.json';
import esExperience from '../../content/es/experience.json';
import esProjects from '../../content/es/projects.json';
import esSite from '../../content/es/site.json';
import esSkills from '../../content/es/skills.json';
import ptCertifications from '../../content/pt/certifications.json';
import ptExperience from '../../content/pt/experience.json';
import ptProjects from '../../content/pt/projects.json';
import ptSite from '../../content/pt/site.json';
import ptSkills from '../../content/pt/skills.json';
import { inFileOrder } from './derive';
import { builtLocales, DEFAULT_LOCALE, type Locale } from './i18n';
import {
  siteSchema,
  type Certification,
  type Experience,
  type Project,
  type Site,
  type Skill,
} from './schemas';

// Raw files, for curated order (collections come back sorted by id). A template-literal collection
// name loses Astro's entry typing; every locale shares one schema, so the getters assert it.
const files = {
  site: { en: enSite, pt: ptSite, es: esSite },
  projects: { en: enProjects, pt: ptProjects, es: esProjects },
  skills: { en: enSkills, pt: ptSkills, es: esSkills },
  experience: { en: enExperience, pt: ptExperience, es: esExperience },
  certifications: { en: enCertifications, pt: ptCertifications, es: esCertifications },
};

/** Locales that get pages: reviewed ones, plus drafts in dev or with INCLUDE_DRAFT_LOCALES=true. */
export function siteLocales(): Locale[] {
  const drafts = import.meta.env.DEV || process.env.INCLUDE_DRAFT_LOCALES === 'true';
  return builtLocales(undefined, drafts);
}

const sites = new Map<Locale, Site>();

export function getSite(locale: Locale = DEFAULT_LOCALE): Site {
  let site = sites.get(locale);
  if (!site) {
    site = siteSchema.parse(files.site[locale]);
    sites.set(locale, site);
  }
  return site;
}

export async function getProjects(locale: Locale = DEFAULT_LOCALE): Promise<Project[]> {
  const entries = await getCollection(`projects-${locale}`);
  return inFileOrder(
    entries.map((entry) => entry.data as Project),
    files.projects[locale],
  );
}

export async function getProject(
  id: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<Project | undefined> {
  return (await getProjects(locale)).find((project) => project.id === id);
}

export async function getSkills(locale: Locale = DEFAULT_LOCALE): Promise<Skill[]> {
  const entries = await getCollection(`skills-${locale}`);
  return inFileOrder(
    entries.map((entry) => entry.data as Skill),
    files.skills[locale],
  );
}

export async function getExperience(locale: Locale = DEFAULT_LOCALE): Promise<Experience[]> {
  const entries = await getCollection(`experience-${locale}`);
  return inFileOrder(
    entries.map((entry) => entry.data as Experience),
    files.experience[locale],
  );
}

export async function getCertifications(locale: Locale = DEFAULT_LOCALE): Promise<Certification[]> {
  const entries = await getCollection(`certifications-${locale}`);
  return inFileOrder(
    entries.map((entry) => entry.data as Certification),
    files.certifications[locale],
  );
}

/** Whether a site-relative path like "/img/brf/01.webp" exists in public/ (images arrive in P1-08). */
export function publicFileExists(src: string): boolean {
  return existsSync(join(process.cwd(), 'public', src));
}
