'use client';

import React, { useState, useRef } from 'react';
import { Task } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { uploadDynamicProofFile } from '@/lib/supabaseService';
import { 
  FiX, 
  FiUploadCloud, 
  FiCheckCircle, 
  FiLink, 
  FiSend, 
  FiTrash2,
  FiShield,
  FiLoader
} from 'react-icons/fi';

interface ProofSubmissionDrawerProps {
  task: Task | null;
  onClose: () => void;
  onSubmitProof: (taskId: string, reportText: string, proofUrls: string[]) => void;
}

export const ProofSubmissionDrawer: React.FC<ProofSubmissionDrawerProps> = ({
  task,
  onClose,
  onSubmitProof,
}) => {
  const { t, isRTL } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reportText, setReportText] = useState('');
  const [proofLink, setProofLink] = useState('');
  const [uploadedScreenshots, setUploadedScreenshots] = useState<string[]>([]);
  const [checkedChecklist, setCheckedChecklist] = useState<Record<number, boolean>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!task) return null;

  const rewardDH = Math.round(task.reward * 10);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const res = await uploadDynamicProofFile(file);
    setIsUploading(false);

    if (res.success && res.url) {
      setUploadedScreenshots(prev => [...prev, res.url]);
    } else {
      setUploadError(res.error || 'Erreur de téléversement');
      // Fallback preview
      const localUrl = URL.createObjectURL(file);
      setUploadedScreenshots(prev => [...prev, localUrl]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedScreenshots(uploadedScreenshots.filter((_, i) => i !== index));
  };

  const toggleCheck = (index: number) => {
    setCheckedChecklist(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) return;

    const allUrls = [...uploadedScreenshots];
    if (proofLink.trim()) {
      allUrls.push(proofLink.trim());
    }

    onSubmitProof(task.id, reportText, allUrls);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className={`absolute ${isRTL ? 'left-5' : 'right-5'} top-5 rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer`}
        >
          <FiX className="text-lg" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-2.5 py-0.5">
            {t('proofFinalStepBadge')}
          </span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t('proofWorkRenderBadge')}
          </span>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900">
          {t('proofDrawerTitle')}
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          {t('proofTaskPrefix')} <span className="font-bold text-slate-900">{task.title}</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Deliverables Checklist verification */}
          {task.requiredProofs && task.requiredProofs.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {t('proofConfirmRequirements')}
              </label>
              <div className="space-y-2">
                {task.requiredProofs.map((req, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-200 cursor-pointer hover:border-brand-600 transition"
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedChecklist[idx]}
                      onChange={() => toggleCheck(idx)}
                      className="h-4 w-4 rounded border-slate-300 accent-brand-700 cursor-pointer"
                    />
                    <span className="text-xs text-slate-800 font-medium">{req}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Text Report */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t('proofReportLabel')}
            </label>
            <textarea
              rows={3}
              required
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder={t('proofReportPlaceholder')}
              className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs text-slate-900 outline-none focus:border-brand-700"
            />
          </div>

          {/* Deliverable URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t('proofUrlLabel')}
            </label>
            <div className="relative">
              <FiLink className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-3.5 text-slate-400 text-xs`} />
              <input
                type="url"
                value={proofLink}
                onChange={(e) => setProofLink(e.target.value)}
                placeholder={t('proofUrlPlaceholder')}
                className={`w-full rounded-xl border border-slate-300 bg-white py-3 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-xs text-slate-900 outline-none focus:border-brand-700`}
              />
            </div>
          </div>

          {/* Screenshot Upload via Supabase Storage */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {t('proofScreenshotsLabel')}
              </label>
              <span className="text-[11px] text-slate-500 font-medium">PNG, JPG, PDF, ZIP</span>
            </div>

            {uploadError && (
              <p className="text-[11px] text-amber-700 mb-1.5 font-medium">Note: {uploadError}</p>
            )}

            <div className="grid grid-cols-3 gap-3">
              {uploadedScreenshots.map((url, i) => (
                <div key={i} className="group relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img src={url} alt={`Proof ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer"
                  >
                    <FiTrash2 className="text-[10px]" />
                  </button>
                </div>
              ))}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.pdf,.zip"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-slate-300 hover:border-brand-700 bg-slate-50 text-slate-600 transition p-2 disabled:opacity-50 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <FiLoader className="text-xl text-brand-700 mb-1 animate-spin" />
                    <span className="text-[10px] font-bold">Téléversement...</span>
                  </>
                ) : (
                  <>
                    <FiUploadCloud className="text-xl text-slate-400 mb-1" />
                    <span className="text-[10px] font-medium">{t('proofDragOrClick')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Escrow payout summary in DH */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FiShield className="text-emerald-700 text-lg shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-slate-900">{t('proofGuaranteedPayout')}</span>
                <p className="text-slate-500 text-[11px]">{t('proofGuaranteedDesc')}</p>
              </div>
            </div>
            <div className={isRTL ? 'text-left' : 'text-right'}>
              <span className="text-xs text-slate-500">{t('proofNetGain')}</span>
              <div className="font-extrabold text-sm text-slate-900">{rewardDH} DH</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              {t('btnCancel')}
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 px-6 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition cursor-pointer"
            >
              <FiSend className={`text-xs ${isRTL ? 'rotate-180' : ''}`} />
              <span>{t('btnSubmitForValidation')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
