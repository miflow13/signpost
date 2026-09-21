import type {Metadata} from 'next';
import {IBM_Plex_Mono, Inter, Source_Serif_4} from 'next/font/google';
import './globals.css';

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const serif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-serif',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Signpost — context-aware Linux troubleshooting',
  description: 'Stop copy-pasting Linux fixes for somebody else’s system.',
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
