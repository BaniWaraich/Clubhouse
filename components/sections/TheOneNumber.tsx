import { Plate } from '@/components/ui/Plate';
import { SectionIndex } from '@/components/ui/SectionIndex';

/**
 * The One Number — the Day One product as a promise, not a feature list.
 * No itemized services, no hotel names. A single restrained, hairline-flanked
 * triplet (words only) is the only "detail" permitted. Copy left / plate right;
 * the dark "shaft" plate with its single brass shaft of light.
 */
export function TheOneNumber() {
  return (
    <section id="the-one-number" className="section room--dark room--hearth">
      <SectionIndex numeral="II" />
      <div className="chapter chapter--right">
        <div className="chapter__copy">
          <p className="kicker" data-copy>
            The one number
          </p>
          <p className="lead" data-copy style={{ marginTop: '2rem' }}>
            One number. It answers in a voice that{' '}
            <span className="em">already knows yours</span>.
          </p>
          <p className="body-copy" data-copy style={{ marginTop: '2rem' }}>
            A stay arranged before the call ends. A journey that asks nothing of
            you. Whatever is needed, <span className="em">handled</span> before it
            becomes a worry.
          </p>

          <div data-copy style={{ marginTop: 'clamp(3rem, 7vh, 5rem)' }}>
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
          </div>
        </div>
        <div className="chapter__media">
          <Plate variant="shaft" ratio="portrait" />
        </div>
      </div>
    </section>
  );
}
