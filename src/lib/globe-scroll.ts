// Hero globe hand-off (BACKLOG-LANDING L-41): as the hero scrolls away, the globe grows from the
// bottom centre and fades. A CSS scroll timeline followed the scroll position exactly, so every
// wheel notch jumped the globe; this eases toward it instead, so the globe glides and settles a
// moment after the scroll stops. It writes `--pf-globe-away` (0 to 1) on the globe root and
// global.css turns that into scale and opacity. Not bound under reduced motion: the globe simply
// scrolls away.

/** Seconds for the globe to cover about two thirds of the gap to the scroll position. */
export const GLOBE_SCROLL_LAG = 0.5;

/** How far the hero has scrolled out of view, from 0 (top of the page) to 1 (fully gone). */
export function awayProgress(top: number, height: number): number {
  if (height <= 0) return 0;
  return Math.min(1, Math.max(0, -top / height));
}

/** Frame-rate independent ease of `current` toward `target` over `dt` seconds. */
export function dampToward(current: number, target: number, dt: number, lag = GLOBE_SCROLL_LAG) {
  return target + (current - target) * Math.exp(-dt / lag);
}

/** Smoothstep, so the hand-off starts and ends gently instead of at full speed. */
export const easeInOut = (t: number) => t * t * (3 - 2 * t);

export function bindGlobeScroll(root: HTMLElement, section: HTMLElement, win: Window = window) {
  let current = awayProgress(section.getBoundingClientRect().top, section.offsetHeight);
  let frame = 0;
  let last = 0;
  const write = () => root.style.setProperty('--pf-globe-away', easeInOut(current).toFixed(4));

  const step = (now: number) => {
    const target = awayProgress(section.getBoundingClientRect().top, section.offsetHeight);
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
    last = now;
    current = dampToward(current, target, dt);
    if (Math.abs(target - current) < 0.0005) current = target;
    write();
    frame = current === target ? 0 : win.requestAnimationFrame(step);
    if (!frame) last = 0;
  };

  const start = () => {
    if (!frame) frame = win.requestAnimationFrame(step);
  };

  write();
  win.addEventListener('scroll', start, { passive: true });
  win.addEventListener('resize', start, { passive: true });
}
