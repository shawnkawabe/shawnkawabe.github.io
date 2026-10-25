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
  | `src/i18n/`                          | P2-01 (`en.json`)                                                   |
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
  - `import { z } from 'astro/zod'` resolves in Astro 6.4 (P1-04).
  - `actions/checkout@v7`, `withastro/action@v6`, `actions/deploy-pages@v5` tags exist (P0-03).
  - Fontsource variable packages exist for all four fonts, including Orbitron, v5.3.0 (P1-03).
  - `style-dictionary@5` is 5.7.1 (P1-01).
  - `@react-three/fiber@9` (9.8.2) requires `react` and `react-dom` `>=19 <19.4`; installed React is 19.3.1. **Dependabot's minor group will try to raise React to 19.4 and break R3F** — hold React below 19.4 until R3F allows it (P0-03 dependabot config or P0-04).
  - Stack drift already handled in P0-01: Astro 6 + Vite 7 + `@astrojs/react@5` + `overrides.vite`.

- [ ] **PRE-06 GitHub repository settings [H]** — Blocks: P0-03
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

- [ ] **P0-03 Deploy pipeline** — Deps: P0-02
      `.github/workflows/deploy.yml` and `.github/dependabot.yml` exactly as ARCHITECTURE §8.2–8.3. **[H]** Shawn sets Pages source to GitHub Actions and adds the repository variable `PUBLIC_WEB3FORMS_KEY` (may stay empty for now).
  - [ ] PR runs the build job only; merge to `main` deploys; the live URL shows the scaffold.

- [ ] **P0-04 3D spike** — Deps: P0-01
      Install `three @react-three/fiber@9 @react-three/drei@10` and `-D @types/three`. On a temporary page, render a rotating icosahedron as a `client:visible` island below the fold, with a gradient poster and a reduced-motion fallback.
  - [ ] Island JS requested only after scrolling near it (verify in Network tab).
  - [ ] Lighthouse mobile performance ≥ 95 on that page.
  - [ ] Results written in `docs/adr/0001-astro-react-islands.md` → "Validation"; temporary page deleted.

## Phase 1 — Design system and content layer

- [ ] **P1-01 Tokens pipeline** — Deps: P0-02
      Install `-D style-dictionary@5`. `style-dictionary.config.js` reading `tokens/*.tokens.json` and writing `src/styles/tokens.css`: primitives + dark semantic on `:root`, light semantic on `[data-theme="light"]`, prefix `pf-g`, names per DESIGN §2 table. Replace the `tokens` stub with the real script.
  - [ ] Every semantic colour in DESIGN §3.1, every cloud accent in §3.2, every spacing/radius/shadow/duration/easing in §5–6 exists as the CSS variable named in DESIGN §2. (`shadow-glow` and cover gradients are not tokens.)
  - [ ] Font sizes stored as `min`/`max` pairs emit one `clamp()` variable each (custom transform, 375px → 1440px).
  - [ ] Colours use the DTCG 2025.10 object format already in `tokens/`; output as hex, or `rgb(r g b / a)` when alpha < 1.
  - [ ] Output starts with a "generated, do not edit" header; file is git-ignored; `predev` and `build` regenerate it.

- [ ] **P1-02 Tailwind mapping and base styles** — Deps: P1-01
      `global.css` with `@theme` mapping (colours, fonts, radii, shadows, spacing; literal breakpoints), base element styles, focus ring. `covers.css` with the four presets matched to `docs/reference/cover-*.jpg`.
  - [ ] Cover presets visually match references side by side (screenshots in the PR).
  - [ ] `npm run tokens && npm run build` produces no raw hex outside `tokens.css` and `covers.css` (grep check added to `lint`).

- [ ] **P1-03 Fonts** — Deps: P1-02
      Install `@fontsource-variable/inter @fontsource-variable/space-grotesk @fontsource-variable/jetbrains-mono @fontsource-variable/orbitron` (check exact package names on fontsource.org; fall back to the static `@fontsource/orbitron` if no variable package exists). Preload Space Grotesk and Inter WOFF2 (Latin). Family names in tokens must match the CSS family names Fontsource registers; adjust `tokens/base.tokens.json` if they differ.
  - [ ] No visible layout shift from font swap above the fold (CLS < 0.05).

