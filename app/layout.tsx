import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { getRootGraphSchema } from '@/lib/seoSchema';
import { GTMProvider } from '@/lib/analytics/GTMProvider';
import { AnalyticsPageTracker } from '@/lib/analytics/AnalyticsPageTracker';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1d4ed8',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://taches.ma'),
  applicationName: 'tâches.ma',
  title: {
    default: 'tâches.ma — Bourse de micro-tâches & services freelance au Maroc',
    template: '%s | tâches.ma',
  },
  description:
    'Déléguez vos tâches au Maroc en 1 minute à des milliers de prestataires vérifiés. Graphisme, traduction, e-commerce, saisie Excel. Paiement 100% garanti sous séquestre Daman.',
  keywords: [
    'freelance maroc',
    'micro-tâches maroc',
    'tâches.ma',
    'taches maroc',
    'shopify maroc',
    'services freelance maroc',
    'traduction darija',
    'séquestre daman',
    'e-commerce maroc',
    'graphiste maroc',
    'saisie de données excel maroc',
    'client mystere maroc',
    'micro services casablanca',
    'freelance rabat tanger',
    'prestataires de services maroc',
  ],
  authors: [{ name: 'tâches.ma', url: 'https://taches.ma' }],
  creator: 'tâches.ma',
  publisher: 'tâches.ma',
  category: 'business',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.webmanifest',
  alternates: {
    canonical: 'https://taches.ma/fr',
    languages: {
      'x-default': 'https://taches.ma/fr',
      'fr-MA': 'https://taches.ma/fr',
      'ar-MA': 'https://taches.ma/ar',
    },
  },
  openGraph: {
    title: 'tâches.ma — Bourse de micro-tâches & services freelance au Maroc',
    description:
      'Déléguez vos tâches au Maroc en 1 minute à des prestataires vérifiés. Graphisme, saisie Excel, e-commerce, traduction. Paiement 100% garanti sous séquestre Daman.',
    url: 'https://taches.ma/fr',
    siteName: 'tâches.ma',
    locale: 'fr_MA',
    alternateLocale: ['ar_MA'],
    type: 'website',
    images: [
      {
        url: 'https://taches.ma/og-image.png',
        width: 1200,
        height: 630,
        alt: 'tâches.ma — Bourse de micro-tâches & services freelance au Maroc',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'tâches.ma — Bourse de micro-tâches & freelance au Maroc',
    description:
      'Déléguez vos tâches et services freelance au Maroc en toute sécurité avec garantie sous séquestre Daman.',
    images: ['https://taches.ma/twitter-image.png'],
    creator: '@tachesma',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const savedLocale = cookieStore.get('taches_locale')?.value;
  const isArabic = savedLocale === 'ar';
  const lang = isArabic ? 'ar' : (savedLocale || 'fr');
  const dir = isArabic ? 'rtl' : 'ltr';

  const rootGraphSchema = getRootGraphSchema();

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-title" content="tâches.ma" />
        <meta name="application-name" content="tâches.ma" />
        <meta name="theme-color" content="#1d4ed8" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootGraphSchema) }}
        />
      </head>
      <body
        className={`${inter.variable} ${space.variable} font-sans antialiased text-slate-900 bg-surface-soft min-h-screen`}
      >
        <GTMProvider>
          <AuthProvider>
            <LanguageProvider>
              {/* Automatic page_view on every route change */}
              <Suspense fallback={null}>
                <AnalyticsPageTracker />
              </Suspense>
              {children}
              <AuthModal />
            </LanguageProvider>
          </AuthProvider>
        </GTMProvider>
      </body>
    </html>
  );
}
