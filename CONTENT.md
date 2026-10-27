# Editing content

All text, dates and facts about Shawn live in `content/{locale}/*.json` (`en`, `pt`, `es`; every locale has the same files and ids). English is the source; the other locales are translations of it and go live only after Shawn sets `reviewed: true` in `src/i18n/locales.json`. Components never contain this information. Schemas in `src/content.config.ts` validate everything at build; a mistake fails the build with a message pointing to the field.

| File                             | Holds                                                                  |
| -------------------------------- | ---------------------------------------------------------------------- |
| `content/en/site.json`           | Name, role, intro, bio, links, principles, languages, trademark notice |
| `content/en/projects.json`       | One object per project / case study                                    |
| `content/en/skills.json`         | Every skill, cloud, product and tool, with its group                   |
| `content/en/experience.json`     | Companies you delivered through: name, role, projects (no dates)       |
| `content/en/certifications.json` | Certifications, their domain (ledger group) and related skills         |

## Add a project in five steps

1. **Write the brief** in `docs/briefs/{slug}.md` from `docs/briefs/_TEMPLATE.md`. This is raw material; it is never published.
2. **Add images** to `public/img/{slug}/`: `cover.webp` (1600×900) optional, gallery `01.webp`, `02.webp`… (max width 1600px, WebP quality 80). Blur client or personal data.
3. **Add the object** to `content/en/projects.json` (copy an existing one). Required fields: `id`, `title`, `subtitle`, `client`, `employers`, `role`, `industry`, `clouds`, `capabilities`, `category`, `depth`, `summary`, `cover`.
4. **Use ids, not labels**, in `clouds` and `capabilities`. If a skill is missing, add it to `content/en/skills.json` first.
5. **Run** `npm run validate:content && npm run dev`, open `/work/{slug}`, check it at mobile width.

## Field rules

| Field                         | Rule                                                                                                                                                                  |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                          | kebab-case, unique, becomes the URL: `/work/{id}`                                                                                                                     |
| `employers`                   | list of ids from `experience.json` (e.g. `["nescara", "globant"]`). Shown as "Delivered via" on the case study. The site shows **no dates**                           |
| `depth`                       | `"case-study"` for flagship projects (full page), `"card"` for the rest (short page)                                                                                  |
| `featured`                    | `true` for at most 4 projects; they appear on Home                                                                                                                    |
| `summary`                     | ≤ 220 characters, one or two sentences, outcome-first                                                                                                                 |
| `cover.preset`                | `aurora`, `indigo`, `violet-edge` or `solid-blue`                                                                                                                     |
| `cover.image`                 | optional; a cover photo is used only when declared here with `approved: true` (a `cover.webp` file alone does nothing)                                                |
| images `approved`             | `true` only after the client allows public use; unapproved images never render                                                                                        |
| outcomes `label`              | always rendered, so it must read as a complete statement on its own                                                                                                   |
| outcomes `value` / `measured` | `value` renders only when `measured: true`. Use it only for numbers you can defend in an interview; otherwise leave `value` out and say it in the label qualitatively |
| `todo`                        | open questions for yourself; never rendered                                                                                                                           |

## Section types (case studies)

Order on the page is fixed (challenge → architecture → decisions → gallery → outcomes → takeaway) regardless of order in the JSON.

```json
{ "type": "challenge", "body": "2–3 sentences: the business problem and why it was hard." }
{ "type": "architecture", "body": "What talks to what.", "image": { "src": "/img/slug/architecture.svg", "alt": "…", "approved": true } }
{ "type": "decisions", "items": [ { "decision": "Screen Flow + LWC instead of Aura", "why": "…", "tradeoff": "…" } ] }
{ "type": "gallery", "images": [ { "src": "/img/slug/01.webp", "alt": "Case form in French", "caption": "…", "approved": false } ] }
{ "type": "outcomes", "items": [ { "label": "Case creation unified across 2 brands", "measured": false } ] }
{ "type": "takeaway", "body": "One lesson, first person." }
```

## Writing style

- First person, active voice, plain words. "I built…", "I led…".
- Lead with the outcome, then how.
- Name Salesforce features precisely (Screen Flow, Record-Triggered Flow, Queueable Apex, Named Credentials) — this is what Salesforce reviewers scan for.
- Product names as plain text; Salesforce is not the subject of the sentence, your work is.
- No unmeasured percentages. No superlatives ("cutting-edge", "world-class").

## Order and dates

There are no dates in the content. Projects appear in the order of `content/en/projects.json` (featured ones first), so reorder the file to change the showcase. `content/en/experience.json` lists companies with role and `projectIds`; every id in a project's `employers` must match one, and that company must list the project. Career dates belong on the resume, not here.

## Site copy

Page titles and descriptions, the Home CTA line, the contact intro, the 404 text, the Work filter capabilities (`workFacets.capabilities`) and the Skills page groups and labels (`skillGroups`) all live in `content/en/site.json`.

## Skills

`content/en/skills.json` entries: `id`, `label`, `group`, optional `accent` (clouds only), optional `aliases`. Groups: `clouds`, `development`, `integration`, `devops`, `data`, `delivery`, `products`, `tools`, `languages-programming`. Project counts are computed; never type them.

## Translations

English (`content/en/`, `src/i18n/en.json`) is the source. `pt` and `es` mirror it with the same files, keys and ids; `npm test` fails when they drift. When you change English, change both translations in the same commit.

1. **Preview:** `npm run dev` builds unreviewed languages too, so `/pt/` and `/es/` work locally. Production builds skip them.
2. **Grammar check (optional):** start a local [LanguageTool](https://languagetool.org/download/) server (`java -cp languagetool-server.jar org.languagetool.server.HTTPServer --port 8081`), then run `npm run grammar`. It checks only translated strings and skips words that also appear in the English source. Expect jargon (bulkificado, releases) to be flagged; it is a hint list, not a gate.
3. **Approve:** set `"reviewed": true` for the language in `src/i18n/locales.json`, then run `npm run og` to generate its social cards into `public/og/{locale}/`. Until then the language's pages use the English cards.
