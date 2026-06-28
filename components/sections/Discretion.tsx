import { Reveal } from '@/components/ui/Reveal';
import { SectionIndex } from '@/components/ui/SectionIndex';

/**
 * Discretion — the explicit operating principle. Short, declarative,
 * reassuring on the privacy of the member, the list, and the request.
 */
export function Discretion() {
  return (
    <section id="discretion" className="section section--hold">
      <SectionIndex numeral="III" />
      <Reveal as="p" className="kicker">
        Discretion
      </Reveal>
      <Reveal
        as="p"
        className="lead measure"
        delay={0.05}
        style={{ marginTop: '2rem' }}
      >
        The list is private. The request is private. Nothing about your
        membership is for anyone but you.
      </Reveal>
      <Reveal
        as="p"
        className="body-copy measure"
        delay={0.1}
        style={{ marginTop: '2rem' }}
      >
        Discretion is not a courtesy here — it is the product.
      </Reveal>
    </section>
  );
}
