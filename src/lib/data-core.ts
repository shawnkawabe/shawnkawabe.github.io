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
