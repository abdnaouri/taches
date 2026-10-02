'use client';

export const runtime = 'edge';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { Header } from '@/components/Header';
import { WorkzillaFooter } from '@/components/WorkzillaLandingSections';
import { getAuthHeaders } from '@/lib/supabase';
import {
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiRefreshCw,
  FiUser,
  FiMessageSquare,
  FiDollarSign,
  FiArrowRight,
  FiX
} from 'react-icons/fi';

interface DisputeItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  totalBudgetDH: number;
  totalBudgetEur: number;
  rewardDH: number;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  assignedToId?: string;
  assignedToName?: string;
  createdAt: string;
}

export default function AdminDisputesPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const { isAuthenticated, profile, openAuthModal } = useAuth();

  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchDisputes = async () => {
    setIsLoading(true);
    try {
      const authHeaders = await getAuthHeaders(false);
      const res = await fetch('/api/admin/disputes', {
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success && data.disputes) {
        setDisputes(data.disputes);
      }
    } catch (err) {
      console.error('Failed to load disputes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && profile?.isAdmin) {
      fetchDisputes();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, profile?.isAdmin]);

  const handleExecuteRuling = async (ruling: 'REFUND_CLIENT' | 'RELEASE_PERFORMER' | 'SPLIT_50_50') => {
    if (!selectedDispute) return;
    setIsSubmitting(true);

    try {
      const authHeaders = await getAuthHeaders(true);
      const res = await fetch('/api/admin/disputes', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          taskId: selectedDispute.id,
          ruling,
          arbitrationNotes: notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        let msg = `Litige clos : ${selectedDispute.totalBudgetDH} DH remboursés au client.`;
        if (ruling === 'RELEASE_PERFORMER') {
          msg = `Litige clos : ${selectedDispute.rewardDH} DH libérés au freelance.`;
        } else if (ruling === 'SPLIT_50_50') {
          msg = `Litige clos : Partage 50/50 (${Math.round(selectedDispute.totalBudgetDH / 2)} DH chacun).`;
        }
        setToastMsg(msg);
        setSelectedDispute(null);
        setNotes('');
        fetchDisputes();
        setTimeout(() => setToastMsg(null), 5000);
      }
    } catch (err) {
      console.error('Ruling execution failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || !profile?.isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Header />
        <main className="max-w-md mx-auto py-16 px-4 text-center">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4">
            <FiShield className="text-4xl text-amber-600 mx-auto" />
            <h1 className="text-xl font-bold text-slate-900">Console d'Arbitrage Protégée</h1>
            <p className="text-xs text-slate-600">
              {isAuthenticated
                ? 'Votre compte n\'a pas les privilèges administrateur requis.'
                : 'Veuillez vous connecter avec un compte administrateur autorisé.'}
            </p>
            <button
              onClick={() => openAuthModal('login', 'Connexion requise')}
              className="w-full bg-brand-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs"
            >
              {isAuthenticated ? 'Changer de compte' : 'Se connecter'}
            </button>
          </div>
        </main>
        <WorkzillaFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <Header />

      {/* Admin Subheader Navigation Bar */}
      <div className="bg-slate-900 border-b border-slate-800 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <FiShield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Console d&apos;Administration</span>
              <h1 className="text-lg font-black text-white">Médiation & Litiges Séquestre</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
            <button
              onClick={() => router.push(`/${locale}/admin/payouts`)}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FiDollarSign className="w-4 h-4 text-emerald-400" />
              <span>Virements Payouts</span>
            </button>
            <button
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <FiAlertTriangle className="w-4 h-4 text-white" />
              <span>Litiges & Arbitrage</span>
            </button>
            <button
              onClick={() => router.push(`/${locale}/admin/kyc`)}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FiShield className="w-4 h-4 text-emerald-400" />
              <span>Vérifications KYC</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {toastMsg && (
          <div className="mb-6 bg-slate-900 text-white p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
            <FiCheckCircle className="text-emerald-400 text-base" />
            <span>{toastMsg}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1 text-xs font-bold mb-2">
              <FiAlertTriangle className="text-amber-600" />
              <span>Commission de Médiation & Arbitrage</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Gestion des Litiges & Arbitrage Séquestre
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Analysez les missions en arbitrage et tranchez de manière équitable selon les preuves remises.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/${locale}/admin/payouts`)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Virements & Payouts →
            </button>
            <button
              onClick={fetchDisputes}
              className="p-2 rounded-xl bg-brand-700 text-white hover:bg-brand-800"
              title="Actualiser"
            >
              <FiRefreshCw className={`text-xs ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Dispute List */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          {disputes.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <FiCheckCircle className="text-3xl text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-700">Aucun litige en cours</p>
              <p className="mt-1 text-slate-400">Toutes les missions se déroulent normalement.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {disputes.map((d) => (
                <div key={d.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">{d.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        {d.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{d.description}</p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-3">
                      <span>Donneur d'ordre : <strong>{d.clientName}</strong></span>
                      <span>•</span>
                      <span>Freelance : <strong>{d.assignedToName || 'Non assigné'}</strong></span>
                      <span>•</span>
                      <span className="text-brand-700 font-bold">{d.totalBudgetDH} DH</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedDispute(d)}
                    className="rounded-xl bg-slate-900 hover:bg-brand-700 text-white px-4 py-2 text-xs font-bold shrink-0 transition"
                  >
                    Examiner & Arbitrer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ruling Modal */}
        {selectedDispute && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900">Arbitrage de la Mission</h3>
                <button onClick={() => setSelectedDispute(null)} className="p-1 rounded-full bg-slate-100 text-slate-500">
                  <FiX />
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-1.5 border border-slate-200">
                <div className="font-bold text-slate-900">{selectedDispute.title}</div>
                <div className="text-slate-600 leading-relaxed">{selectedDispute.description}</div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold">
                  <span>Montant sous séquestre :</span>
                  <span className="text-brand-700">{selectedDispute.totalBudgetDH} DH</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motif de la décision d'arbitrage :
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Justification de la décision prise..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs outline-none focus:border-brand-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleExecuteRuling('REFUND_CLIENT')}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 transition shadow-xs"
                >
                  Client (100%)
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleExecuteRuling('SPLIT_50_50')}
                  className="rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 transition shadow-xs"
                >
                  Compromis (50/50)
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleExecuteRuling('RELEASE_PERFORMER')}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 transition shadow-xs"
                >
                  Freelance (100%)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <WorkzillaFooter />
    </div>
  );
}
