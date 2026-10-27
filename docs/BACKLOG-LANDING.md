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

- [x] **L-16 Intro section redesign** (research done 2026-10-27; Shawn chose **B**)
  - Notes (2026-10-27): new `site.headline` ("Salesforce solutions that teams actually adopt.",
    reworded from the old intro) in all locales; `intro` shortened to one sentence with two bold
    terms. The fact card lists clouds with projects, certification titles in ledger order and
    `site.location`; empty rows hide. It covers the data core on desktop; the scene stays visible
    around it. No live template pairs a hero with a fact panel, so it follows our tokens.
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

## Round 6: sculpted look and the cloud globe (Shawn, 2026-10-27)

Shawn shared `docs/source-figma/` (git-ignored; notes in `docs/reference/sculpted-gradients.md`):
charcoal ground, one large soft monochrome sculpted shape per screen, bold sans headline, one vivid
accent on a round action button. He also restated the original hero idea: "an earth globe (that we
can recognize the continents) with the Salesforce clouds floating around it like moons". The
current data-core "neurons" scene is not aligned well and does not say that.

- [ ] **L-35 Cloud globe hero scene** (L): replace the data core with an Earth globe whose
      continents are recognisable, and the clouds Shawn worked in orbiting it as moons, each
      labelled with its name as text (no logos; ≤ 6 moons, from content). Land shapes baked once
      from Natural Earth (public domain) into a small committed asset; no map data fetched at
      runtime. Same gates as today: desktop, motion allowed, WebGL2, after load and idle, ≤ 1 MB,
      DPR ≤ 2, paused off-screen, poster first and as the fallback. Moons pause and name
      themselves on hover or focus, and link to Work filtered by the cloud.
- [ ] **L-36 Charcoal, monochrome palette** (M): neutral charcoal surfaces (no blue tint), greys for
      text and lines, the accent kept for the primary action, links and focus only. No grid
      backdrop on any page.
- [ ] **L-37 Round primary action** (S): the hero and contact primary actions become a large round
      accent button with an arrow and a visible text label beside it.
- [ ] **L-38 Sculpted section shapes** (M): one large soft monochrome shape behind each Home
      section, our own geometry (rendered once to optimised images, not extra live 3D scenes),
      bleeding off the edges. Hidden behind text contrast checks (WCAG AA).
- [ ] **L-39 Hero layout for the globe** (S): Shawn chose mock-up A, "planet horizon"
      (2026-10-27). The headline, intro and actions sit centred at the top, and the globe rises from
      the bottom edge with the cloud moons along an arc above it. The location goes top right and
      the fact card is dropped. The accent stays blue, and the globe uses dot continents. The last
      headline word is set in an outlined serif ("adopt."), which needs an ADR for one self-hosted,
      openly licensed serif.

- [ ] **L-40 Products and tools is the benchmark** (M): Shawn: "The best section so far is the
      Product and Tools, ensure that the others are compliant with it." Bring every Home section
      (and the rebuilt inner pages) to its standard: large typography as the visual, content
      first, no boxes or badges, accent used sparingly, motion that serves reading and pauses on
      hover or focus. Audit each section against it and list the gaps before changing them.
- [ ] **L-41 Scroll-linked motion research** (M): Shawn wants animations that move with the
      scroll, for example the globe expanding as sections change or an arrow moving up. Treat
      those as samples and find the best fit for this site. Compare CSS scroll-driven animations
      (`animation-timeline: view()`/`scroll()`, with an IntersectionObserver fallback, per ADR 0005)
      against scroll-scrubbed 3D. Propose one or two uses tied to content, such as the globe
      handing off to the Clouds section. Rules: no scroll-jacking or pinned scroll traps, nothing
      that hides content until it animates, full static result under `prefers-reduced-motion`, no
      new animation library without an ADR, and no layout shift (CLS stays at 0).
- [x] **L-42 Apple fonts review** (S): check whether anything at
      https://developer.apple.com/fonts/ (SF Pro, SF Compact, SF Mono, New York) can be used here.
      Read the licence first: Apple licenses these fonts for designing and mocking up UIs for
      Apple platforms, which likely excludes self-hosting them on a public website. If so, record
      that and name the closest openly licensed alternatives (for example Geist, already in use,
      and an open serif in the spirit of New York for the L-39 outlined word).

### Refined tasks (2026-10-27, before any build)

Shawn chose these for the Intro: mock-up A, a blue accent, an outlined serif word and dot
continents. Each task below names what "done" means. Tasks run in the order given under
**Execution order**.

