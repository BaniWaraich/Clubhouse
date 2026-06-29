'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  AdditiveBlending,
  type Group,
  type Points,
  type ShaderMaterial,
  Color,
} from 'three';
import { PALETTE } from '@/lib/palette';

/**
 * "The warm room" — light, not object.
 *
 * A slow-drifting field of warm golden haze (a soft-lit gradient plane) with a
 * sparse, slow particle field of motes, color-graded to the bone/brass palette.
 * As you scroll the light deepens and the camera eases forward, as if moving
 * through a sunlit, candlelit interior seen from across a room.
 *
 * Pattern preserved from the scaffold: ScrollTrigger writes a target ref;
 * useFrame lerps toward it so motion stays buttery, never snappy.
 */

import { ADMITTANCE } from '@/lib/palette';

const GLOW = new Color(ADMITTANCE.brassGlow); // warm brass glow over the dark
const DEEP = new Color(ADMITTANCE.brassGlowHi); // brighter glow as light arrives

// Soft radial gradient haze. Two drifting warm pools over the bone base; a
// scroll uniform deepens the light. No hard edges, nothing reads as an object.
const hazeVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0); // fullscreen, ignores camera
  }
`;

const hazeFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uScroll;
  uniform float uAspect;
  uniform vec3 uGlow;
  uniform vec3 uDeep;

  float softPool(vec2 uv, vec2 c, float r) {
    float d = length((uv - c) * vec2(uAspect, 1.0));
    return smoothstep(r, 0.0, d);
  }

  void main() {
    vec2 uv = vUv;

    // two slowly drifting warm pools of candlelight
    float t = uTime * 0.04;
    vec2 c1 = vec2(0.62 + 0.05 * sin(t), 0.34 + 0.04 * cos(t * 0.8));
    vec2 c2 = vec2(0.30 + 0.04 * cos(t * 0.7), 0.66 + 0.05 * sin(t * 0.9));

    // tight pools so most of the field stays the dark spine — localized
    // candlelight, not a screen-wide veil.
    float pool = softPool(uv, c1, 0.42) * 0.8 + softPool(uv, c2, 0.5) * 0.45;
    pool = clamp(pool, 0.0, 1.0);

    // TRANSPARENT atmosphere: the CSS spine is the background; we only ADD a warm
    // brass glow over it. The glow brightens slightly through the dark middle then
    // fades out as the page reaches full warm light, so it never blows out paper.
    vec3 warm = mix(uGlow, uDeep, clamp(uScroll * 1.2, 0.0, 1.0));
    float fade = 1.0 - smoothstep(0.55, 0.95, uScroll); // gone by The Book
    // a subtle candlelit warmth ONLY — never a gold wash over the dark rooms.
    float a = pool * (0.06 + 0.04 * uScroll) * fade;

    gl_FragColor = vec4(warm, a);
  }
`;

function Haze({ paused }: { paused: boolean }) {
  const mat = useRef<ShaderMaterial>(null);
  const { size, invalidate } = useThree();
  const target = useRef({ scroll: 0 });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uAspect: { value: size.width / size.height },
      uGlow: { value: GLOW },
      uDeep: { value: DEEP },
    }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useGSAP(() => {
    if (paused) return;
    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => (target.current.scroll = self.progress),
    });
    return () => st.kill();
  }, [paused]);

  useFrame((_, delta) => {
    if (!mat.current) return;
    mat.current.uniforms.uAspect.value = size.width / size.height;
    if (paused) {
      // render a single static, well-composed frame
      mat.current.uniforms.uScroll.value = 0.12;
      invalidate();
      return;
    }
    mat.current.uniforms.uTime.value += delta;
    const u = mat.current.uniforms.uScroll;
    u.value += (target.current.scroll - u.value) * Math.min(1, delta * 3);
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={hazeVertex}
        fragmentShader={hazeFragment}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

function Motes({ count, paused }: { count: number; paused: boolean }) {
  const points = useRef<Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 9;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1;
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (!points.current || paused) return;
    // languid vertical drift + faint sway
    points.current.rotation.y += delta * 0.012;
    points.current.position.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.15;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        sizeAttenuation
        color={'#bfa066'}
        transparent
        opacity={0.4}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

export function Atmosphere({ paused }: { paused: boolean }) {
  const group = useRef<Group>(null);
  const { camera } = useThree();
  const target = useRef({ z: 5 });

  // camera eases forward through the room as you scroll
  useGSAP(() => {
    if (paused) return;
    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => (target.current.z = 5 - self.progress * 2.2),
    });
    return () => st.kill();
  }, [paused]);

  useFrame((_, delta) => {
    if (paused) return;
    camera.position.z += (target.current.z - camera.position.z) * Math.min(1, delta * 2);
  });

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <group ref={group}>
      <Haze paused={paused} />
      <Motes count={isMobile ? 70 : 180} paused={paused} />
    </group>
  );
}
