# ADR 0005 — Motion in CSS without GSAP

- Status: Accepted
- Date: 2026-10-26
- Deciders: Shawn Kawabe (backlog work pre-approved; recorded for review)

## Context

CLAUDE.md §2 lists GSAP for motion, and BACKLOG P3-03 asks for a GSAP `Reveal`, hero SplitText and card hovers. ARCHITECTURE §9 caps JavaScript on non-3D pages at 80 KB gzipped, and pages with a React island already sit close to it: `/work` ~71 KB, `/contact` 76.0 KB, Home 75.2 KB (P2-04, P2-09, P3-01).

GSAP 3.15 core with CSSPlugin, ScrollTrigger and SplitText measured **48.3 KB gz** (esbuild, minified). On every page with an island that would land at 119–124 KB.

DESIGN §6 asks for little: sections fade and rise 16px over `duration-slow`, once; hero words rise with a 30ms stagger, once; card hovers lift (already CSS since P1-06); everything instant under reduced motion.

## Decision

- Drop **GSAP**. Motion is CSS transitions and keyframes on the design tokens, in `src/styles/global.css`, wrapped in `@media (prefers-reduced-motion: no-preference)`.
- **Section reveal:** `Reveal.astro` marks an element `data-reveal`; `bindReveal()` in `src/lib/motion.ts` sets `data-revealed` the first time it enters the viewport (one IntersectionObserver, then `unobserve`). Elements start hidden only when the head script has set `data-motion` on `<html>`, so without JavaScript nothing is hidden.
- **Hero words:** `SplitWords.astro` splits text at build time into `.pf-word` spans with a `--pf-word-index`; CSS staggers them by 30ms. No script. Screen readers read a `sr-only` copy of the sentence; the animated copy is `aria-hidden`.
- **Reduced motion:** one `prefersReducedMotion()` helper (and `REDUCED_MOTION_QUERY`) in `src/lib/motion.ts` for every script; the constellation uses the same query.

Result: the reveal script adds ~0.4 KB gz to Home and no JavaScript to other pages.

## Consequences

- No timelines, scroll scrubbing or pinning. If a later design needs them, revisit with the budget numbers; GSAP could load on a page without React.
- Words animate with `display: inline-block`, so very long words do not hyphenate inside the hero heading.
- CLAUDE.md §2 now reads "CSS transitions + IntersectionObserver (ADR 0005)".
