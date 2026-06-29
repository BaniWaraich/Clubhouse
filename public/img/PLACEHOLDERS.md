# Chapter imagery — Phase 2

This directory is intentionally empty in Phase 1 (the chapters render graded
CSS-gradient placeholders via `<Plate>`; no binaries are committed).

Phase 2 drops the real photographs here and passes their paths to `<Plate src>`
(wired through `next/image`, behind the existing duotone treatment layer). Each
plate already reserves its aspect-ratio, so adding the images causes **no
relayout**.

Expected filenames (one per chapter):

| File             | Chapter        | Plate variant / ratio |
| ---------------- | -------------- | --------------------- |
| `idea.jpg`       | The Idea       | light / portrait      |
| `one-number.jpg` | The One Number | shaft / portrait      |
| `discretion.jpg` | Discretion     | shadow / square       |
| `club.jpg`       | The Club to Come | air / wide (bleed)  |

The Invitation section uses no photograph (a hairline framing element only).
