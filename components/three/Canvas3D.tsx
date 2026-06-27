'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, PerformanceMonitor } from '@react-three/drei';
import { useState } from 'react';
import { ConceptObject } from './ConceptObject';

/**
 * The R3F canvas. HDRI Environment does most of the work of making materials
 * look real. PerformanceMonitor drops quality (dpr) before it drops frames.
 *
 * PLACEHOLDER scene — the concept object is a temporary stand-in until the
 * art direction (register, material, lighting mood) is decided in the brainstorm.
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
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 5], fov: 35 }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(2)} />
      <Environment preset="studio" />
      <ConceptObject paused={reduce} />
      <ContactShadows position={[0, -1.4, 0]} opacity={0.4} blur={2.5} far={4} />
    </Canvas>
  );
}
