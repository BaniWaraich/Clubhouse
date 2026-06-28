'use client';

import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Lenis owns the RAF loop and drives ScrollTrigger. Never run a second
 * independent loop. Respect reduced-motion by skipping Lenis entirely
 * (native scroll).
 *
 * Lenis is the SINGLE source of temporal scroll smoothing on the site. Every
 * scrubbed animation (the key reveal, the atmosphere) reads scroll via
 * ScrollTrigger with `scrub: true` — a direct, non-temporal map — so nothing
 * stacks a second low-pass filter on top of this inertia. `duration` is therefore
 * tuned here once: ~1.1 gives a calm, weighty glide that still feels connected to
 * the wheel (1.8 felt sluggish only because two more filters used to sit on top).
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return; // native scroll, no smoothing

    const lenis = new Lenis({
      // The one temporal smoother. Calm luxe weight without lag now that nothing
      // filters on top: expo-out easing (canonical Lenis curve) over a ~1.1s
      // glide reads weighty but stays connected to the wheel.
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9, // calmer wheel response — less twitch per notch
      touchMultiplier: 1.4,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // expose for programmatic anchor scrolling (e.g. CTA → Invitation)
    window.__lenis = lenis;

    return () => {
      lenis.destroy();
      gsap.ticker.remove(raf);
      delete window.__lenis;
    };
  }, []);

  return <>{children}</>;
}
