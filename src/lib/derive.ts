// Pure functions over content (ARCHITECTURE §3.2). No dates anywhere: order is curated.
import type { Certification, Project, Skill } from './schemas';
import { credentialParts } from './format';

export type SkillStat = { id: string; projectCount: number; projectIds: string[] };

export type CloudStat = SkillStat & {
  label: string;
  accent: string | undefined;
  certifications: { id: string; label: string }[];
  projects: { id: string; title: string }[];
};

export type FilterState = { clouds: string[]; caps: string[] };

type Filterable = { clouds: readonly string[]; capabilities: readonly string[] };

/**
 * Restores curated order: getCollection() returns entries sorted by id, not in file order.
 * Ids missing from `order` go last, keeping their relative order.
 */
export function inFileOrder<T extends { id: string }>(
  items: readonly T[],
  order: readonly { id: string }[],
): T[] {
  const position = new Map(order.map((entry, index) => [entry.id, index]));
  const rank = (item: T) => position.get(item.id) ?? order.length;
  return [...items].sort((a, b) => rank(a) - rank(b));
}

/** Featured first, then the file order of projects.json (Array.prototype.sort is stable). */
export function sortProjects<T extends Pick<Project, 'featured'>>(projects: readonly T[]): T[] {
  return [...projects].sort((a, b) => Number(b.featured) - Number(a.featured));
}

export function skillStats(skills: readonly Skill[], projects: readonly Project[]): SkillStat[] {
  return skills.map((skill) => {
    const projectIds = projects
      .filter((p) => p.clouds.includes(skill.id) || p.capabilities.includes(skill.id))
      .map((p) => p.id);
    return { id: skill.id, projectCount: projectIds.length, projectIds };
  });
}

/** Clouds with their projects and certifications; clouds with neither are left out. */
export function cloudStats(
  skills: readonly Skill[],
  projects: readonly Project[],
  certifications: readonly Certification[],
): CloudStat[] {
  const clouds = skills.filter((skill) => skill.group === 'clouds');
  return skillStats(clouds, projects)
    .map((stat, index) => {
      const cloud = clouds[index];
      return {
        ...stat,
        label: cloud.label,
        accent: cloud.accent,
        certifications: certifications
          .filter((cert) => cert.skills.includes(cloud.id))
          .map(({ id, label }) => ({ id, label })),
        projects: projects
          .filter((p) => stat.projectIds.includes(p.id))
          .map(({ id, title }) => ({ id, title })),
      };
    })
    .filter((cloud) => cloud.projectCount > 0 || cloud.certifications.length > 0);
}

/** Neighbours in sort order; no wrap-around at either end. */
export function prevNext<T extends Pick<Project, 'id' | 'featured'>>(
  projects: readonly T[],
  id: string,
): { prev: T | undefined; next: T | undefined } {
  const sorted = sortProjects(projects);
  const index = sorted.findIndex((p) => p.id === id);
  if (index === -1) return { prev: undefined, next: undefined };
  return { prev: sorted[index - 1], next: sorted[index + 1] };
}

/** OR within a group, AND across groups; an empty group does not filter. */
export function filterProjects<T extends Filterable>(
  projects: readonly T[],
  state: FilterState,
): T[] {
  const matches = (selected: string[], values: readonly string[]) =>
    selected.length === 0 || selected.some((id) => values.includes(id));
  return projects.filter(
    (p) => matches(state.clouds, p.clouds) && matches(state.caps, p.capabilities),
  );
}

export type BentoSize = 'feature' | 'wide' | 'base';

/**
 * SPEC §6.3: the cloud with the most projects spans 2×2, clouds with at least half as many
 * span 2×1, the rest 1×1. A tie for the top goes to the first in file order.
 */
export function withBentoSize<T extends Pick<CloudStat, 'projectCount'>>(
  clouds: readonly T[],
): (T & { size: BentoSize })[] {
  const top = Math.max(0, ...clouds.map((cloud) => cloud.projectCount));
  const featured = clouds.findIndex((cloud) => cloud.projectCount === top);
  const sizeOf = (count: number, index: number): BentoSize => {
    if (index === featured) return 'feature';
    return count > 0 && count * 2 >= top ? 'wide' : 'base';
  };
  return clouds.map((cloud, index) => ({ ...cloud, size: sizeOf(cloud.projectCount, index) }));
}

export type SkillChip = {
  id: string;
  label: string;
  count: number;
  href?: string;
  accent?: string;
};

/**
 * SPEC §5.4: groups in the order and with the labels of `site.skillGroups` (others are not shown).
 * A skill links to Work filtered by it when it has projects; empty groups are left out.
 */
export function skillGroupChips(
  groups: readonly { id: string; label: string }[],
  skills: readonly Skill[],
  projects: readonly Project[],
  workPath = '/work',
): { id: string; label: string; skills: SkillChip[] }[] {
  const counts = new Map(skillStats(skills, projects).map((stat) => [stat.id, stat.projectCount]));
  return groups
    .map((group) => {
      const param = group.id === 'clouds' ? 'cloud' : 'cap';
      const chips = skills
        .filter((skill) => skill.group === group.id)
        .map((skill): SkillChip => {
          const count = counts.get(skill.id) ?? 0;
          return {
            id: skill.id,
            label: skill.label,
            count,
            href: count > 0 ? `${workPath}?${param}=${skill.id}` : undefined,
            accent: skill.accent,
          };
        });
      return { ...group, skills: chips };
    })
    .filter((group) => group.skills.length > 0);
}

export type CredentialSkill = { id: string; label: string; accent: string | undefined };

/** A certification's skills that exist in skills.json, clouds first (they carry an accent). */
export function credentialSkills(
  certification: Pick<Certification, 'skills'>,
  skills: readonly Skill[],
): CredentialSkill[] {
  const byId = new Map(skills.map((skill) => [skill.id, skill]));
  return certification.skills
    .flatMap((id) => byId.get(id) ?? [])
    .sort((a, b) => Number(b.group === 'clouds') - Number(a.group === 'clouds'))
    .map(({ id, label, accent }) => ({ id, label, accent }));
}

/** Ledger order for certifications (BACKLOG-LANDING L-17). */
export const CREDENTIAL_DOMAINS = ['development', 'data-ai', 'admin'] as const;

/** The issuer every label shares ("Salesforce Certified"), or '' when they differ or are absent. */
export function sharedIssuer(certifications: readonly Pick<Certification, 'label'>[]): string {
  const issuers = new Set(certifications.map((c) => credentialParts(c.label).issuer));
  return issuers.size === 1 ? [...issuers][0] : '';
}

/** Certification titles in ledger order, without the shared issuer (hero fact card, L-16). */
export function credentialTitles(certifications: readonly Certification[]): string[] {
  const issuer = sharedIssuer(certifications);
  return CREDENTIAL_DOMAINS.flatMap((domain) =>
    certifications
      .filter((c) => c.domain === domain)
      .map((c) => (issuer ? credentialParts(c.label).title : c.label)),
  );
}
