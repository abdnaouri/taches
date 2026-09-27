import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });

export const metadata: Metadata = {
  title: 'tâches — Micro-tâches & Freelance Sécurisé (Escrow)',
  description: 'Plateforme moderne de micro-tâches et missions freelance avec paiement sécurisé sous séquestre, validation de preuves et progression de niveau.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${space.variable} font-sans antialiased bg-cream text-ink`}>
        {children}
      </body>
    </html>
  );
}
