'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  FiEdit3,
  FiZap,
  FiFolder,
  FiShield,
  FiArrowRight,
  FiArrowLeft,
  FiCheckCircle,
  FiLock,
  FiClock,
  FiStar,
  FiDollarSign
} from 'react-icons/fi';

interface WorkflowStep {
  step: number;
  icon: React.ReactNode;
  badge: { fr: string; ar: string; en: string };
  title: { fr: string; ar: string; en: string };
  shortDesc: { fr: string; ar: string; en: string };
  details: { fr: string[]; ar: string[]; en: string[] };
  visualPreview: {
    tag: string;
    headline: string;
    subtext: string;
    statsHighlight: string;
  };
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: 1,
    icon: <FiEdit3 className="text-brand-600 text-xl" />,
    badge: {
      fr: 'Étape 1 • Rapide & Gratuit',
      ar: 'المرحلة 1 • سريعة ومجانية',
      en: 'Step 1 • Fast & Free',
    },
    title: {
      fr: 'Vous décrivez votre besoin en quelques mots',
      ar: 'تكتب ما تحتاجه وتحدد ميزانيتك بالدرهم',
      en: 'Describe your task in simple plain words',
    },
    shortDesc: {
      fr: 'Indiquez ce que vous souhaitez réaliser (logo, fichier Excel, traduction, test mobile, démarche) et fixez votre tarif en Dirhams (dès 50 DH).',
      ar: 'حدد ما تريده بالضبط وميزانيتك بالدرهم (ابتداءً من 50 درهم). النشر مجاني بالكامل وبدون أي التزام.',
      en: 'State your goal and price in Moroccan Dirhams (starting from 50 DH). Posting is 100% free with zero commitment.',
    },
    details: {
      fr: [
        'Publication 100% gratuite sans frais initiaux',
        'Modèles de tâches pré-remplis pour gagner du temps',
        'Checklist claire des livrables exigés pour éviter les malentendus',
      ],
      ar: [
        'نشر مجاني 100% بدون أي رسوم مسبقة',
        'نماذج جاهزة للمهام لتوفير وقتك',
        'تحديد مسبق للملفات والنتائج المطلوبة لتفادي أي سوء فهم',
      ],
      en: [
        '100% free posting without upfront commitment',
        'Pre-made Moroccan task templates to save time',
        'Clear deliverable checklist to prevent ambiguity',
      ],
    },
    visualPreview: {
      tag: 'Brouillon instantané',
      headline: '« Saisie de 50 factures sous Excel pour cabinet comptable »',
      subtext: 'Budget fixé : 90 DH • Délai souhaité : 4 heures • Livrable : Tableau .xlsx vérifié',
      statsHighlight: 'Publication en 45 secondes',
    },
  },
  {
    step: 2,
    icon: <FiZap className="text-amber-500 text-xl" />,
    badge: {
      fr: 'Étape 2 • Matchmaking Express',
      ar: 'المرحلة 2 • إسناد فوري وسريع',
      en: 'Step 2 • Express Matchmaking',
    },
    title: {
      fr: 'Un freelance marocain qualifié démarre en 4 minutes',
      ar: 'يبدأ مستقل مغربي تم اختباره العمل خلال 4 دقائق',
      en: 'A verified Moroccan freelancer starts in 4 minutes',
    },
    shortDesc: {
      fr: 'Fini d’attendre 48h et de trier 40 devis copier-coller. Notre algorithme alerte les meilleurs freelances certifiés en ligne.',
      ar: 'وداعاً للانتظار لأيام. النظام يرسل إشعاراً فورياً للمستقلين المؤهلين الحاصلين على أعلى التقييمات والمتصلين الآن.',
      en: 'No waiting 48h or sifting through copy-pasted proposals. The algorithm instantly matches top-rated available performers.',
    },
    details: {
      fr: [
        'Prestataires ayant réussi notre test de rigueur et orthographe',
        'Vérification d’identité par Carte Nationale (CIN) et téléphone',
        'Délai moyen de première réponse : 35 secondes',
      ],
      ar: [
        'مستقلون اجتازوا اختبار الجدية والدقة اللغوية بنجاح',
        'حسابات موثقة بالبطاقة الوطنية (CIN) ورقم الهاتف',
        'متوسط وقت أول استجابة هو 35 ثانية فقط',
      ],
      en: [
        'Performers who passed our timed qualification test',
        'ID verified via Moroccan CIN & phone verification',
        'Average initial response time: 35 seconds',
      ],
    },
    visualPreview: {
      tag: 'Attribution immédiate',
      headline: 'Mehdi A. (Casablanca) a validé et pris en charge votre mission',
      subtext: 'Score : ★ 4.98 (52 tâches réalisées avec succès) • Livrable en cours de traitement',
      statsHighlight: 'Démarrage en 3 min 40 s',
    },
  },
  {
    step: 3,
    icon: <FiFolder className="text-blue-500 text-xl" />,
    badge: {
      fr: 'Étape 3 • Espace de Preuves',
      ar: 'المرحلة 3 • استلام النتائج والملفات',
      en: 'Step 3 • Proof & Deliverables Drawer',
    },
    title: {
      fr: 'Vous recevez les livrables dans votre espace dédié',
      ar: 'تستلم العمل والملفات في مساحتك الخاصة للتحقق منها',
      en: 'You receive all deliverables in your private workspace',
    },
    shortDesc: {
      fr: 'Le freelance remet les fichiers, liens et justificatifs demandés dans le tiroir de preuves pour votre vérification.',
      ar: 'يقوم المستقل برفع ملفات العمل (Excel, PDF, صور عالية الدقة أو روابط المتجر) للتأكد من مطابقتها.',
      en: 'The performer uploads files, links, and proof documents directly for your detailed review.',
    },
    details: {
      fr: [
        'Fichiers sources HD, tableaux Excel, liens ou captures d’écran',
        'Possibilité de demander des corrections gratuites si besoin',
        'Messagerie directe pour échanger en Darija ou Français',
      ],
      ar: [
        'ملفات أصلية، جداول منسقة، لقطات شاشة أو تقارير إيداع',
        'إمكانية طلب تعديلات مجانية إذا لزم الأمر',
        'مراسلة مباشرة وسلسة بالدارجة أو الفرنسية',
      ],
      en: [
        'Source HD files, spreadsheets, links, or photo proofs',
        'Free revisions available if deliverables need adjustment',
        'Direct chat in Moroccan Darija or French',
      ],
    },
    visualPreview: {
      tag: 'Livrables reçus',
      headline: '📁 1 fichier Excel (.xlsx) + 50 reçus réconciliés déposés',
      subtext: '« Bonjour, travail terminé sans aucune erreur. Merci de vérifier le fichier joint. »',
      statsHighlight: 'Remise sous 2h 15 min',
    },
  },
  {
    step: 4,
    icon: <FiShield className="text-emerald-600 text-xl" />,
    badge: {
      fr: 'Étape 4 • Garantie Daman Séquestre',
      ar: 'المرحلة 4 • الأمان وضمان (Daman)',
      en: 'Step 4 • 100% Escrow Daman Guarantee',
    },
    title: {
      fr: 'Vous validez : le freelance est payé. Zéro risque.',
      ar: 'توافق على النتيجة : يستلم المستقل مستحقاته بأمان تام',
      en: 'You approve: performer gets paid. Zero risk.',
    },
    shortDesc: {
      fr: 'L’argent ne quitte le séquestre que lorsque vous cliquez sur "Valider". Vous notez le freelance et tout est réglé.',
      ar: 'لا يتم تحويل المبلغ من صندوق الضمان إلا بعد رضاك الكامل وموافقتك. تضع تقييمك وتنتهي المهمة بسلاسة.',
      en: 'Funds are only released from escrow once you click "Approve". Rate your performer and you’re all done.',
    },
    details: {
      fr: [
        'Protection 100% bilatérale client et prestataire',
        'Remboursement intégral garanti en cas de non-livraison',
        'Paiement viré directement via Remitly ou Binance Pay (USDT)',
      ],
      ar: [
        'حماية مالية كاملة ومتبادلة للطرفين',
        'استرجاع كامل لأموالك في حال عدم الالتزام بالشروط',
        'تحويل سريع للأرباح عبر Remitly أو Binance Pay',
      ],
      en: [
        '100% bilateral protection for both client and freelancer',
        'Full refund guarantee if work is not delivered as specified',
        'Direct payout via Remitly or Binance Pay (USDT)',
      ],
    },
    visualPreview: {
      tag: 'Paiement débloqué',
      headline: '✅ 90 DH débloqués avec succès • Évaluation ★ 5.0 attribuée',
      subtext: '« Bravo pour la rapidité et la précision ! » — Client satisfait',
      statsHighlight: '100% Garanti par Daman',
    },
  },
];

