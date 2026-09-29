'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { FiX, FiCheckCircle, FiAward, FiAlertCircle, FiLoader } from 'react-icons/fi';

interface QualificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPassed: () => void;
}

interface QuestionItem {
  id: number;
  questionFr: string;
  questionAr: string;
  optionsFr: string[];
  optionsAr: string[];
}

export const QualificationModal: React.FC<QualificationModalProps> = ({
  isOpen,
  onClose,
  onPassed,
}) => {
  const { t, isRTL, locale } = useLanguage();
  const { profile, refreshProfile } = useAuth();
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [scorePassed, setScorePassed] = useState(false);
  const [resultMsg, setResultMsg] = useState('');
  const [scorePercent, setScorePercent] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setAnswers({});
      setIsLoading(true);
      fetch('/api/qualification')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.questions) {
            setQuestions(data.questions);
          }
        })
        .catch(err => console.error('Failed to load qualification questions:', err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (qIdx: number, oIdx: number) => {
    setAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
  };

  const handleValidate = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert(locale === 'ar' ? 'يرجى الإجابة على جميع الأسئلة للمتابعة.' : 'Veuillez répondre à toutes les questions avant de valider.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/qualification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile?.id || 'demo_user',
          answers,
        }),
      });

      const data = await res.json();
      setSubmitted(true);
      setScorePassed(data.passed);
      setScorePercent(data.scorePercent);
      setResultMsg(data.message || '');

      if (data.passed) {
        if (refreshProfile) await refreshProfile();
        onPassed();
      }
    } catch (err: any) {
      console.error('Qualification submission error:', err);
    } finally {
      setIsSubmitting(false);
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

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
            <FiLoader className="text-2xl animate-spin text-brand-700" />
            <span className="text-xs font-semibold">Chargement du test...</span>
          </div>
        ) : submitted && scorePassed ? (
          <div className="mt-6 rounded-xl bg-emerald-50 p-5 border border-emerald-200 text-center">
            <FiCheckCircle className="mx-auto text-3xl text-emerald-600 mb-2" />
            <h4 className="text-sm font-bold text-emerald-950">
              {t('qualificationSuccessMsg')}
            </h4>
            <p className="mt-1 text-xs text-emerald-800">
              Score obtenu : {scorePercent}% • Vous pouvez désormais postuler à toutes les missions.
            </p>
            <button
              onClick={onClose}
              className="mt-4 rounded-xl bg-emerald-700 px-6 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition cursor-pointer"
            >
              {locale === 'ar' ? 'بدء العمل على المهام' : 'Commencer à postuler'}
            </button>
          </div>
        ) : submitted && !scorePassed ? (
          <div className="mt-6 rounded-xl bg-rose-50 p-5 border border-rose-200 text-center">
            <FiAlertCircle className="mx-auto text-3xl text-rose-600 mb-2" />
            <h4 className="text-sm font-bold text-rose-950">
              Score insuffisant ({scorePercent}%)
            </h4>
            <p className="mt-1 text-xs text-rose-800">
              {resultMsg || 'Vous devez obtenir au moins 75% de bonnes réponses.'}
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setAnswers({});
              }}
              className="mt-4 rounded-xl bg-rose-700 px-6 py-2 text-xs font-bold text-white hover:bg-rose-800 transition cursor-pointer"
            >
              Réessayer le test
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {questions.map((q, qIdx) => {
              const qText = locale === 'ar' ? q.questionAr : q.questionFr;
              const options = locale === 'ar' ? q.optionsAr : q.optionsFr;
              return (
                <div key={q.id} className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <span className="text-[11px] font-bold text-brand-700 block mb-1">
                    Question {qIdx + 1} / {questions.length}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {qText}
                  </h4>
                  <div className="mt-3 space-y-2">
                    {options.map((opt, oIdx) => (
                      <label
                        key={oIdx}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                          answers[qIdx] === oIdx
                            ? 'bg-brand-50 border-brand-700 text-brand-950 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/60'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question_${qIdx}`}
                          checked={answers[qIdx] === oIdx}
                          onChange={() => handleSelect(qIdx, oIdx)}
                          className="mt-0.5 accent-brand-700"
                        />
                        <span className="leading-tight">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}

            <button
              onClick={handleValidate}
              disabled={isSubmitting || Object.keys(answers).length < questions.length}
              className="w-full rounded-xl bg-brand-700 py-3 text-xs font-bold text-white hover:bg-brand-800 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isSubmitting && <FiLoader className="animate-spin text-sm" />}
              <span>{locale === 'ar' ? 'إرسال الإجابات وتأكيد الاختبار' : 'Valider et soumettre le test'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
