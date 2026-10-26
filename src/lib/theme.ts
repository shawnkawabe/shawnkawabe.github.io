// Theme switching (SPEC §4.2). The first paint is handled by the inline script in BaseLayout;
// this module flips the theme afterwards and keeps every toggle on the page in sync.
export type Theme = 'dark' | 'light';

export const THEME_KEY = 'pf-theme';
/** Dispatched on window after every change; 3D scenes re-read their colours on it. */
export const THEME_EVENT = 'pf-themechange';

export function currentTheme(root: HTMLElement = document.documentElement): Theme {
  return root.dataset.theme === 'light' ? 'light' : 'dark';
}

export function setTheme(next: Theme, root: HTMLElement = document.documentElement): void {
  root.dataset.theme = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // Storage blocked: the theme still applies for this page view.
  }
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: next }));
}

export function toggleTheme(root: HTMLElement = document.documentElement): Theme {
  const next: Theme = currentTheme(root) === 'light' ? 'dark' : 'light';
  setTheme(next, root);
  return next;
}

/**
 * Wires every `[data-theme-toggle]` button. Labels name the action ("Switch to light theme")
 * and come from `data-label-light` / `data-label-dark`, so the strings stay in en.json.
 */
export function bindThemeToggles(scope: ParentNode = document): void {
  const buttons = [...scope.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')];
  const relabel = () => {
    const key = currentTheme() === 'dark' ? 'labelLight' : 'labelDark';
    buttons.forEach((button) => {
      const label = button.dataset[key];
      if (label) button.setAttribute('aria-label', label);
    });
  };
  buttons.forEach((button) => button.addEventListener('click', () => toggleTheme()));
  window.addEventListener(THEME_EVENT, relabel);
  relabel();
}
