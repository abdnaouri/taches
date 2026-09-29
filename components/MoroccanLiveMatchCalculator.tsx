'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  FiZap,
  FiClock,
  FiDollarSign,
  FiUsers,
  FiCheckCircle,
  FiArrowRight,
  FiArrowLeft,
  FiSliders,
  FiLayers,
  FiShield
} from 'react-icons/fi';

interface TaskPreset {
  id: string;
  categoryKey: string;
  icon: string;
  label: {
    fr: string;
    ar: string;
    en: string;
  };
  unitLabel: {
    fr: string;
    ar: string;
    en: string;
  };
  basePriceDH: number;
  pricePerUnitDH: number;
  defaultUnits: number;
  minUnits: number;
  maxUnits: number;
  unitStep: number;
  baseHours: number;
  hoursPerUnit: number;
  activeFreelancersCount: number;
  descriptionTemplate: {
    fr: (units: number) => string;
    ar: (units: number) => string;
    en: (units: number) => string;
  };
}

const TASK_PRESETS: TaskPreset[] = [
  {
    id: 'excel_invoices',
    categoryKey: 'assistance',
    icon: '📊',
    label: {
      fr: 'Saisie factures & extraction sous Excel',
      ar: 'إدخال وتفريغ الفواتير في جدول إكسيل',
      en: 'Invoice data entry & extraction into Excel',
    },
    unitLabel: {
      fr: 'factures / reçus',
      ar: 'فاتورة / وصل',
      en: 'invoices / receipts',
    },
    basePriceDH: 50,
    pricePerUnitDH: 1.5,
    defaultUnits: 40,
    minUnits: 10,
    maxUnits: 300,
    unitStep: 10,
    baseHours: 2,
    hoursPerUnit: 0.05,
    activeFreelancersCount: 46,
    descriptionTemplate: {
      fr: (u) => `Saisie propre et structurée de ${u} factures / tickets dans un tableau Excel avec vérification des totaux TTC, TVA et date. Fichier .xlsx livré sans erreur.`,
      ar: (u) => `إدخال دقيق ومنسق لعدد ${u} فاتورة في جدول Excel مع تدقيق الحسابات ومجاميع الضريبة والتاريخ. تسليم ملف xlsx جاهز.`,
      en: (u) => `Accurate entry of ${u} invoices/receipts into structured Excel with automated totals and VAT calculations. Clean .xlsx delivery.`,
    },
  },
  {
    id: 'logo_branding',
    categoryKey: 'design',
    icon: '🎨',
    label: {
      fr: 'Logo pro & Identité visuelle (Vectoriel + HD)',
      ar: 'تصميم شعار احترافي وهوية بصرية كاملة',
      en: 'Professional logo & brand visual identity',
    },
    unitLabel: {
      fr: 'propositions de logo',
      ar: 'نماذج مقترحة للشعار',
      en: 'logo initial concepts',
    },
    basePriceDH: 120,
    pricePerUnitDH: 50,
    defaultUnits: 2,
    minUnits: 1,
    maxUnits: 5,
    unitStep: 1,
    baseHours: 4,
    hoursPerUnit: 2,
    activeFreelancersCount: 68,
    descriptionTemplate: {
      fr: (u) => `Création d'un logo moderne et mémorable avec ${u} pistes graphiques différentes. Remise des fichiers vectoriels .AI, .PNG transparents haute résolution et versions réseaux sociaux.`,
      ar: (u) => `ابتكار شعار عصري مع ${u} نماذج مختلفة للاختيار. تسليم الملفات المفتوحة AI و PNG بخلفية شفافة وملفات الطباعة.`,
      en: (u) => `Creation of modern logo with ${u} distinct creative concepts. Full delivery of vector .AI, transparent PNG, and social media formats.`,
    },
  },
  {
    id: 'translation_darija_fr',
    categoryKey: 'copywriting',
    icon: '📄',
    label: {
      fr: 'Traduction Arabe / Darija vers Français',
      ar: 'ترجمة من العربية والدارجة إلى الفرنسية',
      en: 'Arabic / Darija to French translation',
    },
    unitLabel: {
      fr: 'pages (environ 300 mots/page)',
      ar: 'صفحة (حوالي 300 كلمة/صفحة)',
      en: 'pages (~300 words/page)',
    },
    basePriceDH: 40,
    pricePerUnitDH: 25,
    defaultUnits: 3,
    minUnits: 1,
    maxUnits: 25,
    unitStep: 1,
    baseHours: 2,
    hoursPerUnit: 1,
    activeFreelancersCount: 39,
    descriptionTemplate: {
      fr: (u) => `Traduction fidèle et fluide de ${u} page(s) du document (contrat, mémoire, correspondance ou message Darija/Arabe) vers un français irréprochable sous Word.`,
      ar: (u) => `ترجمة دقيقة وسلسة لعدد ${u} صفحة من الوثيقة إلى لغة فرنسية سليمة وخالية من الأخطاء في ملف Word منسق.`,
      en: (u) => `Accurate translation of ${u} page(s) from Arabic/Darija into polished French. Word deliverable included.`,
    },
  },
  {
    id: 'youcan_products',
    categoryKey: 'development',
    icon: '🛍️',
    label: {
      fr: 'Ajout de fiches produits YouCan / Shopify',
      ar: 'إدخال وتنسيق منتجات على متجر يوكان أو شوبيفاي',
      en: 'Product uploads to YouCan Shop / Shopify',
    },
    unitLabel: {
      fr: 'fiches produits complètes',
      ar: 'منتج مع الوصف والصور',
      en: 'complete product listings',
    },
    basePriceDH: 60,
    pricePerUnitDH: 7,
    defaultUnits: 15,
    minUnits: 5,
    maxUnits: 100,
    unitStep: 5,
    baseHours: 3,
    hoursPerUnit: 0.15,
    activeFreelancersCount: 52,
    descriptionTemplate: {
      fr: (u) => `Ajout de ${u} produits sur ma boutique en ligne : photos nettoyées, titre attractif, description vendeuse en Français/Darija, variantes de stock et prix.`,
      ar: (u) => `إضافة وتنسيق ${u} منتج في المتجر: تنظيف الصور، كتابة عنوان جذاب، وصف تسويقي بالدارجة والفرنسية وضبط الأسعار.`,
      en: (u) => `Upload of ${u} products to e-commerce store: image retouching, persuasive copy in French/Darija, and variants setup.`,
    },
  },
  {
    id: 'reels_editing',
    categoryKey: 'marketing',
    icon: '📱',
    label: {
      fr: 'Montage vidéo dynamique TikTok & Reels Instagram',
      ar: 'مونتاج فيديو قصير واحترافي لتيك توك وإنستغرام',
      en: 'Dynamic TikTok & Instagram Reels video editing',
    },
    unitLabel: {
      fr: 'vidéos courtes (30-60 sec)',
      ar: 'فيديو قصير (30 إلى 60 ثانية)',
      en: 'short videos (30-60s)',
    },
    basePriceDH: 70,
    pricePerUnitDH: 45,
    defaultUnits: 2,
    minUnits: 1,
    maxUnits: 10,
    unitStep: 1,
    baseHours: 3,
    hoursPerUnit: 2,
    activeFreelancersCount: 58,
    descriptionTemplate: {
      fr: (u) => `Montage dynamique de ${u} vidéo(s) verticale(s) 9:16 pour Instagram Reels / TikTok : sous-titres animés en Darija/Français, zooms, musique tendance et transitions captivantes.`,
      ar: (u) => `مونتاج احترافي لعدد ${u} فيديو عمودي: كتابة نصوص متحركة بالدارجة أو الفرنسية، مؤثرات بصرية وصوتية مناسبة للتسويق.`,
      en: (u) => `High-energy editing for ${u} vertical video(s): animated captions, sound design, hooks, and trending style for TikTok/Reels.`,
    },
  },
  {
    id: 'morocco_errand_doc',
    categoryKey: 'micro',
    icon: '🏛️',
    label: {
      fr: 'Démarche physique / Dépôt de pli à Rabat ou Casa',
      ar: 'إيداع رسمي لوثيقة أو مهمة ميدانية بالرباط أو البيضاء',
      en: 'Physical errand / registry filing in Rabat or Casablanca',
    },
    unitLabel: {
      fr: 'adresse(s) / bureau(x) d’ordre',
      ar: 'عنوان أو إدارة',
      en: 'location(s) / public registries',
    },
    basePriceDH: 80,
    pricePerUnitDH: 50,
    defaultUnits: 1,
    minUnits: 1,
    maxUnits: 5,
    unitStep: 1,
    baseHours: 3,
    hoursPerUnit: 2,
    activeFreelancersCount: 34,
    descriptionTemplate: {
      fr: (u) => `Récupération de pli et dépôt physique auprès de ${u} bureau(x) d'ordre / administration avec récépissé tamponné et photo immédiate.`,
      ar: (u) => `استلام وثائق وإيداعها رسمياً في ${u} إدارة أو مكتب ضبط وأخذ وصل الإيداع المختوم والمؤرخ وإرسال صورته فوراً.`,
      en: (u) => `Pickup and physical submission to ${u} office(s)/registry with photo of the official stamped receipt sent immediately.`,
    },
  },
  {
    id: 'supplier_calls_darija',
    categoryKey: 'assistance',
    icon: '📞',
    label: {
      fr: 'Appels téléphoniques de grossistes & fournisseurs en Darija',
      ar: 'الاتصال بالموردين والتجار هاتفياً بالدارجة المغربية',
      en: 'Wholesale supplier phone outreach in Moroccan Darija',
    },
    unitLabel: {
      fr: 'fournisseurs à contacter',
      ar: 'مورد أو محل تجاري',
      en: 'suppliers to call',
    },
    basePriceDH: 40,
    pricePerUnitDH: 8,
    defaultUnits: 8,
    minUnits: 3,
    maxUnits: 50,
    unitStep: 1,
    baseHours: 2,
    hoursPerUnit: 0.25,
    activeFreelancersCount: 41,
    descriptionTemplate: {
      fr: (u) => `Appel direct en Darija de ${u} fournisseurs ou boutiques pour demander les tarifs de gros, disponibilités et modalités de livraison avec tableau récapitulatif.`,
      ar: (u) => `الاتصال هاتفياً بالدارجة بـ ${u} تاجر جملة والسؤال عن الأسعار وتوفر السلع وتلخيص النتائج في جدول واضح.`,
      en: (u) => `Direct phone calls in Moroccan Darija to ${u} suppliers to check wholesale prices, stock, and delivery terms with summary table.`,
    },
  },
];

