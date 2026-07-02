/**
 * Server-side validation + normalisation for the gated Invitation enquiry.
 * Kept framework-agnostic so the route stays thin. Field length caps guard the
 * downstream email template and keep payloads sane.
 */

export const LIMITS = {
  name: 120,
  email: 200,
  referral: 120,
  message: 2000,
} as const;

/** Max raw request body, in bytes, before we even attempt JSON.parse. */
export const MAX_BODY_BYTES = 16 * 1024; // ~16 KB

export type EnquiryInput = {
  name?: unknown;
  email?: unknown;
  referral?: unknown;
  message?: unknown;
  /** honeypot — must be empty for a real human submission */
  company?: unknown;
};

export type EnquiryPayload = {
  name: string;
  email: string;
  referral: string;
  message: string;
};

const asString = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

const isEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/** True when the honeypot field arrived with any content — i.e. a bot. */
export const isHoneypotTripped = (input: EnquiryInput): boolean =>
  typeof input.company === 'string' && input.company.trim().length > 0;

export type ValidationResult =
  | { ok: true; payload: EnquiryPayload }
  | { ok: false; errors: Record<string, string> };

/**
 * Trim, length-cap, and validate. Returns the normalised payload or the same
 * `{ errors }` shape the client already reads (`required` / `invalid`).
 */
export function validateEnquiry(input: EnquiryInput): ValidationResult {
  const name = asString(input.name).slice(0, LIMITS.name);
  const email = asString(input.email).slice(0, LIMITS.email);
  const referral = asString(input.referral).slice(0, LIMITS.referral);
  const message = asString(input.message).slice(0, LIMITS.message);

  const errors: Record<string, string> = {};
  if (!name) errors.name = 'required';
  if (!email || !isEmail(email)) errors.email = 'invalid';
  if (!referral) errors.referral = 'required';

  if (Object.keys(errors).length) return { ok: false, errors };

  return { ok: true, payload: { name, email, referral, message } };
}
