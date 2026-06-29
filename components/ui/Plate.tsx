/**
 * Plate — a treated media plate for the editorial chapters.
 *
 * Phase 1: renders the graded gradient placeholder only (no images, no network).
 * The duotone ramp, grain, and hairline edge all live in CSS (.plate--{variant}
 * in globals.css). The props anticipate later phases so chapters never relayout:
 *
 *   - `src`  is reserved for Phase 2 (next/image slots into .plate__media, behind
 *            the .plate__treatment layer — the same shadow→highlight ramp lies
 *            over the real photograph).
 *   - `alt`  is decorative by default (''); a meaningful value comes with `src`.
 *
 * No motion. Static by design — Phase 3 adds the clip-path / parallax reveals.
 */
type PlateProps = {
  variant: 'light' | 'shaft' | 'shadow' | 'air'; // gradient mood per chapter
  ratio?: 'portrait' | 'square' | 'landscape' | 'wide'; // aspect-ratio
  src?: string; // unused in Phase 1; reserved for Phase 2 next/image
  alt?: string; // decorative by default ('')
  className?: string;
  bleed?: boolean; // true = full-bleed (only TheClubToCome uses this)
};

export function Plate({
  variant,
  ratio = 'portrait',
  src,
  alt = '',
  className,
  bleed = false,
}: PlateProps) {
  const classes = [
    'plate',
    `plate--${variant}`,
    `plate--${ratio}`,
    src ? 'plate--media' : '', // treatment becomes a grading veil over the image
    bleed ? 'plate--bleed' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <figure className={classes} aria-hidden={!alt}>
      {/* Phase 2: this becomes next/image, behind the treatment. The raw <img>
          is never rendered in Phase 1 (src is always undefined); the lint rule
          is disabled here so the forward-compatible slot can stay in place. */}
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="plate__media" src={src} alt={alt} />
      ) : null}
      <div className="plate__treatment" />
      <div className="plate__grain" />
      <div className="plate__edge" />
    </figure>
  );
}
