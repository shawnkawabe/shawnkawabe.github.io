// Defers optional work (the hero data core, SPEC §5.1) until the page has loaded and the main
// thread is idle, so it never competes with the LCP element.

/** Calls `start` once the page has loaded and gone idle; returns a cancel function. */
export function afterLoadIdle(start: () => void, win: Window = window): () => void {
  let handle: number | undefined;
  const schedule = () => {
    handle = win.requestIdleCallback
      ? win.requestIdleCallback(start, { timeout: 3000 })
      : win.setTimeout(start, 1500);
  };
  if (win.document.readyState === 'complete') schedule();
  else win.addEventListener('load', schedule, { once: true });
  return () => {
    win.removeEventListener('load', schedule);
    if (handle === undefined) return;
    if (win.cancelIdleCallback) win.cancelIdleCallback(handle);
    else win.clearTimeout(handle);
  };
}
