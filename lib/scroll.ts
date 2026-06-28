import type Lenis from 'lenis';

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Smoothly scroll to a section by id. Uses Lenis when present (smooth scroll),
 * falls back to native scrollIntoView (reduced-motion / no Lenis).
 */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (typeof window !== 'undefined' && window.__lenis) {
    window.__lenis.scrollTo(el, { offset: 0 });
  } else {
    el.scrollIntoView({ behavior: 'auto', block: 'start' });
  }
}
