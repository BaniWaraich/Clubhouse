# Phase 5 — Detail + fallbacks

## Ambient audio (spec §3.4)

`components/ui/AmbientAudio.tsx` — a discreet warm bed + one quiet toggle,
mounted in `app/page.tsx` after `<SiteHeader>`.

- **Synthesised, no asset.** Two detuned low sines (110 Hz + 164.81 Hz, a fifth)
  through a soft low-pass (~480 Hz) with a slow LFO (0.06 Hz) breathing the
  cutoff, at master gain 0.05. A warm candlelit hum, not a track — nothing to
  ship or fetch.
- **Off by default. Never autoplays.** The `AudioContext` is built lazily inside
  a user gesture (`ensureGraph`). On mount we only *read* the stored choice.
- **Remembers the choice** in `localStorage['sodalis-ambient']` (`on`/`off`).
  When a prior `on` is restored, we arm a one-time `pointerdown`/`keydown`
  listener (the autoplay policy needs a gesture regardless) instead of making
  sound on load. The toggle reflects the restored state.
- **Reduced-motion** is a default-off signal (we never auto-enable); the control
  stays available, and its equaliser animation is dropped under reduced-motion.
- Gain fades (1.4 s in / 0.9 s out) so it never clicks; the ctx is suspended
  shortly after fade-out and closed on unmount.
- Toggle styling in `globals.css` (`.ambient-toggle*`): a faint warm brass pill,
  fixed lower-right `z-index:60`, reads on both the near-black threshold and the
  light Book; `focus-visible` ring; `aria-pressed` + `aria-label`.

## Performance

- **Key canvas unmounts when offscreen.** `KeyReveal` now tracks `active` from a
  passive scroll listener; once scrolled past `innerHeight * 4.2` (the 320vh
  track + ~1 viewport buffer) the WebGL `KeyCanvas` is swapped for the cheap
  static `KeyFallback`, so it stops consuming frames deep in the page. It
  remounts if the visitor scrolls back up.
- dpr already capped `[1,2]` on both canvases with `PerformanceMonitor`
  decline→1 / incline→2; key canvas `multisampling 4`. Atmosphere is the
  persistent whole-page background (always on screen) so it is not gated.

## No-WebGL / context-loss fallback

- Both canvases register a `webglcontextlost` handler in `onCreated`:
  - `KeyCanvas` → `onContextLost` → `KeyReveal` sets `webgl=false`, dropping to
    the designed dark/brass poster and collapsing the `#key-track` so the site
    stays reachable.
  - `Canvas3D` → renders the exported `GradedBackdrop` (the same designed warm
    static the no-WebGL path uses) instead of a blank canvas.
- Pre-mount no-WebGL detection (`hasWebGL`) was already in `Scene` + `KeyReveal`.

## Verification

- `npm run lint` clean; `npm run build` clean (route `/` 7.13 kB, 142 kB first
  load).
- Browser: toggle off by default, toggles on→off, persists to localStorage, zero
  console errors.
- Grep clean: no partner names, no hard-coded brand (only `lib/brand.ts`), no
  pricing/tiers.
- Mobile ordering fix from the prior pass retained (image-first across all
  chapters, uniform plate sizing < 60rem).
