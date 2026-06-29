'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { AgXToneMapping, type Group } from 'three';
import { KeyModel } from './KeyModel';
import { PALETTE } from '@/lib/palette';
import { clamp01, phase, smoother } from '@/lib/easings';

/**
 * Tone mapping (remediation #1). AgX holds warm-metal mid-tones far better than
 * the R3F default (ACES), which crushed the brass toward brown. Signed off over
 * Neutral after a side-by-side comparison.
 */

/**
 * The scroll-scrubbed brass-key entrance.
 *
 * Choreography is a PURE FUNCTION of scroll progress. Lenis is the single
 * temporal smoother (it eases the scroll *position*); this ScrollTrigger uses
 * `scrub: true` to map that already-smoothed position DIRECTLY to progress, and
 * the Rig reads progress with no in-frame integrator. So motion is deterministic
 * in `p` and therefore framerate-independent by construction — no `damp()` lag,
 * no cascade of low-pass filters fighting each other.
 *
 *   turn   p 0.00–0.82  the key turns ~1.25 turns about its long axis, eased
 *                       with smootherstep (zero accel at both ends — no snap)
 *   dolly  p 0.00–0.82  camera glides from z=5.2 toward the key (z→0.15)
 *   pass   p 0.78–1.00  camera passes THROUGH the key (z<0); overlaps the end
 *                       of the dolly so there is NO velocity jump at the seam
 *   wash   p 0.58–0.94  the bone wash (handled in KeyReveal) fades to --base
 *
 * Every phase is sliced with `phase()` (smootherstep on a clamped sub-range) so
 * value AND velocity are continuous across boundaries — the old linear ramps
 * stopped dead at 0.78 and read as a "click".
 *
 * Lighting is fully OFFLINE: drei <Environment> built from inline <Lightformer>s
 * (no HDRI fetch — the preset path hits a CDN and was avoided deliberately),
 * plus explicit key/rim lights. A restrained Bloom lifts only the genuine brass
 * speculars (tight radius, no visible haze). No depth-of-field: the camera
 * dollies through the key, so a fixed focal plane would smear it — the hero key
 * stays crisp instead.
 */

// Camera framing math (verified against geometry bounds):
//   key bounds: y∈[-1.19, 1.78] (height 2.97, center ≈0.30), x-width 1.32.
//   at z=5.2, fov 35° → visible half-height = 5.2·tan(17.5°) ≈ 1.64 → full
//   height 3.28, so the 2.97-tall key sits fully in frame with a calm margin
//   and reads large. lookAt y≈0.3 centers it. As p→1 the camera dollies to
//   z≈0.15 then passes through to z≈-1.25.
const Z_START = 5.2;
const Z_NEAR = 0.15;
const Z_THROUGH = -1.4;
const TURNS = Math.PI * 2 * 1.25; // ~1.25 turns
const LOOK_Y = 0.3;

function Rig({
  initial,
  paused,
  onProgress,
}: {
  initial: string;
  paused: boolean;
  onProgress: (p: number) => void;
}) {
  const turn = useRef<Group>(null); // the spinning key
  const { camera } = useThree();
  const target = useRef({ progress: paused ? 0.16 : 0 });

  useGSAP(() => {
    if (paused) return;
    const st = ScrollTrigger.create({
      trigger: '#key-track',
      start: 'top top',
      end: 'bottom bottom',
      // `true` = a DIRECT map of scroll position → progress, not a temporal
      // filter. Lenis already smooths the scroll position (the single source of
      // temporal smoothing); scrubbing instantly off it keeps the key connected
      // to the wheel instead of trailing behind a stack of catch-up filters.
      scrub: true,
      onUpdate: (self) => {
        target.current.progress = self.progress;
      },
    });
    return () => st.kill();
  }, [paused]);

  useFrame(() => {
    // progress is read DIRECTLY — no in-frame damp. It is already smoothed once,
    // by Lenis, upstream; everything below is a pure function of `p`, so the
    // motion is identical at 30/60/144fps.
    const p = paused ? 0.16 : target.current.progress;

    // ---- key turn about its LONG axis (local Y) — like a key in a lock ----
    // smootherstep over 0→0.82 so it eases in from rest and settles without a
    // hard stop before the pass-through.
    const turnP = phase(p, 0, 0.82);
    if (turn.current) {
      turn.current.rotation.y = turnP * TURNS;
    }

    // ---- camera dolly + pass-through, blended for a continuous velocity ----
    const dollyP = phase(p, 0, 0.82); // glide in
    const passP = phase(p, 0.78, 1); // overlaps the tail of the dolly
    // dolly to Z_NEAR, then carry on through to Z_THROUGH; because both phases
    // are smootherstep and overlap on 0.78–0.82, dz/dp has no discontinuity.
    camera.position.z =
      Z_START + (Z_NEAR - Z_START) * dollyP + (Z_THROUGH - Z_NEAR) * passP;

    // gentle lateral drift so it never feels locked to a rail (eased, symmetric)
    camera.position.x = Math.sin(smoother(clamp01(p)) * Math.PI) * 0.1;
    camera.position.y = LOOK_Y + Math.sin(clamp01(p) * Math.PI) * 0.04;
    camera.lookAt(0, LOOK_Y, 0);

    onProgress(p);
  });

  return <KeyModel initial={initial} groupRef={turn} />;
}

