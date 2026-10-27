// Above-the-fold fonts to preload (DESIGN §4, ADR 0007): the Latin subset of the Geist variable
// file the Fontsource CSS in global.css references, so the preload and the @font-face share one URL.
import geistLatin from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url';

export const preloadFonts: readonly string[] = [geistLatin];
