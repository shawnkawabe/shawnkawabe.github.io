// DESIGN §7 hero "data core": a shell of evenly spaced points around a wireframe core, three thin
// orbit rings with a light riding each, all turning very slowly and leaning toward the pointer.
// Loaded lazily by HeroScene; colours follow the theme; the loop stops off-screen.
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  MathUtils,
  type Group,
  type Mesh,
} from 'three';
import { CORE_TURN_SECONDS, fibonacciSphere, pointerOffset, turnRate } from '@/lib/data-core';
import { token, useOnScreen, useThemeColors } from './scene';

const POINTS = 1400;
const SHELL_RADIUS = 2.3;
const CORE_RADIUS = 1.05;
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
  const scene = useRef<Group>(null);
  const shell = useRef<Group>(null);
  const heart = useRef<Mesh>(null);
  const points = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      'position',
      new Float32BufferAttribute(fibonacciSphere(POINTS, SHELL_RADIUS), 3),
    );
    return geometry;
  }, []);
  useEffect(() => () => points.dispose(), [points]);

  useFrame(({ clock }, delta) => {
    if (shell.current) {
      shell.current.rotation.y += turnRate(CORE_TURN_SECONDS) * delta;
      shell.current.rotation.x += turnRate(CORE_TURN_SECONDS * 3) * delta;
    }
    if (heart.current) heart.current.scale.setScalar(1 + 0.06 * Math.sin(clock.elapsedTime * 0.8));
    if (scene.current) {
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
      </group>
      <mesh ref={heart}>
        <icosahedronGeometry args={[0.32, 3]} />
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