- [x] **L-35 Cloud globe hero scene** (L). This replaces the data core. **Done when:**
  - **Scene (`GlobeCanvas.tsx`, `mountGlobe.tsx`):**
    - Globe:
      - a gunmetal sphere lit from the upper left, with a faint rim on the lit edge;
      - the continents are the 8,635 baked land points (`src/assets/globe/land-points.json`),
        brighter toward the light;
      - points on the far side are hidden by the opaque sphere.
    - It turns once every 120 s about a slightly tilted axis, with the Americas facing the
      viewer when it starts.
  - **Framing for layout A:**
    - The globe is centred horizontally, with its centre below the hero's bottom edge.
    - The visible cap reaches about 30% of the hero height.
    - The canvas covers the whole hero behind the text.
    - A bottom fade blends it into the next section.
  - **Moons are the clouds from `cloudStats` that have at least one project:**
    - at most 6, in content order, with the label text taken from content;
    - each moon is a small grey sphere on an arc just above the globe's rim;
    - each drifts ±5° around its home angle at its own pace, so the moons never cross or touch;
    - hover or focus on a moon's label pauses the drift.
  - **Labels are HTML links, not text drawn in the canvas:**
    - Each one goes to `/{locale}/work?cap={cloudId}`.
    - Labels render in the hero's HTML at their home positions. Without the scene they are a
      static arc over the poster.
    - When the scene runs, it moves each label with its moon every frame using `transform`
      only, so nothing reflows.
    - The label layer is in reading order after the actions, and its list name is "Clouds"
      from i18n.
  - **WCAG 2.2.2:** one hero motion toggle (the `ProductTicker` pattern: a round button with
    `aria-pressed` and a pause/play icon) stops the globe, the moons and the labels.
  - **Poster (`npm run globe:poster`):**
    - The script renders the same globe framing to `src/assets/globe/poster.{avif,webp}` (about
      100 KB or less), shown through `<Picture>`.
    - The poster is the fallback for mobile, reduced motion and no WebGL2, and what shows
      before the scene starts.
    - When the scene is ready it cross-fades in over the poster (450 ms).
  - **Same gates as today:**
    - Run conditions: `canRunScene` (≥ 1024px, motion allowed, WebGL2), then `afterLoadIdle`.
    - Limits: DPR ≤ 2, loop off when off-screen or the tab is hidden, everything disposed on
      unmount.
    - Size: the scene chunk, land points included, is ≤ 1 MB.
  - **Below 1024px:**
    - The globe poster is cropped to the bottom of the hero.
    - The cloud links become a plain inline list under the actions; there is no arc.
  - **Cleanup:**
    - Remove `DataCoreCanvas.tsx`, `mountDataCore.tsx`, `src/lib/data-core.ts` and its test.
    - Move the helpers that survive into `src/lib/globe.ts`. These are the sphere projection,
      the arc placement, the drift and the scroll depth.
  - **Tests:**
    - unit tests for `globe.ts` (projection, arc angles for 1 to 6 moons, the drift bound);
    - a Container test that the hero renders one link per cloud with a project, with the
      correct `?cap=`;
    - an e2e check that the poster renders and the scene host exists on desktop;
    - a dev-gallery entry.
  - **Docs:** DESIGN §7 and SPEC §5.1 describe the globe instead of the data core.
  - Notes (2026-10-27):
    - Built as specified. Size: the scene chunk is 963 KB raw (284 KB gzipped). The land points
      are now base64 Int16 (46 KB, down from 108 KB of JSON).
    - Posters: dark and light, one per theme, both 2400×1200 WebP sources. The served AVIF files
      are 16 to 52 KB.
    - The globe has its own tokens (`globe-shade`, `globe-lit`, `globe-dot`), so the light theme is
      lit correctly.
    - The pause toggle sits at the top right of the hero until L-39 places the meta row.
    - The fact card still duplicates the cloud list until L-39 removes it.
    - Dev server: Home has no hydrated island, so the live globe only starts in builds. Vite's
      React preamble is missing in dev, so check the scene on `npm run preview`.
    - `npm run og` and `npm run globe:poster` now share `scripts/dev-server.mjs`.

