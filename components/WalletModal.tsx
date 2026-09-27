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
  FiCheckCircle
} from 'react-icons/fi';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  transactions: WalletTransaction[];
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
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
  const [customDeposit, setCustomDeposit] = useState<number>(50);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleDepositClick = (amt: number) => {
    onDeposit(amt);
    setSuccessMsg(t('toastDepositSuccess', { amount: amt.toFixed(2) }));
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleWithdrawClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0 || withdrawAmount > user.balanceAvailable) return;
    onWithdraw(withdrawAmount);
    setSuccessMsg(t('toastWithdrawalInitiated', { amount: withdrawAmount.toFixed(2) }));
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-cream p-6 sm:p-8 shadow-2xl border border-ink/15 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute ${isRTL ? 'left-5' : 'right-5'} top-5 rounded-full bg-ink/5 p-2 text-ink/70 hover:bg-ink hover:text-white transition-all`}
        >
          <FiX className="text-lg" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="rounded-full bg-lime text-ink text-xs font-bold px-2.5 py-1">
            {t('walletSecurityBadge')}
          </span>
          <span className="text-xs font-bold text-ink/50 uppercase tracking-wider">
            {t('walletModalSubtitle')}
          </span>
        </div>

        <h2 className="font-display text-2xl font-bold text-ink">
          {t('walletModalTitle')}
        </h2>

        {/* Success toast */}
        {successMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 p-3.5 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <FiCheckCircle className="text-emerald-600 text-base shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Balance Cards Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="rounded-2xl bg-ink text-white p-5 shadow-sm">
            <div className="text-xs text-lime font-medium uppercase tracking-wider">
              {t('walletAvailableBalance')}
            </div>
            <div className="font-display text-3xl font-extrabold mt-1 text-white">
              €{user.balanceAvailable.toFixed(2)}
            </div>
            <p className="mt-2 text-[11px] text-white/60">
              {t('walletAvailableDesc')}
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-ink/10 p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-ink/50 font-semibold uppercase tracking-wider">
              <span>{t('walletEscrowFunds')}</span>
              <FiLock className="text-amber-500 text-sm" />
            </div>
            <div className="font-display text-3xl font-extrabold mt-1 text-ink">
              €{user.balanceEscrow.toFixed(2)}
            </div>
            <p className="mt-2 text-[11px] text-ink/60">
              {t('walletEscrowDesc')}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 flex border-b border-ink/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('balance')}
            className={`pb-3 text-xs font-bold transition border-b-2 whitespace-nowrap ${isRTL ? 'ml-6' : 'mr-6'} ${
              activeTab === 'balance'
                ? 'border-ink text-ink'
                : 'border-transparent text-ink/40 hover:text-ink'
            }`}
          >
            {t('tabOperationsHistory')}
          </button>
          <button
            onClick={() => setActiveTab('deposit')}
            className={`pb-3 text-xs font-bold transition border-b-2 whitespace-nowrap ${isRTL ? 'ml-6' : 'mr-6'} ${
              activeTab === 'deposit'
                ? 'border-ink text-ink'
                : 'border-transparent text-ink/40 hover:text-ink'
            }`}
          >
            {t('tabDeposit')}
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`pb-3 text-xs font-bold transition border-b-2 whitespace-nowrap ${
              activeTab === 'withdraw'
                ? 'border-ink text-ink'
                : 'border-transparent text-ink/40 hover:text-ink'
            }`}
          >
            {t('tabWithdraw')}
          </button>
        </div>

        {/* Tab 1: Transaction History */}
        {activeTab === 'balance' && (
          <div className="mt-4 space-y-2.5">
            {transactions.map((rawTx) => {
              const tx = getLocalizedTransaction(rawTx, locale);
              return (
                <div key={tx.id} className="flex items-center justify-between rounded-xl bg-white p-3.5 border border-ink/5 text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      tx.amount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-ink/5 text-ink'
                    }`}>
                      {tx.amount > 0 ? <FiArrowDownLeft /> : <FiArrowUpRight />}
                    </div>
                    <div>
                      <div className="font-semibold text-ink">{tx.description}</div>
                      <div className="text-[10px] text-ink/40">{tx.createdAt}</div>
                    </div>
                  </div>
                  <div className={`font-mono font-bold ${tx.amount > 0 ? 'text-emerald-700' : 'text-ink'}`}>
                    {tx.amount > 0 ? `+€${tx.amount.toFixed(2)}` : `€${tx.amount.toFixed(2)}`}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Deposit Simulator */}
        {activeTab === 'deposit' && (
          <div className="mt-5 space-y-4">
            <p className="text-xs text-ink/70">
              {t('depositDesc')}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[25, 50, 100].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleDepositClick(amt)}
                  className="rounded-2xl border border-ink/15 bg-white p-3 text-center hover:border-ink hover:bg-lime/20 transition group"
                >
                  <div className="font-bold text-ink text-sm">€{amt}</div>
                  <div className="text-[10px] text-ink/50 group-hover:text-ink">{t('depositInstant')}</div>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-ink mb-1">
                {t('depositCustomLabel')}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={10}
                  value={customDeposit}
                  onChange={(e) => setCustomDeposit(Number(e.target.value))}
                  className="w-full rounded-2xl border border-ink/15 bg-white p-3 text-xs text-ink outline-none focus:border-ink"
                />
                <button
                  type="button"
                  onClick={() => handleDepositClick(customDeposit)}
                  className="rounded-full bg-ink px-5 py-2.5 text-xs font-bold text-lime hover:bg-ink/90 whitespace-nowrap"
                >
                  {t('btnDeposit')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Withdrawal Simulator */}
        {activeTab === 'withdraw' && (
          <form onSubmit={handleWithdrawClick} className="mt-5 space-y-4">
            <div className="rounded-2xl bg-white p-4 border border-ink/10 text-xs">
              <div className="flex items-center justify-between text-ink/70 mb-1">
                <span>{t('withdrawAvailableLabel')}</span>
                <span className="font-bold text-ink">€{user.balanceAvailable.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-ink/70">
                <span>{t('withdrawFeeAdvantage')}</span>
                <span className="font-bold text-lime-700 bg-lime/20 px-2 py-0.5 rounded-full">
                  {t('withdrawFeeDiscount')}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('withdrawAmountLabel')}
              </label>
              <input
                type="number"
                min={10}
                max={user.balanceAvailable}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                className="w-full rounded-2xl border border-ink/15 bg-white p-3 text-xs text-ink outline-none focus:border-ink"
              />
            </div>

            <button
              type="submit"
              disabled={withdrawAmount <= 0 || withdrawAmount > user.balanceAvailable}
              className="w-full rounded-full bg-lime py-3 text-xs font-bold text-ink shadow-sm hover:bg-lime/90 disabled:opacity-50 transition"
            >
              {t('btnConfirmWithdrawal')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
