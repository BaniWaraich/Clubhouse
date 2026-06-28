'use client';

import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useState } from 'react';
import { Atmosphere } from './Atmosphere';

/**
 * The R3F canvas for "the warm room". No object, no studio HDRI — this is
 * atmosphere: a graded warm haze + slow motes color-matched to the bone/brass
 * palette. Restrained bloom lifts only the brightest brass light; a soft
 * vignette keeps the edges in the bone base so type always has air.
 *
 * PerformanceMonitor drops dpr before it drops frames; dpr is capped at [1, 2].
 */
export default function Canvas3D() {
  const [dpr, setDpr] = useState(1.5);
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <Canvas
      dpr={dpr}
      frameloop={reduce ? 'demand' : 'always'}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 5], fov: 35 }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#f3efe6']} />
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(Math.min(2, 2))}
      />
      <Atmosphere paused={reduce} />
      <EffectComposer enableNormalPass={false}>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.78}
          luminanceSmoothing={0.5}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
