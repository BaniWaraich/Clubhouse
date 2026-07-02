'use client';

import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { useEffect, useState } from 'react';
import { Atmosphere } from './Atmosphere';
import { GradedBackdrop } from './Scene';
import { ATMOSPHERE_ACTIVE_AFTER_VH } from '@/lib/scene';

/**
 * The R3F canvas for "the warm room". No object, no studio HDRI — this is
 * atmosphere: a graded warm haze + slow motes color-matched to the bone/brass
 * palette. A soft vignette keeps the edges in the bone base so type always has air.
 *
 * PERF (the scroll-jank fix): this canvas is fixed BEHIND the entire page, but it
 * is fully hidden by the opaque key stage through the whole 320vh entrance — and
 * it used to render *every frame anyway*, simultaneously with the key canvas AND
 * a second full-screen bloom pass. That double-canvas / double-bloom was the main
 * cause of the choppy scroll. Now:
 *   - the render loop is GATED: it idles (frameloop 'demand') until the rooms are
 *     actually on screen, and whenever the tab is hidden, so it never runs at the
 *     same time as the key canvas;
 *   - the bloom pass is GONE (the haze + motes are additive and soft — bloom here
 *     was pure cost for no visible gain);
 *   - dpr is capped low (soft haze needs no detail).
 */
export default function Canvas3D() {
  const [dpr, setDpr] = useState(1);
  const [lost, setLost] = useState(false);
  const [active, setActive] = useState(false);
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Only run once the entrance (the 320vh key-track) has essentially scrolled
  // away and the rooms are on screen; pause when the tab is backgrounded. This
  // is what stops the atmosphere from rendering behind the opaque key stage and
  // on top of the key canvas.
  useEffect(() => {
    if (reduce) return;
    const update = () => {
      const onstage =
        window.scrollY > window.innerHeight * ATMOSPHERE_ACTIVE_AFTER_VH &&
        !document.hidden;
      setActive((prev) => (prev === onstage ? prev : onstage));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    document.addEventListener('visibilitychange', update);
    return () => {
      window.removeEventListener('scroll', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, [reduce]);

  // Context loss → the designed warm static backdrop (the no-WebGL path), never
  // a blank canvas; the spine + per-room blooms still carry the admittance arc.
  if (lost) return <GradedBackdrop />;

  return (
    <Canvas
      dpr={dpr}
      // idle unless the rooms are visible; the key canvas owns the entrance.
      frameloop={!reduce && active ? 'always' : 'demand'}
      // transparent: the CSS travelling-light spine is the background; the
      // atmosphere only layers warm haze, motes and brass glow over it.
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 5], fov: 35 }}
      style={{ position: 'absolute', inset: 0 }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          setLost(true);
        });
      }}
    >
      {/* dpr adapts but stays capped — soft haze, not detail, and no bloom pass. */}
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(1.25)}
      />
      <Atmosphere paused={reduce || !active} />
      {/* No EffectComposer/Bloom here anymore: a full-screen multi-pass bloom over
          a ~0.06-alpha haze cost a frame for nothing. The key canvas keeps the one
          restrained bloom the brass speculars actually need. */}
    </Canvas>
  );
}
