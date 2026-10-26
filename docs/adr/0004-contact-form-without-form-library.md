# ADR 0004 — Contact form without a form library

- Status: Accepted
- Date: 2026-10-26
- Deciders: Shawn Kawabe (backlog work pre-approved; recorded for review)

## Context

CLAUDE.md §2 lists "react-hook-form + zod" for forms. ARCHITECTURE §9 caps JavaScript on non-3D pages at 80 KB gzipped. React alone ships ~66 KB gz on any page with an island, which leaves ~14 KB for the contact form (P2-09).

The first build of `ContactForm` with react-hook-form, `@hookform/resolvers` and `zod/mini` put `/contact` at **88.4 KB gz** (form chunk 19.4 KB). Full `zod` would have been larger still.

## Decision

- Keep **zod** as the single validation schema shared by the island and its tests, imported as **`zod/mini`** (`src/lib/contact.ts`: `contactSchema`, `validateContact`, `sendContact`).
- Drop **react-hook-form** and **@hookform/resolvers**. The island keeps its four fields in React `useState` and calls the pure `validateContact()` on blur, on change (only to clear or update an error already shown) and on submit, then focuses the first invalid field.
- Use native `<input>`, `<select>` and `<textarea>` with fixed token classes instead of the shadcn Field/Select primitives (Radix and the `cn()` tables).

Result: `/contact` ships **76.0 KB gz** (form chunk 7.0 KB).

## Consequences

- The form behaves as SPEC §5.6 requires (blur and submit validation, `aria-describedby`, announced errors, four states), with ~60 lines of state code that we own and test (`tests/unit/islands/contact-form.test.tsx`).
- If a later form needs field arrays or complex dependent fields, revisit this. A second, larger form would justify a library only if it fits the budget.
- CLAUDE.md §2 now reads "zod (`zod/mini`) + React state, posted to Web3Forms".
