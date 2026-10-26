// Grammar check for the translated locales (BACKLOG P4-03) against a LanguageTool server:
// sends every string that differs from English and prints the findings. Words that also appear in
// the English source (product, cloud and client names) are skipped. Advisory, not part of CI.
// Start a server first, e.g. `java -cp languagetool-server.jar org.languagetool.server.HTTPServer
// --port 8081`, or point LT_URL at another one.
import { readdirSync, readFileSync } from 'node:fs';

const LT_URL = process.env.LT_URL ?? 'http://localhost:8081';
const LANGUAGES = { pt: 'pt-BR', es: 'es' };

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

function* translatedStrings(en, translated, path) {
  if (typeof translated === 'string') {
    if (translated !== en && translated.trim() && translated !== 'TODO') {
      yield { path, en: en ?? '', text: translated };
    }
  } else if (translated && typeof translated === 'object') {
    for (const key of Object.keys(translated)) {
      yield* translatedStrings(en?.[key], translated[key], `${path}.${key}`);
    }
  }
}

async function check(text, language) {
  const response = await fetch(`${LT_URL}/v2/check`, {
    method: 'POST',
    body: new URLSearchParams({ text, language }),
  });
  if (!response.ok) throw new Error(`LanguageTool answered ${response.status}`);
  return (await response.json()).matches;
}

let total = 0;
for (const [locale, language] of Object.entries(LANGUAGES)) {
  const pairs = [
    ['src/i18n/en.json', `src/i18n/${locale}.json`],
    ...readdirSync('content/en').map((file) => [`content/en/${file}`, `content/${locale}/${file}`]),
  ];
  for (const [enFile, file] of pairs) {
    for (const { path, en, text } of translatedStrings(readJson(enFile), readJson(file), file)) {
      for (const match of await check(text, language)) {
        const word = text.slice(match.offset, match.offset + match.length);
        if (en.includes(word)) continue;
        total++;
        const fixes = match.replacements.slice(0, 3).map(({ value }) => value);
        console.log(
          `${path}  "${word}"  ${match.message}${fixes.length ? `  → ${fixes.join(' | ')}` : ''}`,
        );
      }
    }
  }
}
console.log(`\n${total} finding(s). Review each one: jargon and kept names are often flagged.`);
