import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Signpost — context-aware Linux troubleshooting',
  description: 'Stop copy-pasting Linux fixes for somebody else’s system.',
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
