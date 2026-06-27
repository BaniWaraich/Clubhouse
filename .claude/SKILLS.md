# Skills Registry

Project-local skills live in `.claude/skills/`. Read this registry at the start of
a session and before any non-trivial task. Activate any skill whose trigger
conditions match the request, then read that skill's `SKILL.md` before proceeding.

| Skill | Location | Activate when... |
|-------|----------|------------------|
| `editorial-3d-web` | `.claude/skills/editorial-3d-web/` | Building or art-directing any page/section/hero that should look premium, expensive, editorial, award-winning, cinematic, or "not templated" — and especially anything involving 3D / WebGL / Three.js / React Three Fiber / scroll animation / immersive motion. This is the primary skill for the Clubhouse landing page. Do NOT use for plain CRUD UI, dashboards, or when the user wants something deliberately simple/minimal-effort. |

## Workflow note for `editorial-3d-web`

1. Establish art direction first (register, type, palette, 3D concept, motion) —
   see `.claude/skills/editorial-3d-web/references/art-direction.md`.
2. Read `.claude/skills/editorial-3d-web/references/stack-patterns.md` before
   writing the Lenis / GSAP / R3F layer — the integration wiring is easy to get
   subtly wrong.
3. Build layers top-down: type+grid+space → motion → 3D → detail layer.
4. Always include `prefers-reduced-motion` and no-WebGL fallbacks.
