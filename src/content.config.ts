import { file } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { certificationSchema, experienceSchema, projectSchema, skillSchema } from './lib/schemas';

// site.json is a single object, not a collection: src/lib/content.ts parses it with siteSchema.
export const collections = {
  projects: defineCollection({ loader: file('content/projects.json'), schema: projectSchema }),
  skills: defineCollection({ loader: file('content/skills.json'), schema: skillSchema }),
  experience: defineCollection({
    loader: file('content/experience.json'),
    schema: experienceSchema,
  }),
  certifications: defineCollection({
    loader: file('content/certifications.json'),
    schema: certificationSchema,
  }),
};
