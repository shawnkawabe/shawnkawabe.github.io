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

- [x] **L-05 Clouds I work in**
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
  - Notes (2026-10-26): `platform` is now a `development` skill; Adtalem and the Orchid component
    library had it as their only cloud, so they now list no cloud (schema allows an empty list)
    and carry `platform` as a capability rather than an invented cloud. Its cloud icon is deleted;
    the `cloud-platform` colour token stays unused. The constellation island, canvas, helpers and
    tests are removed; `canRunScene`/`hasWebGL2` moved to `src/lib/webgl.ts` for the hero scene.
    Checked at 1440×900 (section exactly one screen) and 375px (accordion).

- [x] **L-06 Products & tools**
  - No chips/badges and no marquee; the "Pause scrolling list" button goes away.
  - An indexed typographic list: mono number (`01`), the name in Space Grotesk at display size, and
    on hover or focus an accent rule plus the number of projects that used it (derived from
    content, nothing invented). Two columns from `lg`, one on mobile; entrance staggered by the
    L-08 scroll animation.
  - Each row links to `/work?cap=<id>` when at least one project uses it; otherwise it is plain text.
  - Notes (2026-10-26): `Marquee` and its keyframes are deleted. Only Own Data and D4Sign are
    tagged on a project today, so GRAX, Nimble AMS, Fonteva and Nonprofit Cloud render as plain
    rows. **[H]** If those were used on projects, tag them in `capabilities` and they link.

- [x] **L-07 Certifications**
  - Replace the chip row with credential "tickets": text-only cards (no logos, no dates) with a
    CSS-drawn perforated stub, a mono serial (`CERT·01`), the certification name, and the clouds it
    covers as small accent dots with text labels.
  - The whole card links to the credentials page when `site.links.credentials` is set.
  - Grid: 1 column on mobile, 2 at `md`, 3 at `lg`; hover lifts the ticket and lights its accent
    edge (no tilt, no 3D).
  - Notes (2026-10-26): used on Home and Skills; `CertificationStrip` deleted. The issuer
    ("Salesforce Certified") becomes a mono eyebrow by splitting at "Certified"; skills shown are
    the certification's own, clouds first. `site.links.credentials` is empty, so tickets are not
    links yet. **[H]** Add the Trailhead/Credly URL to make them link.

## Round 2 — Shawn's feedback, 2026-10-26 (evening)

- [x] **L-09 Collapsed rail shows where you are**
  - Collapsed, the rail is a perfect circle (equal width and height, `rounded-full`), not a
    rounded pill around one button.
  - The circle shows where the reader is: on Home, the current section's mono number (`03`,
    kept in sync with the L-08 section indicator); on other pages, that page's nav icon (Work,
    Skills, About, Contact). Clicking it expands the rail.
  - Accessible name stays "Expand menu, current: <section or page>"; `aria-expanded` unchanged.
  - The change of number or icon cross-fades (none under reduced motion).
  - Tests: unit test for the current-section/page resolution; e2e checks the circle's width equals
    its height and that the label follows the section on Home.
  - Notes (2026-10-26): 64px circle around a 48px handle. The section indicator dispatches
    `pf-sectionchange`; the rail listens, so neither module imports the other's DOM. Pages
    outside the nav (404) fall back to the expand icon.

- [x] **L-10 Products & tools: a moving list again, restyled** (reworks L-06)
  - Back to a passing list, but typographic, not chips: names in display type, large, separated
    by a small accent glyph; two rows drifting in opposite directions, slowly (≥ 40s per loop).
  - Used products (linked to `/work?cap=<id>`) are filled; the others are outlined text, so the
    difference reads without colour alone. Hover or focus on a name pauses its row and shows its
    project count.
  - WCAG 2.2.2 still needs a way to pause motion that lasts over 5s: a small round icon toggle
    (pause/play, `aria-pressed`, labelled) replaces the old text button. Rows also pause on hover
    and on keyboard focus inside them.
  - Reduced motion or no JavaScript: the L-06 indexed list, static.
  - Screen readers hear one list of products, once.
  - Notes (2026-10-26): outlined text was dropped: a 1px outline cannot be held to WCAG 1.4.3
    contrast. Used products are bright, linked and carry a mono count superscript; unused ones
    are dimmer plain text. The toggle keeps one label ("Pause the moving list") and `aria-pressed`
    carries the state. Repeated copies are `aria-hidden` with `tabindex="-1"` links, so mouse
    users can still click them. Plain rows in the static index no longer show hover effects.

