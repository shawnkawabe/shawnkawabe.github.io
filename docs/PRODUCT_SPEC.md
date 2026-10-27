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
   - Name at display size (Geist, ADR 0007), role line, 3–4 line intro from `site.intro` where `**terms**` render brighter (`on-surface-1`) and the rest `on-surface-2` (Once UI pattern).
   - Two actions: primary "See my work" → `/work`; secondary "Download resume" (external).
   - Background: subtle animated "data core" 3D scene **or** static gradient if reduced motion / no WebGL. Must not compete with the text; text contrast ≥ 7:1.
2. **Featured work**: horizontal row of `CoverCard`s for projects with `featured: true` (max 4), scroll-snap on mobile, "All projects →" link. This is the most important section after the hero.
3. **Clouds constellation** (signature section — see §6)
4. **Products and tools marquee**: infinite marquee of `skills` where `group = "products"` or `"tools"` (Gleamy-style). Pauses on hover/focus; static wrapped list when reduced motion.
5. **Certifications strip**: badges as text chips (no dates); each links to `site.links.credentials` when it is non-empty, otherwise renders as plain text.
6. **Contact CTA band**: `site.ctaLine` + button to `/contact`.

Acceptance:

- [ ] LCP element is the hero text, not the 3D canvas.
- [ ] Hero renders fully with JavaScript disabled (3D replaced by gradient poster).
- [ ] Featured cards are links (whole card clickable, one tab stop).

### 5.2 Work `/work`

- Title + one-paragraph intro (`site.workIntro`).
- **Filter bar**: two chip groups, both using **skill ids** from `skills.json`:
  - **Cloud**: every skill with `group = "clouds"` that has at least one project (today: Sales, Service, Experience, Commerce, Data Cloud, Platform). Clouds with zero projects are hidden.
  - **Capability**: the ids listed in `site.workFacets.capabilities`, in that order, each shown with its project count.
  - Multi-select within a group (OR), AND across groups. "Clear" resets.
- Filters sync to the URL: `/work?cloud=sales-cloud,service-cloud&cap=lwc`. Loading a URL with params applies them. Back button restores previous filter state.
- A `cap` id in the URL that is a valid skill id but not in the facet list (e.g. `cap=gearset`, from a Stack chip on a case study) is added as an extra selected chip with its label from `skills.json`. Unknown ids are ignored.
- Result count announced via `aria-live="polite"` ("6 projects").
- **Grid**: `ProjectCard`s in curated order: featured first, then the order of `projects.json`. No dates. Columns: 1 (< 640px), 2 (640–1279px), 3 (≥ 1280px).
- **Empty state**: "No projects match these filters" + Clear button.
- Without JavaScript: all projects visible, filter bar hidden.

### 5.3 Case study `/work/[id]`

Generated for every project in `projects.json`. Layout follows `docs/reference/02-magic-portfolio-overview.png` (middle column pages).

Fixed order — sections render only when their data exists:

1. **Cover**: large gradient/image cover with title + subtitle (Once UI cover style).
2. **Snapshot bar**: Client · Role · Team size · Delivered via (employer names, e.g. "Nescara · Globant") · Clouds (chips). No dates.
3. **Context and challenge** (`sections[type=challenge]`).
4. **Key decisions** (`type=decisions`): 2–4 cards, each "Decision → Why → Trade-off".
5. **Build highlights** (`type=gallery`): masonry gallery, approved images only, lightbox on click (keyboard: arrows, Esc).
6. **Outcomes** (`type=outcomes`): list; numbers only when `measured: true`.
7. **Stack**: chips for every skill id in `clouds` + `capabilities`, each linking to `/work?…`.
8. **Takeaway** (`type=takeaway`): tinted band, one paragraph.
9. **Prev / Next** project links (by sort order).

Tinted section bands alternate tone (`band-a`, `band-b`) and may be rotated −2° to 2° on ≥ 1024px only (Once UI style); never rotate text itself.

Projects with `"depth": "card"` (non-flagship) still get a page, but only sections 1, 2, 3, 6, 7, 9. No solution-architecture section: the site stays at showcase depth (removed 2026-10-26).

### 5.4 Skills `/skills`

1. **Clouds grid** (same data as the constellation, bento layout, see §6.3).
2. **Skill groups**: rendered in the order and with the labels in `site.skillGroups` (groups not listed there, such as `tools`, are not shown). Each skill is a chip showing `label · N projects`; clicking navigates to `/work?cloud={id}` for clouds and `/work?cap={id}` for other groups. Skills with 0 projects show without a count and without a link.
3. **Certifications** (names only).
4. **Languages**: Portuguese (native), English (from `site.languages`).

No percentages, stars or self-ratings anywhere.

### 5.5 About `/about`

1. Photo from `site.photo` (rendered only when present and `approved: true`; otherwise the bio takes the full width) + bio paragraphs (`site.bio`).
2. **"How I work"" — 3–5 principles from `site.principles` (e.g. Salesforce best practices first, declarative before imperative, documentation as deliverable).
3. **Companies I've delivered through**: a simple row of `experience.json` entries (company name + role), each listing its project chips. No dates, no timeline.
4. **Full history**: one line + "Download resume" button (`site.links.resume`).

### 5.6 Contact `/contact`

- `site.contact.intro` + email link (`mailto:` to `site.links.email`) + LinkedIn.
- If `PUBLIC_WEB3FORMS_KEY` is empty at build time, the form is not rendered; the page shows the email and LinkedIn links only.
- **Form** (React island): Name (required), Email (required, valid), Project type (select: Full-time role, Contract, Consulting, Other), Message (required, 20–2000 chars), honeypot field (visually hidden, `tabindex="-1"`, `autocomplete="off"`).
- Validation inline on blur and on submit (zod schema shared with tests). Errors linked with `aria-describedby`.
- Submit → POST to `https://api.web3forms.com/submit` with `access_key = PUBLIC_WEB3FORMS_KEY`. States: idle, submitting (button disabled + spinner), success (message replaces form, focus moves to it), error (message + retry, form data kept).
- Visual: glass surface, glowing focus ring, animated border on focus-within. No 3D in the form.

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
