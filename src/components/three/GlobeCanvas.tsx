// DESIGN §7 hero cloud globe (BACKLOG-LANDING L-35): a gunmetal sphere lit from the upper left,
// its continents as dots, turning very slowly. The moons are the HTML cloud links around it; this
// scene only swings them along their arc, writing `transform`, so they stay real links.
// An orthographic camera in pixels uses the same framing as the poster and the label layer
// (src/lib/globe.ts), so the three always line up. Loaded lazily by HeroGlobe; colours follow the
// theme; the loop stops off-screen, in a hidden tab, or when the hero's motion toggle is pressed.
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BufferGeometry, Color, Float32BufferAttribute, type Group } from 'three';
import { points as landPoints } from '@/assets/globe/land-points.json';
import {
  arcPoint,
  driftAngle,
  framing,
  GLOBE_TURN_SECONDS,
  landVectors,
  turnRate,
  VIEW,
} from '@/lib/globe';
import { token, useOnScreen, useThemeColors } from './scene';

const rad = Math.PI / 180;
/** Light direction in view space: from the upper left, slightly toward the viewer. */
const LIGHT = [-0.55, 0.6, 0.58] as const;

function readColors() {
  return {
    shade: new Color(token('globe-shade')),
    lit: new Color(token('globe-lit')),
    dots: new Color(token('globe-dot')),
  };
}

const sphereVertex = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const sphereFragment = /* glsl */ `
  uniform vec3 uShade;
  uniform vec3 uLit;
  uniform vec3 uLight;
  varying vec3 vNormal;
  void main() {
    vec3 n = normalize(vNormal);
    float diffuse = max(dot(n, normalize(uLight)), 0.0);
    float rim = pow(1.0 - max(n.z, 0.0), 4.0) * smoothstep(-0.2, 0.6, dot(n.xy, normalize(uLight.xy)));
    vec3 color = mix(uShade, uLit, clamp(pow(diffuse, 2.4) + 0.3 * rim, 0.0, 1.0));
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;
const dotsVertex = /* glsl */ `
  uniform float uSize;
  uniform vec3 uLight;
  varying float vAlpha;
  void main() {
    vec3 n = normalize(normalMatrix * position);
    float light = max(dot(n, normalize(uLight)), 0.0);
    vAlpha = (0.45 + 0.55 * light) * smoothstep(0.0, 0.3, n.z);
    gl_PointSize = uSize * (0.6 + 0.6 * max(n.z, 0.0));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 1.003, 1.0);
  }
`;
const dotsFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    if (dot(p, p) > 0.25) discard;
    gl_FragColor = vec4(uColor, vAlpha);
    #include <colorspace_fragment>
  }
`;

/** The land points as unit vectors (x right, y up, z toward the viewer before rotation). */
function landGeometry() {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(landVectors(landPoints), 3));
  return geometry;
}

interface Props {
  /** The moon links, each with `data-angle` (its home angle in degrees), in arc order. */
  moons: HTMLElement[];
  /** True while a moon link is hovered or focused: the moons hold still. */
  holdMoons: { current: boolean };
  /** `hero` frames the globe as in the hero; `poster` fills the canvas with it (npm run globe:poster). */
  fit: 'hero' | 'poster';
}

function Globe({ moons, holdMoons, fit }: Props) {
  const colors = useThemeColors(readColors);
  const { size, viewport } = useThree();
  const spin = useRef<Group>(null);
  const moonTime = useRef(0);
  const dots = useMemo(landGeometry, []);
  useEffect(() => () => dots.dispose(), [dots]);
  const homes = useMemo(() => moons.map((moon) => Number(moon.dataset.angle)), [moons]);

  const { radius, cx, cy } =
    fit === 'hero'
      ? framing(size.width, size.height)
      : { radius: size.width / 2, cx: size.width / 2, cy: size.width / 2 };
  const uniforms = useMemo(
    () => ({
      sphere: {
        uShade: { value: new Color() },
        uLit: { value: new Color() },
        uLight: { value: LIGHT },
      },
      dots: { uColor: { value: new Color() }, uSize: { value: 1 }, uLight: { value: LIGHT } },
    }),
    [],
  );
  uniforms.sphere.uShade.value.copy(colors.shade);
  uniforms.sphere.uLit.value.copy(colors.lit);
  uniforms.dots.uColor.value.copy(colors.dots);
  uniforms.dots.uSize.value = Math.max(1.2, radius / 300) * viewport.dpr;

  useFrame((_, delta) => {
    if (spin.current) spin.current.rotation.y += turnRate(GLOBE_TURN_SECONDS) * delta;
    if (holdMoons.current) return;
    moonTime.current += delta;
    moons.forEach((moon, index) => {
      const home = arcPoint(homes[index]);
      const now = arcPoint(driftAngle(homes[index], index, moonTime.current));
      const dx = (now.x - home.x) * radius;
      const dy = (now.y - home.y) * radius;
      moon.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
    });
  });

  return (
    <group position={[cx - size.width / 2, size.height / 2 - cy, 0]} scale={radius}>
      <group rotation={[VIEW.lat * rad, 0, 0]}>
        <group ref={spin} rotation={[0, -VIEW.lon * rad, 0]}>
          <mesh>
            <sphereGeometry args={[1, 96, 64]} />
            <shaderMaterial
              uniforms={uniforms.sphere}
              vertexShader={sphereVertex}
              fragmentShader={sphereFragment}
            />
          </mesh>
          <points geometry={dots}>
            <shaderMaterial
              uniforms={uniforms.dots}
              vertexShader={dotsVertex}
              fragmentShader={dotsFragment}
              transparent
              depthWrite={false}
            />
          </points>
        </group>
      </group>
    </group>
  );
}

export default function GlobeCanvas({
  moons,
  toggle,
  onReady,
  fit = 'hero',
}: {
  moons: HTMLElement[];
  toggle: HTMLButtonElement | null;
  onReady: () => void;
  fit?: Props['fit'];
}) {
  const container = useRef<HTMLDivElement>(null);
  const visible = useOnScreen(container);
  const [paused, setPaused] = useState(false);
  const holdMoons = useRef(false);

  useEffect(() => {
    const hold = (value: boolean) => () => (holdMoons.current = value);
    const listeners = [
      ['pointerenter', hold(true)],
      ['pointerleave', hold(false)],
      ['focusin', hold(true)],
      ['focusout', hold(false)],
    ] as const;
    for (const moon of moons) for (const [type, fn] of listeners) moon.addEventListener(type, fn);
    const flip = () => setPaused(toggle?.getAttribute('aria-pressed') === 'true');
    toggle?.addEventListener('click', flip);
    return () => {
      for (const moon of moons) {
        for (const [type, fn] of listeners) moon.removeEventListener(type, fn);
        moon.style.transform = '';
      }
      toggle?.removeEventListener('click', flip);
    };
  }, [moons, toggle]);

  return (
    <div ref={container} className="absolute inset-0">
      <Canvas
        orthographic
        dpr={[1, 2]}
        frameloop={fit === 'poster' ? 'demand' : visible && !paused ? 'always' : 'never'}
        camera={{ position: [0, 0, 2000], near: 1, far: 4000 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        onCreated={onReady}
      >
        <Globe moons={moons} holdMoons={holdMoons} fit={fit} />
      </Canvas>
    </div>
  );
}
