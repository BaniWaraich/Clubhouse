# Aesthetic Remediation Plan

Technical remediation for the 13 critique findings. Honours CLAUDE.md: discretion-first,
no amenity grid, accent (`--accent #a8843e`) as light/small marks only — never a fill behind
text, name-agnostic via `lib/brand.ts`, always ship `prefers-reduced-motion` + no-WebGL
fallbacks. Tokens stay centralised in `:root` (`app/globals.css`).

Diagnoses cite the real root cause in current code. Nothing here is built yet — this is for
sign-off.

---

## Shared foundation (land first)

These are prerequisites several issues depend on. Build and approve this layer before the
per-issue work so later changes only consume tokens, never invent them.

### F1 — Type third tier + hierarchy tokens (unblocks #3, #5, #12)
Today the scale jumps `.lead` (clamp 1.5–2.6rem, `globals.css:157`) → body (~1rem,
`body` rule `:36`) with nothing between, and the hero treats masthead/tagline/CTA at near-equal
weight. Add explicit tiers in `:root`:

```
--step-display: clamp(3.5rem, 15vw, 13rem);   /* hero masthead only — the one loud moment */
--step-lead:    clamp(1.5rem, 1.1rem + 1.9vw, 2.6rem);  /* existing .lead */
--step-sub:     clamp(1.15rem, 1rem + 0.6vw, 1.4rem);   /* NEW third tier */
--step-body:    clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
--footer-wordmark: clamp(1.4rem, 1.1rem + 1vw, 2.1rem); /* coda, ~45% of hero feel (#12) */
```
A `.subhead` utility consumes `--step-sub` (display family, `--muted` or `--ink`, line-height
~1.4) for the TheOneNumber triplet labels and similar mid-tier text.

### F2 — Per-section spacing variants (unblocks #6)
Every `.section` uses one `--section-y` (`:13`, `:131`). Add rhythm tokens and modifier classes:

```
--section-y:       clamp(7rem, 18vh, 14rem);   /* default */
--section-y-hold:  clamp(4rem, 10vh, 8rem);    /* tension — sections sit close */
--section-y-exhale:clamp(11rem, 26vh, 20rem);  /* breath — sections open up */
```
`.section--hold` / `.section--exhale` override `padding` top/bottom. Assigned per section in F2's
sequencing (see execution order). No JS.

### F3 — Global cursor + scrollbar + accent-tint tokens (unblocks #8, #9, #4, #2)
Add to `:root`: `--accent-tint: rgba(168,132,62,0.06)` (hover wash for CTA), `--cursor-size`,
`--cursor-ring`. Add global scrollbar hide and a body class that hides the native cursor only
when the custom cursor is active (never on touch / reduced-motion). Details in #8/#9.

### F4 — Key lighting/material tokens shared with `--accent` (unblocks #1, #13)
Introduce a single source of truth for the brass so the 3D key and the CSS accent are provably
the same hue. Export from `lib/brand.ts` (or a new `lib/palette.ts`) a `BRASS` hex that equals
`--accent` (`#a8843e`), plus warm/cool light hexes, imported by `KeyModel`/`KeyCanvas` instead of
the local `const BRASS = new Color('#a8843e')` (`KeyModel.tsx:40`). This guarantees #13 by
construction.

---

## Per-issue remediation

### #1 — Key reads as dark chocolate illustration, not luxury brass
**Diagnosis.** The base colour is already correct (`KeyModel.tsx:40`, `#a8843e`,
`MeshPhysicalMaterial metalness:1`). The "dark brown / arcade-gold" tell is **lighting and
tone-mapping**, not the material:
- `roughness: 0.32` + `clearcoat 0.5` (`:215–217`) gives a glossy "arcade" specular, not aged brass.
- The environment is dominated by a single hot `intensity:3.2` warm bar and a `#ffffff`
  `intensity:2.2` streak (`KeyCanvas.tsx:153–174`); a metal reflects its environment, so a near-empty
  dark env between those bars reads as the brown body. There is no broad soft fill to lift the
  shadowed faces — they collapse to dark.
- `Bloom luminanceThreshold:0.82` (`:202`) only fires on the few hottest pixels → "sheen" hotspots
  against dark metal, the arcade look.
- No explicit `toneMapping` / exposure is set on the `<Canvas>` `gl` (`:133`); R3F defaults to
  ACES Filmic, which crushes warm mid-tones toward brown on a metal lit this hot.

