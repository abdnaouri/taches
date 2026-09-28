'use client';

import React, { useState } from 'react';
import { UserProfile, WalletTransaction } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getLocalizedTransaction } from '@/lib/mockData';
import { 
  FiX, 
  FiLock, 
  FiArrowDownLeft, 
  FiArrowUpRight, 
  FiCheckCircle,
  FiShield
} from 'react-icons/fi';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  transactions: WalletTransaction[];
  onDeposit: (amountDH: number) => void;
  onWithdraw: (amountDH: number) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  user,
  transactions,
  onDeposit,
  onWithdraw,
}) => {
  const { t, locale, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'balance' | 'deposit' | 'withdraw'>('balance');
  const [customDepositDH, setCustomDepositDH] = useState<number>(500);
  const [withdrawAmountDH, setWithdrawAmountDH] = useState<number>(500);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const balanceDH = Math.round(user.balanceAvailable * 10);
  const escrowDH = Math.round(user.balanceEscrow * 10);

  const handleDepositClick = (amtDH: number) => {
    onDeposit(amtDH);
    setSuccessMsg(t('toastDepositSuccess', { amount: amtDH }));
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleWithdrawClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmountDH <= 0 || withdrawAmountDH > balanceDH) return;
    onWithdraw(withdrawAmountDH);
    setSuccessMsg(t('toastWithdrawalInitiated', { amount: withdrawAmountDH }));
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute ${isRTL ? 'left-5' : 'right-5'} top-5 rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer`}
        >
          <FiX className="text-lg" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-2.5 py-1 flex items-center gap-1">
            <FiShield className="text-emerald-700" />
            {t('walletSecurityBadge')}
          </span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t('walletModalSubtitle')}
          </span>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900">
          {t('walletModalTitle')}
        </h2>

        {/* Success toast */}
        {successMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3.5 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <FiCheckCircle className="text-emerald-600 text-base shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Balance Cards Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="rounded-xl bg-brand-900 text-white p-5 shadow-xs">
            <div className="text-xs text-brand-200 font-semibold uppercase tracking-wider">
              {t('walletAvailableBalance')}
            </div>
            <div className="text-3xl font-extrabold mt-1 text-white tracking-tight">
              {balanceDH} DH
            </div>
            <p className="mt-2 text-[11px] text-brand-200/80">
              {t('walletAvailableDesc')}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
              <span>{t('walletEscrowFunds')}</span>
              <FiLock className="text-amber-600 text-sm" />
            </div>
            <div className="text-3xl font-extrabold mt-1 text-slate-900 tracking-tight">
              {escrowDH} DH
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              {t('walletEscrowDesc')}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 flex border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('balance')}
            className={`pb-3 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${isRTL ? 'ml-6' : 'mr-6'} ${
              activeTab === 'balance'
                ? 'border-brand-700 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('tabOperationsHistory')}
          </button>
          <button
            onClick={() => setActiveTab('deposit')}
            className={`pb-3 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${isRTL ? 'ml-6' : 'mr-6'} ${
              activeTab === 'deposit'
                ? 'border-brand-700 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('tabDeposit')}
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`pb-3 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'withdraw'
                ? 'border-brand-700 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('tabWithdraw')}
          </button>
        </div>

        {/* TAB 1: OPERATIONS HISTORY */}
        {activeTab === 'balance' && (
          <div className="mt-5 space-y-3">
            {transactions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Aucune transaction enregistrée.</p>
            ) : (
              transactions.map((tx) => {
                const localizedTx = getLocalizedTransaction(tx, locale);
                const isPositive = tx.type === 'DEPOSIT' || tx.type === 'ESCROW_RELEASE';
                const txAmountDH = Math.round(tx.amount * 10);
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-800'}`}>
                        {isPositive ? <FiArrowDownLeft /> : <FiArrowUpRight />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{localizedTx.description}</div>
                        <div className="text-[10px] text-slate-500">{tx.createdAt}</div>
                      </div>
                    </div>
                    <div className={`font-bold text-sm ${isPositive ? 'text-emerald-700' : 'text-slate-800'}`}>
                      {isPositive ? '+' : '-'}{txAmountDH} DH
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: DEPOSIT */}
        {activeTab === 'deposit' && (
          <div className="mt-5 space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('depositDesc')}
            </p>

            <div className="grid grid-cols-3 gap-2.5">
              {[200, 500, 1000].map((amtDH) => (
                <button
                  key={amtDH}
                  type="button"
                  onClick={() => handleDepositClick(amtDH)}
                  className="rounded-xl border border-slate-300 bg-white p-3 text-center text-xs font-bold text-slate-900 hover:border-brand-700 hover:bg-brand-50 transition cursor-pointer"
                >
                  <div className="text-sm font-extrabold">{amtDH} DH</div>
                  <div className="text-[10px] text-emerald-700 font-bold">{t('depositInstant')}</div>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('depositCustomLabel')}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={50}
                  step={50}
                  value={customDepositDH}
                  onChange={(e) => setCustomDepositDH(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-bold text-slate-900 outline-none focus:border-brand-700"
                />
                <button
                  type="button"
                  onClick={() => handleDepositClick(customDepositDH)}
                  className="rounded-xl bg-brand-700 hover:bg-brand-800 px-6 text-xs font-bold text-white transition active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  {t('btnDeposit')}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
              💳 Compatible avec les cartes bancaires marocaines (CMI), virement instantané CIH Bank / Attijariwafa Bank, et versements en espèces Cash Plus / Wafacash.
            </div>
          </div>
        )}

        {/* TAB 3: WITHDRAW */}
        {activeTab === 'withdraw' && (
          <form onSubmit={handleWithdrawClick} className="mt-5 space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-xs text-slate-600">{t('withdrawAvailableLabel')}</div>
              <div className="text-2xl font-extrabold text-slate-900">{balanceDH} DH</div>
              <div className="text-[11px] text-emerald-700 font-bold">
                ✓ {t('withdrawFeeAdvantage')} {t('withdrawFeeDiscount')}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('withdrawAmountLabel')}
              </label>
              <input
                type="number"
                min={100}
                max={balanceDH}
                step={50}
                value={withdrawAmountDH}
                onChange={(e) => setWithdrawAmountDH(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-bold text-slate-900 outline-none focus:border-brand-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Relevé d'Identité Bancaire (RIB marocain 24 chiffres) ou Cash Plus :
              </label>
              <input
                type="text"
                placeholder="Ex: 230 780 0000000000000000 00 (CIH, Attijari, BP...)"
                required
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 outline-none focus:border-brand-700 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={withdrawAmountDH <= 0 || withdrawAmountDH > balanceDH}
              className="w-full rounded-xl bg-brand-700 hover:bg-brand-800 py-3 text-xs font-bold text-white shadow-md disabled:opacity-40 transition active:scale-95 cursor-pointer"
            >
              {t('btnConfirmWithdrawal')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
