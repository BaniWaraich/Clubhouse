# Execution-Hardening Brief — Claude Code agent team

**How to use this file:** open Claude Code in the repo root and paste the block
under *"Kickoff prompt"*, or run `claude` and say *"Execute docs/execution-hardening-brief.md."*
Claude Code acts as the **integrating lead**: it spins up one subagent per
workstream (isolated git worktrees), runs A/B/C in parallel, runs D after C,
reviews each diff against the acceptance criteria, runs the verification matrix,
and commits per workstream.

---

## Context

- **Repo:** `Clubhouse` — a pre-launch, by-invitation landing page for a private
  members' club. Next.js (App Router) + TypeScript, React Three Fiber (`three`,
  `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`), GSAP
  (+ ScrollTrigger), Lenis smooth scroll. WebGL is dynamically imported
  (`ssr:false`) and never blocks first paint. Fonts via `next/font`.
- **Recent design pass (already applied — DO NOT revert):** WebGL perf gating
  (single active canvas at a time), the hero-key relight, warm-duotone plate
  imagery (originals in `public/img/original/`), legible dark-room numerals, and
  the warmed color arc. This brief is about **code execution**, not visual design.

## Global rules (every agent)

1. **Preserve the locked design + motion.** The "admittance" dark→light arc, the
   room tokens, the key choreography, and the reduced-motion / no-WebGL fallbacks
   must keep working. Never regress accessibility.
2. **Brand name stays swappable** via `lib/brand.ts` (`BRAND.name`). Never
   hard-code it.
3. **No PII in logs.** This endpoint holds the membership list.
4. **Docs are `.md`.** Do not add README files unless asked.
5. **Definition of done for every workstream:** `npx tsc --noEmit`, `npx next lint`,
   and `npx next build` all pass, and the manual checks in the *Verification
   matrix* pass. Commit with a focused message. Keep diffs small.
6. **Coordinate file ownership** (see *Parallelization*) so agents don't collide.

---

## Workstream A — Enquiry API hardening + real email delivery  *(priority)*

**Files:** `app/api/enquiry/route.ts`, `components/sections/Invitation.tsx`,
new `lib/enquiry/` (delivery + validation + rate-limit), `.env.example`,
`package.json` (add `resend`, `@upstash/ratelimit`, `@upstash/redis`).

**Goal:** turn the stub endpoint (currently `console.log` only) into a hardened,
production-ready path that emails accepted enquiries via a provider, resists
abuse, and never leaks PII.

**Do:**
1. **Boundary validation.** Reject non-`application/json` requests. Read the body
   as text and reject payloads over ~16 KB *before* `JSON.parse` (413). Trim and
   length-cap every field: `name ≤ 120`, `email ≤ 200`, `referral ≤ 120`,
   `message ≤ 2000`. Re-run the existing server-side required/email checks; return
   `422 { errors }` on failure (keep the current shape the client reads).
2. **Rate limiting.** Add `@upstash/ratelimit` + `@upstash/redis` (sliding window,
   e.g. 5 requests / 10 min / IP, keyed off `x-forwarded-for`). Return `429` when
   exceeded. Provide an **in-memory fallback** (a `Map`) when the Upstash env vars
   are absent, with a comment that it is per-instance / dev-only.
3. **Honeypot.** Add a visually-hidden, `aria-hidden`, `tabindex=-1`,
   `autocomplete="off"` decoy field (e.g. `company`) to the form. If it arrives
   non-empty, return `200 { ok: true }` **without sending** (silently drop the bot).
4. **Email delivery via Resend.** Create `lib/enquiry/send.ts` exporting
   `sendEnquiry(payload)`. Use `resend` reading `RESEND_API_KEY`, `ENQUIRY_TO_EMAIL`,
   `ENQUIRY_FROM_EMAIL` from env. Build **both** an HTML and a text body, and
   **HTML-escape every user-supplied value** (write a tiny `escapeHtml`). Keep it
   provider-agnostic: `sendEnquiry` is the only place that knows about Resend, so
   SMTP/nodemailer can be swapped in later without touching the route.
5. **Failure handling.** If `sendEnquiry` throws, return `502 { error: 'delivery' }`
   and log a **non-PII** breadcrumb only (a short request id + `hasMessage`), never
   name/email. If env is unconfigured, fall back to the existing safe behaviour
   (accept + minimal non-PII log) so local dev still works.
6. **`.env.example`** documenting `RESEND_API_KEY`, `ENQUIRY_TO_EMAIL`,
   `ENQUIRY_FROM_EMAIL`, and the optional `UPSTASH_REDIS_REST_URL` /
   `UPSTASH_REDIS_REST_TOKEN`.

**Acceptance:**
- Valid submit → email received at `ENQUIRY_TO_EMAIL`; endpoint returns `200`.
- Missing/invalid fields → `422 { errors }`; oversized body → `413`; bot honeypot
  → `200` with no email sent; over the limit → `429`; provider failure → `502`.
- Grep the code: no `console.log` of `name` or `email`. Email template escapes input.
- `tsc` / `lint` / `build` pass.

---

## Workstream B — Image delivery via `next/image`

**Files:** `components/ui/Plate.tsx` (and `app/globals.css` only if a selector
needs to follow the `<img>` → `next/image` change; `next.config.mjs` only if
required).

**Goal:** stop shipping full-res JPGs (up to 1600px / ~400 KB) as eager raw
`<img>`. Serve responsive, modern-format, lazy-loaded images with no layout shift.

**Do:**
1. Replace the raw `<img className="plate__media">` with `next/image` using `fill`,
   `className="plate__media"`, `style={{ objectFit: 'cover' }}`, and
   `sizes="(min-width: 60rem) 40vw, 90vw"` (matches the 12-col plate width).
