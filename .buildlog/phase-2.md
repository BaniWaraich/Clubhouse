# Phase 2 — Warm shell (handoff)

Repalette to the dark→light admittance arc + new type, six rooms composed with
zero JS/3D. Build + lint clean; verified visually (headless, JS-on and JS-off).

## Files changed
- `lib/palette.ts` — added `ADMITTANCE` (paper/candle/warm-ink/taupe/brass-glow
  ×2/off-white ×2) and `ROOM_BG` (six room values). `PALETTE.brass` (=`--accent`)
  untouched; key material unchanged (Phase 3 owns the re-light).
- `app/layout.tsx` — fonts swapped: **Newsreader** (`--font-display`,
  `adjustFontFallback:false` to silence missing-metrics warning) + **IBM Plex
  Mono** (`--font-mono`) + Inter (`--font-sans`, kept).
- `app/globals.css` — admittance tokens in `:root`; room theming system;
  `.mono`, `.em` (brass emphasis, never italic), `.refrain`; mono-ified kicker /
  triplet / form labels / CTA label / header enquire / footer meta; plate
  treatments re-graded warm-dark; header drops `mix-blend multiply` → off-white;
  footer is its own light room.
- six `components/sections/*.tsx` — room classes + spec §2 copy + brass `.em`
  spans; Hero opens & Invitation closes with the `.refrain`.

## New classes / tokens (Phase 3+ should CONSUME, not reinvent)
- Room theming: put `room--<name>` on a section (`threshold/anteroom/hearth/
  quiet/ajar/book`); add `room--dark` for the four dark rooms. Each sets
  `--room-bg` and (for dark/ajar) the consumed tokens **directly**:
  `--ink --muted --mark --emphasis --hairline --cta-border --base`.
- **Gotcha:** tokens are overridden DIRECTLY in each room class — do NOT alias
  (`--ink: var(--room-ink)`) at `:root`; inherited custom props resolve at their
  declaration site and freeze to the light value (this bit us once).
- `.mono` signature, `.em` emphasis, `.refrain` mark.

## Deviations
- `.room--ajar` (#8F7A5A mid) carries dark ink + deeper brass (not the glow) for
  contrast on the mid field — inferred from spec, not specified.
- Committed the pre-existing uncommitted Phase-1 plate/chapter work together with
  Phase 2 (it was the working-tree baseline).

## Phase 3 must know
- Travelling-light spine interpolates `ROOM_BG` (lib/palette.ts) — the same six
  values the CSS rooms paint statically here. Background + brass glow dark→light
  on the single Lenis RAF.
- Hero re-light (KeyCanvas/KeyReveal/Scene/Atmosphere) is NOT done — Scene still
  renders the old bone atmosphere; `body` base is now `--candle` dark.
- Header currently fixed off-white (readable on the dark top); Phase 3 may want
  it to shift colour with the travelling light.

## Phase 2 review fix (post-commit)
- Symptom on review: text overlap + jumpy transitions on scroll.
- Cause: the committed `BodyMotion` (old bone-layout pins + clip-path pre-hides of
  every `[data-copy]`) ran against the new shell — reveals fired out of sync and
  pin spacing was computed for old heights.
- Fix: unmounted `<BodyMotion />` (removed import + usage in `app/page.tsx`) so the
  warm shell renders as the intended clean static document. `[data-copy]` has no
  CSS hide, so all copy stays visible. `BodyMotion.tsx` kept for Phase 3 to rewrite.
- Verified: `npm run lint` clean, `tsc --noEmit` clean.