**Approach.**
- Set renderer grade explicitly: `gl={{ ...existing, toneMapping: AgXToneMapping (or
  NeutralToneMapping), toneMappingExposure: ~1.0 }}` and `flat`-test; AgX holds warm metal
  mid-tones far better than ACES. Commit value after a visual pass (sign-off item).
- Rebalance the environment to a **brighter, fuller, lower-contrast** warm room so the metal
  reflects continuous bone light, not black gaps: raise the broad `#efe9dc` backdrop
  (`:182–188`) from `0.6` to ~`1.4`, soften the two key bars to ~`2.0`/`1.2`, and drop the pure
  `#ffffff` streak to a warm `#fff3df` at ~`1.4` so highlights are champagne, not white.
- Material → aged/burnished brass: `roughness ~0.45`, `clearcoat 0.15`, `clearcoatRoughness 0.6`,
  `envMapIntensity ~1.0`, `reflectivity ~0.5`. Higher roughness spreads speculars into a soft
  satin sheen and lifts the body out of brown.
- Soften shadows: the `directionalLight` (`:145`) should cast soft contact shadow via
  `<AccumulativeShadows>`/`<SoftShadows>` (drei) or simply reduce its intensity to ~`1.4` and add a
  broad `<Environment>`-driven ambient so there is no hard bevel-edge shadow line.
- Bloom: raise `luminanceThreshold` to ~`0.9` and drop `intensity` to ~`0.2` so only genuine rim
  glints bloom — kills the arcade sheen.

**Files touched.** `components/three/KeyCanvas.tsx`, `components/three/KeyModel.tsx`,
`lib/palette.ts` (new, F4).
**Risk / fallback.** No-WebGL/reduced-motion already render the CSS poster (`KeyReveal.tsx:36`,
`Scene.tsx:19`) — unaffected. `SoftShadows` is a shader cost; gate behind `PerformanceMonitor`
(already present `:137`) and skip on mobile (dpr already drops to 1). Re-lighting is subjective →
**needs visual sign-off.**
**Effort.** L.

