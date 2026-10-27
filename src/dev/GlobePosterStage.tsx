// Dev-only island for the globe poster stage (src/dev/globe-poster.astro): the live globe, still,
// filling a square; marks itself ready two frames after the canvas starts.
import { useState } from 'react';
import GlobeCanvas from '@/components/three/GlobeCanvas';

export default function GlobePosterStage({ size }: { size: number }) {
  const [ready, setReady] = useState(false);
  const onReady = () => requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
  return (
    <div
      data-stage
      data-ready={ready ? '' : undefined}
      style={{ position: 'relative', width: size, height: size }}
    >
      <GlobeCanvas moons={[]} toggle={null} fit="poster" onReady={onReady} />
    </div>
  );
}
