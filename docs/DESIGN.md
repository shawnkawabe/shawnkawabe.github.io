# Design system — "Constellation"

Source of truth for every visual decision. Tokens live in `tokens/*.tokens.json` (DTCG 2025.10) and compile to `src/styles/tokens.css`. If this file and the token files disagree, the token files win and this file must be updated.

Visual references: `docs/reference/` (Once UI Magic Portfolio). Match their spacing, calm and proportions; differ in type and the futuristic accents defined here.

---

## 1. Principles

1. **Calm surface, sharp signal.** Dark, quiet backgrounds; colour is reserved for things that matter (links, focus, the primary action). Inner pages use no glow, tilt or lift (ADR 0008).
2. **Evidence over adjectives.** Components display names and measured facts, never ratings, meters or dates.
3. **One idea per screen.** Every section has one headline and one action.
4. **Motion explains, never decorates.** Animate to show relationships (hover → related items light up), not to fill time.
5. **Accessible by construction.** Contrast and focus are tokens, not afterthoughts.

## 2. Token architecture

```
primitive                  →  semantic              →  component
color.palette.blue-400        color.accent-1           --pf-c-button-brand-bg
--pf-g-color-palette-blue-400 --pf-g-color-accent-1
```

- **Primitive** tokens (`tokens/base.tokens.json`): raw scales. Never referenced by components.
- **Semantic** tokens (`tokens/theme.dark.tokens.json`, `tokens/theme.light.tokens.json`): meaning (`surface-1`, `on-surface-2`, `accent-1`). Themes swap only these.
- **Component** tokens: defined in each component's CSS when a component needs a named knob; always alias a semantic token.

CSS variable naming mirrors SLDS 2 global styling hooks (`--slds-g-*`) so components can move into Experience Cloud later:

```
--pf-g-color-surface-1        (global, semantic)
--pf-g-font-size-5
--pf-g-spacing-6
--pf-c-card-radius            (component)
```

Build: `npm run tokens` (Style Dictionary 5). Output: `src/styles/tokens.css` — `:root` = primitives + dark semantic; `[data-theme="light"]` = light semantic overrides. Generated and git-ignored; never edit it.

Variable name = `--pf-g-` + token path joined with `-`. The resulting names, used throughout these docs:

| Token path                         | CSS variable                                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `color.surface-1` (theme files)    | `--pf-g-color-surface-1`                                                                                            |
| `color.cloud-sales` (theme files)  | `--pf-g-color-cloud-sales`                                                                                          |
| `color.palette.blue-400` (base)    | `--pf-g-color-palette-blue-400` (primitive; not for components)                                                     |
| `font.size.5.min` / `.max`         | one variable `--pf-g-font-size-5: clamp(min, fluid, max)` (custom transform; the `-min`/`-max` pair is not emitted) |
| `font.line-height.5`               | `--pf-g-font-line-height-5`                                                                                         |
| `font.family.heading`              | `--pf-g-font-family-heading`                                                                                        |
| `spacing.6`                        | `--pf-g-spacing-6`                                                                                                  |
| `radius.lg`                        | `--pf-g-radius-lg`                                                                                                  |
| `shadow.1`                         | `--pf-g-shadow-1`                                                                                                   |
| `duration.base`, `easing.standard` | `--pf-g-duration-base`, `--pf-g-easing-standard`                                                                    |

Not tokens (composed in CSS from tokens): `shadow-glow`, cover gradients (§3.3). Breakpoints are tokens for documentation, but Tailwind's `@theme` needs literal values for media queries, so `global.css` repeats 640/768/1024/1280/1440 as literals.

## 3. Colour

### 3.1 Semantic palette

