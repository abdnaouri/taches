'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, WalletTransaction } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  calculatePayoutFees,
  MIN_WITHDRAWAL_DH,
  PayoutMethod,
  MAD_TO_EUR_RATE,
} from '@/lib/payoutService';
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
  FiLayers,
  FiZap,
  FiClock,
  FiAlertTriangle,
  FiCopy,
  FiSend
} from 'react-icons/fi';
import { SiBinance } from 'react-icons/si';

interface WalletPageContentProps {
  user: UserProfile;
  transactions: WalletTransaction[];
  onDeposit: (amountDH: number) => void;
  onWithdraw: (amountDH: number, details?: any) => void;
}

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
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState<number>(500);
  const [depositMethod, setDepositMethod] = useState<'card' | 'remitly' | 'crypto'>('remitly');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isDepositSubmitting, setIsDepositSubmitting] = useState(false);

  // Withdraw Form State
  const [withdrawAmount, setWithdrawAmount] = useState<number>(Math.max(MIN_WITHDRAWAL_DH, Math.round(user.balanceAvailable * 10)));
  const [withdrawMethod, setWithdrawMethod] = useState<PayoutMethod>('REMITLY');
  
  // Remitly Destination Details
  const [remitlyRecipientName, setRemitlyRecipientName] = useState(user.fullName || '');
  const [remitlyPhoneOrEmail, setRemitlyPhoneOrEmail] = useState('');
  const [remitlyCountry, setRemitlyCountry] = useState('Maroc');
  
  // Binance Pay Destination Details
  const [binancePayId, setBinancePayId] = useState('');
  const [isWithdrawSubmitting, setIsWithdrawSubmitting] = useState(false);

  // Transaction Filters
  const [filterType, setFilterType] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'ESCROW' | 'COMMISSION'>('ALL');
  const [searchTx, setSearchTx] = useState('');

  const balanceDH = Math.round(user.balanceAvailable * 10);
  const escrowDH = Math.round(user.balanceEscrow * 10);
  const totalVolumeDH = Math.round((user.customerTotalSpent || user.balanceAvailable + 500) * 10);

  // Dynamic fee calculation for withdrawal
  const payoutCalculation = useMemo(() => {
    return calculatePayoutFees(withdrawAmount, withdrawMethod, balanceDH);
  }, [withdrawAmount, withdrawMethod, balanceDH]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) return;
    setIsDepositSubmitting(true);

    setTimeout(() => {
      onDeposit(depositAmount);
      setIsDepositSubmitting(false);
      setSuccessToast(`Votre compte a été rechargé de ${depositAmount} DH (${(depositAmount * MAD_TO_EUR_RATE).toFixed(2)} €) avec succès.`);
      setActiveTab('overview');
      setTimeout(() => setSuccessToast(null), 5000);
    }, 600);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutCalculation.isValid) return;
    setIsWithdrawSubmitting(true);

    const payloadDetails = {
      method: withdrawMethod,
      recipientName: remitlyRecipientName,
      phoneOrEmail: remitlyPhoneOrEmail,
      country: remitlyCountry,
      binancePayId,
      feeDH: payoutCalculation.feeDH,
      netAmountDH: payoutCalculation.netAmountDH,
    };

    setTimeout(() => {
      onWithdraw(withdrawAmount, payloadDetails);
      setIsWithdrawSubmitting(false);
      setSuccessToast(
        `Demande de retrait de ${withdrawAmount} DH initiée avec succès (Net viré : ${payoutCalculation.netAmountDH} DH).`
      );
      setActiveTab('overview');
      setTimeout(() => setSuccessToast(null), 6000);
    }, 600);
  };

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (filterType === 'DEPOSIT' && tx.type !== 'DEPOSIT') return false;
      if (filterType === 'WITHDRAWAL' && tx.type !== 'WITHDRAWAL') return false;
      if (filterType === 'ESCROW' && tx.type !== 'ESCROW_LOCK' && tx.type !== 'ESCROW_RELEASE') return false;
      if (filterType === 'COMMISSION' && tx.type !== 'COMMISSION') return false;

      if (searchTx.trim()) {
        const q = searchTx.toLowerCase();
        const desc = (tx.description || '').toLowerCase();
        const id = (tx.id || '').toLowerCase();
        const amt = Math.round(tx.amount * 10).toString();
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
            Portefeuille & Séquestre Garanti
          </span>
        </nav>

        {/* Main Wallet Header Banner */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs mb-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800 mb-3">
                <FiShield className="text-emerald-600 text-sm" />
                <span>Sécurité Séquestre Daman • Remitly & Binance Pay</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                Portefeuille & Gestion Financière
              </h1>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Gérez vos fonds en Dirhams marocains (MAD) avec équivalence internationale en Euros. Vos paiements clients sont sécurisés sous séquestre neutre et vos retraits freelances sont virés directement via Remitly ou Binance Pay.
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
                <span>Demander un retrait</span>
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
                <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] text-brand-100 font-semibold">
                  ~{(balanceDH * MAD_TO_EUR_RATE).toFixed(2)} €
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
                {balanceDH} <span className="text-xl font-bold text-brand-300">DH</span>
              </div>
              <p className="mt-2 text-[11px] text-brand-200/90 leading-tight">
                Fonds débloqués prêts pour retrait direct ou commande de nouvelles tâches.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-brand-200">
              <span>Min. retrait : {MIN_WITHDRAWAL_DH} DH</span>
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
                Fonds verrouillés en toute sécurité pour garantir vos missions en cours de réalisation.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-amber-700 font-semibold">
              <span>Garantie Daman 100%</span>
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
                <span>Volume d'Activité</span>
                <FiTrendingUp className="text-emerald-600 text-sm" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
                {totalVolumeDH} <span className="text-xl font-bold text-slate-400">DH</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 leading-tight">
                {user.activeRole === 'CUSTOMER'
                  ? 'Total investi dans des prestations freelance vérifiées.'
                  : 'Total cumulé des gains et missions validées sur la plateforme.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>
                {user.activeRole === 'CUSTOMER'
                  ? `${user.customerTasksPosted} tâche(s) publiée(s)`
                  : `${user.performerCompletedTasks} mission(s) réussie(s)`}
              </span>
              <span className="font-bold text-emerald-700">100% Vérifié</span>
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
                Assistance & Arbitrage
              </div>
              <p className="mt-2 text-[11px] text-emerald-800 leading-relaxed">
                Une question sur un virement ou un litige ? Notre équipe de médiation intervient sous 24h.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-200/60">
              <a
                href="mailto:contact@taches.ma?subject=Support%20Portefeuille%20Taches.ma"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 underline"
              >
                Assistance & Support Client &rarr;
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
              <span>Aperçu & Journal des flux</span>
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
              <span>Demander un retrait (Payout)</span>
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
                  Toutes ({transactions.length})
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
                <button
                  onClick={() => setFilterType('COMMISSION')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    filterType === 'COMMISSION'
                      ? 'bg-indigo-700 text-white'
                      : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
                  }`}
                >
                  Commissions
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="text"
                  value={searchTx}
                  onChange={(e) => setSearchTx(e.target.value)}
                  placeholder="Rechercher une opération..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-2 text-xs text-slate-900 outline-none focus:border-brand-700 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Transactions List */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900">
                  Journal des flux financiers
                </h3>
                <span className="text-xs text-slate-400">
                  {filteredTransactions.length} opération(s)
                </span>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
                    <FiSearch className="text-xl" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Aucune opération trouvée</h4>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                    Aucune transaction ne correspond à vos filtres actuels.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredTransactions.map((tx) => {
                    const isPositive = tx.type === 'DEPOSIT' || tx.type === 'ESCROW_RELEASE';
                    const isLock = tx.type === 'ESCROW_LOCK';
                    const isCommission = tx.type === 'COMMISSION';
                    const txAmountDH = Math.round(Math.abs(tx.amount) * 10);
                    const txAmountEur = Math.abs(tx.amount).toFixed(2);
                    const isPending = tx.status === 'PENDING';

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
                                : isCommission
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isPositive ? (
                              <FiArrowDownLeft className="text-lg" />
                            ) : isLock ? (
                              <FiLock className="text-lg" />
                            ) : isCommission ? (
                              <FiDollarSign className="text-lg" />
                            ) : (
                              <FiArrowUpRight className="text-lg" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs sm:text-sm text-slate-900">
                                {tx.description}
                              </span>
                              <span
                                className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                  tx.type === 'DEPOSIT'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : tx.type === 'WITHDRAWAL'
                                    ? 'bg-slate-100 text-slate-800 border border-slate-200'
                                    : tx.type === 'COMMISSION'
                                    ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                    : isLock
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : 'bg-brand-50 text-brand-800 border border-brand-200'
                                }`}
                              >
                                {tx.type === 'DEPOSIT'
                                  ? 'Recharge'
                                  : tx.type === 'WITHDRAWAL'
                                  ? 'Retrait'
                                  : tx.type === 'COMMISSION'
                                  ? 'Commission 15%'
                                  : isLock
                                  ? 'Séquestre Bloqué'
                                  : 'Gains Libérés'}
                              </span>

                              {isPending && (
                                <span className="rounded-md bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 text-[10px] font-extrabold inline-flex items-center gap-1">
                                  <FiClock className="text-[10px]" />
                                  En cours de traitement
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                              <span>Réf: <span className="font-mono text-slate-600">{tx.id}</span></span>
                              <span>•</span>
                              <span>{tx.createdAt}</span>
                              <span>•</span>
                              <span className="text-slate-400">~{txAmountEur} €</span>
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
                                : isCommission
                                ? 'text-indigo-700'
                                : 'text-slate-900'
                            }`}
                          >
                            {isPositive ? '+' : '-'}{txAmountDH} DH
                          </div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">
                            {isPending ? 'En vérification' : 'Garanti Daman'}
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
                    Approvisionner votre solde client
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    Déposez des fonds en Dirhams marocains (MAD) ou par carte internationale. Vos fonds sont conservés sous séquestre sécurisé et ne sont payés au prestataire qu’après validation de votre commande.
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
                        <div className="text-[10px] text-slate-400 font-normal">~{(amt * MAD_TO_EUR_RATE).toFixed(0)} €</div>
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
                      className="w-full rounded-xl border border-slate-300 bg-white p-3.5 pr-28 text-lg font-black text-slate-900 outline-none focus:border-brand-700 transition"
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-right">
                      <span className="font-bold text-slate-900 text-sm">DH MAD</span>
                      <div className="text-[10px] text-slate-400 font-semibold">
                        ~{(depositAmount * MAD_TO_EUR_RATE).toFixed(2)} €
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Channel Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                    Mode de recharge :
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div
                      onClick={() => setDepositMethod('remitly')}
                      className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between ${
                        depositMethod === 'remitly'
                          ? 'border-brand-700 bg-brand-50/50 shadow-xs ring-1 ring-brand-700'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <FiSend className="text-brand-700 text-xl" />
                          <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">Recommandé</span>
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-900">Remitly</h4>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Transfert international rapide et sécurisé
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => setDepositMethod('crypto')}
                      className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between ${
                        depositMethod === 'crypto'
                          ? 'border-brand-700 bg-brand-50/50 shadow-xs ring-1 ring-brand-700'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <SiBinance className="text-amber-500 text-xl" />
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">0% Frais</span>
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-900">Binance Pay / USDT</h4>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Dépôt crypto instantané sans frais bancaires
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => setDepositMethod('card')}
                      className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between ${
                        depositMethod === 'card'
                          ? 'border-brand-700 bg-brand-50/50 shadow-xs ring-1 ring-brand-700'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <FiCreditCard className="text-brand-700 text-xl" />
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Instantané</span>
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-900">Carte & Apple Pay</h4>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Visa, Mastercard, Cartes internationales
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-form based on method */}
                {depositMethod === 'card' && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Paiement sécurisé Smart Checkout 3D-Secure</span>
                      <span className="text-[10px] font-semibold text-emerald-700">SSL 256-bit</span>
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Numéro de carte (16 chiffres)"
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
                        placeholder="CVV (3 chiffres)"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-mono outline-none focus:border-brand-700"
                        required
                      />
                    </div>
                  </div>
                )}

                {depositMethod === 'crypto' && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold flex items-center gap-1.5">
                        <SiBinance className="text-amber-600 text-sm" />
                        Recharge par Binance Pay (USDT) :
                      </span>
                      <span className="text-[10px] font-bold bg-amber-200/80 px-2 py-0.5 rounded text-amber-900">
                        1 USDT = 10 MAD
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">ID Binance Pay Officiel :</span>
                        <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                          <span>892401844</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('892401844', 'binanceId')}
                            className="text-amber-700 hover:text-amber-800 p-1 cursor-pointer"
                          >
                            <FiCopy />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Montant équivalent USDT :</span>
                        <span className="font-bold text-emerald-700">{(depositAmount / 10).toFixed(2)} USDT</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {copiedText === 'binanceId' && <span className="text-emerald-700 font-bold">✓ ID copié dans le presse-papiers !</span>}
                      </div>
                    </div>
                    <p className="text-[11px] text-amber-900 leading-relaxed">
                      Scannez ou transférez directement depuis l'application Binance. Vos crédits apparaîtront sous 2 minutes.
                    </p>
                  </div>
                )}

                {depositMethod === 'remitly' && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <FiSend className="text-brand-700" />
                      Recharge via Remitly :
                    </div>
                    <div className="text-[11px] bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 leading-relaxed">
                      <div><span className="text-slate-400">Service :</span> Remitly Money Transfer</div>
                      <div><span className="text-slate-400">Référence client :</span> <span className="font-bold font-mono text-brand-700">DEP-{user.id.toUpperCase().slice(0, 8)}</span></div>
                      <p className="text-slate-600 mt-1">
                        Initiez votre transfert via Remitly en spécifiant votre référence client. Les fonds sont crédités automatiquement dès confirmation du transfert.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isDepositSubmitting || depositAmount <= 0}
                  className="w-full rounded-2xl bg-brand-700 hover:bg-brand-800 py-4 text-sm font-extrabold text-white shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isDepositSubmitting ? 'Traitement sécurisé en cours...' : `Confirmer et créditer ${depositAmount} DH (~${(depositAmount * MAD_TO_EUR_RATE).toFixed(2)} €)`}
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
                    <span>Équivalent EUR :</span>
                    <span className="font-bold text-slate-700">~{(depositAmount * MAD_TO_EUR_RATE).toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Frais de dépôt :</span>
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
                  Lorsque vous confiez une mission à un prestataire, l'argent n'est jamais versé d'avance : il est bloqué sous séquestre neutre et n'est libéré qu'après réception de vos livrables conformes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WITHDRAW (PAYOUT) */}
        {activeTab === 'withdraw' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handleWithdrawSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Demander un retrait de vos gains
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    Transférez vos gains validés directement via Remitly ou instantanément via Binance Pay (USDT).
                  </p>
                </div>

                {/* Available for withdraw banner */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Solde actuellement disponible au retrait :</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">
                      {balanceDH} DH <span className="text-sm font-normal text-slate-400">(~{(balanceDH * MAD_TO_EUR_RATE).toFixed(2)} €)</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(balanceDH)}
                    disabled={balanceDH < MIN_WITHDRAWAL_DH}
                    className="rounded-xl bg-white border border-slate-300 hover:border-brand-700 px-3 py-1.5 text-xs font-bold text-brand-700 transition cursor-pointer disabled:opacity-40"
                  >
                    Tout retirer
                  </button>
                </div>

                {/* Amount input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Montant du retrait souhaité (DH) :
                    </label>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      Min. {MIN_WITHDRAWAL_DH} DH
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min={MIN_WITHDRAWAL_DH}
                      max={balanceDH}
                      step={50}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded-xl border border-slate-300 bg-white p-3.5 pr-28 text-lg font-black text-slate-900 outline-none focus:border-brand-700 transition"
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-right">
                      <span className="font-bold text-slate-900 text-sm">DH MAD</span>
                      <div className="text-[10px] text-slate-400 font-semibold">
                        ~{(withdrawAmount * MAD_TO_EUR_RATE).toFixed(2)} €
                      </div>
                    </div>
                  </div>

                  {/* Percentage buttons */}
                  <div className="mt-2 flex gap-2">
                    {[0.25, 0.5, 0.75, 1].map((ratio) => {
                      const val = Math.max(MIN_WITHDRAWAL_DH, Math.round(balanceDH * ratio));
                      return (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => setWithdrawAmount(val)}
                          disabled={balanceDH < MIN_WITHDRAWAL_DH}
                          className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer disabled:opacity-40"
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
                    Mode de réception des fonds :
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Method 1: Remitly */}
                    <div
                      onClick={() => setWithdrawMethod('REMITLY')}
                      className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between ${
                        withdrawMethod === 'REMITLY'
                          ? 'border-brand-700 bg-brand-50/50 shadow-xs ring-1 ring-brand-700'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <FiSend className="text-brand-700 text-xl" />
                          <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">Recommandé</span>
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-900">Remitly</h4>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Transfert direct vers votre compte bancaire ou point de retrait
                        </p>
                      </div>
                    </div>

                    {/* Method 2: Binance Pay */}
                    <div
                      onClick={() => setWithdrawMethod('BINANCE_PAY')}
                      className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between ${
                        withdrawMethod === 'BINANCE_PAY'
                          ? 'border-brand-700 bg-brand-50/50 shadow-xs ring-1 ring-brand-700'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <SiBinance className="text-amber-500 text-xl" />
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">&lt; 15 min</span>
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-900">Binance Pay (USDT)</h4>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Transfert crypto instantané sur votre Binance ID
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form fields based on withdraw method */}
                {withdrawMethod === 'REMITLY' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Nom complet du bénéficiaire :
                      </label>
                      <input
                        type="text"
                        placeholder="Nom et prénom (tel qu'indiqué sur votre pièce d'identité)"
                        value={remitlyRecipientName}
                        onChange={(e) => setRemitlyRecipientName(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 outline-none focus:border-brand-700"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Téléphone ou Email associé à Remitly :
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: +212 600 000000 ou email@example.com"
                          value={remitlyPhoneOrEmail}
                          onChange={(e) => setRemitlyPhoneOrEmail(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 outline-none focus:border-brand-700"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Pays de réception :
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Maroc, France, etc."
                          value={remitlyCountry}
                          onChange={(e) => setRemitlyCountry(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 outline-none focus:border-brand-700"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {withdrawMethod === 'BINANCE_PAY' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-2">
                      <div className="font-bold flex items-center gap-1.5">
                        <SiBinance className="text-amber-600" />
                        Paiement direct sur Binance Pay :
                      </div>
                      <p className="text-[11px] text-amber-900 leading-relaxed">
                        Entrez votre ID Binance Pay (8 à 9 chiffres) ou votre adresse email Binance. Les fonds sont envoyés instantanément en USDT sans frais de réseau.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Votre ID Binance Pay ou Email Binance :
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 892401844 ou user@binance.com"
                        value={binancePayId}
                        onChange={(e) => setBinancePayId(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-mono text-slate-900 outline-none focus:border-brand-700"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Validation Warnings if any */}
                {!payoutCalculation.isValid && (
                  <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                    <FiAlertTriangle className="text-rose-600 shrink-0" />
                    <span>{payoutCalculation.errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isWithdrawSubmitting || !payoutCalculation.isValid}
                  className="w-full rounded-2xl bg-brand-700 hover:bg-brand-800 py-4 text-sm font-extrabold text-white shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isWithdrawSubmitting
                    ? 'Transfert en cours d’exécution...'
                    : `Transférer ${payoutCalculation.netAmountDH} DH Net (~${payoutCalculation.netAmountEur} €)`}
                </button>
              </form>
            </div>

            {/* Sidebar Details */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                  Détails du versement net
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Montant brut débité :</span>
                    <span className="font-bold text-slate-900">{withdrawAmount} DH</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Frais de traitement :</span>
                    <span className="font-bold text-emerald-700">0 DH (Gratuit)</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Délai estimé :</span>
                    <span className="font-bold text-emerald-700">
                      {payoutCalculation.estimatedHours <= 0.5
                        ? '< 15 minutes'
                        : '12-24h ouvrées'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-black text-slate-900">
                    <span>Montant net à recevoir :</span>
                    <span className="text-brand-700 text-base">{payoutCalculation.netAmountDH} DH</span>
                  </div>
                  <div className="text-[11px] text-slate-400 text-right">
                    ~{payoutCalculation.netAmountEur} € / {(payoutCalculation.netAmountDH / 10).toFixed(2)} USDT
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-xs space-y-3">
                <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <FiInfo className="text-brand-700" />
                  Réglementation & Sécurité
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Vos retraits sont exécutés en toute sécurité via nos partenaires agréés Remitly et Binance Pay. Aucun frais de change masqué n'est déduit.
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
                  Le client réserve le budget de la mission (+10% frais de protection). Les fonds sont immédiatement protégés sur un compte neutre.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white font-extrabold text-sm">
                  2
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">Réalisation en confiance</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Le freelance commence la mission avec la certitude que les fonds sont déjà provisionnés et garantis.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white font-extrabold text-sm">
                  3
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">Validation des livrables</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Le client vérifie les preuves et le travail fourni. Il peut approuver ou demander des retouches conformes.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-extrabold text-sm">
                  4
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">Libération instantanée</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dès accord client, le gain net (déduit de 15% commission) est crédité au freelance, retirable par Remitly ou Binance Pay.
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
                  En cas de litige entre un client et un prestataire, notre équipe de médiation étudie les échanges et les preuves pour débloquer ou rembourser les fonds en toute neutralité.
                </p>
              </div>

              <a
                href="mailto:contact@taches.ma?subject=Support%20Arbitrage%20Taches.ma"
                className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-5 py-3 text-xs font-extrabold text-slate-950 shadow-md transition"
              >
                <FiPhoneCall className="text-sm" />
                <span>Support & Médiation (contact@taches.ma)</span>
              </a>
            </div>
          </div>
        )}

      </div>
    </main>
  );
};
