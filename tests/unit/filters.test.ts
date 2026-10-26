import { describe, expect, it } from 'vitest';
import { parseFilters, serializeFilters } from '@/lib/filters';

const valid = {
  clouds: new Set(['sales-cloud', 'service-cloud']),
  caps: new Set(['lwc', 'apex', 'gearset', 'sales-cloud']),
};

describe('parseFilters', () => {
  it('reads comma-separated cloud and cap ids', () => {
    expect(parseFilters('?cloud=sales-cloud,service-cloud&cap=lwc', valid)).toEqual({
      clouds: ['sales-cloud', 'service-cloud'],
      caps: ['lwc'],
    });
  });

  it('keeps a valid skill id that is outside the facet list (cap=gearset)', () => {
    expect(parseFilters('?cap=gearset', valid).caps).toEqual(['gearset']);
  });

  it('ignores unknown ids, blanks and duplicates', () => {
    expect(parseFilters('?cloud=nonsense&cap=lwc,,lwc, apex ,nonsense', valid)).toEqual({
      clouds: [],
      caps: ['lwc', 'apex'],
    });
  });

  it('returns empty groups when params are missing', () => {
    expect(parseFilters('', valid)).toEqual({ clouds: [], caps: [] });
  });

  it('accepts URLSearchParams', () => {
    expect(parseFilters(new URLSearchParams({ cloud: 'sales-cloud' }), valid).clouds).toEqual([
      'sales-cloud',
    ]);
  });
});

describe('serializeFilters', () => {
  it('writes readable comma-separated params', () => {
    expect(serializeFilters({ clouds: ['sales-cloud', 'service-cloud'], caps: ['lwc'] })).toBe(
      '?cloud=sales-cloud,service-cloud&cap=lwc',
    );
  });

  it('omits empty groups', () => {
    expect(serializeFilters({ clouds: [], caps: ['apex'] })).toBe('?cap=apex');
    expect(serializeFilters({ clouds: ['sales-cloud'], caps: [] })).toBe('?cloud=sales-cloud');
  });

  it('returns an empty string when nothing is selected', () => {
    expect(serializeFilters({ clouds: [], caps: [] })).toBe('');
  });

  it('round-trips through parseFilters', () => {
    const state = { clouds: ['service-cloud'], caps: ['gearset', 'lwc'] };
    expect(parseFilters(serializeFilters(state), valid)).toEqual(state);
  });
});