| Token             | Role                          | Dark                     | Light                   |
| ----------------- | ----------------------------- | ------------------------ | ----------------------- |
| `surface-0`       | Page background               | `#0E0F13`                | `#FAFAFB`               |
| `surface-1`       | Default section               | `#16171B`                | `#FFFFFF`               |
| `surface-2`       | Cards, nav rail               | `#1E1F24`                | `#F4F5F7`               |
| `surface-3`       | Raised: menus, panels         | `#26282E`                | `#ECEEF2`               |
| `on-surface-1`    | Primary text                  | `#F4F4F6`                | `#121318`               |
| `on-surface-2`    | Secondary text                | `#A0A3AD`                | `#555A66`               |
| `on-surface-3`    | Tertiary, captions            | `#6E7280`                | `#7C8190`               |
| `border-1`        | Hairlines                     | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.08)`      |
| `border-2`        | Emphasised borders            | `rgba(255,255,255,0.16)` | `rgba(0,0,0,0.16)`      |
| `accent-1`        | Links, primary action, focus  | `#4DA9FF`                | `#0B5CD5`               |
| `accent-1-strong` | Hover/pressed of accent       | `#7CC0FF`                | `#0848A8`               |
| `accent-2`        | Secondary highlight (violet)  | `#8B7CF6`                | `#5B3FD6`               |
| `accent-3`        | Tertiary highlight (teal)     | `#5ED3C3`                | `#0E8A7A`               |
| `on-accent`       | Text on accent fills          | `#06121F`                | `#FFFFFF`               |
| `success`         | Success                       | `#4ADE80`                | `#15803D`               |
| `warning`         | Warning                       | `#FBBF24`                | `#B45309`               |
| `error`           | Error                         | `#F87171`                | `#B91C1C`               |
| `focus-ring`      | Focus outline                 | `#4DA9FF`                | `#0B5CD5`               |
| `glow-1`          | Accent glow                   | `rgba(77,169,255,0.35)`  | `rgba(11,92,213,0.20)`  |
| `band-a`          | Case-study band tint (violet) | `rgba(139,124,246,0.08)` | `rgba(91,63,214,0.06)`  |
| `band-b`          | Case-study band tint (teal)   | `rgba(94,211,195,0.08)`  | `rgba(14,138,122,0.06)` |

Contrast requirements (checked in CI by axe and manually in the token PR):

- `on-surface-1` on `surface-0…3`: ≥ 7:1.
- `on-surface-2` on `surface-0…2`: ≥ 4.5:1.
- `on-surface-3`: only for text ≥ 18px or non-essential captions; ≥ 3:1.
- `accent-1` text on `surface-1`: ≥ 4.5:1.

### 3.2 Cloud accents

Each cloud node has an accent used for its glow and chip dot. Hue only; never used for text. Semantic tokens in both theme files with the **same value in both themes**. `skills.json` `accent` holds the token name (e.g. `"cloud-sales"`); components resolve it to `var(--pf-g-color-{accent})`.

| Cloud id           | Token                    | CSS variable                    | Value (both themes) |
| ------------------ | ------------------------ | ------------------------------- | ------------------- |
| `sales-cloud`      | `color.cloud-sales`      | `--pf-g-color-cloud-sales`      | `#4DA9FF`           |
| `service-cloud`    | `color.cloud-service`    | `--pf-g-color-cloud-service`    | `#5ED3C3`           |
| `experience-cloud` | `color.cloud-experience` | `--pf-g-color-cloud-experience` | `#8B7CF6`           |
| `commerce-cloud`   | `color.cloud-commerce`   | `--pf-g-color-cloud-commerce`   | `#F59E7B`           |
| `data-cloud`       | `color.cloud-data`       | `--pf-g-color-cloud-data`       | `#38BDF8`           |
| `platform`         | `color.cloud-platform`   | `--pf-g-color-cloud-platform`   | `#A3E635`           |
| `membership`       | `color.cloud-membership` | `--pf-g-color-cloud-membership` | `#F472B6`           |

These are original colours chosen for contrast on dark; do not match them to Salesforce brand colours.

### 3.3 Cover gradients

Four presets reproducing the references in `docs/reference/cover-*.jpg`. Implemented as layered CSS radial/linear gradients in `src/styles/covers.css`, selected by `cover.preset` in content. Covers are artwork: they look the same in both themes, and `covers.css` is the **only** file allowed to contain raw colour values (the recipe colours below and the white title/subtitle).

| Preset        | Reference               | Recipe (dark)                                                                                                  |
| ------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| `aurora`      | `cover-aurora.jpg`      | Base `#141B3A`; diagonal teal beam `#5FA89A` at 35% from bottom-left; indigo `#3D4A8C` bottom-right; soft blur |
| `indigo`      | `cover-indigo.jpg`      | Base `#171A3D` → `#1E2150`; faint teal glow top-left corner                                                    |
| `violet-edge` | `cover-violet-edge.jpg` | Left half violet `#4A3C9E` → blue `#4D7BD6`, hard falloff to `#050816`                                         |
| `solid-blue`  | `cover-solid-blue.jpg`  | Flat `#1048F0`; used for highlight/link tiles only                                                             |

