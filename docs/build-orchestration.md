# Build Orchestration — Clubhouse Landing Page (for Claude Code)

> Paste this whole file into Claude Code at the repo root to drive the redesign
> build. It executes in phases; each phase ends by committing, writing a handoff
> note, clearing context, and resuming fresh on the next phase. Do not re-litigate
> design — it is locked in `docs/landing-page-spec.md`. Execute it.

---

## 0. Mission & golden rules

Build the body redesign of the landing page to `docs/landing-page-spec.md` (the
single source of truth). Read it in full before any work, every phase.

**Golden rules (apply in every phase, every agent):**

1. **Spec is law.** If something isn't in the spec, infer from it; never invent new
   direction. The art direction (story, the admittance dark→light arc, Newsreader +
   IBM Plex Mono, brass-not-italic emphasis, motion, audio) is locked.
2. **Guardrails:** no property/partner/amenity/faces; Phase 2 a vague tease only; no
   pricing/tiers; brand name only from `lib/brand.ts` (never hard-coded); copy
   name-agnostic.
3. **Architecture:** single Lenis RAF — never add a second RAF loop. Keep WebGL
   dynamically imported (`ssr:false`). Fonts via `next/font`. `BRASS` must stay
   provably equal to `--accent`.
4. **Hero key — preserved vs. changed (do not over-restrict).** *Preserved:* the
   key's 3D model/geometry, its brass material identity (`BRASS` === `--accent`), and
   its twist/turn scroll choreography — don't change what the key is or how it moves.
   *In scope for the redesign:* re-light the scene to warm near-black with the key
   **backlit**; start `Scene`/`Atmosphere` dark as the source the travelling light
   grows from; re-grade warm-dark; and drop the wash-to-bone in the handoff (the dark
   holds, the literal door parts into the Anteroom). Editing `KeyCanvas`, `KeyReveal`,
   `Scene`, `Atmosphere` for this is expected; `KeyModel` identity stays. Re-lighting
   is subjective — gate it on visual sign-off (§3, Phase 3).
5. **Always ship `prefers-reduced-motion` + no-WebGL fallbacks.** Every motion
   change needs its static/degraded path in the same commit.
6. **Verify before you claim done.** Each phase has a gate; do not pass it on a
   failing build.

---

## 1. How to use agent teams

Use subagents (the Task tool) to parallelize — but only safely:

- **Parallelize across DISJOINT files only.** Two agents must never edit the same
  file in the same phase. Component files (`components/sections/*.tsx`) are disjoint
  and parallelize well. Shared files — `app/globals.css`, `lib/palette.ts`,
  `app/layout.tsx`, `components/motion/BodyMotion.tsx`, `lib/gsap.ts` — are
  contention points: a single agent (or the lead) owns each, sequentially.
- **Foundation before fan-out.** Within a phase, land the shared-file foundation
  FIRST (one agent), then fan out the disjoint work in parallel against it.
- **Each subagent brief must contain:** the exact spec section(s) to read, the
  precise files it may edit (and that it may edit NO others), the tokens/classes it
  must consume (not invent), and its acceptance check. Subagents start cold — give
  them everything; assume no shared memory.
- **Lead integrates & verifies.** After parallel agents return, the lead reconciles,
  runs the gate, and only then closes the phase.
- If two pieces of parallel work genuinely need the same file, serialize them or use
  separate `git worktree`s and merge — do not edit concurrently.

---

## 2. Context-clearing protocol (between every phase)

At the END of each phase, after the gate passes:

1. `git add -A && git commit` with a clear message summarising the phase.
2. Write a handoff note to `.buildlog/phase-<N>.md` containing: what changed (files +
   one line each), any deviation from spec and why, new tokens/classes/components
   introduced, and anything the next phase must know. Keep it under ~30 lines.
3. **Clear context:** run `/clear`.
4. **Resume:** begin the next phase by reading, in order: `docs/landing-page-spec.md`,
   then `.buildlog/phase-<N>.md` (the note you just wrote). Then proceed with that
   phase's block below.

This keeps each phase's context small and grounded only in the spec + the prior
handoff — no accumulated drift.

---

## 3. Phases

Phase 1 (art-direction lock) is done — it is the spec. Start at Phase 2.

### Phase 2 — Warm shell (repalette + rebuild rooms, looks finished with zero photos/JS)

**Foundation (one agent, sequential — owns shared files):**
- `app/globals.css` + `lib/palette.ts`: add the admittance token range and a
  per-room background variable for each of the six rooms (values in spec §3.1); keep
  `BRASS` === `--accent`. Add utility classes: mono signature (kicker/caption/triplet
  /labels), Newsreader display tiers with scale-contrast, and a brass emphasis class
  (no italics). Re-tune the `.chapter`/`.plate` room treatment for warm rooms.
