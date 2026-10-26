// Shared by the 3D scenes (DESIGN §7): theme colours read from the token variables and re-read on
// `pf-themechange`, and a render loop that runs only while the canvas is on screen.
import { useEffect, useState, type RefObject } from 'react';
import { THEME_EVENT } from '@/lib/theme';

/** A colour token's current value, e.g. `token('accent-1')`. */
export const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(`--pf-g-color-${name}`).trim();

/** Colours computed by `read`, recomputed whenever the theme changes. */
export function useThemeColors<T>(read: () => T, deps: readonly unknown[] = []): T {
  const [colors, setColors] = useState(read);
  useEffect(() => {
    const update = () => setColors(read());
    window.addEventListener(THEME_EVENT, update);
    return () => window.removeEventListener(THEME_EVENT, update);
    // `read` closes over `deps`; the caller lists what it reads.
  }, deps);
  return colors;
}

/** Whether the element is on screen in a visible tab, so the loop can stop otherwise. */
export function useOnScreen(target: RefObject<HTMLElement | null>): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const element = target.current;
    if (!element) return;
    let inView = true;
    const update = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, [target]);
  return visible;
}
