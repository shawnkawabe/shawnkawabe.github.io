// SPEC §6.2 / DESIGN §7 scene: Shawn at the centre, one emissive node per cloud on a slow orbit,
// with light pulses travelling out along each link, over a faint orbit track and a slow dust disc.
// Hovering a cloud lights its link and dims the rest. Loaded lazily by CloudConstellation only when
// the scene may run. Colours come from the theme tokens; the loop stops off-screen.
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  type Group,
  type Mesh,
  type Points,
} from 'three';
import { ORBIT_SPEED, placeNodes } from '@/lib/constellation';
import { dustDisc } from '@/lib/data-core';
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

/** Seconds for a pulse to travel from the centre to a node; the hovered link runs twice as fast. */
const PULSE_SECONDS = 2.4;
const ACTIVE_PULSE_SPEED = 2;
const DUST = 420;
/** The dust disc turns against the orbit, slower, so the two read as separate layers. */
const DUST_SPEED = -ORBIT_SPEED * 0.4;
const TRACK_SEGMENTS = 160;

function trackGeometry() {
  const geometry = new BufferGeometry();
  const positions: number[] = [];
  for (let index = 0; index < TRACK_SEGMENTS; index++) {
    const angle = (index / TRACK_SEGMENTS) * Math.PI * 2;
    positions.push(Math.cos(angle) * RING, Math.sin(angle) * RING, 0);
  }
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  return geometry;
}

/** A light that travels out along one link, staggered by `phase` (0–1) so they never sync. */
function Pulse({
  to,
  color,
  phase,
  emphasis,
}: {
  to: readonly [number, number, number];
  color: string;
  phase: number;
  /** `active`: the hovered link, larger and faster; `dimmed`: another node is hovered. */
  emphasis: 'normal' | 'active' | 'dimmed';
}) {
  const pulse = useRef<Mesh>(null);
  const travelled = useRef(phase);
  useFrame((_, delta) => {
    if (!pulse.current) return;
    const speed = emphasis === 'active' ? ACTIVE_PULSE_SPEED : 1;
    travelled.current = (travelled.current + (delta / PULSE_SECONDS) * speed) % 1;
    const progress = travelled.current;
    pulse.current.position.set(to[0] * progress, to[1] * progress, 0);
    pulse.current.scale.setScalar(Math.sin(progress * Math.PI) * (emphasis === 'active' ? 1.6 : 1));
  });
  return (
    <mesh ref={pulse}>
      <sphereGeometry args={[0.07, 12, 12]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={emphasis === 'dimmed' ? 0.9 * DIMMED : 0.9}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function Orbit({ nodes, activeIndex, onHover, onSelect, paused }: Props & { paused: boolean }) {
  const group = useRef<Group>(null);
  const dust = useRef<Points>(null);
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
  const { track, dustCloud } = useMemo(() => {
    const dustCloud = new BufferGeometry();
    dustCloud.setAttribute(
      'position',
      new Float32BufferAttribute(dustDisc(DUST, RING * 0.55, RING * 1.9), 3),
    );
    return { track: trackGeometry(), dustCloud };
  }, []);
  useEffect(
    () => () => {
      spokes.dispose();
      track.dispose();
      dustCloud.dispose();
    },
    [spokes, track, dustCloud],
  );

  useFrame(({ clock }, delta) => {
    if (!paused && group.current) group.current.rotation.z -= ORBIT_SPEED * delta;
    if (dust.current) dust.current.rotation.z += DUST_SPEED * delta;
    if (center.current)
      center.current.scale.setScalar(1 + 0.05 * Math.sin(clock.elapsedTime * 1.2));
  });

  return (
    <>
      <points ref={dust} geometry={dustCloud}>
        <pointsMaterial
          color={colors.line}
          size={0.035}
          sizeAttenuation
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </points>
      <group ref={group}>
        <lineLoop geometry={track}>
          <lineBasicMaterial color={colors.line} transparent opacity={0.35} />
        </lineLoop>
        <lineSegments geometry={spokes}>
          <lineBasicMaterial color={colors.line} transparent opacity={0.6} />
        </lineSegments>
        {positions.map((position, index) => (
          <Pulse
            key={nodes[index].id}
            to={position}
            color={colors.nodes[index]}
            phase={index / positions.length}
            emphasis={activeIndex === null ? 'normal' : activeIndex === index ? 'active' : 'dimmed'}
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
    </>
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
