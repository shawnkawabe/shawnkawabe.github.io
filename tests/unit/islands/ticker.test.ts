import { afterEach, describe, expect, it } from 'vitest';
import { bindTickers } from '@/lib/ticker';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('ticker toggle (WCAG 2.2.2)', () => {
  it('pauses and resumes the rows, keeping its label', () => {
    document.body.innerHTML = `
      <div data-ticker>
        <button data-ticker-toggle aria-pressed="false" aria-label="Pause the moving list"></button>
      </div>`;
    bindTickers();
    const button = document.querySelector('button')!;
    const ticker = document.querySelector('[data-ticker]')!;

    button.click();
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(ticker.hasAttribute('data-paused')).toBe(true);
    expect(button.getAttribute('aria-label')).toBe('Pause the moving list');

    button.click();
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(ticker.hasAttribute('data-paused')).toBe(false);
  });
});
