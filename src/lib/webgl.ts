// When a 3D scene may run (SPEC §6.3, CLAUDE.md rule 10): wide screens, motion allowed, WebGL2.
// Otherwise the poster stays. Pure, so the scene islands stay thin.

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
