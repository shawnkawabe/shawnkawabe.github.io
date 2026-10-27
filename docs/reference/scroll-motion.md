# Scroll-linked motion (BACKLOG-LANDING L-41, 2026-10-27)

Shawn asked for animations that move with the scroll, giving two samples: the globe expanding as
the sections change, and an arrow moving up. This note compares the ways to build them and picks
what fits a calm, professional portfolio.

## Rules we keep

- No scroll-jacking. The page scrolls at the visitor's speed, nothing is pinned, and there are no
  scroll traps.
- Content never waits for an animation: text and links are visible and usable at every scroll
  position.
- With `prefers-reduced-motion: reduce`, the page shows its static end state.
- No new animation library without an ADR (ADR 0005). Animate transforms and opacity only, so CLS
  stays at 0.

## Options

| Technique                    | How                                                                   | Support (caniuse, October 2026)                                | Cost                                                                 | Fit                                                               |
| ---------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------- |
| CSS scroll-driven animations | `animation-timeline: view()` or `scroll()` with a normal `@keyframes` | Chrome and Edge 115+, Safari 26+; Firefox has it behind a flag | No JavaScript; runs off the main thread                              | Best for decorative motion tied to one element's place on screen  |
| IntersectionObserver steps   | A class switches at thresholds and CSS transitions run (ADR 0005)     | Every browser                                                  | A small script; motion runs in steps, not scrubbed                   | Good for reveals and for state changes such as the active section |
| Scrubbing the R3F scene      | Feed the scroll position into the render loop                         | Wherever the scene runs (desktop, WebGL2)                      | Main-thread work every frame; must stay in step with the HTML labels | Only for changes inside the 3D scene                              |

## Samples, judged

- **The globe expanding as sections change.** This one is worth building. As the hero scrolls
  away, the globe and its moons grow from the bottom centre and fade, handing over to the next
  sections. The effect is decorative (the moons are links, but by then they are off screen), so
  CSS `view()` fits. It moves the stage and the moon layer with the same keyframes, so the poster,
  the canvas and the labels stay aligned.
- **An arrow moving up.** On its own it reads as a gimmick. The useful version already exists: the
  section indicator marks the current section. A rail progress line is possible later, but
  nothing calls for it now.

## Decision

- **Build:** the globe hand-off, in CSS only. It follows the hero's named view timeline over its
  exit range, scaling the globe to 1.35 from the bottom centre and fading it out in the second
  half. A downward drift was tried and dropped: the hero clips its overflow, so the globe was cut
  off instead of growing.
- **Firefox and older Safari:** keep the static globe, with no stepped fallback. The effect is
  decorative and no content depends on it, so a script for one browser is not worth it.
- **Reduced motion:** no animation.
- **Later, if wanted:** a rail progress line (`scroll()` timeline on the root), after L-40.

Sources: [caniuse: animation-timeline view()](https://caniuse.com/mdn-css_properties_animation-timeline_view),
[MDN: view()](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline/view),
[Mozilla Connect thread](https://connect.mozilla.org/t5/discussions/why-doesn-t-firefox-support-the-css-animation-timeline/m-p/63761).
