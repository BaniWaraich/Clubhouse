# Build Brief — Clubhouse Landing Page

> Paste this whole file to Claude Code (or run `claude` in the repo root and
> reference it). It is the single source of truth for building the landing page.
> Everything below is decided — do not re-litigate direction; execute it.

---

## 0. Your mission

Build the complete single-scroll, by-invitation landing page for a pre-launch
private members' club, to the locked art direction in §2. The repo is already
scaffolded (Next.js App Router + TypeScript + React Three Fiber + GSAP/ScrollTrigger
+ Lenis). You are turning the placeholder Hero into the full, finished,
production-quality page.

**Before writing any code:**

1. Read `.claude/SKILLS.md`, then read the **`editorial-3d-web`** skill in full —
   `.claude/skills/editorial-3d-web/SKILL.md` and both files in
   `references/` (`art-direction.md`, `stack-patterns.md`). Build to that skill's
   standards; it is the rubric you will be judged against.
2. Read `CLAUDE.md` (repo root) for positioning and hard constraints.
3. Read the existing scaffold so you reuse its wiring rather than rebuild it:
   `app/layout.tsx`, `app/globals.css`, `components/providers/smooth-scroll.tsx`,
   `components/three/*`, `components/ui/*`, `lib/easings.ts`, `lib/brand.ts`.

The Lenis↔GSAP↔R3F integration in the scaffold is correct — keep its wiring
(Lenis owns the RAF loop and drives ScrollTrigger; the `<Canvas>` is dynamically
imported `ssr:false`; fonts via `next/font`). Do not introduce a second RAF loop.

---

## 1. What this is (positioning)

A premium, pre-launch landing page for a **concierge-first, pre-property** private
members' club. The Day One product is a single hotline — the **"One Number"** — an
invited inner circle calls for negotiated 5-star hotel bookings, travel planning,
and lifestyle services. A physical club in the Himachal/Chandigarh region is a
later phase (Phase 2), teased only vaguely.

**Positioning principle: discretion as the product, not an amenity.** Reference
points are Pratt's and 5 Hertford Street — NOT Soho House / Quorum. The site sells
restraint and absence. Never an amenity grid, never lifestyle stock photography,
never "apply now" energy.

The brand name is provisional and lives in `lib/brand.ts` (`BRAND.name`, working
value "Sodalis"). **Never hard-code the name** anywhere — always read it from
`BRAND`. Same for tagline and registered region.

---

## 2. Locked art direction (the compass — build exactly to this)

**Register:** Luxe minimal, warm. Quiet money. Vast margins, a narrow measure,
almost nothing on screen at once. Confidence through how little it does. This is a
flip away from the dark placeholder currently in the scaffold — update the palette.

**Palette (update `app/globals.css` `:root` to these exact values):**

| Token | Value | Use |
|-------|-------|-----|
| `--base` | `#F3EFE6` | warm bone paper background |
| `--ink` | `#1A1714` | warm near-black text (never pure black) |
| `--muted` | `#8A8275` | taupe secondary text, kickers |
| `--accent` | `#A8843E` | muted brass — used as **light and small marks only** (hairline, kicker, the glow in the 3D), never as a fill behind text |
| `--hairline` | `rgba(26,23,20,0.14)` | rules, dividers, borders |

One accent, total commitment. No gradients on type. No additional colors.

**Type:**
- Display: **Fraunces** (already imported), optical sizing on, low SOFT/WONK for
  refinement, at very large sizes with tight tracking (negative letter-spacing
  that loosens as size drops).
- Text: **Inter** (already imported), generous leading (~1.6), normal weight.
- Signature move: an oversized serif masthead in a **narrow, offset** measure with
  hanging punctuation and a lot of air around it; letterspaced small-caps kicker
  labels (e.g. "By invitation") above headings.
- Use `text-wrap: balance` on headings, ligatures + kerning on.

**3D concept — "the warm room" (light, not object):**
- No monolith, no spinning thing. The WebGL is **atmosphere**: a slow-drifting
  field of warm golden haze with faint motes/dust, a soft gradient of light that
  deepens as you scroll — as if moving through a sunlit, candlelit interior seen
  from across a room.
- Build it with soft fog + a large soft-lit gradient/plane + a sparse, slow
  particle field; restrained bloom; **warm color-grade** so it shares the
  bone/brass palette. Never raw default-lit WebGL color against the layout.
