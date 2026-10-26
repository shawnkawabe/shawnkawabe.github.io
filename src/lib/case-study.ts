// Case study data rules (SPEC §5.3, ARCHITECTURE §3.3): which sections render, which images show.
import type { Image, Project, ProjectSection, Skill } from './schemas';

type Section<T extends ProjectSection['type']> = Extract<ProjectSection, { type: T }>;

export type CaseStudySections = {
  challenge?: Section<'challenge'>;
  architecture?: Section<'architecture'>;
  decisions?: Section<'decisions'>;
  gallery?: Section<'gallery'>;
  outcomes?: Section<'outcomes'>;
  takeaway?: Section<'takeaway'>;
};

/** `depth: "card"` projects keep only these content sections (cover, snapshot, stack, prev/next stay). */
const CARD_SECTIONS: readonly ProjectSection['type'][] = ['challenge', 'outcomes'];

/** Approved and actually published; `isAvailable` checks the file so a missing one never breaks the page. */
export function visibleImage(
  image: Image | undefined,
  isAvailable: (src: string) => boolean,
): Image | undefined {
  return image?.approved && isAvailable(image.src) ? image : undefined;
}

function withVisibleImages(
  section: ProjectSection,
  isAvailable: (src: string) => boolean,
): ProjectSection | undefined {
  switch (section.type) {
    case 'architecture': {
      const image = visibleImage(section.image, isAvailable);
      return section.body || image ? { ...section, image } : undefined;
    }
    case 'gallery': {
      const images = section.images.filter((image) => visibleImage(image, isAvailable));
      return images.length > 0 ? { ...section, images } : undefined;
    }
    case 'outcomes':
      return section.items.length > 0 ? section : undefined;
    default:
      return section;
  }
}

/** First section of each type, without empty ones; card-depth projects keep only CARD_SECTIONS. */
export function caseStudySections(
  project: Pick<Project, 'depth' | 'sections'>,
  isAvailable: (src: string) => boolean,
): CaseStudySections {
  const sections: Record<string, ProjectSection> = {};
  for (const raw of project.sections) {
    if (sections[raw.type]) continue;
    if (project.depth === 'card' && !CARD_SECTIONS.includes(raw.type)) continue;
    const section = withVisibleImages(raw, isAvailable);
    if (section) sections[section.type] = section;
  }
  return sections as CaseStudySections;
}

/** An outcome's number shows only when it was measured (CLAUDE.md rule 3). */
export function outcomeValue(outcome: { value?: string; measured: boolean }): string | undefined {
  return outcome.measured ? outcome.value : undefined;
}

export type StackLink = { id: string; label: string; href: string; accent?: string };

/** Clouds then capabilities, each linking to Work filtered by it; unknown ids are skipped. */
export function stackLinks(
  project: Pick<Project, 'clouds' | 'capabilities'>,
  skills: readonly Skill[],
): StackLink[] {
  const byId = new Map(skills.map((skill) => [skill.id, skill]));
  const link =
    (param: 'cloud' | 'cap') =>
    (id: string): StackLink[] => {
      const skill = byId.get(id);
      if (!skill) return [];
      return [{ id, label: skill.label, href: `/work?${param}=${id}`, accent: skill.accent }];
    };
  return [...project.clouds.flatMap(link('cloud')), ...project.capabilities.flatMap(link('cap'))];
}
