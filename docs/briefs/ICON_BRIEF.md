# Site icon: design brief

Context for designing the site icon (favicon and app icons) of **shawnkawabe.github.io**. It
covers the brand, the constraints, every direction tried so far with Shawn's reaction, and what
to hand back. Written 2026-10-27 (BACKLOG-LANDING L-45).

> **Superseded 2026-10-28:** the site now uses the SK Ribbon mark; its spec is
> `docs/brand/ICON.md`. This brief stays as the record of the rounds before it.

## 1. Who and what

- **Shawn Kawabe**, Senior Salesforce Developer and Functional Specialist, based in São Paulo,
  working remotely with US and Brazilian clients.
- The site is his portfolio. Audience: Salesforce hiring managers, tech recruiters, consultancy
  partners, who scan for 30 seconds.
- Hero headline: "CRM solutions that teams actually **adopt**." The last word is set in
  Instrument Serif, outlined (stroke only, no fill). Under the headline, a slowly turning dotted
  globe with the Salesforce clouds he works in orbiting it as "moons" (text links).
- Site languages: English, Portuguese, Spanish.

## 2. Visual direction

- Dark by default, with a light theme. Precise, calm, futuristic. Layout language from Once UI's
  Magic Portfolio: floating vertical nav rail, generous whitespace.
- Futuristic accents come from type, glow and depth, never from clutter.
- **One aesthetic risk per page:** the 3D globe. Everything else is restrained.

### Colours (design tokens)

| Token        | Dark theme | Light theme | Role                    |
| ------------ | ---------- | ----------- | ----------------------- |
| surface-0    | `#131313`  | `#FAFAFA`   | page background         |
| on-surface-1 | `#F2F2F2`  | `#141414`   | primary text            |
| accent-1     | `#4DA9FF`  | `#0B5CD5`   | links, highlights, CTAs |

The icon so far uses the dark-theme values, because a single icon file serves both themes and
browser tab strips (dark or light, Chrome dark tab strip is about `#202124`, light about
`#F1F3F4`).

### Typography

- **Geist Sans**: display, headings, body, UI. Display tracking −0.03em at 32px and above.
- **Geist Mono**: labels, code, data.
- **Instrument Serif** (regular and italic): only one outlined display word per page (ADR 0009).
  Shawn asked for the icon to use this face.
- All three are open-licence (OFL), so their outlines can be used in the icon.

## 3. Hard constraints

1. **No Salesforce imagery.** Never draw, trace or imitate the Salesforce cloud logo, its cloud
   shapes, the Astro character or any product logo. Shawn's name is the brand.
2. **Legible at 16×16** in a browser tab, on both dark and light tab strips. This is the size
   that matters most.
3. **One idea, one accent.** No gradients (the banned "purple-to-pink" kind especially), no
   glassmorphism, no emoji-like pictograms.
4. **Vector, no runtime font.** The SVG favicon must be paths only (letters converted to
   outlines). It is drawn on a 32×32 grid.
5. **Every size from one drawing.** A script builds all files from one SVG (see §6).

## 4. What was tried, and Shawn's reaction

Renders of every round are attached (file names in brackets).

| Round   | Direction                                                                                                                                                                                 | Outcome                                                             |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| L-14    | Thin "SK" strokes in accent on the dark surface                                                                                                                                           | "Reads as plain text on a dark square"                              |
| L-31    | White rounded-stroke SK on a blue gradient tile [0-before-L31-gradient-tile]                                                                                                              | "Fix the site icon": blurry at 16px, looks like a generic app icon  |
| L-45 v1 | Geometric squared SK, dark tile, accent underline, faint accent edge [1-geometric-SK-variants]                                                                                            | Chosen, then "enhance and redesign"                                 |
| L-45 v2 | Concepts: orbit ring with an accent moon (echoing the hero globe), plain globe, two-tone SK, SK with accent dot [2-orbit-and-two-tone-concepts]                                           | Orbit badge chosen; plain globe dropped (read as a Saturn emoji)    |
| L-45 v3 | Orbit badge shipped                                                                                                                                                                       | "Use the font used on 'adopt'" (Instrument Serif)                   |
| L-45 v4 | Instrument Serif upright: SK side by side; SK interlocked (S overlapping K, cut apart by a thin gap) in white; same with an accent S; serif inside the orbit [3-instrument-serif-upright] | Interlocked accent S chosen and shipped, then "I need another idea" |
| L-45 v5 | Six serif ideas: italic S alone, italic "Sk" signature, "SK." with an accent square full stop, dark SK on a solid accent tile, italic SK seal, stacked s/k [4-instrument-serif-six-ideas] | **"Sk" signature chosen; current icon**                             |