- Camera eases **forward** on scroll (couple to ScrollTrigger via the existing
  ref-then-lerp pattern in `components/three/ConceptObject.tsx` — keep that
  damped-follow pattern, swap the contents).
- This replaces the placeholder `ConceptObject` icosahedron entirely. Rename to
  something meaningful (e.g. `WarmRoom.tsx` / `Atmosphere.tsx`) and update imports.
- It should sit **behind** the type in the Hero and persist subtly as a graded
  background through the page (or fade to flat bone in later sections — your call,
  but keep it from competing with copy).

**Motion — slow and inertial:**
- Tune Lenis heavier: `duration: ~1.6` in `smooth-scroll.tsx`.
- One easing curve everywhere: `cubic-bezier(0.22, 1, 0.36, 1)` (it's `ease.luxe`
  in `lib/easings.ts` — use it; for GSAP use the matching `expo`/custom).
- Reveal durations 0.8–1.6s. Reveals: text mask wipes upward (use/extend
  `SplitText`), images/blocks unmask via `clip-path` inset upward, gentle
  parallax, cross-fades. Nothing bouncy, nothing fast, nothing default-eased.

---

## 3. Page structure & copy (single immersive scroll)

Build these sections in order, each its own component in `components/sections/`.
Compose them in `app/page.tsx`. Remove the placeholder spacer.

Copy below is the **starting copy** — it is on-brand and you may polish for rhythm,
but keep the register (spare, suggestive, never salesy) and the constraints in §4.
Read the name/tagline from `BRAND`.

1. **Hero** (`Hero.tsx` — evolve the existing one)
   - Kicker: `By invitation`
   - Masthead: `{BRAND.name}` (oversized Fraunces)
   - Line: `{BRAND.tagline}` → "A private membership. One number."
   - CTA: magnetic button "Request an introduction" (anchors to the Invitation
     section). Use the existing `MagneticButton`.
   - The "warm room" 3D behind the type.

2. **The Idea** (`TheIdea.tsx`)
   - Kicker: `The idea`
   - Body (narrow measure, a few short lines): the white-space thesis told as
     invitation, in the Pratt's / 5 Hertford Street register. Convey: there is no
     equivalent of this in India yet; this is for those who no longer need to be
     seen; membership, not a venue. Do NOT write "India's first" or any superlative
     claim — let the absence be felt. Suggested seed:
     > "Some rooms are known by who is not in them. A membership for people who
     > have stopped performing their wealth — and would simply like things handled."

3. **The One Number** (`TheOneNumber.tsx`)
   - Kicker: `The one number`
   - The Day One product as a promise, not a feature list. No itemized services,
     no hotel names. Suggested seed:
     > "One number, answered. A stay arranged before the call ends. A journey that
     > asks nothing of you. Whatever is required, quietly arranged."
   - Optional restrained detail: a single hairline-separated triplet
     (Stays · Journeys · The unspoken) — words only, no icons, no descriptions.

4. **Discretion** (`Discretion.tsx`)
   - Kicker: `Discretion`
   - Make discretion the explicit operating principle; reassure on privacy of the
     member, the list, and the request. Short and declarative. Suggested seed:
     > "The list is private. The request is private. Nothing about your membership
     > is for anyone but you. Discretion is not a courtesy here — it is the product."

5. **The Club to Come** (`TheClubToCome.tsx`)
   - Kicker: `In time`
   - One restrained line teasing Phase 2 without naming a region or committing.
     Suggested seed:
     > "In time, a place. For now, a number that always answers."

