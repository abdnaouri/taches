export const runtime = 'edge';

import type { Metadata } from 'next';
import Link from 'next/link';
import { SEO_SERVICES } from '@/lib/seoLandings';
import { MOROCCAN_CITIES } from '@/lib/moroccanCities';
import { Header } from '@/components/Header';
import { WorkzillaFooter } from '@/components/WorkzillaLandingSections';
import { MoroccanFreelanceSimulator } from '@/components/MoroccanFreelanceSimulator';
import { BASE_URL, WIKIDATA_ENTITIES } from '@/lib/seoSchema';
import {
  FiCheckCircle,
  FiShield,
  FiClock,
  FiArrowRight,
  FiAward,
  FiUsers,
  FiDollarSign,
  FiHelpCircle,
  FiBriefcase,
  FiMapPin,
  FiCheck,
  FiX,
  FiFileText,
  FiTrendingUp,
} from 'react-icons/fi';

interface FreelanceMarocProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params }: FreelanceMarocProps): Promise<Metadata> {
  const locale = params.locale || 'fr';
  const isAr = locale === 'ar';

  return {
    title: isAr
      ? 'العمل الحر في المغرب — المنصة الأولى للمستقلين والمهام المصغرة | Tâches.ma'
      : 'Freelance Maroc — 1ère Plateforme de Freelances & Micro-Tâches au Maroc | Tâches.ma',
    description: isAr
      ? 'ابحث ووظف أفضل المستقلين الموثوقين في المغرب أو اعثر على مهام مدفوعة. تصميم، برمجة، متاجر إلكترونية شوبيفاي، ترجمة. دفع مضمون 100% مع ضمان Séquestre Daman.'
      : 'Trouvez et recrutez des freelances vérifiés au Maroc ou trouvez des missions rémunérées. Graphisme, développement web, e-commerce & Shopify, saisie, traduction. Paiement 100% garanti sous séquestre Daman.',
    keywords: [
      'freelance maroc',
      'plateforme freelance maroc',
      'site freelance maroc',
      'recruter freelance maroc',
      'trouver freelance maroc',
      'travailler en freelance au maroc',
      'auto entrepreneur maroc',
      'tjm freelance maroc',
      'micro-tâches maroc',
      'tâches.ma',
      'séquestre daman',
    ],
    alternates: {
      canonical: `${BASE_URL}/${locale}/freelance-maroc`,
      languages: {
        'x-default': `${BASE_URL}/fr/freelance-maroc`,
        'fr-MA': `${BASE_URL}/fr/freelance-maroc`,
        'ar-MA': `${BASE_URL}/ar/freelance-maroc`,
      },
    },
    openGraph: {
      title: isAr
        ? 'العمل الحر في المغرب — المنصة الأولى للخدمات المستقلة والمهام المصغرة'
        : 'Freelance Maroc — Plateforme N°1 de Services Freelance & Micro-Tâches',
      description: isAr
        ? 'فوض مشاريعك في المغرب أو حقق دخلاً من إنجاز المهام. دفع آمن تحت الضمان.'
        : 'Déléguez vos projets au Maroc ou gagnez de l’argent en effectuant des missions. Paiement sécurisé sous séquestre.',
      url: `${BASE_URL}/${locale}/freelance-maroc`,
      siteName: 'tâches.ma',
      locale: isAr ? 'ar_MA' : 'fr_MA',
      type: 'website',
    },
  };
}

