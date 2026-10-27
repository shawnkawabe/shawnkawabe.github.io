// Hero "data core" rules (SPEC §5.1, DESIGN §7): when the scene may load, and where its points
// sit. Pure, so the island and the canvas stay thin.

/** Full turn of the point shell, in seconds: "very slow" (DESIGN §7). */
export const CORE_TURN_SECONDS = 90;

/** Radians per second for a body that turns once every `seconds`. */
export const turnRate = (seconds: number) => (2 * Math.PI) / seconds;

/**
 * `count` points spread evenly over a sphere (Fibonacci lattice), as x, y, z triples. Even
 * spacing reads as a designed shell rather than noise, at any count.
 */
export function fibonacciSphere(count: number, radius: number): Float32Array {
  const points = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let index = 0; index < count; index++) {
    const y = count === 1 ? 0 : 1 - (2 * index) / (count - 1);
    const ring = Math.sqrt(1 - y * y);
    const angle = golden * index;
    points.set(
      [Math.cos(angle) * ring * radius, y * radius, Math.sin(angle) * ring * radius],
      index * 3,
    );
  }
  return points;
}

/** Seconds the shell takes to gather into its sphere when the scene starts. */
export const ASSEMBLE_SECONDS = 3.2;

/** Repeatable pseudo-random number in 0…1 for an index, so scenes look the same on every load. */
export const hash01 = (index: number) => {
  const value = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
};

/** Ease-out cubic progress of the assembly after `elapsed` seconds, clamped to 0…1. */
export function assembleProgress(elapsed: number, duration = ASSEMBLE_SECONDS): number {
  const t = Math.min(Math.max(elapsed / duration, 0), 1);
  return 1 - (1 - t) ** 3;
}

/** Start of the assembly: each point pushed 1.6–3.2× outward along its own direction. */
export function scatterOutward(targets: Float32Array): Float32Array {
  const start = new Float32Array(targets.length);
  for (let index = 0; index < targets.length; index += 3) {
    const push = 1.6 + 1.6 * hash01(index);
    start[index] = targets[index] * push;
    start[index + 1] = targets[index + 1] * push;
    start[index + 2] = targets[index + 2] * push;
  }
  return start;
}

/** Writes `from` blended toward `to` by `progress` (0…1) into `out`. */
export function blendPoints(
  from: Float32Array,
  to: Float32Array,
  progress: number,
  out: Float32Array,
): Float32Array {
  for (let index = 0; index < out.length; index++) {
    out[index] = from[index] * (1 - progress) + to[index] * progress;
  }
  return out;
}

/**
 * A data packet's trip from the shell to the core. Packets are staggered by their index; each
 * new trip (`cycle`) starts from a different shell point, so the streams keep moving around.
 */
export function packetTrip(index: number, count: number, elapsed: number, seconds: number) {
  const time = elapsed / seconds + index / count;
  const cycle = Math.floor(time);
  return { cycle, progress: time - cycle, origin: Math.floor(hash01(index * 131 + cycle) * 1e6) };
}

/**
 * The scan ring sweeping the shell: its height and its radius at that height (on the sphere).
 * It moves like a pendulum, so it slows at the top and bottom instead of jumping.
 */
export function scanRing(elapsed: number, seconds: number, radius: number) {
  const y = radius * 0.9 * Math.sin((2 * Math.PI * elapsed) / seconds);
  return { y, radius: Math.sqrt(radius * radius - y * y) };
}

/** How far the hero has scrolled out of view, 0 at the top to 1 after one screen height. */
export const scrollDepth = (scrollY: number, viewportHeight: number) =>
  Math.min(Math.max(scrollY / viewportHeight, 0), 1);

/** Pointer offset from the centre of a box, from −1 to 1 on each axis (for parallax and tilt). */
export function pointerOffset(
  box: { left: number; top: number; width: number; height: number },
  x: number,
  y: number,
): { x: number; y: number } {
  const clamp = (value: number) => Math.max(-1, Math.min(1, value));
  return {
    x: clamp(((x - box.left) / box.width) * 2 - 1),
    y: clamp(((y - box.top) / box.height) * 2 - 1),
  };
}
