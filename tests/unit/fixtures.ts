import type { Certification, Experience, Project, Skill } from '@/lib/schemas';

export const project = (fields: Partial<Project> & Pick<Project, 'id'>): Project => ({
  title: fields.id.toUpperCase(),
  subtitle: '',
  client: '',
  employers: ['acme'],
  role: '',
  clouds: ['sales-cloud'],
  capabilities: [],
  category: '',
  featured: false,
  depth: 'card',
  summary: '',
  cover: { preset: 'aurora' },
  sections: [],
  todo: [],
  ...fields,
});

export const skill = (id: string, group: Skill['group'], accent?: string): Skill => ({
  id,
  label: id.replace(/-/g, ' '),
  group,
  ...(accent ? { accent } : {}),
});

export const certification = (id: string, skills: string[]): Certification => ({
  id,
  label: `${id} label`,
  domain: 'admin',
  skills,
});

export const experience = (id: string, employer: string): Experience => ({
  id,
  employer,
  role: 'Developer',
  projectIds: [],
});
