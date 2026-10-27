// Moving product list (BACKLOG-LANDING L-10): the round toggle pauses and resumes every row
// (WCAG 2.2.2). CSS in global.css does the moving; this only flips state. The label stays
// "Pause…" and aria-pressed carries the state, as a toggle button should.

export function bindTickers(root: ParentNode = document): void {
  for (const button of root.querySelectorAll<HTMLButtonElement>('[data-ticker-toggle]')) {
    const ticker = button.closest<HTMLElement>('[data-ticker]');
    button.addEventListener('click', () => {
      const paused = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(paused));
      ticker?.toggleAttribute('data-paused', paused);
    });
  }
}
