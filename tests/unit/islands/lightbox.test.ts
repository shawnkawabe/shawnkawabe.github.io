import { beforeEach, describe, expect, it } from 'vitest';
import { bindLightbox } from '@/lib/lightbox';

const dialog = () => document.querySelector<HTMLDialogElement>('[data-lightbox]')!;
const openers = () => [...document.querySelectorAll<HTMLButtonElement>('[data-lightbox-open]')];
const shown = () => ({
  alt: document.querySelector<HTMLImageElement>('[data-lightbox-image]')!.alt,
  caption: document.querySelector('[data-lightbox-caption]')!.textContent,
  position: document.querySelector('[data-lightbox-position]')!.textContent,
});
const key = (name: string) =>
  dialog().dispatchEvent(
    new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }),
  );
const click = (selector: string) =>
  document
    .querySelector<HTMLElement>(selector)!
    .dispatchEvent(new MouseEvent('click', { bubbles: true }));

describe('lightbox', () => {
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
      <div data-gallery>
        <button data-lightbox-open data-caption="First"><img src="/a.webp" alt="Image A"></button>
        <button data-lightbox-open><img src="/b.webp" alt="Image B"></button>
        <button data-lightbox-open data-caption="Third"><img src="/c.webp" alt="Image C"></button>
        <dialog data-lightbox>
          <img data-lightbox-image alt="">
          <span data-lightbox-caption></span>
          <span data-lightbox-position data-template="{index} of {total}"></span>
          <button data-lightbox-prev><svg></svg></button>
          <button data-lightbox-close>Close</button>
          <button data-lightbox-next>Next</button>
        </dialog>
      </div>`;
    bindLightbox();
  });

  it('opens on the clicked image with its caption and position', () => {
    openers()[1].click();
    expect(dialog().open).toBe(true);
    expect(shown()).toEqual({ alt: 'Image B', caption: '', position: '2 of 3' });
    expect(document.querySelector<HTMLImageElement>('[data-lightbox-image]')!.src).toMatch(
      /\/b\.webp$/,
    );
  });

  it('pages with the arrow keys and buttons, wrapping at both ends', () => {
    openers()[0].click();
    key('ArrowLeft');
    expect(shown().position).toBe('3 of 3');
    key('ArrowRight');
    expect(shown()).toMatchObject({ alt: 'Image A', caption: 'First' });
    click('[data-lightbox-next]');
    expect(shown().alt).toBe('Image B');
    click('[data-lightbox-prev] svg');
    expect(shown().alt).toBe('Image A');
  });

  it('keeps Tab inside and returns focus to the thumbnail of the last image shown', () => {
    openers()[0].click();
    document.querySelector<HTMLElement>('[data-lightbox-next]')!.focus();
    expect(key('Tab')).toBe(false);
    expect(document.activeElement).toBe(document.querySelector('[data-lightbox-prev]'));

    key('ArrowRight');
    click('[data-lightbox-close]');
    expect(dialog().open).toBe(false);
    expect(document.activeElement).toBe(openers()[1]);
  });

  it('closes on a backdrop click and when restored from the back/forward cache', () => {
    openers()[2].click();
    dialog().dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(dialog().open).toBe(false);

    openers()[2].click();
    window.dispatchEvent(new Event('pageshow'));
    expect(dialog().open).toBe(false);
  });

  it('does nothing on a page without a gallery', () => {
    document.body.innerHTML = '<p>No gallery</p>';
    expect(() => bindLightbox()).not.toThrow();
  });
});