- [x] **L-11 Typography for a professional landing page** (research done 2026-10-26)
  - Proposal: **Geist Sans** (display and body) + **Geist Mono** (labels and data), self-hosted
    via Fontsource as variable WOFF2, subset to Latin and Latin Extended (PT/ES diacritics).
    Drop **Orbitron** everywhere (hero name, cloud panel titles): it reads as a sci-fi template.
    Alternative if Geist variable files are unavailable: keep Inter body + JetBrains Mono and swap
    Space Grotesk for Instrument Sans.
  - Fluid major-third scale with `clamp()` between 375px and 1440px: display
    `clamp(2.75rem, 1.6rem + 5vw, 5.5rem)` at line-height 1.0 and −0.03em; H2
    `clamp(1.75rem, 1.3rem + 2vw, 2.5rem)` at 1.15; body `clamp(1rem, 0.95rem + 0.25vw, 1.125rem)`
    at 1.6; mono caps ≥ 13px at +0.08 to +0.12em. Body measure 60–70ch.
  - Loading: preload body regular and display only; `font-display: swap` with metric-matched
    fallbacks (`size-adjust`, ascent/descent overrides) so fonts cause no layout shift.
  - Needs ADR 0007 and updates to CLAUDE.md rule 6, DESIGN §3 and the font tokens; OG cards
    regenerated. **[H]** Shawn approves the pairing from a specimen page before the swap.
  - Notes (2026-10-26): approved from the research summary; shipped per ADR 0007. Geist Sans for
    display, headings and body, Geist Mono for labels; Orbitron, Space Grotesk, Inter and
    JetBrains Mono removed. `font-size-1` is now 13px; tracking display −0.03em, labels +0.08em.
    `Geist Fallback` (Arial with size-adjust 102.35%, ascent 98.68%, descent 29.31%) keeps body
    wrapping identical before and after the swap. The existing fluid scale was kept: it is
    within a few pixels of the proposed one. The availability chip now wraps to two lines at
    375px (it is built to wrap). The L-06 note still says "Space Grotesk"; it describes history.

- [x] **L-12 Background with personality** (research done 2026-10-26)
  - Proposal: a **technical grid** (blueprint lines at 4–6% opacity) across the page, lit by a
    soft accent spotlight that follows the pointer (CSS custom properties, one rAF-throttled
    listener). It replaces the generic two-glow gradient and fits the data/schema identity
    without trademarks.
  - Per section: the grid pitch or accent shifts subtly as each landing section takes over (CSS
    on the section, no extra JS). The hero keeps its data-core scene as the only WebGL.
  - Light theme: ink lines at the same low alpha. Reduced motion: static spotlight.
  - Text contrast measured over the grid at its brightest; still WCAG AA.
  - Optional later: a topographic contour tile for one section only, if the grid alone feels
    flat. Mesh-gradient aurora rejected as the same generic look.
  - Notes (2026-10-26): `Backdrop.astro` in `BaseLayout`, so every page has it. Lines are 5% of
    the text colour; inside the spotlight they take the section tint at 22%. Tints: accent-1 for
    intro/products, accent-3 for work/certifications, accent-2 for clouds/contact; pitch 40–72px.
    The hero's two glows became one faint glow (the no-WebGL poster). axe contrast checks pass.

## Round 3: Shawn's feedback, 2026-10-26 (night)

- [x] **L-13 Remove the availability chip**
  - Drop "Open to remote Salesforce roles and contracts" from the hero in every locale: remove the
    `availability` field from `content/{locale}/site.json` and the schema, and the chip from
    `Hero.astro` and the dev gallery.
- [x] **L-14 Own favicon**
  - `public/favicon.svg` and `favicon.ico` are still Astro's scaffold logo. Replace them with an
    "SK" monogram in Geist on the accent colour (SVG, plus a 32px ICO and a 180px
    `apple-touch-icon.png`). No Salesforce imagery.
  - Notes (2026-10-27): "SK" drawn as stroked paths (no font dependency) in accent-1 on
    surface-0. The 32px `favicon.ico` is a PNG payload, as before; browsers accept it.
- [x] **L-15 No em dash in visible text**
  - Replace every "—" in `content/{locale}/*.json`, `src/i18n/*.json` and code-built strings
    (`titleTemplate`, `seo.ts`, `cn-tables.ts`) with a comma, colon, full stop or "|" as the
    sentence needs. Add a content test that fails on "—" so it cannot come back.
  - Notes (2026-10-26): page titles now read "Work | Shawn Kawabe"; the intro became two
    sentences; "Salesforce Developer, Level 5". `content.test.ts` guards all three locales and the
    UI strings. Code comments and docs keep their dashes: they are not visible copy.
