import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { SmoothScrollProvider } from '@/components/providers/smooth-scroll';
import { Grain } from '@/components/ui/Grain';
import { BRAND } from '@/lib/brand';
import './globals.css';

// PLACEHOLDER type system — swap families once the register is locked.
// Fraunces (optical serif display) + Inter (neutral text) as sensible defaults.
const display = Fraunces({
  subsets: ['latin'],
  axes: ['opsz', 'SOFT', 'WONK'],
  variable: '--font-display',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <Grain />
      </body>
    </html>
  );
}
