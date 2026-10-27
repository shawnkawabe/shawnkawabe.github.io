import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindBackdrop } from '@/lib/backdrop';
import { SECTION_EVENT } from '@/lib/section-indicator';

const setReducedMotion = (reduce: boolean) =>
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: reduce, media: query }));

afterEach(() => {
  document.body.innerHTML = '';
  delete document.documentElement.dataset.section;
  vi.unstubAllGlobals();
});

describe('backdrop', () => {
  it('mirrors the current Home section onto <html> for the per-section tint', () => {
    setReducedMotion(false);
    document.body.innerHTML = '<div data-backdrop></div>';
    bindBackdrop();
    window.dispatchEvent(
      new CustomEvent(SECTION_EVENT, { detail: { id: 'clouds', number: '03', label: 'Clouds' } }),
    );
    expect(document.documentElement.dataset.section).toBe('clouds');
  });

  it('leaves the spotlight still under reduced motion', () => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    const move = () =>
      window.dispatchEvent(
        Object.assign(new MouseEvent('pointermove', { clientX: 120, clientY: 40 }), {
          pointerType: 'mouse',
        }),
      );

    setReducedMotion(true);
    document.body.innerHTML = '<div data-backdrop></div>';
    bindBackdrop();
    move();
    const still = document.querySelector<HTMLElement>('[data-backdrop]')!;
    expect(still.style.getPropertyValue('--pf-spot-x')).toBe('');
  });
});
