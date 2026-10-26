# Backlog

Work top-down. One task per PR into the `rebuild` branch (or one PR per phase from `rebuild` to `main`, if you prefer). Tick the box when its acceptance criteria are met and `npm run ci` is green. Add notes under a task instead of editing its criteria; if criteria are wrong, ask.

Legend: **[H]** needs Shawn (content or decision) · **Deps** = tasks that must be done first.

---

## Prerequisites (from ARCHITECTURE)

Things that must exist or be decided before the task in **Blocks** can start. Derived from ARCHITECTURE §2 (folders), §3 (content), §8 (CI/CD) and §9 (budget). Verified items carry the date checked.

- [x] **PRE-01 Folder skeleton** — Blocks: P1-04 onward
      Every directory in ARCHITECTURE §2 exists. Empty ones hold a `.gitkeep`; delete it when the first real file lands there.

  | Folder                               | First filled by                                                     |
  | ------------------------------------ | ------------------------------------------------------------------- |
  | `src/lib/`                           | P1-04 (`schemas.ts`, `content.ts`), P1-05, P3-03                    |
  | `src/styles/`                        | P0-01 (`global.css`), P1-01 (`tokens.css`), P1-02 (`covers.css`)    |
  | `src/components/ui/`                 | P1-06                                                               |
  | `src/components/patterns/`           | P2-02, P2-03                                                        |
  | `src/components/three/`              | P0-04 (spike), P3-01                                                |
  | `src/layouts/`                       | P2-01                                                               |
  | `src/pages/work/`                    | P2-04, P2-05                                                        |
  | `src/dev/`                           | P1-06 (dev gallery, injected by the `devGallery` integration, §4.3) |
  | `src/i18n/`                          | P2-01 (`en.json`), P4-02 (`pt.json`, `es.json`)                     |
  | `src/assets/icons/clouds/`           | P1-07                                                               |
  | `tests/unit/`, `tests/unit/islands/` | P0-02, P1-04, P1-06                                                 |
  | `tests/e2e/`                         | P3-04                                                               |
  | `public/img/`                        | P1-08                                                               |
  | `public/og/`                         | P2-01, P3-05                                                        |
  | `.github/workflows/`                 | P0-03, P3-04                                                        |

- [x] **PRE-02 Line endings** — Blocks: P0-02
      `.gitattributes` forces LF (`* text=auto eol=lf`) and marks images, fonts and zips binary. Without it, Windows checkouts get CRLF and `prettier --check` fails locally while passing in CI.

- [x] **PRE-03 Local toolchain** — Blocks: P0-01
      Node 24 LTS (`.nvmrc`), npm 11. Checked 2026-10-25: Node 24.22.1, npm 11.19.1.

- [ ] **PRE-04 Approve npm install scripts** — Blocks: P1-08 (image conversion), CI parity
      npm 11 skips install scripts not covered by `allowScripts`: currently `esbuild` and `sharp`. The build works without them today, but `sharp` is needed for image work. Run `npm install-scripts approve esbuild sharp` and commit the resulting config.

- [x] **PRE-05 Version assumptions** — Blocks: the task named
      Checked 2026-10-25, re-check before installing:
  - `import { z } from 'astro/zod'` resolves in Astro 6.4 and 7.4 (P1-04).
  - `actions/checkout@v7`, `withastro/action@v6`, `actions/deploy-pages@v5` tags exist (P0-03).
  - Fontsource variable packages exist for all four fonts, including Orbitron, v5.3.0 (P1-03).
  - `style-dictionary@5` is 5.7.1 (P1-01).
  - `@react-three/fiber@9` (9.8.2) requires `react` and `react-dom` `>=19 <19.4`; installed React is 19.3.1. **Dependabot's minor group will try to raise React to 19.4 and break R3F** — hold React below 19.4 until R3F allows it (P0-03 dependabot config or P0-04).
  - Stack drift: P0-01 started on Astro 6 (Vite 7, `@astrojs/react@5`, `overrides.vite`). After P0-04, `npm audit` showed unpatched Astro 6 advisories (critical AVIF RCE GHSA-26w7-cxv4-gfx2, several XSS); Shawn approved moving to **Astro 7.4** (`@astrojs/react@7`, Vite 8, override removed). 0 vulnerabilities after the move. See ADR 0001 amendment.

