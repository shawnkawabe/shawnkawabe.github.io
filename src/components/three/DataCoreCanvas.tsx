// DESIGN §7 hero "data core": a shell of evenly spaced points around a wireframe core, three thin
// orbit rings with a light riding each, all turning very slowly and leaning toward the pointer.
// On start the shell gathers in from outside; then packets stream from the shell into the core, a
// scan ring sweeps the shell, and the scene sinks back as the hero scrolls away.
// Loaded lazily by HeroScene; colours follow the theme; the loop stops off-screen.
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  MathUtils,
  type Group,
  type LineBasicMaterial,
  type LineLoop,
  type Mesh,
  type PointsMaterial,
} from 'three';
import {
  assembleProgress,
  blendPoints,
  CORE_TURN_SECONDS,
  fibonacciSphere,
  packetTrip,
  pointerOffset,
  scanRing,
  scatterOutward,
  scrollDepth,
  turnRate,
} from '@/lib/data-core';
import { token, useOnScreen, useThemeColors } from './scene';

const POINTS = 1400;
const SHELL_RADIUS = 2.3;
const CORE_RADIUS = 1.05;
const HEART_RADIUS = 0.32;
/** Packets in flight at once, and the seconds each takes from the shell to the heart. */
const PACKETS = 28;
const PACKET_SECONDS = 3.2;
/** Seconds for the scan ring to sweep down and back up. */
const SCAN_SECONDS = 14;
const SCAN_SEGMENTS = 128;
/** Tilt of each ring (radians) and its turn time (seconds); different, so they never line up. */
const RINGS = [
  { radius: 2.9, tilt: [1.2, 0.2, 0], seconds: 40 },
  { radius: 3.25, tilt: [0.5, -0.9, 0.3], seconds: 55 },
  { radius: 3.6, tilt: [-0.35, 0.6, -0.2], seconds: 70 },
] as const;
/** How far the scene leans toward the pointer, in radians, and how quickly it follows. */
const PARALLAX = 0.25;
const FOLLOW = 2.5;

function readColors() {
  return { primary: token('accent-1'), secondary: token('accent-2'), line: token('border-2') };
}

/** Pointer position over the whole window, −1…1; the canvas itself sits under the hero text. */
function usePointer() {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const move = (event: PointerEvent) => {
      pointer.current = pointerOffset(
        { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight },
        event.clientX,
        event.clientY,
      );
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);
  return pointer;
}

