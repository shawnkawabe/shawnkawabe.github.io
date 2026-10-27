import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';

let rootBlock = '';
let lightBlock = '';

const declarations = (block: string) =>
  new Map(
    [...block.matchAll(/(--pf-g-[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value]),
  );

// Names required by DESIGN §3.1, §3.2, §5 and §6.
const SEMANTIC_COLORS = [
  'surface-0',
  'surface-1',
  'surface-2',
  'surface-3',
  'on-surface-1',
  'on-surface-2',
  'on-surface-3',
  'border-1',
  'border-2',
  'accent-1',
  'accent-1-strong',
  'accent-2',
  'accent-3',
  'on-accent',
  'success',
  'warning',
  'error',
  'focus-ring',
  'glow-1',
  'globe-shade',
  'globe-lit',
  'globe-dot',
  'shape-shade',
  'shape-lit',
];
const CLOUDS = ['sales', 'service', 'experience', 'commerce', 'data', 'platform', 'membership'];
const SPACING = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32];
const OTHER = [
  'radius-sm',
  'radius-md',
  'radius-lg',
  'radius-pill',
  'shadow-1',
  'shadow-2',
  'duration-fast',
  'duration-base',
  'duration-slow',
  'easing-standard',
  'easing-emphasised',
  'font-family-display',
  'font-family-heading',
  'font-family-body',
  'font-family-mono',
  'font-family-serif',
];

beforeAll(() => {
  execFileSync(process.execPath, ['style-dictionary.config.js']);
  const css = readFileSync('src/styles/tokens.css', 'utf8');
  [, rootBlock = '', lightBlock = ''] =
    css.match(/:root \{([\s\S]*?)\}[\s\S]*\[data-theme="light"\] \{([\s\S]*?)\}/) ?? [];
});

describe('generated tokens.css', () => {
  it('starts with a generated, do-not-edit header', () => {
    expect(readFileSync('src/styles/tokens.css', 'utf8')).toMatch(
      /^\/\*\*\n \* GENERATED[^\n]*Do not edit/,
    );
  });

  it('defines every variable named in DESIGN on :root', () => {
    const root = declarations(rootBlock);
    const expected = [
      ...SEMANTIC_COLORS.map((t) => `color-${t}`),
      ...CLOUDS.map((c) => `color-cloud-${c}`),
      ...SPACING.map((n) => `spacing-${n}`),
      ...OTHER,
    ].map((t) => `--pf-g-${t}`);
    expect(expected.filter((name) => !root.has(name))).toEqual([]);
  });

  it('overrides every semantic colour and shadow in the light theme, and nothing else', () => {
    const light = [...declarations(lightBlock).keys()].sort();
    const expected = [
      ...SEMANTIC_COLORS.map((t) => `--pf-g-color-${t}`),
      ...CLOUDS.map((c) => `--pf-g-color-cloud-${c}`),
      '--pf-g-shadow-1',
      '--pf-g-shadow-2',
    ].sort();
    expect(light).toEqual(expected);
  });

  it('keeps cloud accents identical in both themes', () => {
    const root = declarations(rootBlock);
    const light = declarations(lightBlock);
    for (const c of CLOUDS) {
      expect(light.get(`--pf-g-color-cloud-${c}`)).toBe(root.get(`--pf-g-color-cloud-${c}`));
    }
  });

  it('emits one fluid clamp() per differing min/max font size and no -min/-max variables', () => {
    const root = declarations(rootBlock);
    expect(root.get('--pf-g-font-size-3')).toBe('1rem');
    expect(root.get('--pf-g-font-size-5')).toBe('clamp(1.25rem, 1.162rem + 0.3756vw, 1.5rem)');
    for (const step of [4, 5, 6, 7, 8, 9]) {
      expect(root.get(`--pf-g-font-size-${step}`)).toMatch(/^clamp\(/);
    }
    expect(rootBlock).not.toMatch(/font-size-\d+-(min|max)/);
  });

  it('outputs colours as hex, or rgb() with alpha when alpha < 1', () => {
    const root = declarations(rootBlock);
    expect(root.get('--pf-g-color-surface-0')).toBe('#131313');
    expect(root.get('--pf-g-color-border-1')).toBe('rgb(255 255 255 / 0.08)');
    expect(root.get('--pf-g-shadow-2')).toBe('0px 16px 48px 0px rgb(0 0 0 / 0.4)');
  });

  it('keeps every text colour at WCAG AA on every surface and section shape, in both themes (L-36, L-38)', () => {
    const luminance = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((index) => {
        const channel = parseInt(hex.slice(index, index + 2), 16) / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contrast = (a: string, b: string) => {
      const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (light + 0.05) / (dark + 0.05);
    };
    const root = declarations(rootBlock);
    for (const theme of [root, new Map([...root, ...declarations(lightBlock)])]) {
      const color = (name: string) => theme.get(`--pf-g-color-${name}`)!;
      for (const surface of [
        'surface-0',
        'surface-1',
        'surface-2',
        'surface-3',
        'shape-shade',
        'shape-lit',
      ]) {
        for (const text of ['on-surface-1', 'on-surface-2', 'on-surface-3', 'accent-1']) {
          expect(
            contrast(color(text), color(surface)),
            `${text} on ${surface}`,
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it('keeps the greys neutral, with no blue tint (L-36)', () => {
    const root = declarations(rootBlock);
    for (const theme of [root, declarations(lightBlock)]) {
      for (const name of [
        'surface-0',
        'surface-1',
        'surface-2',
        'surface-3',
        'on-surface-1',
        'on-surface-2',
        'on-surface-3',
      ]) {
        const hex = theme.get(`--pf-g-color-${name}`)!;
        expect(new Set([hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)]).size, name).toBe(1);
      }
    }
  });

  it('never quotes generic font families', () => {
    expect(declarations(rootBlock).get('--pf-g-font-family-body')).toBe(
      "'Geist Variable', Geist, 'Geist Fallback', ui-sans-serif, system-ui, sans-serif",
    );
  });
});