### #13 — Key shares no chromatic relationship with `--accent`
**Diagnosis.** `BRASS` is hard-coded in `KeyModel.tsx:40` and the env emitters use unrelated
warms (`#fff3df`, `#c9a35a`, `#bfa066`). Nothing ties the rendered key hue to `--accent`.
**Approach.** F4: single `BRASS` export === `--accent`. Derive env light hues as tints/shades of
that brass rather than arbitrary golds. After the #1 grade, sample a frame and confirm the key's
mid-tone visually matches a `--accent` swatch.
**Files touched.** `lib/palette.ts` (new), `KeyModel.tsx`, `KeyCanvas.tsx`, `Atmosphere.tsx`
(`GLOW #caa258` `:28` → align to brass family).
**Risk / fallback.** None beyond #1.
**Effort.** S (rides on #1).

### #3 — Hero has no gravitational hierarchy
**Diagnosis.** Masthead `clamp(3.5rem…13rem)` (`:224`), tagline `clamp(1.15…1.7rem)` (`:233`),
kicker and CTA all sit in one tight stack with similar visual weight; the masthead doesn't
dominate because the tagline is large and close (`margin-top:1.75rem`) and the CTA is a boxed
label of equal optical presence.
**Approach.** Make the masthead the single commanding moment; everything else whispers:
- Masthead consumes `--step-display`; push tagline down to `--step-sub` (F1) and reduce to
  `--muted` ink weight so it reads as a caption, not a peer.
- Increase the air between masthead and tagline (`margin-top` → `clamp(2rem, 5vh, 3rem)`) and
  between tagline and CTA, so the eye lands on the name first.
- CTA de-weighted to a quieter resting state (see #4) so it's an invitation, not a button
  competing with the name.
- Kicker stays as-is (already the faintest element).
**Files touched.** `app/globals.css` (`.hero__masthead`, `.hero__tagline`, `.cta`),
`components/sections/Hero.tsx` (no structural change; class/order only).
**Risk / fallback.** Pure CSS; reduced-motion unaffected. Check 375px — masthead `15vw` already
fits; verify tagline at `--step-sub` doesn't wrap awkwardly.
**Effort.** S.

### #5 — Type scale lacks a third tier; triplet reads as filler tags
**Diagnosis.** TheOneNumber triplet uses `.triplet` (`:269`, display family ~1.1–1.5rem) with
`gap:1.25rem 2rem` and brass `·` separators (`:284`) — visually a tag row, no breathing room, and
nothing sits between `.lead` and body.
**Approach.**
- Introduce `.subhead` (F1, `--step-sub`) as the missing tier; apply to the triplet words so they
  read as considered sub-headings, not chips.
- Give the triplet vertical breath: stack on a generous baseline (increase row gap to
  `clamp(0.8rem, 2vh, 1.4rem)`, widen column gap), and let each word sit on its own optical line at
  narrow widths. Keep the brass `·` but as a small mark between, not a tag delimiter.
- Widen the flanking hairlines' rhythm (the `clamp(3rem,7vh,5rem)` wrappers in
  `TheOneNumber.tsx:34,43`) so the block exhales.
**Files touched.** `app/globals.css` (`.triplet`, new `.subhead`),
`components/sections/TheOneNumber.tsx`.
**Risk / fallback.** Pure CSS. Effort **S**.

### #6 — Uniform `--section-y` reads mechanical
**Diagnosis.** All sections share `padding: var(--section-y)` (`:131`); identical rhythm top to
bottom.
**Approach.** Apply F2 variants as punctuation. Proposed (for sign-off): Hero (own rules) →
**TheIdea exhale** (first breath after entrance) → **TheOneNumber default** → **Discretion hold**
(tension — discretion sits tight, intimate) → **TheClubToCome exhale** (the vague future opens up)
→ **Invitation default**. Assign `.section--hold` / `.section--exhale` on each section's root.
**Files touched.** `app/globals.css` (F2 tokens + modifiers), each `components/sections/*.tsx`
root className.
**Risk / fallback.** Pure CSS. The `.section__index` `top: var(--section-y)` (`:137`) must track
the variant — set it to inherit the section's own top padding (use a per-section CSS var) so the
numeral stays pinned to the content top. **Effort.** S–M.

### #7 — Roman numerals below perception
**Diagnosis.** `.section__index { opacity: 0.05 }` (`:147`) — imperceptible; also fully inside the
gutter (`right: var(--gutter)`), so it never "peeks from the edge."
**Approach.** Raise `opacity` to ~`0.08`. Let it bleed off the right edge: `right: calc(-1 *
clamp(...))` or a small negative offset so the numeral is partially clipped by `overflow` —
a structural landmark, not a centred decoration. Keep `--ink` (no colour added), keep `aria-hidden`.
**Files touched.** `app/globals.css` (`.section__index`).
**Risk / fallback.** Ensure the bleed doesn't reintroduce a horizontal scrollbar (`body` already
`overflow-x:hidden` `:40`). Pure CSS. **Effort.** S.

### #2 — "SCROLL TO ENTER" hint is orphaned
**Diagnosis.** The hint is inline-styled generic spaced caps in `KeyReveal.tsx:149–170`, with the
brass drip `.key-hint__line` (`:448`) tacked under it but no compositional relationship — the caps
float, the line drips separately.
**Approach.** Give it ceremony as one connected mark:
- Unify into a small component/class: the label and the descending hairline read as a single
  vertical gesture — reduce letter-spacing slightly, lower opacity, and have the hairline grow out
  of the baseline (continuous rule), with the existing `key-drip` brass pulse travelling down it.
- Add a slow breathing animation on the whole hint (opacity `0.5↔0.85` over ~3.6s,
  `--ease-luxe`) so it has its own quiet life, distinct from the drip.
- Anchor the label directly above the line with no gap jump.
**Files touched.** `app/globals.css` (new `.key-hint` rules + breathing keyframe), `KeyReveal.tsx`
(replace inline styles with the class).
**Risk / fallback.** Hint only renders when `scrubbed` (`:149`) so it's already absent under
reduced-motion/no-WebGL. Wrap the breathing keyframe in the existing reduced-motion block (`:488`).
**Effort.** S.

### #4 — CTA nearly invisible at rest; arbitrary width
**Diagnosis.** `.cta__label` border is `1px solid var(--hairline)` = 14% opacity (`:252`) →
near-invisible. The "~290px" width is not set in CSS — it's the intrinsic width of the
"Request an introduction" label at `padding:1rem 2rem` (`:251`); it reads arbitrary because there's
no rationale, and the magnetic wrapper makes it feel like a loose box.
**Approach.**
- Resting border to ~`rgba(26,23,20,0.32)` (a dedicated `--cta-border` token, ~35%) so it's
  present but quiet; OR keep the hairline border and add a delicate `background: var(--accent-tint)`
  (F3, 6% brass) so the shape is legible without a loud border. Recommend the subtle tint + a
  ~28–32% border together.
