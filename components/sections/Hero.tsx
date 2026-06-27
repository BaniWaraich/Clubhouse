import { Scene } from '@/components/three/Scene';
import { SplitText } from '@/components/ui/SplitText';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { BRAND } from '@/lib/brand';

/**
 * PLACEHOLDER hero — wiring demo only (Scene + scroll-linked id, mask reveal,
 * magnetic CTA). Real art direction, copy, and layout come from the design
 * brainstorm. Keep the `id="hero"` — ScrollTrigger references it.
 */
export function Hero() {
  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: 'var(--gutter)',
        paddingBottom: 'clamp(2rem, 8vh, 6rem)',
        overflow: 'hidden',
      }}
    >
      {/* signature 3D, behind the type */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Scene />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '20ch' }}>
        <p
          style={{
            fontSize: '0.75rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: '1.5rem',
          }}
        >
          By invitation
        </p>
        <h1 style={{ fontSize: 'clamp(3rem, 11vw, 9rem)' }}>
          <SplitText>{BRAND.name}</SplitText>
        </h1>
        <p
          style={{
            marginTop: '1.5rem',
            fontSize: 'clamp(1rem, 2vw, 1.35rem)',
            color: 'var(--ink)',
            maxWidth: '32ch',
          }}
        >
          {BRAND.tagline}
        </p>
        <div style={{ marginTop: '2.5rem' }}>
          <MagneticButton
            className="cta"
            // eslint-disable-next-line @typescript-eslint/no-empty-function
          >
            <span
              style={{
                display: 'inline-block',
                padding: '0.9rem 1.75rem',
                border: '1px solid var(--hairline)',
                borderRadius: 0,
                fontSize: '0.8rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              Request an introduction
            </span>
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
