export const runtime = 'edge';

import type { Metadata } from 'next';
import Link from 'next/link';
import { SEO_SERVICES } from '@/lib/seoLandings';
import { Header } from '@/components/Header';
import { WorkzillaFooter } from '@/components/WorkzillaLandingSections';
import {
  FiCheckCircle,
  FiShield,
  FiClock,
  FiArrowRight,
  FiAward,
  FiUsers,
  FiDollarSign,
  FiHelpCircle,
  FiBriefcase
} from 'react-icons/fi';

interface FreelanceMarocProps {
  params: {
    locale: string;
  };
}

export const metadata: Metadata = {
  title: 'Freelance Maroc — 1ère Plateforme de Freelances & Micro-Tâches au Maroc | Tâches.ma',
  description: 'Trouvez et recrutez des freelances vérifiés au Maroc ou trouvez des missions rémunérées. Graphisme, développement web, marketing YouCan, saisie, traduction. Paiement 100% garanti sous séquestre Daman.',
  keywords: [
    'freelance maroc',
    'plateforme freelance maroc',
    'site freelance maroc',
    'recruter freelance maroc',
    'trouver freelance maroc',
    'travailler en freelance au maroc',
    'auto entrepreneur maroc',
    'micro-tâches maroc',
    'tâches.ma',
    'séquestre daman',
  ],
  alternates: {
    canonical: 'https://taches.ma/fr/freelance-maroc',
    languages: {
      'fr-MA': 'https://taches.ma/fr/freelance-maroc',
      'ar-MA': 'https://taches.ma/ar/freelance-maroc',
    },
  },
  openGraph: {
    title: 'Freelance Maroc — Plateforme N°1 de Services Freelance & Micro-Tâches',
    description: 'Déléguez vos projets au Maroc ou gagnez de l’argent en effectuant des missions. Paiement sécurisé sous séquestre.',
    url: 'https://taches.ma/fr/freelance-maroc',
    siteName: 'tâches.ma',
    type: 'website',
  },
};

