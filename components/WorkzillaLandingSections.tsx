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
  FiMapPin,
  FiZap,
  FiAward
} from 'react-icons/fi';

interface WorkzillaHeroProps {
  onDirectPost: (title: string) => void;
  onExploreFeed: () => void;
}

export const WorkzillaHero: React.FC<WorkzillaHeroProps> = ({
  onDirectPost,
  onExploreFeed,
}) => {
  const { t, isRTL, locale } = useLanguage();
  const [taskQuery, setTaskQuery] = useState('');
  const [heroAudience, setHeroAudience] = useState<'customer' | 'performer'>('customer');

  const popularTasks = [
    { title: 'Conception Logo & Identité', price: '150 DH', icon: '🎨' },
    { title: 'Traduction Arabe / Français', price: '100 DH', icon: '📄' },
    { title: 'Saisie factures sous Excel', price: '80 DH', icon: '📊' },
    { title: 'Boutique YouCan ou Shopify', price: '250 DH', icon: '🛍️' },
    { title: 'Montage vidéo TikTok / Reels', price: '120 DH', icon: '📱' },
    { title: 'Démarches & Dépôt de plis', price: '70 DH', icon: '🚚' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDirectPost(taskQuery.trim());
  };

  return (
    <section className="relative bg-gradient-to-b from-white via-surface-soft to-slate-100/70 border-b border-line pt-8 pb-12 sm:pt-20 sm:pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Audience Toggle Tabs: Client vs Freelance */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-2xl bg-slate-200/90 p-1.5 border border-slate-300 shadow-inner">
            <button
              onClick={() => setHeroAudience('customer')}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm sm:text-base font-extrabold transition-all cursor-pointer ${
                heroAudience === 'customer'
                  ? 'bg-brand-700 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <FiUsers className="text-lg" />
              <span>{t('wzTabCustomer')}</span>
            </button>
            <button
              onClick={() => {
                setHeroAudience('performer');
              }}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm sm:text-base font-extrabold transition-all cursor-pointer ${
                heroAudience === 'performer'
                  ? 'bg-brand-700 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <FiDollarSign className="text-lg" />
              <span>{t('wzTabPerformer')}</span>
            </button>
          </div>
        </div>

        {heroAudience === 'customer' ? (
          <>
            {/* Customer Main Header Copy */}
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200 px-3.5 py-1 text-xs font-extrabold text-brand-700 mb-4 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Plateforme N°1 de Services & Micro-tâches au Maroc</span>
              </div>
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

              {/* Popular Task Quick Chips */}
              <div className="mt-4 flex items-center justify-center gap-2 flex-wrap text-xs">
                <span className="font-bold text-slate-500 mr-1 hidden sm:inline">Exemples rapides :</span>
                {popularTasks.map((pt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTaskQuery(pt.title);
                      onDirectPost(pt.title);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-brand-500 hover:text-brand-700 hover:bg-brand-50/50 transition-all font-semibold shadow-2xs cursor-pointer"
                  >
                    <span>{pt.icon}</span>
                    <span>{pt.title}</span>
                    <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.2 rounded-md">
                      {pt.price}
                    </span>
                  </button>
                ))}
              </div>

              {/* Guarantee Note */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-semibold text-slate-600 text-center">
                <span className="inline-flex items-center gap-1 text-brand-700 font-bold">
                  <FiCheck className="text-brand-600 font-black" />
                  <span>100% Gratuit à la publication</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1 text-slate-700 font-bold">
                  <FiClock className="text-brand-600" />
                  <span>Première offre en ~35 secondes</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1 text-brand-700 font-bold">
                  <FiLock className="text-brand-600" />
                  <span>Paiement 100% sécurisé (Daman)</span>
                </span>
              </div>

            </div>
          </>
        ) : (
          /* Performer / Freelance View */
          <div className="text-center max-w-3xl mx-auto py-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200 px-3.5 py-1 text-xs font-extrabold text-brand-700 mb-4 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-brand-600 animate-pulse" />
              <span>Espace Freelance & Rémunération au Maroc</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
              Gagnez de l’argent en effectuant des missions
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Rejoignez plus de 890 000 prestataires au Maroc. Postulez à des micro-services (saisie, graphisme, traduction, web, terrain) et recevez vos virements bancaires garantis d’avance par séquestre.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onExploreFeed}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white px-8 py-4 text-base font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <FiSearch className="text-lg" />
                <span>Parcourir toutes les missions ouvertes</span>
                {isRTL ? <FiArrowLeft /> : <FiArrowRight />}
              </button>
              <button
                onClick={() => onDirectPost('')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 px-6 py-4 text-base font-bold transition-all cursor-pointer shadow-2xs"
              >
                <FiAward className="text-brand-600 text-lg" />
                <span>Créer mon profil vérifié</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

/* Proof Metrics Bar (Work-zilla Numbers Proof) */
export const WorkzillaProofBar: React.FC = () => {
  const { t } = useLanguage();

  const stats = [
    { value: '890 000+', label: 'Prestataires et freelances au Maroc', icon: <FiUsers className="text-brand-600 text-2xl" /> },
    { value: '35 secondes', label: 'Délai moyen de première réponse', icon: <FiClock className="text-brand-600 text-2xl" /> },
    { value: '4.8 Millions', label: 'Tâches réalisées avec succès', icon: <FiCheckCircle className="text-brand-600 text-2xl" /> },
    { value: '100% Garanti', label: 'Paiement sous séquestre Daman', icon: <FiShield className="text-brand-700 text-2xl" /> },
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

/* Visual Categories Grid (Workzilla Universal Categorization) */
interface WorkzillaCategoryGridProps {
  onSelectCategory: (categoryKey: string) => void;
}

export const WorkzillaCategoryGrid: React.FC<WorkzillaCategoryGridProps> = ({ onSelectCategory }) => {
  const { isRTL } = useLanguage();

  const categories = [
    {
      key: 'design',
      title: 'Graphisme & Design',
      desc: 'Logos, cartes de visite, affiches, flyers, retouche photo, menus café/resto',
      price: 'Dès 100 DH',
      icon: '🎨',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      key: 'copywriting',
      title: 'Traduction & Rédaction',
      desc: 'Arabe classique, Darija, Français, Anglais, contrats, mémoires, correction',
      price: 'Dès 50 DH',
      icon: '📄',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      key: 'assistance',
      title: 'Saisie & Bureautique Excel',
      desc: 'Saisie de factures, tableaux Excel, mise en page Word, archivage de données',
      price: 'Dès 50 DH',
      icon: '📊',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      key: 'development',
      title: 'Boutiques YouCan & Sites Web',
      desc: 'Création boutique en ligne, ajout de fiches produits, dépannage WordPress',
      price: 'Dès 200 DH',
      icon: '🛍️',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      key: 'marketing',
      title: 'Vidéos, Reels & Marketing',
      desc: 'Montage TikTok / Reels, sous-titrage, animation de réseaux sociaux, pub',
      price: 'Dès 120 DH',
      icon: '📱',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      key: 'micro',
      title: 'Démarches & Services Terrain',
      desc: 'Dépôt de plis, démarches administratives, visites et photos sur place',
      price: 'Dès 70 DH',
      icon: '🚚',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ];

  return (
    <section className="bg-white py-14 sm:py-20 border-b border-line" id="categories">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="section-kicker mb-2">Catégories & Services</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Des compétences pour chaque besoin
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Cliquez sur un domaine pour lancer votre tâche ou trouver les meilleurs prestataires.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.key}
              onClick={() => onSelectCategory(cat.key)}
              className="functional-card p-6 flex flex-col justify-between hover:border-brand-600 transition-all cursor-pointer group bg-white"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl p-3 rounded-2xl bg-slate-50 border border-slate-200 group-hover:scale-105 transition-transform">
                    {cat.icon}
                  </div>
                  <span className="text-xs font-extrabold text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1 rounded-full">
                    {cat.price}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                  {cat.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {cat.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-700 group-hover:underline">
                <span>Commander ce service</span>
                {isRTL ? <FiArrowLeft /> : <FiArrowRight />}
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
      title: '1. Décrivez votre tâche',
      desc: 'Écrivez en quelques mots simples ce que vous souhaitez faire et indiquez votre budget en Dirhams (dès 50 DH). La publication est 100% gratuite.',
      icon: <FiFileText className="text-brand-700 text-xl" />,
      color: 'bg-brand-50 border-brand-200 text-brand-700',
    },
    {
      num: '2',
      title: '2. Choisissez votre prestataire',
      desc: 'En quelques minutes (dès 35 secondes), des personnes sérieuses et vérifiées avec Carte d’Identité Nationale (CIN) vous répondent.',
      icon: <FiUsers className="text-amber-700 text-xl" />,
      color: 'bg-amber-50 border-amber-200 text-amber-700',
    },
    {
      num: '3',
      title: '3. Payez seulement si vous êtes satisfait',
      desc: 'Votre argent est gardé en sécurité sous séquestre (Daman). Vous ne payez que lorsque vous avez vérifié et validé le résultat final.',
      icon: <FiShield className="text-brand-700 text-xl" />,
      color: 'bg-brand-50 border-brand-200 text-brand-700',
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
            className="inline-flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold px-8 py-3.5 text-sm sm:text-base shadow-md hover:shadow-lg transition-all cursor-pointer"
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
      title: 'Paiement 100% Sécurisé sous Séquestre (Daman)',
      desc: 'Votre argent ne quitte jamais la plateforme avant votre validation finale. Aucun risque de payer pour un travail incomplet ou non conforme.',
      icon: <FiShield className="text-brand-700 text-2xl" />,
    },
    {
      title: 'Freelances Vérifiés par Pièce d’Identité (CIN)',
      desc: 'Chaque prestataire actif fournit sa Carte d’Identité Nationale marocaine et son numéro de mobile vérifié par SMS.',
      icon: <FiUsers className="text-brand-700 text-2xl" />,
    },
    {
      title: 'Banques Marocaines & Retraits CMI / Wafacash',
      desc: 'Compatible avec toutes les banques du Maroc (CIH, Attijariwafa, Al Barid, BMCE), cartes CMI et agences Cash Plus / Wafacash.',
      icon: <FiDollarSign className="text-amber-700 text-2xl" />,
    },
    {
      title: 'Assistance Locale 7j/7 au Maroc & WhatsApp',
      desc: 'Notre équipe marocaine à Casablanca et Rabat vous accompagne par téléphone et WhatsApp en Darija et Français.',
      icon: <FiPhoneCall className="text-brand-700 text-2xl" />,
    },
  ];

  return (
    <section className="bg-surface-soft py-14 sm:py-20 border-b border-line" id="trust-daman">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="badge-daman mb-3">
            <FiShield /> Sécurité & Garantie Daman Maroc
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Pourquoi faire confiance à tâches.ma ?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Une infrastructure pensée pour la confiance et la sérénité des particuliers et professionnels au Maroc
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
      city: 'Casablanca',
      client: 'Karim B. (Gérant)',
      rating: 5.0,
      review: '« Travail impeccable livré en moins de 4 heures. Tous les fichiers sources PSD et PDF remis pour l’imprimeur. »',
      freelancer: 'Yassine M. (Graphiste certifié)',
    },
    {
      title: 'Traduction contrat de bail commercial Arabe vers Français',
      price: '150 DH',
      city: 'Rabat',
      client: 'Nawal T. (Cabinet)',
      rating: 5.0,
      review: '« Excellente traductrice rigoureuse et ponctuelle. Respect strict de la terminologie juridique marocaine. »',
      freelancer: 'Fatima Z. (Traductrice pro)',
    },
    {
      title: 'Saisie de 180 factures et rapprochement sous Excel',
      price: '120 DH',
      city: 'Tanger',
      client: 'Rachid M. (Commerçant)',
      rating: 4.9,
      review: '« Rapide, précis et sans aucune erreur de calcul. Très bonne communication par message sur le site. »',
      freelancer: 'Mehdi A. (Assistant Excel)',
    },
    {
      title: 'Mise en place de 35 fiches produits sur boutique YouCan Shop',
      price: '300 DH',
      city: 'Marrakech',
      client: 'Souk Moderne (E-commerce)',
      rating: 5.0,
      review: '« Produits bien rédigés en Darija et Français avec de belles photos. Ma boutique vend déjà. »',
      freelancer: 'Amine K. (Spécialiste YouCan)',
    },
  ];

  return (
    <section className="bg-white py-14 sm:py-20 border-b border-line">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="section-kicker mb-2">Exemples concrets</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Dernières missions réalisées au Maroc
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Des exemples réels de micro-tâches rémunérées en Dirhams et validées par nos clients
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
    {
      q: 'Comment fonctionne la garantie de paiement sous séquestre (Daman) ?',
      a: 'Lorsque vous lancez une tâche, le montant est placé sur un compte sécurisé. Le prestataire effectue le travail et vous le remet. L’argent n’est versé au freelance que lorsque vous cliquez sur "Valider". Si le résultat ne convient pas, vous pouvez demander des modifications gratuites ou demander le remboursement complet.',
    },
    {
      q: 'Combien coûte la publication d’une tâche ?',
      a: 'La publication est 100% gratuite et sans engagement. Vous fixez vous-même le prix que vous souhaitez payer (dès 50 DH).',
    },
    {
      q: 'Comment sont payés les prestataires au Maroc ?',
      a: 'Les freelances reçoivent leurs gains directement par virement bancaire sur leur compte au Maroc (CIH, Attijariwafa, Banque Populaire, BMCE, etc.) ou en espèces via Cash Plus / Wafacash.',
    },
    {
      q: 'Que faire si j’ai besoin d’aide pour rédiger ou commander ?',
      a: 'Notre équipe marocaine est joignable 7j/7 par WhatsApp et téléphone. Nous pouvons rédiger votre tâche à votre place et vous conseiller.',
    },
  ];

  return (
    <section className="bg-surface-soft py-14 sm:py-20 border-b border-line" id="help-faq">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

        {/* WhatsApp Big Support Box */}
        <div className="rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl mb-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-800/80 border border-brand-500/40 px-3 py-1 text-xs font-bold text-brand-200 mb-2">
              <FiPhoneCall /> Assistance directe au Maroc 7j/7
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Besoin d’aide pour déposer ou choisir un freelance ?
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-brand-100 max-w-xl leading-relaxed">
              Vous avez besoin d'assistance ou vous manquez de temps ? Un conseiller au Maroc vous répond sur WhatsApp en Darija ou Français.
            </p>
          </div>
          <a
            href="https://wa.me/212600000000?text=Bonjour,%20j%27ai%20besoin%20d%27aide%20sur%20Taches.ma"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl bg-white text-brand-900 hover:bg-brand-50 px-6 py-4 text-sm sm:text-base font-black shadow-lg shrink-0 transition-transform active:scale-95 cursor-pointer"
          >
            <FiMessageSquare className="text-xl text-brand-700" />
            <span>Écrire sur WhatsApp (+212)</span>
          </a>
        </div>

        {/* FAQ Header */}
        <div className="text-center mb-8">
          <p className="section-kicker mb-1">Aide & Questions fréquentes</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Tout ce qu’il faut savoir
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Des réponses simples et claires à toutes vos questions
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
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-brand-700 text-sm sm:text-base cursor-pointer"
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
                tâches<span className="text-brand-400">.ma</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              La bourse marocaine de référence pour les micro-tâches et services freelance avec paiement garanti sous séquestre (Daman).
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
              <li><a href={`/${locale}#how-it-works`} className="hover:text-white transition-colors">Comment ça marche ?</a></li>
              <li><a href={`/${locale}#trust-daman`} className="hover:text-white transition-colors">Garantie Séquestre</a></li>
              <li><a href={`/${locale}#help-faq`} className="hover:text-white transition-colors">Questions fréquentes</a></li>
            </ul>
          </div>

          {/* Column 2: Sécurité & Daman */}
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">
              Sécurité & Daman
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href={`/${locale}/wallet`} className="text-brand-400 font-semibold hover:underline">✓ 100% Séquestre Protégé</a></li>
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
              className="inline-flex items-center gap-1.5 font-bold text-brand-400 hover:text-brand-300 text-xs"
            >
              <FiPhoneCall /> WhatsApp : +212 6 00 00 00 00
            </a>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 tâches.ma • Plateforme marocaine avec paiement garanti.
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
