// SPEC §5.2: cloud and capability chips filter the server-rendered grid and stay in sync with the URL.
// Grid items carry data-clouds / data-caps; the page hides the bar without JavaScript ([data-js-only]).
import { useEffect, useId, useRef, useState } from 'react';
import en from '@/i18n/en.json';
import { filterProjects, type FilterState } from '@/lib/derive';
import { parseFilters, serializeFilters, type ValidFilterIds } from '@/lib/filters';
import { plural } from '@/lib/format';

export type FacetOption = { id: string; label: string; count: number; accent?: string };

export type WorkFiltersProps = {
  clouds: FacetOption[];
  capabilities: FacetOption[];
  /** id → label for every capability id the URL may name, including ids outside the facet list. */
  allSkills: Record<string, string>;
  total: number;
  gridId: string;
};

type GridItem = { element: HTMLElement; clouds: string[]; capabilities: string[] };

const NONE: FilterState = { clouds: [], caps: [] };

// Plain buttons with fixed classes: ui/button pulls in Radix Slot and the cn() tables (~9 KB gz),
// and this island must keep /work under the 80 KB JS budget (ARCHITECTURE §9).
const BUTTON =
  'inline-flex h-10 items-center rounded-pill border px-5 font-body text-2 font-medium transition-colors duration-150 ease-standard';
const GHOST = `${BUTTON} border-transparent text-on-surface-2 hover:bg-surface-2 hover:text-on-surface-1`;
const NEUTRAL = `${BUTTON} border-border-1 bg-surface-3 text-on-surface-1 hover:border-border-2`;
const CHIP =
  'inline-flex h-7 items-center gap-2 rounded-pill border px-3 font-body text-2 whitespace-nowrap transition-colors duration-150 ease-standard hover:border-border-2 hover:text-on-surface-1';
const CHIP_ON = `${CHIP} border-accent-1 bg-accent-1/16 text-on-surface-1`;
const CHIP_OFF = `${CHIP} border-border-1 bg-surface-3 text-on-surface-2`;

const ids = (value: string | undefined) => (value ? value.split(',') : []);

function readGrid(gridId: string): GridItem[] {
  const items = document.getElementById(gridId)?.querySelectorAll<HTMLElement>('[data-clouds]');
  return [...(items ?? [])].map((element) => ({
    element,
    clouds: ids(element.dataset.clouds),
    capabilities: ids(element.dataset.caps),
  }));
}

const toggle = (list: string[], id: string) =>
  list.includes(id) ? list.filter((value) => value !== id) : [...list, id];

export default function WorkFilters({
  clouds,
  capabilities,
  allSkills,
  total,
  gridId,
}: WorkFiltersProps) {
  const [items, setItems] = useState<GridItem[]>([]);
  const [filters, setFilters] = useState<FilterState>(NONE);
  // Capability ids from the URL that are not facets (e.g. a Stack chip's `cap=gearset`) stay as chips.
  const [extraCaps, setExtraCaps] = useState<string[]>([]);
  const clearRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const valid: ValidFilterIds = {
      clouds: new Set(clouds.map((option) => option.id)),
      caps: new Set(Object.keys(allSkills)),
    };
    const facetCaps = new Set(capabilities.map((option) => option.id));
    const fromUrl = () => {
      const state = parseFilters(window.location.search, valid);
      setFilters(state);
      setExtraCaps((extra) => [
        ...extra,
        ...state.caps.filter((id) => !facetCaps.has(id) && !extra.includes(id)),
      ]);
    };
    setItems(readGrid(gridId));
    fromUrl();
    window.addEventListener('popstate', fromUrl);
    return () => window.removeEventListener('popstate', fromUrl);
  }, [clouds, capabilities, allSkills, gridId]);

  const visible = filterProjects(items, filters);
  const count = items.length > 0 ? visible.length : total;

  useEffect(() => {
    const shown = new Set(visible.map((item) => item.element));
    for (const item of items) item.element.hidden = !shown.has(item.element);
  });

  const update = (next: FilterState) => {
    setFilters(next);
    const { pathname, search, hash } = window.location;
    const query = serializeFilters(next);
    // Clear with nothing selected must not add a Back step that changes nothing.
    if (query !== search) window.history.pushState(null, '', `${pathname}${query}${hash}`);
  };

  const capOptions: FacetOption[] = [
    ...capabilities,
    ...extraCaps.map((id) => ({
      id,
      label: allSkills[id],
      count: items.filter((item) => item.capabilities.includes(id)).length,
    })),
  ];

  return (
    <div className="flex flex-col gap-5">
      <FacetGroup
        label={en.work.cloud}
        options={clouds}
        selected={filters.clouds}
        onToggle={(id) => update({ ...filters, clouds: toggle(filters.clouds, id) })}
      />
      <FacetGroup
        label={en.work.capability}
        options={capOptions}
        selected={filters.caps}
        onToggle={(id) => update({ ...filters, caps: toggle(filters.caps, id) })}
      />
      <div className="flex items-center gap-4">
        <p
          aria-live="polite"
          aria-atomic="true"
          className="font-mono text-1 tracking-label text-on-surface-2 uppercase"
        >
          {plural(en.cards.projects, count)}
        </p>
        <button ref={clearRef} type="button" className={GHOST} onClick={() => update(NONE)}>
          {en.work.clear}
        </button>
      </div>
      {count === 0 && (
        <div className="flex flex-col items-start gap-4 rounded-md border border-border-1 bg-surface-2 p-6">
          <p className="text-3">{en.work.empty}</p>
          <button
            type="button"
            className={NEUTRAL}
            onClick={() => {
              update(NONE);
              // This button disappears with the empty state; keep focus in the filter bar.
              clearRef.current?.focus();
            }}
          >
            {en.work.clear}
          </button>
        </div>
      )}
    </div>
  );
}

type FacetGroupProps = {
  label: string;
  options: FacetOption[];
  selected: string[];
  onToggle: (id: string) => void;
};

function FacetGroup({ label, options, selected, onToggle }: FacetGroupProps) {
  const labelId = useId();
  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col gap-2">
      <p id={labelId} className="font-mono text-1 tracking-label text-on-surface-2 uppercase">
        {label}
      </p>
      <ul className="flex flex-wrap gap-2">
        {options.map((option) => {
          const pressed = selected.includes(option.id);
          return (
            <li key={option.id}>
              <button
                type="button"
                aria-pressed={pressed}
                onClick={() => onToggle(option.id)}
                className={pressed ? CHIP_ON : CHIP_OFF}
              >
                {option.accent && (
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0 rounded-pill"
                    style={{ backgroundColor: `var(--pf-g-color-${option.accent})` }}
                  />
                )}
                {option.label}
                {/* The chip reads "Lightning Web Components, 9" instead of running the two together. */}
                <span className="sr-only">, </span>
                <span className="font-mono text-1">{option.count}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
