import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindTilt, MAX_TILT, pointerOffset, tiltAngles } from '@/lib/tilt';

function stubPointer({ fine = true, reducedMotion = false } = {}) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('reduce') ? reducedMotion : fine,
  }));
}

function card() {
  document.body.innerHTML = '<a data-tilt href="#">Card</a>';
  const element = document.querySelector<HTMLElement>('[data-tilt]')!;
  element.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 }) as DOMRect;
  return element;
}

const move = (element: HTMLElement, clientX: number, clientY: number) =>
  element.dispatchEvent(new MouseEvent('pointermove', { clientX, clientY }));

afterEach(() => vi.unstubAllGlobals());

describe('bindTilt', () => {
  it('leans the card toward a fine pointer and flattens it on leave', () => {
    stubPointer();
    const element = card();
    bindTilt();
    move(element, 100, 0);
    expect(element.style.getPropertyValue('--pf-tilt-x')).toBe('6.00deg');
    expect(element.style.getPropertyValue('--pf-tilt-y')).toBe('6.00deg');
    element.dispatchEvent(new MouseEvent('pointerleave'));
    expect(element.style.getPropertyValue('--pf-tilt-x')).toBe('');
  });

  it('binds each card once', () => {
    stubPointer();
    const element = card();
    const listen = vi.spyOn(element, 'addEventListener');
    bindTilt();
    bindTilt();
    expect(listen).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['reduced motion', { reducedMotion: true }],
    ['a touch screen', { fine: false }],
  ])('stays flat with %s', (_, environment) => {
    stubPointer(environment);
    const element = card();
    bindTilt();
    move(element, 100, 0);
    expect(element.style.getPropertyValue('--pf-tilt-x')).toBe('');
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
