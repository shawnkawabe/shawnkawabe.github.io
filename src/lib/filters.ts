// Work page filter state ⇄ URL: /work?cloud=sales-cloud,service-cloud&cap=lwc (SPEC §5.2).
import type { FilterState } from './derive';

export type ValidFilterIds = { clouds: ReadonlySet<string>; caps: ReadonlySet<string> };

function parseList(value: string | null, valid: ReadonlySet<string>): string[] {
  if (!value) return [];
  const ids = value.split(',').map((id) => id.trim());
  return [...new Set(ids)].filter((id) => valid.has(id));
}

/** Unknown ids are dropped; `caps` accepts any valid skill id, not only the facet list. */
export function parseFilters(search: string | URLSearchParams, valid: ValidFilterIds): FilterState {
  const params = typeof search === 'string' ? new URLSearchParams(search) : search;
  return {
    clouds: parseList(params.get('cloud'), valid.clouds),
    caps: parseList(params.get('cap'), valid.caps),
  };
}

/** "?cloud=a,b&cap=c", or "" when nothing is selected. Ids match /^[a-z0-9-]+$/, so commas stay readable. */
export function serializeFilters(state: FilterState): string {
  const parts = [
    state.clouds.length > 0 ? `cloud=${state.clouds.join(',')}` : '',
    state.caps.length > 0 ? `cap=${state.caps.join(',')}` : '',
  ].filter(Boolean);
  return parts.length > 0 ? `?${parts.join('&')}` : '';
}
