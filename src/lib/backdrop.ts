// Site background (BACKLOG-LANDING L-12). Moves the spotlight with the pointer (one rAF per frame,
// fine pointers only, never under reduced motion) and mirrors the current Home section onto
// <html data-section> so global.css can shift the tint and grid pitch per section.
import { prefersReducedMotion } from './motion';
import { SECTION_EVENT, type SectionChange } from './section-indicator';

export function bindBackdrop(
  root: Document = document,
  win: Window & typeof globalThis = window,
): void {
  const backdrop = root.querySelector<HTMLElement>('[data-backdrop]');
  if (!backdrop) return;

  win.addEventListener(SECTION_EVENT, (event) => {
    root.documentElement.dataset.section = (event as CustomEvent<SectionChange>).detail.id;
  });

  if (prefersReducedMotion(win)) return;
  let frame = 0;
  let x = 0;
  let y = 0;
  win.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    x = event.clientX;
    y = event.clientY;
    if (frame) return;
    frame = win.requestAnimationFrame(() => {
      frame = 0;
      backdrop.style.setProperty('--pf-spot-x', `${x}px`);
      backdrop.style.setProperty('--pf-spot-y', `${y}px`);
    });
  });
}
