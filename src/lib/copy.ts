// Contact "Copy" buttons (SPEC §5.6, BACKLOG-LANDING L-27). A `[data-copy]` button copies its value
// to the clipboard and announces the `data-copied` label in its `[data-copy-status]` live region
// for a moment. The button sits in `[data-js-only]`, so without JavaScript it never shows.

/** How long the "Copied" confirmation stays before the live region clears. */
export const COPIED_MS = 2000;

export function bindCopy(root: ParentNode = document, clipboard = navigator.clipboard): void {
  for (const button of root.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
    const status = button.parentElement?.querySelector<HTMLElement>('[data-copy-status]');
    let timer: ReturnType<typeof setTimeout> | undefined;
    button.addEventListener('click', async () => {
      try {
        await clipboard.writeText(button.dataset.copy ?? '');
      } catch {
        return;
      }
      if (!status) return;
      status.textContent = button.dataset.copied ?? '';
      clearTimeout(timer);
      timer = setTimeout(() => (status.textContent = ''), COPIED_MS);
    });
  }
}
