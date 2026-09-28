'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  FiZap,
  FiShield,
  FiSmartphone,
  FiMapPin,
  FiPhoneCall,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiUsers,
  FiArrowRight,
  FiArrowLeft,
  FiPlus,
  FiActivity,
  FiAward,
  FiTrendingUp,
  FiDollarSign,
  FiLock,
  FiCheck
} from 'react-icons/fi';

interface WorkzillaDifferentiatorsProps {
  onLaunchTask: (prefill: {
    title: string;
    description: string;
    rewardDH: number;
    category: string;
  }) => void;
  onOpenQualification?: () => void;
}

export const WorkzillaDifferentiators: React.FC<WorkzillaDifferentiatorsProps> = ({
  onLaunchTask,
  onOpenQualification,
}) => {
  const { locale, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'express' | 'device' | 'trust'>('express');

  // Quick Micro-tasks and Device-Specific Templates (Workzilla's signature use cases)
  const signatureTemplates = [
    {
      id: 'samsung-test',
      icon: '📱',
      badge: 'Test Appareil',
      title: {
        fr: 'Test d’application sur Samsung Galaxy / Android au Maroc',
        ar: 'اختبار تطبيق هاتفي على هواتف سامسونج وأندرويد بالمغرب',
        en: 'Mobile app test on Samsung Galaxy / Android in Morocco',
      },
      desc: {
        fr: 'Tester l’inscription, le panier et la réception du SMS de validation OTP sur le réseau Maroc Telecom / Inwi / Orange avec envoi de 5 captures d’écran.',
        ar: 'تجربة التسجيل والسلة واستلام كود التحقق OTP عبر شبكات الاتصال المغربية مع إرسال 5 لقطات شاشة واضحة.',
        en: 'Test registration, cart checkout, and SMS OTP verification across Moroccan telecom networks with 5 screenshots.',
      },
      priceDH: 60,
      turnaround: '2h',
      category: 'micro',
      device: 'Samsung / Android',
    },
    {
      id: 'iphone-test',
      icon: '🍏',
      badge: 'Test iOS',
      title: {
        fr: 'Test d’affichage et Safari sur iPhone 13+ / iOS',
        ar: 'اختبار تصفح وعرض الموقع على متصفح Safari وهواتف آيفون',
        en: 'Safari & iOS layout test on iPhone 13+ in Morocco',
      },
      desc: {
        fr: 'Vérifier l’affichage du menu responsive et le parcours de commande sur iPhone avec Safari mobile et signaler les bugs éventuels.',
        ar: 'التحقق من عمل القائمة الجانبية وإتمام الطلب على متصفح Safari بالآيفون وتوثيق أي خلل في التنسيق.',
        en: 'Verify responsive menu behavior and checkout funnel on iPhone via mobile Safari, logging any UI bugs.',
      },
      priceDH: 80,
      turnaround: '2h',
      category: 'micro',
      device: 'iPhone iOS',
    },
    {
      id: 'rabat-errand',
      icon: '🏛️',
      badge: 'Démarche Terrain',
      title: {
        fr: 'Dépôt urgent de document au bureau d’ordre à Rabat / Casa',
        ar: 'إيداع مستعجل لوثيقة بمكتب الضبط بمدينة الرباط أو الدار البيضاء',
        en: 'Urgent physical file submission to registry office in Rabat / Casa',
      },
      desc: {
        fr: 'Récupération d’un pli fermé et dépôt physique avec obtention du récépissé officiel tamponné et daté, avec photo transmise sous 2h.',
        ar: 'استلام ظرف مغلق وإيداعه رسمياً وأخذ وصل الإيداع المختوم والمؤرخ وإرسال صورته فوراً.',
        en: 'Pickup of a sealed envelope and delivery to public registry with a stamped receipt photo sent within 2 hours.',
      },
      priceDH: 140,
      turnaround: '3h',
      category: 'micro',
      city: 'Rabat / Casablanca',
    },
    {
      id: 'supplier-call',
      icon: '📞',
      badge: 'Appel en Darija',
      title: {
        fr: 'Appel téléphonique de 5 grossistes en Darija pour vérifier le stock',
        ar: 'الاتصال هاتفياً بـ 5 تجار جملة بالدارجة المغربية للتأكد من الأسعار والسلع',
        en: 'Call 5 Moroccan wholesale suppliers in Darija to verify stock & prices',
      },
      desc: {
        fr: 'Appeler 5 boutiques/fournisseurs à Casablanca (Derb Ghallef / Garage Allal), demander les prix et disponibilités en Darija, et remplir un compte-rendu.',
        ar: 'التواصل بالهاتف مع 5 موردين في الدار البيضاء والسؤال عن الأسعار وتوفر السلع وتلخيص النتائج في جدول سريع.',
        en: 'Call 5 suppliers in Casablanca in Moroccan Darija, check stock and pricing, and compile a quick summary table.',
      },
      priceDH: 100,
      turnaround: '4h',
      category: 'assistance',
      city: 'Casablanca',
    },
    {
      id: 'handwriting-excel',
      icon: '📝',
      badge: 'Saisie Rapide',
      title: {
        fr: 'Transcription de 15 pages manuscrites / reçus vers Excel propre',
        ar: 'تحويل وتفريغ 15 صفحة مكتوبة بخط اليد أو فواتير ورقية إلى جدول Excel',
        en: 'Transcription of 15 handwritten notes / paper receipts to clean Excel',
      },
      desc: {
        fr: 'Recopie fidèle de notes manuscrites scannées et de tickets de caisse dans un tableau Excel avec calcul automatique des totaux.',
        ar: 'إدخال دقيق للبيانات المكتوبة بخط اليد وفواتير الصندوق في ملف إكسيل منسق مع جمع العمليات الحسابية.',
        en: 'Accurate transcription of scanned handwritten notes and paper receipts into structured Excel with automated totals.',
      },
      priceDH: 90,
      turnaround: '6h',
      category: 'assistance',
      city: 'En ligne',
    },
    {
      id: 'photo-audit',
      icon: '📸',
      badge: 'Photos sur Place',
      title: {
        fr: 'Vérification et 10 photos d’un appartement ou magasin à Marrakech',
        ar: 'معاينة والتقاط 10 صور واضحة لشقة أو محل تجاري بمراكش',
        en: 'On-site visual check & 10 photos of a property or retail store in Marrakech',
      },
      desc: {
        fr: 'Se déplacer sur place pour vérifier l’état extérieur et intérieur d’un bien et envoyer 10 photos nettes géolocalisées sous 4h.',
        ar: 'التوجه لعين المكان وتصوير 10 صور واضحة لمحل أو شقة للتأكد من الحالة العامة وإرسالها مباشرة.',
        en: 'Visit the address to verify interior and exterior condition, sending 10 sharp geo-tagged photos within 4 hours.',
      },
      priceDH: 150,
      turnaround: '4h',
      category: 'micro',
      city: 'Marrakech',
    },
  ];

  return (
    <section className="py-12 bg-white border-t border-slate-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200/80 px-4 py-1 text-xs font-bold text-brand-700 mb-3 shadow-2xs">
            <FiZap className="text-amber-500 text-sm" />
            <span>
              {locale === 'ar'
                ? 'لماذا تختلف منصة tâches.ma عن منصات العمل التقليدية؟'
                : 'L’expérience Workzilla adaptée au Maroc'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {locale === 'ar'
              ? 'سرعة الإسناد، مهام متخصصة، وضمان بنكي 100%'
              : 'Des fonctionnalités uniques qui changent tout'}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            {locale === 'ar'
              ? 'وداعاً للانتظار لأيام وتضييع الوقت في قراءة العروض العشوائية. مهمتك تبدأ في أقل من 5 دقائق مع خبير معتمد.'
              : 'Plus besoin d’attendre 48h et de lire 50 propositions copier-coller. Votre mission démarre en 4 minutes avec un freelance testé et qualifié.'}
          </p>

          {/* Differentiator Sub-tabs */}
          <div className="mt-6 inline-flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200 text-xs font-extrabold max-w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab('express')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'express'
                  ? 'bg-white text-brand-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FiZap className="text-amber-500" />
              <span>{locale === 'ar' ? 'الإسناد الفوري (4 دقائق)' : 'Matchmaking Express (4 min)'}</span>
            </button>
            <button
              onClick={() => setActiveTab('device')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'device'
                  ? 'bg-white text-brand-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FiSmartphone className="text-brand-600" />
              <span>{locale === 'ar' ? 'مهام الهواتف والميدان' : 'Missions Appareils & Terrain'}</span>
            </button>
            <button
              onClick={() => setActiveTab('trust')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'trust'
                  ? 'bg-white text-brand-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FiAward className="text-emerald-600" />
              <span>{locale === 'ar' ? 'اختبار الكفاءة والضمان' : 'Test de Rigueur & Séquestre Daman'}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: EXPRESS MATCHMAKING RADAR */}
        {activeTab === 'express' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch animate-in fade-in duration-300">
            
            {/* Live Radar Card */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-7 text-white shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>{locale === 'ar' ? 'رادار المشتغلين المباشر' : 'Radar En Ligne Direct'}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">100% Maroc</span>
                </div>

                <div className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-1">
                  142 Freelances
                </div>
                <div className="text-xs text-slate-300 leading-snug mb-6">
                  {locale === 'ar'
                    ? 'متصلون الآن وجاهزون لبدء مهمتك في الدار البيضاء، الرباط، مراكش وطنجة.'
                    : 'connectés en ce moment même à Casablanca, Rabat, Marrakech et Tanger, prêts à démarrer.'}
                </div>

                {/* Radar Cities Breakdown */}
                <div className="space-y-2.5 text-xs text-slate-300 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Casablanca & Rabat
                    </span>
                    <span className="font-bold text-white">78 actifs</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Marrakech & Agadir
                    </span>
                    <span className="font-bold text-white">34 actifs</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Tanger & Fès
                    </span>
                    <span className="font-bold text-white">30 actifs</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">⏱️ Délai moyen d’acceptation :</span>
                <span className="font-extrabold text-amber-400 text-sm">3 min 40 s</span>
              </div>
            </div>

            {/* How Express Dispatch Works (Workzilla Style) */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-7 flex flex-col justify-between shadow-2xs">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                  <FiActivity className="text-brand-600" />
                  <span>
                    {locale === 'ar'
                      ? 'كيف يعمل نظام الإسناد الفوري في 3 خطوات؟'
                      : 'Comment fonctionne le Matchmaking Instantané ?'}
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-700 font-extrabold flex items-center justify-center text-sm mb-3">
                      1
                    </div>
                    <div className="font-bold text-xs text-slate-900 mb-1">
                      {locale === 'ar' ? 'نشر المهمة والميزانية' : 'Publication avec budget fixé'}
                    </div>
                    <div className="text-[11px] text-slate-600 leading-relaxed">
                      Vous définissez votre besoin et votre tarif en Dirhams (dès 50 DH).
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-700 font-extrabold flex items-center justify-center text-sm mb-3">
                      2
                    </div>
                    <div className="font-bold text-xs text-slate-900 mb-1">
                      {locale === 'ar' ? 'إشعار أفضل 3 مستقلين' : 'Notification des 3 Meilleurs'}
                    </div>
                    <div className="text-[11px] text-slate-600 leading-relaxed">
                      L’algorithme alerte instantanément les freelances qualifiés en ligne.
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold flex items-center justify-center text-sm mb-3">
                      3
                    </div>
                    <div className="font-bold text-xs text-slate-900 mb-1">
                      {locale === 'ar' ? 'بدء العمل الفوري' : 'Démarrage immédiat'}
                    </div>
                    <div className="text-[11px] text-slate-600 leading-relaxed">
                      Le premier freelance disponible valide la mission et exécute le brief.
                    </div>
                  </div>
                </div>
              </div>

              {/* Express Call to Action */}
              <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-600">
                  🚀 <strong>Mode Turbo Express disponible :</strong> traitement prioritaire en moins de 2 heures.
                </div>
                <button
                  onClick={() => onLaunchTask({
                    title: 'Mission Express - Traitement rapide',
                    description: 'Besoin urgent à exécuter immédiatement avec remise de livrable sous 2h.',
                    rewardDH: 150,
                    category: 'micro'
                  })}
                  className="w-full sm:w-auto rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold px-5 py-2.5 text-xs shadow-xs transition cursor-pointer"
                >
                  {locale === 'ar' ? 'إطلاق مهمة مستعجلة الآن' : 'Lancer une tâche express'}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: DEVICE & SPECIFIC LOCAL TASKS */}
        {activeTab === 'device' && (
          <div className="animate-in fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {signatureTemplates.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-2xs hover:border-brand-300 hover:shadow-sm transition group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-brand-700 transition line-clamp-2 mb-1.5">
                      {item.title[locale as keyof typeof item.title] || item.title.fr}
                    </h4>

                    <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed mb-4">
                      {item.desc[locale as keyof typeof item.desc] || item.desc.fr}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-black text-brand-700">
                        {item.priceDH} DH
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        ⏱️ {item.turnaround}
                      </span>
                    </div>

                    <button
                      onClick={() => onLaunchTask({
                        title: item.title[locale as keyof typeof item.title] || item.title.fr,
                        description: item.desc[locale as keyof typeof item.desc] || item.desc.fr,
                        rewardDH: item.priceDH,
                        category: item.category,
                      })}
                      className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-brand-700 hover:text-white text-slate-800 text-xs font-bold px-3 py-1.5 transition cursor-pointer"
                    >
                      <span>{locale === 'ar' ? 'طلب مماثل' : 'Commander'}</span>
                      <FiArrowRight className="text-[11px]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: QUALIFICATION TEST & ESCROW DAMAN */}
        {activeTab === 'trust' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch animate-in fade-in duration-300">
            
            {/* Qualification Test Box (Workzilla's strict barrier) */}
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 p-6 sm:p-7 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-bold text-emerald-800 mb-3 border border-emerald-300">
                  <FiAward />
                  <span>{locale === 'ar' ? 'نظام تصفية الجودة الصارم' : 'Test de Rigueur Obligatoire'}</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-2">
                  {locale === 'ar'
                    ? 'فقط 12% من المتقدمين يجتازون الاختبار'
                    : 'Seuls 12% des candidats sont certifiés'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Sur tâches.ma, aucun freelance ne peut postuler à vos missions sans avoir réussi notre test chronométré : compréhension de consignes strictes, réactivité, recherche rapide et orthographe.
                </p>

                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <FiCheck className="text-emerald-600 font-bold" />
                    <span>Zéro spam et zéro proposition générée par des robots</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheck className="text-emerald-600 font-bold" />
                    <span>Notation transparente sur 5 étoiles après chaque livraison</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheck className="text-emerald-600 font-bold" />
                    <span>Badge « Prestataire Vérifié ⭐ » attribué aux meilleurs</span>
                  </li>
                </ul>
              </div>

              {onOpenQualification && (
                <div className="mt-6 pt-4 border-t border-emerald-200/80">
                  <button
                    onClick={onOpenQualification}
                    className="w-full sm:w-auto rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 text-xs shadow-xs transition cursor-pointer"
                  >
                    {locale === 'ar' ? 'اجتياز اختبار الكفاءة (للمستقلين)' : 'Passer le test de qualification freelance'}
                  </button>
                </div>
              )}
            </div>

            {/* Escrow Daman Guarantee Box */}
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-6 sm:p-7 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-bold text-blue-800 mb-3 border border-blue-300">
                  <FiLock />
                  <span>{locale === 'ar' ? 'نظام الضمان المالي (ضمان)' : 'Garantie Séquestre (Daman)'}</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-2">
                  {locale === 'ar'
                    ? 'أموالك محمية حتى رضاك التام 100%'
                    : 'Vos fonds sont protégés à 100%'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Le montant de votre commande est sécurisé sous séquestre. Le freelance n’est rémunéré qu’après votre validation explicite des livrables exigés.
                </p>

                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <FiCheck className="text-brand-600 font-bold" />
                    <span>Blocage des fonds au lancement sans risque d’impayé</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheck className="text-brand-600 font-bold" />
                    <span>Tiroir de preuves avec validation point par point</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheck className="text-brand-600 font-bold" />
                    <span>Arbitrage neutre et équitable en moins de 4 heures en cas de litige</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-blue-200/80 flex items-center justify-between text-xs text-slate-600">
                <span>🛡️ Protection bilatérale client & freelance</span>
                <span className="font-bold text-brand-700">100% Garanti</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
