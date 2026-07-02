'use client';

/**
 * Isolated development route for the GLB brass key (asset: /assets/key.glb,
 * DRACO + webp compressed). This route is a PREVIEW of the animated entrance we
 * intend to swap onto `main`: the key twists about its long axis, the camera
 * dollies in, and a warm light BEHIND the key expands as it zooms — mirroring
 * the production KeyReveal choreography, but with this GLB key + finish.
 *
 * Scroll → rotation NEVER passes through React state: scroll progress lives in a
 * ref (fed by ScrollTrigger.onUpdate) and the rotation is mutated directly on the
 * mesh ref inside useFrame, damped toward the scroll target so the twist eases
 * smoothly instead of snapping per wheel notch.
 *
 * The single Lenis↔GSAP RAF loop is owned by the root layout's
 * SmoothScrollProvider (lenis.on('scroll', ScrollTrigger.update);
 * gsap.ticker.add(raf); gsap.ticker.lagSmoothing(0)) which wraps every route,
 * so ScrollTrigger here shares that one loop.
 */

import { useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from '@/lib/gsap';
import { phase, clamp01 } from '@/lib/easings';
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  Box3,
  CanvasTexture,
  Color,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  type PointLight,
  type Sprite,
  Vector3,
} from 'three';

const MODEL = '/assets/key.glb';

// Camera framing math: at z=6 the vertical key sits ~75% of the frame; the dolly
// carries it in to z=1.6 (fills frame) and just past for the "into the light" beat.
const Z_START = 6;
const Z_NEAR = 1.6;
const Z_THROUGH = 0.5;
const TURNS = Math.PI * 2 * 1.25; // ~1.25 turns about the long axis

/* ------------------------------------------------------------------ */
/* The key + its scroll-driven rig                                     */
/* ------------------------------------------------------------------ */

function useProgress() {
  const p = useRef(0);
  useGSAP(() => {
    const st = ScrollTrigger.create({
      trigger: '#key-dev-track',
      start: 'top top',
      end: 'bottom bottom',
      // 1 (not `true`): a 1s catch-up smoothing on top of the Lenis-smoothed
      // position. The per-frame damp() below eases rotation the rest of the way.
      scrub: 1,
      onUpdate: (self) => {
        p.current = self.progress;
      },
    });
    return () => st.kill();
  }, []);
  return p;
}

function Rig() {
  const { scene } = useGLTF(MODEL, true);
  const { camera } = useThree();

  const spin = useRef<Group>(null); // twists about the long axis (world Y)
  const orient = useRef<Group>(null); // canonical vertical pose
  const back = useRef<PointLight>(null); // the light behind the key
  const halo = useRef<Sprite>(null); // the expanding glow behind the key
  const progress = useProgress();
  const targetRotation = useRef(0); // scroll-driven twist target, damped toward

  // Cloned model. Keep the GLTF's OWN material + baked maps (diffuse / normal /
  // metallic-roughness); only adjust it for shine: convert Standard→Physical to
  // gain a clearcoat, lift envMapIntensity, and set a base roughness that
  // MULTIPLIES the existing roughness map (keeps wear detail, adds gloss).
  const model = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((o) => {
      if (!(o as Mesh).isMesh) return;
      const mesh = o as Mesh;
      const src = mesh.material as MeshStandardMaterial;

      let mat: MeshPhysicalMaterial;
      if ((src as unknown as { isMeshPhysicalMaterial?: boolean }).isMeshPhysicalMaterial) {
        mat = src as unknown as MeshPhysicalMaterial;
      } else {
        // Carry over every map + colour + PBR value from the Standard material.
        // NB: MeshPhysicalMaterial.copy(standard) throws (it reads physical-only
        // props like clearcoatNormalScale off the source), so we invoke the
        // *Standard* copy on the physical instance, then layer clearcoat on top.
        mat = new MeshPhysicalMaterial();
        MeshStandardMaterial.prototype.copy.call(mat, src);
      }

      mat.envMapIntensity = 1.8;
      mat.roughness = 0.65; // multiplies the existing roughness map
      mat.clearcoat = 0.4;
      mat.clearcoatRoughness = 0.15;
      mat.needsUpdate = true;

      mesh.material = mat;
      mesh.castShadow = mesh.receiveShadow = false;
    });
    return root;
  }, [scene]);

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

  // Centre + scale + stand the key vertical (bow up), flat face to camera.
  useLayoutEffect(() => {
    const o = orient.current;
    if (!o) return;
    o.rotation.set(0, 0, 0);
    o.scale.set(1, 1, 1);
    const box = new Box3().setFromObject(o);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    model.position.sub(center);
    o.rotation.x = Math.PI / 2; // long axis Z → vertical, bow up
    const TARGET_WORLD_HEIGHT = 2.6;
    o.scale.setScalar(TARGET_WORLD_HEIGHT / size.z);
  }, [model]);

  useFrame((_state, delta) => {
    const p = progress.current;

    // ---- twist about the long axis (world Y) — like a key in a lock ----
    // The scroll target is a pure function of progress; the mesh rotation is
    // DAMPED toward it every frame (never set directly from scroll), so a single
    // wheel notch decays smoothly across frames instead of snapping.
    targetRotation.current = phase(p, 0, 0.85) * TURNS;
    if (spin.current) {
      spin.current.rotation.y = MathUtils.damp(
        spin.current.rotation.y,
        targetRotation.current,
        4,
        delta,
      );
    }

    // ---- camera dolly in, then a touch past for the "into the light" beat ----
    // the full key stays framed + twisting through the first half; the zoom is
    // the finale, so the twist is legible before the camera dives in.
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
      const s = 2.4 + grow * 9; // expand
      halo.current.scale.setScalar(s);
      (halo.current.material as { opacity: number }).opacity = 0.3 + grow * 0.62;
    }
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
          rims the brass edges (mirrors the main reveal) */}
      <pointLight ref={back} position={[0, -0.3, -2.2]} color="#ffb35c" intensity={3} decay={2} />

      <group ref={spin}>
        <group ref={orient}>
          <primitive object={model} />
        </group>
      </group>
    </>
  );
}

export default function KeyDevScene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, Z_START], fov: 32 }}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      style={{ position: 'absolute', inset: 0 }}
      onCreated={({ scene }) => {
        scene.background = new Color('#0d0b08'); // scene stays dark; env is reflections only
      }}
    >
      {/* dim fill from the camera side so the brass reads as warm metal, not a
          dead-black silhouette — the key still "looks good" through the turn */}
      <ambientLight intensity={0.28} color="#f0d9a0" />
      <directionalLight position={[2, 3, 5]} intensity={0.9} color="#fff2df" />

      {/* Black studio environment — REFLECTIONS ONLY. The scene background stays
          #0d0b08 (set above); this env's own black background + bright Lightformer
          panels give the brass crisp specular streaks while the scene reads dark. */}
      <Environment resolution={512}>
        <color attach="background" args={['#000000']} />
        <Lightformer intensity={4} color="#fff2d9" position={[0, 2, 3]} scale={[6, 0.6, 1]} />
        <Lightformer intensity={2.5} color="#ffb35c" position={[-3, 0, -2]} scale={[0.8, 4, 1]} />
        <Lightformer intensity={1.5} color="#ffffff" position={[3, -1, 1]} scale={[4, 0.4, 1]} />
      </Environment>

      <Rig />

      {/* luminanceThreshold 0.9 so only the backlight glow blooms — the glossier
          brass + Lightformer streaks stay crisp instead of hazing over. */}
      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={0.9} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}

useGLTF.preload(MODEL);
