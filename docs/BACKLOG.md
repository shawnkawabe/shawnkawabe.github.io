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

- [x] **P2-04 Work page with filters** — Deps: P2-03, P1-05
      SPEC §5.2. Grid server-rendered with `data-clouds`/`data-caps`; `WorkFilters` island toggles visibility and syncs the URL.
  - [x] `/work?cloud=sales-cloud&cap=lwc` loads filtered; back button restores the previous state.
  - [x] `/work?cap=gearset` adds a "Gearset" chip selected; `/work?cap=nonsense` is ignored.
  - [x] Count announced by screen reader; empty state works; without JS all projects show.
  - Notes: chips are toggle buttons (`aria-pressed`) in labelled groups; each chip shows its project count and reads "Sales Cloud, 7". Every chip click pushes a history entry, and `popstate` re-reads the URL. `cap` accepts any non-cloud skill id (so `cap=sales-cloud` is ignored); extra chips stay in the bar for the visit once added. The bar sits in a `[data-js-only]` section that BaseLayout hides with a `<noscript>` style, so there is no layout shift with JS and no dead controls without it. Clear in the empty state moves focus to the bar's Clear button, because the empty state disappears with it. The island uses plain buttons with fixed classes instead of `ui/button` (Radix Slot + `cn()` tables cost ~10 KB gz): /work ships ~71 KB gz of JS, React included, under the 80 KB budget. `src/pages/work/[id].astro` is a title-only stub so card links pass `check:links`; P2-05 replaces it. `WorkFiltersProps` gains `gridId` and `FacetOption.accent` (ARCHITECTURE §4.2). Checked in Playwright: URL load, toggle, Back, `cap=gearset,nonsense&cloud=bogus`, empty state, JS disabled (bar hidden, 12 projects), no horizontal scroll and axe 0 violations at 375/768/1440 in both themes.

- [x] **P2-05 Case study template** — Deps: P2-03, P1-05
      `CaseStudyLayout` + section components per SPEC §5.3 and ARCHITECTURE §3.3; `src/pages/work/[id].astro` with `getStaticPaths` for all projects; `depth: "card"` variant; Lightbox island.
  - [x] Sections render only when data exists; unapproved images never render; `value` shows only when `measured: true`.
  - [x] Lightbox keyboard-operable (arrows, Esc, focus returns).
  - Notes: section choice is the pure `caseStudySections()` (first of each type, empty ones dropped, card depth keeps challenge + outcomes). Images need `approved: true` and the file in `public/`: `projects.json` already approves 4 galleries but `public/img/` is empty until P1-08, so today no case study shows images and they appear on their own once the files land. The lightbox is a native `<dialog>` with a module script (`src/lib/lightbox.ts`, focus loop shared with the mobile menu in `focus-trap.ts`) instead of a React island with shadcn Dialog, so case studies ship no React (ARCHITECTURE §4.1); arrows wrap, Esc and backdrop close, focus returns to the thumbnail of the image last shown. Takeaway and architecture use `SectionBand` (only the background tilts, so text never rotates; tilt clamped to ±2°). The cover shows the client name (`aria-hidden`), with the real title as `h1` above it. SnapshotBar labels use `on-surface-2`, not DESIGN §9's `on-surface-3`, which fails AA at 12px. Added JSON-LD `CreativeWork` per case study (SPEC §4.5). Content to check: `lavoro-agro` is `depth: "card"` but its only text section is `architecture`, which card depth hides, so the page has outcomes and no story; consider `"case-study"` or a `challenge` section. Checked in Playwright: axe 0 violations and no horizontal scroll on case-study and card pages at 375/768/1440; the dev gallery's sample Gallery for the lightbox (open, arrows, wrap, Tab loop, Esc, focus return; axe 0).

