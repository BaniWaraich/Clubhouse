# Google Stitch — Design Prompt

> Stitch produces static, high-fidelity UI mockups (web), not WebGL/motion. This
> prompt translates our "warm room" 3D atmosphere into a **designed static haze**
> Stitch can render, and asks for the visual layer only (type, grid, space, color).
> Use the motion/3D from `docs/build-brief.md` when implementing in code.
>
> **How to use:** New project → Web. Paste the prompt below. If it truncates,
> generate **section by section** (each numbered block is a self-contained screen).
> Theme: Light. Then iterate ("more negative space", "make the masthead larger",
> "calmer").

---

## Master prompt (paste into Stitch)

Design a high-end, by-invitation landing page for a private members' club — a
single long-scroll desktop web page. The aesthetic is **quiet luxury, luxe-minimal,
warm and restrained** — think Pratt's and 5 Hertford Street, the opposite of a
loud startup. Sell restraint and absence. Vast negative space, a narrow column of
text offset to the left, almost nothing on screen at once. The confidence is in
how little it does. No stock lifestyle photography, no icons, no feature grids, no
buttons everywhere.

**Color palette (use exactly):**
- Background: warm bone paper `#F3EFE6`
- Text: warm near-black `#1A1714` (never pure black)
- Secondary text: taupe `#8A8275`
- Single accent: muted brass `#A8843E` — used ONLY as thin hairlines, small
  marks, and as soft glow in the background. Never as a fill or button color
  behind text.

**Background treatment (the signature):** a soft, out-of-focus, warm golden
atmospheric haze — like late candlelight or sun through dust, drifting across the
bone paper. Very subtle, low-contrast, large and blurred, concentrated upper-right
and fading to plain bone. It is light, not an object. Text always sits on calm,
legible bone — the haze never crowds it.

**Typography:**
- Headings: a refined high-contrast serif display (Fraunces, or similar elegant
  serif), large to oversized, tight letter-spacing, normal weight.
- Body: a clean neutral sans (Inter), generous line height, comfortable size.
- Kicker labels above each section: tiny UPPERCASE sans, wide letter-spacing
  (0.3em), taupe color, preceded by a short 1px brass horizontal rule.
- Use hanging punctuation and balanced headings.

**Layout system:** an editorial grid with intentional asymmetry — content in a
narrow measure (~38 characters wide) offset from a large left margin, lots of empty
space to the right. Thin brass/charcoal hairline rules separate sections. In the
empty right field of each section, a very faint, oversized, ultra-thin Roman
numeral (I, II, III…) at ~5% opacity as a quiet index. No cards, no boxes, no
shadows.

**Sections, top to bottom:**

1. HERO — full viewport height. A faint, enormous ultra-thin serif letter "S"
   filling the right half at ~6% opacity. Lower-left: kicker "BY INVITATION", then
   an oversized serif masthead reading **Sodalis**, then a serif line "A private
   membership. One number." Below it a single understated outline link-button
   (thin hairline border, uppercase tiny sans label) reading "Request an
   introduction". Warm haze behind everything.

2. THE IDEA — kicker "THE IDEA". A large serif lead line in a narrow left column:
   "Some rooms are known by who is not in them." Below, one short sans paragraph:
   "A membership for people who have stopped performing their wealth — and would
   simply like things handled." Vast empty space around it. Faint numeral "I".

3. THE ONE NUMBER — kicker "THE ONE NUMBER". Serif lead: "One number, answered."
   A short sans paragraph: "A stay arranged before the call ends. A journey that
   asks nothing of you. Whatever is required, quietly arranged." Below, a single
   restrained row of three serif words separated by small brass dots:
   "Stays · Journeys · The unspoken". Faint numeral "II".

4. DISCRETION — kicker "DISCRETION". Serif lead in a narrow column: "Discretion is
   not a courtesy here. It is the product." Short sans paragraph: "The list is
   private. The request is private. Nothing about your membership is for anyone but
   you." Faint numeral "III".

5. THE CLUB TO COME — kicker "IN TIME". A single centered or offset serif line with
   enormous surrounding space: "In time, a place. For now, a number that always
   answers." Nothing else. Faint numeral "IV".

6. INVITATION — kicker "REQUEST AN INTRODUCTION". Serif heading: "Request an
   introduction." A quiet, minimal form: underline-only fields (no boxes), labels
   in tiny uppercase taupe sans — Full name, Email, "The member who referred you",
   and an optional Message. A single understated outline submit button reading
   "Submit request". No pricing, no membership tiers. Generous spacing between
   fields. Faint numeral "V".

7. FOOTER — bare and quiet on bone: the serif wordmark "Sodalis" small, a one-line
   legal note "Registered in Himachal Pradesh, India", a tiny "Privacy" link, and
   "© 2026". A thin brass hairline above. Nothing else.

**Mood words:** discreet, hushed, expensive, unhurried, confident, old-world,
restrained. **Avoid:** bright colors, gradients on text, drop shadows, rounded
cards, emojis, icons, photography of people or buildings, anything that looks like
a SaaS template.

Also generate a **mobile** version: same palette and type, single column, the
masthead still large, the haze lighter, the faint numerals smaller, the form
full-width with underline fields.

---

## Hard constraints (keep if you edit the prompt)

- Never name hotel partners (Taj/IHCL, ITC, Oberoi).
- No restaurant / venue / amenity content.
- No pricing, no membership tiers/levels.
- "Sodalis" is a working name — swap the word if the name changes.
- Brass is light/hairline only, never a fill behind text (keeps AA contrast).
