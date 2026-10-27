// Collapsible nav rail (BACKLOG-LANDING L-02). The first paint is handled by the inline script in
// BaseLayout, which copies the stored state onto <html data-rail>; this module flips it afterwards.
// Collapsed, the handle names where the reader is (L-09); on Home it follows the section indicator.
import { SECTION_EVENT, type SectionChange } from './section-indicator';

export type RailState = 'expanded' | 'collapsed';

export const RAIL_KEY = 'pf-rail';

export function currentRail(root: HTMLElement = document.documentElement): RailState {
  return root.dataset.rail === 'collapsed' ? 'collapsed' : 'expanded';
}

export function setRail(next: RailState, root: HTMLElement = document.documentElement): void {
  root.dataset.rail = next;
  try {
    localStorage.setItem(RAIL_KEY, next);
  } catch {
    // Storage blocked: the rail still changes for this page view.
  }
}

/**
 * Wires every `[data-rail-toggle]` button. Labels name the action and come from
 * `data-label-collapse` / `data-label-expand`, so the strings stay in en.json; collapsed, the label
 * also names the current place (`data-label-expand-current` with `{name}`, from `data-current`).
 */
export function bindRailToggles(scope: ParentNode = document): void {
  const buttons = [...scope.querySelectorAll<HTMLButtonElement>('[data-rail-toggle]')];
  const sync = () => {
    const expanded = currentRail() === 'expanded';
    buttons.forEach((button) => {
      button.setAttribute('aria-expanded', String(expanded));
      const { labelCollapse, labelExpand, labelExpandCurrent, current } = button.dataset;
      const label = expanded
        ? labelCollapse
        : current && labelExpandCurrent
          ? labelExpandCurrent.replace('{name}', current)
          : labelExpand;
      if (label) button.setAttribute('aria-label', label);
    });
  };
  buttons.forEach((button) =>
    button.addEventListener('click', () => {
      setRail(currentRail() === 'expanded' ? 'collapsed' : 'expanded');
      sync();
    }),
  );
  window.addEventListener(SECTION_EVENT, (event) => {
    const { number, label } = (event as CustomEvent<SectionChange>).detail;
    buttons.forEach((button) => {
      button.dataset.current = label;
      const section = button.querySelector<HTMLElement>('[data-rail-section]');
      if (section && section.textContent?.trim() !== number) {
        section.textContent = number;
        // Restart the swap animation in global.css for the new number.
        section.removeAttribute('data-swapped');
        void section.offsetWidth;
        section.setAttribute('data-swapped', '');
      }
    });
    sync();
  });
  sync();
}
