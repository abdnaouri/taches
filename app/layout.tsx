import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { AuthModal } from '@/components/AuthModal';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://taches.ma'),
  title: {
    default: 'tâches.ma — Bourse de micro-tâches & services freelance au Maroc | Séquestre Daman',
    template: '%s | tâches.ma',
  },
  description: 'Déléguez vos tâches au Maroc en 1 minute à des milliers de prestataires vérifiés. Graphisme, traduction, YouCan, saisie Excel. Paiement 100% garanti sous séquestre.',
  keywords: [
    'freelance maroc',
    'micro-tâches',
    'tâches.ma',
    'youcan maroc',
    'services freelance',
    'traduction darija',
    'séquestre daman',
    'e-commerce maroc',
    'graphiste maroc',
    'saisie de données',
  ],
  authors: [{ name: 'Tâches.ma Team', url: 'https://taches.ma' }],
  creator: 'Tâches.ma',
  publisher: 'Tâches.ma',
  alternates: {
    canonical: 'https://taches.ma',
    languages: {
      'fr-MA': 'https://taches.ma/fr',
      'ar-MA': 'https://taches.ma/ar',
    },
  },
  openGraph: {
    title: 'tâches.ma — Bourse de micro-tâches & services freelance au Maroc',
    description: 'Déléguez vos tâches au Maroc en 1 minute. Paiement 100% garanti sous séquestre Daman.',
    url: 'https://taches.ma',
    siteName: 'tâches.ma',
    locale: 'fr_MA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'tâches.ma — Bourse de micro-tâches au Maroc',
    description: 'Déléguez vos micro-tâches et services freelance au Maroc en toute sécurité.',
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'tâches.ma',
    url: 'https://taches.ma',
    description: 'Bourse de micro-tâches & services freelance au Maroc sous séquestre Daman',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://taches.ma/tasks?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${space.variable} font-sans antialiased text-slate-900 bg-surface-soft min-h-screen`}>
        <AuthProvider>
          <LanguageProvider>
            {children}
            <AuthModal />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

