# ADR 0002 — Design tokens in DTCG format, compiled by Style Dictionary

- Status: Accepted
- Date: 2026-10-24
- Deciders: Shawn Kawabe

## Context

The previous CSS hard-coded dozens of colour values, duplicated rules, and restyled SLDS classes directly. Dark mode required per-component overrides. The new site needs two themes, consistent spacing and type, and colours shared with 3D scenes written in JavaScript.

## Decision

- Author tokens in the **W3C Design Tokens Community Group format, version 2025.10** (`$value`, `$type`), in `tokens/`.
- Three tiers: primitive → semantic → component. Themes override semantic tokens only.
- Compile with **Style Dictionary 5** to `src/styles/tokens.css` (CSS custom properties). JavaScript (3D scenes) reads the same variables at runtime with `getComputedStyle`, so there is one output and themes apply everywhere.
- Name variables after **SLDS 2 global styling hooks**: `--pf-g-{category}-{name}` (global) and `--pf-c-{component}-{property}` (component), so components could later map `--pf-g-*` to `--slds-g-*` inside Experience Cloud.
- Tailwind's `@theme` maps utility names to these variables; components use utilities or variables, never raw values.

## Consequences

- One file changes the whole look; themes are a semantic swap.
- The generated file (`src/styles/tokens.css`) is **not committed**: they are built by `npm run tokens`, which runs inside `npm run build` and before `npm run dev` (`"predev": "npm run tokens"`), and are listed in `.gitignore` to avoid drift.
- Adding a colour means adding a token first; reviewers reject raw values.
