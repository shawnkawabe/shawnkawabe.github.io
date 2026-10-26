# CLAUDE.md — Shawn Kawabe Portfolio

You are building the personal portfolio of **Shawn Kawabe, Senior Salesforce Developer and Functional Specialist**, published at `https://shawnkawabe.github.io` (GitHub Pages user site, served from the domain root).

**Repository:** `shawnkawabe/shawnkawabe.github.io`. Work on branch `rebuild`, merge to `main` to deploy. Today the repo holds only a placeholder (`index.html`, `styles/index.css`, `.vscode/settings.json`, `README.md`, `LICENSE`). The previous Salesforce LWC version lives in the private repo `shawnkawabe/portfolio`; use it only as reference for old project text, never copy its code or images.

Read this file at the start of every session. Read the linked docs before working in their area.

| When you are working on…           | Read first                                                |
| ---------------------------------- | --------------------------------------------------------- |
| Any page or section                | `docs/PRODUCT_SPEC.md`                                    |
| Colours, type, spacing, motion, 3D | `docs/DESIGN.md`                                          |
| Folders, components, data flow, CI | `docs/ARCHITECTURE.md`                                    |
| Projects, skills, experience text  | `CONTENT.md` and `content/*.json`                         |
| What to do next                    | `docs/BACKLOG.md` (work top-down, one task at a time)     |
| Why something is the way it is     | `docs/adr/`                                               |
| What it should look like           | `docs/reference/` (Once UI / Magic Portfolio screenshots) |

---

## 1. Design brief

- **Audience:** Salesforce hiring managers, tech recruiters, consultancy partners. They scan for 30 seconds: what he does, which clouds, what changed because of his work.
- **Direction:** dark by default, precise, calm, futuristic. Layout language from Once UI's Magic Portfolio (floating vertical nav rail, big gradient cover cards, generous whitespace). Futuristic accents come from type, glow and depth, never from clutter.
- **One aesthetic risk:** the 3D "cloud constellation" on Home. Everything else is restrained.
- **Tone of copy:** first person, plain, specific. Numbers only when measured.

## 2. Stack (fixed — see ADR 0001)

| Layer               | Choice                                                  | Version            |
| ------------------- | ------------------------------------------------------- | ------------------ |
| Runtime             | Node.js                                                 | 24 LTS (`.nvmrc`)  |
| Site framework      | Astro, static output                                    | 7.x                |
| Interactive islands | React                                                   | 19.x               |
| Styling             | Tailwind CSS mapped to design tokens                    | 4.x                |
| UI primitives       | shadcn/ui (source copied into `src/components/ui`)      | latest CLI         |
| 3D                  | three + @react-three/fiber + @react-three/drei          | R3F 9.x, drei 10.x |
| Motion              | CSS transitions + IntersectionObserver (ADR 0005)       | —                  |
| Forms               | zod (`zod/mini`) + React state, to Web3Forms (ADR 0004) | —                  |
| Tokens              | DTCG 2025.10 JSON → Style Dictionary                    | SD 5.x             |
| Tests               | Vitest + Testing Library; Playwright + axe for pages    | —                  |
| Package manager     | npm (lockfile committed)                                | —                  |

Do not add another UI kit, CSS framework, state library or animation library without an ADR.

## 3. Commands

```bash
npm run dev              # local dev server
npm run tokens           # tokens/*.tokens.json -> src/styles/tokens.css
npm run build            # tokens + astro check + astro build
npm run lint             # eslint + prettier --check
npm test                 # vitest
npm run test:a11y        # playwright + axe on built pages (added in P3-04)
npm run validate:content # astro sync: zod schemas validate content/*.json
npm run check:links      # linkinator on dist/
npm run ci               # lint → validate:content → test → build → check:links
```

Run `npm run ci` before you say a task is done.

## 4. Hard rules

### Content

1. **All visible text about Shawn comes from `content/*.json`.** Never hard-code project names, dates, clouds, metrics or bio text in components.
2. **Never invent facts.** If a field is empty or marked `"TODO"`, render nothing for it (or a neutral placeholder in dev only) and list it in your task summary.
3. **Metrics:** only render an outcome's number when `"measured": true`.
   3a. **No dates on the site.** The portfolio is a project showcase; the resume holds the career history. Never render or add dates for projects, companies or certifications. Order is curated: featured first, then file order.
4. **Client screenshots:** only render images whose `"approved": true`.

### Design

5. **Use tokens only.** No raw hex, rgb, px font sizes or ad-hoc shadows in components. Use Tailwind classes mapped to `--pf-g-*` variables, or the variables directly.
6. **Fonts:** Space Grotesk (headings), Inter (body/UI), JetBrains Mono (labels, code, data), Orbitron (hero name and cloud names only, ≥ 32px, never in sentences).
7. **Banned:** percentage skill bars, emoji as icons, purple-to-pink default gradients, glassmorphism on body text, autoplay audio, carousels that auto-advance, more than two 3D scenes per page.
8. **Salesforce trademarks:** never draw, trace or imitate Salesforce or cloud logos. Product names appear as text. Shawn's name is always the most prominent brand. Footer carries the trademark notice from `content/site.json`.

### Engineering

9. **Static first.** Pages and non-interactive components are `.astro`. Use a React island only for: nav sheet, theme toggle, filter bar, gallery lightbox, 3D scenes, contact form. Hydrate with the cheapest directive that works (`client:visible` > `client:idle` > `client:load`).
10. **3D budget:** lazy-load on visibility, poster first, ≤ 1 MB per scene, DPR capped at 2, render loop paused off-screen, disposed on unmount, static fallback when `prefers-reduced-motion` or WebGL is unavailable.
11. **Accessibility:** WCAG 2.2 AA. Every interactive element keyboard-operable with a visible focus ring. Every image has meaningful `alt` (or `alt=""` if decorative). Headings in order. Respect `prefers-reduced-motion` and `prefers-color-scheme`.
12. **Every new component ships with:** a usage example in the dev gallery (`src/dev/components.astro`, injected only in dev — see ARCHITECTURE §4.3), no lint errors, and a test: React islands with Testing Library; `.astro` components that branch on data (show/hide, counts, formatting) with Astro's Container API in Vitest. Purely presentational `.astro` components need no test.
13. **No secrets in the repo.** The Web3Forms key is public by design and lives in `PUBLIC_WEB3FORMS_KEY`.
14. **Small commits**, conventional messages (`feat:`, `fix:`, `docs:`, `chore:`, `test:`), one backlog task per PR.

## 5. How to work

1. Pick the top unchecked task in `docs/BACKLOG.md`. Restate its acceptance criteria before writing code.
2. If the task touches UI, decide the visual approach against `docs/DESIGN.md` and `docs/reference/` first; state it in two or three lines.
3. Build the smallest version, run `npm run dev`, take a screenshot at 375px, 768px and 1440px, compare with the reference, iterate.
4. Run `npm run ci`. Fix everything it reports.
5. Tick the task in `docs/BACKLOG.md`, note anything left open under it, and summarise: what changed, what to check, open questions.

When a request conflicts with these rules, stop and ask. When the docs are silent, choose the simplest option consistent with them and record it in your summary.

## 6. Decisions already made

All planning questions are settled in `docs/briefs/OPEN_QUESTIONS.md` (decisions log): no dates, employers per project, email, LinkedIn, metrics, screenshot approval, optional case-study depth, post-MVP membership products. Follow it; do not reopen those questions. New facts about Shawn's work still come only from Shawn (briefs) — never invent them.