- [x] **P2-06 Home (without 3D)** — Deps: P2-03, P1-05
      Hero, featured row, marquee, certifications strip, CTA band (SPEC §5.1). Constellation slot shows `CloudBento`.
  - [x] LCP is the hero text; page fully usable without JS.
  - Notes: all static `.astro`; Home ships only the shared nav/theme scripts plus ~0.2 KB for the marquee pause button. `Hero` takes a `scene` slot over a token-based gradient poster (`.pf-hero-glow`) for the Phase 3 data core; GSAP word reveal is left for the motion task (`Reveal`). Intro `**terms**` go through the pure `emphasisParts()`. Buttons on links use `buttonVariants()` at build time, so no React. The marquee repeats the list once with `aria-hidden` for a seamless −50% loop, pauses on hover and with a "Pause scrolling list" toggle (WCAG 2.2.2), and is a wrapped list under reduced motion; without JS the toggle is hidden and only hover pauses it. Certifications are plain chips because `site.links.credentials` is empty; `Chip` gained `external` (new tab + screen-reader hint) for when it is set. The availability chip wraps on narrow screens. Featured: 4 CoverCards, scroll-snap row below lg, 2-column grid from lg. Checked in Playwright: LCP is the hero intro paragraph, axe 0 violations and no horizontal scroll at 375/768/1440 in both themes, JS disabled (hero, 4 card links, toggle hidden), reduced motion (no animation, copy hidden).

- [x] **P2-07 Skills page** — Deps: P2-03, P1-05
      SPEC §5.4 with `CloudBento`, groups from `site.skillGroups`, derived counts, certifications, languages.
  - [x] Every chip with count > 0 links to the right filtered Work URL.
  - Notes: groups come from the pure `skillGroupChips()` (site order, `cloud=` for the clouds group, `cap=` otherwise; empty groups dropped). Chips read "Apex · 6 projects"; skills with no projects are plain text without a count. The page intro reuses `site.seo.pages.skills.description` (no separate intro field exists). `Chip` gained `wrap` so long labels wrap at 375px (the Home availability chip uses it too). Group headings are plain `h3`s rather than labelled sections, because a "Clouds" group next to the "Clouds" bento section broke axe `landmark-unique`. Checked in Playwright: all 41 linked chips open a Work URL whose result count equals the chip's count; the 17 unlinked skills have no count; axe 0 violations and no horizontal scroll at 375/768/1440 in both themes.

- [x] **P2-08 About page** — Deps: P2-01, P1-05
      SPEC §5.5: bio, principles, companies row with project chips, resume button.
  - [x] No dates rendered anywhere on the page; works without JS.
  - Notes: fully static. `site.photo` is `null`, so the bio takes the full width; when a photo is added it renders only if approved and present in `public/` (same `visibleImage()` rule as case studies). `CompanyList` shows employer, role and project chips linking to case studies, skipping project ids not in `projects.json`; MyVillage has no projects, so it shows without chips. The "Full history" line is a UI string in `en.json` ("The complete career history is in my resume."), not a claim about Shawn. Checked in Playwright: axe 0 violations and no horizontal scroll at 375/768/1440 in both themes; no year or month-date pattern in the page text.

- [x] **P2-09 Contact page** — Deps: P1-06
      SPEC §5.6 `ContactForm` island with zod schema, honeypot, Web3Forms POST, all four states, empty-key fallback.
  - [x] Tests cover validation errors, success, network error with retry, and the empty-key fallback.
  - [x] Works with keyboard and screen reader (errors announced).
  - Notes: with react-hook-form, `/contact` shipped 88.4 KB gz, over the 80 KB budget; ADR 0004 drops it (and `@hookform/resolvers`) for React state + the shared `zod/mini` schema, so the page now ships 76.0 KB gz (measured with a throwaway key at build time). Schema, validation and the POST live in `src/lib/contact.ts` (coverage gate). Errors show on blur and submit, sit in `aria-describedby`, use `role="alert"`, and a failed submit focuses the first invalid field. The honeypot is Web3Forms' `botcheck`; a filled one is dropped silently and reported as sent. On a network or API error the data stays and the button reads "Try again"; the error message carries a `mailto:` fallback. Success replaces the form and takes focus. `ContactFormSection.astro` renders the island only when `PUBLIC_WEB3FORMS_KEY` is set (Container test for both cases). Still needs PRE-07 for the real key; until then the page shows email and LinkedIn only, while `site.contact.intro` still says "Send a message or email me directly". Checked in Playwright with Web3Forms intercepted (dev gallery, fake key): all four states, focus moves, payload shape; axe 0 violations on the form and on `/contact` at 375/768/1440 in both themes.

- [x] **P2-10 404 page** — Deps: P2-01
      From `site.notFound`. GitHub Pages serves `dist/404.html` automatically.
  - Notes: same shell, title and body from `site.notFound`, buttons to Home and Work. `BaseLayout` gained `noindex`, which writes `<meta name="robots" content="noindex">` instead of a canonical link (a 404 has no canonical URL). Checked: `dist/404.html` is built and left out of the sitemap; axe 0 violations at 375/1440 in both themes.

