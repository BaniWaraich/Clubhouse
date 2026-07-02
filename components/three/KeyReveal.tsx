'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { BRAND } from '@/lib/brand';
import { ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';
import { KEY_TRACK_VH, KEY_IDLE_AFTER_VH } from '@/lib/scene';
import { hasWebGL } from '@/lib/webgl';

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

export function KeyReveal() {
  const [mounted, setMounted] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [reduce, setReduce] = useState(false);
  const [done, setDone] = useState(false);
  // Whether the entrance is anywhere near the viewport. Once scrolled well past
  // the key track, the canvas's render loop is PAUSED (frameloop:'demand') so it
  // stops consuming frames deep in the page — but it stays mounted, so there is
  // no dispose (and no spurious context-loss); it resumes if the visitor scrolls
  // back up.
  const [active, setActive] = useState(true);
  // Genuine WebGL context loss → overlay the designed poster. Kept SEPARATE from
  // `webgl` so it never collapses the #key-track / changes document height (a
  // mid-scroll height change clamps the scroll position to the new bottom).
  const [lost, setLost] = useState(false);

  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setWebgl(hasWebGL());
    setReduce(prefersReducedMotion());
  }, []);

  // Map reveal progress → hint fade + done. NO wash-to-bone (spec §3.3): the dark
  // holds through the pass-through, and the travelling light + "light enters first"
  // carry the crossing into the Anteroom. Once the camera has passed through the
  // key, the stage fades out (opacity, via data-done) onto the dark hero beneath
  // and releases pointer events.
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

  // Pause the canvas's render loop once the entrance is well offscreen (perf:
  // pause when the hero is gone — spec §5). The key track is 320vh; give a
  // one-viewport buffer so it idles only after the threshold has scrolled away.
  // The canvas stays MOUNTED (we only flip frameloop), so the document height is
  // never touched and the scroll position is never disturbed.
  useEffect(() => {
    if (!scrubbed) return;
    const onScroll = () => {
      const past = window.scrollY > window.innerHeight * KEY_IDLE_AFTER_VH;
      setActive((prev) => (prev === !past ? prev : !past));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrubbed]);

  // Genuine WebGL context loss → overlay the designed poster over the dead canvas.
  // Does NOT touch `webgl`/`scrubbed`, so the #key-track keeps its height and the
  // page never shrinks under the visitor.
  const onContextLost = () => setLost(true);

  // The #key-track jumps from 0 → 320vh once `scrubbed` resolves, shifting every
  // section down. ScrollTrigger computed all body trigger points (the spine and
  // the room entrances) against the short document, so refresh once the
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
          <>
            <KeyCanvas
              initial={BRAND.name.charAt(0)}
              paused={false}
              active={active}
              onProgress={onProgress}
              onContextLost={onContextLost}
            />
            {/* genuine context loss → designed poster over the dead canvas; the
                track height is untouched so the page never shrinks/jumps */}
            {lost && <KeyFallback />}
          </>
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
        style={{ height: scrubbed ? `${KEY_TRACK_VH}vh` : 0 }}
      />
    </>
  );
}