- [ ] **PRE-06 GitHub repository settings [H]** — Blocks: P0-03 (Pages source done 2026-10-26; variable and branch protection open)
      §8.2: Settings → Pages → Source = **GitHub Actions**. Settings → Secrets and variables → Actions → **Variables** → `PUBLIC_WEB3FORMS_KEY` (may be empty; a variable, not a secret). Branch protection on `main` requiring the `build` job: add after the first workflow run, since the check must exist before it can be required.

- [ ] **PRE-07 Web3Forms access key [H]** — Blocks: P2-09 (not P0-03)
      Create the key at web3forms.com for the contact email in `content/site.json`; store it in the repo variable from PRE-06 and in a local `.env` (git-ignored). Empty key is valid: the form is hidden and email/LinkedIn links remain (§10).

- [ ] **PRE-08 Rescued project images [H]** — Blocks: P1-08
      Copy the old repo's `assets/projects/` (26 PNGs + `_manifest.json`) into `docs/source-images/`. The folder is already git-ignored (§8.4) because originals may contain client data.

## Phase 0 — Foundation and spike

- [x] **P0-01 Scaffold the project**
      Repo `shawnkawabe/shawnkawabe.github.io`, new branch `rebuild` from `main`. Delete `index.html`, `styles/`, `.vscode/settings.json`. Keep `LICENSE` (update year) and replace `README.md` with the one from this doc pack. Copy into the repo root: `CLAUDE.md`, `CONTENT.md`, `docs/`, `content/`, `tokens/`.
      Scaffold Astro 6 into the existing folder with the `with-tailwindcss` template, add React (`npx astro add react`) and sitemap (`npx astro add sitemap`). TypeScript strict, `"@/*"` → `"src/*"`. `.nvmrc` = `24`. `astro.config.mjs`: `site: 'https://shawnkawabe.github.io'`, `output: 'static'`, no `base`. `.gitignore` and `.env.example` per ARCHITECTURE §8.4 / §2.
  - [x] `npm run dev` serves `/`; `npm run build` outputs `dist/`.
  - [x] Doc pack files present at the paths above; old placeholder files gone.
  - Notes: `create-astro` now ships Astro 7.4; pinned `astro@^6.4.8` per ADR 0001. Astro 6 runs on Vite 7, so `@astrojs/react` is pinned to `^5` (6.x+ targets Vite 8) and `package.json` has `"overrides": { "vite": "^7.3.2" }` to stop `@tailwindcss/vite` resolving a second Vite (build failed with `Missing field tsconfigPaths`). Remove the override when moving to Astro 7. Template extras dropped: MDX, canvas-confetti, sample Button/markdown page. `npm run ci` not available until P0-02.

- [x] **P0-02 Tooling** — Deps: P0-01
      Install dev deps: `@astrojs/check typescript eslint typescript-eslint eslint-plugin-astro eslint-plugin-jsx-a11y prettier prettier-plugin-astro prettier-plugin-tailwindcss vitest @testing-library/react @testing-library/jest-dom jsdom linkinator husky lint-staged`. ESLint 9 flat config, Prettier config, Vitest config (jsdom for islands). Scripts exactly as ARCHITECTURE §8.1, with the `tokens` stub. `npx husky init`; pre-commit runs `npx lint-staged` on `*.{astro,ts,tsx,js,mjs,css,json,md}`.
  - [x] `npm run lint`, `npm test` (one sample test) and `npm run ci` all succeed.
  - [x] A commit with a mis-formatted file gets formatted by the hook.
  - Notes: ESLint pinned to `^9` (with `@eslint/js@^9`, added for `js.configs.recommended`): ESLint 10 is current but `eslint-plugin-jsx-a11y` 6.10 supports only ≤ 9, and `eslint-plugin-astro` 2.x+ requires ESLint 10, so it is pinned to `^1.7`. Vitest 5 uses two projects: `unit` (node) and `islands` (jsdom, `tests/setup-dom.ts`), wrapped in Astro's `getViteConfig` so the Container API works later. Prettier ran over the whole repo once: whitespace and table alignment only (JSON data and prose verified unchanged); code blocks in ARCHITECTURE §3.1 were re-wrapped. `check:links` skip pattern corrected (see ARCHITECTURE §8.1 note): the original skipped every link and could never fail. The sample test checks that content files parse and collection ids are unique.

