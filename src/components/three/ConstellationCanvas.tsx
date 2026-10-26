// SPEC §6.2 / DESIGN §7 scene: Shawn at the centre, one emissive node per cloud on a slow orbit,
// with light pulses travelling out along each link. Loaded lazily by CloudConstellation only when
// the scene may run. Colours come from the theme tokens; the loop stops off-screen.
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  type Group,
  type Mesh,
} from 'three';
import { ORBIT_SPEED, placeNodes } from '@/lib/constellation';
import { token, useOnScreen, useThemeColors } from './scene';

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

/** Seconds for a pulse to travel from the centre to a node. */
const PULSE_SECONDS = 2.4;

/** A light that travels out along one link, staggered by `phase` (0–1) so they never sync. */
function Pulse({
  to,
  color,
  phase,
}: {
  to: readonly [number, number, number];
  color: string;
  phase: number;
}) {
  const pulse = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!pulse.current) return;
    const progress = (clock.elapsedTime / PULSE_SECONDS + phase) % 1;
    pulse.current.position.set(to[0] * progress, to[1] * progress, 0);
    pulse.current.scale.setScalar(Math.sin(progress * Math.PI));
  });
  return (
    <mesh ref={pulse}>
      <sphereGeometry args={[0.07, 12, 12]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.9}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function Orbit({ nodes, activeIndex, onHover, onSelect, paused }: Props & { paused: boolean }) {
  const group = useRef<Group>(null);
  const center = useRef<Mesh>(null);
  const colors = useThemeColors(
    () => ({
      center: token('accent-1'),
      line: token('border-2'),
      nodes: nodes.map((node) => token(node.accent ?? 'accent-1')),
    }),
    [nodes],
  );
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

  useFrame(({ clock }, delta) => {
    if (!paused && group.current) group.current.rotation.z -= ORBIT_SPEED * delta;
    if (center.current)
      center.current.scale.setScalar(1 + 0.05 * Math.sin(clock.elapsedTime * 1.2));
  });

  return (
    <group ref={group}>
      <lineSegments geometry={spokes}>
        <lineBasicMaterial color={colors.line} transparent opacity={0.6} />
      </lineSegments>
      {positions.map((position, index) => (
        <Pulse
          key={nodes[index].id}
          to={position}
          color={colors.nodes[index]}
          phase={index / positions.length}
        />
      ))}
      <mesh ref={center}>
        <sphereGeometry args={[CENTER_RADIUS, 32, 32]} />
        <meshStandardMaterial
          color={colors.center}
          emissive={colors.center}
          emissiveIntensity={0.9}
        />
      </mesh>
      <mesh scale={1.9}>
        <sphereGeometry args={[CENTER_RADIUS, 24, 24]} />
        <meshBasicMaterial
          color={colors.center}
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={AdditiveBlending}
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
              <sphereGeometry args={[placed[index].radius, 32, 32]} />
              <meshStandardMaterial
                color={colors.nodes[index]}
                emissive={colors.nodes[index]}
                emissiveIntensity={0.7}
                roughness={0.35}
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
                opacity={0.14 * opacity}
                depthWrite={false}
                blending={AdditiveBlending}
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
