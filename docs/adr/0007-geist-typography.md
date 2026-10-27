# ADR 0007 — Geist Sans and Geist Mono replace the four-family stack

- Status: Accepted
- Date: 2026-10-26
- Deciders: Shawn Kawabe (approved the L-11 recommendations on 2026-10-26)

## Context

The site shipped four families: Orbitron (hero name, cloud names), Space Grotesk (headings), Inter
(body) and JetBrains Mono (labels). Shawn asked for typography that reads as more professional and
compliant (`docs/BACKLOG-LANDING.md` L-11). Orbitron reads as a sci-fi template, and four families
mean four font downloads and four voices on one page. Mono labels at 12px with +0.04em tracking were
also hard to read in uppercase.

## Decision

- **Geist Sans** for display, headings and body; **Geist Mono** for labels, code and data. Both
  self-hosted from Fontsource variable packages (`@fontsource-variable/geist`,
  `@fontsource-variable/geist-mono`), which ship Latin, Latin Extended and Cyrillic subsets, so
  Portuguese and Spanish diacritics are covered. SIL Open Font License.
- **Orbitron is dropped.** The display role keeps its own token (`font-family-display`) so the hero
  name and the feature cloud card can still be styled apart: same family, tighter tracking.
- **Tracking:** display −0.03em; h1 −0.025em, h2 −0.02em, h3 −0.01em; mono labels +0.08em.
- **Smallest size:** `font-size-1` rises from 12px to 13px, so mono caps never drop below 13px.
- **No layout shift on swap:** a `Geist Fallback` face maps `local('Arial')` to Geist's metrics
  (`size-adjust: 102.35%`, `ascent-override: 98.68%`, `descent-override: 29.31%`,
  `line-gap-override: 0%`), measured in Chromium with canvas `measureText`. Mono has no metric
  fallback: it is never the LCP element and labels are short.
- **Preload** only the Geist Latin variable file; Geist Mono loads on demand.
- The fluid scale in DESIGN §4 is kept as is: it is already within a few pixels of the proposed
  major-third scale.

## Consequences

- One family download for all prose instead of three; total font weight drops.
- The OG cards are regenerated with the new family (`npm run og`).
- CLAUDE.md rule 6 and DESIGN §3 and §4 now name Geist; any new component uses the existing font
  tokens, never a family name.
- If the fallback metrics drift (new Geist release, different system Arial), re-measure and update
  the overrides in `src/styles/global.css`.
