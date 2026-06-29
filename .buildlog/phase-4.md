# Phase 4 — Imagery (handoff)

Warm, abstract, palette-graded textures behind the existing Plate treatment in
the three plate rooms. Build + lint + tsc clean; verified headless (desktop +
375px, no overflow, no console errors).

## Decision
No photographs exist in the repo and the guardrails forbid places/partners/faces.
With the user's sign-off, imagery is **generated** as abstract textures rather
than sourced — smoke / silk in the candlelit register, graded to palette.

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