- [x] **L-42 Apple fonts review** (S). Do this before L-39, which needs the serif. **Done when:**
  - Apple's font licence has been read and quoted in a new ADR 0009, "Display serif".
  - SF Pro, SF Compact, SF Mono and New York are each marked usable or not on a public website.
    Expected answer: not usable, because they are licensed for mock-ups of Apple platform UIs.
  - One openly licensed (SIL OFL) serif is chosen for the single outlined word. Candidates are
    Instrument Serif, Newsreader and Source Serif 4. The choice covers shape, weight range,
    Latin subset size and how it looks in outline at 96px.
  - The font is self-hosted through Fontsource as one weight, Latin and Latin-ext only, at
    30 KB or less.
  - A token `font.family.serif` is added.
  - CLAUDE.md rule 6 is updated to allow the serif for one outlined display word per page,
    at 48px or more.
  - Notes (2026-10-27):
    - None of Apple's fonts can be used. Their licence allows mock-ups of Apple platform UIs only
      and forbids embedding them; quoted in ADR 0009.
    - Instrument Serif 400 (OFL) was chosen: Latin is 21 KB, and Latin Extended (12 KB) loads only
      on demand.
    - Token `font-family-serif`; CLAUDE.md rule 6 updated.

- [ ] **L-36 Charcoal, monochrome palette** (M). **Done when:**
  - **Dark theme:**
    - Surfaces move to neutral charcoal: `surface-0` is about `#131313`, with steps for
      `surface-1` and `surface-2`; chroma is 0 (no blue).
    - Borders and the text greys are also neutral.
  - **Light theme:** gets the same treatment, with a neutral off-white.
  - **Accents:**
    - `accent-1` (blue) is used only for the primary action, links, focus rings and selected
      states.
    - `accent-2` and the cloud accents keep their tokens but appear only where L-40 allows them.
  - **Backdrop:**
    - The grid backdrop and the pointer spotlight (`Backdrop.astro`, `src/lib/backdrop.ts`) are
      removed from every page, and `pf-hero-glow` is removed.
    - Their tests and dev-gallery entries go too.
  - **Checks:**
    - The token test checks AA contrast for every text/surface pair in both themes.
    - axe passes.
    - The OG images are regenerated.
- [ ] **L-39 Hero layout A** (M). **Done when:**
  - **Order:** a top meta row (name top left, where it does not clash with the rail, and
    location top right in mono), then role in mono, then the headline (`site.headline`), then
    the intro, then the actions.
  - **Headline:**
    - The last word renders in the L-42 serif as an outline, set with `-webkit-text-stroke` in
      `on-surface-1` and a transparent fill.
    - The full sentence stays one `<p>` that reads normally.
  - **Rule 8 (Shawn, 2026-10-27):**
    - The claim drops the word "Salesforce" and becomes "CRM solutions that teams actually
      adopt." The pt and es lines change to match.
    - No Salesforce product name appears larger than Shawn's name, which is the `h1` at the top
      left at `text-6` or larger.
  - **Fact card:** removed. Its tests, the `facts` prop and the i18n keys are retired, and the
    clouds now appear as the moons.
  - **Text:**
    - No text overlaps the globe cap at 1440×900, 1280×720 and 1024×768.
    - Text contrast is AA over the poster.
  - **Layout below lg:** left-aligned and stacked, poster at the bottom, cloud list inline
    (L-35).
  - **Locales:** pt and es fit without overflow.
- [ ] **L-37 Round primary action** (S). **Done when:**
  - A new `RoundAction.astro` exists:
    - a 112px accent circle with an arrow icon, 72px below lg;
    - a visible text label beside it that is part of the same link, so its accessible name is
      the label;
    - the visible focus ring is offset from the circle;
    - on hover the arrow nudges 4px, and it is still under reduced motion.
  - It is used for the hero "See my work" action and the Home contact action. Download resume
    stays a ghost text link.
  - It has a dev-gallery entry and a Container test (label, href, external variant).
- [ ] **L-41 Scroll-linked motion** (M). Research first, then build one effect. **Done when:**
  - A short research note in `docs/reference/scroll-motion.md` compares:
    - CSS `animation-timeline: view()`/`scroll()`: support is Chromium and Safari 26; Firefox
      needs the fallback;
    - IntersectionObserver steps (ADR 0005);
    - scrubbing the R3F scene from scroll.
  - It weighs the samples Shawn gave (the globe expanding, an arrow moving up) and proposes at
    most two effects tied to content. Default pick:
    - As the hero scrolls away, the globe rises and grows to fill the screen, then dissolves
      into the Clouds section, where the same cloud names are the headings. It is driven by the
      scene's existing scroll depth (no new library), and the poster gets the same effect
      through a CSS `view()` timeline.
    - A section progress arrow in the rail moves up the track as sections pass.
  - The chosen effect is built, and passes these rules:
    - no scroll-jacking and no pinned trap;
    - content is never hidden while waiting to animate;
    - the end state is static under reduced motion;
    - CLS is 0, measured on the preview;
    - Firefox shows the step fallback.
