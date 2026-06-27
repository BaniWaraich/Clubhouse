import { Hero } from '@/components/sections/Hero';

/**
 * Composition of sections. Currently only a placeholder Hero to prove the stack
 * (smooth scroll + scroll-linked 3D + reveals). The real single-scroll narrative
 * — The Idea → The One Number → Discretion → The Club to Come → Invitation →
 * Footer — gets built section by section after the design brainstorm.
 */
export default function Page() {
  return (
    <main>
      <Hero />
      {/* Spacer so smooth scroll + ScrollTrigger have somewhere to go.
          Remove once real sections are added. */}
      <section
        style={{
          minHeight: '100svh',
          display: 'grid',
          placeItems: 'center',
          padding: 'var(--gutter)',
        }}
      >
        <p style={{ color: 'var(--muted)', maxWidth: '40ch', textAlign: 'center' }}>
          Scaffold ready. Sections to follow.
        </p>
      </section>
    </main>
  );
}
