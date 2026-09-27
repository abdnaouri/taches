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
  const [uploadedScreenshots, setUploadedScreenshots] = useState<string[]>([
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&auto=format&fit=crop&q=80'
  ]);
  const [checkedChecklist, setCheckedChecklist] = useState<Record<number, boolean>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!task) return null;

  const handleAddSampleImage = () => {
    setUploadedScreenshots([
      ...uploadedScreenshots,
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&auto=format&fit=crop&q=80'
    ]);
  };

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
      setUploadError(res.error || 'Upload error');
      // Still allow adding local preview object URL as fallback
      const objectUrl = URL.createObjectURL(file);
      setUploadedScreenshots(prev => [...prev, objectUrl]);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setUploadedScreenshots(uploadedScreenshots.filter((_, i) => i !== index));
  };

  const toggleCheck = (index: number) => {
    setCheckedChecklist(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrls = [...uploadedScreenshots];
    if (proofLink.trim()) finalUrls.push(proofLink.trim());
    onSubmitProof(task.id, reportText, finalUrls);
    onClose();
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
            {t('proofFinalStepBadge')}
          </span>
          <span className="text-xs font-bold text-ink/50 uppercase tracking-wider">
            {t('proofWorkRenderBadge')}
          </span>
        </div>

        <h2 className="font-display text-2xl font-bold text-ink">
          {t('proofDrawerTitle')}
        </h2>
        <p className="mt-1 text-xs text-ink/70">
          {t('proofTaskPrefix')} <span className="font-semibold text-ink">{task.title}</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Deliverables Checklist verification */}
          {task.requiredProofs && task.requiredProofs.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-ink mb-2">
                {t('proofConfirmRequirements')}
              </label>
              <div className="space-y-2">
                {task.requiredProofs.map((req, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-3 rounded-2xl bg-white p-3 border border-ink/10 cursor-pointer hover:border-ink/30 transition"
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedChecklist[idx]}
                      onChange={() => toggleCheck(idx)}
                      className="h-4 w-4 rounded border-ink/30 accent-lime cursor-pointer"
                    />
                    <span className="text-xs text-ink">{req}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Text Report */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">
              {t('proofReportLabel')}
            </label>
            <textarea
              rows={3}
              required
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder={t('proofReportPlaceholder')}
              className="w-full rounded-2xl border border-ink/15 bg-white p-3.5 text-xs text-ink outline-none focus:border-ink"
            />
          </div>

          {/* Deliverable URL */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">
              {t('proofUrlLabel')}
            </label>
            <div className="relative">
              <FiLink className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-3.5 text-ink/40 text-xs`} />
              <input
                type="url"
                value={proofLink}
                onChange={(e) => setProofLink(e.target.value)}
                placeholder={t('proofUrlPlaceholder')}
                className={`w-full rounded-2xl border border-ink/15 bg-white py-3 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-xs text-ink outline-none focus:border-ink`}
              />
            </div>
          </div>

          {/* Screenshot Upload via Supabase Storage */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-ink">
                {t('proofScreenshotsLabel')}
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddSampleImage}
                  className="text-[11px] font-semibold text-ink underline hover:text-lime-600"
                >
                  {t('proofSimulateAddImg')}
                </button>
              </div>
            </div>

            {uploadError && (
              <p className="text-[11px] text-amber-700 mb-1.5">Note: {uploadError}</p>
            )}

            <div className="grid grid-cols-3 gap-3">
              {uploadedScreenshots.map((url, i) => (
                <div key={i} className="group relative aspect-video rounded-xl overflow-hidden border border-ink/15 bg-ink/5">
                  <img src={url} alt={`Proof ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white opacity-0 group-hover:opacity-100 transition shadow-xs"
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
                className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-ink/20 hover:border-ink/40 bg-white/50 text-ink/60 transition p-2 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <FiLoader className="text-xl text-ink/70 mb-1 animate-spin" />
                    <span className="text-[10px] font-medium">Upload Supabase...</span>
                  </>
                ) : (
                  <>
                    <FiUploadCloud className="text-xl text-ink/50 mb-1" />
                    <span className="text-[10px] font-medium">{t('proofDragOrClick')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Escrow payout summary */}
          <div className="rounded-2xl bg-white p-4 border border-ink/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FiShield className="text-lime-600 text-lg shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-ink">{t('proofGuaranteedPayout')}</span>
                <p className="text-ink/60 text-[11px]">{t('proofGuaranteedDesc')}</p>
              </div>
            </div>
            <div className={isRTL ? 'text-left' : 'text-right'}>
              <span className="text-xs text-ink/50">{t('proofNetGain')}</span>
              <div className="font-extrabold text-sm text-ink">€{task.reward.toFixed(2)}</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-ink/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-ink/20 px-5 py-2.5 text-xs font-semibold text-ink hover:bg-ink/5"
            >
              {t('btnCancel')}
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-xs font-bold text-lime shadow-md hover:bg-ink/90 active:scale-95 transition"
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
