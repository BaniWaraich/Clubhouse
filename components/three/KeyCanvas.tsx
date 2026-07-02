'use client';

import { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  CanvasTexture,
  Color,
  type Group,
  MathUtils,
  type PointLight,
  type Sprite,
} from 'three';
import { KeyModel } from './KeyModel';
import { phase, clamp01 } from '@/lib/easings';

/**
 * The scroll-scrubbed brass-key entrance.
 *
 * Choreography is a PURE FUNCTION of scroll progress. Lenis is the single
 * temporal smoother (it eases the scroll *position*); this ScrollTrigger uses
 * `scrub: 1` to map that already-smoothed position to progress, and the twist is
 * then DAMPED toward its scroll target every frame — so a single wheel notch
 * eases across frames instead of snapping, and motion is framerate-independent.
 *
 *   twist  p 0.00–0.85  the key turns ~1.25 turns about its long axis (world Y),
 *                       damped toward target (smootherstep eased target)
 *   dolly  p 0.50–0.95  camera holds the full key framed while it twists, then
 *                       glides in — the zoom is the finale, not the whole scroll
 *   pass   p 0.90–1.00  camera carries just past the key into the light
 *   glow   p 0.35–1.00  the warm light BEHIND the key grows + EXPANDS as it zooms
 *
 * Lighting is fully OFFLINE: a black-studio drei <Environment> (inline
 * <Lightformer>s, no HDRI/CDN) gives the glossy brass its bright specular
 * streaks for reflections only, while explicit fill + a warm backlight point
 * light and an additive halo sprite provide the expanding glow behind the key.
 */

const Z_START = 6;
const Z_NEAR = 1.6;
const Z_THROUGH = 0.5;
const TURNS = Math.PI * 2 * 1.25; // ~1.25 turns about the long axis

function Rig({
  paused,
  onProgress,
}: {
  paused: boolean;
  onProgress: (p: number) => void;
}) {
  const spin = useRef<Group>(null); // the twisting key (world-Y long axis)
  const back = useRef<PointLight>(null); // warm light behind the key
  const halo = useRef<Sprite>(null); // expanding glow behind the key
  const { camera } = useThree();

  const target = useRef({ progress: paused ? 0.16 : 0 });
  const targetRotation = useRef(0);

  useGSAP(() => {
    if (paused) return;
    const st = ScrollTrigger.create({
      trigger: '#key-track',
      start: 'top top',
      end: 'bottom bottom',
      // 1 (not `true`): a short catch-up smoothing on top of the Lenis-smoothed
      // position; the per-frame damp() below eases the twist the rest of the way.
      scrub: 1,
      onUpdate: (self) => {
        target.current.progress = self.progress;
      },
    });
    return () => st.kill();
  }, [paused]);

  // Soft radial glow texture for the halo behind the key.
  const glowTex = useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255, 200, 130, 1)');
    g.addColorStop(0.28, 'rgba(255, 170, 92, 0.55)');
    g.addColorStop(0.6, 'rgba(180, 120, 60, 0.12)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new CanvasTexture(canvas);
  }, []);

  useFrame((_state, delta) => {
    const p = paused ? 0.16 : target.current.progress;

    // ---- twist about the long axis (world Y), damped toward the scroll target
    targetRotation.current = phase(p, 0, 0.85) * TURNS;
    if (spin.current) {
      spin.current.rotation.y = MathUtils.damp(
        spin.current.rotation.y,
        targetRotation.current,
        4,
        delta,
      );
    }

    // ---- camera dolly (finale), then a touch past into the light ----
    const dollyP = phase(p, 0.5, 0.95);
    const passP = phase(p, 0.9, 1);
    camera.position.z = Z_START + (Z_NEAR - Z_START) * dollyP + (Z_THROUGH - Z_NEAR) * passP;
    camera.position.x = 0;
    camera.position.y = 0;
    camera.lookAt(0, 0, 0);

    // ---- the light BEHIND the key grows and EXPANDS as it zooms ----
    const grow = phase(p, 0.35, 1);
    const base = clamp01(p);
    if (back.current) back.current.intensity = 3 + base * 4 + grow * 13;
    if (halo.current) {
      halo.current.scale.setScalar(2.4 + grow * 9);
      (halo.current.material as { opacity: number }).opacity = 0.3 + grow * 0.62;
    }

    onProgress(p);
  });

  return (
    <>
      {/* the expanding glow, behind the key so the silhouette occludes its core */}
      <sprite ref={halo} position={[0, 0.1, -1.6]} scale={2.4}>
        <spriteMaterial
          map={glowTex}
          blending={AdditiveBlending}
          depthWrite={false}
          transparent
          opacity={0.35}
        />
      </sprite>

      {/* warm point light behind + slightly below centre — the glow source that
          rims the brass edges */}
      <pointLight ref={back} position={[0, -0.3, -2.2]} color="#ffb35c" intensity={3} decay={2} />

      <KeyModel groupRef={spin} />
    </>
  );
}

export default function KeyCanvas({
  paused,
  onProgress,
  onContextLost,
  active = true,
}: {
  paused: boolean;
  onProgress: (p: number) => void;
  onContextLost?: () => void;
  /** Pause the render loop (frameloop:'demand') when the hero is offscreen — the
   *  context stays alive so there is no unmount/dispose, only an idle loop. */
  active?: boolean;
}) {
  const [dpr, setDpr] = useState<[number, number] | number>([1, 1.75]);

  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? 'always' : 'demand'}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      camera={{ position: [0, 0, Z_START], fov: 32 }}
      style={{ position: 'absolute', inset: 0 }}
      onCreated={({ gl, scene }) => {
        scene.background = new Color('#0d0b08'); // scene stays dark; env is reflections only
        // Context loss → tell the parent to fall back to the designed poster.
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          onContextLost?.();
        });
      }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr([1, 1.75])}
      />

      {/* dim fill from the camera side so the brass reads as warm metal, not a
          dead-black silhouette — the key still reads through the turn */}
      <ambientLight intensity={0.28} color="#f0d9a0" />
      <directionalLight position={[2, 3, 5]} intensity={0.9} color="#fff2df" />

      {/* Black studio environment — REFLECTIONS ONLY. Bright Lightformer panels
          give the glossy brass crisp specular streaks while the scene reads dark. */}
      <Environment resolution={512}>
        <color attach="background" args={['#000000']} />
        <Lightformer intensity={4} color="#fff2d9" position={[0, 2, 3]} scale={[6, 0.6, 1]} />
        <Lightformer intensity={2.5} color="#ffb35c" position={[-3, 0, -2]} scale={[0.8, 4, 1]} />
        <Lightformer intensity={1.5} color="#ffffff" position={[3, -1, 1]} scale={[4, 0.4, 1]} />
      </Environment>

      <Suspense fallback={null}>
        <Rig paused={paused} onProgress={onProgress} />
      </Suspense>

      {/* luminanceThreshold 0.9 so only the backlight glow blooms — the glossier
          brass + Lightformer streaks stay crisp instead of hazing over. */}
      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={0.9} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
