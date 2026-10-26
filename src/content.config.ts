import { file } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { certificationSchema, experienceSchema, projectSchema, skillSchema } from './lib/schemas';

// One collection per content type and locale (ADR 0003): content/{locale}/{type}.json.
// site.json is a single object, not a collection: src/lib/content.ts parses it with siteSchema.
const localized = <T extends Parameters<typeof defineCollection>[0]['schema']>(
  type: string,
  schema: T,
) => ({
  en: defineCollection({ loader: file(`content/en/${type}.json`), schema }),
  pt: defineCollection({ loader: file(`content/pt/${type}.json`), schema }),
  es: defineCollection({ loader: file(`content/es/${type}.json`), schema }),
});

const projects = localized('projects', projectSchema);
const skills = localized('skills', skillSchema);
const experience = localized('experience', experienceSchema);
const certifications = localized('certifications', certificationSchema);

export const collections = {
  'projects-en': projects.en,
  'projects-pt': projects.pt,
  'projects-es': projects.es,
  'skills-en': skills.en,
  'skills-pt': skills.pt,
  'skills-es': skills.es,
  'experience-en': experience.en,
  'experience-pt': experience.pt,
  'experience-es': experience.es,
  'certifications-en': certifications.en,
  'certifications-pt': certifications.pt,
  'certifications-es': certifications.es,
};
