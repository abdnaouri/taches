'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useRouter } from 'next/navigation';
import {
  FiShield,
  FiZap,
  FiLock,
  FiCpu,
  FiDatabase,
  FiCheckCircle,
  FiDollarSign,
  FiUsers,
  FiLayers,
  FiCode,
  FiGitBranch,
  FiClock,
  FiTrendingUp,
  FiSmartphone,
  FiAlertTriangle,
  FiAward,
  FiArrowRight,
  FiArrowLeft,
  FiFileText,
  FiTerminal,
  FiHelpCircle
} from 'react-icons/fi';

export const ConceptExplainerPage: React.FC = () => {
  const { t, locale, isRTL } = useLanguage();
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<'non-technical' | 'technical'>('non-technical');
  const [activeTechTab, setActiveTechTab] = useState<'architecture' | 'statemachine' | 'database' | 'dispatch' | 'financial'>('architecture');

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Banner / Hero */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-14 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-700">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              <FiZap className="text-amber-400" /> Modèle Workzilla & Architecture
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              🇲🇦 Spécification Maroc
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white max-w-3xl leading-tight">
            Comprendre le fonctionnement complet de <span className="text-brand-400">tâches.ma</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            Guide détaillé et transparent sur le modèle de micro-tâches inspiré de Workzilla, le protocole de séquestre bancaire Daman, et l'architecture technique Next.js 14 & Supabase.
          </p>

          {/* Mode Switcher Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setActiveMode('non-technical')}
              className={`flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-sm ${
                activeMode === 'non-technical'
                  ? 'bg-brand-600 text-white shadow-brand-500/20 ring-2 ring-brand-400'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700'
              }`}
            >
              <FiUsers className="text-lg" />
              <span>1. Guide Produit & Non-Technique</span>
            </button>

            <button
              onClick={() => setActiveMode('technical')}
              className={`flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-sm ${
                activeMode === 'technical'
                  ? 'bg-cyan-600 text-white shadow-cyan-500/20 ring-2 ring-cyan-400'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700'
              }`}
            >
              <FiCpu className="text-lg text-cyan-400" />
              <span>2. Architecture & Spécifications Techniques</span>
            </button>
          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">

        {/* ========================================================================= */}
        {/* VIEW 1: NON-TECHNICAL / PRODUCT GUIDE                                      */}
        {/* ========================================================================= */}
        {activeMode === 'non-technical' && (
          <div className="space-y-12 animate-in fade-in duration-300">

            {/* Overview Summary Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-brand-50 border border-brand-200 text-brand-700 rounded-xl text-xl">
                  💡
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    En quoi consiste le modèle "Workzilla" adapté au Maroc ?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    La révolution de la micro-délégation ultra-rapide vs le freelancing classique
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-100">
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-2 text-rose-700">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    Le Freelancing traditionnel (Upwork, Malt, etc.)
                  </h3>
                  <ul className="text-xs text-slate-600 space-y-2">
                    <li>• Processus lourd : CVs, entretiens, devis sur mesure.</li>
                    <li>• Délais longs : 3 à 7 jours simplement pour recruter.</li>
                    <li>• Budgets élevés : peu adapté aux besoins ponctuels de 50 à 300 DH.</li>
                    <li>• Risque d'abandon ou de travail non conforme après paiement direct.</li>
                  </ul>
                </div>

                <div className="bg-brand-50/60 rounded-xl p-5 border border-brand-200">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-2 text-brand-800">
                    <span className="h-2 w-2 rounded-full bg-brand-600" />
                    Le Modèle tâches.ma (Inspiré de Workzilla)
                  </h3>
                  <ul className="text-xs text-slate-700 space-y-2">
                    <li>• <strong>Micro-tâches standardisées :</strong> Dès 50 DH, exprimées en langage clair.</li>
                    <li>• <strong>Dispatch Express :</strong> Prise en charge moyenne sous <strong>45 secondes</strong>.</li>
                    <li>• <strong>Garantie Séquestre (Daman) :</strong> 0 DH versé tant que le résultat n'est pas vérifié.</li>
                    <li>• <strong>Prestataires Qualifiés & Vérifiés :</strong> Test d'entrée obligatoire et vérification CIN.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Core Pillars: How Daman Escrow Works */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xl">
                  <FiShield />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Le Protocole Daman (Séquestre Garanti)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Comment nous éliminons 100% du risque pour le client et pour le prestataire
                  </p>
                </div>
              </div>

              {/* 4 Steps Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-brand-700 text-white font-extrabold flex items-center justify-center text-sm mb-3">
                      1
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">Dépôt Garanti</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Le client bloque le budget convenu (ex: 150 DH). L'argent n'est pas versé au freelance, mais gardé sur un compte séquestre sécurisé.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-bold text-brand-700">
                    ✓ Fonds 100% sécurisés
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-extrabold flex items-center justify-center text-sm mb-3">
                      2
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">Exécution Sereine</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Le freelance travaille en toute confiance, sachant que la tâche est financée d'avance et qu'il sera payé sans retard.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-bold text-slate-700">
                    ✓ 0 risque d'impayé
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-extrabold flex items-center justify-center text-sm mb-3">
                      3
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">Preuve & Contrôle</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Le prestataire transmet les fichiers finaux ou captures d'écran. Le client dispose de tout le temps nécessaire pour vérifier.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-bold text-slate-700">
                    ✓ Retouches gratuites
                  </div>
                </div>

                <div className="bg-emerald-50/80 p-5 rounded-xl border border-emerald-200 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm mb-3">
                      4
                    </div>
                    <h3 className="font-bold text-emerald-950 text-sm">Validation ou Remboursement</h3>
                    <p className="text-xs text-emerald-800 mt-2 leading-relaxed">
                      Le client clique sur "Valider" pour débloquer les fonds. En cas de non-respect du cahier des charges, remboursement garanti.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-emerald-200 text-[11px] font-bold text-emerald-700">
                    ✓ Satisfaction 99.4%
                  </div>
                </div>
              </div>
            </div>

            {/* The Moroccan Ecosystem Adaptation */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                Les piliers d'adaptation au marché marocain
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mb-6">
                Pourquoi la simple copie d'un site étranger ne fonctionne pas au Maroc sans ces adaptations locales
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-brand-700 font-bold text-sm mb-2">
                    <FiDollarSign className="text-lg" />
                    <span>Paiements & Retraits Locaux</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Cartes bancaires marocaines (CMI, CIH, Attijariwafa, Al Barid, BP) ainsi que les retraits rapides en espèces via les agences <strong>Cash Plus & Wafacash</strong> partout au Maroc.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-brand-700 font-bold text-sm mb-2">
                    <FiAward className="text-lg" />
                    <span>Vérification CIN & Anti-Arnaque</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Chaque prestataire passe un test de français/darija et de rigueur, et valide son identité avec sa <strong>Carte d'Identité Nationale (CIN)</strong> et son numéro de téléphone marocain.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-brand-700 font-bold text-sm mb-2">
                    <FiSmartphone className="text-lg" />
                    <span>Support Trilingue & WhatsApp</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Interface disponible en <strong>Arabe (RTL), Français et Anglais</strong>, avec assistance humaine en Darija par téléphone et WhatsApp pour les clients moins à l'aise avec la technologie.
                  </p>
                </div>
              </div>
            </div>

            {/* Dispute Resolution (Tahkim) */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-slate-800 text-amber-400 rounded-xl text-xl">
                  <FiAlertTriangle />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white">
                    Arbitrage Équitable (Tahkim / Arbitrage 24h)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Que se passe-t-il si un client et un prestataire sont en désaccord ?
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Si un livrable ne correspond pas à la consigne initiale, un médiateur de notre équipe à Casablanca examine les échanges, les fichiers sources et les consignes. Si le prestataire a respecté la consigne, les fonds lui reviennent. Si le travail est incomplet ou défectueux, le client est intégralement remboursé ou le prestataire applique une retouche obligatoire.
              </p>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: TECHNICAL ARCHITECTURE & SPECIFICATIONS                            */}
        {/* ========================================================================= */}
        {activeMode === 'technical' && (
          <div className="space-y-8 animate-in fade-in duration-300">

            {/* Technical Sub-tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
              {[
                { key: 'architecture', label: 'Stack & Infrastructure', icon: <FiLayers /> },
                { key: 'statemachine', label: 'Machine à États & Séquestre', icon: <FiGitBranch /> },
                { key: 'database', label: 'Schéma PostgreSQL & RLS', icon: <FiDatabase /> },
                { key: 'dispatch', label: 'Algorithme de Dispatch', icon: <FiCpu /> },
                { key: 'financial', label: 'Moteur Financier & Marges', icon: <FiTrendingUp /> },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTechTab(tab.key as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTechTab === tab.key
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB 1: ARCHITECTURE */}
            {activeTechTab === 'architecture' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FiLayers className="text-brand-600" /> Architecture Globale du Système
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Application hybride Edge/Serverless haute performance construite pour la scalabilité et la sécurité financière.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-xs text-slate-900 uppercase tracking-wider text-brand-700 mb-1">
                      Frontend & Edge Layer
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1.5 mt-2">
                      <li>• <strong>Framework :</strong> Next.js 14 (App Router)</li>
                      <li>• <strong>Runtime :</strong> Edge Runtime & SSR</li>
                      <li>• <strong>Styles :</strong> Tailwind CSS v3.4 (Design system épuré)</li>
                      <li>• <strong>I18n :</strong> Contexte trilingue dynamique (FR, AR RTL, EN)</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-xs text-slate-900 uppercase tracking-wider text-cyan-700 mb-1">
                      Data & Backend
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1.5 mt-2">
                      <li>• <strong>Base de données :</strong> Supabase PostgreSQL</li>
                      <li>• <strong>Sécurité :</strong> Row Level Security (RLS) granulaire</li>
                      <li>• <strong>Authentification :</strong> Supabase Auth (JWT + RBAC)</li>
                      <li>• <strong>Storage :</strong> Supabase Storage pour les livrables</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-xs text-slate-900 uppercase tracking-wider text-amber-700 mb-1">
                      Paiements & Webhooks
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1.5 mt-2">
                      <li>• <strong>Gateways :</strong> Viva Wallet / CMI Webhooks</li>
                      <li>• <strong>Intégrité :</strong> Vérification de signature HMAC-SHA256</li>
                      <li>• <strong>Idempotence :</strong> Clés uniques de transaction</li>
                      <li>• <strong>Workers :</strong> Cloudflare Workers pour les emails</li>
                    </ul>
                  </div>
                </div>

                {/* Architecture Diagram Box */}
                <div className="bg-slate-900 text-slate-200 rounded-xl p-5 font-mono text-xs overflow-x-auto">
                  <div className="text-slate-400 mb-2">// Flux des Données et Traitement Sécurisé</div>
                  <pre className="text-[11px] leading-relaxed">
{`[Client / Navigateur] 
       │ (1) Création Tâche + Verrouillage Budget
       ▼
[Next.js API Gateway / Edge] ───► [Vérification Solde Disponible]
       │                                     │
       │ (2) Écriture Transaction             ▼
       ▼                             [Solde Disponible -> Solde Séquestre]
[Supabase PostgreSQL (RLS)]
       │
       │ (3) Broadcast Realtime
       ▼
[Pool Prestataires Qualifiés] ───► (4) Prise en charge (< 45s)
       │
       │ (5) Dépôt de Preuve (Fichier / URL)
       ▼
[Client Inspection] ───► (6) Validation
                               │
                               ▼
            [Séquestre -> Disponible Prestataire] - [Commission Plateforme]`}</pre>
                </div>
              </div>
            )}

            {/* TAB 2: STATE MACHINE */}
            {activeTechTab === 'statemachine' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FiGitBranch className="text-cyan-600" /> Machine à États des Tâches & Séquestre
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Cycle de vie déterministe d'une tâche pour garantir l'inviolabilité des fonds.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      state: 'OPEN',
                      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      desc: 'La tâche est publiée. Le montant est prélevé du solde disponible du client et verrouillé dans son balanceEscrow.',
                      guard: 'balanceAvailable >= rewardDH',
                    },
                    {
                      state: 'IN_PROGRESS',
                      badge: 'bg-blue-50 text-blue-700 border-blue-200',
                      desc: 'Un freelance sélectionné a accepté la mission. Un compte à rebours est déclenché. Le montant reste sous séquestre.',
                      guard: 'performer.isQualified === true',
                    },
                    {
                      state: 'UNDER_REVIEW',
                      badge: 'bg-amber-50 text-amber-700 border-amber-200',
                      desc: 'Le freelance a soumis sa preuve d\'exécution (fichier ou lien). Le client est notifié pour inspection.',
                      guard: 'submissionProof.length > 0',
                    },
                    {
                      state: 'COMPLETED',
                      badge: 'bg-brand-50 text-brand-700 border-brand-200',
                      desc: 'Le client a validé. Les fonds quittent le séquestre : (Budget - Commission 15%) est crédité sur le solde disponible du freelance.',
                      guard: 'customer.approve()',
                    },
                    {
                      state: 'DISPUTED / ARBITRATION',
                      badge: 'bg-rose-50 text-rose-700 border-rose-200',
                      desc: 'Le client ou le freelance a ouvert un litige. L\'arbitre admin intervient pour autoriser un remboursement ou valider la livraison.',
                      guard: 'disputeReason.length > 0',
                    },
                  ].map((st, i) => (
                    <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${st.badge}`}>
                            {st.state}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1.5">{st.desc}</p>
                      </div>
                      <div className="shrink-0 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-700">
                        Guard: {st.guard}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: DATABASE & RLS */}
            {activeTechTab === 'database' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FiDatabase className="text-brand-600" /> Schéma PostgreSQL & Row Level Security (RLS)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Isolation stricte des données au niveau de la base PostgreSQL Supabase.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono">
                    <div className="text-emerald-400 font-bold mb-2">// Table users (Profils & Soldes)</div>
                    <pre className="text-[11px] overflow-x-auto">{`CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  phone TEXT,
  cin_number TEXT,
  active_role TEXT DEFAULT 'CUSTOMER',
  balance_available NUMERIC DEFAULT 0,
  balance_escrow NUMERIC DEFAULT 0,
  qualification_passed BOOLEAN DEFAULT false,
  rating NUMERIC DEFAULT 5.0,
  created_at TIMESTAMPTZ DEFAULT now()
);`}</pre>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono">
                    <div className="text-cyan-400 font-bold mb-2">// Table tasks (Missions & États)</div>
                    <pre className="text-[11px] overflow-x-auto">{`CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES users(id),
  performer_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  reward_dh INTEGER NOT NULL,
  status TEXT DEFAULT 'OPEN',
  proof_submission JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);`}</pre>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                  <div className="font-bold mb-1 flex items-center gap-1.5">
                    <FiLock /> Politiques de Sécurité Row Level Security (RLS) :
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    <li>Un utilisateur ne peut consulter ou modifier que son propre portefeuille (`auth.uid() = user_id`).</li>
                    <li>Les prestataires ne peuvent soumettre une preuve que s'ils sont désignés sur la tâche (`auth.uid() = performer_id`).</li>
                    <li>Seuls les comptes administrateurs peuvent forcer le déblocage d'arbitrage (<code>auth.jwt() -&gt;&gt; 'role' = 'admin'</code>).</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 4: DISPATCH ALGORITHM */}
            {activeTechTab === 'dispatch' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FiCpu className="text-indigo-600" /> Algorithme de Dispatch Express Workzilla
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Formule de ranking dynamique pour apparier les tâches avec les meilleurs prestataires en &lt; 45s.
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                    Formule de Notation du Prestataire (Matching Score)
                  </h4>
                  <div className="p-4 bg-slate-900 text-cyan-300 font-mono text-xs rounded-lg overflow-x-auto">
                    Score = (0.35 × Rating) + (0.25 × CompletionRate) + (0.20 × LatencyScore) + (0.20 × CategorySkillWeight) - (0.15 × ActiveTaskLoad)
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs text-slate-600">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <strong>• Rating (Note moyenne) :</strong> Note sur 5.0 basée sur les évaluations vérifiées des clients précédents.
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <strong>• LatencyScore :</strong> Rapidité de prise en charge historique (réactivité sous 2 minutes = score max).
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <strong>• CategorySkillWeight :</strong> Compatibilité avec la catégorie (ex: Test Android, Excel, Graphisme).
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <strong>• ActiveTaskLoad :</strong> Pénalité si le freelance a déjà &gt; 2 tâches en cours pour éviter les retards.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: FINANCIAL ENGINE */}
            {activeTechTab === 'financial' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FiTrendingUp className="text-emerald-600" /> Moteur Financier & Modèle de Commission
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Spécification des règles de calcul de commission, seuils de retrait et conversions de devises.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">Commission Plateforme (Take-Rate)</div>
                    <div className="text-2xl font-black text-brand-700 my-1">15% à 20%</div>
                    <p className="text-slate-500">
                      Déduite automatiquement à la libération des fonds. Publication gratuite pour le client.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">Seuil Minimum de Retrait</div>
                    <div className="text-2xl font-black text-slate-900 my-1">1 000 DH</div>
                    <p className="text-slate-500">
                      Protège la rentabilité unitaire contre les frais de virement bancaire fixes.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">Taux de Conversion Viva / MAD</div>
                    <div className="text-2xl font-black text-cyan-700 my-1">1 EUR = 10.80 DH</div>
                    <p className="text-slate-500">
                      Conversion transparente pour les cartes internationales et les comptes EUR.
                    </p>
                  </div>
                </div>

                {/* Calculation Example Box */}
                <div className="p-5 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono">
                  <div className="text-amber-400 font-bold mb-2">// Exemple de Répartition d'une Tâche de 100 DH</div>
                  <div className="space-y-1 text-slate-300">
                    <div>1. Dépôt client : <span className="text-white font-bold">100.00 DH</span> (bloqué en séquestre)</div>
                    <div>2. Livraison et validation par le client</div>
                    <div>3. Part reversée au freelance (85%) : <span className="text-emerald-400 font-bold">+85.00 DH</span> (crédité solde disponible)</div>
                    <div>4. Commission plateforme (15%) : <span className="text-cyan-400 font-bold">+15.00 DH</span> (revenu brut tâches.ma)</div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Bottom Navigation CTA */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              Prêt à tester la plateforme ?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Publiez votre première micro-tâche ou commencez à travailler comme freelance qualifié.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.push(`/${locale}/tasks`)}
              className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-2"
            >
              <span>Explorer les missions</span>
              {isRTL ? <FiArrowLeft /> : <FiArrowRight />}
            </button>
            <button
              onClick={() => router.push(`/${locale}`)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