interface MoroccanInteractiveWorkflowProps {
  onPostTask: () => void;
}

export const MoroccanInteractiveWorkflow: React.FC<MoroccanInteractiveWorkflowProps> = ({
  onPostTask,
}) => {
  const { locale, isRTL } = useLanguage();
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);

  const loc = (locale === 'ar' || locale === 'en') ? locale : 'fr';
  const current = WORKFLOW_STEPS[activeStepIdx];

  return (
    <section className="py-14 sm:py-20 bg-surface-soft border-b border-line" id="workflow">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="section-kicker mb-2">Simplicité & Zéro Prise de Tête</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {locale === 'ar'
              ? 'كيف تسير الأمور خطوة بخطوة من البداية إلى الاستلام؟'
              : 'Comment ça marche concrètement de A à Z ?'}
          </h2>
          <p className="mt-2 text-xs sm:text-base text-slate-600">
            {locale === 'ar'
              ? '4 خطوات واضحة ومحمية تضمن لك الجودة والسرعة وحماية أموالك 100%.'
              : 'Cliquez sur les 4 étapes pour comprendre le déroulement exact et la sécurité séquestre.'}
          </p>
        </div>

        {/* 4 Clickable Step Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {WORKFLOW_STEPS.map((st, idx) => {
            const isActive = idx === activeStepIdx;
            return (
              <button
                key={st.step}
                type="button"
                onClick={() => setActiveStepIdx(idx)}
                className={`functional-card p-4 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'border-brand-600 bg-white ring-2 ring-brand-600/15 shadow-sm'
                    : 'bg-white/80 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`h-8 w-8 rounded-xl font-extrabold flex items-center justify-center text-sm ${
                      isActive
                        ? 'bg-brand-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {st.step}
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                    {st.icon}
                  </div>
                </div>

                <div className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                  {st.title[loc] || st.title.fr}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  {st.badge[loc] || st.badge.fr}
                </div>
              </button>
            );
          })}
        </div>

        {/* Step Detail Active Screen */}
        <div className="functional-card p-6 sm:p-9 bg-white border border-slate-200 rounded-3xl shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Description */}
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 px-3.5 py-1 text-xs font-extrabold text-brand-700 mb-3">
                {current.badge[loc] || current.badge.fr}
              </span>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug mb-3">
                {current.title[loc] || current.title.fr}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                {current.shortDesc[loc] || current.shortDesc.fr}
              </p>

              {/* Checklist */}
              <div className="space-y-2.5 mb-8">
                {(current.details[loc] || current.details.fr).map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-800">
                    <FiCheckCircle className="text-emerald-600 text-base shrink-0" />
                    <span className="font-semibold">{item}</span>
                  </div>
                ))}
              </div>

              {/* Navigation between steps */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStepIdx((prev) => (prev > 0 ? prev - 1 : 3))}
                  className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition cursor-pointer"
                >
                  ← Précédent
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStepIdx((prev) => (prev < 3 ? prev + 1 : 0))}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 text-xs font-bold transition cursor-pointer"
                >
                  Suivant →
                </button>
              </div>
            </div>

            {/* Right Interactive Simulator Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6 sm:p-7 rounded-2xl text-white border border-slate-700 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider bg-amber-950/80 border border-amber-500/40 px-2.5 py-0.5 rounded-md">
                    {current.visualPreview.tag}
                  </span>
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <FiShield /> Daman Sécurisé
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug mb-2">
                  {current.visualPreview.headline}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed mb-6 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                  {current.visualPreview.subtext}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-700/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">⚡ Performance :</span>
                <span className="font-black text-brand-400 text-sm">
                  {current.visualPreview.statsHighlight}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Global CTA button */}
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={onPostTask}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold px-8 py-3.5 text-sm sm:text-base shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <span>Lancer ma première tâche sans risque</span>
            {isRTL ? <FiArrowLeft /> : <FiArrowRight />}
          </button>
        </div>

      </div>
    </section>
  );
};