### The current icon [5-current-italic-Sk-signature, current-favicon.svg]

- Instrument Serif **Italic**: a white capital **S** (`#F2F2F2`) with an accent lowercase **k**
  (`#4DA9FF`) tucked into its lower curve.
- The k is parted from the S by a thin cut in the tile colour (the k is drawn first in the tile
  colour with a thick stroke, then in accent on top).
- Each letter carries a light stroke in its own colour to thicken the serif hairlines at 16px.
- Dark rounded tile `#131313`, corner radius 7.5 on the 32 grid; letters about 21 of 32 units tall.

### What we learned

- Drawn geometric letters looked generic; Shawn wants a **typographic** mark in the hero's
  serif, tied to the site's own type.
- Decoration (rings, dots, underlines) disappears or turns to noise at 16px.
- Colour separation (white plus accent) is what keeps two letters apart at 16px.
- Serif hairlines need thickening below about 32px; a dedicated small-size drawing may be better
  than one drawing scaled.
- A round badge looked more like an app or a social avatar; the rounded square tile feels calmer.

## 5. What to explore next

Open questions where a designer's eye would help:

- **Proportion and spacing:** optical kerning of the S and k, letter size against the tile, and
  where the k's bowl sits in the S's curve.
- **A 16px master:** a separate, simplified drawing for 16 and 32px (heavier hairlines, perhaps
  the k's loop opened), with the detailed version from 48px up.
- **Tile:** whether the dark tile should carry a hairline edge for dark tab strips, or whether a
  light-theme variant (`prefers-color-scheme` inside the SVG) is worth it.
- **Link to the outlined "adopt":** whether an outlined treatment can echo the hero word at large
  sizes (Apple touch icon, 512px) while the small sizes stay solid.
- **Monogram vs. wordmark:** the same signature could later become a small wordmark for the
  nav or the share images.

## 6. Technical hand-off

All files are generated by `npm run icons` (`scripts/icons.mjs`) from one 32×32 drawing, using
the dark-theme tokens:

| File                           | Size                    | Notes                                                                                |
| ------------------------------ | ----------------------- | ------------------------------------------------------------------------------------ |
| `favicon.svg`                  | vector, 32 grid         | rounded tile, transparent corners                                                    |
| `favicon.ico`                  | 16, 32, 48 (PNG frames) | Google search results use the 48px frame                                             |
| `apple-touch-icon.png`         | 180                     | full bleed square, iOS rounds the corners; mark at 90%                               |
| `icon-192.png`, `icon-512.png` | 192, 512                | same as the SVG                                                                      |
| `icon-maskable-512.png`        | 512                     | full bleed; Android may crop to a circle of 80% of the side, so the mark sits at 74% |
| `site.webmanifest`             | —                       | name, theme and background colour `#131313`                                          |

**Most useful deliverable:** an SVG on a 32×32 viewBox, letters as outlined paths, using only the
three token colours above; optionally a second SVG tuned for 16px. Note any change in letter
height, spacing or tile radius, so the script's constants can follow. After a change, the
`ICON_VERSION` query in `src/layouts/BaseLayout.astro` is bumped so returning visitors get the
new icon.