export default function FreelanceMarocPillarPage({ params }: FreelanceMarocProps) {
  const locale = params.locale || 'fr';
  const isAr = locale === 'ar';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EmploymentAgency',
        '@id': 'https://taches.ma/#agency',
        name: 'tâches.ma Freelance Maroc',
        url: `https://taches.ma/${locale}/freelance-maroc`,
        description: 'La référence du travail freelance et des micro-services au Maroc avec protection par séquestre bancaire Daman.',
        disambiguatingDescription: 'Plateforme marocaine de mise en relation de freelances, prestataires indépendants et recruteurs au Maroc. N’a aucun rapport avec des cosmétiques ou crèmes anti-taches.',
        areaServed: {
          '@type': 'Country',
          name: 'Morocco',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Comment fonctionne le freelancing sur tâches.ma au Maroc ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Un client publie une tâche ou un projet avec un budget en Dirhams (MAD). Les freelances marocains postulent en quelques minutes. Dès que le client sélectionne un freelance, le montant est bloqué sous séquestre Daman et n’est reversé au prestataire qu’après validation du travail rendu.',
            },
          },
          {
            '@type': 'Question',
            name: 'Quels sont les métiers freelance les plus recherchés au Maroc ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Les spécialités les plus demandées sont le développement web (WordPress, React, Shopify), le graphisme & logo, la gestion de boutiques e-commerce YouCan / COD, le montage vidéo TikTok/Reels, la saisie Excel et la traduction Darija/Français.',
            },
          },
          {
            '@type': 'Question',
            name: 'Comment sont protégés les paiements au Maroc ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Grâce au système de séquestre Daman, le freelance a l’assurance d’être payé dès lors qu’il livre un travail conforme, et le client est assuré d’être remboursé si le travail n’est pas délivré.',
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-surface-soft text-slate-900 flex flex-col justify-between" dir={isAr ? 'rtl' : 'ltr'}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div>
        <Header />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-6">
            <Link href={`/${locale}`} className="hover:text-brand-700 transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Freelance Maroc</span>
          </nav>

          {/* Master Hero Banner */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-14 shadow-xl mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/20 border border-brand-400/30 px-4 py-1.5 text-xs font-extrabold text-brand-300 mb-4">
                <FiAward className="text-brand-400" />
                <span>N°1 de la Bourse Freelance & Micro-Tâches au Maroc</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Freelance Maroc : Recrutez un Talent ou Trouvez des Missions en 1 Minute
              </h1>

              <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
                Rejoignez la communauté de référence des freelances, auto-entrepreneurs et créateurs au Maroc. Plus de 890 000 prestataires vérifiés à Casablanca, Rabat, Marrakech, Tanger et dans tout le Royaume.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href={`/${locale}?action=create`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 text-base font-bold shadow-lg transition-all"
                >
                  <FiBriefcase className="text-lg" />
                  <span>Publier une mission (Client)</span>
                </Link>

                <Link
                  href={`/${locale}/tasks`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 text-base font-bold transition-all"
                >
                  <FiUsers className="text-lg" />
                  <span>Trouver du travail (Freelance)</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Pillars Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-brand-700">890 000+</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">Prestataires enregistrés</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">35s</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">Temps moyen 1ère offre</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">100%</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">Garantie Séquestre Daman</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-amber-600">0 DH</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">Frais d’inscription</div>
            </div>
          </div>

          {/* Grid of High Intent Service Categories */}
          <div className="mb-14">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-700 mb-1">Explorez les expertises</p>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Les Catégories Freelance les plus demandées au Maroc
                </h2>
              </div>
              <Link
                href={`/${locale}/tasks`}
                className="mt-2 md:mt-0 text-sm font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
              >
                <span>Toutes les catégories</span>
                <FiArrowRight />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SEO_SERVICES.map((srv) => (
                <Link
                  key={srv.slug}
                  href={`/${locale}/services/${srv.slug}`}
                  className="group bg-white rounded-3xl border border-slate-200 p-6 hover:border-brand-500 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                      {srv.icon}
                    </div>
                    <h3 className="font-extrabold text-slate-900 group-hover:text-brand-700 transition-colors text-lg mb-2">
                      {srv.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                      {srv.metaDescription}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-700">
                    <span>Dès {srv.averagePriceMAD} DH</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Découvrir <FiArrowRight />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* How Daman Escrow Works (Trust Anchor) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-2xs mb-14">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-bold text-emerald-800 mb-2">
                <FiShield className="text-emerald-600" />
                <span>Sécurité & Confiance au Maroc</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Comment le Séquestre Daman protège 100% de vos transactions
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Fini les impayés pour les freelances et fini les acomptes perdus pour les clients.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="h-10 w-10 rounded-xl bg-brand-700 text-white font-black text-base flex items-center justify-center mb-4">
                  1
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">Dépôt sous Séquestre</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Le client dépose le budget convenu sur la plateforme. L’argent est consigné en toute sécurité par Daman.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="h-10 w-10 rounded-xl bg-brand-700 text-white font-black text-base flex items-center justify-center mb-4">
                  2
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">Réalisation en Confiance</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Le freelance travaille l’esprit tranquille en sachant que les fonds sont déjà réservés pour son travail.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white font-black text-base flex items-center justify-center mb-4">
                  3
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">Validation & Virement</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Le client inspecte les livrables. Dès validation, les fonds sont instantanément crédités sur le portefeuille du freelance.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-2xs mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 text-center mb-8">
              Questions Fréquentes sur le Freelancing au Maroc
            </h2>

            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/70">
                <h3 className="font-bold text-slate-900 text-base mb-2">
                  Faut-il avoir le statut d’auto-entrepreneur pour travailler sur tâches.ma ?
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Non, le statut auto-entrepreneur n’est pas obligatoire pour débuter. Les étudiants, particuliers et professionnels peuvent effectuer des micro-tâches ou des missions ponctuelles en toute légalité sous notre contrat de prestation.
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/70">
                <h3 className="font-bold text-slate-900 text-base mb-2">
                  Comment retirer ses gains vers une banque marocaine ?
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Les retraits s’effectuent par virement bancaire direct (RIB marocain : Attijariwafa, BCP, BMCE, CIH, CDM, SGMB) ou par Cash Plus / Wafacash sous 24h ouvrées.
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/70">
                <h3 className="font-bold text-slate-900 text-base mb-2">
                  Comment trouver des clients réguliers au Maroc ?
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  En complétant votre profil avec soin, en obtenant de bonnes notes et avis vérifiés sur vos premières missions, et en répondant rapidement aux annonces publiées chaque jour.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <WorkzillaFooter />
    </div>
  );
}