- [x] **P0-03 Deploy pipeline** — Deps: P0-02
      `.github/workflows/deploy.yml` and `.github/dependabot.yml` exactly as ARCHITECTURE §8.2–8.3. **[H]** Shawn sets Pages source to GitHub Actions and adds the repository variable `PUBLIC_WEB3FORMS_KEY` (may stay empty for now).
  - [x] PR runs the build job only; merge to `main` deploys; the live URL shows the scaffold.
  - Notes: both files committed as specified; `withastro/action@v6` inputs (`node-version`, `build-cmd`) verified, and it uploads the Pages artifact itself. Addition to §8.3: Dependabot ignores `react`/`react-dom` `>=19.4.0` because R3F 9 peers on `<19.4` (PRE-05). Verified 2026-10-26: PR #1 ran `build` (full `npm run ci`, 37s) with `deploy` skipped; the merge push ran `build` + `deploy` (run 40252935848); live URL serves the Astro 7.4.2 scaffold. Live Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 90 (placeholder has no meta description; fixed by P2-01). `PUBLIC_WEB3FORMS_KEY` variable not yet set (allowed empty until P2-09).

- [x] **P0-04 3D spike** — Deps: P0-01
      Install `three @react-three/fiber@9 @react-three/drei@10` and `-D @types/three`. On a temporary page, render a rotating icosahedron as a `client:visible` island below the fold, with a gradient poster and a reduced-motion fallback.
  - [x] Island JS requested only after scrolling near it (verify in Network tab).
  - [x] Lighthouse mobile performance ≥ 95 on that page.
  - [x] Results written in `docs/adr/0001-astro-react-islands.md` → "Validation"; temporary page deleted.
  - Notes: performance 100 below the fold and 100 with the scene in the hero (worst case), so the hero-gradient fallback is not needed. Canvas chunk 247 KB gzipped. Spike used a shell island + `React.lazy` canvas; reuse it in P3-01. Re-measure on the live URL after P0-03.

## Phase 1 — Design system and content layer

- [x] **P1-01 Tokens pipeline** — Deps: P0-02
      Install `-D style-dictionary@5`. `style-dictionary.config.js` reading `tokens/*.tokens.json` and writing `src/styles/tokens.css`: primitives + dark semantic on `:root`, light semantic on `[data-theme="light"]`, prefix `pf-g`, names per DESIGN §2 table. Replace the `tokens` stub with the real script.
  - [x] Every semantic colour in DESIGN §3.1, every cloud accent in §3.2, every spacing/radius/shadow/duration/easing in §5–6 exists as the CSS variable named in DESIGN §2. (`shadow-glow` and cover gradients are not tokens.)
  - [x] Font sizes stored as `min`/`max` pairs emit one `clamp()` variable each (custom transform, 375px → 1440px).
  - [x] Colours use the DTCG 2025.10 object format already in `tokens/`; output as hex, or `rgb(r g b / a)` when alpha < 1.
  - [x] Output starts with a "generated, do not edit" header; file is git-ignored; `predev` and `build` regenerate it.
  - Notes: `tokens` is `node style-dictionary.config.js` (ARCHITECTURE §8.1 updated): two Style Dictionary API runs merged into one file, base tokens loaded via `include` so themes override without collision warnings; warnings are errors. Custom transforms for every DTCG 2025.10 object type in `tokens/`. Font sizes with equal min/max (1–3) emit a plain `rem` value instead of a degenerate `clamp()`; 4–9 emit `clamp()` in `rem` so they follow browser font settings. Generic families (`system-ui`, `sans-serif`) are never quoted. `tests/unit/tokens.test.ts` checks every criterion above. `tokens.css` is not imported yet; P1-02 wires it into `global.css`.

