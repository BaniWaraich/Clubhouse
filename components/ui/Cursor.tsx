'use client';

import { useEffect } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';

/**
 * A curated cursor: a small ink dot that tracks the pointer 1:1, and a larger
 * ring that lerps behind it. Over interactive elements the ring expands and
 * tints brass — the unified-palette goal (#9).
 *
 * Gating: mounts its behaviour ONLY on a fine pointer (real mouse) without
 * reduced-motion. On touch / coarse pointers / reduced-motion it renders nothing
 * and leaves the native cursor untouched (the `has-cursor` body class — which
 * sets `cursor: none` — is added only when active).
 *
 * Motion is a single GSAP quickTo per layer (transform only, no layout), so it
 * stays cheap and never thrashes.
 */
export function Cursor() {
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine || prefersReducedMotion()) return;

    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    dot.setAttribute('aria-hidden', 'true');
    ring.setAttribute('aria-hidden', 'true');
    document.body.append(ring, dot);
    document.body.classList.add('has-cursor');

    // dot tracks tightly; ring trails with a softer follow
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power3' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power3' });

    const onMove = (e: PointerEvent) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const onOver = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest(
        'a, button, [data-cursor], input, textarea, [role="button"]',
      );
      ring.classList.toggle('is-active', !!target);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      document.body.classList.remove('has-cursor');
      dot.remove();
      ring.remove();
    };
  }, []);

  return null;
}
