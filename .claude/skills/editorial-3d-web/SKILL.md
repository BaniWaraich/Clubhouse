---
name: editorial-3d-web
description: >-
  Art-direct and build editorial, expensive-looking websites with real WebGL 3D.
  Use this skill WHENEVER the user wants a site, page, landing page, hero, or
  component to look high-end, premium, "expensive," editorial, award-winning,
  Awwwards-style, agency-grade, or cinematic — and ESPECIALLY whenever 3D, WebGL,
  Three.js, React Three Fiber, scroll animation, or immersive motion is involved,
  even if the user doesn't say the word "3D." Also trigger when a brief asks to
  make an existing page "feel more premium," "less templated," "more designed,"
  or "like a real agency made it." Outputs React / Next.js components (R3F + drei
  + GSAP/ScrollTrigger + Lenis) for a real codebase, with graceful degradation
  and prefers-reduced-motion always included. Do NOT use for plain CRUD UI,
  dashboards, admin panels, or when the user explicitly wants something simple,
  fast-to-ship, or minimal-effort — reach for the standard frontend-design skill
  instead.
---

# Editorial 3D Web

Build websites that look like they cost €50k+ to make: confident editorial
typography, real WebGL depth, and slow, intentional motion. This skill is the
maximalist, art-directed cousin of plain frontend work. The job is not to add
3D *to* a page — it's to art-direct a page where 3D, type, space, and motion
are one coherent idea.

The output target is a **real Next.js (App Router) + React Three Fiber codebase**,
not the in-chat artifact preview. Use modern `three`, `@react-three/fiber`,
`@react-three/drei`, `gsap` (+ ScrollTrigger), and `lenis`. The rich version
won't fully render inside a Claude artifact — that's expected. Build for the repo.

## What separates "expensive" from "templated"

Cheap sites are loud and busy. Expensive sites are **restrained and confident**.
Internalize these before writing any code — they matter more than any library:

1. **Conviction over variety.** One or two type families used with total
   commitment. A tight palette (often 2–3 values + one accent). Repetition is
   not a weakness — it reads as authorship.
2. **Space is the luxury signal.** Generous negative space, large margins, and
   room around the hero. Crowding is the single biggest "cheap" tell.
3. **Display typography with real craft.** Large characterful type, tight
   tracking at big sizes, optical sizing, ligatures, hanging punctuation, and an
   actual baseline grid. Treat type as the primary visual, not a label.
4. **Motion that is slow and eased.** Custom cubic-béziers, staggered reveals,
   scroll choreography. Nothing bouncy, nothing default-eased, nothing fast.
   Smooth scroll (Lenis) is the carrier wave for the whole experience.
5. **3D as art direction, not decoration.** One strong concept tied to the
   brand — a material, a form, a particle field — lit beautifully (HDRI
   environment, soft contact shadows, rim/fresnel light, restrained bloom) and
   color-graded. A spinning logo cube is the opposite of this.
6. **The detail layer.** Film grain/noise overlay, subtle chromatic aberration,
   custom cursor, magnetic buttons, text-mask reveals, image clip-path reveals.
   These are what reviewers feel without naming.
7. **Grid discipline.** A real editorial grid with intentional asymmetry, not
   12 equal columns of centered content.
8. **No jank, ever.** 60fps or it isn't expensive. Polish is non-negotiable.

If a brief pushes toward more elements, more colors, more speed — push back
toward less, calmer, slower. That instinct is most of the skill.

## Workflow: art-direct first, then build

Never jump straight to a `<Canvas>`. Work in this order.

### Step 1 — Establish art direction (before any code)

Decide and briefly state these as a short direction note, then build to it:

- **Register** — pick the one that fits the brief (see `references/art-direction.md`
  for the full system): **Brutalist editorial**, **Luxe minimal**, or
  **Dark immersive**. Blend deliberately if it serves the brand; don't blend by
  accident.