/** Scroll depth of the hero (0…1), read in the render loop without re-rendering. */
function useScrollDepth() {
  const depth = useRef(0);
  useEffect(() => {
    const update = () => {
      depth.current = scrollDepth(window.scrollY, window.innerHeight);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return depth;
}

/** Writes each packet's position: a straight run from its shell point to the heart, easing in. */
function placePackets(shell: Float32Array, out: Float32Array, elapsed: number) {
  const points = shell.length / 3;
  for (let index = 0; index < PACKETS; index++) {
    const { progress, origin } = packetTrip(index, PACKETS, elapsed, PACKET_SECONDS);
    const from = (origin % points) * 3;
    const scale = 1 - (1 - HEART_RADIUS / SHELL_RADIUS) * progress * progress;
    out[index * 3] = shell[from] * scale;
    out[index * 3 + 1] = shell[from + 1] * scale;
    out[index * 3 + 2] = shell[from + 2] * scale;
  }
}

/** A unit circle in the x–z plane, scaled each frame into the scan ring. */
function circleGeometry() {
  const geometry = new BufferGeometry();
  const positions: number[] = [];
  for (let index = 0; index < SCAN_SEGMENTS; index++) {
    const angle = (index / SCAN_SEGMENTS) * Math.PI * 2;
    positions.push(Math.cos(angle), 0, Math.sin(angle));
  }
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  return geometry;
}

function Ring({ radius, tilt, seconds, color }: (typeof RINGS)[number] & { color: string }) {
  const spin = useRef<Group>(null);
  useFrame((_, delta) => {
    if (spin.current) spin.current.rotation.z += turnRate(seconds) * delta;
  });
  return (
    <group rotation={[...tilt]}>
      <group ref={spin}>
        <mesh>
          <torusGeometry args={[radius, 0.006, 6, 160]} />
          <meshBasicMaterial color={color} transparent opacity={0.45} />
        </mesh>
        {/* The light riding the ring. */}
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <mesh position={[radius, 0, 0]} scale={3}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.2}
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  );
}

function Core() {
  const colors = useThemeColors(readColors);
  const pointer = usePointer();
  const depth = useScrollDepth();
  const scene = useRef<Group>(null);
  const shell = useRef<Group>(null);
  const heart = useRef<Mesh>(null);
  const scan = useRef<LineLoop>(null);
  const scanMaterial = useRef<LineBasicMaterial>(null);
  const packetMaterial = useRef<PointsMaterial>(null);
  const assembled = useRef(false);
  const { target, start, points, packets, circle } = useMemo(() => {
    const target = fibonacciSphere(POINTS, SHELL_RADIUS);
    const start = scatterOutward(target);
    const points = new BufferGeometry();
    points.setAttribute('position', new Float32BufferAttribute(start.slice(), 3));
    const packets = new BufferGeometry();
    packets.setAttribute('position', new Float32BufferAttribute(new Float32Array(PACKETS * 3), 3));
    return { target, start, points, packets, circle: circleGeometry() };
  }, []);
  useEffect(
    () => () => {
      points.dispose();
      packets.dispose();
      circle.dispose();
    },
    [points, packets, circle],
  );

  useFrame(({ clock }, delta) => {
    const elapsed = clock.elapsedTime;
    if (!assembled.current) {
      const progress = assembleProgress(elapsed);
      const position = points.getAttribute('position');
      blendPoints(start, target, progress, position.array as Float32Array);
      position.needsUpdate = true;
      if (packetMaterial.current) packetMaterial.current.opacity = 0.95 * progress;
      assembled.current = progress === 1;
    }
    const packetPosition = packets.getAttribute('position');
    placePackets(target, packetPosition.array as Float32Array, elapsed);
    packetPosition.needsUpdate = true;
    if (scan.current && scanMaterial.current) {
      const ring = scanRing(elapsed, SCAN_SECONDS, SHELL_RADIUS);
      scan.current.position.y = ring.y;
      scan.current.scale.set(ring.radius, 1, ring.radius);
      scanMaterial.current.opacity = 0.5 * (ring.radius / SHELL_RADIUS);
    }
    if (shell.current) {
      shell.current.rotation.y += turnRate(CORE_TURN_SECONDS) * delta;
      shell.current.rotation.x += turnRate(CORE_TURN_SECONDS * 3) * delta;
    }
    if (heart.current) heart.current.scale.setScalar(1 + 0.06 * Math.sin(elapsed * 0.8));
    if (scene.current) {
      scene.current.position.y = depth.current * 1.6;
      scene.current.scale.setScalar(1 - 0.2 * depth.current);
      const ease = 1 - Math.exp(-FOLLOW * delta);
      scene.current.rotation.y = MathUtils.lerp(
        scene.current.rotation.y,
        pointer.current.x * PARALLAX,
        ease,
      );
      scene.current.rotation.x = MathUtils.lerp(
        scene.current.rotation.x,
        pointer.current.y * PARALLAX,
        ease,
      );
    }
  });

  return (
    <group ref={scene}>
      <group ref={shell}>
        <points geometry={points}>
          <pointsMaterial
            color={colors.primary}
            size={0.03}
            sizeAttenuation
            transparent
            opacity={0.85}
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </points>
        <mesh>
          <icosahedronGeometry args={[CORE_RADIUS, 1]} />
          <meshBasicMaterial color={colors.secondary} wireframe transparent opacity={0.35} />
        </mesh>
        {/* Packets ride with the shell, so each stream stays on its own point. */}
        <points geometry={packets}>
          <pointsMaterial
            ref={packetMaterial}
            color={colors.secondary}
            size={0.09}
            sizeAttenuation
            transparent
            opacity={0}
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </points>
      </group>
      <lineLoop ref={scan} geometry={circle}>
        <lineBasicMaterial
          ref={scanMaterial}
          color={colors.primary}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </lineLoop>
      <mesh ref={heart}>
        <icosahedronGeometry args={[HEART_RADIUS, 3]} />
        <meshStandardMaterial
          color={colors.primary}
          emissive={colors.primary}
          emissiveIntensity={1.2}
        />
      </mesh>
      <mesh scale={2.6}>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshBasicMaterial
          color={colors.primary}
          transparent
          opacity={0.1}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
      {RINGS.map((ring, index) => (
        <Ring key={ring.radius} {...ring} color={index === 1 ? colors.secondary : colors.primary} />
      ))}
    </group>
  );
}

export default function DataCoreCanvas() {
  const container = useRef<HTMLDivElement>(null);
  const visible = useOnScreen(container);
  const [ready, setReady] = useState(false);
  return (
    <div
      ref={container}
      className="pf-hero-scene absolute inset-y-0 right-0 w-3/5 transition-opacity duration-450 ease-standard"
      style={{ opacity: ready ? 1 : 0 }}
    >
      <Canvas
        dpr={[1, 2]}
        frameloop={visible ? 'always' : 'never'}
        camera={{ position: [0, 0, 9.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        onCreated={() => setReady(true)}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 0, 5]} intensity={20} />
        <Core />
      </Canvas>
    </div>
  );
}
