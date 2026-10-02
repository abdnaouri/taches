'use client';

import React, { useState, useRef } from 'react';
import { Task } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { uploadDynamicProofFile } from '@/lib/supabaseService';
import { sounds } from '@/lib/soundEffects';
import {
  FiX,
  FiUploadCloud,
  FiCheckCircle,
  FiLink,
  FiSend,
  FiTrash2,
  FiShield,
  FiLoader,
  FiFileText,
  FiEye,
  FiAlertCircle,
  FiCheck,
  FiInfo,
  FiMaximize2,
} from 'react-icons/fi';

interface ProofSubmissionDrawerProps {
  task: Task | null;
  onClose: () => void;
  onSubmitProof: (taskId: string, reportText: string, proofUrls: string[], antiSpamEntered?: string) => void;
}

interface UploadedFileItem {
  id: string;
  name: string;
  url: string;
  sizeFormatted: string;
  type: 'image' | 'pdf' | 'zip' | 'other';
}

export const ProofSubmissionDrawer: React.FC<ProofSubmissionDrawerProps> = ({
  task,
  onClose,
  onSubmitProof,
}) => {
  const { t, isRTL, locale } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reportText, setReportText] = useState('');
  const [proofLink, setProofLink] = useState('');
  const [antiSpamInput, setAntiSpamInput] = useState('');
  const [antiSpamError, setAntiSpamError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [checkedChecklist, setCheckedChecklist] = useState<Record<number, boolean>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  if (!task) return null;

  const rewardDH = Math.round(task.reward * 10);
  const totalChecklistItems = task.requiredProofs?.length || 0;
  const completedChecklistItems = Object.values(checkedChecklist).filter(Boolean).length;
  const progressPercent = totalChecklistItems > 0 ? Math.round((completedChecklistItems / totalChecklistItems) * 100) : 100;

  const getFileType = (fileName: string): 'image' | 'pdf' | 'zip' | 'other' => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext || '')) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) return 'zip';
    return 'other';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFile = async (file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Le fichier dépasse la taille limite de 15 Mo.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const fileType = getFileType(file.name);
    const sizeFormatted = formatFileSize(file.size);

    const res = await uploadDynamicProofFile(file);
    setIsUploading(false);

    if (res.success && res.url) {
      const newItem: UploadedFileItem = {
        id: Math.random().toString(36).slice(2),
        name: file.name,
        url: res.url,
        sizeFormatted,
        type: fileType,
      };
      setUploadedFiles((prev) => [...prev, newItem]);
      sounds.playSuccess();
    } else {
      // Local Base64 fallback for offline or storage-unconfigured environments
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newItem: UploadedFileItem = {
            id: Math.random().toString(36).slice(2),
            name: file.name,
            url: event.target!.result as string,
            sizeFormatted,
            type: fileType,
          };
          setUploadedFiles((prev) => [...prev, newItem]);
          sounds.playSuccess();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    for (const f of files) {
      await processFile(f);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;
    for (const f of files) {
      await processFile(f);
    }
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
    sounds.playAlert();
  };

  const toggleCheck = (index: number) => {
    setCheckedChecklist((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAntiSpamError(null);
    if (!reportText.trim()) return;

    if (task.antiSpamKeyword && task.antiSpamKeyword.trim().length > 0) {
      const required = task.antiSpamKeyword.trim().toLowerCase();
      const entered = antiSpamInput.trim().toLowerCase();
      const inText = reportText.toLowerCase().includes(required);

      if (entered !== required && !inText) {
        setAntiSpamError('Le mot secret anti-spam est incorrect. Veuillez relire attentivement les consignes de la mission.');
        sounds.playAlert();
        return;
      }
    }

    const allUrls = uploadedFiles.map((f) => f.url);
    if (proofLink.trim()) {
      allUrls.push(proofLink.trim());
    }

    sounds.playSuccess();
    onSubmitProof(task.id, reportText, allUrls, antiSpamInput.trim());
    onClose();
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
          <span className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-2.5 py-0.5 flex items-center gap-1">
            <FiShield className="text-emerald-600" />
            {t('proofFinalStepBadge')}
          </span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t('proofWorkRenderBadge')}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {t('proofDrawerTitle')}
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          {t('proofTaskPrefix')}{' '}
          <span className="font-bold text-slate-900">{task.title}</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Deliverables Checklist with Progress Bar */}
          {task.requiredProofs && task.requiredProofs.length > 0 && (
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FiCheckCircle className="text-emerald-600" />
                  {t('proofConfirmRequirements')}
                </label>
                <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                  {completedChecklistItems}/{totalChecklistItems} validés ({progressPercent}%)
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div className="h-1.5 w-full bg-slate-200 rounded-full mb-3 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="space-y-2">
                {task.requiredProofs.map((req, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 rounded-xl p-3 border transition cursor-pointer ${
                      checkedChecklist[idx]
                        ? 'bg-emerald-50/60 border-emerald-300 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-brand-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedChecklist[idx]}
                      onChange={() => toggleCheck(idx)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-700 cursor-pointer accent-brand-700"
                    />
                    <span className="text-xs font-semibold leading-snug">{req}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Text Report */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t('proofReportLabel')} <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder={t('proofReportPlaceholder')}
              className="w-full rounded-2xl border border-slate-300 bg-white p-3.5 text-xs text-slate-900 outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-700 transition"
            />
          </div>

          {/* Anti-Spam Secret Keyword (UNU Quality Guard) */}
          {task.antiSpamKeyword && (
            <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-4">
              <label className="block text-xs font-bold text-amber-900 mb-1">
                🔒 Mot secret anti-spam exigé par le client <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] text-amber-700 mb-2">
                Un mot clé secret a été inséré dans le texte de la mission par le client pour vérifier que vous avez lu toutes les consignes.
              </p>
              <input
                type="text"
                required
                value={antiSpamInput}
                onChange={(e) => {
                  setAntiSpamInput(e.target.value);
                  setAntiSpamError(null);
                }}
                placeholder="Entrez le mot secret trouvé dans les consignes..."
                className="w-full rounded-xl border border-amber-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
              {antiSpamError && (
                <p className="text-[11px] font-bold text-rose-600 mt-1.5 flex items-center gap-1">
                  <FiAlertCircle />
                  <span>{antiSpamError}</span>
                </p>
              )}
            </div>
          )}

          {/* Deliverable URL (Figma / Drive / Canva / Github / Loom) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t('proofUrlLabel')} <span className="text-slate-400 font-normal">(Optionnel)</span>
            </label>
            <div className="relative">
              <FiLink
                className={`absolute ${
                  isRTL ? 'right-4' : 'left-4'
                } top-3.5 text-slate-400 text-xs`}
              />
              <input
                type="url"
                value={proofLink}
                onChange={(e) => setProofLink(e.target.value)}
                placeholder="https://drive.google.com/..., https://figma.com/..., https://wetransfer.com/..."
                className={`w-full rounded-2xl border border-slate-300 bg-white py-3 ${
                  isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
                } text-xs text-slate-900 outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-700 transition`}
              />
            </div>
          </div>

          {/* Drag & Drop File Zone */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {t('proofScreenshotsLabel')}
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                PNG, JPG, PDF, ZIP (Max 15 Mo)
              </span>
            </div>

            {uploadError && (
              <div className="mb-2 flex items-center gap-2 rounded-xl bg-amber-50 p-2.5 border border-amber-200 text-[11px] text-amber-800 font-medium">
                <FiAlertCircle className="text-amber-600 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Drop Zone Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all cursor-pointer ${
                isDragOver
                  ? 'border-brand-700 bg-brand-50/50 scale-[1.01]'
                  : 'border-slate-300 hover:border-brand-700 bg-slate-50 hover:bg-slate-50/80'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.pdf,.zip,.rar,.tar,.gz"
                multiple
                className="hidden"
              />

              {isUploading ? (
                <div className="flex flex-col items-center py-2">
                  <FiLoader className="text-2xl text-brand-700 animate-spin mb-2" />
                  <span className="text-xs font-bold text-slate-700">
                    Téléversement sécurisé en cours...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 mb-2">
                    <FiUploadCloud className="text-xl" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    {t('proofDragOrClick')}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    Glissez vos fichiers ici ou parcourez votre appareil
                  </span>
                </div>
              )}
            </div>

            {/* Uploaded Files Grid */}
            {uploadedFiles.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="group relative flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-brand-400 transition"
                  >
                    {file.type === 'image' ? (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImageUrl(file.url);
                        }}
                        className="relative h-10 w-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 cursor-zoom-in"
                      >
                        <img
                          src={file.url}
                          alt={file.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                          <FiEye className="text-xs" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700 font-black text-xs shrink-0">
                        <FiFileText className="text-base" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-[10px] text-slate-400">{file.sizeFormatted}</p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(file.id);
                      }}
                      className="rounded-full p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Supprimer"
                    >
                      <FiTrash2 className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Escrow payout summary in DH */}
          <div className="rounded-2xl bg-linear-to-r from-slate-900 to-slate-800 text-white p-4.5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <FiShield className="text-lg" />
              </div>
              <div>
                <span className="font-extrabold text-xs text-white">
                  {t('proofGuaranteedPayout')}
                </span>
                <p className="text-slate-300 text-[11px]">{t('proofGuaranteedDesc')}</p>
              </div>
            </div>
            <div className={isRTL ? 'text-left' : 'text-right'}>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-semibold">
                {t('proofNetGain')}
              </span>
              <div className="font-black text-lg text-emerald-400">{rewardDH} DH</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition"
            >
              {t('btnCancel')}
            </button>
            <button
              type="submit"
              disabled={isUploading || !reportText.trim()}
              className="flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 disabled:opacity-50 px-6 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition cursor-pointer"
            >
              <FiSend className={`text-xs ${isRTL ? 'rotate-180' : ''}`} />
              <span>{t('btnSubmitForValidation')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Fullscreen Image Preview Lightbox */}
      {previewImageUrl && (
        <div
          onClick={() => setPreviewImageUrl(null)}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewImageUrl}
              alt="Preview"
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-2 right-2 rounded-full bg-white/90 p-2 text-slate-900 hover:bg-white shadow-lg cursor-pointer"
            >
              <FiX className="text-lg" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
