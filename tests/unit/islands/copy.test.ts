import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindCopy, COPIED_MS } from '@/lib/copy';

function setup() {
  document.body.innerHTML = `
    <div>
      <button type="button" data-copy="ada@example.com" data-copied="Copied">Copy</button>
      <span data-copy-status aria-live="polite"></span>
    </div>`;
  return {
    button: document.querySelector('button')!,
    status: document.querySelector<HTMLElement>('[data-copy-status]')!,
  };
}

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('bindCopy (L-27)', () => {
  it('copies the value and announces it briefly', async () => {
    vi.useFakeTimers();
    const { button, status } = setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    bindCopy(document, { writeText } as unknown as Clipboard);

    button.click();
    await vi.waitFor(() => expect(status.textContent).toBe('Copied'));
    expect(writeText).toHaveBeenCalledWith('ada@example.com');

    vi.advanceTimersByTime(COPIED_MS);
    expect(status.textContent).toBe('');
  });

  it('announces nothing when the clipboard refuses', async () => {
    const { button, status } = setup();
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    bindCopy(document, { writeText } as unknown as Clipboard);

    button.click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalled());
    expect(status.textContent).toBe('');
  });
});