- [x] **P1-02 Tailwind mapping and base styles** — Deps: P1-01
      `global.css` with `@theme` mapping (colours, fonts, radii, shadows, spacing; literal breakpoints), base element styles, focus ring. `covers.css` with the four presets matched to `docs/reference/cover-*.jpg`.
  - [x] Cover presets visually match references side by side (screenshots in the PR).
  - [x] `npm run tokens && npm run build` produces no raw hex outside `tokens.css` and `covers.css` (grep check added to `lint`).
  - Notes: `@theme inline` maps every token to Tailwind names and clears the default palette, fonts, radii, shadows and type scale (`--color-*: initial` etc.), so only token-backed utilities exist (`bg-surface-2`, `text-5`, `rounded-lg`, `shadow-glow`). `--spacing` is `var(--pf-g-spacing-1)` (4px), so `p-4` = `spacing-4`. Breakpoints are literal px in a separate `@theme`. Base styles: theme-aware `color-scheme`, heading scale, link colours, one `:focus-visible` ring, reduced-motion reset. Covers use BEM classes `pf-cover pf-cover--{preset}` with `pf-cover__subtitle`; `violet-edge` is a `conic-gradient` wedge. Side-by-side comparison screenshot taken locally (`p1-02-covers-side-by-side.png`, attach to the phase PR). The raw-colour check is `scripts/check-raw-colors.js` (Node, so it runs under Windows `cmd`), flags hex and literal `rgb()/hsl()/oklch()` outside `tokens.css`/`covers.css`, ignores `href="#…"` and `url(#…)`. Dev server note: Tailwind may miss pages created while `astro dev` is running; restart it.

- [x] **P1-03 Fonts** — Deps: P1-02
      Install `@fontsource-variable/inter @fontsource-variable/space-grotesk @fontsource-variable/jetbrains-mono @fontsource-variable/orbitron` (check exact package names on fontsource.org; fall back to the static `@fontsource/orbitron` if no variable package exists). Preload Space Grotesk and Inter WOFF2 (Latin). Family names in tokens must match the CSS family names Fontsource registers; adjust `tokens/base.tokens.json` if they differ.
  - [x] No visible layout shift from font swap above the fold (CLS < 0.05).
  - Notes: all four `@fontsource-variable/*` packages exist (5.3.0, so no static Orbitron fallback). Registered family names (`Inter Variable`, `Space Grotesk Variable`, `JetBrains Mono Variable`, `Orbitron Variable`) already match `tokens/base.tokens.json`; no token change. Fonts are imported in `global.css`; `src/lib/fonts.ts` exports the two Latin WOFF2 preload URLs (same hashed files the `@font-face` rules use, so no double download) for the page `<head>` (move to `BaseLayout` in P2-01). Measured with Lighthouse mobile, 3 runs each on `astro preview`: a temporary page with all four families above the fold had CLS 0.024 and performance 99; home had CLS 0 and performance 100. Fonts add ~120 KB (Inter 47, JetBrains Mono 40, Space Grotesk 22, Orbitron 12) and moved LCP from 0.8 s to 1.4–1.8 s (still "good"). Home preloads Space Grotesk before it has a heading; fine once P2 pages exist.

