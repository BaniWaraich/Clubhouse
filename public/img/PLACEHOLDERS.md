# Chapter imagery — Phase 4

Three rooms carry a treated media plate. Each holds a **generated, warm, abstract
texture** (smoke / silk in the candlelit register) graded to the palette — never
a place, partner, or face (a hard guardrail). They are passed to `<Plate src>`,
which sits behind the duotone treatment veil (`.plate--media .plate__treatment`)
and the grain; each plate reserves its aspect-ratio, so swapping assets causes
**no relayout**.

| File                | Chapter        | Plate variant / ratio |
| ------------------- | -------------- | --------------------- |
| `idea.svg`          | The Idea       | light / portrait      |
| `one-number.svg`    | The One Number | shaft / portrait      |
| `discretion.svg`    | Discretion     | shadow / square       |

The textures are inline-filter SVGs (feTurbulence-based smoke + warm gradients),
deterministic and tiny — no binaries, no network. To swap in real **abstract**
photography later, drop a file here and point the room's `<Plate src>` at it; the
treatment + grain + edge feather grade it to the room automatically.

The Club to Come and the Invitation use no plate (a thin line of light / a
hairline framing only).
