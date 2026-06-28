import { BRAND } from '@/lib/brand';

/** Bare footer — wordmark, a legal entity line, a Privacy link, copyright. */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <p className="footer__wordmark">{BRAND.name}</p>
      <div className="footer__meta">
        <p>
          A private membership. Registered in {BRAND.registeredRegion}.
        </p>
        <p>
          <a href="/privacy">Privacy</a> · © {year}
        </p>
      </div>
    </footer>
  );
}
