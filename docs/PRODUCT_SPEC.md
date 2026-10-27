# Product spec — Portfolio MVP

Status: approved for build · Owner: Shawn Kawabe · Last updated: 2026-10-24

## 1. Goal

**The site is a showcase of projects, not a resume.** The resume (linked everywhere) holds the career history: dates, employers in order, education. The site shows the work itself.

A recruiter or hiring manager who lands on the site understands within 30 seconds:

1. Shawn is a **Senior Salesforce Developer and Functional Specialist** (Platform, Sales, Service, Experience, Commerce, Data Cloud).
2. **What he has built**: projects with the client, the clouds and his role, shown visually.
3. **Proof**: case studies with problem, decisions and outcomes; certifications.
4. **How to reach him**: one obvious action (contact form or email), resume download.

**No dates anywhere on the site**: not on projects, companies or certifications. Order is curated (featured first, then the order of `projects.json`).

Success measures (post-launch): Lighthouse ≥ 95 on all four categories for Home and a case study; zero axe violations; adding a project takes one JSON edit plus images.

## 2. Out of scope for the MVP

Blog, Portuguese and Spanish versions (keep i18n-ready; they follow in Phase 4, ADR 0003), CMS, analytics beyond a privacy-friendly counter, password-protected pages, comments, search.

## 3. Sitemap and routes

| Route             | Page                                                                               | Template          | Source data                                                                   |
| ----------------- | ---------------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------- |
| `/`               | Home                                                                               | `PageLayout`      | `site.json`, `projects.json` (featured), `skills.json`, `certifications.json` |
| `/work`           | Work index                                                                         | `PageLayout`      | `projects.json`, `skills.json`                                                |
| `/work/[id]`      | Case study (one per project; `id` is the slug)                                     | `CaseStudyLayout` | `projects.json`                                                               |
| `/about`          | About and experience                                                               | `PageLayout`      | `site.json`, `experience.json`, `certifications.json`                         |
| `/skills`         | Skills and clouds                                                                  | `PageLayout`      | `skills.json`, derived from `projects.json`                                   |
| `/contact`        | Contact                                                                            | `PageLayout`      | `site.json`                                                                   |
| `/404`            | Not found                                                                          | `PageLayout`      | `site.json`                                                                   |
| `/dev/components` | Component gallery (dev server only; injected route, never built or in the sitemap) | —                 | fixtures                                                                      |

Resume is an external PDF link from `site.links.resume` (opens in a new tab, labelled as PDF).

Content field names below refer to `content/site.json` as `site.*`.

## 4. Global shell (every page)

### 4.1 Navigation

- **Desktop (≥ 1024px):** floating vertical **nav rail** fixed at left, vertically centred-top (see `docs/reference/01-home-once-ui.jpg`). Pill-shaped surface, `surface-2`, radius `pill`. Items: Home, Work, Skills, About, Contact (icon + tooltip label), divider, LinkedIn, GitHub, Resume (external). Active item: filled circle behind icon + small dot beneath.
- **Tablet and mobile (< 1024px):** top bar with name (left) and a menu button (right) opening a **sheet** from the right with the same items as text links. Sheet traps focus, closes on Esc, overlay click and route change.
- Keyboard: Tab order follows visual order; tooltips appear on focus as well as hover.
- `aria-current="page"` on the active link.

### 4.2 Theme

- Dark by default. Toggle in the rail (desktop) and sheet (mobile). Respects `prefers-color-scheme` on first visit, then the stored choice (`localStorage` key `pf-theme`, wrapped in try/catch).
- Theme applied as `data-theme` on `<html>` by an inline script in `<head>` to avoid a flash.

### 4.3 Footer

Centred, small: "© {year} Shawn Kawabe", links (LinkedIn, GitHub, email), trademark notice from `site.json.trademarkNotice`.

### 4.4 Skip link and focus

"Skip to content" as the first focusable element. Visible focus ring on every interactive element (`focus-ring` token).

### 4.5 SEO per page

`<title>` pattern `"{site.seo.pages.{page}.title} | Shawn Kawabe"` (Home: `site.seo.homeTitle`; case studies: `"{project.title} | Shawn Kawabe"`), meta description from `site.seo.description` (Home), `site.seo.pages.{page}.description`, or `project.summary`, canonical URL, Open Graph + Twitter card (one default image `public/og/default.png` until P3-05 adds per-page images at `public/og/{route}.png`, 1200×630), `sitemap.xml` via `@astrojs/sitemap`, `robots.txt`, JSON-LD `Person` on Home and `CreativeWork` per case study.