- Hover already shifts to `--accent` (`:262`) — keep, add a slightly stronger tint on hover.
- Width: make it intentional, not arbitrary — set `padding` in `ch`/consistent rhythm and cap with
  a sensible `min-width` tied to the measure, or let it hug the label with balanced padding. Decide
  one rule and apply to both hero CTA and the form submit (same `.cta`).
**Files touched.** `app/globals.css` (`.cta`, `.cta__label`, F3 tokens).
**Risk / fallback.** Accent tint behind the CTA *label* is a control surface, not text on paper —
this does **not** violate the "no fill behind text" rule (which protects body/display copy). Flag
for confirmation anyway. Pure CSS. **Effort.** S.

### #11 — "By invitation" kicker pill is a foreign filled element
**Diagnosis.** The kicker (`Hero.tsx:18`, `.kicker` `:81`) is **not** actually filled — it has no
background; its `::before` is a brass hairline mark (`:91–100`). If the critique sees a "pill," it
is the **CTA label box** (`.cta__label` border, `:252`) reading as a filled chip, or the kicker's
inline-block + letterspacing reading boxy. **Verify in browser first**, but on current code the
only bordered/“pill-like” element is the CTA.
**Approach.** Two cases:
- If it's the CTA chip → resolved by #4 (tint instead of hard box) + ensuring it doesn't read as a
  filled pill.
- If a literal pill exists somewhere not in these files (e.g. a stray background on `.kicker` in a
  section variant) → strip to plain spaced caps with the hairline mark (matches the no-fill rule),
  which is the kicker's current intended treatment. Do **not** propagate a filled treatment.
**Files touched.** `app/globals.css` (`.kicker` / `.cta__label`) — pending browser confirmation.
**Risk / fallback.** None. **Effort.** S. **Needs sign-off / browser check** to confirm what the
critic actually saw.

### #12 — Footer wordmark too loud for a coda
**Diagnosis.** `.footer__wordmark { font-size: clamp(2rem, 1.5rem + 3vw, 4rem) }` (`:377`) — near
hero scale, so the footer shouts where it should murmur.
**Approach.** Consume `--footer-wordmark` (F1) = `clamp(1.4rem, 1.1rem + 1vw, 2.1rem)` — roughly
45–50% reduction. Keep tracking/line-height; the coda recedes.
**Files touched.** `app/globals.css` (`.footer__wordmark`), F1 token.
**Risk / fallback.** Pure CSS. **Effort.** S.

### #8 — Native scrollbar visible
**Diagnosis.** No scrollbar suppression anywhere in `globals.css`; Lenis smooths but the OS bar
still shows.
**Approach.** Add globally:
```
html { scrollbar-width: none; }            /* Firefox */
html::-webkit-scrollbar { display: none; } /* WebKit */
```
Recommend **no bespoke progress indicator** (discretion-first; a progress bar is a "product" tell).
If one is wanted later it can be a 1px brass hairline — separate decision.
**Files touched.** `app/globals.css`.
**Risk / fallback.** Reduced-motion uses native scroll (`smooth-scroll.tsx:22`) — hiding the bar is
still fine and accessible (keyboard/trackpad unaffected). Ensure content remains scrollable (it is;
we only hide the visual). **Effort.** S.

### #9 — No custom cursor
**Diagnosis.** None exists. The site has magnetic buttons (`MagneticButton.tsx`) but no cursor
layer — a key "expensive detail."
**Approach.** New `components/ui/Cursor.tsx` (client), mounted once in `app/layout.tsx`:
- A small `--ink`/brass **dot** that follows the pointer 1:1 and a larger **ring** that lerps
  behind it (GSAP `quickTo`, `--ease-luxe` feel). On hover over interactive elements
  (`a, button, [data-cursor]`) the ring expands and tints brass.
- Drive off `pointermove`; reuse the existing GSAP instance. Hide the native cursor via a
  `body.has-cursor` class (F3) added only when activated.
- **Gating:** mount only when `matchMedia('(pointer: fine)')` AND not reduced-motion. On touch /
  coarse pointer / reduced-motion, render nothing and leave the native cursor (body class not
  applied). No SSR (guard `window`).
