import type { Metadata } from 'next';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Privacy — ${BRAND.name}`,
  robots: { index: false, follow: false },
};

/** Stub privacy page — kept spare and on-register. */
export default function PrivacyPage() {
  return (
    <main className="section" style={{ maxWidth: '60ch', marginInline: 'auto' }}>
      <p className="kicker">Privacy</p>
      <h1 className="lead" style={{ marginTop: '2rem' }}>
        Your privacy is the point.
      </h1>
      <p className="body-copy" style={{ marginTop: '2rem' }}>
        {BRAND.name} collects only what an introduction requires — your name, a
        means of reply, and the member who referred you. We do not sell, share,
        or publish it. The list is private; your enquiry is private.
      </p>
      <p className="body-copy" style={{ marginTop: '1.4rem' }}>
        For any question about the information we hold, write to us and we will
        answer in kind.
      </p>
      <p style={{ marginTop: '3rem' }}>
        <a href="/" style={{ color: 'var(--accent)' }}>
          Return
        </a>
      </p>
    </main>
  );
}