## 5. Pages

### 5.1 Home `/`

Sections in order:

1. **Hero**
   - Name at display size (Geist, ADR 0007), role line, a one-line claim (`site.headline`) and a short intro (`site.intro`, at most two `**terms**`).
   - Fact card (L-16, direction B): solid `surface-2`, rows Clouds (cloud skills with projects), Certifications (names from `certifications.json`) and Based in (`site.location`). No availability line.
   - Two actions: primary "See my work" → `/work`; secondary "Download resume" (external).
   - Background: subtle animated "data core" 3D scene **or** static gradient if reduced motion / no WebGL. Must not compete with the text; text contrast ≥ 7:1.
2. **Featured work**: horizontal row of `CoverCard`s for projects with `featured: true` (max 4), scroll-snap on mobile, "All projects →" link. This is the most important section after the hero.
3. **Clouds constellation** (signature section — see §6)
4. **Products and tools marquee**: infinite marquee of `skills` where `group = "products"` or `"tools"` (Gleamy-style). Pauses on hover/focus; static wrapped list when reduced motion.
5. **Certifications**: a ledger grouped by domain (L-17); the issuer named once in the header; rows link to `site.links.credentials` when it is non-empty, otherwise plain text. No dates, no ticket or badge styling.
6. **Contact CTA band**: `site.ctaLine` + button to `/contact`.

Acceptance:

- [ ] LCP element is the hero text, not the 3D canvas.
- [ ] Hero renders fully with JavaScript disabled (3D replaced by gradient poster).
- [ ] Featured cards are links (whole card clickable, one tab stop).

### 5.2 Work `/work`

Professional ledger (ADR 0008).

- `PageHeader`: title + `site.workIntro`.
- **Filter bar**: one segmented row of cloud chips (skills with `group = "clouds"` that have at least one project). No counts on chips. Multi-select (OR); "All" resets.
- `cap` in the URL still filters (from Stack links on case studies and the Home products list); a valid `cap` id shows as one removable chip with its label from `skills.json`. Unknown ids are ignored. Filters sync to the URL; Back restores the previous state.
- Result count announced via `aria-live="polite"`, screen-reader only.
- **List**: a `LedgerRow` per project in curated order (featured first, then file order): title, subtitle, a meta line with client and delivering employer(s), clouds as text on the right, arrow. The client appears once. No covers, no dates.
- **Empty state**: "No projects match these filters" + a reset link.
- Without JavaScript: all projects visible, filter bar hidden.

### 5.3 Case study `/work/[id]`

Consultancy layout (ADR 0008). Sections render only when their data exists:

1. **Header**: back link to Work, title (h1), subtitle.
2. **Meta list** (`MetaList`): Client Â· Role Â· Team size Â· Delivered via Â· Industry Â· Clouds (as text). No dates.
3. **Problem** (`sections[type=challenge]`), as a `SectionRow`.
4. **Approach** (`type=decisions`): numbered prose, each "decision, why, trade-off".
5. **Outcome** (`type=outcomes`): a plain list; numbers only when `measured: true`.
6. **Stack**: `InlineLinkList` of every skill in `clouds` + `capabilities`, each linking to `/work?â€¦`.
7. **Gallery** (`type=gallery`): approved images only, two columns, captions, lightbox (arrows, Esc).
8. **Takeaway** (`type=takeaway`): one pull-quote paragraph, no band or rotation.
9. **Next project** link (by sort order).

Projects with `"depth": "card"` get sections 1, 2, 3, 5, 6, 9. No solution-architecture section.

### 5.4 Skills `/skills`

Capability index (ADR 0008), each block a `SectionRow`:

1. **Clouds**: one `InlineLinkList` of clouds with projects (â†’ `/work?cloud={id}`).
2. **Skill groups**: in the order and with the labels in `site.skillGroups` (`tools` not shown); each skill links to `/work?cap={id}` when it has projects, otherwise plain text. No counts.
3. **Certifications**: the L-17 ledger grouped by domain.
4. **Languages**: from `site.languages`.

No percentages, stars, meters, counts or self-ratings anywhere.

### 5.5 About `/about`

