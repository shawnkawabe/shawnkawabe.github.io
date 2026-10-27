import { describe, expect, it } from 'vitest';
import {
  arcPoint,
  CAP_OF_WIDTH,
  DRIFT,
  driftAngle,
  framing,
  landVectors,
  latLonToVector,
  moonAngles,
  ORBIT,
  ROOM_OF_WIDTH,
  turnRate,
} from '@/lib/globe';

describe('framing', () => {
  it('sizes the globe by width and shows a cap of the hero height above the bottom edge', () => {
    const { radius, cx, cy } = framing(1440, 900);
    expect(radius).toBeCloseTo(662.4);
    expect(cx).toBe(720);
    expect(cy - radius).toBeCloseTo(900 - 1440 * CAP_OF_WIDTH);
  });

  it('keeps the arc inside the room reserved under the text', () => {
    const { radius, cy } = framing(1440, 900);
    expect(900 - (cy - radius * ORBIT)).toBeCloseTo(1440 * ROOM_OF_WIDTH);
  });

  it('caps the radius by height on very wide heroes', () => {
    expect(framing(4000, 800).radius).toBeCloseTo(760);
  });
});

describe('moonAngles', () => {
  it('centres the moons on the top of the globe', () => {
    expect(moonAngles(0)).toEqual([]);
    expect(moonAngles(1)).toEqual([270]);
    expect(moonAngles(3)).toEqual([244, 270, 296]);
  });

  it('keeps up to six moons within the arc', () => {
    const angles = moonAngles(6);
    expect(angles[0]).toBeCloseTo(205);
    expect(angles[5]).toBeCloseTo(335);
  });
});

describe('driftAngle', () => {
  it('swings each moon at most DRIFT degrees from home, so neighbours never meet', () => {
    const [first, second] = moonAngles(6);
    for (let elapsed = 0; elapsed < 200; elapsed += 0.7) {
      const a = driftAngle(first, 0, elapsed);
      const b = driftAngle(second, 1, elapsed);
      expect(Math.abs(a - first)).toBeLessThanOrEqual(DRIFT);
      expect(b - a).toBeGreaterThan(second - first - 2 * DRIFT - 1e-9);
    }
  });
});

describe('arcPoint', () => {
  it('places the top of the arc straight above the centre, y growing downward', () => {
    const top = arcPoint(270);
    expect(top.x).toBeCloseTo(0);
    expect(top.y).toBeCloseTo(-ORBIT);
  });
});

describe('latLonToVector', () => {
  it('faces the viewer at 0°, 0° and points up at the north pole', () => {
    expect(latLonToVector(0, 0).map((value) => +value.toFixed(6))).toEqual([0, 0, 1]);
    expect(latLonToVector(90, 0)[1]).toBeCloseTo(1);
    expect(latLonToVector(0, 90)[0]).toBeCloseTo(1);
  });
});

describe('landVectors', () => {
  it('decodes base64 Int16 pairs in hundredths of a degree into unit vectors', () => {
    const base64 = Buffer.from(new Int16Array([0, 0, 9000, 0]).buffer).toString('base64');
    const vectors = landVectors(base64);
    expect(vectors).toHaveLength(6);
    expect([...vectors.slice(0, 3)].map((value) => +value.toFixed(6))).toEqual([0, 0, 1]);
    expect(vectors[4]).toBeCloseTo(1);
  });
});

describe('turnRate', () => {
  it('turns once per given period', () => {
    expect(turnRate(60) * 60).toBeCloseTo(2 * Math.PI);
  });
});
