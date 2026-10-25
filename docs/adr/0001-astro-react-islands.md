# ADR 0001 — Astro with React islands for the portfolio

- Status: Accepted
- Date: 2026-10-24
- Deciders: Shawn Kawabe

## Context

The portfolio must be hosted free on GitHub Pages (static files only), be easy to maintain by editing data files, and include a modern, futuristic UI with 3D scenes, motion and a contact form. Most of the code will be written by a Code Agent (Claude Code).

The previous version was two Lightning Web Components (`portfolioHeader`, `portfolioContent`) built for a Salesforce Experience Cloud LWR site, with hard-coded data and images hosted on a Developer Edition org.

## Options considered

| Option | For | Against |
| --- | --- | --- |
| **A. LWC OSS + LWR static build** | Reuses LWC skills and code; showcases the Salesforce front-end stack | Small ecosystem for 3D, forms and accessible primitives; static build on Pages needed a spike; fewer agent-oriented skills |
| **B. Astro + React islands** (chosen) | Static HTML by default; JS only where needed; React Three Fiber, GSAP, shadcn/ui, react-hook-form available; official GitHub Pages action; Claude front-end skills target React + Tailwind + shadcn | Not the Salesforce stack; two component syntaxes (`.astro`, `.tsx`) |
| **C. Fork Magic Portfolio (Next.js)** | Closest visual match to references out of the box | Static export loses `next/og` image generation and server features; ships more JS; heavier to restyle |

## Decision

Option B: Astro 6 static output with React 19 islands, Tailwind CSS 4, shadcn/ui, React Three Fiber, GSAP. Content in JSON validated by zod. Deployed by `withastro/action` to GitHub Pages.

## Consequences

- Salesforce expertise is shown through content (case studies, clouds, certifications), not the site framework. A post-MVP "LWC lab" page may demo a live LWC OSS component.
- Islands must stay small; non-interactive components are `.astro`.
- Two syntaxes to learn; mitigated by CLAUDE.md rules on when to use each.

## Validation

To be filled by backlog task P0-04 (3D island spike): bundle sizes, Lighthouse score, notes.
