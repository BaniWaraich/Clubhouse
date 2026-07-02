import type { Metadata, Viewport } from 'next';
import { Newsreader, Inter, IBM_Plex_Mono } from 'next/font/google';
import { SmoothScrollProvider } from '@/components/providers/smooth-scroll';
import { Grain } from '@/components/ui/Grain';
import { Cursor } from '@/components/ui/Cursor';
import { BRAND } from '@/lib/brand';
import './globals.css';

// Locked type system (spec §3.2): Newsreader (editorial display serif, optical
// sizing) for the big room statements; IBM Plex Mono as the signature voice for
// every small mark (kickers, captions, the triplet, labels, the number); Inter
// for running body text.
const display = Newsreader({
  subsets: ['latin'],
  style: ['normal'],
  variable: '--font-display',
  display: 'swap',
  // Newsreader ships no automatic fallback metrics; Georgia (the CSS stack
  // fallback) is a close enough serif that we opt out of the override rather
  // than emit a build-time warning.
  adjustFontFallback: false,
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: BRAND.name,
  description: BRAND.tagline,
  robots: { index: false, follow: false }, // pre-launch: keep out of search
};

// The admittance arc opens in the dark room; matching the browser chrome to
// that near-black avoids a white flash of the mobile address bar on load.
export const viewport: Viewport = {
  themeColor: '#100b07',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <Grain />
        <Cursor />
      </body>
    </html>
  );
}
