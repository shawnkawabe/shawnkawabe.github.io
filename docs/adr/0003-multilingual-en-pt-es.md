# ADR 0003 — Three site languages: English, Portuguese, Spanish

- Status: Accepted
- Date: 2026-10-25
- Deciders: Shawn Kawabe

## Context

The MVP was planned in English only, with a Portuguese version listed as post-MVP. Shawn works with clients in Brazil and across Latin America and wants the site in English, Portuguese and Spanish. The site is static on GitHub Pages, so there is no server to negotiate languages, and the content rules (CLAUDE.md §4) forbid inventing facts, so translated copy must be checked by Shawn before it ships.

## Decision

- **Locales:** `en` (default), `pt` (Brazilian Portuguese), `es` (neutral Latin American Spanish).
- **URLs:** every page is prefixed, with no unprefixed copies: `/en/work/brf/`, `/pt/work/brf/`, `/es/work/brf/`. Project slugs stay the same in every language. Astro's built-in i18n routing with `prefixDefaultLocale: true`.
- **Root `/`:** a tiny static page. It picks the language from `localStorage` (the last choice in the language switcher), else `navigator.languages`, else `en`, and redirects. Without JavaScript it shows three plain links plus `<meta http-equiv="refresh">` to `/en/`. Unprefixed URLs from the English-only launch get the same kind of redirect page to `/en/…`.
- **Strings:** UI strings live in `src/i18n/{en,pt,es}.json` with identical keys. Content lives in per-locale files `content/{en,pt,es}/*.json` with identical ids. Schemas are shared, and a test fails when keys or ids differ between locales.
- **Translation workflow:** the agent drafts `pt` and `es` from the English files. Each locale carries a review flag. A locale is built and linked only after Shawn approves it, so a draft locale never reaches production.
- **SEO:** `<html lang>`, `hreflang` alternates (including `x-default` → `/en/`) on every page, per-locale sitemap entries, and a localised OG title and description.
- **Unchanged:** names of clouds, products and companies stay as written. Spoken languages in About remain those in OPEN_QUESTIONS #6; offering a Spanish site does not claim Spanish proficiency.

## Consequences

- Phase 4 is added to the backlog, after the English MVP pages (Phase 3). The English site can launch first.
- Every component already reads text from `content/` or `src/i18n/`, so the change is mostly routing and data plumbing, not component rewrites. Components take a `locale` instead of importing `en.json` directly.
- Three times the copy to keep in sync: adding a project means three entries. The parity test catches omissions; review catches wording.
- The root redirect needs a small inline script. It is far below the JS budget (ARCHITECTURE §9).

## Amendment — 2026-10-26 (P4-01)

Routing uses a plain `src/pages/[locale]/` folder with `getStaticPaths`, not Astro's `i18n` config. The prefix is always present, so Astro's helpers add nothing, and its own root fallback would compete with the custom `/` page. The rules live in `src/lib/i18n.ts` (pure, fully tested), and `getStaticPaths` builds only reviewed locales, plus drafts in `astro dev` or with `INCLUDE_DRAFT_LOCALES=true` for a local check.
