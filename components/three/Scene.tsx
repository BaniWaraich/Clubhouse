'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { hasWebGL } from '@/lib/webgl';

/**
 * WebGL must not block first paint and must not run on the server.
 * Dynamic-import the canvas with ssr:false and a *designed* fallback — a warm
 * graded poster, never a blank box. The same poster covers the no-WebGL /
 * context-loss path: we feature-detect before mounting the canvas, so a device
 * without WebGL gets a fully composed, palette-graded hero rather than a crash.
 */
const Canvas3D = dynamic(() => import('./Canvas3D'), {
  ssr: false,
  loading: () => <GradedBackdrop />,
});

/** Static warm-dark glow — CSS only, TRANSPARENT base so the travelling-light
 *  spine shows through. Designed (a candlelit pool), never a spinner or a flat
 *  fill. Doubles as the no-WebGL atmosphere: the spine + per-room blooms still
 *  carry the full admittance arc without any canvas. */
export function GradedBackdrop() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(70% 60% at 62% 34%, rgba(216,174,87,0.16), transparent 64%),' +
          'radial-gradient(80% 70% at 28% 70%, rgba(216,174,87,0.08), transparent 70%)',
      }}
    />
  );
}

export function Scene() {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setSupported(hasWebGL());
  }, []);

  // Before detection resolves (and whenever WebGL is unavailable) show the
  // designed graded backdrop — never a blank canvas.
  if (!supported) return <GradedBackdrop />;
  return <Canvas3D />;
}
