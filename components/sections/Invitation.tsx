'use client';

import { useState } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { SectionIndex } from '@/components/ui/SectionIndex';

type Fields = {
  name: string;
  email: string;
  referral: string;
  message: string;
};

type Errors = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = { name: '', email: '', referral: '', message: '' };

function validate(values: Fields): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = 'Please tell us your name.';
  if (!values.email.trim()) {
    errors.email = 'An email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Please check this email address.';
  }
  if (!values.referral.trim()) {
    errors.referral = 'An introduction comes through a member.';
  }
  return errors;
}

/**
 * Invitation — the only interactive section. A quiet, gated enquiry: name,
 * email, the referring member, and an optional message. No pricing, no tiers,
 * no "apply." The friction is the point. On success, a discreet acknowledgment
 * replaces the form in place — never a marketing confirmation.
 */
export function Invitation() {
  const [values, setValues] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const update =
    (field: keyof Fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setStatus('sending');
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section id="invitation" className="section section--hold room--book">
      <SectionIndex numeral="V" />
      {/* a restrained light hairline framing the invitation — no heavy plate
          here; the form is the subject and is left entirely as-is (#fields,
          validation, and /api/enquiry wiring untouched) */}
      <Reveal style={{ marginBottom: 'clamp(1.25rem, 3vh, 1.75rem)' }}>
        <hr className="hairline" style={{ maxWidth: '34ch' }} />
      </Reveal>
      <Reveal as="p" className="kicker">
        Request an introduction
      </Reveal>

      {/* a brief framing line so the act feels privileged, not procedural (#10) */}
      <Reveal
        as="p"
        className="subhead measure"
        delay={0.05}
        style={{ marginTop: '1.25rem' }}
      >
        Members extend introductions personally.
      </Reveal>

      {status === 'done' ? (
        <Reveal as="p" className="form__ack" delay={0.05} style={{ marginTop: '2rem' }}>
          Thank you. If there is a place for you, you will hear from us.
        </Reveal>
      ) : (
        <Reveal delay={0.05}>
          <form className="form" onSubmit={onSubmit} noValidate>
            <div className="field" data-invalid={!!errors.name}>
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={update('name')}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <span id="name-error" className="field__error" role="alert">
                  {errors.name}
                </span>
              )}
            </div>

            <div className="field" data-invalid={!!errors.email}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={update('email')}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <span id="email-error" className="field__error" role="alert">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="field" data-invalid={!!errors.referral}>
              <label htmlFor="referral">The member who referred you</label>
              <input
                id="referral"
                name="referral"
                type="text"
                value={values.referral}
                onChange={update('referral')}
                aria-invalid={!!errors.referral}
                aria-describedby={errors.referral ? 'referral-error' : undefined}
              />
              {errors.referral && (
                <span id="referral-error" className="field__error" role="alert">
                  {errors.referral}
                </span>
              )}
            </div>

            <div className="field">
              <label htmlFor="message">A message, if you wish (optional)</label>
              <textarea
                id="message"
                name="message"
                rows={2}
                value={values.message}
                onChange={update('message')}
              />
            </div>

            <button type="submit" className="cta" disabled={status === 'sending'}>
              <span className="cta__label">
                {status === 'sending' ? 'Sending…' : 'Request an introduction'}
              </span>
            </button>

            {status === 'error' && (
              <p className="field__error" role="alert" style={{ marginTop: '1.25rem' }}>
                Something interrupted us. Please try again in a moment.
              </p>
            )}
          </form>
        </Reveal>
      )}

      {/* the refrain closes the journey where it opened at the key (spec §2) */}
      <Reveal
        as="p"
        className="refrain"
        delay={0.1}
        style={{ marginTop: 'clamp(2rem, 4vh, 3rem)' }}
      >
        You are expected.
      </Reveal>
    </section>
  );
}
