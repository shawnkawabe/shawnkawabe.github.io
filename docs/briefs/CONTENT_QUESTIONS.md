# Content questions for Shawn (L-29)

> Raised while building the landing redesign (BACKLOG-LANDING L-20 to L-42). Not published. Answer
> inline under each question; the Code Agent applies the answers to `content/{locale}/*.json`.
> Nothing here is filled in by the agent: a blank answer means the site keeps rendering what it
> does today.

## A. Please confirm (the agent drafted these)

### A1. Claim in Portuguese and Spanish

The English claim is yours. The pt and es versions are the agent's translations, reworded in L-35.

| Locale | Current text (`site.headline`)                       | OK? / your wording |
| ------ | ---------------------------------------------------- | ------------------ |
| en     | CRM solutions that teams actually adopt.             | (yours)            |
| pt     | Soluções de CRM que as equipes realmente adotam.     |                    |
| es     | Soluciones de CRM que los equipos realmente adoptan. |                    |

The last word is drawn in outline on Home, so a short final word reads best.

### A2. Contact intro when the form is hidden

New field `contact.introDirect` (L-27). It shows while no Web3Forms key is set, so it must not
mention a form or "send a message".

| Locale | Current text                                                                                                    | OK? / your wording |
| ------ | --------------------------------------------------------------------------------------------------------------- | ------------------ |
| en     | Hiring for a Salesforce role, or need help on a project? Email me directly.                                     |                    |
| pt     | Está contratando para uma vaga Salesforce ou precisa de ajuda em um projeto? Me mande um e-mail diretamente.    |                    |
| es     | ¿Está contratando para un rol de Salesforce o necesita ayuda en un proyecto? Escríbame directamente por correo. |                    |

### A3. Work page intro

`site.workIntro` still says "Filter by cloud or capability". The Work page now filters by cloud
only; capability filters are reached from links on Skills and on case studies. Please reword in
all three languages.

| Locale | Current text                                                                                                                  | Your wording |
| ------ | ----------------------------------------------------------------------------------------------------------------------------- | ------------ |
| en     | Selected Salesforce projects across clouds and industries. Filter by cloud or capability to see where I've done what.         |              |
| pt     | Projetos Salesforce selecionados em diferentes clouds e setores. Filtre por cloud ou competência para ver onde fiz o quê.     |              |
| es     | Una selección de proyectos Salesforce en distintas clouds e industrias. Filtre por cloud o capacidad para ver dónde hice qué. |              |

## B. Structure questions

### B1. Nescara and Globant

`experience.json` lists both companies with the same eight projects (BRF, Orígeo, Lavoro Agro,
Banco Master, Intelbras, Cooxupé, Ihara, GDM Seeds), so the About ledger shows the list twice.
Decision 2 says these were "delivered via Nescara · Globant". Which should About show?

- [ ] One row, "Nescara, via Globant" (or "Globant, via Nescara"), with one role. Which role:
      "Salesforce Developer, Level 5" or "Ssr. Adv. Salesforce Developer"?
- [ ] Two rows, as today (same projects under both).
- [ ] Two rows, but the projects split between them. Which belong to which?

### B2. Orchid component library

`orchid-component-library` has no sections: no challenge, outcomes or gallery. Its card shows the
title and summary only. What can be said publicly?

- Context and challenge (2–3 sentences):
- What you built (components, patterns, tooling):
- Outcomes (qualitative is fine; numbers only if measured):
- Screenshots you are allowed to show:

### B3. Job titles in Portuguese and Spanish (found in L-30)

`experience.json` keeps every role in English on the pt and es pages ("Senior Salesforce
Developer", "Ssr. Adv. Salesforce Developer", …), while the pt/es bio and hero translate your
role ("Desenvolvedor Salesforce Sênior"). Which do you want?

- [ ] Keep the official English titles, as on contracts and LinkedIn.
- [ ] Translate them. Give the pt and es wording you use, per company.

### B4. What Third Republic ran on AWS (found in L-50)

`projects.json` tags `third-republic-data-cloud` with the `aws` capability, but nothing in that
entry's subtitle, summary or outcomes mentions AWS. The Skills page therefore links "AWS" to a
project whose own text never says what was done there. Lavoro Agro is the opposite: its text names
"a Python Flask API on AWS App Runner" twice.

- [ ] Nothing substantial happened on AWS there: drop the `aws` capability from that project.
- [ ] It was a specific service. Which, and one publishable sentence about what it did? - Service: - Sentence:

Answering this is what makes a split possible: `aws` could become the services actually used,
across all three locales. Until then it stays one coarse entry (decision 21).

## C. Optional depth (decision 13: sections render only when data exists)

Leave blank to keep the case studies as they are.

### C1. Team size

Every project's `teamSize` is empty. If you want a "Team" entry in the case-study meta row, give
it per project in the form "1 dev, 2 admins, 1 QA, 1 PO".

| Project                  | Team |
| ------------------------ | ---- |
| Volkswagen Group Portal  |      |
| Adtalem Global Education |      |
| Cooxupé                  |      |
| BRF                      |      |

### C2. "Approach" decisions for the featured projects

Featured case studies have no `decisions` section. Two to four per project, each as decision /
why / trade-off. A copy of `_TEMPLATE.md` per project works too.

- Volkswagen Group Portal:
- Adtalem Global Education:
- Cooxupé:
- BRF:

## Already decided, nothing needed

- Portrait: none (decision 7). The About page shows a photo only once `site.photo` points at an
  approved image.
- Credentials link: none (decision 5). Set `site.links.credentials` to a Trailhead or Credly URL
  whenever you want the certification rows to link.
