# Backlog

Work top-down. One task per PR into the `rebuild` branch (or one PR per phase from `rebuild` to `main`, if you prefer). Tick the box when its acceptance criteria are met and `npm run ci` is green. Add notes under a task instead of editing its criteria; if criteria are wrong, ask.

Legend: **[H]** needs Shawn (content or decision) · **Deps** = tasks that must be done first.

---

## Phase 0 — Foundation and spike

- [x] **P0-01 Scaffold the project**
  Repo `shawnkawabe/shawnkawabe.github.io`, new branch `rebuild` from `main`. Delete `index.html`, `styles/`, `.vscode/settings.json`. Keep `LICENSE` (update year) and replace `README.md` with the one from this doc pack. Copy into the repo root: `CLAUDE.md`, `CONTENT.md`, `docs/`, `content/`, `tokens/`.
  Scaffold Astro 6 into the existing folder with the `with-tailwindcss` template, add React (`npx astro add react`) and sitemap (`npx astro add sitemap`). TypeScript strict, `"@/*"` → `"src/*"`. `.nvmrc` = `24`. `astro.config.mjs`: `site: 'https://shawnkawabe.github.io'`, `output: 'static'`, no `base`. `.gitignore` and `.env.example` per ARCHITECTURE §8.4 / §2.
  - [x] `npm run dev` serves `/`; `npm run build` outputs `dist/`.
  - [x] Doc pack files present at the paths above; old placeholder files gone.
  - Notes: `create-astro` now ships Astro 7.4; pinned `astro@^6.4.8` per ADR 0001. Astro 6 runs on Vite 7, so `@astrojs/react` is pinned to `^5` (6.x+ targets Vite 8) and `package.json` has `"overrides": { "vite": "^7.3.2" }` to stop `@tailwindcss/vite` resolving a second Vite (build failed with `Missing field tsconfigPaths`). Remove the override when moving to Astro 7. Template extras dropped: MDX, canvas-confetti, sample Button/markdown page. `npm run ci` not available until P0-02.

- [ ] **P0-02 Tooling** — Deps: P0-01
  Install dev deps: `@astrojs/check typescript eslint typescript-eslint eslint-plugin-astro eslint-plugin-jsx-a11y prettier prettier-plugin-astro prettier-plugin-tailwindcss vitest @testing-library/react @testing-library/jest-dom jsdom linkinator husky lint-staged`. ESLint 9 flat config, Prettier config, Vitest config (jsdom for islands). Scripts exactly as ARCHITECTURE §8.1, with the `tokens` stub. `npx husky init`; pre-commit runs `npx lint-staged` on `*.{astro,ts,tsx,js,mjs,css,json,md}`.
  - [ ] `npm run lint`, `npm test` (one sample test) and `npm run ci` all succeed.
  - [ ] A commit with a mis-formatted file gets formatted by the hook.

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
