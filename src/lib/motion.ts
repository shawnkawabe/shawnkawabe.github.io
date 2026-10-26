// DESIGN §6 motion without a motion library (ADR 0005): one reduced-motion helper for every
// script, and the section reveal. CSS in global.css does the animating; this only flags elements.

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion(win: Window = window): boolean {
  return win.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** Words of a heading for the staggered hero reveal; whitespace runs collapse. */
export function splitWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

const REVEALED = 'data-revealed';

/**
 * Marks each `[data-reveal]` element revealed the first time it scrolls into view (once). Under
 * reduced motion, or without IntersectionObserver, everything is revealed at once.
 */
export function bindReveal(
  root: ParentNode = document,
  win: Window & typeof globalThis = window,
): void {
  const targets = [...root.querySelectorAll<HTMLElement>(`[data-reveal]:not([${REVEALED}])`)];
  const reveal = (element: Element) => element.setAttribute(REVEALED, '');
  const Observer = win.IntersectionObserver as typeof IntersectionObserver | undefined;
  if (prefersReducedMotion(win) || !Observer) {
    targets.forEach(reveal);
    return;
  }
  const observer = new Observer(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        reveal(entry.target);
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  targets.forEach((target) => observer.observe(target));
}
