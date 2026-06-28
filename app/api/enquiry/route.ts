import { NextResponse } from 'next/server';

/**
 * Enquiry endpoint for the gated Invitation form. Validates server-side and,
 * for now, logs and returns 200. No third-party integration yet.
 *
 * TODO: route accepted enquiries to their real destination (e.g. a private
 * inbox / CRM / encrypted store). Keep it discreet — this is the membership
 * list. Do not log PII to a shared/observable sink in production.
 */

type Payload = {
  name?: unknown;
  email?: unknown;
  referral?: unknown;
  message?: unknown;
};

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0;

const isEmail = (v: unknown): v is string =>
  typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const errors: Record<string, string> = {};
  if (!isNonEmptyString(body.name)) errors.name = 'required';
  if (!isEmail(body.email)) errors.email = 'invalid';
  if (!isNonEmptyString(body.referral)) errors.referral = 'required';

  if (Object.keys(errors).length) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  // TODO: replace this log with the real, private destination.
  console.log('[enquiry] received', {
    name: String(body.name).trim(),
    email: String(body.email).trim(),
    referral: String(body.referral).trim(),
    hasMessage: isNonEmptyString(body.message),
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
