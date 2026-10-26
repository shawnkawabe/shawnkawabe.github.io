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
