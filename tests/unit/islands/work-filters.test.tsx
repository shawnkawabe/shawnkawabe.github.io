import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import WorkFilters, { type WorkFiltersProps } from '@/components/patterns/WorkFilters';

const props: WorkFiltersProps = {
  clouds: [
    { id: 'sales-cloud', label: 'Sales Cloud', count: 2, accent: 'cloud-sales' },
    { id: 'service-cloud', label: 'Service Cloud', count: 1 },
  ],
  capabilities: [
    { id: 'lwc', label: 'LWC', count: 2 },
    { id: 'apex', label: 'Apex', count: 1 },
  ],
  allSkills: { lwc: 'LWC', apex: 'Apex', gearset: 'Gearset' },
  total: 3,
  gridId: 'grid',
};

const projects = [
  { id: 'a', clouds: 'sales-cloud', caps: 'lwc,apex' },
  { id: 'b', clouds: 'sales-cloud,service-cloud', caps: 'lwc' },
  { id: 'c', clouds: 'service-cloud', caps: 'gearset' },
];

function setup(search = '') {
  window.history.replaceState(null, '', `/work${search}`);
  const grid = document.createElement('ul');
  grid.id = 'grid';
  for (const project of projects) {
    const item = document.createElement('li');
    item.id = project.id;
    item.dataset.clouds = project.clouds;
    item.dataset.caps = project.caps;
    grid.append(item);
  }
  document.body.append(grid);
  render(<WorkFilters {...props} />);
  return { user: userEvent.setup() };
}

const shown = () =>
  [...document.querySelectorAll<HTMLElement>('#grid > li')]
    .filter((item) => !item.hidden)
    .map((item) => item.id);

const chip = (name: RegExp) => screen.getByRole('button', { name });

afterEach(() => document.getElementById('grid')?.remove());

describe('WorkFilters', () => {
  it('applies filters from the URL: OR within a group, AND across groups', () => {
    setup('?cloud=sales-cloud,service-cloud&cap=apex');
    expect(shown()).toEqual(['a']);
    expect(chip(/^Sales Cloud/)).toHaveAttribute('aria-pressed', 'true');
    expect(chip(/^Apex/)).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('1 project')).toHaveAttribute('aria-live', 'polite');
  });

  it('adds a valid skill id outside the facets as a selected chip and ignores unknown ids', () => {
    setup('?cap=gearset,nonsense&cloud=bogus');
    expect(chip(/^Gearset/)).toHaveAttribute('aria-pressed', 'true');
    expect(chip(/^Gearset/)).toHaveTextContent('1');
    expect(screen.queryByRole('button', { name: /nonsense|bogus/ })).toBeNull();
    expect(shown()).toEqual(['c']);
  });

  it('toggles chips, writes the URL and restores the previous state on Back', async () => {
    const { user } = setup();
    expect(shown()).toEqual(['a', 'b', 'c']);

    await user.click(chip(/^LWC/));
    expect(window.location.search).toBe('?cap=lwc');
    expect(shown()).toEqual(['a', 'b']);

    await user.click(chip(/^Service Cloud/));
    expect(window.location.search).toBe('?cloud=service-cloud&cap=lwc');
    expect(shown()).toEqual(['b']);

    act(() => {
      window.history.back();
    });
    await new Promise((resolve) => window.addEventListener('popstate', resolve, { once: true }));
    expect(window.location.search).toBe('?cap=lwc');
    expect(chip(/^Service Cloud/)).toHaveAttribute('aria-pressed', 'false');
    expect(shown()).toEqual(['a', 'b']);
  });

  it('adds no history entry when Clear changes nothing', async () => {
    const { user } = setup();
    const before = window.history.length;
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(window.history.length).toBe(before);
  });

  it('shows the empty state and clears every filter, keeping focus in the bar', async () => {
    const { user } = setup('?cloud=service-cloud&cap=apex');
    expect(shown()).toEqual([]);
    expect(screen.getByText('0 projects')).toBeInTheDocument();
    expect(screen.getByText('No projects match these filters')).toBeInTheDocument();

    const [barClear, emptyClear] = screen.getAllByRole('button', { name: 'Clear' });
    await user.click(emptyClear);
    expect(window.location.search).toBe('');
    expect(shown()).toEqual(['a', 'b', 'c']);
    expect(screen.queryByText('No projects match these filters')).toBeNull();
    expect(barClear).toHaveFocus();
  });
});
