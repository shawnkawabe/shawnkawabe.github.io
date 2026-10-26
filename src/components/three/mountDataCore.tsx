// Entry point for the hero data core: imported by HeroScene's gate script only when the scene may
// run, so React and three.js never load for visitors who keep the gradient poster.
import { createRoot } from 'react-dom/client';
import DataCoreCanvas from './DataCoreCanvas';

export function mountDataCore(host: HTMLElement): void {
  createRoot(host).render(<DataCoreCanvas />);
}
