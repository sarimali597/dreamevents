import type { Metadata } from 'next';
import { Fraunces } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import '@/styles/globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  ),
  title: {
    default: 'DreamEvents — Weddings & Events in Sukkur',
    template: '%s | DreamEvents',
  },
  description:
    'Find and book verified venues, caterers, photographers, and decorators for your wedding or event in Sukkur. Search, compare, negotiate, and book — all in one place.',
  keywords: [
    'wedding venues Sukkur',
    'marriage halls Sukkur',
    'catering Sukkur',
    'wedding photographers Sukkur',
    'event decorators Sukkur',
    'DreamEvents',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    siteName: 'DreamEvents',
    title: 'DreamEvents — Weddings & Events in Sukkur',
    description:
      'A trust-first marketplace for weddings and events in Sukkur. Verified venues, caterers, photographers, and decorators.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${GeistSans.variable} ${GeistMono.variable} bg-surface-base font-geist text-primary antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}