- `app/layout.tsx`: swap fonts to **Newsreader** (display) + **IBM Plex Mono**
  (signature) via `next/font`; keep Inter for body. Update the CSS variables.
- Goal: with **zero JS and zero 3D**, each room already shows its correct warm base
  colour, type, and composition.

**Fan-out (parallel, AFTER foundation — one agent per file, disjoint):**
- `components/sections/Hero.tsx` (Threshold), `TheIdea.tsx` (Anteroom),
  `TheOneNumber.tsx` (Hearth), `Discretion.tsx` (The Quiet), `TheClubToCome.tsx`
  (Room to come), `Invitation.tsx` (The Book).
- Each agent: lay the room out per spec §2 (copy) + §3.1 (its background value) +
  §3.2 (type, brass emphasis, mono marks). Consume foundation classes only; **edit
  only your own component file** — do not touch `globals.css`. Keep the form logic in
  `Invitation.tsx` and the `/api/enquiry` wiring intact.
- Composition must read as "luxurious empty": confident large serif anchor,
  asymmetry, one light source/vignette, hairlines, scale contrast — never centred-in-
  a-void, never fixed by adding copy.

**Gate:** `npm run build` and `npm run lint` clean; `npm run dev` shows all six rooms
in the dark→light arc with the new type and brass emphasis, fully composed with JS
disabled; no hard-coded brand name; no banned terms (grep). Then run the §2 protocol.

### Phase 3 — Motion

Mostly sequential (shared files), with isolated pieces parallelisable.
- **Lead (sequential, owns `BodyMotion.tsx`):** the travelling-light spine (one
  scrubbed tween, background + brass glow dark→light across the whole scroll,
  interpolating the six values, on the single Lenis RAF); the "light enters first"
  open per room; the Hearth number/triplet print-in + single glow swell; the Quiet's
  near-zero motion; the Room-to-come light-line widen.
- **Hero re-light + handoff (sequential, owns `KeyCanvas`/`KeyReveal`/`Scene`/
  `Atmosphere`):** re-light the hero to warm near-black with the key **backlit**;
  start the persistent atmosphere dark as the travelling light's source; re-grade
  warm-dark; **remove the wash-to-bone** so the dark holds into the door. Preserve
  `KeyModel` geometry/material and the key's twist choreography. **Render before/after
  comparison frames and get visual sign-off before locking** (re-lighting is
  subjective). Coordinate with the spine owner so the key's backlight value is the
  first stop of the travelling-light tween.
- **Parallel (isolated):** one subagent builds the literal-door component/overlay for
  the key→Anteroom crossing (new, self-contained file; the dark parts like two
  panels). It exposes a hook the lead triggers from the timeline.
- Ship reduced-motion (static final state, final colours) and mobile (light steps +
  clip reveal, no pin) paths in the same phase.

**Gate:** build/lint clean; continuous light shift with no second RAF; hero opens
backlit-in-dark with no bone wash; door plays once; reduced-motion + 375px verified;
hero re-light signed off. Run the §2 protocol.

### Phase 4 — Imagery

- Drop warm, abstract, textural imagery behind the existing `Plate` treatment per
  room (graded to palette; never a place/partner/face). Parallelise per-component
  (disjoint) once the `Plate` image slot is confirmed by the lead.
**Gate:** images respect guardrails + degrade (no-image fallback intact); build
clean; 375px. Run the §2 protocol.

### Phase 5 — Detail + fallbacks

- **Parallel (isolated):** ambient-audio toggle component (off by default, one quiet
  toggle, remembers choice, never autoplays) — new self-contained file.
- **Lead (sequential):** no-WebGL/context-loss designed static fallback; final
  reduced-motion + mobile passes; performance (dpr cap `[1,2]`, drop under load,
  pause render offscreen, modest particles).
**Gate:** full acceptance criteria in spec §7. Run the §2 protocol (final commit; no
need to clear after the last phase).

---

## 4. Final verification (after Phase 5)

Spin a dedicated verification subagent to check the spec §7 acceptance list against
the running build, independent of the agents that wrote it: build/lint clean; the
dark→light arc and all motion gestures present; type + brass-not-italic correct;
audio off-by-default and remembered; reduced-motion and no-WebGL fallbacks composed;
375px clean; grep clean (no partner names, no hard-coded brand, no pricing); form
validation client + server. Report results, deviations, and any follow-ups.
