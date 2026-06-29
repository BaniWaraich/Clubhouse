# Clubhouse — Landing Page Spec

> Single source of truth for the landing page. Self-contained: everything needed to
> build is here. Working brand name is **Sodalis** (provisional) and lives only in
> `lib/brand.ts` — never hard-code it. Repo positioning lives in `CLAUDE.md`; this
> spec governs the design and build.

---

## 1. What this is

A pre-launch, by-invitation landing page for a **concierge-first, pre-property**
private members' club. The Day One product is a single hotline — the **One Number**
— that an invited inner circle calls for negotiated five-star stays, travel, and
lifestyle requests. A physical club comes later (Phase 2), teased only vaguely.

**Positioning:** discretion as the product, not an amenity. Reference points are
Pratt's and 5 Hertford Street — warm, dark-wood, candlelit, intimate — never Soho
House / Quorum. We earn richness through warmth, light, texture, motion, and voice,
**never** by showing a building, partner, member, or amenity.

---

## 2. The story (the spine)

The site is a journey of being quietly admitted into a circle you are important
enough to belong to. The product is **belonging**; the One Number is its *proof*,
never the hero. We do not sell "getting things done" (that commoditises us into a
concierge app) and we do not sell the future building (banned, and dishonest).

- **Point of view:** the site is the narrator; *you* are the invited member being
  let in. The voice is low and hospitable — a maître d' who already knows your name.
  Never boastful.
- **Arc:** noise → quiet → belonging. You enter to leave the performance of wealth
  behind; each room turns the volume down, until the only sound is one number that
  always answers — and then you're asked to stay.
- **Refrain:** *"You are expected."* — opens at the key, closes at the invitation.
- **The rooms are chambers of feeling, not architecture.** They are atmospheres of
  warm light, never renderings of a future clubhouse.

### The six rooms (copy)

Emphasis is rendered in **brass + letter-spacing**, never italics. Small marks
(kickers, captions, the triplet, the number) are set in mono.

| # | Room (section) | Kicker | Copy |
|---|---|---|---|
| 1 | **Threshold** (Hero / key) | — | The key turns. Masthead = `{BRAND.name}`. Refrain mark: *You are expected.* |
| 2 | **Anteroom** (The Idea) | The idea | "Some rooms are known by **who is not in them**." → "A membership for those who have stopped performing their wealth, and would simply like to be **looked after**. Not a place you visit — a circle you **belong** to." |
| 3 | **Hearth** (The One Number) | The one number | "One number. It answers in a voice that **already knows yours**." → "A stay arranged before the call ends. A journey that asks nothing of you. Whatever is needed, **handled** before it becomes a worry." Triplet (mono): Stays · Journeys · The unspoken. |
| 4 | **The Quiet** (Discretion) | Discretion | "The list is private. The request is private. Nothing of your membership belongs to anyone but you." → "Discretion is not a courtesy here — **it is the product**." |
| 5 | **The Room Not Yet Built** (The Club to Come) | In time | "In time, a place. For now, a number that always answers." |
| 6 | **The Book** (Invitation) | Request an introduction | "Members extend introductions personally." Success: "Thank you. If there is a place for you, you will hear from us." Close mark: *You are expected.* |

---

## 3. Art direction

### 3.1 Colour — "the admittance" (dark → light)

Light follows the story. You arrive in near-black at the **backlit key** (light
comes from behind and through the key — the dramatic, sacred opening, and the source
the whole page is lit from). The background **lightens room by room**, but the
warm-dark is **held through the intimate middle** (Hearth, The Quiet keep their
candlelit hush); real light arrives **late** — the door ajar, then full warm light
at the invitation, where belonging = light = home.

**Core tokens** (centralise in `:root` / `lib/palette.ts`; keep `BRASS` === `--accent`):

| Token | Value | Use |
|---|---|---|
| Paper white | `#F6F5F1` | warm light base (top of arc & The Book) |
| Warm ink | `#1A1714` | text on light (never pure black) |
| Taupe muted | `#8A8275` | secondary text on light |
| Candle dark | `#14100B` | deepest warm-dark base |
| Brass | `#A8843E` | `--accent`; light/small marks on light |
| Brass glow | `#D8AE57` / `#E8C879` | glow/emphasis on dark |
| Warm off-white | `#E4DAC8` / `#EDE5D6` | text on dark |

