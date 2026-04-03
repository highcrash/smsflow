import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'SMSFlow – Your Phone is Your SMS Gateway',
    template: '%s | SMSFlow',
  },
  description:
    'Turn your Android phone into a powerful SMS gateway. Send single, bulk, and scheduled messages via REST API or dashboard.',
  keywords: ['SMS gateway', 'Android SMS', 'bulk SMS', 'SMS API', 'WordPress SMS'],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    title: 'SMSFlow – Your Phone is Your SMS Gateway',
    description: 'Turn your Android phone into a powerful SMS gateway.',
    siteName: 'SMSFlow',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
