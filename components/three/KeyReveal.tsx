'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { BRAND } from '@/lib/brand';
import { ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';

/**
 * The site's ENTRANCE: a scroll-scrubbed brass-key reveal that plays over a
 * warm bone field, then washes to bone and hands off to the normal site beneath.
 *
 * Structure:
 *   - a fixed full-viewport STAGE holds the WebGL canvas (dynamic, ssr:false)
 *     + a bone-wash overlay + a faint "scroll" hint
 *   - a tall, invisible #key-track gives the scrubbed reveal its scroll length;
 *     the canvas's ScrollTrigger reads it. The track is in normal flow, so the
 *     real site simply follows it down the page.
 *
 * As the key turns and the camera passes through it, the bone wash fades in to
 * --base; once the reveal completes the stage stops intercepting pointer events
 * and fades out so the site below is fully interactive.
 *
 * Degradation:
 *   - no WebGL  → designed bone/brass gradient poster of the field (never blank)
 *   - reduced-motion → a single composed still frame of the key (native scroll),
 *     the track collapses so the site is reachable immediately.
 */

const KeyCanvas = dynamic(() => import('./KeyCanvas'), {
  ssr: false,
  loading: () => <KeyFallback />,
});

/** Warm near-black field with the key's place lit by a backlit brass pool — the
 *  no-WebGL / loading poster. Dark, sacred, never bone or blank. */
function KeyFallback() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(46% 52% at 50% 44%, rgba(232,200,121,0.30), transparent 60%),' +
          'radial-gradient(80% 70% at 50% 52%, rgba(168,132,62,0.12), transparent 72%),' +
          '#100b07',
      }}
    />
  );
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export function KeyReveal() {
  const [mounted, setMounted] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [reduce, setReduce] = useState(false);
  const [done, setDone] = useState(false);

  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setWebgl(hasWebGL());
    setReduce(prefersReducedMotion());
  }, []);

  // Map reveal progress → hint fade + done. NO wash-to-bone (spec §3.3): the dark
  // holds through the pass-through and the literal door parts into the Anteroom.
  // Once the camera has passed through the key, the stage fades out (opacity, via
  // data-done) onto the dark hero beneath and releases pointer events.
  const onProgress = (p: number) => {
    if (hintRef.current) {
      hintRef.current.style.opacity = String(Math.max(0, 1 - p / 0.22));
    }
    const finished = p > 0.97;
    if (finished !== done) setDone(finished);
  };

  // Reduced-motion / no-WebGL: no scrubbed track (collapses to 0) so the site is
  // reachable with native scroll; the stage shows a static composed frame/poster
  // and is non-interactive so it never traps the page.
  const scrubbed = mounted && webgl === true && !reduce;

  // The #key-track jumps from 0 → 320vh once `scrubbed` resolves, shifting every
  // section down. ScrollTrigger computed all body trigger points (the spine, the
  // room entrances, the door) against the short document, so refresh once the
  // track height has settled (next frame, after layout) to re-pin them.
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [scrubbed]);

  // When the reveal isn't scrubbable (reduced-motion or no WebGL), the stage has
  // no scroll progress to ever set `done`, so it would cover the site forever.
  // Release it immediately: the page is the accessible, composed fallback.
  useEffect(() => {
    if (mounted && !scrubbed) setDone(true);
  }, [mounted, scrubbed]);

  return (
    <>
      {/* The fixed stage. Sits above the persistent atmosphere + site until the
          reveal completes, then fades and stops intercepting input. */}
      <div
        className="key-stage"
        data-done={done}
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          pointerEvents: done ? 'none' : 'auto',
          opacity: done ? 0 : 1,
          transition: 'opacity 0.8s cubic-bezier(0.22,1,0.36,1)',
          // warm near-black — the sacred opening; the dark HOLDS (no bone wash).
          background: '#100b07',
        }}
      >
        {scrubbed ? (
          <KeyCanvas
            initial={BRAND.name.charAt(0)}
            paused={false}
            onProgress={onProgress}
          />
        ) : (
          <KeyFallback />
        )}

        {/* faint scroll hint, only when the reveal is actually scrubbable.
            Outer node carries the JS progress-fade; the inner layer breathes so
            the two never fight over `opacity`. */}
        {scrubbed && (
          <div ref={hintRef} className="key-hint" aria-hidden>
            <span className="key-hint__inner">
              <span className="key-hint__label">Scroll to enter</span>
              <span className="key-hint__line" />
            </span>
          </div>
        )}
      </div>

      {/* The scrubbed scroll track. Only present when the reveal is interactive;
          otherwise it collapses to nothing so the site is immediately reachable. */}
      <div
        id="key-track"
        aria-hidden
        style={{ height: scrubbed ? '320vh' : 0 }}
      />
    </>
  );
}
