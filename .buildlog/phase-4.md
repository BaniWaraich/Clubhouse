# Phase 4 — Imagery (handoff)

Warm, abstract, palette-graded textures behind the existing Plate treatment in
the three plate rooms. Build + lint + tsc clean; verified headless (desktop +
375px, no overflow, no console errors).

## Decision
First pass generated abstract textures (no assets existed). The owner then
supplied real photographs, which replaced the textures:
- `idea.jpg` — dark club interior. This is a VENUE shot, normally forbidden by
  spec §4 ("no venue/amenity content"). Used by **explicit owner decision**
  (overrides the guardrail for this one plate); recorded in spec §4 +
  PLACEHOLDERS.md so it isn't reverted as a "fix".
- `one-number.jpg` — vintage telephone still-life (the literal One Number).
- `discretion.jpg` — wax-sealed envelope still-life (privacy).
The One Number and Discretion stay within the object-still-life guardrail.
All three web-optimised (≤1600px long edge, ~80% JPEG); the generated SVGs and
oversized originals were removed.

## Files changed / added
- `public/img/idea.svg`, `one-number.svg`, `discretion.svg` — inline-filter SVGs
  (feTurbulence smoke + warm gradients). Deterministic, tiny, no binaries/network.
  - idea: warm champagne smoke blooming from the light corner ("looked after").
  - one-number: rising smoke with a single luminous warm shaft.
  - discretion: deepest warm-dark, sparse embers, one quiet brass glint (absence).
- `components/ui/Plate.tsx` — adds `plate--media` class when `src` is set.
- `components/sections/{TheIdea,TheOneNumber,Discretion}.tsx` — pass `src`.
- `app/globals.css` — `.plate--media .plate__treatment` becomes a GRADING VEIL
  (warm-dark edge vignette + faint brass) instead of the opaque mood fill, so the
  image reads through, graded. Per-variant gradients stay as the no-image base.
- `public/img/PLACEHOLDERS.md` — updated to describe the generated textures.

## Notes for Phase 5
- These are stand-ins: real abstract photography swaps in via `<Plate src>` with
  no relayout (aspect-ratio reserved). Keep the "never a place/face" guardrail.
- The Plate still renders a raw `<img>` (not next/image). If Phase 5 wants
  optimisation, swap to next/image in the `.plate__media` slot — but SVGs don't
  need it; revisit only if real raster photography is added.
- No-image fallback: if an asset 404s, `.plate--media` shows the room-dark vignette
  veil + grain (degraded, not blank). Phase 5's fallback pass can harden this.
- Hero key, spine, atmosphere unchanged.
