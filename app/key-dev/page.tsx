import dynamic from 'next/dynamic';

// Isolated dev harness for the animated GLB key. WebGL is client-only.
const KeyDevScene = dynamic(() => import('./KeyDevScene'), { ssr: false });

export const metadata = {
  title: 'Key — dev',
  robots: { index: false, follow: false },
};

export default function KeyDevPage() {
  return (
    <>
      {/* Fixed stage holds the canvas; the scroll track below drives the reveal. */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background: '#100b07',
        }}
      >
        <KeyDevScene />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '5vh',
            transform: 'translateX(-50%)',
            font: '500 11px/1 var(--font-mono, monospace)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(232,200,121,0.55)',
          }}
        >
          Scroll to turn the key
        </div>
      </div>

      {/* Tall track gives the scrubbed reveal its scroll length (≈3.2 viewports). */}
      <div id="key-dev-track" aria-hidden style={{ height: '320vh' }} />
    </>
  );
}
