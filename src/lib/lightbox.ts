// Gallery lightbox (SPEC §5.3) on a native modal <dialog>: Esc closes natively; this adds
// arrow-key and button paging, a focus loop, backdrop close and focus return to the thumbnail.
import { trapFocus } from './focus-trap';
import { format } from './seo';

type Slide = { src: string; alt: string; caption: string };

export function bindLightbox(root: ParentNode = document): void {
  const gallery = root.querySelector<HTMLElement>('[data-gallery]');
  const dialog = gallery?.querySelector<HTMLDialogElement>('[data-lightbox]');
  if (!gallery || !dialog) return;

  const openers = [...gallery.querySelectorAll<HTMLButtonElement>('[data-lightbox-open]')];
  const slides: Slide[] = openers.map((opener) => {
    const image = opener.querySelector('img')!;
    return {
      src: image.getAttribute('src') ?? '',
      alt: image.alt,
      caption: opener.dataset.caption ?? '',
    };
  });
  const image = dialog.querySelector<HTMLImageElement>('[data-lightbox-image]')!;
  const caption = dialog.querySelector<HTMLElement>('[data-lightbox-caption]')!;
  const position = dialog.querySelector<HTMLElement>('[data-lightbox-position]')!;
  const template = position.dataset.template ?? '{index} / {total}';
  let current = 0;

  const show = (index: number) => {
    current = (index + slides.length) % slides.length;
    const slide = slides[current];
    image.src = slide.src;
    image.alt = slide.alt;
    caption.textContent = slide.caption;
    position.textContent = format(template, { index: current + 1, total: slides.length });
  };

  openers.forEach((opener, index) =>
    opener.addEventListener('click', () => {
      show(index);
      dialog.showModal();
    }),
  );

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(current - 1);
    else if (event.key === 'ArrowRight') show(current + 1);
    else trapFocus(dialog, event);
  });

  dialog.addEventListener('click', (event) => {
    const target = event.target as Element;
    if (target.closest('[data-lightbox-prev]')) show(current - 1);
    else if (target.closest('[data-lightbox-next]')) show(current + 1);
    // The dialog element itself only receives clicks on its backdrop.
    else if (target === dialog || target.closest('[data-lightbox-close]')) dialog.close();
  });

  // Focus goes back to the thumbnail of the image last shown, not the one first opened.
  dialog.addEventListener('close', () => openers[current].focus());

  window.addEventListener('pageshow', () => {
    if (dialog.open) dialog.close();
  });
}
