import { Reveal } from '@/components/ui/Reveal';
import { SectionIndex } from '@/components/ui/SectionIndex';

/**
 * The Idea — the white-space thesis told as invitation, in the Pratt's /
 * 5 Hertford Street register. No superlatives, no "India's first" — the absence
 * is the point.
 */
export function TheIdea() {
  return (
    <section id="the-idea" className="section section--exhale">
      <SectionIndex numeral="I" />
      <Reveal as="p" className="kicker">
        The idea
      </Reveal>
      <Reveal
        as="p"
        className="lead measure"
        delay={0.05}
        style={{ marginTop: '2rem' }}
      >
        Some rooms are known by who is not in them.
      </Reveal>
      <Reveal
        as="p"
        className="body-copy measure"
        delay={0.1}
        style={{ marginTop: '2rem' }}
      >
        A membership for people who have stopped performing their wealth — and
        would simply like things handled. Not a venue you visit. A circle you
        belong to.
      </Reveal>
    </section>
  );
}
