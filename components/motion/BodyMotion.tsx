'use client';

import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, EASE_LUXE } from '@/lib/gsap';
import { ROOM_BG } from '@/lib/palette';

/**
 * The admittance spine — the cinematic body choreography (spec §3.3).
 *
 * One orchestrator, mounted once, reading the EXISTING DOM (section ids,
 * `[data-copy]`, `.triplet`, `.spine`). It adds no markup; it only
 * animates CSS custom properties and transform/opacity/clip-path. It rides the
 * single Lenis RAF — every trigger scrubs/plays directly off the already-smoothed
 * scroll position, so there is no second RAF loop and no second smoother.
 *
 * Gestures:
 *   1. TRAVELLING LIGHT — `.spine`'s background colour is driven continuously
 *      from near-black through the six ROOM_BG values to full warm light, each
 *      transition anchored between consecutive room centres so the light never
 *      dies between rooms.
 *   2. LIGHT ENTERS FIRST — each room's warm vignette (`--enter`) blooms out of
 *      the dark as you cross in, just BEFORE its words resolve (copy stagger).
 *   3. THE HEARTH — the mono triplet prints in line by line and the glow swells
 *      once; the only "loud" motion on the page.
 *   4. THE QUIET — near-zero motion; copy only breathes in. Stillness is the
 *      gesture.
 *   5. THE ROOM TO COME — a thin line of light (`--ajar-open`) widens, the door
 *      left ajar.
 *
 * The key → Anteroom crossing relies on the travelling light + "light enters
 * first" alone — no literal door.
 *
 * Degradation:
 *   - reduced-motion → nothing runs; `[data-motion]` is never set, so the rooms
 *     keep their opaque static backgrounds and every `--enter`/`--ajar-open`
 *     default of 1 leaves the page a clean, fully-lit composed document.
 *   - mobile (< 60rem) → the same gestures; no pins are used anywhere, so native
 *     scroll is preserved.
 */

type Room = { id: string; color: string };

// Scroll order = spec §3.1. The hero IS the Threshold room.
const ROOMS: readonly Room[] = [
  { id: 'hero', color: ROOM_BG.threshold },
  { id: 'the-idea', color: ROOM_BG.anteroom },
  { id: 'the-one-number', color: ROOM_BG.hearth },
  { id: 'discretion', color: ROOM_BG.quiet },
  { id: 'the-club-to-come', color: ROOM_BG.ajar },
  { id: 'invitation', color: ROOM_BG.book },
];

const HIDDEN = { y: 24, opacity: 0, clipPath: 'inset(0 0 100% 0)' } as const;
const SHOWN = { y: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)' } as const;

