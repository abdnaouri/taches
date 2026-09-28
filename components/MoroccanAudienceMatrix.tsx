'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  FiShoppingBag,
  FiBriefcase,
  FiHome,
  FiAward,
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
  FiZap,
  FiPhoneCall,
  FiTrendingUp,
  FiDollarSign
} from 'react-icons/fi';

interface AudienceItem {
  id: string;
  tabTitle: { fr: string; ar: string; en: string };
  icon: string;
  badge: { fr: string; ar: string; en: string };
  headline: { fr: string; ar: string; en: string };
  subheadline: { fr: string; ar: string; en: string };
  bulletPoints: { fr: string[]; ar: string[]; en: string[] };
  popularTasks: {
    title: { fr: string; ar: string; en: string };
    desc: { fr: string; ar: string; en: string };
    budgetDH: number;
    turnaround: string;
    category: string;
  }[];
  ctaText: { fr: string; ar: string; en: string };
}

const AUDIENCE_DATA: AudienceItem[] = [
  {
    id: 'ecommerce',
    tabTitle: {
      fr: 'E-commerce & YouCan Shop',
      ar: 'التجارة الإلكترونية ومتاجر يوكان',
      en: 'E-commerce & YouCan Shop',
    },
    icon: '🛍️',
    badge: {
      fr: 'Pour les vendeurs en ligne',
      ar: 'لأصحاب المتاجر والمشاريع الرقمية',
      en: 'For online merchants',
    },
    headline: {
      fr: 'Déléguez le travail fastidieux de votre boutique en ligne',
      ar: 'تفرّغ للمبيعات واترك المهام الروتينية لمتجرك',
      en: 'Delegate tedious tasks for your online shop',
    },
    subheadline: {
      fr: 'Fiches produits, suppression de fond sur les photos, scripts de vente en Darija, montage de vidéos TikTok avec voix off locale.',
      ar: 'إدخال المنتجات، عزل خلفيات الصور، صياغة إعلانات بالدارجة ومونتاج فيديوهات تيك توك بصوت مغربي جذاب.',
      en: 'Product uploads, background removal, Darija ad copywriting, and localized Moroccan TikTok video edits.',
    },
    bulletPoints: {
      fr: [
        'Ajout de 50 à 200 fiches produits prêtes à vendre',
        'Montage de Reels et vidéos UGC pour Meta & TikTok Ads',
        'Traduction et adaptation de pages de vente en Darija',
        'Vérification des commandes par téléphone avant expédition',
      ],
      ar: [
        'إضافة وتنسيق من 50 إلى 200 منتج بسرعة',
        'مونتاج فيديوهات إعلانية جذابة لمنصات تيك توك وفيسبوك',
        'صياغة نصوص ترويجية بالدارجة المغربية المفهومة',
        'تأكيد الطلبيات هاتفياً بالدارجة قبل الشحن',
      ],
      en: [
        'Upload 50 to 200 product listings fast',
        'Edit engaging UGC ads for TikTok and Instagram',
        'Persuasive Darija copy for landing pages',
        'Phone confirmation of COD orders in Darija',
      ],
    },
    popularTasks: [
      {
        title: {
          fr: 'Montage 3 vidéos TikTok / Reels pour produit YouCan',
          ar: 'مونتاج 3 فيديوهات إعلانية لمنتج في متجر يوكان',
          en: 'Edit 3 TikTok/Reels ads for a YouCan product',
        },
        desc: {
          fr: 'Créer 3 variations de pubs courtes (30s) avec sous-titres animés et voix Darija pour tester sur Meta Ads.',
          ar: 'إنشاء 3 نسخ إعلانية قصيرة مع كتابة الكلمات بالدارجة وصوت تسويقي مقنع.',
          en: 'Create 3 short ad variations (30s) with captions and Moroccan voiceover for Meta Ads testing.',
        },
        budgetDH: 140,
        turnaround: '4h',
        category: 'marketing',
      },
      {
        title: {
          fr: 'Création de 20 fiches produits avec photos détourées',
          ar: 'إضافة 20 منتجاً مع تنظيف الصور وكتابة الوصف',
          en: '20 clean product listings with retouched photos',
        },
        desc: {
          fr: 'Importer 20 articles sur YouCan avec descriptions vendeuses en Français/Arabe et photos sur fond blanc.',
          ar: 'إدخال 20 مادة لمتجر يوكان مع صور واضحة ووصف مميز وتحديد خيارات المقاس والألوان.',
          en: 'Upload 20 products to YouCan with clean photos and persuasive descriptions in French & Arabic.',
        },
        budgetDH: 100,
        turnaround: '5h',
        category: 'development',
      },
    ],
    ctaText: {
      fr: 'Publier une mission E-commerce',
      ar: 'نشر مهمة خاصة بمتجري',
      en: 'Post an E-commerce task',
    },
  },
  {
    id: 'business',
    tabTitle: {
      fr: 'PME, Cabinets & Commerçants',
      ar: 'الشركات، المحاسبون والمحلات',
      en: 'SMEs, Accounting & Shops',
    },
    icon: '📊',
    badge: {
      fr: 'Pour les entreprises & indépendants',
      ar: 'للشركات والمكاتب المهنية',
      en: 'For business & professionals',
    },
    headline: {
      fr: 'Gagnez des heures précieuses sur la saisie et la paperasse',
      ar: 'وفّر ساعات طويلة من العمل الإداري والإدخال الروتيني',
      en: 'Save valuable hours on paperwork and data entry',
    },
    subheadline: {
      fr: 'Saisie de classeurs de factures sous Excel, mise en page de contrats, conception de flyers pour votre magasin, création de logo professionnel.',
      ar: 'تفريغ الفواتير القديمة في إكسيل، تنسيق العقود، تصميم ملصقات وقوائم للمطاعم والمقاهي، وشعارات مميزة.',
      en: 'Excel invoice entry, legal contract formatting, restaurant menu/flyer design, and professional logo creation.',
    },
    bulletPoints: {
      fr: [
        'Rapprochement bancaire et saisie de reçus scannés',
        'Création de cartes de visite, affiches et menus de restaurant',
        'Traduction assermentée ou courante Français ↔ Arabe',
        'Nettoyage et mise à jour de bases de données clients',
      ],
      ar: [
        'تفريغ الفواتير الورقية والإيصالات في جداول منظمة',
        'تصميم بطاقات العمل والملصقات وقوائم المقاهي والمطاعم',
        'ترجمة العقود والمراسلات الرسمية فرنسي / عربي',
        'تحديث وتنسيق قوائم أرقام وعناوين الزبناء',
      ],
      en: [
        'Bank reconciliation and invoice receipt transcription',
        'Business card, flyer, and restaurant menu design',
        'Accurate French ↔ Arabic business translation',
        'Customer database cleaning and formatting',
      ],
    },
    popularTasks: [
      {
        title: {
          fr: 'Saisie de 60 factures d’achats dans un tableau Excel',
          ar: 'تفريغ 60 فاتورة مشتريات في جدول إكسيل منظم',
          en: 'Entry of 60 purchase invoices into Excel',
        },
        desc: {
          fr: 'Recopier date, fournisseur, numéro, montant HT, TVA et TTC à partir de photos ou scans.',
          ar: 'نقل التاريخ، اسم المورد، رقم الفاتورة، والمبالغ دون خطأ في جدول إكسيل.',
          en: 'Accurately enter date, supplier name, invoice number, and tax amounts from scans into Excel.',
        },
        budgetDH: 90,
        turnaround: '3h',
        category: 'assistance',
      },
      {
        title: {
          fr: 'Conception carte de visite & dépliant A5 pour boutique',
          ar: 'تصميم بطاقة عمل ومطوية إعلانية لمحل تجاري',
          en: 'Business card & A5 promotional flyer design',
        },
        desc: {
          fr: 'Design moderne prêt pour l’impression (PDF HD 300 DPI) aux dimensions exactes avec fichiers sources.',
          ar: 'تصميم عصري جاهز للمطبعة بدقة عالية مع تسليم الملفات المفتوحة.',
          en: 'Modern print-ready design (HD 300 DPI) with exact bleed dimensions and source files.',
        },
        budgetDH: 120,
        turnaround: '4h',
        category: 'design',
      },
    ],
    ctaText: {
      fr: 'Déposer une mission bureautique ou design',
      ar: 'نشر مهمة إدارية أو تصميم',
      en: 'Post a business/office task',
    },
  },
  {
    id: 'mre_individuals',
    tabTitle: {
      fr: 'Particuliers & MRE (Marocains du Monde)',
      ar: 'الأفراد ومغاربة العالم (MRE)',
      en: 'Individuals & Expats (MRE)',
    },
    icon: '🏛️',
    badge: {
      fr: 'Services sur place & Démarches',
      ar: 'مهام ميدانية وإدارية عن بعد',
      en: 'On-site & Remote errands',
    },
    headline: {
      fr: 'Faites réaliser vos démarches au Maroc sans vous déplacer',
      ar: 'أنجز معاملاتك وتفقد ممتلكاتك في المغرب وأنت في مكانك',
      en: 'Get on-site errands done in Morocco without traveling',
    },
    subheadline: {
      fr: 'Vous vivez à l’étranger ou dans une autre ville ? Un prestataire de confiance dépose vos dossiers, prend des photos géolocalisées ou vérifie un chantier.',
      ar: 'سواء كنت مقيماً بالخارج أو بمدينة أخرى، يقوم مستقل معتمد بإيداع أوراقك الرسمية، تصوير عقارك، أو معاينة محل.',
      en: 'Living abroad or in another city? A verified local performer files your paperwork, takes geo-tagged photos, or inspects a site.',
    },
    bulletPoints: {
      fr: [
        'Dépôt de dossiers aux bureaux d’ordre (Rabat, Casablanca, Tanger)',
        'Vérification et photos haute définition d’un appartement ou terrain',
        'Appels téléphoniques de fournisseurs ou artisans en Darija',
        'Récupération de documents légalisés et envoi sécurisé',
      ],
      ar: [
        'إيداع الوثائق بمكاتب الضبط والإدارات (الرباط، البيضاء، طنجة)',
        'معاينة والتقاط صور دقيقة لشقة أو قطعة أرض أو محل',
        'الاتصال بالبنائين أو الموردين بالدارجة والتأكد من الأسعار',
        'استلام الوثائق الرسمية والتأكد من صحتها',
      ],
      en: [
        'Registry document submissions (Rabat, Casa, Tangier)',
        'Detailed on-site photos of real estate or construction progress',
        'Direct phone inquiries in Moroccan Darija to vendors/craftsmen',
        'Local errand completion with photo and receipt proof',
      ],
    },
    popularTasks: [
      {
        title: {
          fr: 'Dépôt d’un courrier officiel au bureau d’ordre à Rabat',
          ar: 'إيداع رسمي لملف أو رسالة بمكتب الضبط بالرباط',
          en: 'Official registry file drop-off in Rabat',
        },
        desc: {
          fr: 'Dépôt physique du dossier avec tampon officiel, date et photo du récépissé envoyée sous 3h.',
          ar: 'تسليم الملف يداً بيد وأخذ خاتم الاستلام وإرسال صورة الوصل المؤرخ فوراً.',
          en: 'Hand-delivery to public office registry with stamped receipt photo returned within 3h.',
        },
        budgetDH: 130,
        turnaround: '3h',
        category: 'micro',
      },
      {
        title: {
          fr: 'Visite & 12 photos d’un appartement à Marrakech / Tanger',
          ar: 'معاينة و12 صورة واضحة لشقة بمراكش أو طنجة',
          en: 'On-site check & 12 clear photos of property in Marrakech/Tangier',
        },
        desc: {
          fr: 'Prendre 12 photos nettes de l’intérieur et de l’extérieur avec note d’observation sur l’état général.',
          ar: 'التقاط 12 صورة واضحة لحالة الشقة من الداخل والخارج وإرسال تقرير موجز.',
          en: 'Take 12 sharp photos of interior/exterior condition with a brief observation memo.',
        },
        budgetDH: 150,
        turnaround: '4h',
        category: 'micro',
      },
    ],
    ctaText: {
      fr: 'Confier une démarche au Maroc',
      ar: 'تكليف مستقل بمهمة في المغرب',
      en: 'Request a local errand in Morocco',
    },
  },
  {
    id: 'freelancers',
    tabTitle: {
      fr: 'Freelances & Étudiants',
      ar: 'المستقلون والطلبة',
      en: 'Freelancers & Students',
    },
    icon: '💵',
    badge: {
      fr: 'Gagner de l’argent au Maroc',
      ar: 'تحقيق دخل مضمون بالدرهم',
      en: 'Earn guaranteed income in Morocco',
    },
    headline: {
      fr: 'Monétisez vos compétences avec des paiements garantis sous séquestre',
      ar: 'استغل مهاراتك واكسب دخلاً أسبوعياً مضموناً بحسابك البنكي',
      en: 'Monetize your skills with 100% escrow-guaranteed payouts',
    },
    subheadline: {
      fr: 'Vous maîtrisez Excel, Canva, Photoshop, la traduction ou le montage ? Recevez des missions rémunérées de 50 à 500 DH avec virement sur votre compte CIH, Attijariwafa ou Cash Plus.',
      ar: 'هل تتقن إكسيل، كانفا، فوتوشوب، الترجمة أو المونتاج؟ أنجز مهاماً يومية واكسب من 50 إلى 500 درهم لكل مهمة مع استلام أرباحك بدون تأخير.',
      en: 'Skilled in Excel, Canva, Photoshop, translation, or video? Complete daily tasks and earn 50 to 500 DH with fast Moroccan bank payouts.',
    },
    bulletPoints: {
      fr: [
        'Zéro risque d’impayé : l’argent du client est bloqué d’avance par Daman',
        'Virements rapides vers toutes les banques marocaines (CIH, Attijari, BMCE)',
        'Missions flexibles réalisables depuis chez vous ou votre smartphone',
        'Système de notation équitable pour augmenter vos tarifs',
      ],
      ar: [
        'ضمان مالي تام: أموال الزبون محفوظة في صندوق الضمان مسبقاً',
        'سحب أرباحك بسهولة نحو جميع البنوك المغربية أو كاش بلوس',
        'عمل مرن يناسب وقتك من المنزل أو عبر هاتفك',
        'نظام تقييم شفاف لرفع مستواك وزيادة دخلك',
      ],
      en: [
        'Zero non-payment risk: funds are locked in escrow upfront',
        'Fast bank transfers to CIH, Attijariwafa, BMCE, or Cash Plus',
        'Flexible work from home or mobile on your own schedule',
        'Transparent 5-star rating system to boost your earnings',
      ],
    },
    popularTasks: [
      {
        title: {
          fr: 'Rejoindre tâches.ma et passer le test de qualification',
          ar: 'الانضمام للمنصة واجتياز اختبار الكفاءة السريع',
          en: 'Join taches.ma & pass the quick qualification test',
        },
        desc: {
          fr: 'Test chronométré de 10 questions pour valider votre rigueur et accéder immédiatement aux missions ouvertes.',
          ar: 'اختبار دقيق في 10 أسئلة لإثبات الجدية والبدء في استلام المهام المربحة.',
          en: '10-question timed test to demonstrate attention to detail and unlock open paying tasks.',
        },
        budgetDH: 0,
        turnaround: '5 min',
        category: 'micro',
      },
    ],
    ctaText: {
      fr: 'Créer mon profil freelance vérifié',
      ar: 'إنشاء حساب مستقل وبدء العمل',
      en: 'Create verified freelance profile',
    },
  },
];