Cover title: Geist 700, `font-size-8` desktop / `font-size-6` mobile, `#FFFFFF`; subtitle Geist 500, `rgba(255,255,255,0.7)`. Title contrast against the busiest gradient area must stay ≥ 4.5:1 (add a 20% black scrim if not).

## 4. Typography

| Role                               | Family                | Weights | Token                          |
| ---------------------------------- | --------------------- | ------- | ------------------------------ |
| Display (hero name, cloud names)   | Geist Sans (variable) | 600–800 | `font-family-display`          |
| Headings                           | Geist Sans (variable) | 500–700 | `font-family-heading`          |
| Body, UI                           | Geist Sans (variable) | 400–600 | `font-family-body`             |
| Labels, code, data                 | Geist Mono (variable) | 400–600 | `font-family-mono`             |
| One outlined display word (≥ 48px) | Instrument Serif      | 400     | `font-family-serif` (ADR 0009) |

Self-host via Fontsource packages (ADR 0007); preload the Geist variable WOFF2 (Latin subset) only. `font-display: swap`. Fallbacks: `'Geist Fallback'` (Arial with metric overrides, so the swap moves no text), then `ui-sans-serif, system-ui, sans-serif` / `ui-monospace, monospace`.

### Scale (fluid between 375px and 1440px)

| Token         | Min → max | Line height | Use                   |
| ------------- | --------- | ----------- | --------------------- |
| `font-size-1` | 13px      | 1.5         | Captions, mono labels |
| `font-size-2` | 14px      | 1.5         | UI, chips, meta       |
| `font-size-3` | 16px      | 1.6         | Body                  |
| `font-size-4` | 18 → 20px | 1.5         | Lead paragraphs       |
| `font-size-5` | 20 → 24px | 1.3         | H4, card titles       |
| `font-size-6` | 24 → 32px | 1.2         | H3                    |
| `font-size-7` | 32 → 44px | 1.15        | H2, section titles    |
| `font-size-8` | 40 → 64px | 1.05        | H1, cover titles      |
| `font-size-9` | 48 → 88px | 1.0         | Hero name (display)   |

Rules: display style only at `font-size-7` and above. Letter-spacing tightens with size: display −0.03em, h1 −0.025em, h2 −0.02em, h3 −0.01em; mono labels +0.08em uppercase, never below 13px. Max line length 68ch for body.

## 5. Space, size, shape

