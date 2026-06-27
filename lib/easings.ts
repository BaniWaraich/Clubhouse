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
