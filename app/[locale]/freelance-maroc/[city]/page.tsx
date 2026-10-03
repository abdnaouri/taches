export const runtime = 'edge';

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { WorkzillaFooter } from '@/components/WorkzillaLandingSections';
import { MoroccanFreelanceSimulator } from '@/components/MoroccanFreelanceSimulator';
import { MOROCCAN_CITIES, getCityBySlug } from '@/lib/moroccanCities';
import { SEO_SERVICES } from '@/lib/seoLandings';
import { BASE_URL, WIKIDATA_ENTITIES } from '@/lib/seoSchema';
import {
  FiMapPin,
  FiShield,
  FiUsers,
  FiArrowRight,
  FiCheckCircle,
  FiBriefcase,
  FiAward,
  FiDollarSign,
  FiHelpCircle,
} from 'react-icons/fi';

interface CityPageProps {
  params: {
    locale: string;
    city: string;
  };
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const locale = params.locale || 'fr';
  const isAr = locale === 'ar';
  const cityData = getCityBySlug(params.city);

  if (!cityData) {
    return {
      title: 'Ville non trouvée | Tâches.ma',
    };
  }

  const title = isAr ? cityData.metaTitleAr : cityData.metaTitleFr;
  const description = isAr ? cityData.metaDescriptionAr : cityData.metaDescriptionFr;
  const canonicalUrl = `${BASE_URL}/${locale}/freelance-maroc/${cityData.slug}`;