**Per-room background (the travelling-light values, interpolated — see §3.3):**

`Threshold #100B07` → `Anteroom #19120B` → `Hearth #251A10` → `The Quiet #322617` →
`Room to come #8F7A5A` → `The Book #F3F1EA`.

**Emptiness must read as luxurious, not incomplete** — earned through craft, not
words: confident large serif as the anchor; intentional asymmetry on a real grid
(never centred-in-a-void); actual material (paper grain, one soft warm light
source/vignette, hairlines); dramatic scale contrast. Empty + flat = unfinished;
empty + textured + composed = luxurious. We never fix sparseness by adding copy.

### 3.2 Typography

Replaces the placeholder Fraunces + Inter. The default luxury-serif-plus-italics
look is deliberately avoided.

- **Display — Newsreader** (`next/font`, optical sizing): the big room statements.
  Editorial serif with character; warm-club, not the generic tell.
- **Signature voice — IBM Plex Mono** (`next/font`): every small mark — kickers,
  captions, the triplet, form labels, and the number itself. Mono reads as a private
  line / ledger / dossier, tied to the One Number.
- **Body — Inter** (keep): running text.
- **Emphasis — brass colour + letter-spacing, never italic.** On dark, emphasis is
  `#E8C879`; on light, `#A8843E`.
- Dramatic scale jumps (large serif display vs small tracked mono caps); tight
  negative tracking on display that loosens as size drops; `text-wrap: balance` on
  headings; ligatures + kerning on.

### 3.3 Motion

Build on the existing `BodyMotion` orchestrator: one instance, the single Lenis RAF,
per-chapter pinned timeline with clip-path unmask + scale-settle + copy stagger +
layer parallax. Keep that vocabulary. **No second RAF loop.**

- **Spine — one travelling light.** A single scroll-scrubbed tween drives the page
  background + brass glow from near-black → warm light across the entire scroll,
  interpolating the six room values. Motion is continuous and never dies between
  rooms; the backlit key is the source the page is lit from as it recedes.
- **Signature open — "the light enters first."** As you scroll into a room, its warm
  vignette blooms out of the dark *before* the words resolve into it. You feel the
  room illuminate as you cross in.
- **Per-room accents:**
  - *Threshold → Anteroom:* retune the handoff — the key's backlight *becomes* the
    Anteroom's light (seamless dark, **no wash to bone**). The crossing rides the
    travelling light and "light enters first" alone — no literal door.
  - *Hearth:* the mono triplet and the number **print in** (dial / type line by
    line); the brass glow swells once. The only "loud" motion on the page.
  - *The Quiet:* near-zero motion. Stillness *is* the gesture; the room holds its
    breath.
  - *Room to come:* a thin line of light **widens** — the door left ajar.
  - *The Book:* light fully arrived; the form rises calmly, settled.
- **Always-on:** slow ambient drift on light + grain so nothing is frozen; existing
  intra-room parallax retained.
- **Degradation:** `prefers-reduced-motion` → no choreography; rooms render in their
  final composed state with their final colours (a clean static document). Mobile
  (< 60rem) → no pin/scrub; light steps per section + clip reveal; native scroll feel
  preserved.

### 3.4 Ambient audio

**In.** A discreet warm ambient track, **off by default**, a single quiet toggle
that **remembers the user's choice**. Never autoplays. Respects reduced-motion as a
sensible default-off signal.

---

## 4. Hard constraints (do not violate)

- Never name hotel partners (Taj/IHCL, ITC, Oberoi) anywhere.
- No restaurant / venue / amenity content; no lifestyle stock; no faces/members.
  (Exception by owner decision, Phase 4: `The Idea` uses a dark club-interior
  still — see `public/img/PLACEHOLDERS.md` / `.buildlog/phase-4.md`. The other
  plates remain object still-lifes.)
