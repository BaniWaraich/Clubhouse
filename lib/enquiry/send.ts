/**
 * Delivery seam for accepted enquiries. This is the ONLY module that knows about
 * the email provider (Resend) — swap SMTP/nodemailer in here without touching
 * the route. Reads `RESEND_API_KEY`, `ENQUIRY_TO_EMAIL`, `ENQUIRY_FROM_EMAIL`.
 */

import { Resend } from 'resend';
import type { EnquiryPayload } from './validation';

/** Minimal HTML entity escape for user-supplied values in the email body. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** True only when every env var needed to actually send is present. */
export function isDeliveryConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY &&
      process.env.ENQUIRY_TO_EMAIL &&
      process.env.ENQUIRY_FROM_EMAIL,
  );
}

function buildBodies(p: EnquiryPayload): { html: string; text: string } {
  const message = p.message || '—';

  const text = [
    'New enquiry',
    '',
    `Name: ${p.name}`,
    `Email: ${p.email}`,
    `Referred by: ${p.referral}`,
    '',
    'Message:',
    message,
  ].join('\n');

  const html = `<!doctype html>
<html>
  <body style="font-family: ui-sans-serif, system-ui, sans-serif; color:#100b07;">
    <h2 style="margin:0 0 16px;">New enquiry</h2>
    <p><strong>Name:</strong> ${escapeHtml(p.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(p.email)}</p>
    <p><strong>Referred by:</strong> ${escapeHtml(p.referral)}</p>
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap;">${escapeHtml(message)}</p>
  </body>
</html>`;

  return { html, text };
}

/**
 * Send an accepted enquiry. Throws on provider failure so the caller can map it
 * to a 502. Assumes {@link isDeliveryConfigured} has been checked by the caller.
 */
export async function sendEnquiry(payload: EnquiryPayload): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { html, text } = buildBodies(payload);

  const { error } = await resend.emails.send({
    from: process.env.ENQUIRY_FROM_EMAIL as string,
    to: process.env.ENQUIRY_TO_EMAIL as string,
    replyTo: payload.email,
    subject: 'New enquiry',
    html,
    text,
  });

  if (error) {
    throw new Error(`Resend delivery failed: ${error.name}`);
  }
}
