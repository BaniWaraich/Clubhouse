'use client';

import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, EASE_LUXE } from '@/lib/gsap';

/**
 * Body choreography — the cinematic spine of the scroll.
 *
 * One orchestrator, mounted once, that reads the EXISTING DOM (`.chapter`,
 * `.chapter__media .plate`, `.chapter__copy`, `[data-copy]`, section ids). It adds
 * no markup and never touches the duotone/feather plate system, the form, or the
 * Plate API — it only animates transform / clip-path / opacity.
 *
 * It rides the single Lenis RAF: every trigger here scrubs DIRECTLY off the
 * already-smoothed scroll position (exactly like KeyCanvas), so there is no second
 * smoothing layer and no second requestAnimationFrame loop. All GSAP is created
 * inside useGSAP's context (auto-reverted on unmount) via gsap.matchMedia(), which
 * reverts each branch when its query stops matching (resize between mobile/desktop
 * and the reduced-motion switch are handled for free).
 *
 * Per body chapter, on the pinned + scrubbed timeline:
 *   1. the plate UNMASKS upward via clip-path inset() while it eases from a slight
 *      scale (1.06 → 1) and a small y — the image-reveal move, not a fade;
 *   2. the copy lines STAGGER in on the same timeline, in the Reveal/SplitText clip
 *      vocabulary (inset unmask + rise), so the motion language stays singular;
 *   3. plate and copy DRIFT at different rates (a quiet vertical parallax) so the
 *      layers read as depth across the pin.
 *
 * Degradation:
 *   - reduced-motion → no branch runs; plain elements render in their final,
 *     composed state (the page is a clean static document);
 *   - mobile (< 60rem) → no pin/scrub (janky on touch); the same clip-path reveal
 *     and a light enter-stagger play on scroll-in, native-feel scroll preserved.
 */

type Chapter = { id: string; air?: boolean };

const BODY: readonly Chapter[] = [
  { id: 'the-idea' },
  { id: 'the-one-number' },
  { id: 'discretion' },
  { id: 'the-club-to-come', air: true }, // the one bigger breath
];

const PLATE_HIDDEN = { clipPath: 'inset(0 0 100% 0)' as const };
const PLATE_SHOWN = { clipPath: 'inset(0 0 0% 0)' as const };

export function BodyMotion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    /* ---- Desktop: pinned, scrubbed cinematic chapters ---- */
    mm.add('(min-width: 60rem) and (prefers-reduced-motion: no-preference)', () => {
      BODY.forEach(({ id, air }) => {
        const section = document.getElementById(id);
        const chapter = section?.querySelector<HTMLElement>('.chapter');
        const plate = section?.querySelector<HTMLElement>('.plate');
        const media = section?.querySelector<HTMLElement>('.chapter__media');
        const copy = section?.querySelector<HTMLElement>('.chapter__copy');
        if (!chapter || !plate || !media || !copy) return;
        const items = copy.querySelectorAll<HTMLElement>('[data-copy]');

        // Pre-states set in this same layout-effect pass — before paint, so no
        // flash; if JS never ran the markup would simply show (CSS holds nothing).
        gsap.set(plate, { ...PLATE_HIDDEN, scale: air ? 1.1 : 1.06, yPercent: 4 });
        gsap.set(items, { ...PLATE_HIDDEN, yPercent: 60, opacity: 0 });

        const willOn = (active: boolean) =>
          gsap.set([plate, ...items], {
            willChange: active ? 'clip-path, transform, opacity' : 'auto',
          });

        const tl = gsap.timeline({
          defaults: { ease: EASE_LUXE },
          scrollTrigger: {
            trigger: chapter,
            // pin when the chapter is framed centre-screen — the "room" holds,
            // the choreography scrubs across the pin, then releases to the next.
            start: 'center center',
            // short, tasteful holds; the air landscape gets a touch longer.
            end: () => '+=' + Math.round(window.innerHeight * (air ? 1.05 : 0.7)),
            pin: chapter,
            pinSpacing: true,
            anticipatePin: 1,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onToggle: (self) => willOn(self.isActive),
          },
        });

        // 1 — plate unmask + settle
        tl.to(plate, { ...PLATE_SHOWN, scale: 1, yPercent: 0, duration: 1 }, 0);
        // 2 — copy lines stagger in on the same timeline (Reveal clip language)
        tl.to(
          items,
          { ...PLATE_SHOWN, yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.12 },
          0.1,
        );
        // 3 — intra-chapter parallax: layers drift at different rates across the pin
        tl.to(media, { yPercent: air ? -6 : -10, duration: 1, ease: 'none' }, 0);
        tl.to(copy, { yPercent: air ? 4 : 8, duration: 1, ease: 'none' }, 0);
      });
    });

    /* ---- Mobile: no pin/scrub — clip reveal + light enter stagger ---- */
    mm.add('(max-width: 59.999rem) and (prefers-reduced-motion: no-preference)', () => {
      BODY.forEach(({ id }) => {
        const section = document.getElementById(id);
        const plate = section?.querySelector<HTMLElement>('.plate');
        const copy = section?.querySelector<HTMLElement>('.chapter__copy');
        if (!plate || !copy) return;
        const items = copy.querySelectorAll<HTMLElement>('[data-copy]');

        gsap.set(plate, { ...PLATE_HIDDEN, scale: 1.04 });
        gsap.set(items, { ...PLATE_HIDDEN, y: 24, opacity: 0 });

        gsap.to(plate, {
          ...PLATE_SHOWN,
          scale: 1,
          duration: 1.2,
          ease: EASE_LUXE,
          scrollTrigger: { trigger: section, start: 'top 80%' },
        });
        gsap.to(items, {
          ...PLATE_SHOWN,
          y: 0,
          opacity: 1,
          duration: 1.1,
          ease: EASE_LUXE,
          stagger: 0.1,
          scrollTrigger: { trigger: section, start: 'top 78%' },
        });
      });
    });

    // Recompute pins once webfonts settle (metrics shift line wraps / heights).
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  });

  return null;
}
