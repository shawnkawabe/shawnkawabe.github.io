// Display strings derived from content. No dates are ever formatted (CLAUDE.md rule 3a).
import type { Experience, Project } from './schemas';

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
