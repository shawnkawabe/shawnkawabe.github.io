import { describe, expect, it } from 'vitest';
import { caseStudySections, outcomeValue, stackLinks, visibleImage } from '@/lib/case-study';
import type { ProjectSection } from '@/lib/schemas';
import { project, skill } from './fixtures';

const img = (src: string, approved = true) => ({ src, alt: `alt ${src}`, approved });
const onDisk = (src: string) => !src.includes('missing');

const sections: ProjectSection[] = [
  { type: 'challenge', body: 'First challenge' },
  { type: 'challenge', body: 'Second challenge is ignored' },
  { type: 'decisions', items: [{ decision: 'D', why: 'W' }] },
  {
    type: 'gallery',
    images: [img('/img/p/01.webp'), img('/img/p/02.webp', false), img('/img/p/03-missing.webp')],
  },
  { type: 'outcomes', items: [{ label: 'Outcome', measured: false }] },
  { type: 'takeaway', body: 'Lesson' },
];

describe('visibleImage', () => {
  it('shows an image only when it is approved and its file exists', () => {
    expect(visibleImage(img('/a.webp'), onDisk)).toMatchObject({ src: '/a.webp' });
    expect(visibleImage(img('/a.webp', false), onDisk)).toBeUndefined();
    expect(visibleImage(img('/missing.webp'), onDisk)).toBeUndefined();
    expect(visibleImage(undefined, onDisk)).toBeUndefined();
  });
});

describe('caseStudySections (SPEC §5.3)', () => {
  it('keeps the first section of each type and only visible images', () => {
    const result = caseStudySections(project({ id: 'p', depth: 'case-study', sections }), onDisk);
    expect(result.challenge?.body).toBe('First challenge');
    expect(result.gallery?.images.map((image) => image.src)).toEqual(['/img/p/01.webp']);
    expect(Object.keys(result)).toEqual([
      'challenge',
      'decisions',
      'gallery',
      'outcomes',
      'takeaway',
    ]);
  });

  it('gives card-depth projects only the challenge and outcomes', () => {
    const result = caseStudySections(project({ id: 'p', depth: 'card', sections }), onDisk);
    expect(Object.keys(result)).toEqual(['challenge', 'outcomes']);
  });

  it('drops sections left empty', () => {
    const empty: ProjectSection[] = [
      { type: 'gallery', images: [img('/img/p/01.webp', false)] },
      { type: 'outcomes', items: [] },
    ];
    expect(
      caseStudySections(project({ id: 'p', depth: 'case-study', sections: empty }), onDisk),
    ).toEqual({});
  });
});

describe('outcomeValue', () => {
  it('returns the number only when it was measured', () => {
    expect(outcomeValue({ value: '40%', measured: true })).toBe('40%');
    expect(outcomeValue({ value: '40%', measured: false })).toBeUndefined();
  });
});

describe('stackLinks', () => {
  it('links clouds then capabilities to the filtered Work page and skips unknown ids', () => {
    const skills = [skill('sales-cloud', 'clouds', 'cloud-sales'), skill('lwc', 'development')];
    const links = stackLinks(
      { clouds: ['sales-cloud', 'ghost-cloud'], capabilities: ['lwc', 'nonsense'] },
      skills,
    );
    expect(links).toEqual([
      {
        id: 'sales-cloud',
        label: 'sales cloud',
        href: '/work?cloud=sales-cloud',
        accent: 'cloud-sales',
      },
      { id: 'lwc', label: 'lwc', href: '/work?cap=lwc', accent: undefined },
    ]);
  });
});
