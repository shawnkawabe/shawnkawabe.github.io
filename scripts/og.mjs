// Regenerates public/og/*.png (SPEC §4.5, BACKLOG P3-05): starts the dev server, screenshots the
// dev-only /dev/og card for every page and case study at 1200×630, then stops the server.
// Re-run after changing a project title, subtitle or cover, or adding a project.
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { chromium } from '@playwright/test';

const PORT = 4323;
const PAGES = ['work', 'skills', 'about', 'contact'];

const projects = JSON.parse(readFileSync('content/projects.json', 'utf8'));
const cards = [
  { route: '', file: 'public/og/default.png' },
  ...[...PAGES, ...projects.map((project) => `work/${project.id}`)].map((route) => ({
    route,
    file: `public/og/${route}.png`,
  })),
];

// Node runs Astro's CLI directly (no shell), so `kill()` stops the server on every platform.
const server = spawn(
  process.execPath,
  ['node_modules/astro/bin/astro.mjs', 'dev', '--port', String(PORT), '--host', '127.0.0.1'],
  { stdio: ['ignore', 'pipe', 'pipe'] },
);
let output = '';
server.stdout.on('data', (chunk) => (output += chunk));
server.stderr.on('data', (chunk) => (output += chunk));
const exited = new Promise((resolve) => server.on('exit', resolve));

/** This server's URL, or the one Astro reports when a dev server for the project already runs. */
async function serverUrl() {
  const own = `http://127.0.0.1:${PORT}`;
  for (let attempt = 0; attempt < 240; attempt++) {
    const done = await Promise.race([exited.then(() => true), sleep(500).then(() => false)]);
    if (done) {
      const running = output.match(/already running[\s\S]*?URL:\s+(\S+)/);
      if (running) return running[1].replace(/\/$/, '');
      throw new Error(`astro dev exited:
${output}`);
    }
    try {
      if ((await fetch(`${own}/dev/og`)).ok) return own;
    } catch {
      // not listening yet
    }
  }
  throw new Error(`Dev server did not start on ${own}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let browser;
try {
  const base = await serverUrl();
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const { route, file } of cards) {
    await page.goto(`${base}/dev/og/${route}`);
    await page.evaluate('document.fonts.ready');
    mkdirSync(dirname(file), { recursive: true });
    await page.screenshot({ path: file });
    console.log(`og: ${file}`);
  }
} finally {
  await browser?.close();
  server.kill();
}
