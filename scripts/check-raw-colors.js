// Fails when source files contain raw colours (CLAUDE.md rule 5). Only the generated
// tokens.css and the cover artwork in covers.css may hold literal colour values.
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = 'src';
const ALLOWED = new Set(['src/styles/tokens.css', 'src/styles/covers.css']);
const EXTENSIONS = /\.(astro|tsx?|jsx?|mjs|css)$/;
// Hex colours (#rgb, #rgba, #rrggbb, #rrggbbaa) and colour functions with literal arguments.
// Fragment links (href="#add") and SVG references (url(#fade)) are not colours.
const RAW_COLOR =
  /(?<![\w&]|href=["']|url\()#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b|\b(?:rgba?|hsla?|oklch|oklab)\(\s*\d/gi;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (EXTENSIONS.test(entry.name)) yield path;
  }
}

const problems = [];
for await (const path of walk(ROOT)) {
  const file = relative('.', path).replaceAll('\\', '/');
  if (ALLOWED.has(file)) continue;
  const lines = (await readFile(path, 'utf8')).split('\n');
  lines.forEach((line, index) => {
    for (const match of line.matchAll(RAW_COLOR)) {
      problems.push(`${file}:${index + 1}  ${match[0]}`);
    }
  });
}

if (problems.length) {
  console.error(`Raw colour values found (use design tokens instead):\n${problems.join('\n')}`);
  process.exit(1);
}
console.log('check-raw-colors: no raw colours outside tokens.css and covers.css');