## Phase 3 — Signature visuals and launch

- [x] **P3-01 Cloud constellation** — Deps: P2-06, P0-04
      SPEC §6 desktop interaction, accessible node list, side panel, fallback swap.
  - [x] All acceptance items in SPEC §6.3 pass.
  - Notes: `CloudConstellation` is a shell island wrapping the server-rendered `CloudBento` as `children`; the bento stays when < 1024px, under reduced motion, without WebGL2, with no clouds, and as the Suspense fallback while the lazy `ConstellationCanvas` chunk loads. The island renders a wrapper `<div>` because `client:visible` observes the slot, which is `display: contents` and never intersects. Rules live in `src/lib/constellation.ts` (100% covered). The scene is `aria-hidden`; the HTML node list (`ul` with roving-tabindex buttons; arrows, Home, End) carries every interaction, and hover or focus on either dims the other nodes to 40% and scales the active one 1.15×. The orbit pauses while the pointer is over the canvas; the render loop stops off-screen and in hidden tabs. Colours come from `--pf-g-color-*` and follow `pf-themechange`. `CloudPanel` is a native modal `<dialog>` (25rem, right edge; Esc, backdrop and Close; focus loop; focus returns to the node button) listing certifications, project links and "See projects" (`/work?cloud=`). Measured: 3D chunk 240 KB gzipped, Home eager JS 75.2 KB gzipped (budget 80), no 3D request before the section is within 200px, axe 0 in both themes and under reduced motion, no horizontal scroll on any route at 375/768/1440. `SectionBand` gained `overflow-x-clip` (the tilted Home CTA band added 2px of page overflow). Open: re-check the Lighthouse ≥ 95 performance score when P3-04 adds Lighthouse CI (the P0-04 spike scored 100 with a heavier scene).

- [ ] **P3-02 Hero data core (optional)** — Deps: P3-01
      Only if P3-01 leaves room in the performance budget.
  - Notes: deferred after P3-01 — no room. Home already ships 75.2 KB of the 80 KB eager-JS budget, and a hero scene sits above the fold, so `client:visible` would hydrate at once and pull the 240 KB gzipped three.js chunk into the first load, competing with the LCP element (the hero intro). The token gradient poster (`.pf-hero-glow`) meets SPEC §5 ("or static gradient"). Revisit post-launch with Lighthouse CI numbers from P3-04, e.g. hydrate on `client:idle` after LCP and share the constellation's three chunk.

- [x] **P3-03 Motion pass** — Deps: P2-06
      Install `gsap`. `Reveal` wrapper, hero SplitText, card hovers; one reduced-motion helper in `src/lib/motion.ts`.
  - [x] With reduced motion on, nothing animates (DevTools → Rendering → emulate).
  - Notes: no GSAP (ADR 0005). Core + ScrollTrigger + SplitText measured 48.3 KB gz, which would push Home, `/work` and `/contact` to 119–124 KB against the 80 KB budget. Motion is CSS on the tokens inside `@media (prefers-reduced-motion: no-preference)` (the global reduced-motion rule shortens durations, not delays). `Reveal.astro` (`as` div/section) sets `data-reveal`; `bindReveal()` flags `data-revealed` once per element via one IntersectionObserver, and reveals everything at once under reduced motion or without the observer. Targets hide only when the head script sets `data-motion`, so nothing is hidden without JS. `SplitWords.astro` splits the hero name and role into `.pf-word` spans at build time (30ms stagger; the role continues from the name with `offset`), with an `sr-only` sentence and an `aria-hidden` animated copy. Card hovers were already CSS (P1-06/P2-03). `REDUCED_MOTION_QUERY` moved from `constellation.ts` to `motion.ts`. Home sections use `Reveal`; other pages are static for now. The dev gallery gained Motion and CloudConstellation examples. Measured: Home 74.0 KiB gz (+0.6), other pages unchanged; LCP is still the hero intro (340 ms in dev); axe 0 in both themes; reduced motion: all sections revealed, word animation `none`; JS disabled: every section visible.

