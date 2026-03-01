import './globals.css';
import type { Metadata, Viewport } from 'next';
import { getUser, getTeamForUser } from '@/lib/data/db/queries';
import { Toaster } from '@/shared/ui/sonner';
import { Manrope } from 'next/font/google';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Smetalab - Smart Engineering & Management',
  description: 'Advanced engineering and management platform for professional projects.'
};

export const viewport: Viewport = {
  maximumScale: undefined
};

import { Suspense } from 'react';
import { SWRWrapper } from '@/components/swr-wrapper';
import { WebVitals } from '@/components/web-vitals';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const userPromise = getUser();
  const teamPromise = getTeamForUser();

  return (
    <html
      lang="en"
      className={`${manrope.variable} font-sans`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-gray-50 dark:bg-gray-950 text-black dark:text-white antialiased">
        <WebVitals />
        <Suspense>
          <SWRWrapper userPromise={userPromise} teamPromise={teamPromise}>
            {children}
            <Toaster />
          </SWRWrapper>
        </Suspense>
      </body>
    </html>
  );
}
