'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { BRAND } from '@/lib/brand';
import { prefersReducedMotion } from '@/lib/gsap';
import { smoother as ease01 } from '@/lib/easings';

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

/** Designed bone field with a warm brass pool — the no-WebGL / loading poster. */
function KeyFallback() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(60% 55% at 50% 46%, rgba(168,132,62,0.34), transparent 62%),' +
          'radial-gradient(80% 70% at 50% 60%, rgba(168,132,62,0.12), transparent 70%),' +
          'var(--base)',
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

  const washRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setWebgl(hasWebGL());
    setReduce(prefersReducedMotion());
  }, []);

  // Map reveal progress → bone wash opacity + hint fade. Wash begins at 0.58,
  // is full by 0.94; eased with smootherstep so the fade-to-bone has no hard
  // start/stop and matches the eased camera/turn. Once full and progress is
  // essentially complete, the stage releases pointer events so the site beneath
  // is interactive.
  const onProgress = (p: number) => {
    if (washRef.current) {
      washRef.current.style.opacity = String(ease01((p - 0.58) / 0.36));
    }
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
          background: 'var(--base)',
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

        {/* bone wash that bridges the pass-through into the site */}
        <div
          ref={washRef}
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--base)',
            opacity: 0,
            pointerEvents: 'none',
          }}
        />

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