**Files touched.** `components/ui/Cursor.tsx` (new), `app/layout.tsx`, `app/globals.css`
(cursor styles + `body.has-cursor { cursor: none }`).
**Risk / fallback.** Touch/reduced-motion → native cursor untouched. Perf: single rAF via GSAP
quickTo, no layout thrash (transform only). Keep `pointer-events:none` on the cursor layer.
**Effort.** M.

### #10 — Invitation form opens cold
**Diagnosis.** The section goes kicker → form (`Invitation.tsx:73–83`) with no framing line; the
`34rem` max-width (`:295`) is right. The act feels procedural.
**Approach.** Add one quiet framing line between the kicker and the form, e.g. *"Introductions are
extended by existing members only."* as a `.subhead`/`.lead measure` (F1 tier) with generous
`margin`. Copy is name-agnostic. No structural/logic change to the form.
**Files touched.** `components/sections/Invitation.tsx` (add a `Reveal` line),
`app/globals.css` only if a new class is needed.
**Risk / fallback.** Wrap in existing `Reveal` so it inherits reduced-motion handling. **Effort.** S.

---

## Execution order (phased)

**Phase 0 — Foundation (no visual risk, unblocks the rest).** F1 type tiers, F2 spacing tokens,
F3 cursor/scrollbar/accent tokens, F4 brass palette export. Land and eyeball.

**Phase 1 — Pure-CSS hierarchy & rhythm (low risk).** #3 hero hierarchy, #5 triplet/third tier,
#6 section rhythm, #7 numerals, #12 footer, #8 scrollbar, #10 form framing line. All consume
Phase 0 tokens. Quick visual review.

**Phase 2 — Components/details.** #2 scroll hint ceremony, #4 CTA legibility, #11 (after browser
confirmation of what the "pill" is), #9 custom cursor.

**Phase 3 — 3D re-grade (highest subjectivity → sign-off gate).** #1 key lighting/material/tone
mapping, #13 chromatic alignment. Build behind `PerformanceMonitor`, review rendered frames
against an `--accent` swatch. **Do not merge without your visual approval.**

Phases 1–2 are independent of Phase 3 and can ship first if the key re-grade needs iteration.

---

## Resolved decisions (signed off — implement as written)

These were the open questions; all are now decided. Build to these — do not re-prompt.

1. **Section rhythm map (#6).** Idea = **exhale**, OneNumber = default, Discretion = **hold**,
   ClubToCome = **exhale**, Invitation = **exhale** (changed from default — the final ask gets air,
   reinforcing #10). Hero keeps its own rules.
2. **CTA treatment (#4).** **Border-only at ~32% opacity. No background tint** (resting or hover).
   A tint behind the label drifts toward the "product UI" tell CLAUDE.md warns against; restraint
   reads more expensive. Drop the `--accent-tint` token from F3 unless another use surfaces. Brass
   stays reserved for the hover border/colour shift (existing behaviour).
3. **#11 "pill" — closed, no work.** Verified in source: `.kicker` ("By invitation") has **no
   background** (`globals.css:81–101`) — plain spaced caps in `--muted` with a brass hairline
   `::before`. The only bordered element is the CTA label. The critic conflated the two. There is no
   filled pill; #11 folds entirely into #4. No browser check needed.
4. **Scroll indicator (#8).** **Hide the bar only.** No progress hairline (product tell).
5. **Tone-mapping (#1).** Default to **AgX**, but render **AgX vs Neutral comparison frames** for
   visual sign-off before committing (still the Phase 3 gate). Do not ship ACES.
6. **Form framing copy (#10).** Use **"Members extend introductions personally."** (replaces the
   procedural placeholder — shorter, warmer, more discreet). Name-agnostic.
7. **Cursor (#9).** **Dot + lerping ring.** Hover state expands the ring and tints it **brass**
   (not ink) to serve the unified-palette goal. Keep subtle; gating unchanged (pointer:fine + not
   reduced-motion).

### Two checks to fold into the build

- **#3 hierarchy comes from shrinking, not enlarging.** `--step-display` must equal the *existing*
  masthead clamp (`3.5rem…13rem`, `globals.css:224`). The masthead becomes dominant by dropping the
  tagline to `--step-sub` + `--muted` — never by enlarging the name.
- **#7 edge-bleed vs `overflow-x: hidden`.** Re-verify the numeral bleed on a real ~375px width;
  `body { overflow-x: hidden }` (`:40`) can mask a clipped-but-present horizontal overflow. Confirm
  no scroll is introduced.

Ready for Phase 0.
