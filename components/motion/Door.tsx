'use client';

/**
 * The literal door (spec §3.3) — two near-black panels that part horizontally
 * exactly once, at the crossing from the key into the Anteroom. Reserved for
 * this single moment so it keeps its weight.
 *
 * This component renders only the inert markup; BodyMotion owns the motion — it
 * sets `--door-display` to `block`, then drives `--door` (0 → 1, the parting)
 * and `--door-seam` (the brass seam of light growing then splitting) off the
 * same scroll that hands the key over to the Anteroom. Under reduced-motion /
 * no-JS the door stays `display:none` (default) so the page never hides behind
 * an un-openable panel.
 */
export function Door() {
  return (
    <div className="door" aria-hidden>
      <span className="door__seam" />
      <span className="door__panel door__panel--l" />
      <span className="door__panel door__panel--r" />
    </div>
  );
}