1. `PageHeader` with the first bio paragraph as lead; remaining `site.bio` paragraphs; `site.location`; actions "Download resume" (`site.links.resume`) and "Contact". Photo from `site.photo` only when present and `approved: true`.
2. **How I work**: `site.principles` as numbered rows, no boxes.
3. **Experience**: a ledger of `experience.json` (company, role, linked project names). No dates, no timeline.

### 5.6 Contact `/contact`

- `PageHeader` with `site.contact.intro` (a variant without "send a message" when the form is absent).
- Direct rows (`SectionRow`): Email (`mailto:` link + copy button), LinkedIn, Resume.
- If `PUBLIC_WEB3FORMS_KEY` is empty at build time, the form is not rendered.
- **Form** (React island): Name (required), Email (required, valid), Project type (select: Full-time role, Contract, Consulting, Other), Message (required, 20â€“2000 chars), honeypot field (visually hidden, `tabindex="-1"`, `autocomplete="off"`).
- Validation inline on blur and on submit (zod schema shared with tests). Errors linked with `aria-describedby`.
- Submit â†’ POST to `https://api.web3forms.com/submit` with `access_key = PUBLIC_WEB3FORMS_KEY`. States: idle, submitting (button disabled + spinner), success (message replaces form, focus moves to it), error (message + retry, form data kept).
- Visual: plain bordered inputs on `surface-1`, 2px `focus-ring` outline. No glass, glow or animated border.

### 5.7 404

`site.notFound.title`, `site.notFound.body`, links to Home and Work. Same shell.

## 6. Clouds constellation (signature component)

### 6.1 Data

Each node = one entry in `skills.json` with `group = "clouds"`. Node size ∝ `sqrt(projectCount)` (derived). Colour from the node's `accent` token. Centre node = Shawn. Clouds with zero projects and zero certifications are hidden (Membership & Nonprofit stays hidden until its post-MVP projects are added).

### 6.2 Desktop interaction (≥ 1024px, WebGL available, motion allowed)

- Nodes orbit slowly (one revolution ≈ 60s); orbit pauses while the pointer is over the canvas.
- Hover/focus a node: it scales 1.15, label appears, others dim to 40%.
- Click/Enter a node: **side panel** slides in (right, 400px) with: cloud name, project count, certifications linked to that cloud, project chips (links), "See projects" → `/work?cloud={id}`. Esc or close button returns focus to the node.
- Keyboard: nodes are reachable via an accessible list rendered alongside the canvas (visually the canvas, semantically buttons). Arrow keys move between nodes.

### 6.3 Fallback / mobile (bento grid)

Used when < 1024px, reduced motion, WebGL unavailable, or before the 3D bundle loads (as the poster):

- Bento grid of `CloudCard`s; Sales Cloud (most projects) spans 2×2; others 1×1 or 2×1 by project count.
- Card: own icon (from `src/assets/icons/clouds/`, original artwork, never Salesforce logos), name, project count, cert chip if any, top 3 project chips, link.

Acceptance:

- [ ] Same information reachable with mouse, keyboard and screen reader.
- [ ] 3D bundle not requested until the section is within 200px of the viewport.
- [ ] Scene JS + assets ≤ 1 MB gzipped total; page still scores ≥ 95 performance.

## 7. Cross-cutting requirements

| Area           | Requirement                                                                                                                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Responsive     | Designed at 375, 768, 1024, 1440. No horizontal scroll at any width ≥ 320.                                                                                                                                  |
| Performance    | Lighthouse ≥ 95 (mobile profile). Total JS on non-3D pages ≤ 80 KB gzipped. Images WebP/AVIF with `width`/`height`, lazy below the fold. Fonts self-hosted, `font-display: swap`, preload the heading font. |
| Accessibility  | WCAG 2.2 AA; axe 0 violations; reduced motion honoured everywhere; colour never the only signal.                                                                                                            |
| Browsers       | Last 2 versions of Chrome, Edge, Firefox, Safari (desktop + iOS).                                                                                                                                           |
| Privacy        | No third-party trackers. No cookies.                                                                                                                                                                        |
| i18n readiness | All strings in `content/` or `src/i18n/en.json`; no concatenated sentences in components.                                                                                                                   |

## 8. Definition of done (every task)

1. Acceptance criteria of the backlog task met.
2. `npm run ci` green.
3. Checked visually at 375 / 768 / 1440 in dark and light.
4. Keyboard pass: everything reachable, visible focus, logical order.
5. No new hard-coded content, colours or sizes.
6. Backlog updated.
