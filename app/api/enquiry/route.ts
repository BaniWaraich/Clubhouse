import { NextResponse } from 'next/server';
import {
  MAX_BODY_BYTES,
  isHoneypotTripped,
  validateEnquiry,
  type EnquiryInput,
} from '@/lib/enquiry/validation';
import { checkRateLimit } from '@/lib/enquiry/rate-limit';
import { isDeliveryConfigured, sendEnquiry } from '@/lib/enquiry/send';

/**
 * Enquiry endpoint for the gated Invitation form. Hardened path:
 * boundary validation → rate limit → honeypot → validation → email delivery.
 *
 * PRIVACY: this endpoint holds the membership list. NEVER log name/email or any
 * other PII. Breadcrumbs are limited to a short request id + non-identifying
 * flags so failures stay debuggable without leaking who enquired.
 */

/** Short, non-PII correlation id for log breadcrumbs. */
const requestId = () => Math.random().toString(36).slice(2, 10);

const clientIp = (request: Request): string => {
  const fwd = request.headers.get('x-forwarded-for');
  return fwd?.split(',')[0]?.trim() || 'unknown';
};

export async function POST(request: Request) {
  const rid = requestId();

  // 1. Boundary: content-type must be JSON.
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return NextResponse.json({ error: 'Unsupported media type.' }, { status: 415 });
  }

  // 2. Rate limit (before parsing the body — cheap defence first).
  const { success } = await checkRateLimit(clientIp(request));
  if (!success) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  // 3. Read as text and size-cap BEFORE JSON.parse.
  const raw = await request.text();
  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload too large.' }, { status: 413 });
  }

  let input: EnquiryInput;
  try {
    input = JSON.parse(raw) as EnquiryInput;
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // 4. Honeypot: silently accept bots without sending anything.
  if (isHoneypotTripped(input)) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // 5. Validate + normalise (keeps the client's `{ errors }` shape).
  const result = validateEnquiry(input);
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 422 });
  }

  const { payload } = result;

  // 6. Delivery. If unconfigured, fall back to safe accept (local dev).
  if (!isDeliveryConfigured()) {
    console.log('[enquiry] accepted (delivery unconfigured)', {
      rid,
      hasMessage: payload.message.length > 0,
    });
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  try {
    await sendEnquiry(payload);
  } catch {
    // Non-PII breadcrumb only — never name/email.
    console.error('[enquiry] delivery failed', {
      rid,
      hasMessage: payload.message.length > 0,
    });
    return NextResponse.json({ error: 'delivery' }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
