// Home cloud panels (BACKLOG-LANDING L-05). One panel open at a time. On desktop a panel also opens
// when a fine pointer rests on it. Below lg the open panel can be closed again, like any
// accordion. CSS does the drawing; this only sets state.
import { DESKTOP_QUERY } from './webgl';

/** How long a fine pointer rests on a panel before it opens, so passing over does nothing. */
export const HOVER_OPEN_MS = 120;

export function bindCloudPanels(
  root: ParentNode = document,
  win: Window & typeof globalThis = window,
): void {
  for (const group of root.querySelectorAll<HTMLElement>('[data-cloud-panels]')) {
    const panels = [...group.querySelectorAll<HTMLElement>('[data-cloud-panel]')];
    const toggleOf = (panel: HTMLElement) =>
      panel.querySelector<HTMLButtonElement>('[data-cloud-toggle]')!;
    // From here the CSS may hide closed panels' details (see global.css).
    group.dataset.enhanced = '';

    const open = (target: HTMLElement | undefined) => {
      for (const panel of panels) {
        const isOpen = panel === target;
        panel.toggleAttribute('data-open', isOpen);
        toggleOf(panel).setAttribute('aria-expanded', String(isOpen));
      }
    };

    let timer: ReturnType<typeof setTimeout> | undefined;
    for (const panel of panels) {
      toggleOf(panel).addEventListener('click', () => {
        const desktop = win.matchMedia(DESKTOP_QUERY).matches;
        // On desktop one panel always stays open; the accordion below lg may close fully.
        open(panel.hasAttribute('data-open') && !desktop ? undefined : panel);
      });
      panel.addEventListener('pointerenter', (event) => {
        if (event.pointerType !== 'mouse' || !win.matchMedia(DESKTOP_QUERY).matches) return;
        timer = setTimeout(() => open(panel), HOVER_OPEN_MS);
      });
      panel.addEventListener('pointerleave', () => clearTimeout(timer));
    }
  }
}
