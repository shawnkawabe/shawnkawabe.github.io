import { describe, expect, it } from 'vitest';
import { canRunScene, nextNodeIndex, nodeRadius, placeNodes } from '@/lib/constellation';

describe('canRunScene (SPEC §6.3)', () => {
  it('needs a desktop width, motion allowed and WebGL2', () => {
    const ok = { desktop: true, reducedMotion: false, webgl2: true };
    expect(canRunScene(ok)).toBe(true);
    expect(canRunScene({ ...ok, desktop: false })).toBe(false);
    expect(canRunScene({ ...ok, reducedMotion: true })).toBe(false);
    expect(canRunScene({ ...ok, webgl2: false })).toBe(false);
  });
});

describe('nodeRadius / placeNodes', () => {
  it('grows with the square root of the project count', () => {
    expect(nodeRadius(7, 7)).toBeCloseTo(0.8);
    expect(nodeRadius(0, 7)).toBeCloseTo(0.35);
    expect(nodeRadius(0, 0)).toBeCloseTo(0.35);
    const quarter = nodeRadius(7 / 4, 7);
    expect(quarter).toBeCloseTo(0.35 + 0.45 / 2);
  });

  it('spaces nodes evenly, starting at the top', () => {
    const placed = placeNodes([7, 4, 1, 2]);
    expect(placed[0].angle).toBeCloseTo(Math.PI / 2);
    expect(placed[1].angle - placed[2].angle).toBeCloseTo(Math.PI / 2);
    expect(placed[0].radius).toBeGreaterThan(placed[1].radius);
  });
});

describe('nextNodeIndex', () => {
  it('wraps with the arrows, jumps with Home/End and ignores other keys', () => {
    expect(nextNodeIndex(2, 'ArrowDown', 3)).toBe(0);
    expect(nextNodeIndex(0, 'ArrowRight', 3)).toBe(1);
    expect(nextNodeIndex(0, 'ArrowUp', 3)).toBe(2);
    expect(nextNodeIndex(1, 'ArrowLeft', 3)).toBe(0);
    expect(nextNodeIndex(1, 'Home', 3)).toBe(0);
    expect(nextNodeIndex(1, 'End', 3)).toBe(2);
    expect(nextNodeIndex(1, 'Enter', 3)).toBeUndefined();
  });
});
