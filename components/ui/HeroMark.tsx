'use client';

import { useEffect, useRef } from 'react';

/**
 * An oversized, ultra-light brand initial set against the right half of the
 * hero — the compositional counterweight to the left-rail masthead, so the
 * hero reads as a designed two-column field rather than one column on dead
 * space. Parallaxes upward at 0.4× scroll. Pure type; no canvas. Skipped under
 * reduced-motion (it simply sits still).
 */
export function HeroMark({ char }: { char: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (ref.current) {
          ref.current.style.transform = `translateY(${window.scrollY * 0.4}px)`;
        }
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="hero__mark" aria-hidden>
      <span ref={ref}>{char}</span>
    </div>
  );
}