- **Type system** — display family + text family, the type scale, and the one
  signature typographic move (e.g. oversized masthead, vertical kicker labels,
  justified body with hanging punctuation).
- **Palette** — base, ink, and a single accent. Name exact values.
- **The 3D concept** — what the WebGL *is* and why it belongs to this brand.
  One idea. Describe the material, lighting mood, and how scroll drives it.
- **Motion language** — the easing curve, the reveal pattern, the scroll feel.

Keep this to a few lines. It's a compass, not a deliverable.

### Step 2 — Scaffold the stack

Use this architecture. Full wiring (correct for Next.js App Router) is in
`references/stack-patterns.md` — read it before writing the scroll/3D layer.

```
app/
  layout.tsx            # fonts (next/font), <SmoothScrollProvider>, grain overlay
  page.tsx              # composition of sections
components/
  providers/
    smooth-scroll.tsx   # Lenis + GSAP ScrollTrigger sync, reduced-motion gate
  three/
    Scene.tsx           # the R3F <Canvas> (dynamic import, ssr:false)
    <concept>.tsx       # the signature 3D object/material
  sections/
    Hero.tsx
    ...
  ui/
    MagneticButton.tsx
    SplitText.tsx       # mask reveals
lib/
  easings.ts            # the project's cubic-béziers in one place
```

Non-negotiable rules:

- The R3F `<Canvas>` is **dynamically imported with `ssr: false`** and lazy —
  never block first paint on WebGL.
- **Lenis drives GSAP**, not the reverse: feed `lenis.on('scroll', ScrollTrigger.update)`
  and run Lenis off `gsap.ticker`. Two competing RAF loops = jank.
- Fonts via `next/font` for zero layout shift.

### Step 3 — Build the layers

Compose in this order so the page degrades cleanly top-down:

1. **Type + grid + space** — the page must look expensive with zero JS and zero
   3D. Get the static layout right first; it's the foundation everything sits on.
2. **Motion** — Lenis smooth scroll, then GSAP reveals and scroll-pinned
   sequences.
3. **3D** — the signature scene, scroll-linked, lit and graded.
4. **Detail layer** — grain, cursor, magnetic buttons, micro-interactions.

See `references/stack-patterns.md` for working component patterns for each layer.

## Always: graceful degradation + accessibility

This is part of "expensive," not a tax on it. A site that breaks on a mid-range
phone is not premium.

- **`prefers-reduced-motion`** — when set, disable Lenis (native scroll), stop
  scroll-driven 3D animation (render a static, well-composed frame or a graded
  poster image), and replace reveal animations with instant opacity. The page
  must be fully usable and still look composed.
- **No-WebGL / low-power fallback** — detect context-creation failure and render
  a designed static hero (art-directed image or CSS gradient + type), never a
  blank canvas.
- **Mobile** — reduce 3D cost (lower DPR cap, fewer particles, simpler shaders)
  or swap to a lighter treatment. Test the experience at 375px width.
- **Semantics & contrast** — real heading hierarchy, focus-visible states,
  alt text, and AA contrast on actual content (decorative 3D is exempt, content
  is not).

## Performance budget

- Cap `dpr` at `[1, 2]`; lower it under load with drei's `<PerformanceMonitor>`.
- Lazy-load the canvas; pause the render loop when offscreen
  (`frameloop="demand"` or visibility-gated).
- Compress textures/HDRIs; prefer a small env map over heavy assets.
- Target 60fps on a mid-tier laptop and stable 30fps+ on mid-tier mobile.

## Reference files

- `references/art-direction.md` — the three registers in full: type pairings,
  exact palettes, spacing/scale, motion timing, and the "expensive" detail
  checklist. Read when establishing direction in Step 1.
- `references/stack-patterns.md` — concrete, correct code for Next.js App
  Router: Lenis + GSAP/ScrollTrigger provider, R3F canvas + scroll-linked
  scene, reduced-motion gating, mask-reveal text, and magnetic buttons. Read
  before writing the motion/3D layer in Step 2–3.
