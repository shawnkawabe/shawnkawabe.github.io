import { describe, expect, it } from 'vitest';
import {
  assembleProgress,
  blendPoints,
  fibonacciSphere,
  hash01,
  packetTrip,
  pointerOffset,
  scanRing,
  scatterOutward,
  scrollDepth,
  turnRate,
} from '@/lib/data-core';
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

describe('hash01', () => {
  it('is repeatable and stays within 0…1', () => {
    for (let index = 0; index < 500; index++) {
      expect(hash01(index)).toBe(hash01(index));
      expect(hash01(index)).toBeGreaterThanOrEqual(0);
      expect(hash01(index)).toBeLessThan(1);
    }
  });
});

describe('assembly', () => {
  it('eases from 0 to 1 over the duration and then holds', () => {
    expect(assembleProgress(-1, 2)).toBe(0);
    expect(assembleProgress(1, 2)).toBeGreaterThan(0.5);
    expect(assembleProgress(2, 2)).toBe(1);
    expect(assembleProgress(9, 2)).toBe(1);
  });

  it('starts every point further out along its own direction, then lands on its target', () => {
    const target = fibonacciSphere(50, 2);
    const start = scatterOutward(target);
    for (let index = 0; index < 50; index++) {
      const [x, y, z] = target.slice(index * 3, index * 3 + 3);
      const [sx, sy, sz] = start.slice(index * 3, index * 3 + 3);
      const push = Math.hypot(sx, sy, sz) / Math.hypot(x, y, z);
      expect(push).toBeGreaterThanOrEqual(1.6);
      expect(push).toBeLessThanOrEqual(3.2);
      expect(sx * y).toBeCloseTo(sy * x, 5);
      expect(sz * y).toBeCloseTo(sy * z, 5);
    }
    const out = new Float32Array(target.length);
    expect([...blendPoints(start, target, 0, out)]).toEqual([...start]);
    expect([...blendPoints(start, target, 1, out)]).toEqual([...target]);
  });
});

describe('packetTrip', () => {
  it('staggers packets and starts each new trip from another point', () => {
    const first = packetTrip(0, 4, 0, 2);
    expect(first).toMatchObject({ cycle: 0, progress: 0 });
    expect(packetTrip(2, 4, 0, 2).progress).toBeCloseTo(0.5);
    const later = packetTrip(0, 4, 2.5, 2);
    expect(later.cycle).toBe(1);
    expect(later.progress).toBeCloseTo(0.25);
    expect(later.origin).not.toBe(first.origin);
  });
});

describe('scanRing', () => {
  it('stays on the sphere and sweeps between the poles without reaching them', () => {
    for (let time = 0; time < 14; time += 0.7) {
      const ring = scanRing(time, 14, 2);
      expect(Math.hypot(ring.y, ring.radius)).toBeCloseTo(2, 5);
      expect(Math.abs(ring.y)).toBeLessThanOrEqual(1.8 + 1e-9);
    }
    expect(scanRing(0, 14, 2)).toEqual({ y: 0, radius: 2 });
    expect(scanRing(3.5, 14, 2).y).toBeCloseTo(1.8);
  });
});

describe('scrollDepth', () => {
  it('runs from 0 at the top to 1 after one screen', () => {
    expect(scrollDepth(0, 800)).toBe(0);
    expect(scrollDepth(400, 800)).toBe(0.5);
    expect(scrollDepth(5000, 800)).toBe(1);
    expect(scrollDepth(-20, 800)).toBe(0);
  });
});
