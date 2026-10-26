import { describe, expect, it } from 'vitest';
import { employerNames, plural } from '@/lib/format';
import { experience } from './fixtures';

describe('employerNames', () => {
  const companies = [experience('globant', 'Globant'), experience('nescara', 'Nescara')];

  it('joins employer names with a middle dot in the project order', () => {
    expect(employerNames({ employers: ['nescara', 'globant'] }, companies)).toBe(
      'Nescara · Globant',
    );
  });

  it('skips ids that are not in experience', () => {
    expect(employerNames({ employers: ['nescara', 'unknown'] }, companies)).toBe('Nescara');
  });
});

describe('plural', () => {
  const forms = { one: '{count} project', other: '{count} projects' };

  it('picks the English plural form for the count', () => {
    expect(plural(forms, 1)).toBe('1 project');
    expect(plural(forms, 0)).toBe('0 projects');
    expect(plural(forms, 7)).toBe('7 projects');
  });
});