export function BodyMotion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    const root = document.documentElement;

    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
      },
      (ctx) => {
        const { motion } = ctx.conditions as { motion: boolean };
        if (!motion) return; // reduced-motion: leave the static composed page

        // Live choreography → rooms go transparent so the travelling light reads
        // through them as one continuous field.
        root.dataset.motion = 'on';

        // Cleanup for the spine's ResizeObserver (set below if .spine exists);
        // returned from this matchMedia branch so it disconnects on revert.
        let spineCleanup: (() => void) | undefined;

        /* ---- 1. The travelling light: one deterministic interpolation across
                the six room centres (no competing tweens on one property). ---- */
        const spine = document.querySelector<HTMLElement>('.spine');
        if (spine) {
          const els = ROOMS.map((r) => document.getElementById(r.id));
          // precompute the interpolators between consecutive room colours
          const lerps = ROOMS.slice(0, -1).map((r, i) =>
            gsap.utils.interpolate(r.color, ROOMS[i + 1].color),
          );
          // Where in each room the spine should equal that room's colour. Most
          // rooms anchor at their centre; The Book (invitation) anchors near its
          // top — its centre sits past the reachable scroll, and the spec wants
          // full warm light to arrive AS the form enters, not at the very bottom.
          const ANCHOR = [0.5, 0.5, 0.5, 0.5, 0.5, 0.22];
          let centres: number[] = [];
          const measure = (scroll: number) => {
            // document-absolute anchors (offsetTop is relative to <main>, which
            // sits below the 320vh key-track — so use the rect + live scroll).
            centres = els.map((el, i) => {
              if (!el) return 0;
              const r = el.getBoundingClientRect();
              return r.top + scroll + r.height * ANCHOR[i];
            });
          };

          // Measure on REFRESH only. Never read layout (scrollHeight / rects)
          // inside onUpdate — doing so forced a synchronous reflow every scroll
          // frame, which was the choppiness. Height changes (the 320vh key-track
          // resolving) are caught by the ResizeObserver below → a debounced
          // refresh → onRefresh → measure(). All event-driven, never per-frame.
          ScrollTrigger.create({
            trigger: document.documentElement,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            onRefresh: (self) => measure(self.scroll()),
            onUpdate: (self) => {
              const scroll = self.scroll();
              if (!centres.length) measure(scroll);
              // compare the document coordinate at the VIEWPORT CENTRE against the
              // room centres, so the spine equals a room's colour when that room
              // is centred on screen.
              const y = scroll + window.innerHeight / 2;
              // hold the end colours before the first / after the last centre
              if (y <= centres[0]) {
                spine.style.backgroundColor = ROOMS[0].color;
                return;
              }
              const last = centres.length - 1;
              if (y >= centres[last]) {
                spine.style.backgroundColor = ROOMS[last].color;
                return;
              }
              for (let i = 0; i < last; i++) {
                if (y >= centres[i] && y < centres[i + 1]) {
                  const t = (y - centres[i]) / (centres[i + 1] - centres[i]);
                  spine.style.backgroundColor = lerps[i](t);
                  return;
                }
              }
            },
          });

          // Event-driven height watch — replaces the per-frame scrollHeight read.
          // Fires only when the document actually resizes (e.g. the key-track
          // resolving), debounced to one frame, and re-measures via refresh.
          let roRaf = 0;
          const ro = new ResizeObserver(() => {
            cancelAnimationFrame(roRaf);
            roRaf = requestAnimationFrame(() => ScrollTrigger.refresh());
          });
          ro.observe(document.body);
          spineCleanup = () => {
            ro.disconnect();
            cancelAnimationFrame(roRaf);
          };
        }

        /* ---- 2–5. Per-room entrances ---- */
        const enter = (id: string) => {
          const section = document.getElementById(id);
          if (!section) return null;
          const copy = section.querySelector<HTMLElement>('.chapter__copy') ?? section;
          const items = gsap.utils.toArray<HTMLElement>(
            copy.querySelectorAll('[data-copy]'),
          );
          gsap.set(section, { '--enter': 0 });
          return { section, items };
        };

        // The Idea (Anteroom) — light blooms, then words resolve.
        {
          const r = enter('the-idea');
          if (r) {
            gsap.set(r.items, HIDDEN);
            const tl = gsap.timeline({
              defaults: { ease: EASE_LUXE },
              scrollTrigger: { trigger: r.section, start: 'top 78%' },
            });
            tl.to(r.section, { '--enter': 1, duration: 1.1 }, 0);
            tl.to(r.items, { ...SHOWN, duration: 1.1, stagger: 0.12 }, 0.28);
          }
        }

        // The Hearth — glow swell + the triplet prints in (the one loud moment).
        {
          const section = document.getElementById('the-one-number');
          const copy = section?.querySelector<HTMLElement>('.chapter__copy');
          if (section && copy) {
            const tripletWrap = copy.querySelector<HTMLElement>('.triplet')?.closest<HTMLElement>('[data-copy]');
            const lines = gsap.utils.toArray<HTMLElement>(
              copy.querySelectorAll('[data-copy]'),
            ).filter((el) => el !== tripletWrap);
            const cells = gsap.utils.toArray<HTMLElement>(
              copy.querySelectorAll('.triplet span'),
            );
            gsap.set(section, { '--enter': 0 });
            gsap.set(lines, HIDDEN);
            if (tripletWrap) gsap.set(tripletWrap, { opacity: 0 });
            gsap.set(cells, { clipPath: 'inset(0 100% 0 0)', opacity: 0 });

            const tl = gsap.timeline({
              defaults: { ease: EASE_LUXE },
              scrollTrigger: { trigger: section, start: 'top 76%' },
            });
            // glow swells once (a touch slower, warmer — see CSS .room--hearth)
            tl.to(section, { '--enter': 1, duration: 1.4 }, 0);
            tl.to(lines, { ...SHOWN, duration: 1.1, stagger: 0.12 }, 0.3);
            if (tripletWrap) tl.to(tripletWrap, { opacity: 1, duration: 0.6 }, 0.9);
            // the triplet prints in, cell by cell, like a dial / ledger line
            tl.to(
              cells,
              {
                clipPath: 'inset(0 0% 0 0)',
                opacity: 1,
                duration: 0.5,
                stagger: 0.18,
                ease: 'power2.out',
              },
              1.0,
            );
          }
        }

        // The Quiet — near-zero motion: copy only breathes in, no rise, no clip.
        {
          const r = enter('discretion');
          if (r) {
            gsap.set(r.items, { opacity: 0 });
            const tl = gsap.timeline({
              defaults: { ease: 'none' },
              scrollTrigger: { trigger: r.section, start: 'top 72%' },
            });
            tl.to(r.section, { '--enter': 1, duration: 2.0 }, 0);
            tl.to(r.items, { opacity: 1, duration: 1.8, stagger: 0.2 }, 0.4);
          }
        }

        // The Room to come — a thin line of light widens (the door left ajar).
        {
          const section = document.getElementById('the-club-to-come');
          const copy = section?.querySelector<HTMLElement>('.chapter__copy');
          if (section) {
            const items = gsap.utils.toArray<HTMLElement>(
              (copy ?? section).querySelectorAll('[data-copy]'),
            );
            gsap.set(section, { '--enter': 0, '--ajar-open': 0 });
            gsap.set(items, HIDDEN);
            const tl = gsap.timeline({
              defaults: { ease: EASE_LUXE },
              scrollTrigger: { trigger: section, start: 'top 76%' },
            });
            tl.to(section, { '--enter': 1, duration: 1.2 }, 0);
            tl.to(section, { '--ajar-open': 1, duration: 1.8, ease: 'power2.inOut' }, 0);
            tl.to(items, { ...SHOWN, duration: 1.1, stagger: 0.12 }, 0.5);
          }
        }

        // Recompute once webfonts settle (metrics shift heights / trigger points).
        if ('fonts' in document) {
          document.fonts.ready.then(() => ScrollTrigger.refresh());
        }

        // Disconnect the ResizeObserver when this branch reverts.
        return () => spineCleanup?.();
      },
    );
  });

  return null;
}
