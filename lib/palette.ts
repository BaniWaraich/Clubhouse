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

/**
 * The admittance arc (spec §3.1) — the warm dark→light range the page is graded
 * through. Centralised here so Phase 3's travelling-light tween interpolates the
 * exact same six room values the CSS rooms paint statically. These do NOT feed
 * the key material (that stays `PALETTE.brass` === `--accent`); they are the
 * background field the key is lit against.
 */
export const ADMITTANCE = {
  paper: '#f6f5f1', // warm light base (top of arc & The Book)
  warmInk: '#1a1714', // text on light (never pure black)
  taupe: '#8a8275', // secondary text on light
  candle: '#14100b', // deepest warm-dark base
  brassGlow: '#d8ae57', // glow/emphasis marks on dark
  brassGlowHi: '#e8c879', // brighter emphasis on dark (text)
  offWhite: '#e4dac8', // text on dark
  offWhiteHi: '#ede5d6', // brighter text on dark
} as const;

/** Per-room background values, in scroll order — the travelling-light stops. */
export const ROOM_BG = {
  threshold: '#100b07',
  anteroom: '#19120b',
  hearth: '#251a10',
  quiet: '#322617',
  ajar: '#b89b68', // The Room Not Yet Built — a warm honey-brass mid (door ajar: light arriving as brass, not grey taupe)
  book: '#f3f1ea',
} as const;

export type Admittance = typeof ADMITTANCE;
export type RoomBg = typeof ROOM_BG;
