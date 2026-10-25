# shawnkawabe.github.io

Portfolio of **Shawn Kawabe**, Senior Salesforce Developer and Functional Specialist — projects, clouds, certifications and case studies.

Live: https://shawnkawabe.github.io

## Stack

Astro 6 (static) · React 19 islands · Tailwind CSS 4 · shadcn/ui · React Three Fiber · GSAP · design tokens (DTCG → Style Dictionary) · GitHub Pages via GitHub Actions.

## Getting started

```bash
nvm use            # or: fnm use   (Node 24, from .nvmrc)
npm install
npm run dev        # http://localhost:4321
```

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run tokens` | Build `src/styles/tokens.css` from `tokens/` |
| `npm run build` | Tokens + type check + static build to `dist/` |
| `npm run preview` | Serve `dist/` |
| `npm run lint` | ESLint + Prettier check |
| `npm test` | Unit and component tests |
| `npm run test:a11y` | Playwright + axe on built pages (from P3-04) |
| `npm run validate:content` | Validate content collections (`astro sync`) |
| `npm run check:links` | Check internal links in `dist/` |
| `npm run ci` | lint → validate:content → test → build → check:links |

## Docs

| Doc | For |
| --- | --- |
| [CLAUDE.md](CLAUDE.md) | Rules and workflow for the Code Agent (and humans) |
| [CONTENT.md](CONTENT.md) | Adding and editing projects, skills, experience |
| [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) | Pages, sections, behaviour, acceptance criteria |
| [docs/DESIGN.md](docs/DESIGN.md) | Design system: tokens, type, motion, 3D, components |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Folders, data flow, components, testing, CI |
| [docs/BACKLOG.md](docs/BACKLOG.md) | Ordered build tasks |
| [docs/adr/](docs/adr/) | Decision records |

## Deploy

Push to `main`. The `Deploy to GitHub Pages` workflow runs all checks, builds, and publishes. A failed check stops the deploy; the live site stays on the last good build.

## Licence

Code: MIT (see `LICENSE`). Content, text and images © Shawn Kawabe, all rights reserved. Salesforce and its product names are trademarks of Salesforce, Inc.; this site is not affiliated with or endorsed by Salesforce.
