// Home section indicator (BACKLOG-LANDING L-08): marks the link of the section that crosses the
// middle of the viewport with aria-current, and announces it (SECTION_EVENT) for the collapsed rail.
// One IntersectionObserver; no scroll listeners.

/** Dispatched on window when the current section changes; detail is a SectionChange. */
export const SECTION_EVENT = 'pf-sectionchange';

export type SectionChange = { id: string; number: string; label: string };

export function bindSectionIndicator(
  root: Document = document,
  win: Window & typeof globalThis = window,
): void {
  const links = new Map(
    [...root.querySelectorAll<HTMLAnchorElement>('[data-section-link]')].map((link) => [
      link.dataset.sectionLink!,
      link,
    ]),
  );
  const Observer = win.IntersectionObserver as typeof IntersectionObserver | undefined;
  if (links.size === 0 || !Observer) return;

  const mark = (id: string) => {
    links.forEach((link, key) => {
      if (key === id) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    const link = links.get(id)!;
    const detail: SectionChange = {
      id,
      number: link.dataset.sectionNumber ?? '',
      label: link.dataset.sectionLabel ?? '',
    };
    win.dispatchEvent(new CustomEvent(SECTION_EVENT, { detail }));
  };

  // A zero-height line across the middle: exactly one section intersects it at a time.
  const observer = new Observer(
    (entries) => {
      for (const entry of entries) if (entry.isIntersecting) mark(entry.target.id);
    },
    { rootMargin: '-50% 0px -50% 0px' },
  );
  for (const id of links.keys()) {
    const section = root.getElementById(id);
    if (section) observer.observe(section);
  }
}
