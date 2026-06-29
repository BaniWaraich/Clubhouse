import { Plate } from '@/components/ui/Plate';
import { SectionIndex } from '@/components/ui/SectionIndex';

/**
 * The Club to Come — Phase 2 as a vague tease only. No region, no renderings,
 * no dates. One restrained line. The single cinematic breath: a full-bleed,
 * hazy "air" landscape plate with the copy centered beneath it.
 */
export function TheClubToCome() {
  return (
    <section
      id="the-club-to-come"
      className="section section--exhale room--ajar"
    >
      <SectionIndex numeral="IV" />
      <div className="chapter chapter--bleed">
        <div className="chapter__media">
          <Plate variant="air" ratio="wide" bleed />
        </div>
        <div className="chapter__copy">
          <p className="kicker" data-copy>
            In time
          </p>
          <p className="lead" data-copy style={{ marginTop: '2rem' }}>
            In time, a place. For now, a number that always answers.
          </p>
        </div>
      </div>
    </section>
  );
}
