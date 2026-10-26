import { describe, expect, it } from 'vitest';
import { fibonacciSphere, pointerOffset, turnRate } from '@/lib/data-core';
import { MAX_TILT, tiltAngles } from '@/lib/tilt';

describe('fibonacciSphere', () => {
  it('places every point on the sphere, from pole to pole', () => {
    const points = fibonacciSphere(200, 2);
    expect(points).toHaveLength(600);
    for (let index = 0; index < 200; index++) {
      const [x, y, z] = points.slice(index * 3, index * 3 + 3);
      expect(Math.hypot(x, y, z)).toBeCloseTo(2, 5);
    }
    expect(points[1]).toBeCloseTo(2);
    expect(points[points.length - 2]).toBeCloseTo(-2);
  });

  it('puts a single point on the equator', () => {
    expect([...fibonacciSphere(1, 1)]).toEqual([1, 0, 0]);
  });
});

describe('turnRate', () => {
  it('turns once per given period', () => {
    expect(turnRate(60) * 60).toBeCloseTo(2 * Math.PI);
  });
});

describe('pointerOffset', () => {
  const box = { left: 100, top: 50, width: 200, height: 100 };

  it('maps the box to −1…1 with 0 at the centre', () => {
    expect(pointerOffset(box, 200, 100)).toEqual({ x: 0, y: 0 });
    expect(pointerOffset(box, 100, 50)).toEqual({ x: -1, y: -1 });
    expect(pointerOffset(box, 300, 150)).toEqual({ x: 1, y: 1 });
  });

  it('clamps a pointer outside the box', () => {
    expect(pointerOffset(box, 1000, -500)).toEqual({ x: 1, y: -1 });
  });
});

describe('tiltAngles', () => {
  it('leans toward the pointer, at most MAX_TILT degrees', () => {
    expect(tiltAngles({ x: 1, y: -1 })).toEqual({ rotateX: MAX_TILT, rotateY: MAX_TILT });
    expect(tiltAngles({ x: -0.5, y: 0.5 }, 10)).toEqual({ rotateX: -5, rotateY: -5 });
  });
});