- [x] **P1-04 Content layer** — Deps: P0-02
      `src/lib/schemas.ts` exactly per ARCHITECTURE §3.1; `src/content.config.ts` with four `file()` collections; `src/lib/content.ts` getters, including `getSite()` which imports `content/site.json` and parses it with `siteSchema`. `tests/unit/content.test.ts` with every cross-file check in §3.1.
  - [x] Removing a required field from `projects.json` fails `npm run validate:content` with a readable message (try it, then revert).
  - [x] Removing a required field from `site.json` fails `npm test`.
  - Notes: `schemas.ts` is §3.1 verbatim plus exported `z.infer` types. Astro 7 bundles Zod 4, where `z.string().email()`/`.url()` are deprecated aliases of `z.email()`/`z.url()` but still work; kept as specified. `content.config.ts` imports schemas relatively (`./lib/schemas`). Getters return plain data in file order; `getSite()` parses once and caches. `tests/unit/content.test.ts` parses all five files with the real schemas and runs every §3.1 cross-file check (it replaces the P0-02 sample test). Verified by breaking files: no `title` in a project → `astro sync` prints `projects → volkswagen-group-portal … title: Required`; no `name` in site.json → `npm test` fails; an unknown cloud id → two cross-file tests fail naming `volkswagen-group-portal → nonexistent-cloud`.
  - Fix (found in P1-07): `getCollection()` returns entries sorted by id, not in file order. The getters restore the JSON array order with `inFileOrder()` (derive.ts), so curated order holds everywhere.

- [x] **P1-05 Derived data** — Deps: P1-04
      `src/lib/derive.ts`, `format.ts`, `filters.ts` per ARCHITECTURE §3.2.
  - [x] 100% line coverage on these files.
  - [x] `sortProjects` keeps featured first, then file order; covered by tests.
  - Notes: URL filters use comma lists (`?cloud=a,b&cap=c`); unknown ids are dropped on parse. `prevNext(projects, id)` sorts internally and does not wrap around. `cloudStats` returns CloudNode-shaped data (label, accent, certifications, projects) and leaves out clouds with neither projects nor certifications. Coverage (v8, 100% lines on the three files) is enforced by `npm test`.

- [x] **P1-06 UI primitives and dev gallery** — Deps: P1-02
      `npx shadcn@latest init` themed to tokens (remove default palette). Add: button, badge, sheet, dialog, input, textarea, select, label, form, tooltip. Astro primitives: `Chip`, `Heading`, `Text`, `Surface`, `Icon` (Lucide). Dev gallery per ARCHITECTURE §4.3. Install `react-hook-form zod @hookform/resolvers lucide-react` if shadcn did not.
  - [x] Each primitive shown in all variants, dark and light, at `/dev/components` in `npm run dev`; route absent from `dist/`.
  - [x] Keyboard focus visible on every interactive primitive.
  - Notes: shadcn 4 (`radix-nova` style, Radix base). Its oklch palette, `.dark` block and Geist font were removed; `global.css` maps the shadcn colour names (`primary`, `popover`, …) to tokens and binds the `dark:` variant to `data-theme`. In this registry `form` is an empty, deprecated item, so `field` was added instead (use it with react-hook-form's `Controller`). Button variants are `brand | neutral | ghost`, sizes `md | lg | icon`; Badge `neutral | accent | success | error`. Focus uses the global `:focus-visible` ring (shadcn's ring classes were removed); fields add accent border + `shadow-glow`. Components import `cn` from `@/lib/utils`, which extends the merger with the token scales — re-point the `cn` import after every `shadcn add`. `Icon` takes a name from `src/lib/icons.ts` (`IconName`); P1-07 extends that registry. `@hookform/resolvers` stays on 5.x: 6.x has an optional `effect@^4` peer that clashes with the shadcn CLI's `effect@3`. The gallery's theme switch (or `?theme=light`) flips the whole page so portalled overlays follow the theme.

