'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { FiX, FiCheckCircle, FiAward, FiShield } from 'react-icons/fi';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className={`absolute ${isRTL ? 'left-5' : 'right-5'} top-5 rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer`}
        >
          <FiX className="text-lg" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-700 text-white font-bold text-xs">
            <FiAward />
          </span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('qualificationBadge')}
          </span>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900">
          {t('qualificationTitle')}
        </h2>
        <p className="mt-1 text-xs text-slate-600 leading-relaxed">
          {t('qualificationDesc')}
        </p>

        {submitted && scorePassed ? (
          <div className="mt-6 rounded-xl bg-emerald-50 p-5 border border-emerald-200 text-center">
            <FiCheckCircle className="mx-auto text-3xl text-emerald-600 mb-2" />
            <h4 className="text-sm font-bold text-emerald-950">
              {t('qualificationSuccessMsg')}
            </h4>
            <button
              onClick={onClose}
              className="mt-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-6 py-2.5 text-xs font-bold text-white transition active:scale-95 cursor-pointer"
            >
              {t('btnClose')}
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {questions.map((item, qIdx) => (
              <div key={qIdx} className="space-y-2">
                <p className="text-xs font-bold text-slate-900">
                  {qIdx + 1}. {item.q}
                </p>
                <div className="space-y-1.5">
                  {item.options.map((opt, oIdx) => (
                    <label
                      key={oIdx}
                      onClick={() => handleSelect(qIdx, oIdx)}
                      className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs transition cursor-pointer ${
                        answers[qIdx] === oIdx
                          ? 'border-brand-700 bg-brand-50 text-slate-900 font-semibold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q_${qIdx}`}
                        checked={answers[qIdx] === oIdx}
                        onChange={() => handleSelect(qIdx, oIdx)}
                        className="mt-0.5 accent-brand-700"
                      />
                      <span className="leading-snug">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={handleValidate}
              className="w-full rounded-xl bg-brand-700 hover:bg-brand-800 py-3 text-xs font-bold text-white shadow-md active:scale-95 transition cursor-pointer"
            >
              {t('btnValidateAnswers')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
