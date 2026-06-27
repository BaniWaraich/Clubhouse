# Clubhouse — Project Context

Persistent instructions for Claude Code in this repository.

## What this is

A premium, pre-launch landing page for a private members' club (working name
held in a variable — see "Naming" below). The club is **concierge-first and
pre-property**: the Day One product is a single hotline ("One Number") that an
invited inner circle of high-net-worth members call for 5-star hotel bookings at
negotiated rates, travel planning, and lifestyle services. A physical club in the
Himachal Pradesh / Chandigarh region comes later (Phase 2).

Positioning: **discretion as the product, not an amenity.** Reference points are
Pratt's and 5 Hertford Street — not Soho House / Quorum. The site sells restraint
and absence, never an amenity grid.

## Site shape (agreed)

Single immersive single-scroll page. Fully gated / by-invitation (no public
pricing or tiers; CTA is "Request an introduction" with a referral field). Phase 2
is a vague tease only. Sections: Hero → The Idea → The One Number → Discretion →
The Club to Come → Invitation (gated form) → Footer. Do NOT name hotel partners
(IHCL/ITC/Oberoi) publicly. No restaurant / venue content (excluded Day One).

## Naming

The brand name is **not final**. It is stored in one place — `lib/brand.ts`
(`BRAND.name`) — so it can be swapped in a single edit. Current working value is
the frontrunner; treat all copy as name-agnostic and never hard-code the name in
components.

## Stack

Next.js (App Router) + TypeScript, React Three Fiber (`three`,
`@react-three/fiber`, `@react-three/drei`), GSAP (+ ScrollTrigger), Lenis smooth
scroll. WebGL is dynamically imported (`ssr: false`) and never blocks first paint.
Lenis owns the RAF loop and drives ScrollTrigger. Fonts via `next/font`.

## Skills

Skills live in `.claude/skills/`; the registry with triggers is `.claude/SKILLS.md`
— read it before any non-trivial task. The primary skill for this repo is
**`editorial-3d-web`**: use it for all design/build work on the landing page.
Always establish art direction before code, and always include
`prefers-reduced-motion` and no-WebGL fallbacks.

## Output conventions

- Documents: prefer Markdown (`.md`); never `.docx` unless explicitly requested.
- Do not create README files unless explicitly requested.
- Keep responses concise; avoid excessive post-amble after delivering work.