export default function FreelanceMarocPillarPage({ params }: FreelanceMarocProps) {
  const locale = params.locale || 'fr';
  const isAr = locale === 'ar';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EmploymentAgency',
        '@id': `${BASE_URL}/#employment-agency`,
        name: isAr ? 'tâches.ma للعمل الحر في المغرب' : 'tâches.ma Freelance Maroc',
        url: `${BASE_URL}/${locale}/freelance-maroc`,
        description:
          'La référence du travail freelance et des micro-services au Maroc avec protection par séquestre bancaire Daman.',
        disambiguatingDescription:
          'Plateforme marocaine de mise en relation de freelances, prestataires indépendants et recruteurs au Maroc. N’a aucun rapport avec des cosmétiques ou crèmes anti-taches (Wikidata: Q3144865).',
        parentOrganization: {
          '@id': `${BASE_URL}/#organization`,
        },
        areaServed: {
          '@type': 'Country',
          name: 'Morocco',
          sameAs: WIKIDATA_ENTITIES.morocco,
        },
        sameAs: [WIKIDATA_ENTITIES.freelancing],
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
        ],
      },
      {
        '@type': 'WebApplication',
        '@id': `${BASE_URL}/${locale}/freelance-maroc#simulateur-tjm`,
        name: isAr
          ? 'حاسبة العمل الحر والضريبة بالمغرب 2026'
          : 'Simulateur TJM & Revenu Net Auto-Entrepreneur Maroc 2026',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All',
        url: `${BASE_URL}/${locale}/freelance-maroc#simulateur-tjm`,
        description:
          'Simulateur gratuit pour calculer le TJM en Dirhams (MAD), l’impôt forfaitaire 1% ou 2% et la cotisation CNSS AMO au Maroc.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: isAr
              ? 'كيف يعمل العمل الحر على منصة tâches.ma بالمغرب؟'
              : 'Comment fonctionne le freelancing sur tâches.ma au Maroc ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: isAr
                ? 'ينشر العميل مهمة مع ميزانية بالدرهم المغربي. يتقدم المستقلون في دقائق. يتم حجز المبلغ تحت ضمان Séquestre Daman ولا يُصرف إلا بعد استلام وموافقة العميل.'
                : 'Un client publie une tâche ou un projet avec un budget en Dirhams (MAD). Les freelances marocains postulent en quelques minutes. Dès que le client sélectionne un freelance, le montant est bloqué sous séquestre Daman et n’est reversé au prestataire qu’après validation du travail rendu.',
            },
          },
          {
            '@type': 'Question',
            name: isAr
              ? 'ما هو متوسط الأجر اليومي (TJM) لمستقل في المغرب؟'
              : 'Quel est le TJM moyen d’un freelance au Maroc ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: isAr
                ? 'يتراوح متوسط الأجر اليومي التقديري بين 150 درهم للمهام المصغرة، و 350-500 درهم للمصممين ومحرري الفيديو، و 600-1500 درهم للمطورين والخبراء التقنيين.'
                : 'Le Tarif Journalier Moyen (TJM) au Maroc se situe généralement entre 150 et 300 DH pour les micro-tâches, 350 à 500 DH pour le graphisme et la rédaction, et entre 600 et 1 500 DH pour les développeurs web et consultants techniques.',
            },
          },
          {
            '@type': 'Question',
            name: isAr
              ? 'هل يلزم التوفر على بطاقة المقاول الذاتي للعمل في tâches.ma؟'
              : 'Faut-il avoir le statut d’auto-entrepreneur pour travailler sur tâches.ma ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: isAr
                ? 'لا، بطاقة المقاول الذاتي ليست إلزامية لبدء إنجاز المهام المصغرة أو الخدمات الفردية. لكنها مستحسنة للاستفادة من الامتيازات الضريبية (1% أو 2%).'
                : 'Non, le statut auto-entrepreneur n’est pas obligatoire pour débuter. Les étudiants, particuliers et professionnels peuvent réaliser des missions ponctuelles sous notre contrat de prestation sécurisé.',
            },
          },
          {
            '@type': 'Question',
            name: isAr
              ? 'كيف تتم حماية المدفوعات في المغرب وتجنب النصب؟'
              : 'Comment sont protégés les paiements et comment éviter les impayés au Maroc ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: isAr
                ? 'بفضل نظام الضمان Daman، يضمن المستقل الحصول على أتعابه عند تسليم العمل المطابق، ويضمن صاحب العمل استرداد أمواله كاملة إذا لم يتم التسليم.'
                : 'Grâce au système de séquestre Daman, le freelance a l’assurance d’être payé dès lors qu’il livre un travail conforme, et le client est assuré d’être remboursé si le travail n’est pas délivré.',
            },
          },
          {
            '@type': 'Question',
            name: isAr
              ? 'ما هي المدن الأكثر نشاطاً في العمل الحر بالمغرب؟'
              : 'Quelles sont les villes les plus actives pour le freelance au Maroc ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: isAr
                ? 'تتصدر الدار البيضاء أكثر من 45% من المهام، تليها الرباط وسلا، ثم مراكش، طنجة، فاس وأكادير.'
                : 'Casablanca représente plus de 45% des projets freelances du Royaume, suivie de Rabat-Salé, Marrakech, Tanger, Fès et Agadir.',
            },
          },
          {
            '@type': 'Question',
            name: isAr
              ? 'كيف يتم سحب الأرباح من المنصة؟'
              : 'Comment retirer ses gains sur tâches.ma ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: isAr
                ? 'يتم سحب الأرباح بسهولة عبر Remitly أو Binance Pay (USDT) خلال 24 ساعة دون أي رسوم خفية.'
                : 'Les retraits s’effectuent facilement et rapidement par Remitly ou Binance Pay (USDT) sous 24h ouvrées, sans frais cachés.',
            },
          },
        ],
      },
    ],
  };

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
            <span className="text-slate-900 font-semibold">
              {isAr ? 'العمل الحر في المغرب' : 'Freelance Maroc'}
            </span>
          </nav>

          {/* Master Hero Banner */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-14 shadow-xl mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/20 border border-brand-400/30 px-4 py-1.5 text-xs font-extrabold text-brand-300 mb-4">
                <FiAward className="text-brand-400" />
                <span>
                  {isAr
                    ? 'المنصة الأولى للمستقلين والمهام المصغرة في المغرب'
                    : 'N°1 de la Bourse Freelance & Micro-Tâches au Maroc'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {isAr
                  ? 'العمل الحر في المغرب : وظف أفضل الكفاءات أو اعثر على مهام مربحة'
                  : 'Freelance Maroc : Recrutez un Talent ou Trouvez des Missions en 1 Minute'}
              </h1>

              <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
                {isAr
                  ? 'انضم لأكبر شبكة من المستقلين والمقاولين الذاتيين وصناع المحتوى بالمغرب. أكثر من 890 000 منفذ معتمد في الدار البيضاء، الرباط، مراكش، طنجة وكافة أرجاء المملكة مع حماية الدفع الكاملة تحت ضمان Séquestre Daman.'
                  : 'Rejoignez la communauté de référence des freelances, auto-entrepreneurs et créateurs au Maroc. Plus de 890 000 prestataires vérifiés à Casablanca, Rabat, Marrakech, Tanger et dans tout le Royaume.'}
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href={`/${locale}/tasks/new`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 text-base font-bold shadow-lg transition-all"
                >
                  <FiBriefcase className="text-lg" />
                  <span>
                    {isAr ? 'نشر مهمة (صاحب عمل)' : 'Publier une mission (Client)'}
                  </span>
                </Link>

                <Link
                  href={`/${locale}/tasks`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 text-base font-bold transition-all"
                >
                  <FiUsers className="text-lg" />
                  <span>
                    {isAr ? 'تصفح فرص العمل (مستقل)' : 'Trouver du travail (Freelance)'}
                  </span>
                </Link>

                <a
                  href="#simulateur-tjm"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-400/40 text-emerald-200 px-6 py-4 text-sm font-bold transition-all"
                >
                  <FiTrendingUp className="text-emerald-300" />
                  <span>{isAr ? 'حاسبة TJM والضريبة' : 'Calculateur TJM 2026'}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Pillars Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-brand-700">890 000+</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                {isAr ? 'مستقل مسجل' : 'Prestataires enregistrés'}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">35s</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                {isAr ? 'متوسط سرعة أول عرض' : 'Temps moyen 1ère offre'}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">100%</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                {isAr ? 'ضمان Séquestre Daman' : 'Garantie Séquestre Daman'}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-amber-600">0 DH</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                {isAr ? 'رسوم التسجيل' : 'Frais d’inscription'}
              </div>
            </div>
          </div>

          {/* INTERACTIVE TOOL: TJM & Auto-Entrepreneur Simulator */}
          <div className="mb-14">
            <MoroccanFreelanceSimulator locale={locale} defaultTjm={450} />
          </div>

          {/* Moroccan City Cluster Hubs */}
          <div className="mb-14">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-700 mb-1">
                  {isAr ? 'التغطية الوطنية في المغرب' : 'Implantation Locale & Régionale'}
                </p>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {isAr
                    ? 'المستقلين حسب المدن المغربية الكبرى'
                    : 'Trouvez un Freelance dans votre Ville au Maroc'}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOROCCAN_CITIES.map((city) => (
                <Link
                  key={city.slug}
                  href={`/${locale}/freelance-maroc/${city.slug}`}
                  className="group bg-white rounded-3xl border border-slate-200 p-6 hover:border-brand-500 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                        <FiMapPin className="text-brand-600" />
                        {isAr ? city.nameAr : city.nameFr}
                      </span>
                      <span className="text-xs font-extrabold text-brand-700">
                        ~{city.averageTjmMad} DH / TJM
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 group-hover:text-brand-700 transition-colors mb-2">
                      {isAr
                        ? `مستقلين ${city.nameAr}`
                        : `Freelance à ${city.nameFr}`}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {isAr ? city.heroPitchAr : city.heroPitchFr}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-700">
                    <span>{city.activeFreelancersCount} talents vérifiés</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      {isAr ? 'استكشف' : 'Consulter'} <FiArrowRight />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Grid of High Intent Service Categories */}
          <div className="mb-14">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-700 mb-1">
                  {isAr ? 'استكشف التخصصات' : 'Explorez les expertises'}
                </p>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {isAr
                    ? 'أهم مجالات العمل الحر المطلوبة في المغرب'
                    : 'Les Catégories Freelance les plus demandées au Maroc'}
                </h2>
              </div>
              <Link
                href={`/${locale}/tasks`}
                className="mt-2 md:mt-0 text-sm font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
              >
                <span>{isAr ? 'كافة الفئات' : 'Toutes les catégories'}</span>
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

          {/* Comparison Matrix: Tâches.ma vs Competitors */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-2xs mb-14 overflow-x-auto">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-700 mb-1">
                {isAr ? 'المقارنة الشاملة' : 'Pourquoi nous choisir ?'}
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {isAr
                  ? 'مقارنة tâches.ma مع المواقع الأخرى بالمغرب'
                  : 'Comparatif : Tâches.ma face aux autres plateformes au Maroc'}
              </h2>
            </div>

            <table className="w-full text-left text-sm border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-4 px-4 font-bold text-slate-600">Critères & Fonctionnalités</th>
                  <th className="py-4 px-4 font-black text-brand-700 bg-brand-50/50 rounded-t-xl text-center">
                    Tâches.ma 🇲🇦
                  </th>
                  <th className="py-4 px-4 font-bold text-slate-500 text-center">Freelancer.ma</th>
                  <th className="py-4 px-4 font-bold text-slate-500 text-center">Fiverr / Upwork</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    Paiement garanti sous Séquestre (Escrow)
                  </td>
                  <td className="py-3.5 px-4 text-center bg-brand-50/50 font-bold text-emerald-600">
                    ✓ Séquestre Daman 100%
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-400">✗ Non automatisé</td>
                  <td className="py-3.5 px-4 text-center text-slate-600">✓ Oui (en USD/EUR)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    Frais d’inscription & Accès aux annonces
                  </td>
                  <td className="py-3.5 px-4 text-center bg-brand-50/50 font-bold text-emerald-600">
                    Gratuit (0 DH)
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600">Abonnement payant</td>
                  <td className="py-3.5 px-4 text-center text-slate-600">Connects payants</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    Devise & Retraits au Maroc
                  </td>
                  <td className="py-3.5 px-4 text-center bg-brand-50/50 font-bold text-brand-700">
                    Dirhams (MAD) / Remitly / Crypto
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600">Chèque / Virement lent</td>
                  <td className="py-3.5 px-4 text-center text-slate-600">Perte 4-5% change devises</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    Vitesse moyenne de mise en relation
                  </td>
                  <td className="py-3.5 px-4 text-center bg-brand-50/50 font-bold text-brand-700">
                    Moins de 35 secondes
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600">Plusieurs jours</td>
                  <td className="py-3.5 px-4 text-center text-slate-600">Quelques heures</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    Support bilingue Darija / Français
                  </td>
                  <td className="py-3.5 px-4 text-center bg-brand-50/50 font-bold text-emerald-600">
                    ✓ Équipe locale 7j/7
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-400">✗ Support limité</td>
                  <td className="py-3.5 px-4 text-center text-slate-400">✗ En anglais uniquement</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Practical 2026 Freelance Guide in Morocco */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-2xs mb-14">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-3.5 py-1 text-xs font-bold text-brand-700 mb-3">
                <FiFileText />
                <span>Guide Pratique Maroc 2026</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6">
                {isAr
                  ? 'دليل العمل الحر الشامل في المغرب 2026'
                  : 'Guide Pratique : Comment se lancer en Freelance au Maroc en 2026'}
              </h2>

              <div className="space-y-6 text-slate-700 text-sm sm:text-base leading-relaxed">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-base mb-2">
                    1. Le Statut Auto-Entrepreneur au Maroc (Loi n° 114-13)
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Accessible facilement en ligne sur le portail national <code>ae.gov.ma</code> avec une simple CIN et une adresse de domiciliation. L’impôt est ultra-réduit : <strong>2% du chiffre d’affaires</strong> pour les prestations de services intellectuels/techniques (plafond annuel de 200 000 MAD), et <strong>1% du chiffre d’affaires</strong> pour les activités commerciales et e-commerce (plafond annuel de 500 000 MAD).
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-base mb-2">
                    2. La Couverture Sociale & AMO (CNSS)
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Tout auto-entrepreneur bénéficie de l’Assurance Maladie Obligatoire (AMO des indépendants) gérée par la CNSS, garantissant le remboursement des soins, médicaments et hospitalisations pour le freelance et ses ayants droit.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-base mb-2">
                    3. Pourquoi 80% des freelances évitent le travail informel au Maroc
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Dans le marché informel marocain, le risque d’impayés ou de travail non rémunéré dépasse 30%. En passant par <strong>tâches.ma et le séquestre Daman</strong>, chaque heure travaillée est garantie par un dépôt bancaire préalable. Le freelance n’a plus jamais à courir après ses factures.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-2xs mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 text-center mb-8">
              {isAr
                ? 'أسئلة شائعة حول العمل الحر بالمغرب'
                : 'Questions Fréquentes sur le Freelancing au Maroc'}
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
                  Quel est le TJM moyen constaté pour un freelance au Maroc ?
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Le Taux Journalier Moyen dépend de la spécialité : ~150 DH pour des micro-missions et de la saisie, 350 à 500 DH pour le graphisme et montage vidéo, et 600 à 1 500+ DH pour les développeurs web Full-Stack et experts e-commerce.
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/70">
                <h3 className="font-bold text-slate-900 text-base mb-2">
                  Comment retirer ses gains sur Tâches.ma ?
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Les retraits s’effectuent facilement et rapidement par Remitly ou Binance Pay (USDT) sous 24h ouvrées, sans frais cachés.
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
