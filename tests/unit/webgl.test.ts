import { describe, expect, it } from 'vitest';
import { canRunScene, hasWebGL2 } from '@/lib/webgl';

describe('canRunScene (SPEC §6.3)', () => {
  it('needs a desktop width, motion allowed and WebGL2', () => {
    const ok = { desktop: true, reducedMotion: false, webgl2: true };
    expect(canRunScene(ok)).toBe(true);
    expect(canRunScene({ ...ok, desktop: false })).toBe(false);
    expect(canRunScene({ ...ok, reducedMotion: true })).toBe(false);
    expect(canRunScene({ ...ok, webgl2: false })).toBe(false);
  });
});

describe('hasWebGL2', () => {
  it('reports the context and survives a throwing canvas', () => {
    const doc = (getContext: () => unknown) =>
      ({ createElement: () => ({ getContext }) }) as unknown as Document;
    expect(hasWebGL2(doc(() => ({})))).toBe(true);
    expect(hasWebGL2(doc(() => null))).toBe(false);
    expect(
      hasWebGL2(
        doc(() => {
          throw new Error('blocked');
        }),
      ),
    ).toBe(false);
  });
});