- [x] **P1-07 Cloud icons** — Deps: P1-06
      Draw 7 original SVG line icons per DESIGN §8 (24px grid, 1.5px stroke, `currentColor`) in `src/assets/icons/clouds/`.
  - [x] No icon resembles a cloud shape or any Salesforce mark.
  - Notes: files are named by cloud skill id (`sales-cloud.svg` … `membership.svg`) and drawn on Lucide's conventions (round caps and joins) so they sit beside UI icons. `<Icon name="sales-cloud" />` renders them as Astro SVG components (static, no React); `IconName` now covers UI and cloud names, and `Icon` accepts size 32 for CloudCard. `tests/unit/icons.test.ts` enforces one icon per cloud skill and the 24px / 1.5px / `currentColor` / no-raw-colour rules. Shown in each cloud's accent at `/dev/components`.

- [ ] **P1-08 Import rescued images [H]** — Deps: P1-04
      Shawn copies the rescued `assets/projects/` folder (26 PNGs + `_manifest.json`) from the old repo's local checkout into `docs/source-images/`. Convert each to WebP (max 1600px wide, quality 80) into `public/img/{project-id}/` (`cover.webp`, `01.webp`…), mapping old slugs to `projects.json` ids. Use manifest captions for `caption` and write meaningful `alt`. Gallery images are approved (they were public on v1); blur any personal or customer data during conversion.
  - [ ] Every `src` in `projects.json` points to an existing file; a content test fails on a missing file.
  - [ ] `docs/source-images/` is git-ignored or deleted after conversion (originals may contain client data).

## Phase 2 — Shell and pages

- [x] **P2-01 BaseLayout and SEO** — Deps: P1-03, P1-04
      `<head>` per SPEC §4.5 (one default OG image `public/og/default.png`, 1200×630, name + role on the `aurora` preset), JSON-LD `Person`, theme script (ARCHITECTURE §6), skip link, footer with `site.trademarkNotice`. `public/robots.txt` pointing to the sitemap.
  - [x] No axe violations on a blank page using the layout (check with the axe browser extension until P3-04).
  - Notes: titles, descriptions and JSON-LD come from pure functions in `src/lib/seo.ts` (under the 100% coverage gate); UI strings live in `src/i18n/en.json` and are filled with `format()`. `BaseLayout` takes `meta`, optional `jsonLd` and `ogImage` (default `/og/default.png`), and exposes a `nav` slot for P2-02. `public/og/default.png` is a screenshot of the dev-only `/dev/og` route at 1200×630 (remove `astro-dev-toolbar` before capturing); P3-05 can reuse it. Checked with axe-core (WCAG 2.2 AA + best practice): 0 violations at 375/768/1440 in dark and light. The footer copy uses `on-surface-2`: `on-surface-3` fails AA at 12–14px, so later small labels (e.g. SnapshotBar) need ≥ 18px or `on-surface-2` to pass P3-04. Home is still a placeholder (name + role) until its own task.

- [x] **P2-02 Navigation** — Deps: P2-01, P1-06
      `NavRail` (≥ lg) and `MobileNav` sheet (< lg) per SPEC §4.1, DESIGN §9; `ThemeToggle`.
  - [x] Rail proportions match `docs/reference/01-home-once-ui.jpg`.
  - [x] Sheet: focus trap, Esc, overlay click, closes on navigation.
  - [x] Theme persists across reloads without a flash.
  - Notes: all three are `.astro` with small module scripts (logic in `src/lib/{nav,theme,mobile-nav}.ts`, under the coverage gate) instead of React + shadcn Sheet. With React the mobile pages shipped 93.5 KB gz of JS, over the 80 KB budget; now regular pages ship ~0.7 KB gz inline and no React (ARCHITECTURE §4.1). The sheet is a native modal `<dialog>` with an explicit Tab loop (native dialogs let focus escape to the browser UI), closing on Esc, backdrop, link, close button and bfcache restore. `cn()` now uses tables compiled by the `cn` vite plugin into `src/lib/cn-tables.ts` (committed, regenerated on build) instead of bundling the config. LinkedIn and GitHub icons are SVG files (Lucide 1.x dropped brand icons). `/work`, `/skills`, `/about`, `/contact` are stub pages so the nav links pass `check:links`; P2-04/07/08/09 replace them. jsdom has no `<dialog>` API, so tests stub `showModal`/`close`. Checked in Playwright: 0 focus escapes over 50 Tab presses, axe 0 violations at 375/768/1440 in both themes with the sheet open and closed.

