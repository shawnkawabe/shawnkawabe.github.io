import { afterEach, describe, expect, it, vi } from 'vitest';
import { afterLoadIdle } from '@/lib/idle';

/** A window whose load state and idle API the test controls. */
function fakeWindow({ loaded = true, idleApi = true } = {}) {
  const listeners = new Map<string, () => void>();
  const win = {
    document: { readyState: loaded ? 'complete' : 'loading' },
    addEventListener: vi.fn((type: string, listener: () => void) => listeners.set(type, listener)),
    removeEventListener: vi.fn(),
    requestIdleCallback: idleApi ? vi.fn(() => 7) : undefined,
    cancelIdleCallback: idleApi ? vi.fn() : undefined,
    setTimeout: vi.fn(() => 9),
    clearTimeout: vi.fn(),
  };
  return { win, fire: (type: string) => listeners.get(type)?.() };
}

const asWindow = (win: object) => win as unknown as Window;

afterEach(() => vi.restoreAllMocks());

describe('afterLoadIdle', () => {
  it('asks for an idle callback at once when the page has loaded', () => {
    const { win } = fakeWindow();
    const start = vi.fn();
    afterLoadIdle(start, asWindow(win));
    expect(win.requestIdleCallback).toHaveBeenCalledWith(start, { timeout: 3000 });
  });

  it('waits for the load event first while the page is loading', () => {
    const { win, fire } = fakeWindow({ loaded: false });
    afterLoadIdle(vi.fn(), asWindow(win));
    expect(win.requestIdleCallback).not.toHaveBeenCalled();
    fire('load');
    expect(win.requestIdleCallback).toHaveBeenCalled();
  });

  it('falls back to a timer without requestIdleCallback', () => {
    const { win } = fakeWindow({ idleApi: false });
    const start = vi.fn();
    afterLoadIdle(start, asWindow(win));
    expect(win.setTimeout).toHaveBeenCalledWith(start, 1500);
  });

  it('cancels whichever schedule is pending', () => {
    const idle = fakeWindow();
    afterLoadIdle(vi.fn(), asWindow(idle.win))();
    expect(idle.win.cancelIdleCallback).toHaveBeenCalledWith(7);

    const timer = fakeWindow({ idleApi: false });
    afterLoadIdle(vi.fn(), asWindow(timer.win))();
    expect(timer.win.clearTimeout).toHaveBeenCalledWith(9);
  });

  it('only drops the load listener when cancelled before load', () => {
    const { win } = fakeWindow({ loaded: false });
    afterLoadIdle(vi.fn(), asWindow(win))();
    expect(win.removeEventListener).toHaveBeenCalledWith('load', expect.any(Function));
    expect(win.clearTimeout).not.toHaveBeenCalled();
  });

  it('uses the real window by default', () => {
    const start = vi.fn();
    vi.useFakeTimers();
    vi.stubGlobal('requestIdleCallback', undefined);
    afterLoadIdle(start)();
    vi.runAllTimers();
    expect(start).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });
});
