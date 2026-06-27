/**
 * Single source of truth for the brand name.
 *
 * The name is NOT final. Frontrunner is "Sodalis" (Latin: a companion admitted
 * to a fellowship). Alternatives on the table: Solus, Meridian, Aurum.
 *
 * Swap `name` here only — never hard-code the brand name in components or copy.
 */
export const BRAND = {
  /** WORKING TITLE — not final. Change in this one place to rebrand. */
  name: "Sodalis",
  /** Set true while the name is provisional; lets UI show a quiet marker if desired. */
  nameIsProvisional: true,
  tagline: "A private membership. One number.",
  /** Compliance: registered address region (kept vague publicly). */
  registeredRegion: "Himachal Pradesh, India",
} as const;

export type Brand = typeof BRAND;
