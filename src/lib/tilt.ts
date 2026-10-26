// 3D card tilt (DESIGN §6): `[data-tilt]` cards lean toward the pointer. The script only writes two
// CSS variables; global.css turns them into a perspective transform. Off for touch and reduced motion.
import { pointerOffset } from './data-core';
import { prefersReducedMotion } from './motion';

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
