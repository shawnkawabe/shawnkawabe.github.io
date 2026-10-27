# ADR 0009: Instrument Serif for one outlined display word; Apple fonts are not usable

- Status: Accepted
- Date: 2026-10-27
- Deciders: Shawn Kawabe chose an outlined serif word for the hero (L-39) and asked for a review of
  developer.apple.com/fonts (L-42).

## Context

The sculpted-gradient references (`docs/reference/sculpted-gradients.md`) pair a bold sans headline
with one display serif word set in outline. Layout A for the hero (L-39) uses it for the last word
of the claim. Geist (ADR 0007) has no serif. Shawn asked whether Apple's fonts could be used.

## Apple fonts (developer.apple.com/fonts, read 2026-10-27)

The page offers SF Pro, SF Compact, SF Mono, New York and the SF script extensions. The licence text
it shows says:

> "THE APPLE SAN FRANCISCO FONT IS TO BE USED SOLELY FOR CREATING MOCK-UPS OF USER INTERFACES TO BE
> USED IN SOFTWARE PRODUCTS RUNNING ON APPLE'S iOS, OS X OR tvOS OPERATING SYSTEMS"

> "You may not embed the Apple Font in any software programs or other products."

The licence also requires the user to be a registered Apple Developer. SF Compact carries the same
terms for watchOS. SF Pro, SF Mono and New York download under the same agreements.

| Font       | On this website                                       |
| ---------- | ----------------------------------------------------- |
| SF Pro     | No: licensed for mock-ups only, embedding not allowed |
| SF Compact | No: same terms, for watchOS mock-ups                  |
| SF Mono    | No: same terms                                        |
| New York   | No: same terms                                        |

Using system-font CSS stacks (`-apple-system`) would show SF on Apple devices only, without
shipping it, but it would split the design by platform and is not what the references show. We keep
Geist.

## Decision

- **Instrument Serif 400** (SIL Open Font License 1.1, via `@fontsource/instrument-serif`) is the
  display serif. It is a condensed, high-contrast face in the spirit of New York's display cuts; its
  hairlines survive a 1.5px outline at 48px and above.
  - Rejected: Newsreader, a variable file about three times larger and with lower contrast in
    outline.
  - Rejected: Source Serif 4, a text face that looks plain at display sizes.
- One weight, normal style. The Fontsource CSS splits it by `unicode-range`, so English pages fetch
  only the Latin file (21 KB); Portuguese and Spanish accents pull Latin Extended (12 KB) on demand.
  It is not preloaded: the outlined word is never the LCP element.
- Token `font.family.serif` → Tailwind `font-serif`.
- Rule: at most one outlined serif word per page, at 48px or larger, never in running text. CLAUDE.md
  rule 6 says so.

## Consequences

- One more font request on pages that use it (Home only for now).
- Swapping the serif later means changing one token.
