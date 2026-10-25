import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readJson = (name: string): unknown =>
  JSON.parse(readFileSync(new URL(`../../content/${name}.json`, import.meta.url), 'utf8'));

describe('content files', () => {
  it('site.json is a single object', () => {
    const site = readJson('site');
    expect(site).toBeTypeOf('object');
    expect(Array.isArray(site)).toBe(false);
  });

  it.each(['projects', 'skills', 'experience', 'certifications'])(
    '%s.json is an array of entries with unique ids',
    (name) => {
      const entries = readJson(name) as { id: string }[];
      expect(Array.isArray(entries)).toBe(true);
      const ids = entries.map((entry) => entry.id);
      expect(new Set(ids).size).toBe(ids.length);
    },
  );
});
