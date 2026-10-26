// Typed getters: the only way pages, layouts and src/lib read content (ARCHITECTURE §1).
// Getters return entries in the file order of their JSON arrays; sorting lives in derive.ts.
import { getCollection } from 'astro:content';
import certificationsJson from '../../content/certifications.json';
import experienceJson from '../../content/experience.json';
import projectsJson from '../../content/projects.json';
import siteJson from '../../content/site.json';
import skillsJson from '../../content/skills.json';
import { inFileOrder } from './derive';
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
  const entries = await getCollection('projects');
  return inFileOrder(
    entries.map((entry) => entry.data),
    projectsJson,
  );
}

export async function getProject(id: string): Promise<Project | undefined> {
  return (await getProjects()).find((project) => project.id === id);
}

export async function getSkills(): Promise<Skill[]> {
  const entries = await getCollection('skills');
  return inFileOrder(
    entries.map((entry) => entry.data),
    skillsJson,
  );
}

export async function getExperience(): Promise<Experience[]> {
  const entries = await getCollection('experience');
  return inFileOrder(
    entries.map((entry) => entry.data),
    experienceJson,
  );
}

export async function getCertifications(): Promise<Certification[]> {
  const entries = await getCollection('certifications');
  return inFileOrder(
    entries.map((entry) => entry.data),
    certificationsJson,
  );
}
