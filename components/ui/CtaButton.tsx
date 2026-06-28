'use client';

import { MagneticButton } from './MagneticButton';
import { scrollToId } from '@/lib/scroll';

/** The hero CTA — magnetic, anchors to the Invitation section. */
export function CtaButton({ label, target }: { label: string; target: string }) {
  return (
    <MagneticButton className="cta" onClick={() => scrollToId(target)}>
      <span className="cta__label">{label}</span>
    </MagneticButton>
  );
}
