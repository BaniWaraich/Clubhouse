import { SplitText } from '@/components/ui/SplitText';
import { CtaButton } from '@/components/ui/CtaButton';
import { HeroMark } from '@/components/ui/HeroMark';
import { BRAND } from '@/lib/brand';

/**
 * Hero — the warm room behind an oversized serif masthead set in a narrow,
 * offset measure with a lot of air. Keep `id="hero"`; ScrollTrigger references it.
 */
export function Hero() {
  return (
    <section id="hero" className="hero room--dark room--threshold">
      {/* oversized, ultra-light initial that fills the right half and
          parallaxes on scroll — pure type, no canvas */}
      <HeroMark char={BRAND.name.charAt(0)} />

      <div className="hero__content">
        {/* the refrain opens here and closes at the invitation (spec §2) */}
        <p className="refrain">You are expected.</p>
        <h1 className="hero__masthead">
          <SplitText start="top 95%">{BRAND.name}</SplitText>
        </h1>
        <p className="hero__tagline">{BRAND.tagline}</p>
        <CtaButton label="Request an introduction" target="invitation" />
      </div>
    </section>
  );
}
