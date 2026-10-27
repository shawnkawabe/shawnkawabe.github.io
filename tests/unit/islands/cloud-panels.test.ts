import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bindCloudPanels, HOVER_OPEN_MS } from '@/lib/cloud-panels';

const panel = (id: string, open = false) => `
  <li data-cloud-panel ${open ? 'data-open' : ''}>
    <h3><button data-cloud-toggle aria-expanded="${open}" aria-controls="${id}">${id}</button></h3>
    <div id="${id}" data-cloud-detail>details</div>
  </li>`;

// jsdom has no matchMedia: stub the one query the script asks.
const setWidth = (desktop: boolean) =>
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: desktop, media: query }));

beforeEach(() => {
  document.body.innerHTML = `<ul data-cloud-panels>${panel('a', true)}${panel('b')}</ul>`;
});

afterEach(() => {
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const buttons = () => [...document.querySelectorAll<HTMLButtonElement>('[data-cloud-toggle]')];
const expanded = () => buttons().map((button) => button.getAttribute('aria-expanded'));

describe('cloud panels', () => {
  it('marks the group enhanced and keeps one panel open on desktop', () => {
    setWidth(true);
    bindCloudPanels();
    expect(document.querySelector('[data-cloud-panels]')!.hasAttribute('data-enhanced')).toBe(true);
    buttons()[1].click();
    expect(expanded()).toEqual(['false', 'true']);
    buttons()[1].click();
    expect(expanded()).toEqual(['false', 'true']);
  });

  it('lets the accordion close fully below lg', () => {
    setWidth(false);
    bindCloudPanels();
    buttons()[0].click();
    expect(expanded()).toEqual(['false', 'false']);
    expect(document.querySelector('[data-open]')).toBeNull();
  });

  it('opens on a resting mouse, not on touch or a quick pass', () => {
    vi.useFakeTimers();
    setWidth(true);
    bindCloudPanels();
    const second = document.querySelectorAll<HTMLElement>('[data-cloud-panel]')[1];
    const enter = (pointerType: string) =>
      second.dispatchEvent(Object.assign(new Event('pointerenter'), { pointerType }));

    enter('touch');
    vi.advanceTimersByTime(HOVER_OPEN_MS);
    expect(expanded()).toEqual(['true', 'false']);

    enter('mouse');
    second.dispatchEvent(new Event('pointerleave'));
    vi.advanceTimersByTime(HOVER_OPEN_MS);
    expect(expanded()).toEqual(['true', 'false']);

    enter('mouse');
    vi.advanceTimersByTime(HOVER_OPEN_MS);
    expect(expanded()).toEqual(['false', 'true']);
  });
});
