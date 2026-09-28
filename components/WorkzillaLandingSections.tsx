'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  FiShield,
  FiClock,
  FiCheckCircle,
  FiArrowRight,
  FiArrowLeft,
  FiSearch,
  FiLock,
  FiUsers,
  FiDollarSign,
  FiPhoneCall,
  FiMessageSquare,
  FiHelpCircle,
  FiStar,
  FiCheck,
  FiPlus,
  FiFileText,
  FiMapPin
} from 'react-icons/fi';

interface WorkzillaHeroProps {
  onDirectPost: (title: string) => void;
  onExploreFeed: () => void;
}

export const WorkzillaHero: React.FC<WorkzillaHeroProps> = ({
  onDirectPost,
  onExploreFeed,
}) => {
  const { t, isRTL } = useLanguage();
  const [taskQuery, setTaskQuery] = useState('');
  const [heroAudience, setHeroAudience] = useState<'customer' | 'performer'>('customer');

  const popularTasks = [
    { title: 'Conception Logo & Identité', icon: '🎨' },
    { title: 'Boutique YouCan ou Shopify', icon: '🛍️' },
    { title: 'Traduction Arabe / Français', icon: '📄' },
    { title: 'Saisie factures sous Excel', icon: '📊' },
    { title: 'Montage vidéo TikTok / Reels', icon: '📱' },
    { title: 'Démarches & Dépôt de plis', icon: '🚚' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskQuery.trim()) {
      onDirectPost(taskQuery.trim());
    } else {
      onDirectPost('');
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-white via-surface-soft to-slate-100/70 border-b border-line pt-8 pb-12 sm:pt-24 sm:pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Audience Toggle Tabs: Client vs Freelance */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl bg-slate-200/80 p-1.5 border border-slate-300 shadow-inner">
            <button
              onClick={() => setHeroAudience('customer')}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-all ${heroAudience === 'customer'
                ? 'bg-brand-700 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
                }`}
            >
              <FiUsers className="text-base" />
              <span>{t('wzTabCustomer')}</span>
            </button>
            <button
              onClick={() => {
                setHeroAudience('performer');
                onExploreFeed();
              }}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-all ${heroAudience === 'performer'
                ? 'bg-brand-700 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
                }`}
            >
              <FiDollarSign className="text-base" />
              <span>{t('wzTabPerformer')}</span>
            </button>
          </div>
        </div>

        {/* Main Header Copy */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
            {t('wzHeroTitle')}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto font-normal">
            {t('wzHeroLead')}
          </p>
        </div>

        {/* Work-zilla Instant Task Action Box */}
        <div className="mt-8 sm:mt-10 max-w-3xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="hero-task-box p-2 sm:p-3 bg-white flex flex-col sm:flex-row items-stretch gap-2.5"
          >
            <div className="relative flex-1 flex items-center">
              <FiSearch className={`absolute ${isRTL ? 'right-4' : 'left-4'} text-slate-400 text-lg`} />
              <input
                type="text"
                value={taskQuery}
                onChange={(e) => setTaskQuery(e.target.value)}
                placeholder={t('wzHeroInputPlaceholder')}
                className={`w-full ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3.5 text-sm sm:text-base text-slate-900 font-medium placeholder-slate-400 bg-transparent outline-none`}
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white px-7 py-3.5 text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all active:scale-98 whitespace-nowrap cursor-pointer"
            >
              <FiPlus className="text-lg" />
              <span>{t('wzHeroBtnPost')}</span>
            </button>
          </form>

          {/* Guarantee Note */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-semibold text-slate-600 text-center">
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <FiCheck className="text-emerald-600 font-bold" />
              <span>100% Gratuit à la publication</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-slate-700">
              <FiClock className="text-brand-600" />
              <span>Première offre en ~35 secondes</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <FiLock className="text-emerald-600" />
              <span>somme gardée en sécurité (Daman)</span>
            </span>
          </div>

        </div>

      </div>
    </section>
  );
};

/* Proof Metrics Bar (Work-zilla Numbers Proof) */
export const WorkzillaProofBar: React.FC = () => {
  const { t } = useLanguage();

  const stats = [
    { value: t('wzStatTasksCount'), label: t('wzStatTasksLabel'), icon: <FiCheckCircle className="text-emerald-600 text-2xl" /> },
    { value: t('wzStatSpeedTime'), label: t('wzStatSpeedLabel'), icon: <FiClock className="text-brand-600 text-2xl" /> },
    { value: t('wzStatPriceFrom'), label: t('wzStatPriceLabel'), icon: <FiDollarSign className="text-amber-600 text-2xl" /> },
    { value: t('wzStatGuaranteeText'), label: t('wzStatGuaranteeLabel'), icon: <FiShield className="text-emerald-700 text-2xl" /> },
  ];

  return (
    <section className="bg-white border-b border-line py-8 shadow-xs">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((st, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="mb-2 p-2 rounded-full bg-slate-100">{st.icon}</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {st.value}
              </div>
              <div className="mt-1 text-xs sm:text-sm font-medium text-slate-600">
                {st.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* 3-Step Process (Work-zilla Simple Workflow) */
interface WorkzillaHowItWorksProps {
  onPostTask: () => void;
}

export const WorkzillaHowItWorks: React.FC<WorkzillaHowItWorksProps> = ({ onPostTask }) => {
  const { t, isRTL } = useLanguage();

  const steps = [
    {
      num: '1',
      title: t('wzStep1Title'),
      desc: t('wzStep1Desc'),
      icon: <FiFileText className="text-brand-700 text-xl" />,
      color: 'bg-brand-50 border-brand-200 text-brand-700',
    },
    {
      num: '2',
      title: t('wzStep2Title'),
      desc: t('wzStep2Desc'),
      icon: <FiUsers className="text-amber-700 text-xl" />,
      color: 'bg-amber-50 border-amber-200 text-amber-700',
    },
    {
      num: '3',
      title: t('wzStep3Title'),
      desc: t('wzStep3Desc'),
      icon: <FiShield className="text-emerald-700 text-xl" />,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    },
  ];

  return (
    <section className="bg-surface-soft py-14 sm:py-20 border-b border-line" id="how-it-works">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="section-kicker mb-2">Simplicité & Transparence</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t('wzHowTitle')}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            {t('wzHowSubtitle')}
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((st, idx) => (
            <div
              key={idx}
              className="functional-card p-6 sm:p-7 flex flex-col justify-between relative bg-white"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="step-number">
                    {st.num}
                  </div>
                  <div className={`p-2.5 rounded-xl border ${st.color}`}>
                    {st.icon}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {st.title}
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {st.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-slate-400">
                <span>Étape {st.num} sur 3</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-10 text-center">
          <button
            onClick={onPostTask}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold px-8 py-3.5 text-sm sm:text-base shadow-md hover:shadow-lg transition-all"
          >
            <span>Publier ma tâche gratuitement</span>
            {isRTL ? <FiArrowLeft /> : <FiArrowRight />}
          </button>
        </div>

      </div>
    </section>
  );
};

/* Trust & Escrow Guarantee Section (Daman Moroccan Model) */
export const WorkzillaTrustSection: React.FC = () => {
  const { t } = useLanguage();

  const trustItems = [
    {
      title: t('wzTrustItem1Title'),
      desc: t('wzTrustItem1Desc'),
      icon: <FiShield className="text-emerald-700 text-2xl" />,
    },
    {
      title: t('wzTrustItem2Title'),
      desc: t('wzTrustItem2Desc'),
      icon: <FiUsers className="text-brand-700 text-2xl" />,
    },
    {
      title: t('wzTrustItem3Title'),
      desc: t('wzTrustItem3Desc'),
      icon: <FiDollarSign className="text-amber-700 text-2xl" />,
    },
    {
      title: t('wzTrustItem4Title'),
      desc: t('wzTrustItem4Desc'),
      icon: <FiPhoneCall className="text-emerald-600 text-2xl" />,
    },
  ];

  return (
    <section className="bg-surface-soft py-14 sm:py-20 border-b border-line" id="trust-daman">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="badge-daman mb-3">
            <FiShield /> somme gardée en sécurité
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {t('wzTrustTitle')}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            {t('wzTrustSubtitle')}
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trustItems.map((item, i) => (
            <div key={i} className="functional-card p-6 flex items-start gap-4 bg-white">
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

/* Recent Completed Tasks Showcase (Work-zilla Feed) */
export const WorkzillaCompletedFeed: React.FC = () => {
  const { t } = useLanguage();

  const completedTasks = [
    {
      title: 'Création du menu & carte des boissons pour café restaurant',
      price: '250 DH',
      eur: '25 €',
      city: 'Casablanca',
      client: 'Karim B. (Gérant)',
      rating: 5.0,
      review: '« Travail impeccable livré en moins de 4 heures. Tous les fichiers sources PSD et PDF remis pour l’imprimeur. »',
      freelancer: 'Yassine M. (Graphiste certifié)',
    },
    {
      title: 'Traduction contrat de bail commercial Arabe vers Français',
      price: '150 DH',
      eur: '15 €',
      city: 'Rabat',
      client: 'Nawal T. (Cabinet)',
      rating: 5.0,
      review: '« Excellente traductrice rigoureuse et ponctuelle. Respect strict de la terminologie juridique marocaine. »',
      freelancer: 'Fatima Z. (Traductrice pro)',
    },
    {
      title: 'Saisie de 180 factures et rapprochement sous Excel',
      price: '120 DH',
      eur: '12 €',
      city: 'Tanger',
      client: 'Rachid M. (Commerçant)',
      rating: 4.9,
      review: '« Rapide, précis et sans aucune erreur de calcul. Très bonne communication par message sur le site. »',
      freelancer: 'Mehdi A. (Assistant Excel)',
    },
    {
      title: 'Mise en place de 35 fiches produits sur boutique YouCan Shop',
      price: '300 DH',
      eur: '30 €',
      city: 'Marrakech',
      client: 'Souk Moderne (E-commerce)',
      rating: 5.0,
      review: '« Produits bien rédigés en Darija et Français avec belles photos détourées. Ma boutique vend déjà. »',
      freelancer: 'Amine K. (Spécialiste YouCan)',
    },
  ];

  return (
    <section className="bg-white py-14 sm:py-20 border-b border-line">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="section-kicker mb-2">Exemples récents</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t('wzCompletedTitle')}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            {t('wzCompletedSubtitle')}
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {completedTasks.map((item, idx) => (
            <div key={idx} className="functional-card p-6 flex flex-col justify-between bg-slate-50/50">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <FiMapPin className="text-rose-500" />
                    <span>{item.city}</span>
                  </span>
                  <div className="flex items-center gap-1.5 font-extrabold text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1 rounded-full text-xs">
                    <span>{item.price}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {item.title}
                </h3>

                <p className="mt-3 text-xs sm:text-sm text-slate-700 italic leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                  {item.review}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{item.client}</span>
                  <span className="text-slate-500 ml-1">a noté</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <FiStar className="fill-amber-400" />
                  <span>{item.rating.toFixed(1)} / 5.0</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

/* Multi-Age Assistance & FAQ Section with WhatsApp Callout */
export const WorkzillaHelpCenter: React.FC = () => {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    { q: t('wzFaq1Q'), a: t('wzFaq1A') },
    { q: t('wzFaq2Q'), a: t('wzFaq2A') },
    { q: t('wzFaq3Q'), a: t('wzFaq3A') },
    { q: t('wzFaq4Q'), a: t('wzFaq4A') },
  ];

  return (
    <section className="bg-surface-soft py-14 sm:py-20 border-b border-line" id="help-faq">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

        {/* WhatsApp Big Support Box */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-6 sm:p-8 shadow-lg mb-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/60 px-3 py-1 text-xs font-bold text-emerald-200 mb-2">
              <FiPhoneCall /> Support direct au Maroc
            </span>
            <h3 className="text-xl sm:text-2xl font-bold">
              {t('wzWhatsappTitle')}
            </h3>
            <p className="mt-1 text-sm text-emerald-100 max-w-xl">
              {t('wzWhatsappDesc')}
            </p>
          </div>
          <a
            href="https://wa.me/212600000000?text=Bonjour,%20j%27ai%20besoin%20d%27aide%20sur%20Taches.ma"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 px-6 py-3.5 text-sm sm:text-base font-extrabold shadow-md shrink-0 transition-transform active:scale-95"
          >
            <FiMessageSquare className="text-xl" />
            <span>{t('wzWhatsappBtn')}</span>
          </a>
        </div>

        {/* FAQ Header */}
        <div className="text-center mb-8">
          <p className="section-kicker mb-1">Aide & Réponses</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t('wzFaqTitle')}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {t('wzFaqSubtitle')}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="functional-card overflow-hidden bg-white"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-brand-700 text-sm sm:text-base"
                >
                  <span className="flex items-center gap-2.5">
                    <FiHelpCircle className="text-brand-600 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <span className="text-slate-400 text-lg font-mono">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

/* Clean Business Functional Footer */
export const WorkzillaFooter: React.FC = () => {
  const { t, locale } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800 text-xs sm:text-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">

          {/* Brand Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-black text-sm">
                T
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                tâches<span className="text-emerald-400">.ma</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              La bourse de référence des micro-tâches et services freelance au Maroc avec paiement garanti sous séquestre (Daman).
            </p>
          </div>

          {/* Column 1: Navigation */}
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href={`/${locale}/tasks`} className="hover:text-white transition-colors">{t('navExplore')}</a></li>
              <li><a href={`/${locale}/wallet`} className="hover:text-white transition-colors">Portefeuille & Séquestre</a></li>
              <li><a href={`/${locale}#how-it-works`} className="hover:text-white transition-colors">{t('menuHowItWorks')}</a></li>
              <li><a href={`/${locale}#trust-daman`} className="hover:text-white transition-colors">{t('menuDamanSecurity')}</a></li>
              <li><a href={`/${locale}#help-faq`} className="hover:text-white transition-colors">{t('unuFooterFaq')}</a></li>
            </ul>
          </div>

          {/* Column 2: Sécurité & Daman */}
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">
              Sécurité & Daman
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href={`/${locale}/wallet`} className="text-emerald-400 font-semibold hover:underline">✓ 100% Séquestre Protégé</a></li>
              <li><span>Paiement CMI & Banques Maroc</span></li>
              <li><span>Vérification CIN des freelances</span></li>
              <li><span>Arbitrage sous 24 heures</span></li>
            </ul>
          </div>

          {/* Column 3: Contact & Support */}
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">
              Assistance au Maroc
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Notre équipe à Casablanca et Rabat vous accompagne 7j/7 en Darija et Français.
            </p>
            <a
              href="https://wa.me/212600000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-emerald-400 hover:text-emerald-300 text-xs"
            >
              <FiPhoneCall /> WhatsApp : +212 6 00 00 00 00
            </a>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 tâches.ma • Tous droits réservés. Plateforme conçue pour le Maroc.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400">Conditions Générales</span>
            <span>•</span>
            <span className="hover:text-slate-400">Protection des Données (CNDP)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
