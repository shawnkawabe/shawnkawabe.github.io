# ADR 0006 — Full-viewport landing home with CSS scroll-driven transitions

- Status: Accepted
- Date: 2026-10-26
- Deciders: Shawn Kawabe (feedback of 2026-10-26; backlog work pre-approved)

## Context

Shawn wants Home to read as a landing page: every section fills the screen and the page flows from
one section to the next with continuous transitions (`docs/BACKLOG-LANDING.md` L-08). ADR 0005 keeps
motion in CSS plus IntersectionObserver and rules out scroll scrubbing "unless a later design needs
it". This design needs it, and native CSS can now do it without a library.

Browser support, October 2026: CSS scroll-driven animations (`animation-timeline: view()` /
`scroll()`) ship unflagged in Chrome and Edge (115+) and Safari 26. Firefox still keeps them behind
a preference in stable. `svh` / `dvh` units work everywhere.

Accessibility research: `scroll-snap-type: mandatory` blocks zoomed-in users from reaching content
that falls between snap points and fights keyboard focus (csswg-drafts #3602; Adrian Roselli,
"Scroll Snap Challenges"). Safari also has a momentum-scroll bug with mandatory snapping (WebKit
223406).

## Decision

- Home sections are `min-height: 100svh` (never a fixed height). They grow when content, zoom or
  text spacing needs more room.
- Scroll snapping is `y proximity`, on Home only. Never `mandatory`.
- Section transitions use CSS scroll-driven animations on each section's content: opacity, a small
  lift and scale on entry, the reverse on exit. They apply only inside
  `@supports (animation-timeline: view())` and `prefers-reduced-motion: no-preference`, with
  `animation-range` and a duration both set explicitly.
- Fallback: where scroll-driven animations aren't supported (Firefox stable), the ADR 0005
  IntersectionObserver `Reveal` runs instead. With reduced motion nothing moves.
- No JavaScript scroll library (GSAP, Lenis, Locomotive) and no scroll hijacking: the browser owns
  scrolling.
- View Transitions are for page changes, not in-page sections, and are out of scope here.

## Consequences

- The hero's 3D scene stays the only WebGL on Home; the clouds constellation is replaced by CSS
  panels (L-05), which also removes its clipping problem.
- Firefox users get the reveal-once motion, not the continuous one, until Firefox ships the feature
  by default. No code change will be needed then.
- Every Home section needs a stable `id` so the section indicator and anchors work.
