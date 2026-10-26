// Typed getters: the only way pages, layouts and src/lib read content (ARCHITECTURE §1).
// Collections keep the file order of their JSON arrays; sorting lives in derive.ts.
import { getCollection } from 'astro:content';
import siteJson from '../../content/site.json';
import {
  siteSchema,
  type Certification,
  type Experience,
  type Project,
  type Site,
  type Skill,
} from './schemas';

let site: Site | undefined;

export function getSite(): Site {
  site ??= siteSchema.parse(siteJson);
  return site;
}

export async function getProjects(): Promise<Project[]> {
  return (await getCollection('projects')).map((entry) => entry.data);
}

export async function getProject(id: string): Promise<Project | undefined> {
  return (await getProjects()).find((project) => project.id === id);
}

export async function getSkills(): Promise<Skill[]> {
  return (await getCollection('skills')).map((entry) => entry.data);
}

export async function getExperience(): Promise<Experience[]> {
  return (await getCollection('experience')).map((entry) => entry.data);
}

export async function getCertifications(): Promise<Certification[]> {
  return (await getCollection('certifications')).map((entry) => entry.data);
}