- [x] **P3-04 E2E, accessibility and Lighthouse CI** — Deps: P2-10
      Install `-D @playwright/test @axe-core/playwright @lhci/cli`. Add `test:a11y`. Smoke + axe for every route in both themes; Lighthouse CI on Home, Work and one case study (all categories ≥ 95). Second workflow `.github/workflows/quality.yml` on pull requests.
  - [ ] The workflow blocks merge on failure.
  - Notes: `@playwright/test` 1.64 and `@axe-core/playwright` 4.14 are devDependencies. `@lhci/cli` is not: its tree has `npm audit` advisories (puppeteer, `tmp`, `uuid`, `basic-ftp`) and no release since 2025-06, so `quality.yml` runs it pinned through `npx -y @lhci/cli@0.15.1` and the lockfile stays at 0 vulnerabilities (ARCHITECTURE §8.5). Playwright serves the built `dist/` with `astro preview` (port 4322) at 1440px and 375px. Routes come from `dist/sitemap-0.xml`, so new case studies are covered automatically. Smoke covers every route (200, one `h1`, no console errors), the 404 page (status 404, `noindex`) and the nav in both the rail and the mobile sheet. axe covers every route and the 404 page in both themes with reveal sections shown: 110 tests pass locally. Lighthouse medians (mobile, 3 runs): Home 99/100/100/100, `/work/` 97/100/100/100, `/work/brf/` 99/100/100/100 (performance/a11y/best practices/SEO); Home CLS 0.038. This closes P3-01's open Lighthouse check. Open, needs Shawn: in GitHub → Settings → Branches → `main`, add `E2E and accessibility` and `Lighthouse` as required status checks (they appear after the first PR run). Until then the workflow reports but does not block.

- [x] **P3-05 OG images** — Deps: P2-01
      1200×630 per page and case study at `public/og/{route}.png` (static template or build-time generation); `BaseLayout` picks the page image, falling back to `default.png`.
  - Notes: static template plus screenshots, not build-time generation (no new dependency; Playwright is already a devDependency from P3-04). The dev-only `/dev/og/[...route]` renders the card. Default and Home: name + role on `aurora`. Pages (`work`, `skills`, `about`, `contact`): name byline, page title, role, on `aurora`. Case studies: name byline, project title and subtitle, on the project's cover preset. `npm run og` reuses the running dev server (Astro 7 allows one per project) or starts its own, then writes `default.png` plus 16 cards (5.2 MB in total, PNG as SPEC §4.5 says). `ogImageFor()` in `seo.ts` (coverage gate) maps the pathname to `/og/{route}.png`. `BaseLayout` checks at build time that the file exists, so a new project keeps `default.png` until `npm run og` is re-run, as do Home and the 404 page. `og:image:alt` reads "{page title}, {role}" for page cards. Re-run `npm run og` after changing a project title, subtitle or cover. The old `default.png` had the dev toolbar edge at the bottom; the card page now hides the toolbar with CSS.

- [ ] **P3-06 Content enrichment (optional, not a launch blocker)**
      When Shawn adds briefs in `docs/briefs/`, turn them into decisions, team size and takeaways in `content/projects.json`. Draw the Lavoro Agro architecture as a simple SVG from its architecture section.
  - Notes (2026-10-26): the Lavoro Agro diagram is done: `public/img/lavoro-agro/architecture.svg`, drawn only from its architecture text (OPEN_QUESTIONS #12), with dark token values inlined because an `<img>` cannot read page CSS variables, and a full-sentence `alt`. Lavoro Agro is now `"depth": "case-study"`: as a `card` (SPEC §5.3, sections 1, 2, 3, 7, 8, 10) its architecture section, text included, never rendered, which contradicted #12. Checked: axe 0 and no overflow at 1440 (dark) and 375 (light); at 375 the diagram labels are small, so the paragraph above and the `alt` carry the same facts. Still open: no briefs in `docs/briefs/` yet, so decisions, team size and takeaways wait for Shawn.

- [ ] **P3-07 Launch** — Deps: all above
      Final review at 375/768/1440 in both themes, external link check, merge `rebuild` → `main`, verify live.
  - Notes (2026-10-26): pre-launch checks done; merge and live check are Shawn's (the agent may not push or deploy). Review: no horizontal scroll on any route at 768px in both themes (375 and 1440 are covered by `npm run test:a11y`: 110 tests, axe 0). External links: GitHub and the resume (Google Drive) return 200; LinkedIn returns 999 to any non-browser client (expected); the email matches OPEN_QUESTIONS #3. Absolute `shawnkawabe.github.io` URLs (canonical, OG) 404 until the deploy, as expected. Left for Shawn: open a PR `rebuild` → `main`, let `deploy.yml` and `quality.yml` pass, merge, then check the live URL and the Lighthouse numbers on it.

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