- **Spacing** (`spacing-N`, 4px base): 1=4, 2=8, 3=12, 4=16, 5=20, 6=24, 8=32, 10=40, 12=48, 16=64, 20=80, 24=96, 32=128.
- **Section rhythm:** `spacing-24` between sections desktop, `spacing-16` mobile.
- **Containers:** content max 1200px; reading column max 720px; page gutter 16px (< 640), 24px (640–1023), 32px (≥ 1024). On desktop the content column starts right of the nav rail (rail 64px wide + 32px gap).
- **Radius:** `radius-sm` 8 (chips, inputs), `radius-md` 16 (cards), `radius-lg` 24 (cover cards, panels), `radius-pill` 999 (nav rail, pills).
- **Borders:** 1px `border-1`; emphasised 1px `border-2`.
- **Elevation:** `shadow-1` cards `0 1px 2px rgba(0,0,0,.24), 0 8px 24px rgba(0,0,0,.24)`; `shadow-2` overlays `0 16px 48px rgba(0,0,0,.40)`; `shadow-glow` `0 0 0 1px var(--pf-g-color-border-2), 0 0 32px var(--pf-g-color-glow-1)`. Light theme halves the alpha.
- **Breakpoints:** `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1440.

## 6. Motion

| Token               | Value                          | Use                          |
| ------------------- | ------------------------------ | ---------------------------- |
| `duration-fast`     | 150ms                          | Hover, focus, colour         |
| `duration-base`     | 250ms                          | Cards lift, menus, chips     |
| `duration-slow`     | 450ms                          | Panels, page sections reveal |
| `easing-standard`   | `cubic-bezier(0.2, 0, 0, 1)`   | Default                      |
| `easing-emphasised` | `cubic-bezier(0.3, 0, 0, 1.2)` | Panel enter only             |

- **Inner pages (ADR 0008):** hover changes text colour or underline only, `duration-fast`. No lift, glow or tilt.
- Home only: card hover lifts (translateY(−2px), border to `border-2`, `duration-base`); `CoverCard` may tilt toward a fine pointer, at most 6°, flat for touch, reduced motion and without JavaScript (`src/lib/tilt.ts`).
- Rail (L-32): collapsing folds the pill into the circle (height `auto` → 4rem over `duration-slow`, `interpolate-size`), the body fading out first; expanding fades the groups in with a 30ms stagger. Tooltips slide 4px in with their fade.
- Links: underline fades from 35% to full and rises from 0.3em to 0.18em offset, `duration-base`. Buttons press to 98% on click; a trailing arrow nudges 2px forward on hover.
- Section reveal (`Reveal`, CSS + IntersectionObserver, ADR 0005): opacity 0 → 1, y 16 → 0, `duration-slow`, once.
- Hero text: split by word at build time (`SplitWords`), CSS 30ms stagger, once.
- Marquee: 40s per loop, linear; pause on hover/focus.
- **Reduced motion:** all of the above become instant; marquee becomes a wrapped list; 3D shows its poster. Implement with one `prefersReducedMotion()` helper used everywhere.

## 7. 3D

- Scenes: **Hero cloud globe** (BACKLOG-LANDING L-35; `HeroGlobe.astro` gate script → `GlobeCanvas`, starts after load + idle) and **Clouds constellation** (orbiting nodes with light pulses along the links). No others in the MVP. Both run only on ≥ 1024px with motion allowed and WebGL2.
- Hero globe:
  - **Look:** a gunmetal sphere lit from the upper left (`globe-shade`, `globe-lit`), with the continents as about 8.6k dots (`globe-dot`). The dots are baked from Natural Earth (`npm run globe:land`).
  - **Framing:** the sphere rises from the bottom edge, and the clouds Shawn worked in sit on a dashed arc above it as moons.
  - **Moons:** each one is a real HTML link to Work filtered by the cloud.
  - **Motion:** the sphere turns once every 120 s, and the moons swing ±5° around their homes at their own pace. Hovering or focusing a moon holds them, and a round toggle pauses everything (WCAG 2.2.2).
  - **Alignment:** the poster (`npm run globe:poster`, one per theme), the CSS arc and the orthographic canvas share one framing in `src/lib/globe.ts`, so they line up at any size.
  - **Poster:** it is the fallback for mobile, reduced motion and missing WebGL2, and the scene cross-fades in over it.
- Constellation: a faint orbit track and a dust disc turning slowly against the orbit; hovering a cloud doubles its link pulse and dims the others to 40 %. The globe maths lives in `src/lib/globe.ts` (pure, tested).
- Colours are read at runtime with `getComputedStyle(document.documentElement).getPropertyValue('--pf-g-color-…')` and re-read on the `pf-themechange` event, so scenes follow the theme.
- Materials: emissive, low-poly, no textures > 512px. Bloom only if it stays within budget.
- Budget per scene: ≤ 1 MB gzipped (JS + assets), ≤ 100K triangles, DPR ≤ 2, 60fps target on a mid-range laptop, 30fps acceptable on mobile.
- Lifecycle: `client:visible` island; poster image/gradient first; pause `frameloop` when off-screen or tab hidden; dispose on unmount.
- Fallback: identical information as accessible HTML (see spec §6.3).

## 8. Iconography and imagery

- **UI icons:** Lucide (via shadcn), 1.5px stroke, sizes 16/20/24.
- **Cloud icons:** original line icons in `src/assets/icons/clouds/*.svg` (24px grid, 1.5px stroke). Concepts: Sales = rising bars, Service = headset, Experience = portal/window, Commerce = cart, Data = linked nodes, Platform = layered blocks, Membership = id card. **Never** a cloud shape or any Salesforce mark.
- **Screenshots:** WebP, 1600px max width, `approved: true` only, client data blurred.
- **Photo of Shawn:** optional, square, ≥ 800px, used on About only.

## 9. Component visual specs

| Component           | Spec                                                                                                                                                                                                                                                                                                                             |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **NavRail**         | Tooltips are CSS-only (no shadcn Tooltip). Width 64px, padding `spacing-2`, `surface-2` at 90% + backdrop blur 12px, `radius-pill`, `shadow-1`. Items 40px circles, icon 20px `on-surface-2`; active: `surface-3` fill, icon `on-surface-1`, 4px dot below. Divider 24px `border-1`. Fixed `top: spacing-16`, `left: spacing-6`. |
| **TopBar (mobile)** | Height 56px, `surface-1` at 90% + blur, bottom `border-1`, name in Geist 600 `font-size-4`.                                                                                                                                                                                                                                      |
| **Button**          | Height 40 (md) / 48 (lg), padding x `spacing-5`, `radius-pill`. Brand: `accent-1` bg, `on-accent` text, hover `accent-1-strong`. Neutral: `surface-3` bg, `border-1`. Ghost: transparent, `on-surface-2`, hover `surface-2`. Focus: 2px `focus-ring` outline, 2px offset.                                                        |
| **Chip**            | Height 28, padding x `spacing-3`, `radius-pill`, mono `font-size-1` uppercase or Inter `font-size-2`; default `surface-3` + `border-1`; selected `accent-1` 16% fill + `accent-1` border + `on-surface-1` text; optional leading 8px dot in cloud accent.                                                                        |
| **CoverCard**       | `radius-lg`, `surface-2`, 8px inner padding around a 16:9 cover (`radius-md`), footer row: icon 20px + title (`font-size-3` 600) + subtitle (`font-size-2` `on-surface-2`). Hover: lift + glow. Matches `01-home-once-ui.jpg`.                                                                                                   |
| **ProjectCard**     | `radius-md`, `surface-2`, cover 16:9 top, body padding `spacing-5`: title `font-size-5`, summary 3 lines max, cloud chips (max 3 + "+N"), footer: client (mono) left, category right. No dates.                                                                                                                                  |
| **CloudCard**       | `radius-lg`, `surface-2`, `border-1`, inner glow in cloud accent at 12% on hover; icon 32px, name Geist `font-size-6`, stats row mono.                                                                                                                                                                                           |
| **SnapshotBar**     | Grid of label/value pairs, labels mono uppercase `on-surface-3`, values `on-surface-1`; top and bottom `border-1`.                                                                                                                                                                                                               |
| **PageHeader**      | h1 `font-size-8`, lead `font-size-4` `on-surface-2`, max 720px, optional actions row (ADR 0008).                                                                                                                                                                                                                                 |
| **SectionRow**      | Grid `[label 11rem] [body]` on ≥ lg, stacked below; label `font-size-2` `on-surface-2`, sentence case; `border-1` top hairline.                                                                                                                                                                                                  |
| **LedgerRow**       | Whole row is one link: title `font-size-5` 600, subtitle `on-surface-2`, meta `font-size-2`; tags as text on the right; arrow turns `accent-1` on hover. `border-1` bottom hairline.                                                                                                                                             |
| **MetaList**        | `dl` in an auto-fit grid; `dt` `font-size-2` `on-surface-2` sentence case, `dd` `on-surface-1`; top and bottom `border-1`. Replaces SnapshotBar.                                                                                                                                                                                 |
| **InlineLinkList**  | Items separated by a middot in `on-surface-3`; items with a destination are links, the rest plain text.                                                                                                                                                                                                                          |
| **Panel (side)**    | 400px, `surface-3`, `shadow-2`, `radius-lg` on the inner edge, enters from right with `easing-emphasised`.                                                                                                                                                                                                                       |
| **Inputs**          | Height 44, `surface-1`, `border-2`, `radius-sm`; focus: `accent-1` border + 2px `focus-ring` outline; error: `error` border + message below in `error`.                                                                                                                                                                          |

## 10. Layout patterns

- **Home hero:** name, role and a one-line claim on the left (max 720px); a solid `surface-2` fact card (Clouds, Certifications, Based in) on the right on ≥ lg, below the text on mobile. The 3D scene sits behind, dimmed.
- **Page header (inner pages):** h1 + one lead paragraph, left-aligned, max 720px; no cover.
- **Section row:** a narrow label column (about 11rem, `font-size-2`, `on-surface-2`, sentence case) beside a 720px body column, with a `border-1` hairline between rows. Stacks on < lg.
- **Ledger list:** rows divided by `border-1` hairlines; each row is one link (title, subtitle, meta line, optional tags as text, arrow). No boxes, no covers.
- **Card rows (Home only):** horizontal scroll-snap on < lg, 2–3 columns grid on ≥ lg.
- **Case study:** section rows in one 960px column; media never wider than 1200px.

## 11. Trademark and content rules (design side)

- Product names as plain text; never styled to imitate a Salesforce wordmark.
- Shawn's name is the most prominent brand on every page.
- Footer notice from `content/site.json`.
- No client logos unless `approved: true` on the project.
