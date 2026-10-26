// SPEC §6 signature section. The server-rendered CloudBento arrives as `children` and stays the
// poster and the fallback (< 1024px, reduced motion, no WebGL2, while the 3D chunk loads). When the
// scene may run, an accessible node list drives a lazily loaded canvas and a side panel.
import { lazy, Suspense, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cards, constellation as t } from '@/i18n/en.json';
import type { CloudStat } from '@/lib/derive';
import { canRunScene, DESKTOP_QUERY, hasWebGL2, nextNodeIndex } from '@/lib/constellation';
import { trapFocus } from '@/lib/focus-trap';
import { plural } from '@/lib/format';
import { REDUCED_MOTION_QUERY } from '@/lib/motion';

const ConstellationCanvas = lazy(() => import('@/components/three/ConstellationCanvas'));

export type CloudNode = Pick<
  CloudStat,
  'id' | 'label' | 'accent' | 'projectCount' | 'certifications' | 'projects'
>;

export type CloudConstellationProps = { nodes: CloudNode[]; children?: ReactNode };

export default function CloudConstellation({ nodes, children }: CloudConstellationProps) {
  const [sceneAllowed, setSceneAllowed] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const reduced = window.matchMedia(REDUCED_MOTION_QUERY);
    const webgl2 = hasWebGL2();
    const update = () =>
      setSceneAllowed(
        canRunScene({ desktop: desktop.matches, reducedMotion: reduced.matches, webgl2 }),
      );
    update();
    desktop.addEventListener('change', update);
    reduced.addEventListener('change', update);
    return () => {
      desktop.removeEventListener('change', update);
      reduced.removeEventListener('change', update);
    };
  }, []);

  // A real box around everything: client:visible observes the island's children, and the slot
  // element alone is `display: contents`, so it would never intersect.
  return (
    <div>
      {!sceneAllowed || nodes.length === 0 ? (
        children
      ) : (
        <Suspense fallback={children}>
          <Constellation nodes={nodes} />
        </Suspense>
      )}
    </div>
  );
}

function Constellation({ nodes }: { nodes: CloudNode[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const open = (index: number) => {
    setFocusIndex(index);
    setOpenIndex(index);
  };

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const next = nextNodeIndex(index, event.key, nodes.length);
    if (next === undefined) return;
    event.preventDefault();
    setFocusIndex(next);
    buttons.current[next]?.focus();
  };

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1fr_18rem]">
      <div className="aspect-square max-h-[36rem] w-full">
        <ConstellationCanvas
          nodes={nodes}
          activeIndex={activeIndex}
          onHover={setActiveIndex}
          onSelect={open}
        />
      </div>
      <ul aria-label={t.listLabel} className="flex flex-col gap-2">
        {nodes.map((node, index) => (
          <li key={node.id}>
            <button
              ref={(element) => {
                buttons.current[index] = element;
              }}
              type="button"
              tabIndex={index === focusIndex ? 0 : -1}
              aria-haspopup="dialog"
              onClick={() => open(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
              onFocus={() => {
                setFocusIndex(index);
                setActiveIndex(index);
              }}
              onBlur={() => setActiveIndex(null)}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              data-active={activeIndex === index || undefined}
              className="flex w-full items-center gap-3 rounded-md border border-border-1 bg-surface-2 px-4 py-3 text-left transition-[border-color,box-shadow] duration-150 ease-standard hover:border-border-2 data-active:border-border-2 data-active:shadow-glow"
            >
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-pill"
                style={{ backgroundColor: `var(--pf-g-color-${node.accent ?? 'accent-1'})` }}
              />
              <span className="flex-1 text-3 font-medium">{node.label}</span>
              <span className="font-mono text-1 text-on-surface-2">
                {plural(cards.projects, node.projectCount)}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <CloudPanel
        node={openIndex === null ? undefined : nodes[openIndex]}
        onClose={() => {
          if (openIndex !== null) buttons.current[openIndex]?.focus();
          setOpenIndex(null);
        }}
      />
    </div>
  );
}

const LINK =
  'inline-flex min-h-7 items-center rounded-pill border border-border-1 bg-surface-2 px-3 py-1 text-2 text-on-surface-2 no-underline transition-colors duration-150 ease-standard hover:border-border-2 hover:text-on-surface-1';

/** DESIGN §9 Panel: 400px from the right, native modal <dialog> (Esc, focus loop, focus return). */
function CloudPanel({ node, onClose }: { node: CloudNode | undefined; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (node && !element.open) element.showModal();
    if (!node && element.open) element.close();
  }, [node]);

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onClose={onClose}
      onKeyDown={(event) => trapFocus(event.currentTarget, event.nativeEvent)}
      onClick={(event) => {
        // The dialog element itself only receives clicks on its backdrop.
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-[25rem] max-w-full rounded-l-lg bg-surface-3 p-0 text-on-surface-1 shadow-2 transition-[translate] duration-500 ease-emphasised backdrop:bg-surface-0/60 starting:open:translate-x-full"
    >
      {node && (
        <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 id={titleId} className="text-6">
                {node.label}
              </h2>
              <p className="font-mono text-1 tracking-label text-on-surface-2 uppercase">
                {plural(cards.projects, node.projectCount)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="rounded-pill px-3 py-1 text-2 text-on-surface-2 hover:bg-surface-2 hover:text-on-surface-1"
            >
              {t.close}
            </button>
          </div>
          {node.certifications.length > 0 && (
            <section className="flex flex-col gap-2">
              <h3 className="font-mono text-1 tracking-label text-on-surface-2 uppercase">
                {t.certifications}
              </h3>
              <ul className="flex flex-col gap-1 text-2">
                {node.certifications.map((cert) => (
                  <li key={cert.id}>{cert.label}</li>
                ))}
              </ul>
            </section>
          )}
          {node.projects.length > 0 && (
            <section className="flex flex-col gap-2">
              <h3 className="font-mono text-1 tracking-label text-on-surface-2 uppercase">
                {t.projects}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {node.projects.map((project) => (
                  <li key={project.id}>
                    <a href={`/work/${project.id}`} className={LINK}>
                      {project.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {node.projectCount > 0 && (
            <a
              href={`/work?cloud=${node.id}`}
              className="mt-auto inline-flex h-12 items-center justify-center rounded-pill bg-accent-1 px-5 text-3 font-medium text-on-accent no-underline hover:bg-accent-1-strong"
            >
              {t.seeProjects}
            </a>
          )}
        </div>
      )}
    </dialog>
  );
}
