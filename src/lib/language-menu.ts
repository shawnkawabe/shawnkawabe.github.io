// Language menu behaviour (BACKLOG-LANDING L-02). The menus are native <details>, so opening works
// without this; it adds closing on Esc or an outside click and remembers the chosen language.
import { rememberLocale } from './i18n';

export function bindLanguageMenus(scope: Document = document): void {
  const menus = [...scope.querySelectorAll<HTMLDetailsElement>('[data-language-menu]')];
  if (menus.length === 0) return;

  for (const link of scope.querySelectorAll<HTMLAnchorElement>('[data-locale-link]')) {
    link.addEventListener('click', () => rememberLocale(link.dataset.localeLink ?? ''));
  }

  scope.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const open = menus.find((menu) => menu.open);
    if (!open) return;
    // Stop here so Esc closes the menu, not the mobile sheet around it.
    event.preventDefault();
    event.stopPropagation();
    open.open = false;
    open.querySelector('summary')?.focus();
  });

  scope.addEventListener('click', (event) => {
    for (const menu of menus) {
      if (menu.open && !menu.contains(event.target as Node)) menu.open = false;
    }
  });
}
