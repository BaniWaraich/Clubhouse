# Stack Patterns (Next.js App Router)

Correct, copy-adaptable patterns for the motion and 3D layers. Adapt naming and
values to the brief; keep the integration wiring intact — it's the part that's
easy to get subtly wrong (competing RAF loops, SSR'd WebGL, reduced-motion gaps).

Install:

```bash
npm i three @react-three/fiber @react-three/drei gsap lenis
npm i @react-three/postprocessing   # only for the dark-immersive register
```

---

## 1. Smooth scroll provider (Lenis ↔ GSAP ScrollTrigger)

The whole experience rides on smooth scroll. Lenis must own the RAF loop and
drive ScrollTrigger; never run a second independent loop. Respect
reduced-motion by skipping Lenis entirely (native scroll).

```tsx
// components/providers/smooth-scroll.tsx
'use client';

import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return; // native scroll, no smoothing

    const lenis = new Lenis({
      duration: 1.2,                          // heavier for luxe-minimal (~1.6)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);

  return <>{children}</>;
}
```

Wrap the app in `app/layout.tsx` and load fonts with `next/font` to avoid layout
shift. Mount the grain overlay here too so it sits above everything.

---

## 2. R3F canvas — dynamic, never SSR'd

WebGL must not block first paint and must not run on the server. Dynamic-import
the canvas with `ssr: false` and a designed fallback.

```tsx
// components/three/Scene.tsx
'use client';

import dynamic from 'next/dynamic';

const Canvas3D = dynamic(() => import('./Canvas3D'), {
  ssr: false,
  loading: () => <StaticHeroFallback />, // art-directed poster, NOT a blank box
});

export function Scene() {
  return <Canvas3D />;
}
```

```tsx
// components/three/Canvas3D.tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, PerformanceMonitor } from '@react-three/drei';
import { useState } from 'react';
import { ConceptObject } from './ConceptObject';

export default function Canvas3D() {
  const [dpr, setDpr] = useState(1.5);
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <Canvas
      dpr={dpr}
      frameloop={reduce ? 'demand' : 'always'} // static frame when reduced
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 5], fov: 35 }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}      // drop quality before dropping frames
        onIncline={() => setDpr(2)}
      />
      <Environment preset="studio" />     {/* HDRI lighting = the "expensive" look */}
      <ConceptObject paused={reduce} />
      <ContactShadows opacity={0.4} blur={2.5} far={4} />
    </Canvas>
  );
}
```

Notes:
- `Environment` (HDRI) does most of the work of making materials look real.
- For luxe-minimal materials use drei `MeshTransmissionMaterial` (glass/liquid),
  `Float` for languid idle motion, `ContactShadows` for grounding.
- For dark-immersive, add `@react-three/postprocessing`
  (`EffectComposer` → `Bloom`, `ChromaticAberration`, `Noise`, `Vignette`).

---

## 3. Scroll-linked 3D

Couple the scene to scroll via ScrollTrigger feeding values into the R3F frame
loop. Keep R3F's loop authoritative; let ScrollTrigger write a ref, read it in
`useFrame`, and `lerp` toward it so motion stays smooth.

```tsx
// components/three/ConceptObject.tsx
'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react'; // optional; or a plain useEffect
import type { Mesh } from 'three';

export function ConceptObject({ paused }: { paused: boolean }) {
  const mesh = useRef<Mesh>(null);
  const target = useRef({ rot: 0 });

  useGSAP(() => {
    if (paused) return;
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => (target.current.rot = self.progress * Math.PI),
    });
  }, [paused]);

  useFrame((_, delta) => {
    if (!mesh.current || paused) return;
    // damped follow → buttery, never snappy
    mesh.current.rotation.y +=
      (target.current.rot - mesh.current.rotation.y) * Math.min(1, delta * 4);
  });

  return (
    <mesh ref={mesh}>
      {/* swap geometry/material per the register's 3D concept */}
      <icosahedronGeometry args={[1.2, 6]} />
      <meshStandardMaterial roughness={0.15} metalness={0.9} />
    </mesh>
  );
}
```

---

## 4. Text mask reveal (the signature editorial move)

Lines clipped and revealed on scroll with stagger. Honor reduced-motion by
showing text immediately.

```tsx
// components/ui/SplitText.tsx
'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

export function SplitText({ children }: { children: string }) {
  const root = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lines = root.current!.querySelectorAll('.line-inner');
    if (reduce) {
      gsap.set(lines, { yPercent: 0, opacity: 1 });
      return;
    }
    gsap.from(lines, {
      yPercent: 110,
      duration: 1,
      ease: 'expo.out',          // matches cubic-bezier(0.16,1,0.3,1)
      stagger: 0.08,
      scrollTrigger: { trigger: root.current, start: 'top 85%' },
    });
  }, []);

  return (
    <span ref={root} aria-label={children}>
      {children.split('\n').map((line, i) => (
        <span key={i} className="line" style={{ display: 'block', overflow: 'hidden' }}>
          <span className="line-inner" style={{ display: 'block' }}>
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}
```

`overflow: hidden` on the outer line + translating the inner span = the clean
mask wipe. The same pattern with `clip-path` insets handles image reveals.

---

## 5. Magnetic button (detail-layer interaction)

A small lerp-toward-pointer effect that reads as craft. Skip it on touch and
under reduced-motion.

```tsx
// components/ui/MagneticButton.tsx
'use client';

import { useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';

export function MagneticButton({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);

  const onMove = (e: React.MouseEvent) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.6, ease: 'power3.out' });
  };

  const reset = () =>
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });

  return (
    <button ref={ref} onMouseMove={onMove} onMouseLeave={reset}>
      {children}
    </button>
  );
}
```

---

## 6. Easings — keep them in one place

```ts
// lib/easings.ts
export const ease = {
  expo:   [0.16, 1, 0.3, 1],     // brutalist editorial reveals
  luxe:   [0.22, 1, 0.36, 1],    // luxe-minimal, slow & long
  smooth: [0.4, 0, 0.2, 1],      // dark-immersive, continuous
} as const;
```

Use these everywhere instead of CSS defaults. The shared curve across components
is a big part of why a site feels authored rather than assembled.

---

## Reduced-motion checklist (verify every build)

- Lenis not initialized (native scroll).
- ScrollTrigger scrubbed animations not created; 3D renders a static graded frame
  (`frameloop="demand"`).
- Reveal animations set to final state instantly.
- Magnetic / cursor effects disabled.
- Page is fully readable, navigable, and still well-composed with zero motion.
