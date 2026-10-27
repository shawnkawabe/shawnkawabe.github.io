// Display strings derived from content. No dates are ever formatted (CLAUDE.md rule 3a).
import type { Experience, Project } from './schemas';
import { format } from './seo';

const pluralRules = new Intl.PluralRules('en');

/** "Nescara · Globant": employers in the project's order; unknown ids are skipped. */
export function employerNames(
  project: Pick<Project, 'employers'>,
  experience: readonly Experience[],
): string {
  const names = new Map(experience.map((entry) => [entry.id, entry.employer]));
  return project.employers
    .map((id) => names.get(id))
    .filter((name): name is string => name !== undefined)
    .join(' · ');
}

/** "1 project" / "7 projects": picks the CLDR plural form, then fills `{count}`. */
export function plural(forms: { one: string; other: string }, count: number): string {
  return format(pluralRules.select(count) === 'one' ? forms.one : forms.other, { count });
}

export type TextPart = { text: string; strong: boolean };

/** Splits "I build **Salesforce solutions**" into plain and emphasised parts (SPEC §5.1 hero intro). */
export function emphasisParts(text: string): TextPart[] {
  return text
    .split(/\*\*(.+?)\*\*/)
    .map((part, index) => ({ text: part, strong: index % 2 === 1 }))
    .filter((part) => part.text !== '');
}

/**
 * Splits a credential name at its issuer for the ticket layout: "Salesforce Certified
 * Administrator" → issuer "Salesforce Certified", title "Administrator". Names without
 * "Certified" stay whole as the title.
 */
export function credentialParts(label: string): { issuer: string; title: string } {
  const match = /^(.*\bCertified)\s+(.+)$/.exec(label.trim());
  return match ? { issuer: match[1], title: match[2] } : { issuer: '', title: label.trim() };
}
