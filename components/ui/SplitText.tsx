'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

/**
 * Text mask reveal — lines clipped and revealed on scroll with stagger.
 * `overflow: hidden` on the outer line + translating the inner span = the
 * clean mask wipe. Honors reduced-motion by showing text immediately.
 */
export function SplitText({ children }: { children: string }) {
  const root = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const lines = root.current!.querySelectorAll('.line-inner');
      if (reduce) {
        gsap.set(lines, { yPercent: 0, opacity: 1 });
        return;
      }
      gsap.from(lines, {
        yPercent: 110,
        duration: 1,
        ease: 'expo.out', // matches cubic-bezier(0.16,1,0.3,1)
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: 'top 85%' },
      });
    },
    { scope: root },
  );

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
