import { Reveal } from '@/components/ui/Reveal';
import { SectionIndex } from '@/components/ui/SectionIndex';

/**
 * The One Number — the Day One product as a promise, not a feature list.
 * No itemized services, no hotel names. A single restrained, hairline-flanked
 * triplet (words only) is the only "detail" permitted.
 */
export function TheOneNumber() {
  return (
    <section id="the-one-number" className="section">
      <SectionIndex numeral="II" />
      <Reveal as="p" className="kicker">
        The one number
      </Reveal>
      <Reveal
        as="p"
        className="lead measure"
        delay={0.05}
        style={{ marginTop: '2rem' }}
      >
        One number, answered. A stay arranged before the call ends. A journey
        that asks nothing of you.
      </Reveal>
      <Reveal
        as="p"
        className="body-copy measure"
        delay={0.1}
        style={{ marginTop: '2rem' }}
      >
        Whatever is required, quietly arranged.
      </Reveal>

      <Reveal style={{ marginTop: 'clamp(3rem, 7vh, 5rem)' }} delay={0.05}>
        <hr className="hairline" style={{ maxWidth: '34ch' }} />
        <div className="triplet">
          <span>Stays</span>
          <span>Journeys</span>
          <span>The unspoken</span>
        </div>
        <hr
          className="hairline"
          style={{ maxWidth: '34ch', marginTop: 'clamp(2rem, 5vh, 3rem)' }}
        />
      </Reveal>
    </section>
  );
}
