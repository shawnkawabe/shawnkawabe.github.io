import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CloudConstellation, { type CloudNode } from '@/components/patterns/CloudConstellation';
import en from '@/i18n/en.json';
import { hasWebGL2 } from '@/lib/constellation';

const ui = { cards: en.cards, constellation: en.constellation };

// WebGL is out of reach in jsdom: the scene becomes one button per node that reports a click.
vi.mock('@/components/three/ConstellationCanvas', () => ({
  default: ({ nodes, onSelect }: { nodes: CloudNode[]; onSelect: (index: number) => void }) => (
    <div data-testid="canvas">
      {nodes.map((node, index) => (
        <button key={node.id} type="button" tabIndex={-1} onClick={() => onSelect(index)}>
          {`scene ${node.id}`}
        </button>
      ))}
    </div>
  ),
}));

const nodes: CloudNode[] = [
  {
    id: 'sales-cloud',
    label: 'Sales Cloud',
    accent: 'cloud-sales',
    projectCount: 2,
    certifications: [{ id: 'admin', label: 'Salesforce Certified Administrator' }],
    projects: [
      { id: 'brf', title: 'BRF' },
      { id: 'ihara', title: 'Ihara' },
    ],
  },
  {
    id: 'service-cloud',
    label: 'Service Cloud',
    accent: undefined,
    projectCount: 1,
    certifications: [],
    projects: [{ id: 'brf', title: 'BRF' }],
  },
  {
    id: 'data-cloud',
    label: 'Data Cloud',
    accent: undefined,
    projectCount: 0,
    certifications: [{ id: 'data', label: 'Data Cloud Consultant' }],
    projects: [],
  },
];

function stubEnvironment({ desktop = true, reducedMotion = false, webgl2 = true } = {}) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('reduce') ? reducedMotion : desktop,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    (webgl2 ? {} : null) as never,
  );
}

const fallback = <p>Bento fallback</p>;

describe('CloudConstellation', () => {
  // jsdom has no <dialog> API: model the parts the panel relies on.
  beforeEach(() => {
    vi.restoreAllMocks();
    const proto = HTMLDialogElement.prototype as HTMLDialogElement & Record<string, unknown>;
    proto.showModal = function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
    proto.close = function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    };
  });

  it.each([
    ['a narrow screen', { desktop: false }],
    ['reduced motion', { reducedMotion: true }],
    ['no WebGL2', { webgl2: false }],
  ])('keeps the bento on %s', (_, env) => {
    stubEnvironment(env);
    render(
      <CloudConstellation ui={ui} workPath="/en/work" nodes={nodes}>
        {fallback}
      </CloudConstellation>,
    );
    expect(screen.getByText('Bento fallback')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('keeps the bento when there are no clouds', () => {
    stubEnvironment();
    render(
      <CloudConstellation ui={ui} workPath="/en/work" nodes={[]}>
        {fallback}
      </CloudConstellation>,
    );
    expect(screen.getByText('Bento fallback')).toBeInTheDocument();
  });

  it('moves focus through the node list with roving tabindex', async () => {
    stubEnvironment();
    const user = userEvent.setup();
    render(
      <CloudConstellation ui={ui} workPath="/en/work" nodes={nodes}>
        {fallback}
      </CloudConstellation>,
    );
    const list = await screen.findByRole('list', { name: /Clouds/ });
    const buttons = [...list.querySelectorAll('button')];
    expect(buttons.map((button) => button.tabIndex)).toEqual([0, -1, -1]);

    await user.tab();
    expect(buttons[0]).toHaveFocus();
    expect(buttons[0]).toHaveAttribute('data-active');
    await user.keyboard('{ArrowUp}');
    expect(buttons[2]).toHaveFocus();
    expect(buttons.map((button) => button.tabIndex)).toEqual([-1, -1, 0]);
    await user.keyboard('{Home}');
    expect(buttons[0]).toHaveFocus();
    await user.keyboard('{x}');
    expect(buttons[0]).toHaveFocus();
  });

  it('opens the panel from a list button and returns focus to it on close', async () => {
    stubEnvironment();
    const user = userEvent.setup();
    render(
      <CloudConstellation ui={ui} workPath="/en/work" nodes={nodes}>
        {fallback}
      </CloudConstellation>,
    );
    const sales = await screen.findByRole('button', { name: /^Sales Cloud/ });

    await user.click(sales);
    const panel = screen.getByRole('dialog', { name: 'Sales Cloud' });
    expect(panel).toHaveAttribute('open');
    expect(screen.getByText('Salesforce Certified Administrator')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ihara' })).toHaveAttribute('href', '/en/work/ihara');
    expect(screen.getByRole('link', { name: 'See projects' })).toHaveAttribute(
      'href',
      '/en/work?cloud=sales-cloud',
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(panel).not.toHaveAttribute('open');
    expect(sales).toHaveFocus();
  });

  it('opens from the scene, hides empty sections and closes on the backdrop', async () => {
    stubEnvironment();
    const user = userEvent.setup();
    const { container } = render(
      <CloudConstellation ui={ui} workPath="/en/work" nodes={nodes}>
        {fallback}
      </CloudConstellation>,
    );

    await user.click(await screen.findByRole('button', { name: 'scene data-cloud' }));
    const panel = container.querySelector('dialog')!;
    expect(panel).toHaveAttribute('open');
    expect(screen.getByText('Data Cloud Consultant')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'See projects' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Projects' })).not.toBeInTheDocument();

    await user.click(panel);
    expect(panel).not.toHaveAttribute('open');
    expect(screen.getByRole('button', { name: /^Data Cloud/ })).toHaveFocus();
  });
});

describe('hasWebGL2', () => {
  it('reports the context and survives a throwing canvas', () => {
    const doc = (getContext: () => unknown) =>
      ({ createElement: () => ({ getContext }) }) as unknown as Document;
    expect(hasWebGL2(doc(() => ({})))).toBe(true);
    expect(hasWebGL2(doc(() => null))).toBe(false);
    expect(
      hasWebGL2(
        doc(() => {
          throw new Error('blocked');
        }),
      ),
    ).toBe(false);
  });
});
