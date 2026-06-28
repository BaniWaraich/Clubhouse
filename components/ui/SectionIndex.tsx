/**
 * One scale moment per section: an oversized, ultra-light Roman numeral set
 * faintly into the section's right field. Gives each restrained section a single
 * point of scale contrast and activates the otherwise-dead right half — without
 * adding colour, copy, or noise. Decorative only.
 */
export function SectionIndex({ numeral }: { numeral: string }) {
  return (
    <span className="section__index" aria-hidden>
      {numeral}
    </span>
  );
}
