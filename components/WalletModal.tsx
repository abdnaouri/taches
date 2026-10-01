'use client';

import React, { useState, useMemo } from 'react';
import { UserProfile, WalletTransaction } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getLocalizedTransaction } from '@/lib/mockData';
import {
  calculatePayoutFees,
  detectMoroccanBank,
  MIN_WITHDRAWAL_DH,
  PayoutMethod,
  PayoutSpeed,
  MAD_TO_EUR_RATE,
} from '@/lib/payoutService';
import { sounds } from '@/lib/soundEffects';
import {
  FiX,
  FiLock,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiCheckCircle,
  FiShield,
  FiCreditCard,
  FiClock,
  FiAlertTriangle,
  FiCheck,
  FiCopy,
  FiDollarSign,
  FiDownload,
  FiRefreshCw,
  FiZap,
} from 'react-icons/fi';
import { SiBinance } from 'react-icons/si';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  transactions: WalletTransaction[];
  onDeposit: (amountDH: number) => void;
  onWithdraw: (amountDH: number, details?: any) => void;
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
  const [withdrawAmountDH, setWithdrawAmountDH] = useState<number>(
    Math.max(MIN_WITHDRAWAL_DH, Math.round(user.balanceAvailable * 10))
  );
  const [withdrawMethod, setWithdrawMethod] = useState<PayoutMethod>('RIB');
  const [speedTier, setSpeedTier] = useState<PayoutSpeed>('STANDARD');
  const [ribNumber, setRibNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState(user.fullName || '');
  const [cinNumber, setCinNumber] = useState('');
  const [binancePayId, setBinancePayId] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedRib, setCopiedRib] = useState(false);
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false);

  const balanceDH = Math.round(user.balanceAvailable * 10);
  const escrowDH = Math.round(user.balanceEscrow * 10);

  const detectedBank = useMemo(() => {
    return detectMoroccanBank(ribNumber);
  }, [ribNumber]);

  const payoutCalc = useMemo(() => {
    return calculatePayoutFees(withdrawAmountDH, withdrawMethod, speedTier, balanceDH);
  }, [withdrawAmountDH, withdrawMethod, speedTier, balanceDH]);

  if (!isOpen) return null;

  const handleDepositClick = async (amtDH: number) => {
    if (amtDH <= 0) return;
    setIsProcessingDeposit(true);
    sounds.playClick();
    await new Promise((r) => setTimeout(r, 600));
    onDeposit(amtDH);
    setIsProcessingDeposit(false);
    sounds.playSuccess();
    setSuccessMsg(t('toastDepositSuccess', { amount: amtDH }));
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  const handleWithdrawClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutCalc.isValid) return;

    const details = {
      method: withdrawMethod,
      speed: speedTier,
      rib: ribNumber,
      bankName: detectedBank?.name || 'Banque Marocaine',
      accountHolder: accountHolderName,
      cin: cinNumber,
      binancePayId,
      feeDH: payoutCalc.feeDH,
      netAmountDH: payoutCalc.netAmountDH,
    };

    sounds.playSuccess();
    onWithdraw(withdrawAmountDH, details);
    setSuccessMsg(
      `Demande de retrait de ${withdrawAmountDH} DH initiée avec succès (Net viré: ${payoutCalc.netAmountDH} DH)`
    );
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  const copyOfficialRib = () => {
    navigator.clipboard.writeText('230780123456789012345678');
    setCopiedRib(true);
    sounds.playSuccess();
    setTimeout(() => setCopiedRib(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute ${
            isRTL ? 'left-5' : 'right-5'
          } top-5 rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer`}
          title="Fermer"
        >
          <FiX className="text-lg" />
        </button>

        {/* Header Badges */}
        <div className="flex items-center gap-2 mb-2">
          <span className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-2.5 py-1 flex items-center gap-1">
            <FiShield className="text-emerald-700" />
            {t('walletSecurityBadge')}
          </span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t('walletModalSubtitle')}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {t('walletModalTitle')}
        </h2>

        {/* Success toast */}
        {successMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 p-3.5 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in">
            <FiCheckCircle className="text-emerald-600 text-base shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Balance Cards Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="rounded-2xl bg-brand-900 text-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-brand-200 font-bold uppercase tracking-wider">
              <span>{t('walletAvailableBalance')}</span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-brand-100 font-semibold">
                ~{(balanceDH * MAD_TO_EUR_RATE).toFixed(2)} €
              </span>
            </div>
            <div className="text-3xl font-black mt-1.5 text-white tracking-tight">
              {balanceDH} DH
            </div>
            <p className="mt-2 text-[11px] text-brand-200/80 leading-relaxed">
              {t('walletAvailableDesc')}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
              <span>{t('walletEscrowFunds')}</span>
              <FiLock className="text-amber-600 text-base" />
            </div>
            <div className="text-3xl font-black mt-1.5 text-slate-900 tracking-tight">
              {escrowDH} DH
            </div>
            <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
              {t('walletEscrowDesc')}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 flex border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('balance')}
            className={`pb-3 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
              isRTL ? 'ml-6' : 'mr-6'
            } ${
              activeTab === 'balance'
                ? 'border-brand-700 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('tabOperationsHistory')}
          </button>
          <button
            onClick={() => setActiveTab('deposit')}
            className={`pb-3 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
              isRTL ? 'ml-6' : 'mr-6'
            } ${
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
              <div className="py-8 text-center text-slate-400 text-xs">
                Aucune transaction enregistrée pour le moment.
              </div>
            ) : (
              transactions.map((tx) => {
                const localizedTx = getLocalizedTransaction(tx, locale);
                const isPositive = tx.type === 'DEPOSIT' || tx.type === 'ESCROW_RELEASE';
                const txAmountDH = Math.round(Math.abs(tx.amount) * 10);
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 border border-slate-200 text-xs hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-xl ${
                          isPositive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {isPositive ? <FiArrowDownLeft /> : <FiArrowUpRight />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{localizedTx.description}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{tx.createdAt}</div>
                      </div>
                    </div>
                    <div
                      className={`font-black text-sm ${
                        isPositive ? 'text-emerald-700' : 'text-slate-800'
                      }`}
                    >
                      {isPositive ? '+' : '-'}
                      {txAmountDH} DH
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
            <p className="text-xs text-slate-600 leading-relaxed">{t('depositDesc')}</p>

            {/* Fast Quick Buttons */}
            <div className="grid grid-cols-3 gap-2.5">
              {[200, 500, 1000].map((amtDH) => (
                <button
                  key={amtDH}
                  type="button"
                  onClick={() => handleDepositClick(amtDH)}
                  disabled={isProcessingDeposit}
                  className="rounded-2xl border border-slate-300 bg-white p-3.5 text-center text-xs font-bold text-slate-900 hover:border-brand-700 hover:bg-brand-50 transition active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  <div className="text-base font-black text-brand-700">{amtDH} DH</div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    ~{(amtDH * MAD_TO_EUR_RATE).toFixed(0)} €
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Amount */}
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
                  className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-sm font-bold text-slate-900 outline-none focus:border-brand-700"
                />
                <button
                  type="button"
                  onClick={() => handleDepositClick(customDepositDH)}
                  disabled={isProcessingDeposit || customDepositDH <= 0}
                  className="rounded-2xl bg-brand-700 hover:bg-brand-800 px-6 text-xs font-bold text-white transition active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  {isProcessingDeposit ? 'Traitement...' : t('btnDeposit')}
                </button>
              </div>
            </div>

            {/* Official Moroccan RIB for Direct Bank Wire */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <FiCreditCard className="text-brand-700" />
                  Virement Bancaire Direct (CIH / Attijariwafa / BMCE)
                </span>
                <button
                  type="button"
                  onClick={copyOfficialRib}
                  className="text-[11px] font-bold text-brand-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedRib ? (
                    <span className="text-emerald-700 flex items-center gap-0.5">
                      <FiCheck className="text-xs" /> Copié
                    </span>
                  ) : (
                    <>
                      <FiCopy className="text-xs" /> Copier le RIB
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                RIB Tâches.ma : <span className="font-mono font-bold text-slate-800">230 780 1234567890123456 78</span> (CIH Bank). Vos fonds sont crédités instantanément dès réception.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: WITHDRAW */}
        {activeTab === 'withdraw' && (
          <form onSubmit={handleWithdrawClick} className="mt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-xs text-slate-600">{t('withdrawAvailableLabel')}</div>
              <div className="text-2xl font-black text-slate-900">{balanceDH} DH</div>
              <div className="text-[11px] text-slate-500 font-semibold">
                Min. de retrait : {MIN_WITHDRAWAL_DH} DH • Zéro frais cachés
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('withdrawAmountLabel')}
              </label>
              <input
                type="number"
                min={MIN_WITHDRAWAL_DH}
                max={balanceDH}
                step={50}
                value={withdrawAmountDH}
                onChange={(e) => setWithdrawAmountDH(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-sm font-bold text-slate-900 outline-none focus:border-brand-700"
              />
            </div>

            {/* Method selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Méthode de retrait
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setWithdrawMethod('RIB')}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                    withdrawMethod === 'RIB'
                      ? 'border-brand-700 bg-brand-50 text-brand-900 ring-2 ring-brand-700/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FiCreditCard className="mx-auto text-lg mb-1 text-brand-700" />
                  <span className="text-xs font-bold block">RIB Bancaire</span>
                  <span className="text-[10px] text-slate-500">Toutes banques</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWithdrawMethod('CASHPLUS')}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                    withdrawMethod === 'CASHPLUS'
                      ? 'border-brand-700 bg-brand-50 text-brand-900 ring-2 ring-brand-700/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FiZap className="mx-auto text-lg mb-1 text-amber-600" />
                  <span className="text-xs font-bold block">Cash Plus</span>
                  <span className="text-[10px] text-slate-500">Agence Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWithdrawMethod('BINANCE_PAY')}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                    withdrawMethod === 'BINANCE_PAY'
                      ? 'border-brand-700 bg-brand-50 text-brand-900 ring-2 ring-brand-700/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <SiBinance className="mx-auto text-lg mb-1 text-amber-500" />
                  <span className="text-xs font-bold block">Binance Pay</span>
                  <span className="text-[10px] text-slate-500">Crypto USDT</span>
                </button>
              </div>
            </div>

            {/* RIB Specific Fields */}
            {withdrawMethod === 'RIB' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    RIB marocain (24 chiffres)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={24}
                    value={ribNumber}
                    onChange={(e) => setRibNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Ex: 230780123456789012345678"
                    className="w-full rounded-2xl border border-slate-300 bg-white p-3 font-mono text-xs text-slate-900 outline-none focus:border-brand-700"
                  />
                  {detectedBank && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <FiCheck className="text-xs" /> Banque détectée : {detectedBank.name}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom du titulaire du compte
                  </label>
                  <input
                    type="text"
                    required
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="Nom et prénom"
                    className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-xs text-slate-900 outline-none focus:border-brand-700"
                  />
                </div>
              </div>
            )}

            {/* Cash Plus Specific Fields */}
            {withdrawMethod === 'CASHPLUS' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Numéro CIN (Carte d’Identité Nationale)
                  </label>
                  <input
                    type="text"
                    required
                    value={cinNumber}
                    onChange={(e) => setCinNumber(e.target.value.toUpperCase())}
                    placeholder="Ex: BE123456"
                    className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-xs text-slate-900 uppercase font-bold outline-none focus:border-brand-700"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Présentez votre CIN originale dans n’importe quelle agence Cash Plus ou Wafacash au Maroc pour récupérer votre argent liquide.
                </p>
              </div>
            )}

            {/* Binance Pay Specific Fields */}
            {withdrawMethod === 'BINANCE_PAY' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Binance Pay ID / Email Binance
                </label>
                <input
                  type="text"
                  required
                  value={binancePayId}
                  onChange={(e) => setBinancePayId(e.target.value)}
                  placeholder="Ex: 123456789 ou email@binance.com"
                  className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-xs text-slate-900 outline-none focus:border-brand-700"
                />
              </div>
            )}

            {/* Payout Summary Box */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Montant brut demandé</span>
                <span className="font-bold text-slate-900">{withdrawAmountDH} DH</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Frais de transfert</span>
                <span className="font-semibold text-slate-700">{payoutCalc.feeDH} DH</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900 text-sm">
                <span>Net à recevoir</span>
                <span className="text-emerald-700">{payoutCalc.netAmountDH} DH</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!payoutCalc.isValid}
              className="w-full rounded-2xl bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-bold py-3.5 text-xs sm:text-sm shadow-md transition active:scale-98 cursor-pointer"
            >
              Confirmer la demande de retrait
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
