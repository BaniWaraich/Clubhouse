/**
 * Scene / scroll-lifecycle constants.
 *
 * The entrance key-track height and the two viewport-multiple scroll gates used
 * to live as bare literals in different files, so changing one silently desynced
 * the gating. They are centralized here: the track length is the single source
 * of truth, and both gates are expressed as multiples of the viewport tied to it.
 */

/**
 * Height of the invisible #key-track (in `vh`) that gives the scrubbed brass-key
 * reveal its scroll length. `KeyReveal` renders the track at `${KEY_TRACK_VH}vh`.
 * A 320vh track ≈ 3.2 viewports of scroll for the full turn + pass-through.
 */
export const KEY_TRACK_VH = 320;

/**
 * The atmosphere canvas (`Canvas3D`) idles until the entrance has essentially
 * scrolled away and the rooms are on screen. Expressed in viewport heights:
 * ~2.8 viewports puts it near the end of the 320vh (≈3.2vh) track, so the warm
 * room only starts rendering as the key stage clears — never behind it.
 */
export const ATMOSPHERE_ACTIVE_AFTER_VH = 2.8;

/**
 * The key canvas (`KeyReveal`) pauses its render loop once the entrance is well
 * offscreen. Expressed in viewport heights: ~4.2 viewports gives a one-viewport
 * buffer past the 320vh (≈3.2vh) track, so it idles only after the threshold has
 * fully scrolled away (and resumes if the visitor scrolls back up).
 */
export const KEY_IDLE_AFTER_VH = 4.2;
