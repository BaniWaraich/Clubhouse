import { SiteHeader } from '@/components/ui/SiteHeader';
import { Scene } from '@/components/three/Scene';
import { KeyReveal } from '@/components/three/KeyReveal';
import { Hero } from '@/components/sections/Hero';
import { TheIdea } from '@/components/sections/TheIdea';
import { TheOneNumber } from '@/components/sections/TheOneNumber';
import { Discretion } from '@/components/sections/Discretion';
import { TheClubToCome } from '@/components/sections/TheClubToCome';
import { Invitation } from '@/components/sections/Invitation';
import { Footer } from '@/components/sections/Footer';

/**
 * The single immersive scroll:
 * Hero → The Idea → The One Number → Discretion → The Club to Come →
 * Invitation (gated) → Footer.
 */
export default function Page() {
  return (
    <>
      {/* The warm room — a single persistent atmosphere behind the whole scroll,
          not just the hero. Fixed, behind all content; the light and motes carry
          down the page so it never collapses into flat paper below the fold. */}
      <div className="site-atmosphere" aria-hidden>
        <Scene />
      </div>

      {/* The entrance: a scroll-scrubbed brass-key reveal that plays over the
          bone field, then washes to bone and hands off to the site below. Its
          tall scroll track sits in normal flow above <main>, so the site simply
          follows it down the page. */}
      <KeyReveal />

      <SiteHeader />
      <main>
        <Hero />
        <TheIdea />
        <TheOneNumber />
        <Discretion />
        <TheClubToCome />
        <Invitation />
      </main>
      <Footer />

      {/* Phase 2 (warm shell) renders as a clean static document — no body
          choreography. The previous BodyMotion was tuned for the old bone layout
          (pinned chapters + clip-path pre-hides) and glitched against this shell
          (text overlap, jumpy pins). Phase 3 rebuilds motion fresh as the
          "admittance" spine (travelling light, light-enters-first, the door) and
          remounts here. components/motion/BodyMotion.tsx is kept for that rewrite. */}
    </>
  );
}