- [ ] **P1-04 Content layer** — Deps: P0-02
      `src/lib/schemas.ts` exactly per ARCHITECTURE §3.1; `src/content.config.ts` with four `file()` collections; `src/lib/content.ts` getters, including `getSite()` which imports `content/site.json` and parses it with `siteSchema`. `tests/unit/content.test.ts` with every cross-file check in §3.1.
  - [ ] Removing a required field from `projects.json` fails `npm run validate:content` with a readable message (try it, then revert).
  - [ ] Removing a required field from `site.json` fails `npm test`.

- [ ] **P1-05 Derived data** — Deps: P1-04
      `src/lib/derive.ts`, `format.ts`, `filters.ts` per ARCHITECTURE §3.2.
  - [ ] 100% line coverage on these files.
  - [ ] `sortProjects` keeps featured first, then file order; covered by tests.

- [ ] **P1-06 UI primitives and dev gallery** — Deps: P1-02
      `npx shadcn@latest init` themed to tokens (remove default palette). Add: button, badge, sheet, dialog, input, textarea, select, label, form, tooltip. Astro primitives: `Chip`, `Heading`, `Text`, `Surface`, `Icon` (Lucide). Dev gallery per ARCHITECTURE §4.3. Install `react-hook-form zod @hookform/resolvers lucide-react` if shadcn did not.
  - [ ] Each primitive shown in all variants, dark and light, at `/dev/components` in `npm run dev`; route absent from `dist/`.
  - [ ] Keyboard focus visible on every interactive primitive.

- [ ] **P1-07 Cloud icons** — Deps: P1-06
      Draw 7 original SVG line icons per DESIGN §8 (24px grid, 1.5px stroke, `currentColor`) in `src/assets/icons/clouds/`.
  - [ ] No icon resembles a cloud shape or any Salesforce mark.

- [ ] **P1-08 Import rescued images [H]** — Deps: P1-04
      Shawn copies the rescued `assets/projects/` folder (26 PNGs + `_manifest.json`) from the old repo's local checkout into `docs/source-images/`. Convert each to WebP (max 1600px wide, quality 80) into `public/img/{project-id}/` (`cover.webp`, `01.webp`…), mapping old slugs to `projects.json` ids. Use manifest captions for `caption` and write meaningful `alt`. Gallery images are approved (they were public on v1); blur any personal or customer data during conversion.
  - [ ] Every `src` in `projects.json` points to an existing file; a content test fails on a missing file.
  - [ ] `docs/source-images/` is git-ignored or deleted after conversion (originals may contain client data).

## Phase 2 — Shell and pages

- [ ] **P2-01 BaseLayout and SEO** — Deps: P1-03, P1-04
      `<head>` per SPEC §4.5 (one default OG image `public/og/default.png`, 1200×630, name + role on the `aurora` preset), JSON-LD `Person`, theme script (ARCHITECTURE §6), skip link, footer with `site.trademarkNotice`. `public/robots.txt` pointing to the sitemap.
  - [ ] No axe violations on a blank page using the layout (check with the axe browser extension until P3-04).

- [ ] **P2-02 Navigation** — Deps: P2-01, P1-06
      `NavRail` (≥ lg) and `MobileNav` sheet (< lg) per SPEC §4.1, DESIGN §9; `ThemeToggle`.
  - [ ] Rail proportions match `docs/reference/01-home-once-ui.jpg`.
  - [ ] Sheet: focus trap, Esc, overlay click, closes on navigation.
  - [ ] Theme persists across reloads without a flash.

- [ ] **P2-03 Cards and cloud bento** — Deps: P1-06, P1-05, P1-07
      `CoverCard`, `ProjectCard`, `CloudCard`, `CloudBento` per DESIGN §9 and SPEC §6.3.
  - [ ] Whole card is one link and one tab stop; hover and focus states match.
  - [ ] `CloudBento` hides clouds with zero projects and zero certifications; Sales Cloud spans 2×2.

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

## Post-MVP (not now)

- Portuguese version (`/pt/`), i18n routing.
- Notes/blog.
- LWC lab page showing a live LWC OSS component.
- Membership products deep-dive (Nimble AMS, Fonteva) once briefs exist.
