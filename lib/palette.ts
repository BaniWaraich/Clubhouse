/**
 * Single source of truth for the brass palette shared between the CSS accent
 * (`--accent` in app/globals.css) and the WebGL key/atmosphere.
 *
 * `BRASS` MUST equal `--accent` so the rendered key and every CSS brass mark are
 * provably the same hue (remediation #13). Light hues are tints/shades of that
 * same brass rather than arbitrary golds, so the warm room reads as one material.
 *
 * Consumed by KeyModel/KeyCanvas/Atmosphere in place of locally hard-coded
 * colours. Keep these values in sync with `:root` if `--accent` ever changes.
 */
export const PALETTE = {
  /** === --accent (#a8843e). The brass the key is cast from. */
  brass: '#a8843e',
  /** warm champagne highlight — a lifted tint of brass for key lights/streaks */
  brassWarm: '#fff3df',
  /** cool bone rim — a desaturated cool used to separate the key from the field */
  rimCool: '#dfe6ff',
  /** the bone paper base (= --base) — backdrops/reflections read as warm paper */
  base: '#f3efe6',
  /** lifted brass glow for the atmosphere haze (shade of brass, not arbitrary) */
  glow: '#bf9550',
} as const;

export type Palette = typeof PALETTE;
