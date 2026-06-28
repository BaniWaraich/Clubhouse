'use client';

import { useEffect, useState } from 'react';
import { BRAND } from '@/lib/brand';
import { scrollToId } from '@/lib/scroll';

/**
 * Minimal header — a faint wordmark + a single Enquire anchor. Present over the
 * hero, then quietly fades away as you scroll past it so it never collides with
 * the left-aligned content below.
 */
export function SiteHeader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="site-header" data-hidden={hidden}>
      <a
        href="#hero"
        className="site-header__wordmark"
        onClick={(e) => {
          e.preventDefault();
          scrollToId('hero');
        }}
      >
        {BRAND.name}
      </a>
      <a
        href="#invitation"
        className="site-header__enquire"
        onClick={(e) => {
          e.preventDefault();
          scrollToId('invitation');
        }}
      >
        Enquire
      </a>
    </header>
  );
}
