/**
 * Central GSAP setup. Importing this module (for its side effects) registers the
 * plugins and the project's single signature ease — the luxe cubic-bezier from
 * `lib/easings.ts` — so every component animates on the same curve.
 *
 * Registering at module load (not in an effect) guarantees the ease exists
 * before any child component's useGSAP runs.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, CustomEase);

if (!CustomEase.get('luxe')) {
  // matches cubic-bezier(0.22, 1, 0.36, 1) — `ease.luxe`
  CustomEase.create('luxe', '0.22, 1, 0.36, 1');
}

export const EASE_LUXE = 'luxe';
export { gsap, ScrollTrigger };

/** Shared "is this reduced motion" check. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
