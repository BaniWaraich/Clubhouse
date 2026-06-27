'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { Mesh } from 'three';

/**
 * PLACEHOLDER signature object.
 *
 * This is a temporary stand-in so the scroll↔3D wiring is testable. Replace the
 * geometry + material with the real brand concept once the register is chosen
 * (e.g. a frosted-glass monolith with MeshTransmissionMaterial for luxe-minimal,
 * or a shader/particle field for dark-immersive).
 *
 * Pattern that must survive the swap: ScrollTrigger writes a target ref;
 * useFrame lerps toward it so motion stays buttery, never snappy.
 */
export function ConceptObject({ paused }: { paused: boolean }) {
  const mesh = useRef<Mesh>(null);
  const target = useRef({ rot: 0 });

  useGSAP(() => {
    if (paused) return;
    const st = ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => (target.current.rot = self.progress * Math.PI),
    });
    return () => st.kill();
  }, [paused]);

  useFrame((_, delta) => {
    if (!mesh.current || paused) return;
    mesh.current.rotation.y +=
      (target.current.rot - mesh.current.rotation.y) * Math.min(1, delta * 4);
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.2, 6]} />
      <meshStandardMaterial roughness={0.15} metalness={0.9} color="#b4965a" />
    </mesh>
  );
}
