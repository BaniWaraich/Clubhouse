'use client';

import { useRef, type ElementType, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, EASE_LUXE } from '@/lib/gsap';

/**
 * Generic block reveal — unmasks upward via clip-path inset with a gentle rise,
 * on the single luxe ease. Used for copy blocks, rules, and form panels.
 * Under reduced-motion the `.reveal` CSS already pins the final state; we no-op.
 */
export function Reveal({
  children,
  as,
  className,
  delay = 0,
  start = 'top 85%',
  style,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  start?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const Tag = (as ?? 'div') as ElementType;

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const el = ref.current!;
      if (reduce) {
        gsap.set(el, { clipPath: 'inset(0 0 0 0)', opacity: 1, y: 0 });
        return;
      }
      const from = { clipPath: 'inset(0 0 100% 0)', opacity: 0, y: 24 };
      const to = {
        clipPath: 'inset(0 0 0% 0)',
        opacity: 1,
        y: 0,
        duration: 1.3,
        delay,
        ease: EASE_LUXE,
      };

      // Already on-screen at mount → play immediately; otherwise wait on scroll.
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) {
        gsap.fromTo(el, from, to);
      } else {
        gsap.fromTo(el, from, { ...to, scrollTrigger: { trigger: el, start } });
      }
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
