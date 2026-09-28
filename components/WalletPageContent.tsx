'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, WalletTransaction } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  FiShield,
  FiLock,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiCreditCard,
  FiCheckCircle,
  FiDollarSign,
  FiPlus,
  FiSearch,
  FiInfo,
  FiCheck,
  FiPhoneCall,
  FiArrowRight,
  FiTrendingUp,
  FiLayers
} from 'react-icons/fi';

interface WalletPageContentProps {
  user: UserProfile;
  transactions: WalletTransaction[];
  onDeposit: (amountDH: number) => void;
  onWithdraw: (amountDH: number) => void;
}

const MOROCCAN_BANKS: Record<string, { name: string; color: string; bg: string }> = {
  '230': { name: 'CIH Bank', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  '007': { name: 'Attijariwafa Bank', color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' },
  '181': { name: 'Banque Populaire (BCP)', color: 'text-yellow-800', bg: 'bg-yellow-50 border-yellow-200' },
  '190': { name: 'Banque Populaire (BCP)', color: 'text-yellow-800', bg: 'bg-yellow-50 border-yellow-200' },
  '145': { name: 'Banque Populaire (BCP)', color: 'text-yellow-800', bg: 'bg-yellow-50 border-yellow-200' },
  '101': { name: 'Banque Populaire (BCP)', color: 'text-yellow-800', bg: 'bg-yellow-50 border-yellow-200' },
  '011': { name: 'Bank of Africa (BMCE)', color: 'text-blue-800', bg: 'bg-blue-50 border-blue-200' },
  '013': { name: 'BMCI (BNP Paribas)', color: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200' },
  '022': { name: 'Société Générale Maroc', color: 'text-rose-800', bg: 'bg-rose-50 border-rose-200' },
  '050': { name: 'Crédit Agricole du Maroc', color: 'text-green-800', bg: 'bg-green-50 border-green-200' },
  '021': { name: 'Crédit du Maroc', color: 'text-cyan-800', bg: 'bg-cyan-50 border-cyan-200' },
  '350': { name: 'Al Barid Bank', color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' },
  '019': { name: 'CFG Bank', color: 'text-indigo-800', bg: 'bg-indigo-50 border-indigo-200' },
};

export const WalletPageContent: React.FC<WalletPageContentProps> = ({
  user,
  transactions,
  onDeposit,
  onWithdraw,
}) => {
  const router = useRouter();
  const { locale, isRTL } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw' | 'history' | 'security'>('overview');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState<number>(500);
  const [depositMethod, setDepositMethod] = useState<'cmi' | 'bank' | 'cash'>('cmi');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isDepositSubmitting, setIsDepositSubmitting] = useState(false);

  // Withdraw Form State
  const [withdrawAmount, setWithdrawAmount] = useState<number>(Math.min(500, Math.round(user.balanceAvailable * 10)));
  const [withdrawMethod, setWithdrawMethod] = useState<'rib' | 'cashplus'>('rib');
  const [ribNumber, setRibNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState(user.fullName || '');
  const [cinNumber, setCinNumber] = useState('');
  const [isWithdrawSubmitting, setIsWithdrawSubmitting] = useState(false);

  // Transaction Filters
  const [filterType, setFilterType] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'ESCROW'>('ALL');
  const [searchTx, setSearchTx] = useState('');

  const balanceDH = Math.round(user.balanceAvailable * 10);
  const escrowDH = Math.round(user.balanceEscrow * 10);
  const totalVolumeDH = Math.round((user.customerTotalSpent || user.balanceAvailable + 500) * 10);

  // Detect bank from Moroccan 24-digit RIB
  const detectedBank = useMemo(() => {
    const clean = ribNumber.replace(/\s+/g, '');
    if (clean.length >= 3) {
      const code = clean.slice(0, 3);
      return MOROCCAN_BANKS[code] || null;
    }
    return null;
  }, [ribNumber]);

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) return;
    setIsDepositSubmitting(true);

    setTimeout(() => {
      onDeposit(depositAmount);
      setIsDepositSubmitting(false);
      setSuccessToast(`Votre compte a été rechargé de ${depositAmount} DH avec succès.`);
      setActiveTab('overview');
      setTimeout(() => setSuccessToast(null), 5000);
    }, 600);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0 || withdrawAmount > balanceDH) return;
    setIsWithdrawSubmitting(true);

    setTimeout(() => {
      onWithdraw(withdrawAmount);
      setIsWithdrawSubmitting(false);
      setSuccessToast(`Demande de virement de ${withdrawAmount} DH initiée. Les fonds arriveront sous 24h ouvrées.`);
      setActiveTab('overview');
      setTimeout(() => setSuccessToast(null), 5000);
    }, 600);
  };

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Type filter
      if (filterType === 'DEPOSIT' && tx.type !== 'DEPOSIT') return false;
      if (filterType === 'WITHDRAWAL' && tx.type !== 'WITHDRAWAL') return false;
      if (filterType === 'ESCROW' && tx.type !== 'ESCROW_LOCK' && tx.type !== 'ESCROW_RELEASE') return false;

      // Text search
      if (searchTx.trim()) {
        const q = searchTx.toLowerCase();
        const desc = (tx.description || '').toLowerCase();
        const id = (tx.id || '').toLowerCase();
        const amt = (Math.round(tx.amount * 10)).toString();
        return desc.includes(q) || id.includes(q) || amt.includes(q);
      }

      return true;
    });
  }, [transactions, filterType, searchTx]);

  return (
    <main className="flex-1 py-8 sm:py-12 bg-slate-50/70">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Success Alert Banner */}
        {successToast && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-600 text-white p-4 shadow-lg animate-in fade-in slide-in-from-top-2">
            <FiCheckCircle className="text-xl shrink-0 text-emerald-200" />
            <div className="text-sm font-semibold">{successToast}</div>
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <button
            onClick={() => router.push(`/${locale}`)}
            className="hover:text-brand-700 transition-colors font-medium cursor-pointer"
          >
            Accueil
          </button>
          <span>/</span>
          <span className="font-bold text-slate-900">
            Portefeuille & Séquestre Daman
          </span>
        </nav>

        {/* Main Wallet Header Banner */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs mb-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800 mb-3">
                <FiShield className="text-emerald-600 text-sm" />
                <span>Sécurité Séquestre Daman • Conforme CMI & Bank Al-Maghrib</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                Portefeuille & Séquestre Garanti
              </h1>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Gérez vos fonds en Dirhams marocains (MAD), approvisionnez votre solde par carte bancaire ou virement instantané, et encaissez vos gains avec 0% de frais cachés.
              </p>
            </div>

            {/* Quick Actions Header CTAs */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveTab('deposit')}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition active:scale-95 cursor-pointer"
              >
                <FiPlus className="text-sm" />
                <span>Recharger mon solde</span>
              </button>
              <button
                onClick={() => setActiveTab('withdraw')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-800 shadow-2xs transition active:scale-95 cursor-pointer"
              >
                <FiArrowUpRight className="text-sm text-slate-500" />
                <span>Demander un virement</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Financial Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Available Balance */}
          <div className="rounded-2xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 text-white p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-brand-200 font-bold uppercase tracking-wider mb-1">
                <span>Solde Disponible</span>
                <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] text-brand-100 font-semibold">MAD</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
                {balanceDH} <span className="text-xl font-bold text-brand-300">DH</span>
              </div>
              <p className="mt-2 text-[11px] text-brand-200/90 leading-tight">
                Prêt pour virement bancaire ou commande directe de tâches.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-brand-200">
              <span>0% frais de retrait</span>
              <button
                onClick={() => setActiveTab('withdraw')}
                className="text-white font-bold underline hover:text-brand-100 cursor-pointer"
              >
                Retirer &rarr;
              </button>
            </div>
          </div>

          {/* Card 2: Escrow Locked */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                <span>Fonds sous Séquestre</span>
                <FiLock className="text-amber-600 text-sm" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
                {escrowDH} <span className="text-xl font-bold text-slate-400">DH</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 leading-tight">
                Fonds protégés et bloqués pour la validation de vos missions en cours.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-amber-700 font-semibold">
              <span>Protégé par Daman</span>
              <button
                onClick={() => setActiveTab('security')}
                className="text-brand-700 font-bold hover:underline cursor-pointer"
              >
                Détails &rarr;
              </button>
            </div>
          </div>

          {/* Card 3: Activity Volume */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                <span>Total Activité</span>
                <FiTrendingUp className="text-emerald-600 text-sm" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
                {totalVolumeDH} <span className="text-xl font-bold text-slate-400">DH</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 leading-tight">
                {user.activeRole === 'CUSTOMER'
                  ? 'Total investi en micro-missions freelance vérifiées.'
                  : 'Total des missions et gains cumulés sur votre profil.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>{user.activeRole === 'CUSTOMER' ? `${user.customerTasksPosted} tâches déposées` : `${user.performerCompletedTasks} tâches réussies`}</span>
              <span className="font-bold text-emerald-700">100% vérifié</span>
            </div>
          </div>

          {/* Card 4: Support & Assistance */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-emerald-800 font-bold uppercase tracking-wider mb-1">
                <span>Support Daman 7j/7</span>
                <FiPhoneCall className="text-emerald-700 text-sm" />
              </div>
              <div className="text-base font-extrabold text-emerald-950 mt-1">
                Assistance au Maroc
              </div>
              <p className="mt-2 text-[11px] text-emerald-800 leading-relaxed">
                Une question sur un virement ou un litige ? Nos équipes à Casablanca vous répondent par WhatsApp sous 5 minutes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-200/60">
              <a
                href="https://wa.me/212600000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 underline"
              >
                Contacter via WhatsApp &rarr;
              </a>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-xs mb-8">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FiLayers className="text-sm" />
              <span>Aperçu & Historique</span>
            </button>

            <button
              onClick={() => setActiveTab('deposit')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                activeTab === 'deposit'
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FiPlus className="text-sm" />
              <span>Recharger le solde (Dépôt)</span>
            </button>

            <button
              onClick={() => setActiveTab('withdraw')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                activeTab === 'withdraw'
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FiArrowUpRight className="text-sm" />
              <span>Demander un virement (Retrait)</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FiShield className="text-sm" />
              <span>Garantie Séquestre Daman</span>
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW & TRANSACTIONS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setFilterType('ALL')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    filterType === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Toutes les opérations ({transactions.length})
                </button>
                <button
                  onClick={() => setFilterType('DEPOSIT')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    filterType === 'DEPOSIT'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  Recharges
                </button>
                <button
                  onClick={() => setFilterType('WITHDRAWAL')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    filterType === 'WITHDRAWAL'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Retraits
                </button>
                <button
                  onClick={() => setFilterType('ESCROW')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    filterType === 'ESCROW'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  Séquestre
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="text"
                  value={searchTx}
                  onChange={(e) => setSearchTx(e.target.value)}
                  placeholder="Rechercher une transaction..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-2 text-xs text-slate-900 outline-none focus:border-brand-700 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Transactions Table / List */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900">
                  Journal des flux financiers
                </h3>
                <span className="text-xs text-slate-400">
                  {filteredTransactions.length} opération(s) affichée(s)
                </span>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
                    <FiSearch className="text-xl" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Aucune transaction trouvée</h4>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                    Aucune opération ne correspond à vos filtres actuels.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredTransactions.map((tx) => {
                    const isPositive = tx.type === 'DEPOSIT' || tx.type === 'ESCROW_RELEASE';
                    const isLock = tx.type === 'ESCROW_LOCK';
                    const txAmountDH = Math.round(Math.abs(tx.amount) * 10);

                    return (
                      <div
                        key={tx.id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                      >
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              isPositive
                                ? 'bg-emerald-100 text-emerald-700'
                                : isLock
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isPositive ? (
                              <FiArrowDownLeft className="text-lg" />
                            ) : isLock ? (
                              <FiLock className="text-lg" />
                            ) : (
                              <FiArrowUpRight className="text-lg" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs sm:text-sm text-slate-900">
                                {tx.description}
                              </span>
                              <span
                                className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                  tx.type === 'DEPOSIT'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : tx.type === 'WITHDRAWAL'
                                    ? 'bg-slate-100 text-slate-800 border border-slate-200'
                                    : isLock
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : 'bg-brand-50 text-brand-800 border border-brand-200'
                                }`}
                              >
                                {tx.type === 'DEPOSIT'
                                  ? 'Recharge'
                                  : tx.type === 'WITHDRAWAL'
                                  ? 'Virement'
                                  : isLock
                                  ? 'Séquestre Bloqué'
                                  : 'Gains Libérés'}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                              <span>Réf: <span className="font-mono text-slate-600">{tx.id}</span></span>
                              <span>•</span>
                              <span>{tx.createdAt}</span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                                <FiCheckCircle className="text-[11px]" />
                                Validé
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div
                            className={`text-base sm:text-lg font-black ${
                              isPositive
                                ? 'text-emerald-700'
                                : isLock
                                ? 'text-amber-700'
                                : 'text-slate-900'
                            }`}
                          >
                            {isPositive ? '+' : '-'}{txAmountDH} DH
                          </div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">
                            Garanti Daman
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DEPOSIT */}
        {activeTab === 'deposit' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handleDepositSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Approvisionner votre solde en Dirhams (MAD)
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    Ajoutez des fonds pour commander des micro-services ou engager des freelances marocains instantanément. Vos fonds restent sous séquestre jusqu'à votre accord.
                  </p>
                </div>

                {/* Preset Fast Amounts */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                    Sélection rapide du montant :
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[100, 200, 500, 1000, 2500, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDepositAmount(amt)}
                        className={`rounded-xl p-3 text-center transition cursor-pointer border ${
                          depositAmount === amt
                            ? 'border-brand-700 bg-brand-50 text-brand-900 font-black shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 font-bold hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-sm">{amt} DH</div>
                        <div className="text-[10px] text-slate-400 font-normal">MAD</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Ou saisissez un montant personnalisé (DH) :
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={50}
                      step={50}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded-xl border border-slate-300 bg-white p-3.5 pr-14 text-lg font-black text-slate-900 outline-none focus:border-brand-700 transition"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                      DH MAD
                    </span>
                  </div>
                </div>

                {/* Payment Channel Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                    Mode de paiement sécurisé au Maroc :
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div
                      onClick={() => setDepositMethod('cmi')}
                      className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between ${
                        depositMethod === 'cmi'
                          ? 'border-brand-700 bg-brand-50/50 shadow-xs ring-1 ring-brand-700'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <FiCreditCard className="text-brand-700 text-xl" />
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Instantané</span>
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-900">Carte Bancaire CMI</h4>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Visa, Mastercard, CMI (Banques marocaines & internationales)
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => setDepositMethod('bank')}
                      className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between ${
                        depositMethod === 'bank'
                          ? 'border-brand-700 bg-brand-50/50 shadow-xs ring-1 ring-brand-700'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <FiArrowDownLeft className="text-brand-700 text-xl" />
                          <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">Virement</span>
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-900">Virement Instantané</h4>
                        <p className="mt-1 text-[11px] text-slate-500">
                          CIH Bank, Attijariwafa, Banque Populaire, Bank of Africa
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => setDepositMethod('cash')}
                      className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between ${
                        depositMethod === 'cash'
                          ? 'border-brand-700 bg-brand-50/50 shadow-xs ring-1 ring-brand-700'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <FiDollarSign className="text-amber-700 text-xl" />
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Espèces</span>
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-900">Cash Plus / Wafacash</h4>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Dépôt en espèces sans carte dans plus de 3 000 agences
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-form based on method */}
                {depositMethod === 'cmi' && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Paiement sécurisé CMI 3D-Secure</span>
                      <span className="text-[10px] font-semibold text-emerald-700">Cryptage SSL 256-bit</span>
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Numéro de carte bancaire (16 chiffres)"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-mono outline-none focus:border-brand-700"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="MM / AA"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-mono outline-none focus:border-brand-700"
                        required
                      />
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="CVV (3 chiffres au dos)"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-mono outline-none focus:border-brand-700"
                        required
                      />
                    </div>
                  </div>
                )}

                {depositMethod === 'bank' && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                    <div className="font-bold text-slate-900">Coordonnées bancaires pour virement instantané :</div>
                    <div className="font-mono text-[11px] bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                      <div><span className="text-slate-400">Banque :</span> CIH Bank Maroc (Centre des Entreprises)</div>
                      <div><span className="text-slate-400">Titulaire :</span> TÂCHES SERVICES MAROC SARL</div>
                      <div><span className="text-slate-400">RIB 24 chiffres :</span> 230 780 0000 1234 5678 9012 34</div>
                      <div><span className="text-slate-400">Motif obligatoire :</span> <span className="font-bold text-brand-700">DEP-{user.id.toUpperCase()}</span></div>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Les virements instantanés CIH, Attijari et BCP sont crédités sous 10 minutes.
                    </p>
                  </div>
                )}

                {depositMethod === 'cash' && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                    <div className="font-bold">Code de versement en agence Cash Plus / Wafacash :</div>
                    <p className="text-[11px] leading-relaxed">
                      Présentez votre CIN et communiquez le code convention <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-amber-300">TACHES-MA-2026</span> au guichet avec votre identifiant client <span className="font-mono font-bold">{user.id}</span>.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isDepositSubmitting || depositAmount <= 0}
                  className="w-full rounded-2xl bg-brand-700 hover:bg-brand-800 py-4 text-sm font-extrabold text-white shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isDepositSubmitting ? 'Traitement sécurisé en cours...' : `Confirmer et créditer ${depositAmount} DH`}
                </button>
              </form>
            </div>

            {/* Sidebar Summary & Escrow Guarantee */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                  Récapitulatif de la recharge
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Montant crédité :</span>
                    <span className="font-bold text-slate-900">{depositAmount} DH</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Frais plateforme :</span>
                    <span className="font-bold text-emerald-700">0 DH (Gratuit)</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Délai de crédit :</span>
                    <span className="font-bold text-slate-900">Immédiat</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-black text-slate-900">
                    <span>Total à régler :</span>
                    <span className="text-brand-700">{depositAmount} DH</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase tracking-wider">
                  <FiShield className="text-emerald-700 text-base" />
                  <span>Séquestre Daman Garanti</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  Lorsque vous confiez une mission à un prestataire, l'argent n'est jamais versé d'avance : il est bloqué sous séquestre et n'est libéré qu'après réception de vos livrables conformes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WITHDRAW */}
        {activeTab === 'withdraw' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handleWithdrawSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Demander un virement bancaire (Retrait)
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    Transférez vos gains validés vers n'importe quelle banque marocaine ou en espèces via le réseau Cash Plus.
                  </p>
                </div>

                {/* Available for withdraw banner */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Solde actuellement disponible au retrait :</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">{balanceDH} DH</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(balanceDH)}
                    className="rounded-xl bg-white border border-slate-300 hover:border-brand-700 px-3 py-1.5 text-xs font-bold text-brand-700 transition cursor-pointer"
                  >
                    Tout retirer
                  </button>
                </div>

                {/* Amount input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Montant du virement souhaité (DH) :
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={50}
                      max={balanceDH}
                      step={50}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(Math.min(balanceDH, Math.max(0, Number(e.target.value))))}
                      className="w-full rounded-xl border border-slate-300 bg-white p-3.5 pr-14 text-lg font-black text-slate-900 outline-none focus:border-brand-700 transition"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                      DH MAD
                    </span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    {[0.25, 0.5, 0.75, 1].map((ratio) => {
                      const val = Math.round(balanceDH * ratio);
                      return (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => setWithdrawAmount(val)}
                          className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                        >
                          {ratio === 1 ? '100%' : `${ratio * 100}%`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Payout method choice */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                    Mode de réception du virement :
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setWithdrawMethod('rib')}
                      className={`rounded-2xl p-4 border transition cursor-pointer ${
                        withdrawMethod === 'rib'
                          ? 'border-brand-700 bg-brand-50/50 shadow-xs ring-1 ring-brand-700'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <h4 className="font-extrabold text-xs text-slate-900">Virement Bancaire (RIB 24 chiffres)</h4>
                      <p className="mt-1 text-[11px] text-slate-500">
                        CIH Bank, Attijariwafa, Banque Populaire, BMCE, SGMB, etc.
                      </p>
                    </div>

                    <div
                      onClick={() => setWithdrawMethod('cashplus')}
                      className={`rounded-2xl p-4 border transition cursor-pointer ${
                        withdrawMethod === 'cashplus'
                          ? 'border-brand-700 bg-brand-50/50 shadow-xs ring-1 ring-brand-700'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <h4 className="font-extrabold text-xs text-slate-900">Mise à disposition Cash Plus</h4>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Retrait en espèces immédiat avec Carte d'Identité Nationale (CIN)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form fields based on withdraw method */}
                {withdrawMethod === 'rib' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Relevé d'Identité Bancaire (RIB marocain - 24 chiffres) :
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 230 780 0000000000000000 00"
                        value={ribNumber}
                        onChange={(e) => setRibNumber(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-mono text-slate-900 outline-none focus:border-brand-700"
                        required
                      />
                      {/* Bank detection badge */}
                      {detectedBank && (
                        <div className={`mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold border ${detectedBank.bg} ${detectedBank.color}`}>
                          <FiCheck className="text-sm" />
                          <span>Banque détectée : {detectedBank.name}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Nom et Prénom du titulaire du compte :
                      </label>
                      <input
                        type="text"
                        placeholder="Doit correspondre à votre compte bancaire"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 outline-none focus:border-brand-700"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Numéro de Carte Nationale d'Identité (CIN marocain) :
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: BE123456"
                        value={cinNumber}
                        onChange={(e) => setCinNumber(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-mono text-slate-900 outline-none focus:border-brand-700 uppercase"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Nom complet du bénéficiaire :
                      </label>
                      <input
                        type="text"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 outline-none focus:border-brand-700"
                        required
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isWithdrawSubmitting || withdrawAmount <= 0 || withdrawAmount > balanceDH}
                  className="w-full rounded-2xl bg-brand-700 hover:bg-brand-800 py-4 text-sm font-extrabold text-white shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isWithdrawSubmitting ? 'Transfert en cours d’exécution...' : `Transférer ${withdrawAmount} DH`}
                </button>
              </form>
            </div>

            {/* Sidebar Details */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                  Détails du virement
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Montant demandé :</span>
                    <span className="font-bold text-slate-900">{withdrawAmount} DH</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Frais de virement :</span>
                    <span className="font-bold text-emerald-700">0 DH (Offert par la plateforme)</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Délai de réception :</span>
                    <span className="font-bold text-slate-900">24 heures ouvrées</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-black text-slate-900">
                    <span>Montant net versé :</span>
                    <span className="text-brand-700">{withdrawAmount} DH</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-xs space-y-3">
                <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <FiInfo className="text-brand-700" />
                  Réglementation Bank Al-Maghrib
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Les virements sont émis directement en Dirhams (MAD) via compensation bancaire marocaine (SIMT). Aucun frais de change n'est appliqué.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DAMAN SECURITY EXPLANATION */}
        {activeTab === 'security' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs space-y-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800 mb-3">
                <FiShield className="text-emerald-600" />
                <span>Protection Daman à 100%</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Comment fonctionne le Séquestre Daman au Maroc ?
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Le système de séquestre (Escrow) de tâches.ma élimine tout risque d'impayé ou d'escroquerie entre clients et prestataires indépendants au Maroc.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white font-extrabold text-sm">
                  1
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">Dépôt sous séquestre</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Le client dépose le budget de la mission. Les fonds sont immédiatement sécurisés sur un compte séquestre inviolable.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white font-extrabold text-sm">
                  2
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">Réalisation en confiance</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Le freelance commence la mission en sachant que les fonds sont déjà réservés et garantis à 100%.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white font-extrabold text-sm">
                  3
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">Validation des livrables</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Le client vérifie les preuves et le travail fourni. Il a la possibilité de demander des retouches si nécessaire.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-extrabold text-sm">
                  4
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">Libération instantanée</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dès approbation du client, l'argent est crédité sur le solde disponible du freelance, retirable par virement sous 24h.
                </p>
              </div>
            </div>

            {/* Arbitration Callout */}
            <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-brand-950 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-brand-300 uppercase tracking-wider">
                  Litige ou Désaccord ?
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold">
                  Arbitrage Tâches.ma sous 24 heures
                </h3>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  En cas de litige entre un client et un prestataire, notre équipe d'arbitrage à Casablanca étudie les échanges et les preuves pour débloquer ou rembourser les fonds en toute neutralité.
                </p>
              </div>

              <a
                href="https://wa.me/212600000000"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-5 py-3 text-xs font-extrabold text-slate-950 shadow-md transition"
              >
                <FiPhoneCall className="text-sm" />
                <span>Support Arbitrage WhatsApp</span>
              </a>
            </div>
          </div>
        )}

      </div>
    </main>
  );
};