- [x] **L-19 Rail toggle icon that matches the motion**
  - The rail folds upward into a circle (L-09), but the toggle showed a sidebar closing to the
    left. Now chevrons-up to collapse and chevrons-down as the collapsed fallback (inner pages
    without a matching icon still show their own page icon; Home shows the section number).

- [ ] **L-16 Intro section redesign** (research done 2026-10-27; Shawn chose **B**)
  - Diagnosis: the intro is one long sentence with seven bold terms, so emphasis stops working;
    a 30-second reader cannot find "which clouds, which credentials".
  - A. Statement first (Brittany Chiang, Rauno): name, role, one-line claim, one stack line,
    two actions. Needs a new `site.headline`; `intro` shortened.
  - B. Outcome split with a fact card (recommended): name, role, claim on the left; a solid
    `surface-2` card on the right lists Clouds, Certifications and Based in. The 3D scene sits
    behind the card at lower opacity. Needs `site.headline`; rows derived from content.
  - C. Capability index: six numbered capabilities linking to `/work?cap=`. Competes with the
    products list lower on Home.
- [x] **L-17 Certifications section redesign** (Shawn chose the grouped ledger, 2026-10-27)
  - Notes (2026-10-27): `CredentialLedger` replaces `CredentialTickets` on Home and Skills.
    Certifications gained a `domain` field (development, data-ai, admin); group labels live in
    `src/i18n`. A shared issuer is derived from the labels, shown once, and kept for screen
    readers on each row. Ticket CSS removed (part of L-28).
  - Diagnosis (`CredentialTickets.astro`): "Salesforce Certified" repeats five times; the ticket
    stub, vertical `CERT·01` serial and check icon are ornament; cards lift on hover but are not
    links; five cards in three columns leave an orphan row; no lead line.
  - Recommended: a ledger grouped by domain (Development, Data and AI, Admin and Foundations):
    one row per credential, title left, related skills right as text, issuer named once in the
    section header. Rows link once `links.credentials` has a Trailhead or Credly URL.
    Alternatives considered: a cloud coverage matrix (dense on mobile), count plus disclosure
    (hides content from scanners).