- No public pricing, tiers, or membership levels. CTA is always "Request an
  introduction," gated, with a referral field. The friction is the point.
- Phase 2 stays a vague tease — no region, renderings, or dates.
- Brand name, tagline, and registered region are read from `BRAND` (`lib/brand.ts`)
  — never hard-coded. Copy stays name-agnostic.
- Any imagery later must be warm, abstract, textural, graded to palette — never a
  place.

---

## 5. Technical

- **Stack:** Next.js (App Router) + TypeScript, React Three Fiber, GSAP +
  ScrollTrigger, Lenis. WebGL dynamically imported (`ssr: false`), never blocks first
  paint. Lenis owns the RAF and drives ScrollTrigger. Fonts via `next/font`.
- **Hero key — preserved vs. changed.** *Preserved:* the key's 3D model/geometry,
  its brass material identity (`BRASS` === `--accent`), and its twist/turn scroll
  choreography — we do not change what the key is or how it moves. *Changed for the
  admittance opening:* the scene starts in warm near-black (not bone) with the key
  **backlit** (light from behind/through it); the persistent `Scene`/`Atmosphere`
  starts dark and becomes the source the travelling light grows from; the scene is
  re-graded warm-dark; and the handoff **drops the wash-to-bone** — the dark holds
  into the Anteroom (the key's backlight becomes the Anteroom's light), carried by
  the travelling light alone. This touches `KeyCanvas` (lighting rig / environment / tone
  mapping / bloom), `KeyReveal` (background field, remove the bone wash, handoff,
  hint colours), and `Scene` + `Atmosphere` (dark background + glow). `KeyModel`
  geometry and material identity stay. Re-lighting is subjective → **visual sign-off
  gate** before it's locked.
- **Repalette:** extend `:root` / `lib/palette.ts` with the warm-dark room range;
  keep `BRASS` provably equal to `--accent`. The body shifts from the current bone
  base into the admittance arc.
- **Degradation:** reduced-motion → native scroll, static graded frame, page fully
  composed. No-WebGL / context-loss → designed warm static fallback, never a blank
  canvas.
- **Performance:** cap `dpr` at `[1, 2]`, drop under load via `PerformanceMonitor`;
  pause the render loop when the hero is offscreen; modest particle count. Target
  60fps mid-tier laptop, 30fps+ mid-tier mobile; test at 375px.
- **Accessibility:** one `<h1>` (the masthead); real heading order; `focus-visible`
  states; AA contrast on all content (brass is for marks/light only, never body
  text); labelled form fields; decorative 3D and the audio control properly
  labelled / `aria-hidden` as appropriate.

---

## 6. Build phasing

1. **Art-direction lock** — this doc. ✔
2. **Warm shell** — repalette tokens + rebuild the six rooms as full-bleed warm
   rooms using gradient/texture placeholders; swap in the new type. Looks finished
   with zero photos.
3. **Motion** — the travelling-light spine, "light enters first," the Hearth number
   print-in, the Quiet's stillness; retune the key handoff.
4. **Imagery** — drop warm, abstract photography behind the existing treatment.
5. **Detail + fallbacks** — ambient-audio toggle, reduced-motion / mobile passes,
   performance.

---

## 7. Acceptance criteria

- `npm run build` passes with no type or ESLint errors.
- Full scroll renders the dark → light admittance arc: backlit key, warm-dark held
  through the Hearth and the Quiet, light arriving at the door-ajar and full at The
  Book.
- The key→Anteroom crossing is carried by the travelling light alone (no literal
  door); "light enters first" on every room; the number prints in at the Hearth;
  the Quiet is near-still.
- Type is Newsreader + IBM Plex Mono with brass (not italic) emphasis; no italics
  used for emphasis anywhere.
- Ambient audio is off by default, toggles, and remembers the choice.
- Reduce-motion: native scroll, no animation, static composed page with final
  colours. No-WebGL: designed static fallback, no blank box.
- 375px: legible, breathing layout; reduced 3D cost; no horizontal scroll.
- Grep clean: no hotel-partner names, no hard-coded brand name, no pricing/tiers.
- Form: client + server validation, accessible labels, discreet success state.
