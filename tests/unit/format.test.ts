import { describe, expect, it } from 'vitest';
import { employerNames } from '@/lib/format';
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