  return {
    title,
    description,
    keywords: [
      `freelance ${cityData.nameFr.toLowerCase()}`,
      `recruter freelance ${cityData.nameFr.toLowerCase()}`,
      `developpeur ${cityData.nameFr.toLowerCase()}`,
      `graphiste ${cityData.nameFr.toLowerCase()}`,
      `plateforme freelance ${cityData.nameFr.toLowerCase()}`,
      `auto entrepreneur ${cityData.nameFr.toLowerCase()}`,
      'tâches.ma',
      'séquestre daman',
    ],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'x-default': `${BASE_URL}/fr/freelance-maroc/${cityData.slug}`,
        'fr-MA': `${BASE_URL}/fr/freelance-maroc/${cityData.slug}`,
        'ar-MA': `${BASE_URL}/ar/freelance-maroc/${cityData.slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'tâches.ma',
      locale: isAr ? 'ar_MA' : 'fr_MA',
      type: 'website',
    },
  };
}

export default function CityFreelancePage({ params }: CityPageProps) {
  const locale = params.locale || 'fr';
  const isAr = locale === 'ar';
  const cityData = getCityBySlug(params.city);

  if (!cityData) {
    notFound();
  }

  const cityName = isAr ? cityData.nameAr : cityData.nameFr;
  const regionName = isAr ? cityData.regionAr : cityData.regionFr;
  const heroPitch = isAr ? cityData.heroPitchAr : cityData.heroPitchFr;
  const highlights = isAr ? cityData.economicHighlightsAr : cityData.economicHighlightsFr;
  const topSkills = isAr ? cityData.topSkillsAr : cityData.topSkillsFr;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EmploymentAgency',
        '@id': `${BASE_URL}/#agency-${cityData.slug}`,
        name: isAr
          ? `tâches.ma — منصة المستقلين بـ ${cityName}`
          : `tâches.ma Freelance ${cityName}`,
        url: `${BASE_URL}/${locale}/freelance-maroc/${cityData.slug}`,
        description: heroPitch,
        parentOrganization: {
          '@id': `${BASE_URL}/#organization`,
        },
        areaServed: {
          '@type': 'City',
          name: cityData.nameFr,
          sameAs: cityData.wikidataId,
        },
        sameAs: [cityData.wikidataId, WIKIDATA_ENTITIES.freelancing],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: isAr ? 'الرئيسية' : 'Accueil',
            item: `${BASE_URL}/${locale}`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: isAr ? 'العمل الحر بالمغرب' : 'Freelance Maroc',
            item: `${BASE_URL}/${locale}/freelance-maroc`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: cityName,
            item: `${BASE_URL}/${locale}/freelance-maroc/${cityData.slug}`,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: cityData.faqs.map((faq) => ({
          '@type': 'Question',
          name: isAr ? faq.qAr : faq.qFr,
          acceptedAnswer: {
            '@type': 'Answer',
            text: isAr ? faq.aAr : faq.aFr,
          },
        })),
      },
    ],
  };

  const otherCities = MOROCCAN_CITIES.filter((c) => c.slug !== cityData.slug);

  return (
    <div
      className="min-h-screen bg-surface-soft text-slate-900 flex flex-col justify-between"
      dir={isAr ? 'rtl' : 'ltr'}
    >
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
              {isAr ? 'الرئيسية' : 'Accueil'}
            </Link>
            <span>/</span>
            <Link
              href={`/${locale}/freelance-maroc`}
              className="hover:text-brand-700 transition-colors"
            >
              {isAr ? 'العمل الحر بالمغرب' : 'Freelance Maroc'}
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">{cityName}</span>
          </nav>

          {/* Master City Hero */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/20 border border-brand-400/30 px-4 py-1.5 text-xs font-extrabold text-brand-300 mb-4">
                <FiMapPin className="text-brand-400" />
                <span>
                  {isAr
                    ? `دليل المستقلين والخدمات بـ ${cityName} (${regionName})`
                    : `Hub Freelance & Micro-Tâches à ${cityName} (${regionName})`}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {isAr
                  ? `أفضل المستقلين المعتمدين في ${cityName}`
                  : `Freelance à ${cityName} : Recrutez un Talent Vérifié ou Trouvez des Missions`}
              </h1>

              <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
                {heroPitch}
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href={`/${locale}/tasks/new`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 text-base font-bold shadow-lg transition-all"
                >
                  <FiBriefcase className="text-lg" />
                  <span>
                    {isAr
                      ? `نشر مهمة في ${cityName}`
                      : `Publier une mission à ${cityName} (Client)`}
                  </span>
                </Link>

                <Link
                  href={`/${locale}/tasks`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 text-base font-bold transition-all"
                >
                  <FiUsers className="text-lg" />
                  <span>
                    {isAr ? 'عروض العمل المتاحة' : 'Trouver des missions rémunérées'}
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* City Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-brand-700">
                {cityData.activeFreelancersCount}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                {isAr ? `مستقل مسجل بـ ${cityName}` : `Prestataires à ${cityName}`}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                ~{cityData.averageTjmMad} DH
              </div>
              <div className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                {isAr ? 'متوسط الأجر اليومي TJM' : 'TJM Moyen constaté'}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">100%</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                {isAr ? 'ضمان Séquestre Daman' : 'Paiement garanti Daman'}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-amber-600">&lt; 35s</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                {isAr ? 'متوسط سرعة الرد' : 'Temps moyen 1ère offre'}
              </div>
            </div>
          </div>

          {/* Local Economic Highlights & Top Skills */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-14">
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                {isAr
                  ? `لماذا يُعد التوظيف بـ ${cityName} خياراً مثالياً؟`
                  : `Écosystème & Dynamique du Freelancing à ${cityName}`}
              </h2>
              <div className="space-y-3">
                {highlights.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <FiCheckCircle className="text-emerald-600 text-lg shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                {isAr ? 'التخصصات الأكثر طلباً' : `Compétences les plus recherchées`}
              </h2>
              <div className="space-y-2.5">
                {topSkills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 flex items-center justify-between"
                  >
                    <span>{skill}</span>
                    <span className="text-brand-600 text-xs font-bold">Vérifié ✓</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Simulator Section */}
          <div className="mb-14">
            <MoroccanFreelanceSimulator
              locale={locale}
              defaultTjm={cityData.averageTjmMad}
            />
          </div>

          {/* Daman Escrow Trust Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-2xs mb-14">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl shrink-0">
                <FiShield />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-black text-slate-900">
                  {isAr
                    ? `حماية مالية 100% لجميع صفقات ${cityName}`
                    : `Séquestre Daman : Travaillez en toute sérénité à ${cityName}`}
                </h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  {isAr
                    ? 'يتم حجز الميزانية بالدرهم المغربي قبل انطلاق العمل، ولا تصرف للطرف الآخر إلا بعد فحصك وموافقتك التامة على النتائج.'
                    : 'Le budget est consigné en Dirhams avant le début de la prestation et n’est transféré qu’après validation conforme de vos livrables.'}
                </p>
              </div>
              <Link
                href={`/${locale}/daman`}
                className="shrink-0 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 text-xs font-bold transition-all"
              >
                {isAr ? 'تفاصيل الضمان' : 'En savoir plus sur Daman'}
              </Link>
            </div>
          </div>

          {/* City FAQs */}
          {cityData.faqs.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-2xs mb-14">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 text-center mb-8">
                {isAr
                  ? `أسئلة شائعة حول العمل الحر في ${cityName}`
                  : `Questions Fréquentes sur le Freelance à ${cityName}`}
              </h2>

              <div className="space-y-4 max-w-3xl mx-auto">
                {cityData.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-2xl p-5 bg-slate-50/70"
                  >
                    <h3 className="font-bold text-slate-900 text-base mb-2">
                      {isAr ? faq.qAr : faq.qFr}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {isAr ? faq.aAr : faq.aFr}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explore Other Moroccan Cities (SEO Anchor Hub) */}
          <div className="mb-14">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6">
              {isAr
                ? 'استكشف المستقلين في باقي المدن المغربية'
                : 'Explorez les Talents Freelance dans les Autres Villes du Maroc'}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {otherCities.map((c) => (
                <Link
                  key={c.slug}
                  href={`/${locale}/freelance-maroc/${c.slug}`}
                  className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-brand-500 hover:shadow-md transition-all text-center group"
                >
                  <div className="font-bold text-slate-900 group-hover:text-brand-700 transition-colors text-sm">
                    {isAr ? c.nameAr : c.nameFr}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {c.activeFreelancersCount} {isAr ? 'مستقل' : 'talents'}
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link
                href={`/${locale}/freelance-maroc`}
                className="text-xs font-bold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1"
              >
                <span>
                  {isAr
                    ? '← العودة للمنصة الوطنية الأولى للعمل الحر بالمغرب'
                    : '← Retourner au hub national : Plateforme N°1 Freelance au Maroc'}
                </span>
              </Link>
            </div>
          </div>
        </main>
      </div>

      <WorkzillaFooter />
    </div>
  );
}
