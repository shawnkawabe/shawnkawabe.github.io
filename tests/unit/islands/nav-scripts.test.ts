import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bindMobileNav } from '@/lib/mobile-nav';
import { bindThemeToggles, currentTheme, THEME_EVENT, THEME_KEY, toggleTheme } from '@/lib/theme';

beforeEach(() => {
  document.documentElement.dataset.theme = 'dark';
  localStorage.clear();
});

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('theme', () => {
  it('toggles data-theme, stores the choice and announces it', () => {
    const listener = vi.fn();
    window.addEventListener(THEME_EVENT, listener);
    expect(toggleTheme()).toBe('light');
    expect(currentTheme()).toBe('light');
    expect(localStorage.getItem(THEME_KEY)).toBe('light');
    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener(THEME_EVENT, listener);
  });

  it('still switches when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    toggleTheme();
    expect(currentTheme()).toBe('light');
  });

  it('labels every toggle with the action and keeps them in sync', () => {
    document.body.innerHTML = [1, 2]
      .map(
        () =>
          '<button data-theme-toggle data-label-light="To light" data-label-dark="To dark"></button>',
      )
      .join('');
    bindThemeToggles();
    const [first, second] = document.querySelectorAll('button');
    expect(first.getAttribute('aria-label')).toBe('To light');

    first.click();
    expect(currentTheme()).toBe('light');
    expect(second.getAttribute('aria-label')).toBe('To dark');
  });
});

describe('mobile nav', () => {
  // jsdom has no <dialog> API: model the parts the script relies on.
  beforeEach(() => {
    const proto = HTMLDialogElement.prototype as HTMLDialogElement & Record<string, unknown>;
    proto.showModal = function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
    proto.close = function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    };
    document.body.innerHTML = `
      <button data-mobile-nav-open aria-expanded="false">Menu</button>
      <dialog data-mobile-nav>
        <div class="panel">
          <button data-mobile-nav-close><svg></svg></button>
          <nav><a href="/">Home</a><a href="/work">Work</a></nav>
        </div>
      </dialog>`;
    bindMobileNav();
  });

  const dialog = () => document.querySelector('dialog')!;
  const opener = () => document.querySelector<HTMLButtonElement>('[data-mobile-nav-open]')!;
  const open = () => opener().click();
  // Stop jsdom navigating when a link is clicked; the script has already run by then.
  const clickWithoutNavigating = (element: Element) => {
    element.addEventListener('click', (event) => event.preventDefault(), { once: true });
    (element as HTMLElement).click();
  };

  it('opens on the first page link and reports the expanded state', () => {
    open();
    expect(dialog().open).toBe(true);
    expect(opener().getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(document.querySelector('nav a'));
  });

  it('closes from the close button, even when its icon is clicked', () => {
    open();
    (document.querySelector('[data-mobile-nav-close] svg') as SVGElement).dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
    expect(dialog().open).toBe(false);
  });

  it('closes on a backdrop click but not on a click inside the panel', () => {
    open();
    (document.querySelector('.panel') as HTMLElement).click();
    expect(dialog().open).toBe(true);
    dialog().click();
    expect(dialog().open).toBe(false);
  });

  it('closes when a link is activated and returns focus to the menu button', () => {
    open();
    clickWithoutNavigating(document.querySelector('a[href="/work"]')!);
    expect(dialog().open).toBe(false);
    expect(opener().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(opener());
  });

  it('keeps Tab and Shift+Tab inside the sheet', () => {
    open();
    const close = document.querySelector<HTMLElement>('[data-mobile-nav-close]')!;
    const last = document.querySelector<HTMLElement>('a[href="/work"]')!;
    const tab = (shiftKey: boolean) =>
      dialog().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true }),
      );

    last.focus();
    expect(tab(false)).toBe(false); // default prevented: focus wraps instead of leaving
    expect(document.activeElement).toBe(close);

    expect(tab(true)).toBe(false);
    expect(document.activeElement).toBe(last);

    document.querySelector<HTMLElement>('a[href="/"]')!.focus();
    expect(tab(false)).toBe(true); // mid-list: the browser moves focus normally
    dialog().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  });

  it('closes a menu restored from the back/forward cache', () => {
    open();
    window.dispatchEvent(new Event('pageshow'));
    expect(dialog().open).toBe(false);
  });
});
