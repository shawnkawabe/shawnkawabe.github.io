import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bindReveal, prefersReducedMotion, splitWords } from '@/lib/motion';

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;

function stubWindow({ reduced = false, observer = true } = {}) {
  const observed: Element[] = [];
  const unobserved: Element[] = [];
  let callback: Callback = () => {};
  const win: Record<string, unknown> = {
    matchMedia: (query: string) => ({ matches: reduced && query.includes('reduce') }),
  };
  if (observer) {
    win.IntersectionObserver = class {
      constructor(next: Callback) {
        callback = next;
      }
      observe = (element: Element) => observed.push(element);
      unobserve = (element: Element) => unobserved.push(element);
    };
  }
  return {
    win: win as unknown as Window & typeof globalThis,
    observed,
    unobserved,
    fire: (entries: Parameters<Callback>[0]) => callback(entries),
  };
}

const sections = () => [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
const revealed = () => sections().map((section) => section.hasAttribute('data-revealed'));

describe('motion', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <section data-reveal>One</section>
      <section data-reveal>Two</section>
      <section data-reveal data-revealed>Done</section>`;
  });

  it('reads the reduced-motion preference', () => {
    expect(prefersReducedMotion(stubWindow({ reduced: true }).win)).toBe(true);
    expect(prefersReducedMotion(stubWindow().win)).toBe(false);
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    expect(prefersReducedMotion()).toBe(true);
    vi.unstubAllGlobals();
  });

  it('splits words on any whitespace run', () => {
    expect(splitWords('  Senior   Salesforce\nDeveloper ')).toEqual([
      'Senior',
      'Salesforce',
      'Developer',
    ]);
    expect(splitWords('   ')).toEqual([]);
  });

  it('reveals each section once, when it enters the viewport', () => {
    const { win, observed, unobserved, fire } = stubWindow();
    bindReveal(document, win);
    const [one, two] = sections();
    expect(observed).toEqual([one, two]);
    expect(revealed()).toEqual([false, false, true]);

    fire([
      { target: one, isIntersecting: true },
      { target: two, isIntersecting: false },
    ]);
    expect(revealed()).toEqual([true, false, true]);
    expect(unobserved).toEqual([one]);
  });

  it.each([
    ['reduced motion', { reduced: true }],
    ['no IntersectionObserver', { observer: false }],
  ])('reveals everything at once with %s', (_, env) => {
    const { win, observed } = stubWindow(env);
    bindReveal(document, win);
    expect(revealed()).toEqual([true, true, true]);
    expect(observed).toEqual([]);
  });
});
