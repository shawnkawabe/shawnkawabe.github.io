# ADR 0001 — Astro with React islands for the portfolio

- Status: Accepted
- Date: 2026-10-24
- Deciders: Shawn Kawabe

## Context

The portfolio must be hosted free on GitHub Pages (static files only), be easy to maintain by editing data files, and include a modern, futuristic UI with 3D scenes, motion and a contact form. Most of the code will be written by a Code Agent (Claude Code).

The previous version was two Lightning Web Components (`portfolioHeader`, `portfolioContent`) built for a Salesforce Experience Cloud LWR site, with hard-coded data and images hosted on a Developer Edition org.

## Options considered

| Option                                | For                                                                                                                                                                                                 | Against                                                                                                                    |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **A. LWC OSS + LWR static build**     | Reuses LWC skills and code; showcases the Salesforce front-end stack                                                                                                                                | Small ecosystem for 3D, forms and accessible primitives; static build on Pages needed a spike; fewer agent-oriented skills |
| **B. Astro + React islands** (chosen) | Static HTML by default; JS only where needed; React Three Fiber, GSAP, shadcn/ui, react-hook-form available; official GitHub Pages action; Claude front-end skills target React + Tailwind + shadcn | Not the Salesforce stack; two component syntaxes (`.astro`, `.tsx`)                                                        |
| **C. Fork Magic Portfolio (Next.js)** | Closest visual match to references out of the box                                                                                                                                                   | Static export loses `next/og` image generation and server features; ships more JS; heavier to restyle                      |

## Decision

Option B: Astro 6 static output with React 19 islands, Tailwind CSS 4, shadcn/ui, React Three Fiber, GSAP. Content in JSON validated by zod. Deployed by `withastro/action` to GitHub Pages.

## Consequences

- Salesforce expertise is shown through content (case studies, clouds, certifications), not the site framework. A post-MVP "LWC lab" page may demo a live LWC OSS component.
- Islands must stay small; non-interactive components are `.astro`.
- Two syntaxes to learn; mitigated by CLAUDE.md rules on when to use each.

## Validation

P0-04 spike, 2026-10-25. Astro 6.4.8, React 19.3.1, three 0.186.1, @react-three/fiber 9.8.2, @react-three/drei 10.7.9 (installed, not used by the spike). Measured on `astro preview` (local), Lighthouse 12.8.2 CLI, mobile preset (simulated Slow 4G, 4× CPU), three runs each.

**Island structure.** A small shell island (`client:visible`) renders the gradient poster, then checks `prefers-reduced-motion` and WebGL2 and only then `React.lazy`-imports the canvas component. So three.js and R3F are downloaded only when the scene will actually render.

**Bundle sizes (gzipped).**

| Chunk                                        | Size     | Loaded when                              |
| -------------------------------------------- | -------- | ---------------------------------------- |
| Shell island                                 | 1.4 KB   | island nears viewport                    |
| React + Astro React renderer (`client.*.js`) | 65.5 KB  | first island on the page (shared by all) |
| Canvas (three + R3F + scene)                 | 247.4 KB | motion allowed and WebGL2 available      |

The 3D scene uses about 25% of its 1 MB budget. React's 65.5 KB counts toward the 80 KB non-3D JS budget on any page with an island.

**Lazy loading (Playwright, 412×823).** Before scrolling, no `/_astro/*.js` is requested; Astro's island loader is inline. After scrolling to the scene, the shell, renderer and canvas chunks load and a 348×348 canvas renders. With `prefers-reduced-motion: reduce`, the poster stays, no canvas is created and the canvas chunk is never requested.

**Lighthouse mobile.**

| Page variant                                   | Perf | A11y | BP  | SEO | FCP  | LCP      | TBT      | CLS   |
| ---------------------------------------------- | ---- | ---- | --- | --- | ---- | -------- | -------- | ----- |
| Scene below the fold (as specified)            | 100  | 100  | 100 | 100 | 0.8s | 0.8–0.9s | 0 ms     | 0     |
| Scene in the hero, above the fold (worst case) | 100  | —    | —   | —   | 0.8s | 0.8s     | 10–20 ms | 0.028 |

**Conclusions.**

- The planned fallback (drop the hero scene for a gradient) is not needed: even a hero scene loaded during first paint keeps performance at 100. P3-02 stays optional on design grounds, not performance.
- Use the shell + lazy canvas pattern for `CloudConstellation` and `DataCoreScene`: it gives reduced-motion and no-WebGL users zero 3D bytes for free.
- Re-measure on the live GitHub Pages URL after P0-03; local preview has no real network latency, although Lighthouse simulates it.
- The 0.028 CLS on the hero variant came from unstyled system-font text; recheck after P1-03 fonts (target < 0.05).
- three 0.186 logs `THREE.Clock: This module has been deprecated` from inside R3F 9.8; harmless, fixed upstream when R3F moves to `THREE.Timer`.
- Frame loop is set to `'never'` when the canvas is off-screen (IntersectionObserver) or the tab is hidden, and DPR is capped with `dpr={[1, 2]}`.
