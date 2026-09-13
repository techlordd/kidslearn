import './globals.css';
import Providers from './providers';
import { BottomNav } from '@/components/Shell';

export const metadata = {
  title: 'Sound Safari — phonics for little readers',
  description:
    'A playful phonics app for ages 4–8: every vowel and consonant sound with a lesson, practice and a quiz.',
  manifest: '/manifest.json',
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
};

export const viewport = {
  themeColor: '#FFB020',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          <div className="mx-auto min-h-screen max-w-md pb-24">{children}</div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
