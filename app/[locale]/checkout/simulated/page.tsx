'use client';

export const runtime = 'edge';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { Header } from '@/components/Header';
import { WorkzillaFooter } from '@/components/WorkzillaLandingSections';
import {
  FiShield,
  FiCheckCircle,
  FiCreditCard,
  FiLock,
  FiArrowRight,
  FiRefreshCw
} from 'react-icons/fi';

export default function SimulatedCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLanguage();
  const { profile, updateProfile } = useAuth();

  const orderCode = searchParams.get('orderCode') || `ORD-${Date.now()}`;
  const amountEur = parseFloat(searchParams.get('amount') || '50');
  const amountDH = Math.round(amountEur * 10);
  const ref = searchParams.get('ref') || `DEP-${profile?.id || 'usr'}-${Date.now()}`;

  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSimulateSuccess = async () => {
    setIsProcessing(true);
    try {
      if (profile) {
        await updateProfile({
          balanceAvailable: (profile.balanceAvailable || 0) + amountEur,
        });

        await fetch('/api/wallet/deposit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: profile.id,
            amountDH,
            depositMethod: 'CARD',
          }),
        });
      }

      setIsCompleted(true);
      setTimeout(() => {
        router.push(`/${locale}/wallet?success=true`);
      }, 2000);
    } catch (err) {
      console.error('Simulated deposit failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Header />

      <main className="max-w-xl mx-auto px-4 py-12 w-full">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl text-center space-y-6">
          <div className="h-16 w-16 bg-brand-50 text-brand-700 rounded-3xl flex items-center justify-center mx-auto text-2xl border border-brand-200">
            {isCompleted ? <FiCheckCircle className="text-emerald-600 text-3xl" /> : <FiCreditCard />}
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 text-xs font-extrabold mb-2">
              <FiShield className="text-emerald-600" />
              <span>Portail de Paiement Sécurisé Viva Smart Checkout</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              {isCompleted ? 'Paiement Validé avec Succès !' : 'Confirmation de Recharge de Compte'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Réf de commande : <span className="font-mono font-bold text-slate-700">{orderCode}</span>
            </p>
          </div>

          {/* Amount Breakdown Box */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-left text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Montant en Dirhams :</span>
              <span className="font-extrabold text-slate-900 text-base">{amountDH} DH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Équivalent comptable (€) :</span>
              <span className="font-bold text-slate-700">{amountEur.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Protection sous séquestre :</span>
              <span className="font-bold text-emerald-700">100% Garanti Daman</span>
            </div>
          </div>

          {!isCompleted ? (
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleSimulateSuccess}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-extrabold py-3.5 px-6 text-sm shadow-md transition cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <FiRefreshCw className="animate-spin text-base" />
                    <span>Validation bancaire en cours...</span>
                  </>
                ) : (
                  <>
                    <FiLock />
                    <span>Confirmer le paiement ({amountDH} DH)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push(`/${locale}/wallet`)}
                className="w-full text-xs text-slate-500 hover:text-slate-800 font-bold transition py-2"
              >
                Annuler et revenir au portefeuille
              </button>
            </div>
          ) : (
            <div className="text-xs text-emerald-700 font-bold bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              ✓ Solde crédité. Redirection automatique vers votre portefeuille...
            </div>
          )}
        </div>
      </main>

      <WorkzillaFooter />
    </div>
  );
}
