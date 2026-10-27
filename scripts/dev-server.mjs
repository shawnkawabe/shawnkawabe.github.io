// Starts the project's dev server for the screenshot scripts (og, globe:poster), or reuses the one
// already running, and stops it when the work is done.
import { spawn } from 'node:child_process';

const PORT = 4323;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Runs `work(baseUrl)` against a dev server that answers `probe`, then stops the server. */
export async function withDevServer(probe, work) {
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
        if ((await fetch(`${own}${probe}`)).ok) return own;
      } catch {
        // not listening yet
      }
    }
    throw new Error(`Dev server did not start on ${own}`);
  }

  try {
    return await work(await serverUrl());
  } finally {
    server.kill();
  }
}
