import { describe, expect, it } from 'vitest';
import { credentialParts, emphasisParts, employerNames, lastWordParts, plural } from '@/lib/format';
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

describe('emphasisParts', () => {
  it('marks **terms** as strong and keeps the text around them', () => {
    expect(emphasisParts('I build **LWC** and **Apex** daily')).toEqual([
      { text: 'I build ', strong: false },
      { text: 'LWC', strong: true },
      { text: ' and ', strong: false },
      { text: 'Apex', strong: true },
      { text: ' daily', strong: false },
    ]);
  });

  it('returns plain text unchanged and drops empty parts', () => {
    expect(emphasisParts('No emphasis')).toEqual([{ text: 'No emphasis', strong: false }]);
    expect(emphasisParts('**All**')).toEqual([{ text: 'All', strong: true }]);
  });
});

describe('credentialParts', () => {
  it('splits the issuer off at "Certified"', () => {
    expect(credentialParts('Salesforce Certified Platform Developer I')).toEqual({
      issuer: 'Salesforce Certified',
      title: 'Platform Developer I',
    });
  });

  it('keeps a name without "Certified" whole', () => {
    expect(credentialParts(' Scrum Master ')).toEqual({ issuer: '', title: 'Scrum Master' });
  });
});

describe('lastWordParts', () => {
  it('splits before the last word and keeps the space with the lead', () => {
    expect(lastWordParts(' CRM solutions that teams actually adopt. ')).toEqual({
      lead: 'CRM solutions that teams actually ',
      last: 'adopt.',
    });
  });

  it('returns a single word as the last part', () => {
    expect(lastWordParts('Hello')).toEqual({ lead: '', last: 'Hello' });
  });
});