- [x] **P2-03 Cards and cloud bento** — Deps: P1-06, P1-05, P1-07
      `CoverCard`, `ProjectCard`, `CloudCard`, `CloudBento` per DESIGN §9 and SPEC §6.3.
  - [x] Whole card is one link and one tab stop; hover and focus states match.
  - [x] `CloudBento` hides clouds with zero projects and zero certifications; Sales Cloud spans 2×2.
  - Notes: covers share a `ui/Cover.astro` primitive (approved image, else the gradient preset; cover text is `aria-hidden` because the card repeats it as a heading). Cards take a `level` prop (default 3) so pages keep the heading outline. Hiding is done by `cloudStats()`; sizing by the pure `withBentoSize()`. The bento is 2 columns below lg and 3 at lg: with today's six clouds, "wide" (2×1) cards tile on mobile but leave holes in 3–4 columns, so they become 1×1 at lg. Cloud names use Orbitron only on the 2×2 card (`text-7`, ≥ 32px); DESIGN §9 says Orbitron `font-size-6`, but that token goes down to 24px, which breaks CLAUDE.md rule 6, so the smaller cards use Space Grotesk. Project chips inside cloud cards truncate on narrow cards (the full list is on `/work?cloud=`). The hover glow is a token (`shadow-cloud-glow`, `color-mix` of the cloud accent at 12%). Checked in Playwright: no horizontal scroll at 375/768/1440, axe 0 violations on the cards in both themes, no focusable element inside any card.

- [ ] **P2-04 Work page with filters** — Deps: P2-03, P1-05
      SPEC §5.2. Grid server-rendered with `data-clouds`/`data-caps`; `WorkFilters` island toggles visibility and syncs the URL.
  - [ ] `/work?cloud=sales-cloud&cap=lwc` loads filtered; back button restores the previous state.
  - [ ] `/work?cap=gearset` adds a "Gearset" chip selected; `/work?cap=nonsense` is ignored.
  - [ ] Count announced by screen reader; empty state works; without JS all projects show.

- [ ] **P2-05 Case study template** — Deps: P2-03, P1-05
      `CaseStudyLayout` + section components per SPEC §5.3 and ARCHITECTURE §3.3; `src/pages/work/[id].astro` with `getStaticPaths` for all projects; `depth: "card"` variant; Lightbox island.
  - [ ] Sections render only when data exists; unapproved images never render; `value` shows only when `measured: true`.
  - [ ] Lightbox keyboard-operable (arrows, Esc, focus returns).

- [ ] **P2-06 Home (without 3D)** — Deps: P2-03, P1-05
      Hero, featured row, marquee, certifications strip, CTA band (SPEC §5.1). Constellation slot shows `CloudBento`.
  - [ ] LCP is the hero text; page fully usable without JS.

- [ ] **P2-07 Skills page** — Deps: P2-03, P1-05
      SPEC §5.4 with `CloudBento`, groups from `site.skillGroups`, derived counts, certifications, languages.
  - [ ] Every chip with count > 0 links to the right filtered Work URL.

- [ ] **P2-08 About page** — Deps: P2-01, P1-05
      SPEC §5.5: bio, principles, companies row with project chips, resume button.
  - [ ] No dates rendered anywhere on the page; works without JS.

- [ ] **P2-09 Contact page** — Deps: P1-06
      SPEC §5.6 `ContactForm` island with zod schema, honeypot, Web3Forms POST, all four states, empty-key fallback.
  - [ ] Tests cover validation errors, success, network error with retry, and the empty-key fallback.
  - [ ] Works with keyboard and screen reader (errors announced).

