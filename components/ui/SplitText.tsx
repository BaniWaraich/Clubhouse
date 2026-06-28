'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, EASE_LUXE } from '@/lib/gsap';

/**
 * Text mask reveal — lines clipped and revealed on scroll with a slow upward
 * wipe and stagger, on the project's single luxe ease. `overflow: hidden` on the
 * outer line + translating the inner span = the clean mask. Honors reduced-motion
 * by showing text immediately.
 *
 * Pass `\n` in `children` to split into multiple masked lines.
 */
export function SplitText({
  children,
  className,
  start = 'top 88%',
}: {
  children: string;
  className?: string;
  start?: string;
}) {
  const root = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const lines = root.current!.querySelectorAll('.line-inner');
      if (reduce) {
        gsap.set(lines, { yPercent: 0, opacity: 1 });
        return;
      }
      gsap.set(lines, { yPercent: 110 });

      const tween = {
        yPercent: 0,
        duration: 1.3,
        ease: EASE_LUXE,
        stagger: 0.1,
      } as const;

      // Elements already on-screen at mount (e.g. the hero masthead) must not
      // depend on a scroll past their trigger — play them immediately.
      const rect = root.current!.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) {
        gsap.to(lines, tween);
      } else {
        gsap.to(lines, { ...tween, scrollTrigger: { trigger: root.current, start } });
      }
    },
    { scope: root },
  );

  return (
    <span ref={root} className={className} aria-label={children}>
      {children.split('\n').map((line, i) => (
        <span
          key={i}
          className="line"
          style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.04em' }}
        >
          <span className="line-inner" style={{ display: 'block' }}>
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}
