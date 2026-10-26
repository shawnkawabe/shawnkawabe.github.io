// Focus loop for native modal <dialog>s (mobile menu, lightbox).
const FOCUSABLE = 'a[href], button:not([disabled])';

/** Tab past the last control returns to the first (and back); native dialogs let it reach the browser UI. */
export function trapFocus(dialog: HTMLDialogElement, event: KeyboardEvent): void {
  if (event.key !== 'Tab') return;
  const items = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)];
  const first = items[0];
  const last = items[items.length - 1];
  const active = dialog.ownerDocument.activeElement;
  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}