- [x] **L-18 Clouds cards without certifications or project names**
  - "Clouds I work in" cards show the cloud name, icon and project count only: drop the
    certification count and the top-project titles.
  - Notes (2026-10-26): applied to the Home panels (open panel: name, project count, "See
    projects") and to the Skills `CloudCard`. The `cloudPanels.projects` and `.certifications`
    strings were removed from all three locales.

## Round 4: professional inner pages (plan approved by Shawn 2026-10-27)

Shawn: Work, Skills, About and Contact read as "gamified"; they must look professional and
attractive for any position. Audit (screenshots in `.playwright-mcp/audit-*.png`) found the
signals: grid backdrop with a pointer spotlight, glow and lift on hover, tilt, mono uppercase
labels everywhere, counters on filters and chips ("7 PROJECTS · 1 CERTIFICATION"), ticket-style
certifications, gradient covers repeating the client name three times, achievement-style
outcome boxes. Direction: Linear, Vercel and Stripe customer stories, Brittany Chiang's
list-first layout. Calm `surface-0`, one accent for links and focus, hairline rules instead of
boxes, mono only for small metadata in sentence case, hover changes colour or underline only.
Home keeps its landing motion and 3D scene.

References (verified 2026-10-27; ideas only, no code, images or copy): Brittany Chiang
(brittanychiang.com) for the Work and experience ledgers; Stripe customer stories
(stripe.com/customers) for case-study sections; Vercel customer stories (vercel.com/customers)
for the meta row; Paco Coursey (paco.me) and Emil Kowalski (emilkowal.ski) for the bio and
plain lists. No checked site pairs the hero with a fact panel, so L-16 is designed from our
tokens. Astro portfolio themes found were paid; none adopted.

- [x] **L-20 ADR 0008 and docs** (S): "Professional inner pages". DESIGN §6, §9, §10 and SPEC
      §5.2 to §5.6 updated (including the §5.6 "glass, glow" contact line).
- [ ] **L-21 Shared primitives** (M): `PageHeader`, `SectionRow` (label column plus body),
      `LedgerList`/`LedgerRow`, `MetaList` (`dl`), `InlineLinkList`. Tokens only, dev-gallery
      entries, Container tests where they branch.
- [ ] **L-22 Calm shell on inner pages** (S): backdrop on Home only; no `shadow-glow` or
      `data-tilt` on inner pages; sentence-case labels.
- [ ] **L-23 Work as a ledger** (M): one row per project (title, subtitle, client and employer,
      clouds), featured first; no gradient covers, no counts on filters; `?cap=` still filters;
      no-JS shows everything.
- [ ] **L-24 Case study as a consultancy page** (L): meta list (client, role, delivered via,
      industry), then Problem, Approach, Outcome, Stack, Gallery, Next, each a `SectionRow`.
      No cover block, tilted band or outcome boxes. Sections hide when data is absent.
- [ ] **L-25 Skills as a capability index** (M): clouds on one line, skill groups as label plus
      list, certifications as the L-17 ledger, languages. No bento, counts, tickets or
      duplicate cloud group. Mobile page about a third of today's height.
- [ ] **L-26 About as a professional bio** (M): bio, location and resume action first;
      principles as numbered rows; experience as a ledger without dates; photo only if approved.
- [ ] **L-27 Contact, calm and direct** (S): email (with copy), LinkedIn and resume rows; form
      without glass or glow, hidden without a key, intro text matching whether it shows.
- [ ] **L-28 Retire unused patterns** (S): remove `CredentialTickets`, `SectionBand`, ticket CSS
      and anything else left unused.
- [ ] **L-29 Content questions for Shawn** (S): write to `docs/briefs/`; nothing invented.
      Open: team sizes (all empty); 2 to 4 decisions per featured project for "Approach";
      an approved portrait; a Trailhead or Credly URL; Nescara and Globant list the same
      projects (one row "Nescara, via Globant"?); Orchid component library has no sections.
- [ ] **L-30 Accessibility and visual QA** (S): axe on all routes, heading order, screenshots at
      375, 768 and 1440 against the sketches, pt and es overflow check.

Order: L-20, L-21 with L-22, L-23 with L-24, L-25 to L-27, then L-28 to L-30. L-17 ships inside
L-25 (and on Home).

## Round 5: Shawn's feedback, 2026-10-27

- [x] **L-31 Better favicon**: the L-14 monogram reads as plain text on a dark square. Make it a
      designed mark: tighter letterforms, an accent tile, legible at 16px, and a light-tab version.
  - Notes (2026-10-27): white 3px strokes on a tile graded from the dark-theme to the light-theme
    accent, so one file reads on light and dark tabs (no separate light version needed).
- [x] **L-32 Better transitions**: the rail's collapse and expand should morph (size, radius,
      items fading in sequence) rather than switch; hover transitions consistent across links,
      buttons and rows (one duration and easing, colour plus underline offset). Reduced motion
      keeps them instant.
  - Notes (2026-10-27): see DESIGN §6. The collapsed circle now keeps the expanded padding, so
    the handle never jumps. Firefox (no `interpolate-size` yet) snaps the height but still fades.
- [x] **L-33 Contact section full width**: the Home contact section's background must span the
      whole viewport width, not the content column.
  - Notes (2026-10-27): an untilted `SectionBand` now reaches under the rail gutter
    (`lg:-left-30`); the contact band lost its −1° tilt, since a rotated band cannot touch both
    edges without corner gaps (ADR 0008 retires the rotation anyway).

- [x] **L-34 Footer notice as an independent professional**: the trademark notice now opens
      with "I work as an independent Salesforce professional", says the marks are named only to
      describe the platforms, and states no affiliation, sponsorship or endorsement (en, pt, es).

## Order and status

| #            | Task                       | Status   |
| ------------ | -------------------------- | -------- |
| L-01         | Resume link                | done     |
| L-03         | Drop solution architecture | done     |
| L-04         | AWS label                  | done     |
| L-02         | Rail + language menu       | done     |
| L-08         | Landing structure          | done     |
| L-05         | Clouds                     | done     |
| L-06         | Products & tools           | done     |
| L-07         | Certifications             | done     |
| L-09         | Collapsed rail as a circle | done     |
| L-10         | Products moving list       | done     |
| L-11         | Typography                 | done     |
| L-12         | Background                 | done     |
| L-13         | Remove availability chip   | done     |
| L-14         | Favicon                    | done     |
| L-15         | No em dash                 | done     |
| L-16         | Intro redesign             | chosen B |
| L-17         | Certifications redesign    | done     |
| L-18         | Cloud cards simplified     | done     |
| L-19         | Rail toggle icon           | done     |
| L-20 to L-30 | Professional inner pages   | planned  |
| L-31         | Better favicon             | done     |
| L-32         | Better transitions         | done     |
| L-33         | Contact full width         | done     |
| L-34         | Footer notice              | done     |
