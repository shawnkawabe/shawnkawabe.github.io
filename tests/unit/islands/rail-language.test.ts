import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LOCALE_KEY } from '@/lib/i18n';
import { bindLanguageMenus } from '@/lib/language-menu';
import { bindRailToggles, currentRail, RAIL_KEY } from '@/lib/rail';

beforeEach(() => {
  delete document.documentElement.dataset.rail;
  localStorage.clear();
});

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('rail', () => {
  const button =
    '<button data-rail-toggle data-label-collapse="Collapse" data-label-expand="Expand"></button>';

  it('starts expanded, then collapses, stores the choice and relabels the button', () => {
    document.body.innerHTML = button;
    bindRailToggles();
    const toggle = document.querySelector('button')!;
    expect(currentRail()).toBe('expanded');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-label')).toBe('Collapse');

    toggle.click();
    expect(document.documentElement.dataset.rail).toBe('collapsed');
    expect(localStorage.getItem(RAIL_KEY)).toBe('collapsed');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-label')).toBe('Expand');
  });

  it('reads the state the head script restored', () => {
    document.documentElement.dataset.rail = 'collapsed';
    document.body.innerHTML = button;
    bindRailToggles();
    expect(document.querySelector('button')!.getAttribute('aria-expanded')).toBe('false');
  });

  it('still collapses when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    document.body.innerHTML = button;
    bindRailToggles();
    document.querySelector('button')!.click();
    expect(currentRail()).toBe('collapsed');
  });
});

describe('language menu', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <details data-language-menu open>
        <summary>en</summary>
        <ul><li><a href="#pt" data-locale-link="pt">Português</a></li></ul>
      </details>
      <p id="outside">Elsewhere</p>`;
    bindLanguageMenus();
  });

  const menu = () => document.querySelector('details')!;

  it('closes on Esc and returns focus to the button', () => {
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    document.dispatchEvent(event);
    expect(menu().open).toBe(false);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(document.querySelector('summary'));
  });

  it('closes on a click outside, not inside', () => {
    document.querySelector('summary')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    menu().open = true;
    document.getElementById('outside')!.click();
    expect(menu().open).toBe(false);
  });

  it('remembers the chosen language', () => {
    document.querySelector('a')!.click();
    expect(localStorage.getItem(LOCALE_KEY)).toBe('pt');
  });
});
