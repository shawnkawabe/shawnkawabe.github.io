import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import skills from '../../content/en/skills.json';

const dir = 'src/assets/icons/clouds';
const files = readdirSync(dir).filter((file) => file.endsWith('.svg'));
const cloudIds = skills.filter((skill) => skill.group === 'clouds').map((skill) => skill.id);

describe('cloud icons (DESIGN §8)', () => {
  it('has exactly one icon per cloud skill, named by its id', () => {
    expect(files.map((file) => file.replace('.svg', '')).sort()).toEqual([...cloudIds].sort());
  });

  it.each(files)('%s is a 24px, 1.5px-stroke line icon in currentColor', (file) => {
    const svg = readFileSync(`${dir}/${file}`, 'utf8');
    expect(svg).toContain('viewBox="0 0 24 24"');
    expect(svg).toContain('stroke="currentColor"');
    expect(svg).toContain('stroke-width="1.5"');
    expect(svg).toContain('fill="none"');
    expect(svg).not.toMatch(/#[0-9a-f]{3,8}\b|rgb|hsl|<image|<text/i);
  });
});
