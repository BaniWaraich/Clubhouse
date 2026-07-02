import { SiteHeader } from '@/components/ui/SiteHeader';
import { AmbientAudio } from '@/components/ui/AmbientAudio';
import { Scene } from '@/components/three/Scene';
import { KeyReveal } from '@/components/three/KeyReveal';
import { Hero } from '@/components/sections/Hero';
import { TheIdea } from '@/components/sections/TheIdea';
import { TheOneNumber } from '@/components/sections/TheOneNumber';
import { Discretion } from '@/components/sections/Discretion';
import { TheClubToCome } from '@/components/sections/TheClubToCome';
import { Invitation } from '@/components/sections/Invitation';
import { Footer } from '@/components/sections/Footer';
import { BodyMotion } from '@/components/motion/BodyMotion';

/**
 * The single immersive scroll:
 * Hero → The Idea → The One Number → Discretion → The Club to Come →
 * Invitation (gated) → Footer.
 */
export default function Page() {
  return (
    <>
      {/* The travelling light (spec §3.3) — one continuous fixed background the
          spine tween drives near-black → warm light across the whole scroll.
          Sits behind everything; opaque rooms cover it when motion is off. */}
      <div className="spine" aria-hidden />

      {/* The warm room — a single persistent atmosphere behind the whole scroll,
          not just the hero. Fixed, above the spine and below content; the warm
          haze, motes and brass glow ride over the travelling light. */}
      <div className="site-atmosphere" aria-hidden>
        <Scene />
      </div>

      {/* The entrance: a scroll-scrubbed brass-key reveal that plays over the
          bone field, then washes to bone and hands off to the site below. Its
          tall scroll track sits in normal flow above <main>, so the site simply
          follows it down the page. */}
      <KeyReveal />

      <SiteHeader />
      <AmbientAudio />
      <main>
        <Hero />
        <TheIdea />
        <TheOneNumber />
        <Discretion />
        <TheClubToCome />
        <Invitation />
      </main>
      <Footer />

      {/* The admittance spine — travelling light, light-enters-first per room,
          the Hearth glow swell + triplet print-in, the Quiet's stillness, the
          Room-to-come light-line widen, and the door trigger. Reads existing DOM,
          rides the single Lenis RAF, and gates reduced-motion / mobile itself. */}
      <BodyMotion />
    </>
  );
}
