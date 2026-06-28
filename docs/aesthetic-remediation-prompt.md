# Prompt for Claude Code — Aesthetic Remediation Plan

> Paste the block below into Claude Code at the repo root.

---

You are working in the **Clubhouse** repo (Next.js App Router + TS, R3F, GSAP, Lenis). Read `CLAUDE.md` and `.claude/skills/editorial-3d-web/SKILL.md` first, then activate the `editorial-3d-web` skill — establish art direction reasoning before any code.

**Do not write or change any code yet.** Your only deliverable for this task is a written implementation plan saved to `docs/aesthetic-remediation-plan.md`. I will review and approve it before you touch the codebase.

## Context

An external design critique flagged 13 aesthetic shortcomings on the landing page. They are listed below, grouped by the part of the system they touch. For each one I need a *technical* remediation plan, not a restatement of the problem.

The design system is centralised: tokens live in `:root` in `app/globals.css` (`--base #f3efe6`, `--ink #1a1714`, `--muted #8a8275`, `--accent #a8843e`, `--hairline rgba(26,23,20,0.14)`, `--section-y`, `--ease-luxe`). The brand name is name-agnostic via `lib/brand.ts`. Honour every constraint in `CLAUDE.md` (discretion-first, no amenity grid, accent is light/small marks only — never a fill behind text, always ship `prefers-reduced-motion` + no-WebGL fallbacks).

## Before planning — investigate

Read the actual implementations so the plan is concrete, not generic. At minimum:
`app/globals.css`, `components/three/KeyModel.tsx`, `components/three/KeyCanvas.tsx`, `components/three/KeyReveal.tsx`, `components/three/Atmosphere.tsx`, `components/three/Scene.tsx`, `components/ui/CtaButton.tsx`, `components/ui/MagneticButton.tsx`, `components/ui/SectionIndex.tsx`, `components/ui/HeroMark.tsx`, `components/sections/Hero.tsx`, `components/sections/Invitation.tsx`, `components/sections/Footer.tsx`, `components/providers/smooth-scroll.tsx`.

Note: `KeyModel.tsx` already *claims* brass (`#a8843e`, `MeshPhysicalMaterial`) — so the "reads as dark brown" problem is likely lighting/environment/tone-mapping in `KeyCanvas`/`Atmosphere`, not the base material colour. Diagnose the real cause before proposing a fix.

## The 13 issues

**3D key & material palette (issues 1, 13)**
1. Key reads as a stylised illustration, not a luxury object — too dark/chocolate-brown, arcade-gold sheen, hard bevel outlines. Wants aged-brass / burnished rose-gold, soft ambient shadows, muted speculars, material harmonised with the cream base.
13. The key shares no chromatic relationship with `--accent #a8843e`; align it so the whole page reads as one material palette.

**Typography & hierarchy (issues 3, 5)**
3. Hero has no gravitational hierarchy — masthead, tagline, CTA feel equally weighted. Want one commanding typographic moment; everything else whispers.
5. Type scale lacks a clear third tier — `.lead` headings drop straight to ~1rem body; "Stays · Journeys · The unspoken" in `TheOneNumber` reads as filler tags, no breathing room.

**Spacing & rhythm (issues 6, 7)**
6. Every section uses the same `--section-y` — uniform and mechanical. Use space as punctuation: some sections exhale, others hold tension.
7. Section Roman numerals at `opacity: 0.05` are below perception. Raise to ~7–9% and let the numeral peek from the right edge as a structural landmark.

**Components & UI elements (issues 2, 4, 11, 12)**
2. "SCROLL TO ENTER" hint is visually orphaned — generic spaced caps, disconnected from the well-conceived `key-drip` line. Give it ceremony (hairline descending to the drip, or slow breathing animation, its own character).
4. CTA (`CtaButton`/`.cta`) is a 1px border at 14% opacity — nearly invisible at rest. Raise border opacity (~35–45%) or add a delicate hover tint; the ~290px width is arbitrary.
11. The "By invitation" kicker pill is the only filled-background element — reads as foreign to the system. Either strip it to plain spaced caps (matches the no-fill-behind-text rule) or propagate the treatment intentionally.
12. Footer wordmark (`clamp(2rem,1.5rem+3vw,4rem)`) is too loud for a coda — reduce ~40–50% vs the hero masthead.

**Global experience (issues 8, 9)**
8. Native OS scrollbar is visible — hide it (`::-webkit-scrollbar{display:none}` + `scrollbar-width:none`) and rely on Lenis; optionally add a bespoke progress indicator or nothing.
9. No custom cursor — add a curated cursor (dot/circle that expands on hoverables), with sensible touch/reduced-motion fallback.

**Form ceremony (issue 10)**
10. The Invitation form opens cold — `34rem` max-width is right, but add a brief framing line ("Introductions are extended by existing members only") so the act feels privileged, not procedural.

## Plan format

Write `docs/aesthetic-remediation-plan.md`. For **each** of the 13 issues:

- **Diagnosis** — the actual root cause in the current code (cite file + line/symbol).
- **Approach** — the specific technical change (token edits, material/lighting params, new component, GSAP/Lenis wiring), with concrete values where you can commit to them.
- **Files touched** — exact paths.
- **Risk / fallback** — `prefers-reduced-motion`, no-WebGL, mobile/touch, perf implications.
- **Effort** — S / M / L.

Then add:

- A **shared-foundation section** for changes that should land first because others depend on them (e.g. new tokens: a type third-tier scale, per-section spacing variants, cursor/scrollbar globals) — call out which issues each unblocks.
- A **sequenced execution order** in phases, flagging anything that needs my visual sign-off (especially the key re-lighting, #1/#13).
- An explicit list of **open design decisions** you want me to confirm before implementation.

Keep it concrete and skimmable. Stop after writing the file.
