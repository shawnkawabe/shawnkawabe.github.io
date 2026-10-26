// Above-the-fold fonts to preload (DESIGN §4): the Latin subsets of the variable files the
// Fontsource CSS in global.css references, so the preload and the @font-face share one URL.
import interLatin from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url';
import spaceGroteskLatin from '@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2?url';

export const preloadFonts: readonly string[] = [spaceGroteskLatin, interLatin];
