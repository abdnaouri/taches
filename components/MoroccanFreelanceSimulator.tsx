'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FiDollarSign,
  FiShield,
  FiCalendar,
  FiTrendingUp,
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiInfo,
} from 'react-icons/fi';

interface MoroccanFreelanceSimulatorProps {
  locale?: string;
  defaultTjm?: number;
}

export function MoroccanFreelanceSimulator({
  locale = 'fr',
  defaultTjm = 450,
}: MoroccanFreelanceSimulatorProps) {
  const isAr = locale === 'ar';

  const [tjm, setTjm] = useState<number>(defaultTjm);
  const [daysPerMonth, setDaysPerMonth] = useState<number>(18);
  const [activityType, setActivityType] = useState<'service' | 'commerce'>('service');
  const [includeCnss, setIncludeCnss] = useState<boolean>(true);

  // Moroccan Auto-Entrepreneur Law 2026 calculations:
  // Prestations de service: 2% impôt IR (seuil 200 000 MAD / an)
  // Commerce / E-commerce: 1% impôt IR (seuil 500 000 MAD / an)
  // CNSS AMO forfaitaire estimée: ~150 MAD / mois pour indépendant
  const taxRate = activityType === 'service' ? 0.02 : 0.01;
  const cnssAmoMonthly = includeCnss ? 150 : 0;

  const grossMonthly = useMemo(() => tjm * daysPerMonth, [tjm, daysPerMonth]);
  const grossAnnual = useMemo(() => grossMonthly * 12, [grossMonthly]);

  const taxMonthly = useMemo(() => Math.round(grossMonthly * taxRate), [grossMonthly, taxRate]);
  const netMonthly = useMemo(
    () => Math.max(0, grossMonthly - taxMonthly - cnssAmoMonthly),
    [grossMonthly, taxMonthly, cnssAmoMonthly]
  );

  const hourlyRate = useMemo(() => Math.round(tjm / 7), [tjm]);

  // Annual threshold warning (200k for service, 500k for commerce)
  const ceiling = activityType === 'service' ? 200000 : 500000;
  const ceilingExceeded = grossAnnual > ceiling;

  return (
    <div
      id="simulateur-tjm"
      className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 my-10 relative overflow-hidden"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-600 via-blue-500 to-emerald-500" />

      {/* Header */}
      <div className="max-w-3xl mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-bold text-emerald-800 mb-3">
          <FiTrendingUp className="text-emerald-600" />
          <span>
            {isAr
              ? 'حاسبة العمل الحر والضريبة بالمغرب 2026'
              : 'Simulateur Officiel TJM & Revenu Net Auto-Entrepreneur Maroc 2026'}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {isAr
            ? 'كم ستربح شهرياً كـ مستقل (Freelance) في المغرب؟'
            : 'Combien allez-vous gagner en Freelance au Maroc ?'}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
          {isAr
            ? 'احسب دخلك الصافي بعد خصم الضريبة المقتطعة للتشغيل الذاتي (1% أو 2%) واشتراكات التغطية الصحية CNSS/AMO.'
            : 'Estimez vos revenus nets réels selon le barème officiel de la Direction Générale des Impôts (DGI) et de la CNSS.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Activity Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              {isAr ? 'نوع النشاط القانوني' : 'Nature de l’activité (Statut Auto-Entrepreneur)'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActivityType('service')}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  activityType === 'service'
                    ? 'border-brand-600 bg-brand-50/50 shadow-xs ring-1 ring-brand-500'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div
                  className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center ${
                    activityType === 'service'
                      ? 'border-brand-600 bg-brand-600'
                      : 'border-slate-400 bg-white'
                  }`}
                >
                  {activityType === 'service' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {isAr ? 'تقديم الخدمات (2%)' : 'Prestation de Services (2%)'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {isAr
                      ? 'برمجة، تصميم، تسويق، ترجمة'
                      : 'Dév web, graphisme, marketing, saisie, conseil'}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActivityType('commerce')}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  activityType === 'commerce'
                    ? 'border-brand-600 bg-brand-50/50 shadow-xs ring-1 ring-brand-500'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div
                  className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center ${
                    activityType === 'commerce'
                      ? 'border-brand-600 bg-brand-600'
                      : 'border-slate-400 bg-white'
                  }`}
                >
                  {activityType === 'commerce' && (
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {isAr ? 'تجارة وصناعة (1%)' : 'Commerce & E-commerce (1%)'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {isAr ? 'بيع المنتجات، دروبشيبينغ، أشغال يدوية' : 'Boutique en ligne, artisanat, vente directe'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* TJM Slider */}
          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label htmlFor="tjm-slider" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  {isAr ? 'سعر اليوم التقديري (TJM)' : 'Tarif Journalier Moyen (TJM)'}
                </label>
                <div className="text-xs text-slate-400 mt-0.5">
                  {isAr ? 'معدل الأجر اليومي المقترح للزبون' : 'Soit environ ~' + hourlyRate + ' DH / heure (base 7h)'}
                </div>
              </div>
              <div className="flex items-center gap-1 bg-white px-3.5 py-1.5 rounded-xl border border-slate-300 shadow-2xs font-black text-brand-700 text-lg">
                <input
                  id="tjm-input"
                  type="number"
                  aria-label={isAr ? 'سعر اليوم بالدرهم' : 'Tarif Journalier Moyen en Dirhams'}
                  value={tjm}
                  onChange={(e) => setTjm(Math.max(50, Math.min(10000, Number(e.target.value) || 0)))}
                  className="w-20 text-right font-black focus:outline-none bg-transparent"
                />
                <span className="text-xs font-bold text-slate-500">DH</span>
              </div>
            </div>

            <input
              id="tjm-slider"
              type="range"
              min={100}
              max={2500}
              step={50}
              value={tjm}
              onChange={(e) => setTjm(Number(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />

            <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-2">
              <span>100 DH (Débutant / Micro-tâche)</span>
              <span>450 DH (Médian)</span>
              <span>1 500+ DH (Senior / Tech)</span>
            </div>
          </div>

          {/* Working Days per Month Slider */}
          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label htmlFor="days-slider" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  {isAr ? 'أيام العمل شهرياً' : 'Jours travaillés / facturés par mois'}
                </label>
                <div className="text-xs text-slate-400 mt-0.5">
                  {isAr ? 'في المتوسط 15 إلى 20 يوماً للمستقلين' : 'Moyenne observée : 16 à 20 jours/mois'}
                </div>
              </div>
              <div className="bg-white px-3.5 py-1.5 rounded-xl border border-slate-300 shadow-2xs font-black text-slate-900 text-lg">
                {daysPerMonth} <span className="text-xs font-bold text-slate-500">{isAr ? 'أيام' : 'jours'}</span>
              </div>
            </div>

            <input
              id="days-slider"
              type="range"
              min={4}
              max={26}
              step={1}
              value={daysPerMonth}
              onChange={(e) => setDaysPerMonth(Number(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>

          {/* CNSS Checkbox */}
          <div className="flex items-center justify-between px-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={includeCnss}
                onChange={(e) => setIncludeCnss(e.target.checked)}
                className="h-4 w-4 rounded-md accent-brand-600 text-brand-600 border-slate-300"
              />
              <span>
                {isAr
                  ? 'خصم اشتراك التغطية الصحية الإجبارية (AMO CNSS ~150 درهم)'
                  : 'Déduire la cotisation obligatoire AMO CNSS (~150 DH / mois)'}
              </span>
            </label>
          </div>
        </div>

        {/* Results Card Column (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-700">
          <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 mb-2">
            {isAr ? 'صافي الدخل التقديري في يدك' : 'Votre Revenu Net Réel en Poche'}
          </div>

          {/* Big Number */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              {netMonthly.toLocaleString('fr-FR')}
            </span>
            <span className="text-lg font-bold text-slate-400">DH / {isAr ? 'شهر' : 'mois'}</span>
          </div>

          {/* Breakdown Items */}
          <div className="space-y-3 pt-4 border-t border-slate-700/80 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-slate-300">
              <span>{isAr ? 'رقم المعاملات الإجمالي (CA Brut)' : 'Chiffre d’affaires brut'}</span>
              <span className="font-bold text-white">
                {grossMonthly.toLocaleString('fr-FR')} DH
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span>{isAr ? 'الضريبة المستحقة (DGI)' : 'Impôt IR Forfaitaire'}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-bold">
                  {activityType === 'service' ? '2%' : '1%'}
                </span>
              </span>
              <span className="font-semibold text-rose-400">
                - {taxMonthly.toLocaleString('fr-FR')} DH
              </span>
            </div>

            {includeCnss && (
              <div className="flex items-center justify-between text-slate-300">
                <span>{isAr ? 'اشتراك AMO CNSS' : 'Cotisation AMO CNSS'}</span>
                <span className="font-semibold text-rose-400">- {cnssAmoMonthly} DH</span>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-300 pt-2 border-t border-slate-700/50">
              <span>{isAr ? 'رقم المعاملات السنوي' : 'CA Annuel projeté'}</span>
              <span className="font-bold text-white">
                {grossAnnual.toLocaleString('fr-FR')} DH
              </span>
            </div>
          </div>

          {/* Ceiling Warning Notice */}
          {ceilingExceeded ? (
            <div className="mt-4 p-3 rounded-xl bg-amber-500/20 border border-amber-400/30 text-[11px] text-amber-200 leading-relaxed flex items-start gap-2">
              <FiInfo className="text-base shrink-0 mt-0.5 text-amber-300" />
              <span>
                {isAr
                  ? `تنبيه: ميزانيتك السنوية تجاوزت سقف المقاول الذاتي (${ceiling.toLocaleString(
                      'fr-FR'
                    )} درهم). يُفضل الانتقال لنظام SARL-AU.`
                  : `Attention : Vous dépassez le plafond auto-entrepreneur (${ceiling.toLocaleString(
                      'fr-FR'
                    )} DH/an). Le passage en SARL-AU est recommandé.`}
              </span>
            </div>
          ) : (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-[11px] text-emerald-200 leading-relaxed flex items-center gap-2">
              <FiCheckCircle className="text-base shrink-0 text-emerald-400" />
              <span>
                {isAr
                  ? 'متوافق 100% مع سقف المقاول الذاتي في المغرب.'
                  : 'Parfaitement conforme aux plafonds légaux Auto-Entrepreneur Maroc.'}
              </span>
            </div>
          )}

          {/* Escrow Guarantee Callout */}
          <div className="mt-5 p-3.5 rounded-2xl bg-brand-900/40 border border-brand-500/30 flex items-center gap-3">
            <FiShield className="text-brand-400 text-2xl shrink-0" />
            <div className="text-xs text-slate-300">
              <span className="font-bold text-white">
                {isAr ? 'ضمان 100% ضد الامتناع عن الدفع :' : 'Sécurité Séquestre Daman :'}
              </span>{' '}
              {isAr
                ? 'أموالك تكون محجوزة مسبقاً قبل بدء العمل وتصلك مباشرة بدون وساطة.'
                : 'Fini les factures impayées. Vos gains sont garantis avant même le démarrage.'}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-6 space-y-2">
            <Link
              href={`/${locale}/tasks`}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white px-5 py-3 text-sm font-bold shadow-md transition-all"
            >
              <span>{isAr ? 'ابحث عن مشاريع بهذا السعر' : 'Trouver des missions à ce tarif'}</span>
              <FiArrowRight />
            </Link>

            <Link
              href={`/${locale}/tasks/new`}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 text-xs font-bold transition-all"
            >
              <FiBriefcase />
              <span>{isAr ? 'نشر مهمة وتوظيف مستقل' : 'Recruter un freelance à ce tarif'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