- [ ] **P2-10 404 page** — Deps: P2-01
      From `site.notFound`. GitHub Pages serves `dist/404.html` automatically.

## Phase 3 — Signature visuals and launch

- [ ] **P3-01 Cloud constellation** — Deps: P2-06, P0-04
      SPEC §6 desktop interaction, accessible node list, side panel, fallback swap.
  - [ ] All acceptance items in SPEC §6.3 pass.

- [ ] **P3-02 Hero data core (optional)** — Deps: P3-01
      Only if P3-01 leaves room in the performance budget.

- [ ] **P3-03 Motion pass** — Deps: P2-06
      Install `gsap`. `Reveal` wrapper, hero SplitText, card hovers; one reduced-motion helper in `src/lib/motion.ts`.
  - [ ] With reduced motion on, nothing animates (DevTools → Rendering → emulate).

- [ ] **P3-04 E2E, accessibility and Lighthouse CI** — Deps: P2-10
      Install `-D @playwright/test @axe-core/playwright @lhci/cli`. Add `test:a11y`. Smoke + axe for every route in both themes; Lighthouse CI on Home, Work and one case study (all categories ≥ 95). Second workflow `.github/workflows/quality.yml` on pull requests.
  - [ ] The workflow blocks merge on failure.

- [ ] **P3-05 OG images** — Deps: P2-01
      1200×630 per page and case study at `public/og/{route}.png` (static template or build-time generation); `BaseLayout` picks the page image, falling back to `default.png`.

- [ ] **P3-06 Content enrichment (optional, not a launch blocker)**
      When Shawn adds briefs in `docs/briefs/`, turn them into decisions, team size and takeaways in `content/projects.json`. Draw the Lavoro Agro architecture as a simple SVG from its architecture section.

- [ ] **P3-07 Launch** — Deps: all above
      Final review at 375/768/1440 in both themes, external link check, merge `rebuild` → `main`, verify live.

## Phase 4 — Languages (EN, PT, ES)

Per ADR 0003. Starts after the English MVP pages; the English site may launch before it.

- [ ] **P4-01 Locale routing** — Deps: P3-07
      Astro i18n with `en`, `pt`, `es` and `prefixDefaultLocale: true`; pages move under `src/pages/[locale]/`. Root `/` redirect page (stored choice → `navigator.languages` → `en`, no-JS links and meta refresh). Redirect pages for the old unprefixed English URLs. `nav.ts` and `isActive` become locale-aware.
  - [ ] Every route builds for all three locales and `check:links` passes.
  - [ ] `/` sends a `pt-BR` browser to `/pt/` and an unknown language to `/en/`.

- [ ] **P4-02 Locale-aware strings and content** — Deps: P4-01
      `src/i18n/{en,pt,es}.json` and `content/{en,pt,es}/*.json`; components receive `locale` instead of importing `en.json`. A parity test fails when keys or ids differ between locales. Locales carry a review flag; unreviewed locales are not built in production.
  - [ ] Parity test passes; an unreviewed locale is absent from `dist/`.

- [ ] **P4-03 Draft translations** — Deps: P4-02
      Draft `pt` (Brazilian) and `es` (Latin American) from the English files without adding facts; cloud, product and company names unchanged. Hand over for Shawn's review.
  - [ ] Shawn approves each locale (sets its review flag).

- [ ] **P4-04 Language switcher and SEO** — Deps: P4-02
      Switcher in `NavRail` and `MobileNav` that keeps the current page and stores the choice. `<html lang>`, `hreflang` alternates with `x-default`, localised meta and OG text, per-locale sitemap entries.
  - [ ] Switching language keeps the page; axe 0 violations in all three locales.

## Post-MVP (not now)

- Notes/blog.
- LWC lab page showing a live LWC OSS component.
- Membership products deep-dive (Nimble AMS, Fonteva) once briefs exist.