- [ ] **L-38 Sculpted section shapes** (M). **Done when:**
  - **Shapes:**
    - Each Home section after the hero (work, clouds, products, certifications, contact) gets
      one large, soft, monochrome shape: a tube, ring, wave, blob or chevron.
    - The shapes are our own geometry: authored as SVG (gradients and blur) or rendered once
      by a script to AVIF/WebP of about 60 KB or less each.
    - Each bleeds off one or two edges, sits behind the content with `aria-hidden`, and
      `alt=""` where it is an image.
  - **No new live 3D:** at most one scene per page stays.
  - **Contrast:** AA is checked on every text pixel range over a shape, both in a test against
    the shape's lightest stop and by axe.
  - **Contact band:** `SectionBand` is replaced by its shape, and `SectionBand` is removed in
    L-28.
- [ ] **L-40 Products and tools is the benchmark** (M). **Done when:**
  - **Audit:** `docs/reference/benchmark-audit.md` scores the Home sections and the inner
    pages against the products section's traits:
    - large type is the visual;
    - content comes first;
    - no boxes, badges or counts;
    - the accent is used sparingly;
    - motion serves reading and pauses on hover or focus.
  - **Gaps:** each gap is listed with the fix, before any change.
  - **Fixes:** Home fixes ship in this task, and inner-page gaps are fed into L-21 to L-27.
    Known candidates:
    - the featured `CoverCard` gradient covers;
    - `CloudPanels` boxes;
    - the contact band.

#### Round 4 refinements (inner pages, carried into the order below)

- **L-21:** add `RoundAction` (L-37) to the shared primitives. The primitives use the L-36
  palette.
- **L-22:**
  - The backdrop is already removed by L-36.
  - What's left is removing `shadow-glow` and `data-tilt` (`src/lib/tilt.ts`) from `CloudCard`,
    `CoverCard`, `ProjectCard` and `PrevNext`, and sentence-case labels.
- **L-23 and L-24:** follow the L-40 audit gaps for Work and the case study.
- **L-25:** reuses `CredentialLedger` as it is. `CloudBento` and `StackChips` are retired if
  nothing else uses them.
- **L-27:** the contact action is the `RoundAction`.
- **L-28:** `CredentialTickets` is already gone. Remove what is now unused:
  - `SectionBand` (after L-38);
  - `Backdrop` (after L-36);
  - `tilt.ts` (after L-22);
  - `CloudBento`, `DecisionCards`, `Outcomes`, `SnapshotBar` and `StackChips`, if L-23 to L-27
    no longer use them, together with their tests and dev-gallery entries.
- **L-29:** ask Shawn to confirm the reworded claim in pt and es.
- **L-30:** add the globe hero to the visual QA.

#### Execution order

L-35 → L-42 → L-36 → L-39 with L-37 → L-41 → L-38 → L-40 → L-21 with L-22 → L-23 with L-24 →
L-25 → L-26 → L-27 → L-28 → L-29 → L-30. Each task ends with `npm run ci`, `npm run test:a11y`,
screenshots at 375, 768 and 1440 on the built preview, a ticked box with notes, and one commit.

## Order and status

| #            | Task                            | Status  |
| ------------ | ------------------------------- | ------- |
| L-01         | Resume link                     | done    |
| L-03         | Drop solution architecture      | done    |
| L-04         | AWS label                       | done    |
| L-02         | Rail + language menu            | done    |
| L-08         | Landing structure               | done    |
| L-05         | Clouds                          | done    |
| L-06         | Products & tools                | done    |
| L-07         | Certifications                  | done    |
| L-09         | Collapsed rail as a circle      | done    |
| L-10         | Products moving list            | done    |
| L-11         | Typography                      | done    |
| L-12         | Background                      | done    |
| L-13         | Remove availability chip        | done    |
| L-14         | Favicon                         | done    |
| L-15         | No em dash                      | done    |
| L-16         | Intro redesign                  | done    |
| L-17         | Certifications redesign         | done    |
| L-18         | Cloud cards simplified          | done    |
| L-19         | Rail toggle icon                | done    |
| L-20 to L-30 | Professional inner pages        | planned |
| L-31         | Better favicon                  | done    |
| L-32         | Better transitions              | done    |
| L-33         | Contact full width              | done    |
| L-34         | Footer notice                   | done    |
| L-35         | Cloud globe hero                | done    |
| L-36         | Charcoal palette                | planned |
| L-37         | Round primary action            | planned |
| L-38         | Sculpted section shapes         | planned |
| L-39         | Hero layout A                   | planned |
| L-40         | Products and tools as benchmark | planned |
| L-41         | Scroll-linked motion research   | planned |
| L-42         | Apple fonts review              | done    |
