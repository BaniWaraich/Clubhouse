'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

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

/** Static, palette-graded warm room — CSS only. Designed, not a spinner. */
export function GradedBackdrop() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(70% 60% at 62% 34%, rgba(202,162,88,0.34), transparent 64%),' +
          'radial-gradient(80% 70% at 28% 70%, rgba(202,162,88,0.18), transparent 70%),' +
          'var(--base)',
      }}
    />
  );
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
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
