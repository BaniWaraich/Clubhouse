/**
 * Film-grain / noise overlay at very low opacity. Sits above everything,
 * pointer-events: none. One of the felt-but-unnamed "expensive" signals.
 * Pure CSS (SVG fractal noise data-URI) — no JS, no layout cost.
 */
const NOISE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>
       <filter id='n'>
         <feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/>
       </filter>
       <rect width='100%' height='100%' filter='url(#n)'/>
     </svg>`,
  );

export function Grain() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        backgroundImage: `url("${NOISE}")`,
        backgroundSize: '160px 160px',
        opacity: 0.04,
        mixBlendMode: 'overlay',
      }}
    />
  );
}
