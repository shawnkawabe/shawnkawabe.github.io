# Reference: sculpted monochrome gradients (Shawn, 2026-10-27)

Source files: `docs/source-figma/`. That folder is git-ignored and must never be published.

- "Geometric Gradients (Community)": 20 Figma shapes and 20 header mock-ups (1440×900).
- `Frame 2.svg`: the cover of an Envato template pack, "Creative Figma Gradient Web Headers".

These files show the look Shawn wants. Their shapes, images and copy are not ours to ship. We
rebuild the look with our own geometry and our own words.

## What defines the look

- **Ground:** flat near-black charcoal (about `#141414`). Neutral, not blue-tinted. No grid, no
  noise, no glow.
- **One sculpted object per screen:**
  - Very large and soft: a tube, ring, wave, blob or chevron in matte gunmetal grey.
  - Light falls from one side.
  - The object is cropped by the frame and bleeds off one or two edges.
  - It sits behind the text, which crosses over it.
  - Depth comes from blur: the far ends fade into the ground, like a shallow focus.
- **Monochrome plus one accent:** everything is greyscale except one vivid colour, used for a
  single round action button. The pack shows orange-red, blue, green and violet variants.
- **Type:**
  - A very large, bold geometric sans headline in two or three words, left-aligned or centred.
  - A display serif word in outline adds contrast ("Delivered.").
  - A two-line supporting sentence sits in small type.
- **Round action:** about 120px across, accent fill, white arrow. It sits on the right, level
  with the headline, or centred below it.
- **Quiet meta frame** in small type at the edges:
  - top: brand at the top-left, a location and a menu glyph at the top-right;
  - bottom: a slide counter at the bottom-left and dot pagination at the bottom-right.
- **Hand-drawn marks:** some frames add a scribbled ellipse, a strike-through or an underline in
  the accent colour.

## How it maps to this site (proposal, see BACKLOG-LANDING Round 6)

| Reference                  | Here                                                                 |
| -------------------------- | -------------------------------------------------------------------- |
| Charcoal ground            | Neutral `surface-0` (about `#121212`), no grid backdrop, no tint     |
| One sculpted object        | Our own geometry: one shape per Home section, hero shape live in 3D  |
| Monochrome + one accent    | Greys for everything; accent only for the primary action and focus   |
| Bold sans + outlined serif | Geist for headlines; optional outlined serif for one word (ADR)      |
| Round action               | Hero and contact primary action as a round accent button             |
| Meta frame                 | Name top-left (rail stays), location top-right, section counter      |
| Hand-drawn marks           | Left out: they read as agency play rather than a professional's site |
