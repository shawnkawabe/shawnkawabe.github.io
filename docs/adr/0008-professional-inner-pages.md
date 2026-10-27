# ADR 0008 — Professional inner pages: ledger layouts, no game-like effects

- Status: Accepted
- Date: 2026-10-27
- Deciders: Shawn Kawabe (approved the L-20 to L-30 plan on 2026-10-27)

## Context

Shawn's feedback: Work, Skills, About and Contact "seem gamified"; the site must look professional
and attractive for any position. An audit (`docs/BACKLOG-LANDING.md`, Round 4) found no single
culprit. The feeling comes from effects repeated across pages:

- the grid backdrop with a pointer spotlight on every page;
- glow and lift on hover, and pointer tilt;
- uppercase mono labels everywhere;
- counters on filters and chips;
- ticket-style certifications;
- gradient covers that repeat the client name;
- outcome boxes with check icons.

References checked on 2026-10-27:

- Brittany Chiang's list-first portfolio (Work and experience as ledgers).
- Stripe customer stories (labelled Challenge, Solution and Products sections).
- Vercel customer stories (a meta row of industry and facts).
- Paco Coursey and Emil Kowalski (short prose bios, plain linked lists).

They separate items with hairline rules, keep one accent for links and focus, and let type and
spacing carry the hierarchy. None of their code, images or copy is reused.

## Decision

- **Home stays the landing page** (ADR 0006), with its full-viewport sections, the hero's 3D
  scene and the background.
  - The hero becomes name, role and a one-line claim, with a solid fact card listing Clouds,
    Certifications and Based in.
  - Certifications become a ledger grouped by domain, on Home and on Skills.
- **Inner pages are calm:**
  - No backdrop grid or spotlight; plain `surface-0`.
  - No glow, lift or tilt. Hover changes text colour or underline only.
  - Hairline dividers (`border-1`) instead of boxed cards.
  - Mono only for small metadata, in sentence case.
  - No counters on filters or skill chips.
- **Shared primitives** carry the system: `PageHeader`, `SectionRow` (label column plus body),
  `LedgerList` / `LedgerRow`, `MetaList` (`dl`) and `InlineLinkList`.
- **Page shapes:**
  - Work: a ledger of projects.
  - Case study: a consultancy layout (meta list, Problem, Approach, Outcome, Stack, Gallery,
    Next).
  - Skills: a capability index.
  - About: a bio with an experience ledger.
  - Contact: direct links, plus the form when its key exists.
- **Retired:**
  - `CredentialTickets`;
  - the `SectionBand` rotation;
  - the cover block on list and case-study pages;
  - `shadow-glow` on links and inputs;
  - `data-tilt` outside Home.

## Consequences

- DESIGN §1, §6, §9 and §10 and SPEC §5.1 to §5.6 change to match.
- Pages get shorter (Skills on mobile drops to about a third) and easier to scan.
- Some sections depend on content Shawn has not supplied yet: team sizes, decisions, a portrait,
  a credential URL. They stay hidden until then; nothing is invented (L-29).
- Visual interest moves to Home. Inner pages earn it with typography and content.
