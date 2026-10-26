// Content integrity (ARCHITECTURE §3.1): every file parses with its schema, and ids that
// point across files resolve. `astro sync` validates the collections; this also covers site.json.
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { z } from 'astro/zod';
import {
  certificationSchema,
  experienceSchema,
  projectSchema,
  siteSchema,
  skillSchema,
} from '@/lib/schemas';

const read = (name: string): unknown =>
  JSON.parse(readFileSync(new URL(`../../content/en/${name}.json`, import.meta.url), 'utf8'));

const site = siteSchema.parse(read('site'));
const projects = z.array(projectSchema).parse(read('projects'));
const skills = z.array(skillSchema).parse(read('skills'));
const experience = z.array(experienceSchema).parse(read('experience'));
const certifications = z.array(certificationSchema).parse(read('certifications'));

const skillById = new Map(skills.map((skill) => [skill.id, skill]));
const experienceById = new Map(experience.map((entry) => [entry.id, entry]));
const projectIds = new Set(projects.map((project) => project.id));

const duplicates = (ids: string[]) => ids.filter((id, index) => ids.indexOf(id) !== index);

describe('content files', () => {
  it.each([
    ['projects', projects],
    ['skills', skills],
    ['experience', experience],
    ['certifications', certifications],
  ])('%s ids are unique', (_, entries) => {
    expect(duplicates(entries.map((entry) => entry.id))).toEqual([]);
  });

  it('features at most 4 projects', () => {
    expect(projects.filter((project) => project.featured).length).toBeLessThanOrEqual(4);
  });
});

describe('cross-file references', () => {
  it('every project cloud and capability exists in skills.json', () => {
    const missing = projects.flatMap((project) =>
      [...project.clouds, ...project.capabilities]
        .filter((id) => !skillById.has(id))
        .map((id) => `${project.id} → ${id}`),
    );
    expect(missing).toEqual([]);
  });

  it('every project cloud is a skill in the "clouds" group', () => {
    const wrongGroup = projects.flatMap((project) =>
      project.clouds
        .filter((id) => skillById.get(id)?.group !== 'clouds')
        .map((id) => `${project.id} → ${id}`),
    );
    expect(wrongGroup).toEqual([]);
  });

  it('every project employer exists and lists the project back', () => {
    const broken = projects.flatMap((project) =>
      project.employers
        .filter((employer) => !experienceById.get(employer)?.projectIds.includes(project.id))
        .map((employer) => `${project.id} → ${employer}`),
    );
    expect(broken).toEqual([]);
  });

  it('every experience projectId exists and names that experience as employer', () => {
    const broken = experience.flatMap((entry) =>
      entry.projectIds
        .filter(
          (id) =>
            !projectIds.has(id) ||
            !projects.find((project) => project.id === id)?.employers.includes(entry.id),
        )
        .map((id) => `${entry.id} → ${id}`),
    );
    expect(broken).toEqual([]);
  });

  it('every certification skill exists in skills.json', () => {
    const missing = certifications.flatMap((cert) =>
      cert.skills.filter((id) => !skillById.has(id)).map((id) => `${cert.id} → ${id}`),
    );
    expect(missing).toEqual([]);
  });

  it('every site.workFacets capability exists in skills.json', () => {
    expect(site.workFacets.capabilities.filter((id) => !skillById.has(id))).toEqual([]);
  });

  it('every site.skillGroups id is used by at least one skill', () => {
    const used = new Set(skills.map((skill) => skill.group));
    expect(site.skillGroups.map((group) => group.id).filter((id) => !used.has(id))).toEqual([]);
  });
});

/** Every `src` anywhere in a JSON value (gallery images, covers, architecture diagrams). */
function sources(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(sources);
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) =>
    key === 'src' && typeof child === 'string' ? [child] : sources(child),
  );
}

describe('images (P1-08)', () => {
  it.each(['en', 'pt', 'es'])(
    'every image src in content/%s/projects.json exists in public/',
    (locale) => {
      const file = new URL(`../../content/${locale}/projects.json`, import.meta.url);
      const missing = sources(JSON.parse(readFileSync(file, 'utf8'))).filter(
        (src) => !existsSync(new URL(`../../public${src}`, import.meta.url)),
      );
      expect(missing).toEqual([]);
    },
  );
});
