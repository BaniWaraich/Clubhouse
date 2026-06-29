# Phase 3 — Motion (handoff)

The admittance spine + hero re-light. Build + lint clean; verified headless
(spine colours per room, door, reduced-motion static page, mobile 375px no
overflow). Hero re-light visually signed off by the user.

## Files changed
- `components/motion/BodyMotion.tsx` — full rewrite. The travelling-light spine
  (one deterministic interpolation across the six room centres → `.spine`
  background); per-room "light enters first" (`--enter` bloom + copy stagger);
  Hearth glow swell + triplet print-in; the Quiet's fade-only stillness;
  Room-to-come `--ajar-open` line-widen; the door driver. Sets `[data-motion]`
  on `<html>` only when motion runs; reduced-motion returns early.
- `components/motion/Door.tsx` — NEW. Inert two-panel + brass-seam markup; motion
  owned by BodyMotion via `--door` / `--door-seam` / `--door-display`.
- `app/page.tsx` — mounts `.spine`, `<Door/>`, remounts `<BodyMotion/>`.
- `app/globals.css` — `.spine`; z-restack (spine 0 / atmosphere 1 / content 2 /
  door 38 / key-stage 40 / header 50); `html[data-motion]` makes rooms
  transparent; `.section::before/.hero::before` glow bloom (`--enter`); per-room
  bloom tints; `.room--ajar .chapter__media` clip (`--ajar-open`); `.door*`.
- `components/three/KeyCanvas.tsx` — re-light: warm near-black, key BACKLIT
  (dominant light behind), dark environment + one warm backlight panel, exposure
  1.0, bloom lifts the halo. `KeyModel` geometry/material untouched.
- `components/three/KeyReveal.tsx` — stage `#100b07`; removed the wash-to-bone
  overlay + logic; warm-dark fallback poster; **refreshes ScrollTrigger when the
  320vh `#key-track` resolves** (critical — see gotcha).
- `components/three/Scene.tsx` — `GradedBackdrop` now transparent warm-dark.
- `components/three/Canvas3D.tsx` — `alpha:true` (spine shows through); bloom
  dialled to 0.16 / threshold 0.9.
- `components/three/Atmosphere.tsx` — haze re-graded: TRANSPARENT, tight warm
  glow pools (not a screen veil), alpha ~0.06–0.10 fading out by The Book.

## Gotchas the next phase MUST know
- **ScrollTrigger refresh on track growth.** `#key-track` starts at height 0 and
  jumps to 320vh after WebGL detection, shifting every section down. All body
  trigger points are computed against the short doc, so KeyReveal calls
  `ScrollTrigger.refresh()` (rAF after `scrubbed` flips). The spine also
  re-measures whenever `scrollHeight` changes. If Phase 4 changes layout that
  affects heights, keep this in mind.
- **Spine maths:** compare `self.scroll() + innerHeight/2` (viewport centre) to
  document-absolute room centres from `getBoundingClientRect + scroll`
  (`offsetTop` is wrong — relative to `<main>`, below the track). The Book anchors
  at 0.22 of the invitation (its centre is past reachable scroll).
- **Custom-prop tokens** are overridden directly per room (no `:root` alias) —
  unchanged from Phase 2.

## Phase 4 (imagery)
- Drop warm, abstract, textural imagery behind the existing `Plate` treatment per
  room (graded; never a place/partner/face). The `.plate__media` slot + duotone
  ramp already exist; confirm the image slot, then parallelise per-component.
- Atmosphere/spine are subtle by design — imagery should sit behind the Plate
  treatment, not fight the travelling light.