6. **Invitation** (`Invitation.tsx`) — the only interactive section
   - Kicker: `Request an introduction`
   - A quiet **gated** form: fields = Full name, Email, "The member who referred
     you" (referral), and an optional message. No pricing, no tiers, no "apply,"
     no membership levels. The friction is the point.
   - On submit: a discreet acknowledgment in place (e.g. "Thank you. If there is a
     place for you, you will hear from us.") — NOT a marketing confirmation.
   - Wire submission to a Next.js Route Handler (`app/api/enquiry/route.ts`) that
     validates server-side and, for now, logs / returns 200 (no third-party
     integration; leave a clear TODO for where the destination goes). Client-side
     validation + accessible labels + error states required.

7. **Footer** (`Footer.tsx`)
   - Bare: `{BRAND.name}` wordmark, a legal entity line using
     `BRAND.registeredRegion`, a Privacy link (can route to a stub
     `app/privacy/page.tsx`), copyright with current year. Nothing else.

A persistent minimal header is optional; if used, only a faint wordmark + a single
"Enquire" anchor. No nav menu.

---

## 4. Hard constraints (do not violate)

- **Never name hotel partners** (IHCL/Taj, ITC, Oberoi) anywhere.
- **No restaurant / venue / amenity content** — excluded Day One.
- **No public pricing, tiers, or membership levels.** CTA is always "Request an
  introduction," gated, with a referral field.
- **Phase 2 is a vague tease only** — no named region, no renderings, no dates.
- **Name is never hard-coded** — always from `BRAND`.
- Pre-launch: keep `robots: noindex` (already set in `layout.tsx`).
- No lifestyle stock photography. If any imagery is used, it must be abstract /
  textural / graded to palette.

---

## 5. Technical requirements (non-negotiable)

- **Graceful degradation:**
  - `prefers-reduced-motion`: Lenis disabled (native scroll — already gated),
    scroll-driven 3D paused on a static graded frame (`frameloop="demand"`),
    reveals set to final state instantly. Page must stay fully composed.
  - **No-WebGL / context-loss fallback:** detect failure and render a designed,
    graded warm static hero (CSS gradient + type), never a blank canvas. The
    existing dynamic-import `loading` fallback should be upgraded to match.
- **Performance budget:** cap `dpr` at `[1, 2]`, drop under load via
  `PerformanceMonitor` (already wired); lazy canvas; pause render loop when the
  hero is offscreen; keep the particle count modest. Target 60fps on a mid-tier
  laptop, stable 30fps+ on mid-tier mobile. Test at 375px width.
- **Accessibility:** real heading hierarchy (one `<h1>` = the masthead),
  `focus-visible` states (already styled), AA contrast on all *content* (brass on
  bone fails for body text — use `--ink`; brass is for marks/light only), labelled
  form fields, alt text where relevant. Decorative 3D is `aria-hidden`.
- **Mobile:** reduce 3D cost (lower DPR cap, fewer motes) or swap to the graded
  static treatment; the layout must breathe at small sizes, not just shrink.

---

## 6. Implementation order (degrade top-down)

1. Update palette in `globals.css`; flip to the warm system. Verify the page looks
   expensive **with zero JS and zero 3D** first — type, grid, space.
2. Build all sections statically (real copy, real layout, narrow measures, kickers,
   hairlines) and compose in `page.tsx`.
3. Add motion: confirm Lenis weight, then GSAP reveals (`SplitText` mask wipes,
   clip-path unmasks, parallax) per section with the single easing.
4. Replace the placeholder 3D with the "warm room" atmosphere; scroll-couple the
   camera; color-grade to palette; wire both fallbacks.
5. Detail layer: keep the grain overlay, magnetic CTA; add a custom cursor only if
   it stays subtle and respects reduced-motion/touch.
6. Build the Invitation form + route handler + privacy stub.

---

## 7. Acceptance criteria (verify before declaring done)

- `npm run build` passes with no type errors and no ESLint errors.
- `npm run dev` renders the full scroll: all seven sections, real copy, warm
  palette, atmospheric 3D behind the hero, slow inertial scroll, staggered reveals.
- Toggle OS "Reduce motion": native scroll, no animation, static graded 3D frame,
  page still fully composed and readable.
- Simulate no-WebGL (e.g. block the context): designed static hero, no blank box.
- 375px width: legible, breathing layout; 3D cost reduced; no horizontal scroll.
- Lighthouse (mobile) ≥ 90 Performance and ≥ 95 Accessibility on the landing page.
- Grep the codebase: no hotel-partner names, no hard-coded brand name, no pricing.
- Form: client + server validation, accessible labels, discreet success state,
  route handler returns 200 with a TODO for the real destination.

Report what you changed, anything you deviated on and why, and the Lighthouse
numbers.

---

## 8. Out of scope (do not build)

CMS, auth, payments, real email/CRM integration, analytics, multi-page marketing
site, Phase 2 / property pages, any hotel-booking functionality. This is a single
gated landing page.
