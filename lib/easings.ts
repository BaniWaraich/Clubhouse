/**
 * The project's easing curves, in one place. Use these everywhere instead of
 * CSS `ease` / `ease-in-out` defaults — a shared curve across components is a
 * big part of why a site feels authored rather than assembled.
 */
export const ease = {
  expo: [0.16, 1, 0.3, 1], // brutalist editorial reveals — wipe fast, settle
  luxe: [0.22, 1, 0.36, 1], // luxe-minimal — slow & long
  smooth: [0.4, 0, 0.2, 1], // dark-immersive — continuous
} as const;

/** CSS cubic-bezier() strings for use in stylesheets / inline styles. */
export const cssEase = {
  expo: "cubic-bezier(0.16, 1, 0.3, 1)",
  luxe: "cubic-bezier(0.22, 1, 0.36, 1)",
  smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

export type EaseName = keyof typeof ease;

/* ------------------------------------------------------------------ */
/* Numeric easing — for scroll/3D choreography (not CSS)               */
/* ------------------------------------------------------------------ */

/** Clamp to [0,1]. */
export const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);

/**
 * Smootherstep (Ken Perlin's 6t⁵−15t⁴+10t³): zero velocity AND zero
 * acceleration at both ends, so phases hand off with no snap. Preferred over
 * smoothstep for the key choreography because the C2 continuity removes the
 * subtle "kick" you feel at phase boundaries.
 */
export const smoother = (x: number): number => {
  const t = clamp01(x);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

/**
 * Remap `x` from [a,b] → [0,1] (clamped) then smoother-ease it. Used to slice a
 * single scroll progress into eased, overlapping phases with continuous
 * velocity at the seams.
 */
export const phase = (x: number, a: number, b: number): number =>
  smoother((x - a) / (b - a));

/**
 * Framerate-INDEPENDENT exponential lerp. `k` is the responsiveness (higher =
 * snappier); the half-life is ln(2)/k seconds. Identical smoothing at 30, 60 or
 * 144fps — unlike a fixed `delta*c` factor, which speeds up as FPS drops.
 */
export const damp = (
  current: number,
  target: number,
  k: number,
  delta: number,
): number => current + (target - current) * (1 - Math.exp(-k * delta));