export default function KeyCanvas({
  initial,
  paused,
  onProgress,
}: {
  initial: string;
  paused: boolean;
  onProgress: (p: number) => void;
}) {
  const [dpr, setDpr] = useState<[number, number] | number>([1, 2]);

  return (
    <Canvas
      dpr={dpr}
      frameloop="always"
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: AgXToneMapping,
        toneMappingExposure: 1.0,
      }}
      camera={{ position: [0, LOOK_Y, Z_START], fov: 35 }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr([1, 2])}
      />

      {/* THE ADMITTANCE OPENING (spec §3.1): warm near-black, the key BACKLIT —
          a soft brass halo sits behind it — but the brass must READ as dimensional
          metal, so a warm key light + fill + a fuller warm environment keep the
          camera-facing faces and the incised initial alive through the turn (no
          dead-black silhouette), while the dark surround holds the mood. */}
      <ambientLight intensity={0.45} color="#f0d9a0" />
      {/* main warm key light, upper-front — gives the faces and engraving form */}
      <directionalLight position={[3, 4, 4]} intensity={1.6} color={PALETTE.brassWarm} />
      {/* the backlight — warm, behind the key: a SOFT halo, not a harsh hotspot */}
      <directionalLight position={[0, 2, -5]} intensity={1.9} color="#e8c879" />
      {/* warm front fill so the bow face + incised disc read as warm metal, not a
          black pool, as the disc rotates toward camera */}
      <directionalLight position={[0, 1, 6]} intensity={0.85} color={PALETTE.brassWarm} />
      {/* cool rim from behind-left to separate the silhouette from the near-black */}
      <directionalLight position={[-5, 2, -3]} intensity={0.55} color={PALETTE.rimCool} />

      {/* OFFLINE environment for metal reflections — inline emitters, no HDRI.
          A broad, low-contrast WARM surround (aged brass reads off a soft warm
          room, not black gaps) with one contained warm panel behind for the
          backlit edge + a thin streak that sweeps as it turns. */}
      <Environment resolution={256}>
        {/* broad warm-dark surround — continuous warm light for the metal to
            reflect, so faces never collapse to black */}
        <Lightformer
          form="rect"
          intensity={0.7}
          color="#6b5230"
          position={[0, 0, -6]}
          scale={[16, 16, 1]}
        />
        {/* contained warm panel behind the key — the soft backlight it rims off */}
        <Lightformer
          form="rect"
          intensity={1.8}
          color="#e8c879"
          position={[0, 2, -4]}
          scale={[4, 5, 1]}
        />
        {/* a thin warm streak that sweeps across the metal as it rotates */}
        <Lightformer
          form="rect"
          intensity={2.2}
          color={PALETTE.brassWarm}
          position={[0, 1, 4]}
          scale={[0.35, 6, 1]}
        />
        {/* a warm ring low and behind for a turned, candlelit reflection */}
        <Lightformer
          form="ring"
          intensity={1.0}
          color={PALETTE.brass}
          position={[0, -2, -2]}
          scale={[4, 4, 1]}
        />
        {/* a broad warm panel on the camera side so the bow face + incised disc
            reflect continuous warm light head-on instead of a dead black pool */}
        <Lightformer
          form="rect"
          intensity={0.85}
          color={PALETTE.brassWarm}
          position={[0, 1, 7]}
          scale={[12, 12, 1]}
        />
      </Environment>

      <Rig initial={initial} paused={paused} onProgress={onProgress} />

      {/* Restrained grade: Bloom ONLY on the brightest brass speculars — a high
          threshold and tight radius so it lifts the metal's hot edges without a
          visible halo and never softens the key body or the incised engraving.
          No DoF (the camera dollies through the key; a fixed focal plane smears
          it). multisampling 4 + dpr [1,2] keep the silhouette and ward edges
          clean through the composer. */}
      <EffectComposer multisampling={4} enableNormalPass={false}>
        <Bloom
          intensity={0.22}
          luminanceThreshold={0.9}
          luminanceSmoothing={0.25}
          mipmapBlur
          radius={0.5}
        />
      </EffectComposer>
    </Canvas>
  );
}
