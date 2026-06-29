import { SectionIndex } from '@/components/ui/SectionIndex';

/**
 * The Club to Come — Phase 2 as a vague tease only. No region, no renderings,
 * no dates. One restrained line, centred, with a thin line of light that widens
 * beneath it (the door left ajar — spec §3.3). No full-bleed plate: the room is
 * deliberately near-empty, carried by the travelling light, not a panel.
 */
export function TheClubToCome() {
  return (
    <section
      id="the-club-to-come"
      className="section section--exhale room--ajar"
    >
      <SectionIndex numeral="IV" />
      <div className="ajar">
        <p className="kicker" data-copy>
          In time
        </p>
        <p className="lead ajar__lead" data-copy style={{ marginTop: '2rem' }}>
          In time, a place. For now, a number that always answers.
        </p>
        {/* the thin line of light — BodyMotion widens it via --ajar-open */}
        <span className="ajar__line" aria-hidden />
      </div>
    </section>
  );
}
