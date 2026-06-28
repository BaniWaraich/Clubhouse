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

const BASE = new Color(PALETTE.base);
const GLOW = new Color(PALETTE.glow); // brass family (aligned to --accent, #13)
const DEEP = new Color('#e7dcc4'); // deepened warm wash for late scroll

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
  uniform vec3 uBase;
  uniform vec3 uGlow;
  uniform vec3 uDeep;

  float softPool(vec2 uv, vec2 c, float r) {
    float d = length((uv - c) * vec2(uAspect, 1.0));
    return smoothstep(r, 0.0, d);
  }

  void main() {
    vec2 uv = vUv;

    // two slowly drifting warm pools of light
    float t = uTime * 0.04;
    vec2 c1 = vec2(0.62 + 0.05 * sin(t), 0.34 + 0.04 * cos(t * 0.8));
    vec2 c2 = vec2(0.30 + 0.04 * cos(t * 0.7), 0.66 + 0.05 * sin(t * 0.9));

    float pool = softPool(uv, c1, 0.85) * 0.9 + softPool(uv, c2, 1.05) * 0.55;
    pool = clamp(pool, 0.0, 1.0);

    // deepen the wash as the page scrolls
    vec3 warm = mix(uGlow, uDeep, clamp(uScroll * 1.2, 0.0, 1.0));
    vec3 col = mix(uBase, warm, pool * (0.5 + 0.5 * uScroll));

    // gentle vignette toward the bone base so type always has air
    float vig = smoothstep(1.25, 0.2, length((uv - 0.5) * vec2(uAspect, 1.0)));
    col = mix(uBase, col, 0.35 + 0.65 * vig);

    gl_FragColor = vec4(col, 1.0);
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
      uBase: { value: BASE },
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
