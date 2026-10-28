import { describe, expect, it } from 'vitest';
import {
  cloudStats,
  credentialSkills,
  filterProjects,
  inFileOrder,
  prevNext,
  productIndex,
  skillGroupChips,
  skillStats,
  sortProjects,
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

describe('productIndex (L-47)', () => {
  const skills = [
    skill('gearset', 'devops'),
    skill('fonteva', 'products'),
    skill('aws', 'integration'),
  ];
  const projects = [
    project({ id: 'p1', clouds: [], capabilities: ['gearset', 'aws'] }),
    project({ id: 'p2', clouds: [], capabilities: ['aws'] }),
  ];

  it('keeps the curated order, not the order of skills.json', () => {
    expect(ids(productIndex(['aws', 'gearset'], skills, projects))).toEqual(['aws', 'gearset']);
  });

  it('carries each label and project count', () => {
    expect(productIndex(['gearset', 'fonteva', 'aws'], skills, projects)).toEqual([
      { id: 'gearset', label: 'gearset', projectCount: 1, state: 'listed' },
      { id: 'fonteva', label: 'fonteva', projectCount: 0, state: 'dormant' },
      { id: 'aws', label: 'aws', projectCount: 2, state: 'linked' },
    ]);
  });

  it('lists release tooling without linking it, however many projects it has', () => {
    // Decision 22: Gearset runs on every Orchid project without any being tagged, so a count
    // would under-report it. `gearset` has a project here and is still `listed`, not `linked`.
    const [gearset, aws] = productIndex(['gearset', 'aws'], skills, projects);
    expect(gearset).toMatchObject({ projectCount: 1, state: 'listed' });
    expect(aws).toMatchObject({ projectCount: 2, state: 'linked' });
  });

  it('separates a listed tool from a dormant product, which only looks the same', () => {
    // Both render without a link, but only `dormant` means "no project uses this yet".
    const [gearset, fonteva] = productIndex(['gearset', 'fonteva'], skills, projects);
    expect(gearset.state).toBe('listed');
    expect(fonteva.state).toBe('dormant');
  });

  it('draws from any group, so a tool keeps its capability group', () => {
    // gearset is `devops` and aws is `integration`; neither is in the `products` group.
    expect(ids(productIndex(['gearset', 'aws'], skills, projects))).toHaveLength(2);
  });

  it('skips ids missing from skills.json rather than rendering a blank row', () => {
    expect(ids(productIndex(['gearset', 'retired-id', 'aws'], skills, projects))).toEqual([
      'gearset',
      'aws',
    ]);
  });

  it('returns nothing for an empty list, which hides the section', () => {
    expect(productIndex([], skills, projects)).toEqual([]);
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

describe('skillGroupChips (SPEC §5.4)', () => {
  const skills = [
    skill('sales-cloud', 'clouds', 'cloud-sales'),
    skill('apex', 'development'),
    skill('aura', 'development'),
    // A valid group that `groups` below does not list, proving such skills are not rendered.
    skill('jira', 'delivery'),
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

describe('credentialSkills', () => {
  it('keeps known skills, clouds first, with their accent', () => {
    const skills = [skill('apex', 'development'), skill('sales-cloud', 'clouds', 'cloud-sales')];
    const result = credentialSkills(
      certification('admin', ['apex', 'gone', 'sales-cloud']),
      skills,
    );
    expect(result.map((entry) => entry.id)).toEqual(['sales-cloud', 'apex']);
    expect(result[0].accent).toBe('cloud-sales');
  });
});
