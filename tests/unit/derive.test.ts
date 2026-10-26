import { describe, expect, it } from 'vitest';
import {
  cloudStats,
  filterProjects,
  inFileOrder,
  prevNext,
  skillGroupChips,
  skillStats,
  sortProjects,
  withBentoSize,
} from '@/lib/derive';
import { certification, project, skill } from './fixtures';

const ids = (items: { id: string }[]) => items.map((item) => item.id);

describe('inFileOrder', () => {
  it('restores the file order of id-sorted collection entries', () => {
    const fromCollection = [{ id: 'apex' }, { id: 'sales-cloud' }, { id: 'service-cloud' }];
    const file = [{ id: 'sales-cloud' }, { id: 'service-cloud' }, { id: 'apex' }];
    expect(ids(inFileOrder(fromCollection, file))).toEqual([
      'sales-cloud',
      'service-cloud',
      'apex',
    ]);
  });

  it('puts ids missing from the file last, in their original order', () => {
    const items = [{ id: 'x' }, { id: 'b' }, { id: 'y' }, { id: 'a' }];
    expect(ids(inFileOrder(items, [{ id: 'a' }, { id: 'b' }]))).toEqual(['a', 'b', 'x', 'y']);
  });
});

describe('sortProjects', () => {
  it('puts featured projects first and keeps file order within each group', () => {
    const projects = [
      project({ id: 'a' }),
      project({ id: 'b', featured: true }),
      project({ id: 'c' }),
      project({ id: 'd', featured: true }),
    ];
    expect(ids(sortProjects(projects))).toEqual(['b', 'd', 'a', 'c']);
  });

  it('does not mutate its input', () => {
    const projects = [project({ id: 'a' }), project({ id: 'b', featured: true })];
    sortProjects(projects);
    expect(ids(projects)).toEqual(['a', 'b']);
  });
});

describe('skillStats', () => {
  it('counts projects that use a skill as a cloud or a capability, in skills order', () => {
    const skills = [
      skill('lwc', 'development'),
      skill('sales-cloud', 'clouds'),
      skill('apex', 'development'),
    ];
    const projects = [
      project({ id: 'p1', clouds: ['sales-cloud'], capabilities: ['lwc'] }),
      project({ id: 'p2', clouds: ['sales-cloud'], capabilities: [] }),
    ];
    expect(skillStats(skills, projects)).toEqual([
      { id: 'lwc', projectCount: 1, projectIds: ['p1'] },
      { id: 'sales-cloud', projectCount: 2, projectIds: ['p1', 'p2'] },
      { id: 'apex', projectCount: 0, projectIds: [] },
    ]);
  });
});

describe('cloudStats', () => {
  const skills = [
    skill('sales-cloud', 'clouds', 'cloud-sales'),
    skill('service-cloud', 'clouds', 'cloud-service'),
    skill('data-cloud', 'clouds', 'cloud-data'),
    skill('lwc', 'development'),
  ];
  const projects = [
    project({ id: 'p1', title: 'Portal', clouds: ['sales-cloud'], capabilities: ['lwc'] }),
  ];
  const certifications = [certification('admin', ['service-cloud'])];

  it('returns only clouds, with projects and linked certifications', () => {
    const [sales, service] = cloudStats(skills, projects, certifications);
    expect(sales).toEqual({
      id: 'sales-cloud',
      label: 'sales cloud',
      accent: 'cloud-sales',
      projectCount: 1,
      projectIds: ['p1'],
      certifications: [],
      projects: [{ id: 'p1', title: 'Portal' }],
    });
    expect(service.certifications).toEqual([{ id: 'admin', label: 'admin label' }]);
    expect(service.projectCount).toBe(0);
  });

  it('excludes clouds with zero projects and zero certifications', () => {
    expect(ids(cloudStats(skills, projects, certifications))).toEqual([
      'sales-cloud',
      'service-cloud',
    ]);
  });
});

describe('prevNext', () => {
  const projects = [
    project({ id: 'a' }),
    project({ id: 'b', featured: true }),
    project({ id: 'c' }),
  ];

  it('returns neighbours in sort order', () => {
    const { prev, next } = prevNext(projects, 'a');
    expect([prev?.id, next?.id]).toEqual(['b', 'c']);
  });

  it('has no prev for the first and no next for the last project', () => {
    expect(prevNext(projects, 'b').prev).toBeUndefined();
    expect(prevNext(projects, 'c').next).toBeUndefined();
  });

  it('returns nothing for an unknown id', () => {
    expect(prevNext(projects, 'zzz')).toEqual({ prev: undefined, next: undefined });
  });
});

describe('filterProjects', () => {
  const projects = [
    project({ id: 'sales-lwc', clouds: ['sales-cloud'], capabilities: ['lwc'] }),
    project({ id: 'service-apex', clouds: ['service-cloud'], capabilities: ['apex'] }),
    project({
      id: 'both',
      clouds: ['sales-cloud', 'service-cloud'],
      capabilities: ['apex', 'lwc'],
    }),
  ];

  it('returns everything when nothing is selected', () => {
    expect(ids(filterProjects(projects, { clouds: [], caps: [] }))).toEqual([
      'sales-lwc',
      'service-apex',
      'both',
    ]);
  });

  it('ORs ids within a group', () => {
    expect(
      ids(filterProjects(projects, { clouds: ['sales-cloud', 'service-cloud'], caps: [] })),
    ).toEqual(['sales-lwc', 'service-apex', 'both']);
  });

  it('ANDs across groups', () => {
    expect(ids(filterProjects(projects, { clouds: ['service-cloud'], caps: ['lwc'] }))).toEqual([
      'both',
    ]);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterProjects(projects, { clouds: [], caps: ['mulesoft'] })).toEqual([]);
  });
});

describe('withBentoSize', () => {
  const sizes = (counts: number[]) =>
    withBentoSize(counts.map((projectCount) => ({ projectCount }))).map((cloud) => cloud.size);

  it('makes the cloud with most projects 2×2 and those with at least half as many 2×1', () => {
    expect(sizes([2, 7, 4, 3, 0])).toEqual(['base', 'feature', 'wide', 'base', 'base']);
  });

  it('gives a tie for the top to the first cloud', () => {
    expect(sizes([5, 5])).toEqual(['feature', 'wide']);
  });

  it('never widens a cloud without projects', () => {
    expect(sizes([0, 0])).toEqual(['feature', 'base']);
    expect(sizes([])).toEqual([]);
  });
});

describe('skillGroupChips (SPEC §5.4)', () => {
  const skills = [
    skill('sales-cloud', 'clouds', 'cloud-sales'),
    skill('apex', 'development'),
    skill('aura', 'development'),
    skill('jira', 'tools'),
  ];
  const projects = [project({ id: 'p', clouds: ['sales-cloud'], capabilities: ['apex'] })];
  const groups = [
    { id: 'development', label: 'Development' },
    { id: 'clouds', label: 'Clouds' },
    { id: 'data', label: 'Data' },
  ];

  it('follows the site group order, links skills with projects and leaves the rest unlinked', () => {
    const result = skillGroupChips(groups, skills, projects);
    expect(result.map((group) => group.label)).toEqual(['Development', 'Clouds']);
    expect(result[0].skills).toEqual([
      { id: 'apex', label: 'apex', count: 1, href: '/work?cap=apex', accent: undefined },
      { id: 'aura', label: 'aura', count: 0, href: undefined, accent: undefined },
    ]);
    expect(result[1].skills[0]).toMatchObject({ href: '/work?cloud=sales-cloud', count: 1 });
  });
});
