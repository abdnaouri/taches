export const runtime = 'edge';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEO_SERVICES, getSeoServiceBySlug } from '@/lib/seoLandings';
import { Header } from '@/components/Header';
import { WorkzillaFooter } from '@/components/WorkzillaLandingSections';
import {
  FiCheckCircle,
  FiShield,
  FiClock,
  FiArrowRight,
  FiHelpCircle,
  FiLayers,
  FiZap,
  FiStar,
  FiPhoneCall
} from 'react-icons/fi';

interface ServicePageProps {
  params: {
    locale: string;
    slug: string;
  };
}


// Dynamic SEO Metadata for Google Ranking
export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const service = getSeoServiceBySlug(params.slug);

  if (!service) {
    return {
      title: 'Service Freelance Maroc | tâches.ma',
    };
  }

  const baseUrl = 'https://taches.ma';
  const currentUrl = `${baseUrl}/${params.locale}/services/${service.slug}`;

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    keywords: [...service.tags, 'freelance maroc', 'micro-tâches maroc', 'tâches.ma', 'séquestre daman'],
    alternates: {
      canonical: currentUrl,
      languages: {
        'fr-MA': `${baseUrl}/fr/services/${service.slug}`,
        'ar-MA': `${baseUrl}/ar/services/${service.slug}`,
      },
    },
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      url: currentUrl,
      siteName: 'tâches.ma',
      locale: params.locale === 'ar' ? 'ar_MA' : 'fr_MA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: service.metaTitle,
      description: service.metaDescription,
    },
  };
}

export default function ServiceLandingPage({ params }: ServicePageProps) {
  const service = getSeoServiceBySlug(params.slug);

  if (!service) {
    notFound();
  }

  const isAr = params.locale === 'ar';
  const locale = params.locale;

  // Rich JSON-LD Schemas (Service + FAQPage + BreadcrumbList)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `https://taches.ma/${locale}/services/${service.slug}#service`,
        name: service.title,
        description: service.metaDescription,
        provider: {
          '@type': 'Organization',
          name: 'tâches.ma',
          url: 'https://taches.ma',
        },
        areaServed: {
          '@type': 'Country',
          name: 'Morocco',
        },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'MAD',
          price: service.averagePriceMAD.toString(),
          availability: 'https://schema.org/InStock',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Accueil',
            item: `https://taches.ma/${locale}`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Services Freelance',
            item: `https://taches.ma/${locale}/tasks`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: service.title,
            item: `https://taches.ma/${locale}/services/${service.slug}`,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: service.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      },
    ],
  };

  const relatedServices = SEO_SERVICES.filter((s) =>
    service.relatedSlugs.includes(s.slug)
  );

  return (
    <div className="min-h-screen bg-surface-soft text-slate-900 flex flex-col justify-between" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Schema.org Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div>
        <Header />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-6" aria-label="Breadcrumb">
            <Link href={`/${locale}`} className="hover:text-brand-700 transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <Link href={`/${locale}/tasks`} className="hover:text-brand-700 transition-colors">
              Services & Missions
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold truncate">{service.title}</span>
          </nav>

          {/* Hero Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 lg:p-12 shadow-sm mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

            <div className="max-w-3xl relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200 px-3.5 py-1 text-xs font-bold text-brand-700 mb-4">
                <span>{service.badge}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {service.h1}
              </h1>

              <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                {service.heroPitch}
              </p>

              {/* Price & Delivery Highlights */}
              <div className="mt-8 flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                  <FiZap className="text-amber-500 text-lg" />
                  <span>Tarif moyen constaté : <strong className="text-slate-900 font-black">{service.averagePriceMAD} DH</strong></span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                  <FiClock className="text-brand-600 text-lg" />
                  <span>Délai moyen : <strong className="text-slate-900 font-black">{service.deliveryTimeHours}h</strong></span>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-emerald-800">
                  <FiShield className="text-emerald-600 text-lg" />
                  <span>Séquestre Daman 100% garanti</span>
                </div>
              </div>

              {/* CTA Action */}
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href={`/${locale}/tasks/new?category=${service.categoryKey}&title=${encodeURIComponent(service.title)}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-brand-700 hover:bg-brand-800 text-white px-8 py-4 text-base font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <span>Déléguer ce service maintenant</span>
                  <FiArrowRight />
                </Link>

                <Link
                  href={`/${locale}/tasks?category=${service.categoryKey}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 px-6 py-4 text-base font-bold transition-all"
                >
                  <FiLayers className="text-slate-500" />
                  <span>Voir les missions en cours</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Grid 2 Columns: Why Choose + Sample Deliverables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Why Choose Us */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 flex items-center gap-2.5">
                <FiStar className="text-amber-500" />
                <span>Pourquoi choisir un prestataire sur tâches.ma ?</span>
              </h2>
              <ul className="space-y-4">
                {service.whyChooseUs.map((point, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm sm:text-base text-slate-700">
                    <FiCheckCircle className="text-emerald-600 shrink-0 text-lg mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sample Deliverables */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 flex items-center gap-2.5">
                <FiLayers className="text-brand-600" />
                <span>Exemples de livrables attendus</span>
              </h2>
              <ul className="space-y-4">
                {service.sampleDeliverables.map((deliv, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm sm:text-base text-slate-700">
                    <span className="h-6 w-6 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span>{deliv}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* FAQ Accordion Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-2xs mb-12">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full mb-2">
                <FiHelpCircle /> Questions fréquentes
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Tout ce que vous devez savoir sur {service.title}
              </h2>
            </div>

            <div className="space-y-4 max-w-3xl mx-auto">
              {service.faqs.map((faq, index) => (
                <div key={index} className="border border-slate-200 rounded-2xl p-5 bg-slate-50/60">
                  <h3 className="font-bold text-slate-900 text-base mb-2">
                    {faq.q}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Related Services Internal Mesh */}
          {relatedServices.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-6">
                Autres services freelance demandés au Maroc
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedServices.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/${locale}/services/${rel.slug}`}
                    className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-brand-500 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-2xl mb-2">{rel.icon}</div>
                      <h4 className="font-bold text-slate-900 group-hover:text-brand-700 transition-colors text-base mb-1">
                        {rel.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {rel.metaDescription}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-brand-700 font-bold">
                      <span>Dès {rel.averagePriceMAD} DH</span>
                      <span className="group-hover:translate-x-1 transition-transform">En savoir plus →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Bottom WhatsApp Help Banner */}
          <div className="mt-12 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div>
              <h3 className="text-xl font-black">Besoin d’un devis sur-mesure ou d’un conseil ?</h3>
              <p className="text-sm text-slate-300 mt-1">Notre équipe au Maroc vous répond instantanément sur WhatsApp 7j/7.</p>
            </div>
            <a
              href="https://wa.me/212600000000?text=Bonjour,%20j%27ai%20besoin%20d%27un%20freelance%20au%20Maroc"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 text-sm font-bold shrink-0 transition-transform active:scale-95"
            >
              <FiPhoneCall className="text-lg" />
              <span>Contacter sur WhatsApp (+212)</span>
            </a>
          </div>

        </main>
      </div>

      <WorkzillaFooter />
    </div>
  );
}
