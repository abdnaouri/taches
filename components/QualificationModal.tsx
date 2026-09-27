'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { FiX, FiCheckCircle, FiAward } from 'react-icons/fi';

interface QualificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPassed: () => void;
}

export const QualificationModal: React.FC<QualificationModalProps> = ({
  isOpen,
  onClose,
  onPassed,
}) => {
  const { t, isRTL } = useLanguage();
  const [answers, setAnswers] = useState<Record<number, number>>({ 0: 0, 1: 1, 2: 0 });
  const [submitted, setSubmitted] = useState(false);
  const [scorePassed, setScorePassed] = useState(true);

  if (!isOpen) return null;

  const questions = [
    {
      q: t('q1Title'),
      options: [
        t('q1Opt0'),
        t('q1Opt1'),
        t('q1Opt2')
      ],
      correct: 0,
    },
    {
      q: t('q2Title'),
      options: [
        t('q2Opt0'),
        t('q2Opt1'),
        t('q2Opt2')
      ],
      correct: 1,
    },
    {
      q: t('q3Title'),
      options: [
        t('q3Opt0'),
        t('q3Opt1'),
        t('q3Opt2')
      ],
      correct: 0,
    },
  ];

  const handleSelect = (qIdx: number, oIdx: number) => {
    setAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
  };

  const handleValidate = () => {
    const passed = questions.every((q, idx) => answers[idx] === q.correct);
    setScorePassed(passed);
    setSubmitted(true);
    if (passed) {
      onPassed();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-cream p-6 sm:p-8 shadow-2xl border border-ink/15 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className={`absolute ${isRTL ? 'left-5' : 'right-5'} top-5 rounded-full bg-ink/5 p-2 text-ink/70 hover:bg-ink hover:text-white transition-all`}
        >
          <FiX className="text-lg" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime text-ink font-bold text-xs">
            <FiAward />
          </span>
          <span className="text-xs font-bold text-ink/50 uppercase tracking-wider">
            {t('qualificationBadge')}
          </span>
        </div>

        <h2 className="font-display text-2xl font-bold text-ink">
          {t('qualificationTitle')}
        </h2>
        <p className="mt-1 text-xs text-ink/70">
          {t('qualificationDesc')}
        </p>

        {submitted && scorePassed && (
          <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <FiCheckCircle className="text-emerald-600 text-lg shrink-0" />
            <span>{t('qualificationSuccessMsg')}</span>
          </div>
        )}

        <div className="mt-5 space-y-4">
          {questions.map((item, qIdx) => (
            <div key={qIdx} className="rounded-2xl bg-white p-4 border border-ink/10 text-xs">
              <div className="font-bold text-ink mb-2">
                {qIdx + 1}. {item.q}
              </div>
              <div className="space-y-1.5">
                {item.options.map((opt, oIdx) => (
                  <label
                    key={oIdx}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition ${
                      answers[qIdx] === oIdx
                        ? 'border-ink bg-ink/5 text-ink font-semibold'
                        : 'border-transparent text-ink/75 hover:bg-ink/3'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question_${qIdx}`}
                      checked={answers[qIdx] === oIdx}
                      onChange={() => handleSelect(qIdx, oIdx)}
                      className="accent-lime"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-ink/10">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-ink/20 px-5 py-2.5 text-xs font-semibold text-ink"
          >
            {t('btnClose')}
          </button>
          <button
            type="button"
            onClick={handleValidate}
            className="rounded-full bg-ink px-6 py-2.5 text-xs font-bold text-lime hover:bg-ink/90 shadow-sm"
          >
            {t('btnValidateAnswers')}
          </button>
        </div>
      </div>
    </div>
  );
};