interface MoroccanLiveMatchCalculatorProps {
  onLaunchCustomTask: (task: {
    title: string;
    description: string;
    rewardDH: number;
    category: string;
  }) => void;
}

export const MoroccanLiveMatchCalculator: React.FC<MoroccanLiveMatchCalculatorProps> = ({
  onLaunchCustomTask,
}) => {
  const { locale, isRTL } = useLanguage();
  const [selectedPresetId, setSelectedPresetId] = useState<string>(TASK_PRESETS[0].id);
  const [units, setUnits] = useState<number>(TASK_PRESETS[0].defaultUnits);
  const [livePerformersCount, setLivePerformersCount] = useState<number>(48);

  React.useEffect(() => {
    fetch('/api/activity')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.activePerformersCount) {
          setLivePerformersCount(data.activePerformersCount);
        }
      })
      .catch(() => {});
  }, []);

  const currentPreset = TASK_PRESETS.find((p) => p.id === selectedPresetId) || TASK_PRESETS[0];

  const handleSelectPreset = (p: TaskPreset) => {
    setSelectedPresetId(p.id);
    setUnits(p.defaultUnits);
  };

  // Price Calculation in Dirhams (rounded to friendly numbers)
  const totalBudgetDH = Math.max(
    50,
    Math.round(currentPreset.basePriceDH + (units - currentPreset.minUnits) * currentPreset.pricePerUnitDH)
  );

  // Turnaround hours
  const totalHours = Math.max(
    1,
    Math.round(currentPreset.baseHours + (units - currentPreset.minUnits) * currentPreset.hoursPerUnit)
  );

  const loc = (locale === 'ar' || locale === 'en') ? locale : 'fr';

  const localizedTitle = currentPreset.label[loc] || currentPreset.label.fr;
  const localizedUnitLabel = currentPreset.unitLabel[loc] || currentPreset.unitLabel.fr;
  const localizedDesc = currentPreset.descriptionTemplate[loc](units);

  const handleLaunch = () => {
    onLaunchCustomTask({
      title: `${localizedTitle} (${units} ${localizedUnitLabel})`,
      description: localizedDesc,
      rewardDH: totalBudgetDH,
      category: currentPreset.categoryKey,
    });
  };

  return (
    <section className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-14 sm:py-20 border-b border-slate-800 relative overflow-hidden" id="live-calculator">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-brand-500/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-950/90 border border-emerald-500/40 px-3.5 py-1 text-xs font-bold text-emerald-400 mb-3 shadow-inner">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              {locale === 'ar'
                ? 'حاسبة التكلفة والوقت والإسناد المباشر بالمغرب'
                : 'Simulateur Instantané & Matchmaking Maroc'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {locale === 'ar'
              ? 'كم ستكلفك مهمتك وما هو وقت إنجازها؟'
              : 'Combien coûte votre tâche et en combien de temps ?'}
          </h2>
          <p className="mt-2 text-xs sm:text-base text-slate-300 font-normal leading-relaxed">
            {locale === 'ar'
              ? 'اختر نوع الخدمة، حدد الكمية، وشاهد التكلفة التقريبية بالدرهم وعدد المستقلين الجاهزين للبدء الآن.'
              : 'Sélectionnez un service courant, ajustez le volume et découvrez le tarif en Dirhams et les freelances connectés.'}
          </p>
        </div>

        {/* Interactive Preset Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none justify-start sm:justify-center">
          {TASK_PRESETS.map((preset) => {
            const isSelected = preset.id === selectedPresetId;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-md border border-brand-400 ring-2 ring-brand-400/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700'
                }`}
              >
                <span>{preset.icon}</span>
                <span>{preset.label[loc] || preset.label.fr}</span>
              </button>
            );
          })}
        </div>

        {/* Main 2-Column Calculator Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Scope & Slider Customization */}
          <div className="lg:col-span-7 bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-700 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-700/80 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2.5 rounded-xl bg-slate-700/60 border border-slate-600">
                    {currentPreset.icon}
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-white">
                      {localizedTitle}
                    </h3>
                    <span className="text-xs text-slate-400">
                      {locale === 'ar' ? 'نموذج مباشر جاهز للنشر' : 'Modèle vérifié avec livrables clairs'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Slider for volume / units */}
              <div className="mb-6 bg-slate-900/70 p-4 sm:p-5 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <FiSliders className="text-brand-400" />
                    <span>{locale === 'ar' ? 'حدد الحجم أو الكمية المطلوب إنجازها :' : 'Volume ou quantité à traiter :'}</span>
                  </span>
                  <span className="text-brand-400 font-black text-sm bg-brand-950/80 border border-brand-500/40 px-2.5 py-0.5 rounded-lg">
                    {units} {localizedUnitLabel}
                  </span>
                </div>

                <input
                  type="range"
                  min={currentPreset.minUnits}
                  max={currentPreset.maxUnits}
                  step={currentPreset.unitStep}
                  value={units}
                  onChange={(e) => setUnits(Number(e.target.value))}
                  className="w-full accent-brand-500 h-2 bg-slate-700 rounded-lg cursor-pointer my-3"
                />

                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Min: {currentPreset.minUnits}</span>
                  <span>Défaut: {currentPreset.defaultUnits}</span>
                  <span>Max: {currentPreset.maxUnits}</span>
                </div>
              </div>

              {/* Generated Brief Preview */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/80 text-xs">
                <div className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                  <FiLayers className="text-emerald-400" />
                  <span>{locale === 'ar' ? 'نص التعليمات التلقائي للمستقل :' : 'Consignes automatiques qui seront transmises :'}</span>
                </div>
                <p className="text-slate-200 leading-relaxed italic">
                  « {localizedDesc} »
                </p>
              </div>
            </div>

            {/* Micro reassurance notes */}
            <div className="mt-6 pt-4 border-t border-slate-700/80 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <FiCheckCircle />
                <span>Sans engagement</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <FiShield className="text-brand-400" />
                <span>Paiement sous séquestre Daman</span>
              </span>
            </div>
          </div>

          {/* Right Column: Live Match Radar & Instant Order Action */}
          <div className="lg:col-span-5 bg-gradient-to-br from-brand-950 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 border border-brand-500/40 flex flex-col justify-between shadow-2xl relative">
            
            <div>
              {/* Live Availability Badge */}
              <div className="flex items-center justify-between mb-4 bg-emerald-950/80 border border-emerald-500/40 p-3 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{livePerformersCount} freelances actifs</span>
                </div>
                <span className="text-[10px] text-slate-300 font-semibold bg-emerald-900/60 px-2 py-0.5 rounded">
                  100% Maroc
                </span>
              </div>

              {/* Price Display */}
              <div className="text-center py-4 bg-slate-900/80 rounded-2xl border border-slate-800 mb-5">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold block mb-1">
                  {locale === 'ar' ? 'الميزانية الموصى بها' : 'Tarif conseillé en Dirhams'}
                </span>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {totalBudgetDH} <span className="text-2xl sm:text-3xl text-brand-400 font-extrabold">DH</span>
                </div>
                <span className="text-xs text-slate-400 mt-1 block">
                  (~{(totalBudgetDH / 10).toFixed(0)} € • Zéro commission cachée)
                </span>
              </div>

              {/* Turnaround & Matching Speed */}
              <div className="space-y-2.5 mb-6 text-xs text-slate-300">
                <div className="flex items-center justify-between p-2.5 bg-slate-800/70 rounded-xl border border-slate-700/60">
                  <span className="flex items-center gap-2">
                    <FiClock className="text-amber-400 text-sm" />
                    <span>Délai de livraison estimé :</span>
                  </span>
                  <span className="font-extrabold text-white text-sm">~{totalHours} heures</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-800/70 rounded-xl border border-slate-700/60">
                  <span className="flex items-center gap-2">
                    <FiZap className="text-brand-400 text-sm" />
                    <span>Temps moyen de 1ère réponse :</span>
                  </span>
                  <span className="font-extrabold text-emerald-400 text-sm">35 secondes</span>
                </div>
              </div>
            </div>

            {/* Big Action Button */}
            <div>
              <button
                type="button"
                onClick={handleLaunch}
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white px-6 py-4 text-base font-extrabold shadow-lg hover:shadow-brand-500/25 transition-all transform active:scale-98 cursor-pointer"
              >
                <FiZap className="text-lg text-amber-300" />
                <span>
                  {locale === 'ar'
                    ? `إطلاق هذه المهمة فوراً (${totalBudgetDH} درهم)`
                    : `Lancer cette tâche tout de suite (${totalBudgetDH} DH)`}
                </span>
                {isRTL ? <FiArrowLeft /> : <FiArrowRight />}
              </button>

              <p className="text-[11px] text-center text-slate-400 mt-3">
                🔒 Votre paiement est conservé sous séquestre et n’est versé qu’après validation.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