2. Keep the `.plate__treatment`, `.plate__grain`, `.plate__edge`, the feather mask,
   and the `aspect-ratio` box **exactly** — the treatment must still lie over the
   photo and there must be **no CLS**.
3. Leave images **lazy** (they sit below the 320vh key-track, so none is the LCP
   element — do **not** set `priority`). Confirm Next's optimizer emits AVIF/WebP.
4. Keep `alt` decorative (`''` / `aria-hidden`) as today — the copy carries meaning.

**Acceptance:** plates render pixel-identical; network shows responsive
AVIF/WebP served at display size and lazy-loaded below the fold; no CLS; reduced-
motion + no-WebGL unaffected; `tsc` / `lint` / `build` pass.

---

## Workstream C — De-fragilize the WebGL / scroll lifecycle (constants + DRY)

**Files:** new `lib/scene.ts` (or `lib/scroll-constants.ts`), new `lib/webgl.ts`,
`components/three/KeyReveal.tsx`, `components/three/Canvas3D.tsx`,
`components/three/Scene.tsx`.

**Goal:** the 320vh key-track height and the `4.2` / `2.8` viewport scroll-gates
are independent literals in different files; changing one silently desyncs the
gating. Centralize them, and de-duplicate the WebGL feature-detect.

**Do:**
1. Export named constants from one module: `KEY_TRACK_VH = 320`, and the derived
   gate thresholds (e.g. `KEY_IDLE_AFTER_VH` = 4.2, `ATMOSPHERE_ACTIVE_AFTER_VH`
   = 2.8) with comments tying them to the track. `KeyReveal` reads
   `` `${KEY_TRACK_VH}vh` `` for the track height; `KeyReveal` and `Canvas3D` read
   the same threshold constants instead of hard-coded numbers.
2. Move `hasWebGL()` into `lib/webgl.ts`; import it in `KeyReveal` and `Scene`;
   delete both local copies.

**Acceptance:** runtime behaviour identical to before; a single constant controls
the track + both gates; exactly one `hasWebGL` implementation; `tsc` / `lint` /
`build` pass.

---

## Workstream D — Robustness, a11y, cleanup  *(run after C)*

**Files:** `components/ui/AmbientAudio.tsx`, `components/ui/SplitText.tsx`,
`app/layout.tsx`, and *(optional)* a new `lib/useScrollY.ts` hook.

**Do:**
1. Remove the dead `prefersReducedMotion` import that is only `void`-ed in
   `AmbientAudio`.
2. `SplitText`: add `aria-hidden` to the inner split spans so the visible
   characters aren't double-announced alongside the wrapper's `aria-label`
   (screen readers should read the phrase once).
3. Add `themeColor` (the dark open, `#100b07`) and a proper `viewport` export to
   `app/layout.tsx` metadata so mobile browser chrome doesn't flash white.
4. *(Optional, only if clean)* Consolidate the four passive scroll listeners
   (`SiteHeader`, `HeroMark`, `KeyReveal` gate, `Canvas3D` gate) behind one
   `useScrollY` subscriber hook — a single listener, many subscribers. Skip if it
   risks the gating; correctness beats tidiness.

**Acceptance:** no dead code; screen reader announces the masthead once; no white
flash on mobile; `tsc` / `lint` / `build` pass.

---

## Parallelization & merge order

- **A, B, C run in parallel** — their file sets are disjoint (A: api/route +
  Invitation + lib/enquiry; B: Plate; C: three/* + lib/scene + lib/webgl).
- **D runs after C** — its optional `useScrollY` refactor touches the same
  `KeyReveal` / `Canvas3D` that C centralizes; sequencing avoids a merge conflict.
- Each agent works in its own worktree/branch, self-verifies, and opens a PR. The
  lead reviews against acceptance criteria and integrates in order: **C → D**, with
  **A** and **B** merged independently.

## Verification matrix (all must pass before "done")

| Check | How |
|---|---|
| Types | `npx tsc --noEmit` |
| Lint | `npx next lint` |
| Build | `npx next build` |
| Reduced motion | `prefers-reduced-motion: reduce` → static composed page, no errors |
| No WebGL | force-fail WebGL → designed posters, page reachable |
| Mobile | narrow viewport → no pins, native scroll, plates lazy/responsive |
| Enquiry happy path | valid submit → email received, `200` |
| Enquiry guards | invalid `422`, oversized `413`, honeypot `200`+no-send, rate-limit `429`, provider-down `502` |
| Privacy | no `name`/`email` in any log sink |

## Definition of done

All four workstreams merged, the verification matrix green, `.env.example`
committed, and a one-paragraph note in the PR describing the new env vars
(`RESEND_API_KEY`, `ENQUIRY_TO_EMAIL`, `ENQUIRY_FROM_EMAIL`, optional Upstash).

---

## Kickoff prompt (paste into Claude Code)

> You are the integrating lead for a hardening pass on this repo. Read
> `docs/execution-hardening-brief.md`. Spin up one subagent per workstream (A, B,
> C, D) in isolated git worktrees. Run A, B, and C in parallel; run D after C.
> Enforce the Global rules on every agent. For each workstream, implement the
> steps, meet the Acceptance criteria, and run the full Verification matrix
> (`tsc --noEmit`, `next lint`, `next build`, plus the manual reduced-motion /
> no-WebGL / mobile / enquiry checks). Email delivery uses **Resend** behind the
> `sendEnquiry` seam, reading keys from env — add `.env.example`, don't commit
> secrets. Review each agent's diff against its acceptance criteria before
> integrating; merge order C → D, with A and B independent. Commit per workstream
> with focused messages and summarize the new env vars at the end.
