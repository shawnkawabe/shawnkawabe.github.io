# Benchmark audit: "Products and tools" (BACKLOG-LANDING L-40, 2026-10-27)

Shawn: "The best section so far is the Product and Tools, ensure that the others are compliant
with it." This audit scores every Home section and inner page against that section's traits and
lists each gap with its fix. Home fixes ship in L-40; inner-page gaps feed L-21 to L-27.

Evidence: dark-theme screenshots at 1440 of the built site (Home sections after L-38, Work, one
case study, Skills, About, Contact).

## The benchmark's traits

| #   | Trait                      | What it looks like in Products and tools                                                                           |
| --- | -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| T1  | Large type is the visual   | Names at `font-size-6` carry the section; there are no images, icons or covers.                                    |
| T2  | Content first              | Each row is the thing itself (a product name), not a container around it.                                          |
| T3  | No boxes, badges or counts | Rows are split by `border-1` hairlines. A count may appear only as quiet mono meta, never as a chip or badge.      |
| T4  | Accent used sparingly      | Greys everywhere; `accent-1` appears only as the hover or focus rule and on links.                                 |
| T5  | Motion serves reading      | Rows nudge on hover or focus; the ticker pauses on hover or focus and has a pause button; reduced motion is still. |

## Home

| Section        | T1  | T2  | T3  | T4  | T5  | Gap                                                                                                            | Fix (L-40)                                                                                                                              |
| -------------- | --- | --- | --- | --- | --- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Hero           | ✓   | ✓   | ✓   | ✓   | ✓   | None. The claim is the visual; the accent is the single round action.                                          | —                                                                                                                                       |
| Featured work  | ✗   | ✗   | ✗   | ✓   | ~   | `CoverCard` boxes with gradient covers that repeat each title in a picture; the card lifts and glows on hover. | A typographic index (`FeaturedIndex`): mono number, title at display size, subtitle, hairlines, the products' hover rule and nudge.     |
| Clouds         | ~   | ~   | ✗   | ✗   | ✓   | Filled, bordered panels; cloud-coloured top bars, icons and glow; the closed panels show a padded count.       | Keep the expanding panels (L-05) but drop the box: hairline dividers, monochrome icons, no glow; the open panel's rule uses `accent-1`. |
| Products       | ✓   | ✓   | ✓   | ✓   | ✓   | The benchmark.                                                                                                 | —                                                                                                                                       |
| Certifications | ✓   | ✓   | ✓   | ✓   | ✓   | None. `CredentialLedger` is already a hairline ledger with names at display size.                              | —                                                                                                                                       |
| Contact        | ✓   | ✓   | ✓   | ✓   | ✓   | Fixed in L-38: the tinted band became a sculpted shape.                                                        | —                                                                                                                                       |

✓ meets the trait, ~ partly, ✗ fails.

## Inner pages (fed into L-21 to L-27)

| Page            | Gaps                                                                                                                                                                            | Goes to    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| All inner pages | No shared header or row primitives yet, so each page invents its own boxes; `shadow-glow` and tilt on cards.                                                                    | L-21, L-22 |
| Work            | `ProjectCard` boxes with gradient covers that repeat the client name; cloud chips; capability filters as chips with badge counts; cloud-coloured dots.                          | L-23       |
| Case study      | A large gradient cover that only repeats the title; clouds as coloured-dot chips in the meta row; decisions as cards; outcomes in boxes; stack as chips; next project in a box. | L-24       |
| Skills          | Cloud tiles (`CloudBento`) with coloured icons and counts; skill chips with "N projects" badge counts; languages in boxes. Certifications already follow the benchmark.         | L-25       |
| About           | "How I work" in four boxes; companies in boxes with project chips; the resume action is a pill button instead of the round action.                                              | L-26       |
| Contact         | Email and LinkedIn in boxes with accent icons.                                                                                                                                  | L-27       |

The inner-page fixes follow one pattern: names at display size on hairline rows (`SectionRow`,
`LedgerRow`, `MetaList`, `InlineLinkList` from DESIGN §9), counts as quiet mono meta or gone, and
the accent only on links, focus and the one primary action.

## Decisions

- **Counts:** the benchmark itself shows "3 projects" as mono meta, so quiet counts stay; badge
  and chip counts go.
- **Cloud colours:** after L-40 the cloud accents no longer appear on Home. Their tokens stay
  (L-36) until L-25 decides Skills; L-28 removes them if nothing uses them.
- **`CoverCard`:** unused on Home after L-40; removed in L-28 with its test and gallery entry.
