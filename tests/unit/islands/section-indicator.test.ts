import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindSectionIndicator } from '@/lib/section-indicator';

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;

afterEach(() => {
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

describe('section indicator', () => {
  it('marks the link of the section crossing the middle of the screen', () => {
    let notify: Callback = () => {};
    const observed: Element[] = [];
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: Callback) {
          notify = callback;
        }
        observe(target: Element) {
          observed.push(target);
        }
      },
    );
    document.body.innerHTML = `
      <a data-section-link="intro" href="#intro">01</a>
      <a data-section-link="work" href="#work">02</a>
      <section id="intro"></section>
      <section id="work"></section>`;
    bindSectionIndicator();
    expect(observed.map((section) => section.id)).toEqual(['intro', 'work']);

    notify([{ isIntersecting: true, target: document.getElementById('work')! }]);
    const current = () =>
      [...document.querySelectorAll('[aria-current]')].map(
        (link) => (link as HTMLElement).dataset.sectionLink,
      );
    expect(current()).toEqual(['work']);

    notify([
      { isIntersecting: false, target: document.getElementById('work')! },
      { isIntersecting: true, target: document.getElementById('intro')! },
    ]);
    expect(current()).toEqual(['intro']);
  });

  it('leaves the links alone without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    document.body.innerHTML = '<a data-section-link="intro" href="#intro">01</a>';
    expect(() => bindSectionIndicator()).not.toThrow();
    expect(document.querySelector('[aria-current]')).toBeNull();
  });
});
