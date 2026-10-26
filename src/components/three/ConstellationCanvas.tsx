// SPEC §6.2 / DESIGN §7 scene: Shawn at the centre, one emissive node per cloud on a slow orbit.
// Loaded lazily by CloudConstellation only when the scene may run. Colours come from the theme
// tokens and follow `pf-themechange`; the loop stops off-screen and in hidden tabs.
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BufferGeometry, Float32BufferAttribute, type Group } from 'three';
import { ORBIT_SPEED, placeNodes } from '@/lib/constellation';
import { THEME_EVENT } from '@/lib/theme';

export type SceneNode = { id: string; accent?: string; projectCount: number };

type Props = {
  nodes: SceneNode[];
  /** Hovered or focused node; the others dim to 40 %. */
  activeIndex: number | null;
  onHover: (index: number | null) => void;
  onSelect: (index: number) => void;
};

const RING = 3;
const CENTER_RADIUS = 0.55;
const DIMMED = 0.4;
const HOVER_SCALE = 1.15;

const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(`--pf-g-color-${name}`).trim();

function useThemeColors(nodes: SceneNode[]) {
  const read = () => ({
    center: token('accent-1'),
    line: token('border-2'),
    nodes: nodes.map((node) => token(node.accent ?? 'accent-1')),
  });
  const [colors, setColors] = useState(read);
  useEffect(() => {
    const update = () => setColors(read());
    window.addEventListener(THEME_EVENT, update);
    return () => window.removeEventListener(THEME_EVENT, update);
  }, [nodes]);
  return colors;
}

/** Runs the render loop only while the canvas is on screen and the tab is visible. */
function useOnScreen(target: React.RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const element = target.current;
    if (!element) return;
    let inView = true;
    const update = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, [target]);
  return visible;
}

function Orbit({ nodes, activeIndex, onHover, onSelect, paused }: Props & { paused: boolean }) {
  const group = useRef<Group>(null);
  const colors = useThemeColors(nodes);
  const placed = useMemo(() => placeNodes(nodes.map((node) => node.projectCount)), [nodes]);
  const positions = useMemo(
    () => placed.map(({ angle }) => [Math.cos(angle) * RING, Math.sin(angle) * RING, 0] as const),
    [placed],
  );
  const spokes = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      'position',
      new Float32BufferAttribute(
        positions.flatMap(([x, y]) => [0, 0, 0, x, y, 0]),
        3,
      ),
    );
    return geometry;
  }, [positions]);
  useEffect(() => () => spokes.dispose(), [spokes]);

  useFrame((_, delta) => {
    if (!paused && group.current) group.current.rotation.z -= ORBIT_SPEED * delta;
  });

  return (
    <group ref={group}>
      <lineSegments geometry={spokes}>
        <lineBasicMaterial color={colors.line} transparent opacity={0.6} />
      </lineSegments>
      <mesh>
        <icosahedronGeometry args={[CENTER_RADIUS, 2]} />
        <meshStandardMaterial
          color={colors.center}
          emissive={colors.center}
          emissiveIntensity={0.8}
          flatShading
        />
      </mesh>
      {nodes.map((node, index) => {
        const active = activeIndex === index;
        const opacity = activeIndex === null || active ? 1 : DIMMED;
        return (
          <group key={node.id} position={positions[index]} scale={active ? HOVER_SCALE : 1}>
            <mesh
              onPointerOver={(event) => {
                event.stopPropagation();
                onHover(index);
              }}
              onPointerOut={() => onHover(null)}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(index);
              }}
            >
              <icosahedronGeometry args={[placed[index].radius, 1]} />
              <meshStandardMaterial
                color={colors.nodes[index]}
                emissive={colors.nodes[index]}
                emissiveIntensity={0.6}
                flatShading
                transparent
                opacity={opacity}
              />
            </mesh>
            {/* Soft halo: a larger, faint shell in the same accent. */}
            <mesh scale={1.6}>
              <sphereGeometry args={[placed[index].radius, 16, 16]} />
              <meshBasicMaterial
                color={colors.nodes[index]}
                transparent
                opacity={0.12 * opacity}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default function ConstellationCanvas(props: Props) {
  const container = useRef<HTMLDivElement>(null);
  const visible = useOnScreen(container);
  const [pointerInside, setPointerInside] = useState(false);
  return (
    <div
      ref={container}
      aria-hidden="true"
      className="size-full"
      style={{ cursor: props.activeIndex === null ? 'default' : 'pointer' }}
      onPointerEnter={() => setPointerInside(true)}
      onPointerLeave={() => {
        setPointerInside(false);
        props.onHover(null);
      }}
    >
      <Canvas
        dpr={[1, 2]}
        frameloop={visible ? 'always' : 'never'}
        camera={{ position: [0, -2.5, 9], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[0, 0, 6]} intensity={30} />
        <Orbit {...props} paused={pointerInside} />
      </Canvas>
    </div>
  );
}
