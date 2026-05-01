import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feed 10 Families',
  description: 'A transparent campaign to feed 10 families in Palestine.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
