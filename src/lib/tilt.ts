// 3D card tilt (DESIGN §6): `[data-tilt]` cards lean toward the pointer. The script only writes two
// CSS variables; global.css turns them into a perspective transform. Off for touch and reduced motion.
import { prefersReducedMotion } from './motion';

/** Pointer offset from the centre of a box, from −1 to 1 on each axis. */
export function pointerOffset(
  box: { left: number; top: number; width: number; height: number },
  x: number,
  y: number,
): { x: number; y: number } {
  const clamp = (value: number) => Math.max(-1, Math.min(1, value));
  return {
    x: clamp(((x - box.left) / box.width) * 2 - 1),
    y: clamp(((y - box.top) / box.height) * 2 - 1),
  };
}

/** Largest lean, in degrees: enough to read as depth, small enough to keep text steady. */
export const MAX_TILT = 6;

/** Rotation for a pointer offset: pointer right → card turns right, pointer up → top leans back. */
export function tiltAngles(offset: { x: number; y: number }, max = MAX_TILT) {
  return { rotateX: -offset.y * max, rotateY: offset.x * max };
}

export function bindTilt(root: ParentNode = document, win: Window = window): void {
  if (prefersReducedMotion(win) || !win.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    return;
  }
  for (const card of root.querySelectorAll<HTMLElement>('[data-tilt]')) {
    if ('tiltBound' in card.dataset) continue;
    card.dataset.tiltBound = '';
    card.addEventListener('pointermove', (event) => {
      const { rotateX, rotateY } = tiltAngles(
        pointerOffset(card.getBoundingClientRect(), event.clientX, event.clientY),
      );
      card.style.setProperty('--pf-tilt-x', `${rotateX.toFixed(2)}deg`);
      card.style.setProperty('--pf-tilt-y', `${rotateY.toFixed(2)}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--pf-tilt-x');
      card.style.removeProperty('--pf-tilt-y');
    });
  }
}
