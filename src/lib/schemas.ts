import { z } from 'astro/zod';

export const id = z.string().regex(/^[a-z0-9-]+$/);
export const todo = z.array(z.string()).default([]); // never rendered

export const image = z.object({
  src: z.string(),
  alt: z.string().min(5),
  caption: z.string().optional(),
  approved: z.boolean().default(false),
});

export const skillGroup = z.enum([
  'clouds',
  'development',
  'integration',
  'devops',
  'data',
  'delivery',
  'products',
  'languages-programming',
]);

export const skillSchema = z.object({
  id,
  label: z.string(),
  group: skillGroup,
  accent: z
    .string()
    .regex(/^cloud-[a-z]+$/)
    .optional(), // clouds only → var(--pf-g-color-{accent})
  aliases: z.array(z.string()).optional(),
});

const section = z.discriminatedUnion('type', [
  z.object({ type: z.literal('challenge'), body: z.string() }),
  z.object({
    type: z.literal('decisions'),
    items: z
      .array(
        z.object({
          decision: z.string(),
          why: z.string(),
          tradeoff: z.string().optional(),
        }),
      )
      .min(1)
      .max(4),
  }),
  z.object({ type: z.literal('gallery'), images: z.array(image) }),
  z.object({
    type: z.literal('outcomes'),
    items: z.array(
      z.object({
        label: z.string(),
        value: z.string().optional(),
        measured: z.boolean().default(false),
      }),
    ),
  }),
  z.object({ type: z.literal('takeaway'), body: z.string() }),
]);

export const projectSchema = z.object({
  id,
  title: z.string(),
  subtitle: z.string(),
  client: z.string(),
  employers: z.array(id).min(1), // experience ids; projects carry NO dates of their own
  role: z.string(),
  teamSize: z.string().optional(),
  industry: z.string().optional(),
  clouds: z.array(id), // may be empty: platform-wide work sits under capabilities (L-05)
  capabilities: z.array(id),
  category: z.string(),
  featured: z.boolean().default(false),
  depth: z.enum(['case-study', 'card']),
  summary: z.string().max(220),
  cover: z.object({
    preset: z.enum(['aurora', 'indigo', 'violet-edge', 'solid-blue']),
    image: image.optional(),
  }),
  sections: z.array(section).default([]),
  todo,
});

export const experienceSchema = z.object({
  // companies delivered through; NO dates
  id,
  employer: z.string(),
  role: z.string(),
  projectIds: z.array(id).default([]),
});

export const certificationSchema = z.object({
  id,
  label: z.string(),
  // Grouping on the certifications ledger (BACKLOG-LANDING L-17), in this order.
  domain: z.enum(['development', 'data-ai', 'admin']),
  skills: z.array(id), // no dates
});

const seoPage = z.object({ title: z.string(), description: z.string() });

export const siteSchema = z.object({
  name: z.string(),
  role: z.string(),
  location: z.string(),
  headline: z.string(), // one-line claim under the role (BACKLOG-LANDING L-16)
  intro: z.string(), // **term** = brighter highlight
  bio: z.array(z.string()).min(1),
  principles: z.array(z.object({ title: z.string(), body: z.string() })),
  workIntro: z.string(),
  ctaLine: z.string(),
  workFacets: z.object({ clouds: z.string(), capabilities: z.array(id) }),
  skillGroups: z.array(z.object({ id: skillGroup, label: z.string() })),
  // Home "Products and tools" (L-47): curated skill ids, in display order. Skills is the
  // capability taxonomy (by `group`); this is the showcase of named things he has worked in, so a
  // tool keeps its capability group and still appears here. Ids absent from skills.json are
  // skipped; an empty list hides the section.
  productIndex: z.array(id).default([]),
  notFound: z.object({ title: z.string(), body: z.string() }),
  languages: z.array(z.object({ label: z.string(), level: z.string() })),
  links: z.object({
    email: z.string().email(),
    linkedin: z.string().url(),
    github: z.string().url(),
    resume: z.string().url(),
    credentials: z.union([z.string().url(), z.literal('')]),
  }),
  contact: z.object({
    intro: z.string(),
    // The intro without "send a message", for builds without the form (SPEC §5.6).
    introDirect: z.string(),
    projectTypes: z.array(z.string()).min(1),
    successMessage: z.string(),
    errorMessage: z.string(),
  }),
  seo: z.object({
    homeTitle: z.string(),
    description: z.string(),
    pages: z.object({
      work: seoPage,
      skills: seoPage,
      about: seoPage,
      contact: seoPage,
      notFound: seoPage,
    }),
  }),
  trademarkNotice: z.string(),
  photo: image.nullable().default(null),
  todo,
});

export type Image = z.infer<typeof image>;
export type Skill = z.infer<typeof skillSchema>;
export type SkillGroup = z.infer<typeof skillGroup>;
export type Project = z.infer<typeof projectSchema>;
export type ProjectSection = Project['sections'][number];
export type Experience = z.infer<typeof experienceSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type Site = z.infer<typeof siteSchema>;
