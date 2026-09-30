'use client';

export const runtime = 'edge';

import React, { useState, useEffect } from 'react';
import Link from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { Header } from '@/components/Header';
import { WorkzillaFooter } from '@/components/WorkzillaLandingSections';
import { getAuthHeaders } from '@/lib/supabase';
import { KycSubmissionItem } from '@/types/database';
import {
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertTriangle,
  FiUser,
  FiSearch,
  FiExternalLink,
  FiRefreshCw,
  FiPhone,
  FiMapPin,
  FiMail,
  FiDollarSign,
  FiCreditCard,
  FiFileText,
  FiEye,
  FiCheck,
  FiX,
  FiLock,
  FiArrowRight
} from 'react-icons/fi';

export default function AdminKycPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const { isAuthenticated, profile, openAuthModal } = useAuth();

  const [items, setItems] = useState<KycSubmissionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<KycSubmissionItem | null>(null);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Documents illisibles ou informations non concordantes.');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchKycItems = async () => {
    setIsLoading(true);
    try {
      const authHeaders = await getAuthHeaders(false);
      const res = await fetch(`/api/admin/kyc?status=${filterStatus}`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success && data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('Failed to load KYC items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && profile?.isAdmin) {
      fetchKycItems();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, profile?.isAdmin, filterStatus]);

  const handleApprove = async (item: KycSubmissionItem) => {
    setIsSubmitting(true);
    try {
      const authHeaders = await getAuthHeaders(true);
      const res = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          userId: item.userId,
          action: 'APPROVE',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setToastMsg(`✅ Dossier KYC de ${item.fullName} approuvé avec succès.`);
        fetchKycItems();
        if (selectedItem?.userId === item.userId) setSelectedItem(null);
        setTimeout(() => setToastMsg(null), 4000);
      } else {
        alert(data.error || 'Erreur lors de la validation.');
      }
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      const authHeaders = await getAuthHeaders(true);
      const res = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          userId: selectedItem.userId,
          action: 'REJECT',
          rejectionReason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setToastMsg(`⚠️ Dossier KYC de ${selectedItem.fullName} rejeté.`);
        setIsRejectModalOpen(false);
        setSelectedItem(null);
        fetchKycItems();
        setTimeout(() => setToastMsg(null), 4000);
      } else {
        alert(data.error || 'Erreur lors du rejet.');
      }
    } catch (err) {
      console.error('Rejection failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.fullName.toLowerCase().includes(term) ||
      item.email.toLowerCase().includes(term) ||
      (item.cin && item.cin.toLowerCase().includes(term)) ||
      (item.city && item.city.toLowerCase().includes(term))
    );
  });

  const pendingCount = items.filter((i) => i.kycStatus === 'PENDING').length;

  if (!isAuthenticated || !profile?.isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
        <Header />
        <div className="max-w-md mx-auto my-auto p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiLock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Accès Administrateur Restreint</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Cette section est réservée à l&apos;équipe de conformité et modération de Tâches.ma.
          </p>
          <button
            onClick={() => openAuthModal('login', 'Connectez-vous avec un compte Administrateur')}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            Se connecter en tant qu&apos;Admin
          </button>
        </div>
        <WorkzillaFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Header />

      {/* Admin Subheader Navigation Bar */}
      <div className="bg-slate-900 border-b border-slate-800 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <FiShield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Console d&apos;Administration</span>
              <h1 className="text-lg font-black text-white">Conformité & Vérification KYC</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
            <button
              onClick={() => router.push(`/${locale}/admin/payouts`)}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all flex items-center gap-1.5"
            >
              <FiCreditCard className="w-4 h-4 text-emerald-400" />
              <span>Virements Payouts</span>
            </button>
            <button
              onClick={() => router.push(`/${locale}/admin/disputes`)}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all flex items-center gap-1.5"
            >
              <FiAlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Litiges & Arbitrage</span>
            </button>
            <button
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <FiShield className="w-4 h-4 text-white" />
              <span>Vérifications KYC</span>
              {pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-white text-emerald-700 rounded-full text-[10px] font-black">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <FiCheckCircle className="w-5 h-5" />
              <span className="font-semibold text-sm">{toastMsg}</span>
            </div>
            <button onClick={() => setToastMsg(null)} className="text-emerald-100 hover:text-white">
              <FiX className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Top Stats & Filters Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: 'PENDING', label: 'En attente', count: pendingCount },
              { key: 'ALL', label: 'Tous les dossiers', count: items.length },
              { key: 'VERIFIED', label: 'Validés' },
              { key: 'REJECTED', label: 'Rejetés' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  filterStatus === tab.key
                    ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${filterStatus === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher nom, CIN, ville..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={fetchKycItems}
              disabled={isLoading}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl transition-all"
              title="Rafraîchir"
            >
              <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* KYC Items List */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500">Chargement des dossiers KYC...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Aucun dossier trouvé</h3>
            <p className="text-xs text-slate-500 mt-1">
              {filterStatus === 'PENDING' ? 'Tous les dossiers d’identité soumis ont été traités.' : 'Aucun freelance ne correspond à ce filtre.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.userId}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* User Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                      alt={item.fullName}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">{item.fullName}</h3>
                        {item.kycStatus === 'VERIFIED' && (
                          <span className="p-1 bg-emerald-500/10 text-emerald-600 rounded-full" title="Identité Vérifiée">
                            <FiCheckCircle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <FiMail className="w-3 h-3" />
                        <span>{item.email}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-full flex items-center gap-1 ${
                      item.kycStatus === 'VERIFIED'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : item.kycStatus === 'PENDING'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : item.kycStatus === 'REJECTED'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    {item.kycStatus === 'VERIFIED' && <FiCheckCircle className="w-3 h-3" />}
                    {item.kycStatus === 'PENDING' && <FiClock className="w-3 h-3" />}
                    {item.kycStatus === 'REJECTED' && <FiXCircle className="w-3 h-3" />}
                    {item.kycStatus === 'VERIFIED'
                      ? 'Vérifié'
                      : item.kycStatus === 'PENDING'
                      ? 'En Attente'
                      : item.kycStatus === 'REJECTED'
                      ? 'Rejeté'
                      : 'Non Soumis'}
                  </span>
                </div>

                {/* Identity & Location Details */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl text-xs border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">N° CIN Marocain</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {item.cin || 'Non renseigné'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Ville</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <FiMapPin className="w-3 h-3 text-slate-400" />
                      {item.city || 'Casablanca'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Téléphone</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <FiPhone className="w-3 h-3 text-slate-400" />
                      {item.phone || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Rejection reason notice if rejected */}
                {item.kycStatus === 'REJECTED' && item.kycRejectionReason && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-600 dark:text-rose-400">
                    <span className="font-bold">Motif du refus : </span>
                    {item.kycRejectionReason}
                  </div>
                )}

                {/* ID Documents Thumbnails */}
                <div>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-2">
                    Documents Justificatifs d&apos;Identité :
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Front Document */}
                    <div className="relative border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-[16/10] group">
                      {item.cinDocumentFrontUrl ? (
                        <>
                          <img
                            src={item.cinDocumentFrontUrl}
                            alt="CIN Recto"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <button
                            onClick={() => setPreviewDocUrl(item.cinDocumentFrontUrl!)}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold gap-1 transition-opacity"
                          >
                            <FiEye className="w-4 h-4" />
                            <span>Agrandir Recto</span>
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                          <FiFileText className="w-5 h-5 mb-1 opacity-50" />
                          <span className="text-[10px]">Recto manquant</span>
                        </div>
                      )}
                      <span className="absolute bottom-1 left-1.5 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        CIN RECTO
                      </span>
                    </div>

                    {/* Back Document */}
                    <div className="relative border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-[16/10] group">
                      {item.cinDocumentBackUrl ? (
                        <>
                          <img
                            src={item.cinDocumentBackUrl}
                            alt="CIN Verso"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <button
                            onClick={() => setPreviewDocUrl(item.cinDocumentBackUrl!)}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold gap-1 transition-opacity"
                          >
                            <FiEye className="w-4 h-4" />
                            <span>Agrandir Verso</span>
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                          <FiFileText className="w-5 h-5 mb-1 opacity-50" />
                          <span className="text-[10px]">Verso manquant</span>
                        </div>
                      )}
                      <span className="absolute bottom-1 left-1.5 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        CIN VERSO
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setIsRejectModalOpen(true);
                    }}
                    disabled={isSubmitting}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 dark:text-rose-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <FiX className="w-3.5 h-3.5" />
                    <span>Rejeter</span>
                  </button>

                  <button
                    onClick={() => handleApprove(item)}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                  >
                    <FiCheck className="w-3.5 h-3.5" />
                    <span>Valider & Badge Vérifié</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Rejection Modal */}
      {isRejectModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FiAlertTriangle className="text-rose-500 w-5 h-5" />
                <span>Rejeter le dossier de {selectedItem.fullName}</span>
              </h3>
              <button onClick={() => setIsRejectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Veuillez indiquer le motif du refus. L&apos;utilisateur recevra une notification pour re-soumettre un document valide.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Motif du rejet
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20 transition-all"
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Image Zoom Modal */}
      {previewDocUrl && (
        <div
          onClick={() => setPreviewDocUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[85vh] w-full flex flex-col items-center justify-center p-2">
            <img
              src={previewDocUrl}
              alt="Aperçu CIN"
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-white/20"
            />
            <button
              onClick={() => setPreviewDocUrl(null)}
              className="mt-3 px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-full backdrop-blur-md transition-all"
            >
              Fermer l&apos;aperçu (Esc)
            </button>
          </div>
        </div>
      )}

      <WorkzillaFooter />
    </div>
  );
}