interface MoroccanAudienceMatrixProps {
  onLaunchTask: (prefill: {
    title: string;
    description: string;
    rewardDH: number;
    category: string;
  }) => void;
  onOpenQualification: () => void;
  onExploreTasks: () => void;
}

export const MoroccanAudienceMatrix: React.FC<MoroccanAudienceMatrixProps> = ({
  onLaunchTask,
  onOpenQualification,
  onExploreTasks,
}) => {
  const { locale, isRTL } = useLanguage();
  const [selectedAudienceId, setSelectedAudienceId] = useState<string>('ecommerce');

  const loc = (locale === 'ar' || locale === 'en') ? locale : 'fr';
  const currentAudience = AUDIENCE_DATA.find((a) => a.id === selectedAudienceId) || AUDIENCE_DATA[0];

  return (
    <section className="py-14 sm:py-20 bg-white border-b border-slate-200" id="audiences">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <p className="section-kicker mb-2">Cas d’usages au Maroc</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {locale === 'ar'
              ? 'حلول مصممة خصيصاً لكل احتياج في السوق المغربي'
              : 'Une solution concrète pour chaque profil au Maroc'}
          </h2>
          <p className="mt-2 text-xs sm:text-base text-slate-600">
            {locale === 'ar'
              ? 'سواء كنت بائعاً إلكترونياً، صاحب شركة، مقيماً بالخارج، أو تريد العمل كحر، نوفر لك الأمان والسرعة.'
              : 'Commerçants, PME, particuliers, Marocains du Monde ou freelances : découvrez comment vous gagnez du temps et de l’argent.'}
          </p>
        </div>

        {/* Audience Segment Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none justify-start sm:justify-center">
          {AUDIENCE_DATA.map((aud) => {
            const isSelected = aud.id === selectedAudienceId;
            return (
              <button
                key={aud.id}
                type="button"
                onClick={() => setSelectedAudienceId(aud.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-brand-700 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                <span>{aud.icon}</span>
                <span>{aud.tabTitle[loc] || aud.tabTitle.fr}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Audience Detail Showcase */}
        <div className="functional-card p-6 sm:p-9 bg-slate-50/70 border border-slate-200 rounded-3xl animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-bold text-brand-700 mb-3">
                <span>{currentAudience.icon}</span>
                <span>{currentAudience.badge[loc] || currentAudience.badge.fr}</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight mb-2">
                {currentAudience.headline[loc] || currentAudience.headline.fr}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                {currentAudience.subheadline[loc] || currentAudience.subheadline.fr}
              </p>

              {/* Bullet Points */}
              <div className="space-y-3 mb-6">
                {(currentAudience.bulletPoints[loc] || currentAudience.bulletPoints.fr).map((bp, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-black text-xs">
                      ✓
                    </div>
                    <span className="font-medium">{bp}</span>
                  </div>
                ))}
              </div>

              {/* Action Trigger */}
              <div className="pt-4 border-t border-slate-200/80">
                {currentAudience.id === 'freelancers' ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={onOpenQualification}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3 text-xs sm:text-sm shadow-md transition cursor-pointer"
                    >
                      <FiAward className="text-base" />
                      <span>{currentAudience.ctaText[loc] || currentAudience.ctaText.fr}</span>
                      {isRTL ? <FiArrowLeft /> : <FiArrowRight />}
                    </button>
                    <button
                      type="button"
                      onClick={onExploreTasks}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold px-5 py-3 text-xs sm:text-sm transition cursor-pointer shadow-2xs"
                    >
                      <span>Voir les missions ouvertes</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const firstPreset = currentAudience.popularTasks[0];
                      if (firstPreset) {
                        onLaunchTask({
                          title: firstPreset.title[loc] || firstPreset.title.fr,
                          description: firstPreset.desc[loc] || firstPreset.desc.fr,
                          rewardDH: firstPreset.budgetDH,
                          category: firstPreset.category,
                        });
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold px-6 py-3 text-xs sm:text-sm shadow-md transition cursor-pointer"
                  >
                    <FiZap className="text-amber-300 text-base" />
                    <span>{currentAudience.ctaText[loc] || currentAudience.ctaText.fr}</span>
                    {isRTL ? <FiArrowLeft /> : <FiArrowRight />}
                  </button>
                )}
              </div>
            </div>

            {/* Right Side: Concrete Ready-Made Mission Cards */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {locale === 'ar' ? 'أمثلة لمهام جاهزة في هذا المجال :' : 'Exemples de missions courantes :'}
              </span>

              {currentAudience.popularTasks.map((t, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:border-brand-300 hover:shadow-xs transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full">
                        {t.budgetDH > 0 ? `${t.budgetDH} DH` : 'Gratuit'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        ⏱️ {t.turnaround}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-1.5 line-clamp-2">
                      {t.title[loc] || t.title.fr}
                    </h4>

                    <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2 mb-3">
                      {t.desc[loc] || t.desc.fr}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (currentAudience.id === 'freelancers') {
                        onOpenQualification();
                      } else {
                        onLaunchTask({
                          title: t.title[loc] || t.title.fr,
                          description: t.desc[loc] || t.desc.fr,
                          rewardDH: t.budgetDH,
                          category: t.category,
                        });
                      }
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-brand-700 hover:text-white text-slate-800 text-xs font-bold py-2 transition cursor-pointer"
                  >
                    <span>
                      {currentAudience.id === 'freelancers'
                        ? 'Démarrer le test'
                        : locale === 'ar'
                        ? 'Commander ce livrable'
                        : 'Lancer cette commande'}
                    </span>
                    <FiArrowRight className="text-[10px]" />
                  </button>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
