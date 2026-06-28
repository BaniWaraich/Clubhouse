import { Reveal } from '@/components/ui/Reveal';
import { SectionIndex } from '@/components/ui/SectionIndex';

/**
 * The Club to Come — Phase 2 as a vague tease only. No region, no renderings,
 * no dates. One restrained line.
 */
export function TheClubToCome() {
  return (
    <section id="the-club-to-come" className="section section--exhale">
      <SectionIndex numeral="IV" />
      <Reveal as="p" className="kicker">
        In time
      </Reveal>
      <Reveal
        as="p"
        className="lead measure"
        delay={0.05}
        style={{ marginTop: '2rem' }}
      >
        In time, a place. For now, a number that always answers.
      </Reveal>
    </section>
  );
}
