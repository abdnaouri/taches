'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { fetchPerformerSubscriptions, purchasePerformerSubscription } from '@/lib/supabaseService';
import { sounds } from '@/lib/soundEffects';
import {
  FiAward,
  FiCheckCircle,
  FiShield,
  FiZap,
  FiClock,
  FiDollarSign,
  FiX,
  FiAlertCircle,
  FiArrowRight,
  FiCheck
} from 'react-icons/fi';

interface PerformerSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onOpenDeposit?: () => void;
}

export const PerformerSubscriptionModal: React.FC<PerformerSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenDeposit,
}) => {
  const { t, locale, isRTL } = useLanguage();
  const { profile, refreshProfile } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState<'1_MONTH' | '3_MONTHS' | '1_YEAR'>('3_MONTHS');
  const [plans, setPlans] = useState<any[]>([]);
  const [hasActiveSub, setHasActiveSub] = useState<boolean>(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [freeRemaining, setFreeRemaining] = useState<number>(3);
  const [loading, setLoading] = useState<boolean>(true);
  const [purchasing, setPurchasing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchPerformerSubscriptions()
      .then((data) => {
        if (data) {
          setPlans(data.plans || []);
          setHasActiveSub(data.hasActiveSubscription || false);
          setExpiresAt(data.subscriptionExpiresAt || null);
          setFreeRemaining(data.freeTasksRemaining ?? 3);
        }
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const currentAvailableDH = Math.round(Number(profile?.balanceAvailable || 0) * 10);
  const chosenPlanObj = plans.find((p) => p.planType === selectedPlan) || {
    planType: '3_MONTHS',
    name: 'Pass Trimestriel (90 jours)',
    priceDH: 75,
  };

  const handlePurchase = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (currentAvailableDH < chosenPlanObj.priceDH) {
      setErrorMsg(
        `Votre solde disponible (${currentAvailableDH} DH) est insuffisant pour ce pass (${chosenPlanObj.priceDH} DH). Veuillez recharger votre portefeuille.`
      );
      return;
    }

    setPurchasing(true);
    const res = await purchasePerformerSubscription(selectedPlan);
    setPurchasing(false);

    if (res.success) {
      sounds.playSuccess();
      setSuccessMsg(res.message || 'Pass activé avec succès !');
      setHasActiveSub(true);
      await refreshProfile();
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1800);
    } else {
      setErrorMsg(res.error || 'Erreur lors de l’activation du pass.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-950 p-6 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <FiX className="text-xl" />
          </button>
          
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/30 border border-brand-400/40 px-3 py-1 text-xs font-bold text-brand-200 mb-2">
            <FiAward className="text-amber-400" />
            <span>Accès Prestataire Vérifié (Modèle Workzilla)</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Pass Bourse de Missions
          </h2>
          <p className="text-xs sm:text-sm text-brand-100 mt-1 leading-relaxed">
            Rejoignez l’élite des freelances au Maroc. Candidatures illimitées, alertes prioritaires et badge de confiance vérifié.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* Active Pass Alert */}
          {hasActiveSub && expiresAt && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <FiCheckCircle className="text-emerald-600 text-xl shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-emerald-900">Votre Pass Prestataire est Actif !</h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Valide jusqu’au {new Date(expiresAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}. Vous pouvez postuler à toutes les missions en illimité.
                </p>
              </div>
            </div>
          )}

          {/* Free Trial Status */}
          {!hasActiveSub && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs font-semibold text-amber-900">
              <span className="flex items-center gap-2">
                <FiZap className="text-amber-600" />
                <span>Candidatures d’essai gratuites restantes :</span>
              </span>
              <span className="font-extrabold px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900">
                {freeRemaining} / 3
              </span>
            </div>
          )}

          {/* Plans Selection Cards */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">
              Choisissez votre formule d’accès
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {plans.map((p) => {
                const isSelected = selectedPlan === p.planType;
                return (
                  <div
                    key={p.planType}
                    onClick={() => setSelectedPlan(p.planType)}
                    className={`relative rounded-2xl p-4 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {p.popular && (
                      <span className="absolute -top-2.5 right-3 bg-amber-500 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs uppercase">
                        Plus Populaire
                      </span>
                    )}

                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block mb-1">
                        {p.name.split('(')[0]}
                      </span>
                      <div className="text-2xl font-black text-slate-900">
                        {p.priceDH} <span className="text-xs font-bold text-slate-500">DH</span>
                      </div>
                      <span className="text-[10px] font-semibold text-brand-700 bg-brand-100/70 px-1.5 py-0.5 rounded mt-1 inline-block">
                        {p.badge}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">Durée</span>
                      <span className="font-bold text-slate-800">
                        {p.planType === '1_YEAR' ? '12 mois' : p.planType === '3_MONTHS' ? '3 mois' : '1 mois'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Value Props */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 mb-2">Avantages inclus avec chaque Pass :</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <FiCheck className="text-emerald-600 font-bold shrink-0" />
                <span>Zéro limite de candidatures</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FiCheck className="text-emerald-600 font-bold shrink-0" />
                <span>Paiement garanti sous séquestre Daman</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FiCheck className="text-emerald-600 font-bold shrink-0" />
                <span>Alertes directes Telegram & WhatsApp</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FiCheck className="text-emerald-600 font-bold shrink-0" />
                <span>Virements CIH / Attijari / Binance</span>
              </div>
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <FiAlertCircle className="text-rose-600 text-base shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMsg}</span>
                {onOpenDeposit && errorMsg.includes('recharger') && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenDeposit();
                    }}
                    className="block mt-2 font-bold text-brand-700 underline hover:text-brand-900 cursor-pointer"
                  >
                    Recharger mon portefeuille maintenant →
                  </button>
                )}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <FiCheckCircle className="text-emerald-600 text-base shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            <span>Solde disponible : </span>
            <strong className="text-slate-900">{currentAvailableDH} DH</strong>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
            >
              Fermer
            </button>
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="w-1/2 sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              {purchasing ? (
                <span>Activation en cours...</span>
              ) : (
                <>
                  <span>Activer le Pass ({chosenPlanObj.priceDH} DH)</span>
                  <FiArrowRight />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
