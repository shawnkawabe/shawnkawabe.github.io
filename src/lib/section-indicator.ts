// Home section indicator (BACKLOG-LANDING L-08): marks the link of the section that crosses the
// middle of the viewport with aria-current. One IntersectionObserver; no scroll listeners.

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

  const mark = (id: string) =>
    links.forEach((link, key) => {
      if (key === id) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });

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
