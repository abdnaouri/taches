'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { getAuthHeaders } from '@/lib/supabase';
import {
  FiShield,
  FiArrowUpRight,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiSearch,
  FiDownload,
  FiCopy,
  FiCheck,
  FiRefreshCw,
  FiDollarSign,
  FiLayers,
  FiX,
  FiTrendingUp,
  FiExternalLink,
  FiLock,
  FiUser,
  FiSend
} from 'react-icons/fi';
import { SiBinance } from 'react-icons/si';

interface PayoutItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  grossAmountDH: number;
  grossAmountEur: number;
  feeDH: number;
  netAmountDH: number;
  method: 'REMITLY' | 'BINANCE_PAY' | string;
  description: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export const AdminPayoutsDashboard: React.FC = () => {
  const router = useRouter();
  const { locale } = useLanguage();
  const { isAuthenticated, profile, openAuthModal } = useAuth();

  const [items, setItems] = useState<PayoutItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterMethod, setFilterMethod] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Settlement Action Modal State
  const [selectedItem, setSelectedItem] = useState<PayoutItem | null>(null);
  const [actionType, setActionType] = useState<'COMPLETE' | 'PROCESS' | 'CANCEL' | null>(null);
  const [trackingReference, setTrackingReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchPayouts = async () => {
    setIsLoading(true);
    try {
      const authHeaders = await getAuthHeaders(false);
      const res = await fetch('/api/admin/payouts', {
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success && data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('Failed to fetch admin payouts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && profile?.isAdmin) {
      fetchPayouts();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, profile?.isAdmin]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export CSV for Remitly / Binance batch processing
  const exportToCSV = () => {
    const pendingOnly = items.filter((i) => i.status === 'PENDING' || i.status === 'PROCESSING');
    if (pendingOnly.length === 0) {
      showToast('Aucun virement en attente à exporter.');
      return;
    }

    const headers = ['ID Transaction', 'Bénéficiaire', 'Email', 'Méthode', 'Montant Brut DH', 'Frais DH', 'Net à Virer DH', 'Description / Destination', 'Statut', 'Date'];
    const rows = pendingOnly.map((i) => [
      i.id,
      `"${i.userName}"`,
      i.userEmail,
      i.method,
      i.grossAmountDH,
      i.feeDH,
      i.netAmountDH,
      `"${i.description.replace(/"/g, '""')}"`,
      i.status,
      i.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `taches_payouts_batch_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`${pendingOnly.length} virements exportés en format CSV.`);
  };

  const handleStatusUpdate = async () => {
    if (!selectedItem || !actionType) return;
    setIsSubmitting(true);

    const targetStatus = actionType === 'COMPLETE' ? 'COMPLETED' : actionType === 'PROCESS' ? 'PROCESSING' : 'CANCELLED';

    try {
      const authHeaders = await getAuthHeaders(false);
      const res = await fetch('/api/admin/payouts', {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: selectedItem.id,
          status: targetStatus,
          trackingReference: trackingReference.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          targetStatus === 'COMPLETED'
            ? 'Virement validé et marqué comme viré.'
            : targetStatus === 'PROCESSING'
            ? 'Demande passée en cours de traitement.'
            : 'Demande de retrait annulée avec succès.'
        );
        setSelectedItem(null);
        setActionType(null);
        setTrackingReference('');
        fetchPayouts();
      } else {
        alert(data.error || 'Erreur lors de la mise à jour.');
      }
    } catch (err: any) {
      alert(err.message || 'Erreur réseau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingItems = useMemo(() => items.filter((i) => i.status === 'PENDING' || i.status === 'PROCESSING'), [items]);
  const completedItems = useMemo(() => items.filter((i) => i.status === 'COMPLETED'), [items]);

  const totalPendingVolumeDH = useMemo(() => {
    return pendingItems.reduce((acc, cur) => acc + cur.netAmountDH, 0);
  }, [pendingItems]);

  const totalCompletedVolumeDH = useMemo(() => {
    return completedItems.reduce((acc, cur) => acc + cur.netAmountDH, 0);
  }, [completedItems]);

  const totalFeesEarnedDH = useMemo(() => {
    return items.reduce((acc, cur) => acc + cur.feeDH, 0);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Filter by status
      if (filterStatus !== 'ALL') {
        if (filterStatus === 'PENDING' && (item.status !== 'PENDING' && item.status !== 'PROCESSING')) return false;
        if (filterStatus === 'COMPLETED' && item.status !== 'COMPLETED') return false;
        if (filterStatus === 'CANCELLED' && item.status !== 'CANCELLED') return false;
      }

      // Filter by method
      if (filterMethod !== 'ALL' && item.method !== filterMethod) {
        return false;
      }

      // Filter by search query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = item.userName.toLowerCase().includes(q);
        const matchesEmail = item.userEmail.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesId = item.id.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesDesc && !matchesId) {
          return false;
        }
      }

      return true;
    });
  }, [items, filterStatus, filterMethod, searchTerm]);

  if (!isAuthenticated || !profile?.isAdmin) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl bg-white p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-2xl font-bold">
            <FiShield />
          </div>
          <h2 className="text-xl font-black text-slate-900">Accès Administrateur Restreint</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Cette interface de règlement des virements est réservée exclusivement aux administrateurs certifiés de Tâches.ma.
          </p>
          <div className="pt-2">
            <button
              onClick={() => openAuthModal('login')}
              className="w-full rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold py-3 text-xs shadow-md transition cursor-pointer"
            >
              Se connecter avec un compte Admin
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 rounded-2xl bg-slate-900 text-white px-5 py-3.5 shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-top-4">
          <FiCheckCircle className="text-emerald-400 text-base shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <button
              onClick={() => router.push(`/${locale}/tasks`)}
              className="hover:text-brand-700 transition cursor-pointer"
            >
              Tâches.ma
            </button>
            <span>/</span>
            <span className="text-slate-900 font-extrabold">Console Admin Payouts</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
            <button
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <FiDollarSign className="w-4 h-4 text-white" />
              <span>Virements Payouts</span>
            </button>
            <button
              onClick={() => router.push(`/${locale}/admin/disputes`)}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FiAlertTriangle className="w-4 h-4 text-amber-400" />
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

        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-bold text-brand-800 mb-2">
              <FiShield className="text-brand-700" />
              <span>Console d'Administration & Règlement des Gains</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Gestion des Virements (Remitly & Binance Pay)
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Traitez les demandes de retraits des prestataires via Remitly ou instantanément en USDT via Binance Pay.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-800 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <FiDownload className="text-sm text-slate-500" />
              <span>Exporter CSV (Batch)</span>
            </button>
            <button
              onClick={fetchPayouts}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition active:scale-95 cursor-pointer"
            >
              <FiRefreshCw className={`text-sm ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* 4 Financial Stat Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-amber-800 font-bold uppercase tracking-wider mb-1">
              <span>Virements en attente</span>
              <FiClock className="text-amber-600" />
            </div>
            <div className="text-3xl font-black text-amber-950 mt-1">
              {pendingItems.length} <span className="text-sm font-semibold text-amber-700">demande(s)</span>
            </div>
            <div className="mt-2 text-xs font-bold text-amber-800">
              Volume net : {totalPendingVolumeDH} DH
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-emerald-800 font-bold uppercase tracking-wider mb-1">
              <span>Virements Réglés</span>
              <FiCheckCircle className="text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-950 mt-1">
              {completedItems.length} <span className="text-sm font-semibold text-emerald-700">effectué(s)</span>
            </div>
            <div className="mt-2 text-xs font-bold text-emerald-800">
              100% exécutés
            </div>
          </div>

          <div className="rounded-2xl bg-brand-900 text-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-brand-200 font-bold uppercase tracking-wider mb-1">
              <span>Volume Total Réglé</span>
              <FiDollarSign className="text-brand-300" />
            </div>
            <div className="text-3xl font-black text-white mt-1">
              {totalCompletedVolumeDH} <span className="text-lg text-brand-300 font-bold">DH</span>
            </div>
            <div className="mt-2 text-xs text-brand-200">
              Paiements prestataires
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
              <span>Réseaux de Payout</span>
              <FiLayers className="text-brand-700" />
            </div>
            <div className="text-sm font-extrabold text-slate-900 mt-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Remitly :</span>
                <span className="text-emerald-700 font-bold">Actif (0% commission)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Binance Pay USDT :</span>
                <span className="text-amber-600 font-bold">Actif (Instantané)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                filterStatus === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tous ({items.length})
            </button>
            <button
              onClick={() => setFilterStatus('PENDING')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                filterStatus === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              À traiter ({pendingItems.length})
            </button>
            <button
              onClick={() => setFilterStatus('COMPLETED')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                filterStatus === 'COMPLETED' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Réglés ({completedItems.length})
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, email, ID..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-2 text-xs text-slate-900 outline-none focus:border-brand-700 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Payouts Table */}
        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4 pl-6">Bénéficiaire</th>
                  <th className="p-4">Méthode & Destination</th>
                  <th className="p-4">Montant Brut</th>
                  <th className="p-4">Frais</th>
                  <th className="p-4">Net à Verser</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 pr-6 text-right">Actions de Règlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400">
                      Aucune demande de virement trouvée.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isPending = item.status === 'PENDING' || item.status === 'PROCESSING';
                    const isCompleted = item.status === 'COMPLETED';
                    const isCancelled = item.status === 'CANCELLED';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition">
                        {/* Column 1: Beneficiary */}
                        <td className="p-4 pl-6">
                          <div className="font-extrabold text-slate-900 text-sm">{item.userName}</div>
                          <div className="text-slate-500 text-[11px]">{item.userEmail}</div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">ID: {item.userId.slice(0, 8)}</div>
                        </td>

                        {/* Column 2: Method & Destination */}
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                            {item.method === 'BINANCE_PAY' ? (
                              <span className="inline-flex items-center gap-1 rounded bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 text-[10px]">
                                <SiBinance className="text-amber-600" /> Binance Pay
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded bg-brand-50 text-brand-800 border border-brand-200 px-1.5 py-0.5 text-[10px]">
                                <FiSend className="text-brand-700" /> Remitly
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600 max-w-xs break-words font-mono bg-slate-100/70 p-1.5 rounded-lg flex items-center justify-between gap-2">
                            <span className="truncate">{item.description}</span>
                            <button
                              onClick={() => copyText(item.description, item.id)}
                              className="text-slate-500 hover:text-slate-900 shrink-0 cursor-pointer p-0.5"
                              title="Copier les détails"
                            >
                              {copiedId === item.id ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
                            </button>
                          </div>
                        </td>

                        {/* Column 3: Gross Amount */}
                        <td className="p-4 font-bold text-slate-700">
                          {item.grossAmountDH} DH
                        </td>

                        {/* Column 4: Platform Fee */}
                        <td className="p-4 font-semibold text-emerald-700">
                          0 DH (Gratuit)
                        </td>

                        {/* Column 5: Net Payout */}
                        <td className="p-4">
                          <div className="text-base font-black text-brand-700">
                            {item.netAmountDH} DH
                          </div>
                          <div className="text-[10px] text-slate-400">
                            ~{(item.netAmountDH * 0.1).toFixed(2)} €
                          </div>
                        </td>

                        {/* Column 6: Status */}
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : isCancelled
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {isCompleted ? (
                              <>
                                <FiCheckCircle className="text-emerald-600" />
                                Viré / Réglé
                              </>
                            ) : isCancelled ? (
                              <>
                                <FiAlertTriangle className="text-rose-600" />
                                Annulé
                              </>
                            ) : (
                              <>
                                <FiClock className="text-amber-600 animate-pulse" />
                                À Virer
                              </>
                            )}
                          </span>
                        </td>

                        {/* Column 7: Actions */}
                        <td className="p-4 pr-6 text-right">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setActionType('COMPLETE');
                                }}
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                              >
                                Marquer Viré
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setActionType('CANCEL');
                                }}
                                className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 px-2.5 py-1.5 text-xs font-bold transition cursor-pointer"
                              >
                                Rejeter
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">Clôturé</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Confirmation Modal */}
        {selectedItem && actionType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setActionType(null);
                }}
                className="absolute right-5 top-5 rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
              >
                <FiX />
              </button>

              <h3 className="text-xl font-extrabold text-slate-900">
                {actionType === 'COMPLETE' ? 'Confirmer l’émission du virement' : 'Rejeter et rembourser la demande'}
              </h3>

              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Bénéficiaire :</span>
                  <span className="font-bold text-slate-900">{selectedItem.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Montant net versé :</span>
                  <span className="font-extrabold text-brand-700 text-sm">{selectedItem.netAmountDH} DH</span>
                </div>
                <div className="pt-2 border-t border-slate-200 text-slate-600 break-words font-mono text-[11px]">
                  {selectedItem.description}
                </div>
              </div>

              {actionType === 'COMPLETE' && (
                <div className="mt-4 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Référence Remitly ou TxID Binance Pay :
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: REMITLY-982341 ou BINANCE-TXID-7819"
                    value={trackingReference}
                    onChange={(e) => setTrackingReference(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono outline-none focus:border-brand-700"
                  />
                  <p className="text-[11px] text-slate-500">
                    Cette référence sera envoyée par email au freelance avec sa confirmation de virement.
                  </p>
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    setActionType(null);
                  }}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={isSubmitting}
                  className={`rounded-xl px-5 py-2.5 text-xs font-extrabold text-white shadow-md transition ${
                    actionType === 'COMPLETE'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isSubmitting
                    ? 'Traitement...'
                    : actionType === 'COMPLETE'
                    ? 'Confirmer le virement envoyé'
                    : 'Confirmer le rejet & rembourser'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
};
