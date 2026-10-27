// Hero cloud globe (BACKLOG-LANDING L-35, DESIGN §7): one framing shared by the poster, the HTML
// moon labels and the 3D scene, so all three line up at any hero size. Pure, so the island stays
// thin. Screen angles are in degrees, clockwise from 3 o'clock (y grows downward), so 270° is the
// top of the globe.

/** Globe radius as a share of the hero width, capped as a share of its height (wide screens). */
export const RADIUS_OF_WIDTH = 0.46;
export const RADIUS_OF_HEIGHT = 0.95;
/** How much of the hero height the visible cap of the globe takes, from the bottom edge. */
export const CAP_OF_HEIGHT = 0.3;
/** The moons' arc radius as a multiple of the globe radius. */
export const ORBIT = 1.14;
/** Full turn of the globe, in seconds: "very slow" (DESIGN §7). */
export const GLOBE_TURN_SECONDS = 120;
/** Starting view: the meridian facing the viewer and the tilt toward them, in degrees. */
export const VIEW = { lon: -45, lat: 22 };
/** Largest gap between neighbouring moons, and the span they may fill, in degrees. */
const MOON_STEP = 26;
const MOON_SPAN = 130;
/** How far a moon drifts either side of its home angle, in degrees. */
export const DRIFT = 5;

const rad = Math.PI / 180;

/** Radians per second for a body that turns once every `seconds`. */
export const turnRate = (seconds: number) => (2 * Math.PI) / seconds;

/** Globe radius and centre in pixels for a hero of `width` × `height`; the centre sits below it. */
export function framing(width: number, height: number) {
  const radius = Math.min(width * RADIUS_OF_WIDTH, height * RADIUS_OF_HEIGHT);
  return { radius, cx: width / 2, cy: height + radius - height * CAP_OF_HEIGHT };
}

/** Home angles for `count` moons: centred on the top of the globe, evenly spaced. */
export function moonAngles(count: number): number[] {
  if (count <= 1) return count === 1 ? [270] : [];
  const step = Math.min(MOON_STEP, MOON_SPAN / (count - 1));
  return Array.from({ length: count }, (_, index) => 270 + (index - (count - 1) / 2) * step);
}

/** A moon's angle after `elapsed` seconds: a slow swing around its home, each at its own pace. */
export function driftAngle(home: number, index: number, elapsed: number): number {
  const seconds = 23 + 7 * index;
  return home + DRIFT * Math.sin((2 * Math.PI * elapsed) / seconds + index * 1.7);
}

/** Point on the moons' arc at `angle` degrees, relative to the globe centre, in globe radii. */
export const arcPoint = (angle: number) => ({
  x: Math.cos(angle * rad) * ORBIT,
  y: Math.sin(angle * rad) * ORBIT,
});

/** Unit vector (x right, y up, z toward the viewer) for a latitude and longitude, unrotated. */
export function latLonToVector(lat: number, lon: number): [number, number, number] {
  const la = lat * rad;
  const lo = lon * rad;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
}

/**
 * The baked land points (scripts/globe-land.mjs: base64 Int16 pairs in hundredths of a degree)
 * as x, y, z unit vectors.
 */
export function landVectors(base64: string): Float32Array {
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  const pairs = new Int16Array(bytes.buffer);
  const vectors = new Float32Array((pairs.length / 2) * 3);
  for (let index = 0; index < pairs.length; index += 2) {
    vectors.set(latLonToVector(pairs[index] / 100, pairs[index + 1] / 100), (index / 2) * 3);
  }
  return vectors;
}
