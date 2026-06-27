# Art Direction Reference

The three default registers. The skill ranges across all of these and picks per
brief. Each is a complete look — type, color, space, motion, and the role 3D
plays. Treat the values as strong starting points, not rigid law; adapt to the
brand, but keep the *discipline* of each register intact.

---

## 1. Brutalist editorial

Huge type, stark grids, monochrome plus one accent. Confident, magazine-like,
slightly raw. Reads as expensive through scale and restraint, not polish.

- **Type:** A heavy grotesk display (e.g. Neue Haas Grotesk, Söhne, Suisse Int'l,
  or free: Space Grotesk, Archivo Expanded) at very large sizes with tight
  tracking. Text in a clean neutral sans. One signature move: an oversized
  masthead that nearly bleeds the viewport.
- **Palette:** Paper/off-white base (`#F4F2EC`), near-black ink (`#111`), one
  saturated accent (electric blue, vermilion, or acid green). No gradients on type.
- **Space & grid:** Asymmetric editorial grid. Big margins, deliberate empty
  columns, hard left alignment, baseline rhythm. Rules/hairlines to divide.
- **Motion:** Sharp but eased — text mask reveals that wipe up fast then settle
  (`cubic-bezier(0.16, 1, 0.3, 1)`), horizontal scroll sections, sticky pinned
  type. Minimal but precise.
- **3D role:** A single hard-surface or material object (a sculpted glyph, a
  monolith, a draped cloth) in flat studio lighting; or kinetic typography
  extruded into 3D. The 3D feels like a printed object photographed, not a game asset.

## 2. Luxe minimal

Generous whitespace, serif display, slow cinematic motion. Quiet money. Fashion,
hospitality, high-end product. The most "expensive" register through sheer calm.

- **Type:** A refined display serif (e.g. Canela, GT Sectra, Ogg, or free:
  Fraunces with optical sizing, or Playfair Display used sparingly) for headings;
  a humanist sans or clean serif for text. Hanging punctuation, ligatures, wide
  leading.
- **Palette:** Warm neutrals — bone, sand, taupe, ink. At most one muted accent
  (deep bordeaux, forest, ochre). Soft, never high-contrast harsh.
- **Space & grid:** Maximum negative space. Content sits in a narrow, centered
  or offset measure. Slow vertical rhythm; sections breathe.
- **Motion:** Very slow, long eases (`cubic-bezier(0.22, 1, 0.36, 1)`, durations
  0.8–1.6s). Cross-fades, gentle parallax, image clip-path reveals that unmask
  upward. Lenis tuned to a heavier, more inertial feel.
- **3D role:** A beautifully lit material study — frosted glass, liquid, silk,
  marble, a product hero — with HDRI environment lighting, soft contact shadows,
  subtle fresnel and bloom, and a graded, filmic look. Movement is languid and
  scroll-coupled. This is where R3F + drei (`Environment`, `MeshTransmissionMaterial`,
  `ContactShadows`, `Float`) shines.

## 3. Dark immersive

Moody, glassy, glowing WebGL, particles. Tech, music, crypto-adjacent, creative
studios. Expensive through atmosphere and depth.

- **Type:** A precise neo-grotesk or mono (e.g. Söhne, GT America, or free:
  Inter tightened, JetBrains Mono for accents). Small caps and letterspaced
  kicker labels. Type often glows faintly or sits behind/within the 3D.
- **Palette:** Near-black base (`#0A0A0B`), low-saturation surfaces, one or two
  luminous accents (cyan, magenta, ultraviolet) used as *light*, not fills.
- **Space & grid:** Dense but ordered. Glassmorphic panels, hairline borders at
  low opacity, layered depth (true z-depth via 3D, not just shadows).
- **Motion:** Fluid and continuous — ambient drift even at rest, scroll that
  pushes the camera through space, particles reacting to pointer. Eases stay
  smooth (`cubic-bezier(0.4, 0, 0.2, 1)`), nothing snappy.
- **3D role:** The atmosphere itself — particle fields, volumetric fog, a
  shader-driven form, postprocessing (bloom, chromatic aberration, vignette,
  noise via `@react-three/postprocessing`). Camera moves on scroll. The 3D is
  the page, type floats within it.

---

## The "expensive" detail checklist

Apply across all registers. These are the felt-but-unnamed signals:

- **Custom easings**, never CSS `ease`/`ease-in-out` defaults. Keep them in
  `lib/easings.ts`.
- **Smooth scroll** (Lenis) tuned to the register's weight.
- **Text mask reveals** — lines clipped, revealed on scroll with stagger.
- **Image reveals** via `clip-path` unmasking, not just fade.
- **Film grain / noise** overlay at very low opacity (`mix-blend-mode: overlay`).
- **Custom cursor** and/or **magnetic interactive elements** (buttons, links
  that lerp toward the pointer).
- **Optical detail in type** — tracking adjusted per size, hanging punctuation,
  ligatures, `text-wrap: balance` on headings.
- **Consistent corner/edge language** — commit to sharp or to one soft radius;
  don't mix arbitrarily.
- **Loading state with intent** — a designed preloader (count-up, mask wipe)
  that covers asset/3D load, not a spinner.
- **Color grading on 3D** so it shares the page's palette — never raw
  default-lit WebGL colors against a designed layout.

## Anti-patterns (the "cheap" tells)

- Bouncy/elastic easing, fast default transitions.
- Many fonts, many accent colors, gradients on everything.
- Centered everything with equal padding; no real grid.
- A spinning logo or generic cube as the "3D."
- Drop shadows doing the work that real depth/lighting should do.
- Crowding: no room to breathe around the hero or between sections.
- Raw default-lit Three.js material colors clashing with the designed palette.
