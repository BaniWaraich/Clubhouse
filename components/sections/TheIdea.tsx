import { Plate } from '@/components/ui/Plate';
import { SectionIndex } from '@/components/ui/SectionIndex';

/**
 * The Idea — the white-space thesis told as invitation, in the Pratt's /
 * 5 Hertford Street register. No superlatives, no "India's first" — the absence
 * is the point. Plate left / copy right; the high-key "light" plate.
 */
export function TheIdea() {
  return (
    <section
      id="the-idea"
      className="section section--exhale room--dark room--anteroom"
    >
      <SectionIndex numeral="I" />
      <div className="chapter chapter--left">
        <div className="chapter__media">
          <Plate variant="light" ratio="portrait" src="/img/idea.jpg" />
        </div>
        <div className="chapter__copy">
          <p className="kicker" data-copy>
            The idea
          </p>
          <p className="lead" data-copy style={{ marginTop: '2rem' }}>
            Some rooms are known by <span className="em">who is not in them</span>.
          </p>
          <p className="body-copy" data-copy style={{ marginTop: '2rem' }}>
            A membership for those who have stopped performing their wealth, and
            would simply like to be <span className="em">looked after</span>. Not a
            place you visit — a circle you <span className="em">belong</span> to.
          </p>
        </div>
      </div>
    </section>
  );
}
