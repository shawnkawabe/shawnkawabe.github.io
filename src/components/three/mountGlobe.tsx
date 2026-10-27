// Entry point for the hero cloud globe: imported by HeroGlobe's gate script only when the scene may
// run, so React and three.js never load for visitors who keep the poster.
import { createRoot } from 'react-dom/client';
import GlobeCanvas from './GlobeCanvas';

export function mountGlobe(host: HTMLElement, parts: Parameters<typeof GlobeCanvas>[0]): void {
  createRoot(host).render(<GlobeCanvas {...parts} />);
}
