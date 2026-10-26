// Mobile menu sheet (SPEC §4.1) on a native modal <dialog>: showModal() makes the page inert and
// closes on Esc. This adds a strict focus loop, overlay click, link activation and focus return.
import { trapFocus } from './focus-trap';

export function bindMobileNav(scope: Document = document): void {
  const dialog = scope.querySelector<HTMLDialogElement>('[data-mobile-nav]');
  const opener = scope.querySelector<HTMLButtonElement>('[data-mobile-nav-open]');
  if (!dialog || !opener) return;

  opener.addEventListener('click', () => {
    dialog.showModal();
    opener.setAttribute('aria-expanded', 'true');
    // Start on the first page link rather than the close button.
    dialog.querySelector<HTMLElement>('nav a[href]')?.focus();
  });

  dialog.addEventListener('keydown', (event) => trapFocus(dialog, event));

  dialog.addEventListener('close', () => {
    opener.setAttribute('aria-expanded', 'false');
    opener.focus();
  });

  dialog.addEventListener('click', (event) => {
    const target = event.target as Element;
    // The dialog element itself only receives clicks on its backdrop (content fills the panel).
    const onBackdrop = target === dialog;
    const onLinkOrClose = target.closest('a[href], [data-mobile-nav-close]') !== null;
    if (onBackdrop || onLinkOrClose) dialog.close();
  });

  // Returning through the back/forward cache must not show a stale open menu.
  window.addEventListener('pageshow', () => {
    if (dialog.open) dialog.close();
  });
}
