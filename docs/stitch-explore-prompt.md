# Google Stitch — Story / Scrollytelling Exploration Prompt

> The site should feel like a **story you unlock**: it opens on a key, and as you
> scroll the key turns and the door opens — you are being let in. Secrecy, luxury,
> ambitious motion and 3D throughout.
>
> **Stitch makes static screens**, so it will design the **key beats** of this story
> (a storyboard — one screen per beat). The scroll choreography / animation /
> WebGL described here is the intent for the code build (`docs/build-brief.md`);
> treat each beat as a frozen frame of a cinematic sequence. Generate each beat,
> then read them as a sequence.
>
> (Our committed "execute" direction still lives in `docs/stitch-design-prompt.md`.
> This file is for exploring the ambitious, narrative version.)

---

## The story (the spine — keep this)

A first-time visitor doesn't land on a webpage; they arrive at a threshold. The
experience unfolds as a sequence of revelations, each earned by scrolling:

1. **The Key.** Darkness, then a single object catches the light — an ornate brass
   key, suspended, slowly rotating. Almost nothing else. A faint instruction to
   begin (e.g. "Scroll to enter"). The whole brand in one held breath.
2. **The Turn.** As you scroll, the key moves to a keyhole and turns. Light begins
   to bleed through from the other side. Tension and anticipation.
3. **The Door Opens.** The door swings / dissolves and warm light floods in. The
   brand name is revealed for the first time, as if engraved over the entrance:
   **Sodalis**. This is the moment of being let in.
4. **The Threshold — The Idea.** You've crossed over. Calm, warm interior light.
   The first words explain, obliquely, what this place is: a private circle for
   those who no longer need to be seen.
5. **The One Number.** The single promise at the heart of it — one number,
   answered; anything handled — revealed with quiet drama.
6. **Discretion.** The deepest, most private room. Darker, hushed. Discretion is
   the product, made explicit.
7. **In Time, A Place.** A distant, dreamlike hint that a physical club will come —
   glimpsed, never shown.
8. **The Invitation.** The story resolves into a single quiet gesture: request an
   introduction. A minimal form. You may ask to be let in for real.

Each beat should feel like turning a page in something rare. Movement between beats
is slow, deliberate, cinematic — the user is being guided, not browsing.

---

## Master prompt (paste into Stitch — Web, one beat at a time)

Design one beat of an immersive, cinematic, scroll-told story for an ultra-exclusive,
by-invitation private members' club called "Sodalis." The whole website is a single
narrative journey about being secretly let in: it opens on a key, the key turns as
you scroll, a door opens, and you are admitted into a private world. This is
high-end, mysterious, and ambitiously art-directed — like the title sequence of a
film or the opening of a luxury fragrance campaign, NOT a normal website. Be bold
with depth, dimensionality, lighting and atmosphere; make it feel three-dimensional
and alive even as a still frame.

Design THIS beat: **[paste one beat from "The story" above — e.g. "The Key:
darkness with a single ornate brass key suspended in a shaft of light, slowly
rotating, a faint 'Scroll to enter' hint, almost nothing else"]**.

Hold these true across every beat:
- Mysterious, discreet, expensive, quiet, powerful — being let in on a secret.
- Strong sense of depth, light and material (brass, glass, stone, warm light,
  shadow). It should feel like a real space / real objects, lit beautifully.
- Restraint and negative space over decoration. Very few words on screen.
- The only call to action, and only at the end, is requesting an introduction —
  never "sign up," "buy," pricing, tiers, amenity lists, or stock photos of people.
- Confident, characterful typography; commit to the choices.

Make a desktop frame and a matching mobile frame for this beat.

---

## Suggested look per beat (so the storyboard hangs together)

- **Beats 1–3 (Key → Turn → Door):** dark, nocturnal, cinematic. Near-black,
  brass and warm light as the only color, deep shadow, a single hero object lit
  like a jewel. Maximum mystery.
- **Beats 4–5 (Idea → One Number):** the warm interior. Light floods in — switch
  to warm bone / candlelight tones, brass accents, generous serif type, vast space.
- **Beat 6 (Discretion):** pull back into shadow — the private inner room. Darker
  again, hushed, almost nothing on screen.
- **Beat 7 (In Time):** dreamlike and distant — soft focus, a faint suggestion of a
  landscape or a building, never literal.
- **Beat 8 (Invitation):** calm, resolved, warm. A quiet minimal form, underline
  fields only, one understated "Request an introduction" action.

Single accent throughout: **muted brass / gold**, used as light and metal, never as
flat fills behind text. Typography: an elegant high-contrast serif for the few big
moments (the name, the key lines), a clean understated sans for small labels.

---

## Motion intent (for the code build, not Stitch — but informs the framing)

- The key rotates and drifts at rest; on scroll it travels to the keyhole and turns.
- The door opening is the hero transition — light wipe + camera push **through** the
  doorway into the interior. The camera keeps moving forward through the whole story,
  so scrolling feels like walking deeper inside.
- Between beats: slow cross-dissolves, parallax depth, text mask reveals, long eases.
  Nothing fast or bouncy. Generous, inevitable, expensive.
- 3D carries the narrative: a real key (brass, engraved) → a door/threshold →
  volumetric interior light → a darker private chamber. Color-graded to the palette.
- Always degrade gracefully (reduced motion = a beautiful static frame of each beat;
  no-WebGL = designed posters). Frame each Stitch beat so it would also work as that
  static poster.

---

## Exploration knobs — change ONE per run for range

- **The unlocking object:** a brass key · a wax seal that breaks · an envelope that
  opens · a monogrammed signet ring pressed into the screen.
- **The threshold:** a heavy door · a velvet curtain parting · a gate · a vault.
- **Overall temperature:** fully nocturnal throughout · dark-to-warm journey
  (recommended) · warm and candlelit throughout.
- **Type register:** enormous engraved serif · restrained modern sans with tiny
  labels · the wordmark as an embossed metal seal.
- **Density:** extreme minimalism, one idea per screen · richer, more layered depth.

## Tips

- Generate each beat separately, then line them up to read the story top-to-bottom.
- If a beat feels templated: "less website, more film title sequence / luxury
  campaign; remove anything that looks like a startup."
- Keep the strongest 2–3 beats and we'll feed them to Claude Code with
  `docs/build-brief.md` to build the real scroll-driven, animated version.
