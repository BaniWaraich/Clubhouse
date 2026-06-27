'use client';

import dynamic from 'next/dynamic';

/**
 * WebGL must not block first paint and must not run on the server.
 * Dynamic-import the canvas with ssr:false and a designed fallback (never a
 * blank box). The placeholder concept is temporary — swap in the real signature
 * scene once the art direction is locked.
 */
const Canvas3D = dynamic(() => import('./Canvas3D'), {
  ssr: false,
  loading: () => <StaticHeroFallback />,
});

function StaticHeroFallback() {
  // Designed poster, not a spinner. A graded radial glow on near-black.
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(60% 60% at 50% 40%, rgba(180,150,90,0.10), transparent 70%), var(--base)',
      }}
    />
  );
}

export function Scene() {
  return <Canvas3D />;
}
