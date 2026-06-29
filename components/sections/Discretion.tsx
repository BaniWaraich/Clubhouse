import { Plate } from '@/components/ui/Plate';
import { SectionIndex } from '@/components/ui/SectionIndex';

/**
 * Discretion — the explicit operating principle. Short, declarative,
 * reassuring on the privacy of the member, the list, and the request. The
 * mostly-dark "shadow" plate (the absence) sits left and close — hold spacing
 * keeps the tension.
 */
export function Discretion() {
  return (
    <section
      id="discretion"
      className="section section--hold room--dark room--quiet"
    >
      <SectionIndex numeral="III" />
      <div className="chapter chapter--left">
        <div className="chapter__media">
          <Plate variant="shadow" ratio="square" src="/img/discretion.svg" />
        </div>
        <div className="chapter__copy">
          <p className="kicker" data-copy>
            Discretion
          </p>
          <p className="lead" data-copy style={{ marginTop: '2rem' }}>
            The list is private. The request is private. Nothing of your membership
            belongs to anyone but you.
          </p>
          <p className="body-copy" data-copy style={{ marginTop: '2rem' }}>
            Discretion is not a courtesy here — <span className="em">it is the
            product</span>.
          </p>
        </div>
      </div>
    </section>
  );
}
