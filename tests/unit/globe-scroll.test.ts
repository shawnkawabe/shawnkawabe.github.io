import { describe, expect, it } from 'vitest';
import { awayProgress, dampToward, easeInOut, GLOBE_SCROLL_LAG } from '@/lib/globe-scroll';

describe('globe scroll hand-off (L-41)', () => {
  it('measures how far the hero has left the screen, clamped to 0..1', () => {
    expect(awayProgress(0, 800)).toBe(0);
    expect(awayProgress(-400, 800)).toBe(0.5);
    expect(awayProgress(-1600, 800)).toBe(1);
    expect(awayProgress(120, 800)).toBe(0);
    expect(awayProgress(-10, 0)).toBe(0);
  });

  it('eases toward the scroll position at the same pace whatever the frame rate', () => {
    expect(dampToward(0, 1, GLOBE_SCROLL_LAG)).toBeCloseTo(1 - Math.exp(-1));
    let fast = 0;
    for (let frame = 0; frame < 12; frame++) fast = dampToward(fast, 1, 1 / 120);
    let slow = 0;
    for (let frame = 0; frame < 6; frame++) slow = dampToward(slow, 1, 1 / 60);
    expect(fast).toBeCloseTo(slow, 10);
    expect(slow).toBeLessThan(0.2);
  });

  it('starts and ends the hand-off gently', () => {
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(0.5)).toBe(0.5);
    expect(easeInOut(1)).toBe(1);
    expect(easeInOut(0.1)).toBeLessThan(0.1);
  });
});
