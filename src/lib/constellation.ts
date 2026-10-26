// Clouds constellation rules (SPEC §6): when the 3D scene may run, where nodes sit, how big they
// are, and how the arrow keys move between them. Pure, so the island and the canvas stay thin.

/** SPEC §6.3: the scene replaces the bento only on wide screens, with motion allowed and WebGL2. */
export const DESKTOP_QUERY = '(min-width: 1024px)';

export function canRunScene(env: { desktop: boolean; reducedMotion: boolean; webgl2: boolean }) {
  return env.desktop && !env.reducedMotion && env.webgl2;
}

export function hasWebGL2(doc: Document = document): boolean {
  try {
    return doc.createElement('canvas').getContext('webgl2') !== null;
  } catch {
    return false;
  }
}

/** One orbit every 60 s (SPEC §6.2), in radians per second. */
export const ORBIT_SPEED = (2 * Math.PI) / 60;

const MIN_RADIUS = 0.35;
const MAX_RADIUS = 0.8;

/** Node size ∝ √projectCount; clouds with certifications only get the minimum size. */
export function nodeRadius(projectCount: number, maxCount: number): number {
  if (maxCount <= 0) return MIN_RADIUS;
  return MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * Math.sqrt(projectCount / maxCount);
}

export type NodePlacement = { angle: number; radius: number };

/** Evenly spaced on one ring, first node at the top, clockwise in content order. */
export function placeNodes(counts: readonly number[]): NodePlacement[] {
  const max = Math.max(0, ...counts);
  return counts.map((count, index) => ({
    angle: Math.PI / 2 - (2 * Math.PI * index) / counts.length,
    radius: nodeRadius(count, max),
  }));
}

/** Roving focus in the node list: arrows wrap, Home/End jump; other keys return undefined. */
export function nextNodeIndex(current: number, key: string, length: number): number | undefined {
  switch (key) {
    case 'ArrowDown':
    case 'ArrowRight':
      return (current + 1) % length;
    case 'ArrowUp':
    case 'ArrowLeft':
      return (current - 1 + length) % length;
    case 'Home':
      return 0;
    case 'End':
      return length - 1;
    default:
      return undefined;
  }
}
