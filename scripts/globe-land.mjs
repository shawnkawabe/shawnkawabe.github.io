// Bakes the hero globe's continents (BACKLOG-LANDING L-35): spreads points evenly over a sphere
// (Fibonacci lattice) and keeps those on land, using Natural Earth 1:50m land (public domain) via
// world-atlas. Run once with `npm run globe:land`; the site ships only the output, never map data.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { geoContains } from 'd3-geo';
import { feature } from 'topojson-client';

const SAMPLES = 30000;
const OUT = 'src/assets/globe/land-points.json';

const topology = JSON.parse(
  readFileSync(new URL('../node_modules/world-atlas/land-50m.json', import.meta.url), 'utf8'),
);
const land = feature(topology, topology.objects.land);

const golden = Math.PI * (3 - Math.sqrt(5));
const points = [];
for (let i = 0; i < SAMPLES; i++) {
  const y = 1 - (2 * (i + 0.5)) / SAMPLES;
  const lat = (Math.asin(y) * 180) / Math.PI;
  const lon = (((((i * golden * 180) / Math.PI) % 360) + 360) % 360) - 180;
  if (geoContains(land, [lon, lat])) points.push(+lat.toFixed(2), +lon.toFixed(2));
}

mkdirSync('src/assets/globe', { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify({
    source: 'Natural Earth 1:50m land via world-atlas (public domain)',
    samples: SAMPLES,
    // Flat [lat, lon, lat, lon, …] in degrees.
    points,
  }) + '\n',
);
console.log(`globe:land wrote ${points.length / 2} land points to ${OUT}`);
