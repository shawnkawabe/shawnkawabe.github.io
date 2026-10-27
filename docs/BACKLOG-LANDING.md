# Backlog — Landing home and UI refresh

Shawn's feedback of 2026-10-26, one task per point. Work top-down; branch `feat/home-landing`, one
commit per task, `npm run ci` green before ticking. Notes go under a task; criteria change only when
Shawn says so. The main `BACKLOG.md` stays the record for Phases 0–4.

Research behind L-05 to L-08 is summarised in [ADR 0006](adr/0006-landing-scroll.md).

---

## Quick content fixes

- [x] **L-01 Resume link** — point `site.links.resume` to
      `https://drive.google.com/file/d/12LWeIdCstNekzacih7zB2FZE_4DN32A2/view?usp=sharing` in EN, PT
      and ES. Acceptance: no page or JSON still carries the old file id.
- [x] **L-03 Drop "Solution architecture"** — the site stays at showcase depth. Acceptance: no
      `architecture` section type in the schema, content, case-study page, tests or i18n; the
      Lavoro diagram is deleted; SPEC §5.3 renumbered.
- [x] **L-04 AWS label** — Third Republic (and every project tagging `aws`) shows plain "AWS", not
      "AWS (App Runner, S3)", in all three languages. Project prose that names App Runner as part of
      what was built stays.

## Navigation

- [x] **L-02 Collapsible rail and language menu**
  - The desktop rail has a collapse button. Collapsed, it shrinks to a small handle that keeps only
    the expand button. The choice survives page loads (`localStorage`, with a safe default when
    storage is blocked) and applies before first paint, so there is no flash.
  - Languages become one disclosure: a button showing the current code (`EN`) that opens the other
    languages. Same component in the rail and the mobile sheet. Esc and outside click close it, and
    focus returns to the button.
  - Keyboard and screen reader: `aria-expanded` on both toggles, visible focus ring, label in name.
  - Tests: Container API test for the switcher markup; Playwright test for collapse persistence and
    the language disclosure.

## Landing home (structure first, then each section)

- [x] **L-08 Full-viewport landing structure** (do before L-05 to L-07)
  - Home sections (hero, featured work, clouds, products & tools, certifications, contact) are each
    at least `100svh` tall, content centred vertically; they grow past the viewport when content
    or zoom needs it (never clipped).
  - Scroll snapping is `y proximity` on the home page only. Never `mandatory`: it traps keyboard,
    zoom and long-content users (ADR 0006).
  - Transitions between sections: CSS scroll-driven animations (`animation-timeline: view()`) fade,
    lift and gently scale each section's content in and out. They are gated by
    `@supports (animation-timeline: view())` and `prefers-reduced-motion: no-preference`; without
    support, the existing IntersectionObserver `Reveal` runs instead, and with reduced motion
    nothing moves.
  - A section indicator on the right on desktop (mono `01`–`06`, current one highlighted) links to
    each section's anchor; hidden on mobile and from print.
  - The 3D hero scene still pauses off-screen; the scroll animations don't touch it.
  - Checks: 375 / 768 / 1440 screenshots; zoom 200% has no clipped or unreachable content;
    axe passes; Lighthouse performance stays at or above today's score.
  - Notes (2026-10-26): checked at 1440×900, 375×812 and 720×450 (≈ 200% zoom); sections grow past
    the viewport instead of clipping, no horizontal scroll; axe suite green. Section content fades
    in on its section's named view timeline (`--pf-section`), the section dims on exit; the ranges
    are in `vh` so tall sections settle while being read. Lighthouse not re-measured yet. On
    phones the hero is one screen plus the sticky header.

- [ ] **L-05 Clouds I work in**
  - Salesforce Platform is no longer listed as a cloud: it underlies every project, so it moves out
    of the `clouds` group (to `development`) and out of the home section, the Skills clouds grid and
    the Work cloud filter. Projects that only tagged `platform` as a cloud get their real cloud or keep `platform` as a
    capability; the schema still requires at least one cloud.
  - The three.js constellation leaves the home page and is replaced by expanding cloud panels: a row
    of tall panels on desktop (the active one widens and shows its project count, projects and
    certifications), a stacked accordion on mobile. Each panel has a cloud-accent glow that follows
    the pointer. Panels are disclosure buttons (`aria-expanded`); keyboard works.
  - The section fits inside one viewport at 1440×900 and 768×1024, with nothing hidden at top or
    bottom.
  - The constellation island and its canvas are deleted if nothing else uses them.

- [ ] **L-06 Products & tools**
  - No chips/badges and no marquee; the "Pause scrolling list" button goes away.
  - An indexed typographic list: mono number (`01`), the name in Space Grotesk at display size, and
    on hover or focus an accent rule plus the number of projects that used it (derived from
    content, nothing invented). Two columns from `lg`, one on mobile; entrance staggered by the
    L-08 scroll animation.
  - Each row links to `/work?cap=<id>` when at least one project uses it; otherwise it is plain text.

- [ ] **L-07 Certifications**
  - Replace the chip row with credential "tickets": text-only cards (no logos, no dates) with a
    CSS-drawn perforated stub, a mono serial (`CERT·01`), the certification name, and the clouds it
    covers as small accent dots with text labels.
  - The whole card links to the credentials page when `site.links.credentials` is set.
  - Grid: 1 column on mobile, 2 at `md`, 3 at `lg`; hover lifts the ticket and lights its accent
    edge (no tilt, no 3D).

## Order and status

| #    | Task                       | Status |
| ---- | -------------------------- | ------ |
| L-01 | Resume link                | done   |
| L-03 | Drop solution architecture | done   |
| L-04 | AWS label                  | done   |
| L-02 | Rail + language menu       | done   |
| L-08 | Landing structure          | done   |
| L-05 | Clouds                     | to do  |
| L-06 | Products & tools           | to do  |
| L-07 | Certifications             | to do  |
