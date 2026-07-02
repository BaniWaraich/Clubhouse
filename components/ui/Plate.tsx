import Image from 'next/image';

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
  src?: string; // when set, rendered via next/image into .plate__media
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
      {/* next/image behind the treatment: responsive, modern-format (AVIF/WebP),
          lazy by default. `fill` needs the positioned, sized .plate aspect-ratio
          box as its ancestor (position:relative) so there is no CLS. Left lazy —
          plates sit below the 320vh key-track, so none is the LCP element. The
          .plate__media CSS (feather mask, cover) still lies under .plate__treatment. */}
      {src ? (
        <Image
          className="plate__media"
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 60rem) 40vw, 90vw"
          style={{ objectFit: 'cover' }}
        />
      ) : null}
      <div className="plate__treatment" />
      <div className="plate__grain" />
      <div className="plate__edge" />
    </figure>
  );
}
