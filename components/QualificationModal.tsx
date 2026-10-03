'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { getAuthHeaders } from '@/lib/supabase';
import { sounds } from '@/lib/soundEffects';
import {
  FiX,
  FiCheckCircle,
  FiAward,
  FiAlertCircle,
  FiLoader,
  FiArrowRight,
  FiRotateCcw,
  FiShield,
  FiCheck,
  FiStar,
  FiZap,
} from 'react-icons/fi';

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
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.questions) {
            setQuestions(data.questions);
          }
        })
        .catch((err) => console.error('Failed to load qualification questions:', err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (qIdx: number, oIdx: number) => {
    setAnswers((prev) => ({ ...prev, [qIdx]: oIdx }));
    sounds.playClick();
  };

  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;
  const allAnswered = totalCount > 0 && answeredCount === totalCount;
  const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  const handleValidate = async () => {
    if (!allAnswered) return;

    setIsSubmitting(true);
    try {
      const authHeaders = await getAuthHeaders(true);
      const res = await fetch('/api/qualification', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          userId: profile?.id,
          answers,
        }),
      });

      const data = await res.json();
      setSubmitted(true);
      setScorePassed(data.passed);
      setScorePercent(data.scorePercent);
      setResultMsg(data.message || '');

      if (data.passed) {
        sounds.playSuccess();
        if (refreshProfile) await refreshProfile();
        setTimeout(() => {
          onPassed();
        }, 1500);
      } else {
        sounds.playAlert();
      }
    } catch (err: any) {
      console.error('Qualification submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setSubmitted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute ${
            isRTL ? 'left-5' : 'right-5'
          } top-5 rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer`}
          title="Fermer"
        >
          <FiX className="text-lg" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-700 text-white font-bold text-xs">
            <FiAward />
          </span>
          <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">
            {locale === 'ar'
              ? 'اختبار التأهيل السريع (دقيقة واحدة)'
              : 'Test de Qualification Express (1 min)'}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {locale === 'ar' ? 'تفعيل حساب المستقل المعتمد' : 'Certification Prestataire Tâches.ma'}
        </h2>
        <p className="mt-1 text-xs text-slate-600 leading-relaxed">
          {locale === 'ar'
            ? 'أجب على 4 أسئلة بسيطة حول قواعد الأمان والضمان المالي (Daman) للحصول على شارة الموثوقية وتعزيز فرص اختيارك من قبل العملاء.'
            : 'Répondez à 4 questions simples sur les règles de sécurité et le séquestre Daman pour obtenir votre badge officiel de Vérification & Confiance.'}
        </p>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
            <FiLoader className="text-3xl animate-spin text-brand-700" />
            <span className="text-xs font-bold text-slate-700">
              Chargement du test de qualification...
            </span>
          </div>
        ) : submitted && scorePassed ? (
          <div className="mt-6 rounded-3xl bg-linear-to-b from-emerald-50 to-teal-50/40 p-6 sm:p-8 border border-emerald-200 text-center animate-in zoom-in-95">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-white mb-4 shadow-lg shadow-emerald-500/30">
              <FiAward className="text-3xl" />
            </div>
            <h4 className="text-xl font-black text-emerald-950">
              {locale === 'ar'
                ? 'تهانينا ! تم اجتياز الاختبار بنجاح'
                : 'Félicitations ! Test Réussi avec Succès'}
            </h4>
            <p className="mt-2 text-xs text-emerald-800 leading-relaxed font-medium">
              {locale === 'ar'
                ? `النتيجة: ${scorePercent}% • حسابك الآن معتمد وجاهز للتقديم على جميع المهام.`
                : `Score : ${scorePercent}% • Votre profil est certifié Prestataire Vérifié Niveau 1. Vous pouvez désormais postuler à toutes les missions en 1 clic.`}
            </p>

            {/* Certification Badge Showcase */}
            <div className="mt-4 mx-auto max-w-xs rounded-2xl bg-white p-3.5 border border-emerald-300/80 shadow-xs flex items-center gap-3 text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <FiShield className="text-xl" />
              </div>
              <div>
                <span className="text-[11px] font-black text-slate-900 block">
                  Badge Prestataire Agréé Daman
                </span>
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <FiCheck className="text-xs" /> Actif sur votre profil
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onPassed();
                onClose();
              }}
              className="mt-6 w-full rounded-2xl bg-emerald-700 hover:bg-emerald-800 py-3.5 text-xs font-black text-white shadow-lg shadow-emerald-700/20 transition active:scale-98 cursor-pointer"
            >
              {locale === 'ar' ? 'متابعة وإرسال العرض' : 'Continuer et postuler à la tâche'}
            </button>
          </div>
        ) : submitted && !scorePassed ? (
          <div className="mt-6 rounded-3xl bg-rose-50 p-6 sm:p-8 border border-rose-200 text-center animate-in zoom-in-95">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500 text-white mb-3 shadow-md shadow-rose-500/20">
              <FiAlertCircle className="text-3xl" />
            </div>
            <h4 className="text-lg font-black text-rose-950">
              {locale === 'ar' ? 'تحتاج إلى تصحيح بعض الإجابات' : 'Quelques réponses à ajuster'} ({scorePercent}%)
            </h4>
            <p className="mt-2 text-xs text-rose-800 leading-relaxed font-medium">
              {locale === 'ar'
                ? 'تذكر دائماً: جميع المعاملات يجب أن تتم داخل المنصة عبر الضمان المالي لحماية حقوقك وأموالك.'
                : 'Rappel essentiel : toutes les communications et transactions doivent impérativement rester sur tâches.ma pour garantir la protection du séquestre Daman.'}
            </p>
            <button
              onClick={handleRetry}
              className="mt-5 flex items-center justify-center gap-2 w-full rounded-2xl bg-rose-700 hover:bg-rose-800 py-3.5 text-xs font-black text-white shadow-md transition active:scale-98 cursor-pointer"
            >
              <FiRotateCcw className="text-sm" />
              <span>
                {locale === 'ar'
                  ? 'تعديل الإجابات والمحاولة مجدداً'
                  : 'Corriger mes réponses (sans recommencer de zéro)'}
              </span>
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {/* Progress indicator with percentage bar */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                <span>
                  {answeredCount} sur {totalCount} questions répondues
                </span>
                <span className="text-emerald-700 flex items-center gap-1 font-bold">
                  <FiShield className="text-xs" />
                  Score requis: 75%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-700 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Questions list */}
            {questions.map((q, qIdx) => {
              const qText = locale === 'ar' ? q.questionAr : q.questionFr;
              const options = locale === 'ar' ? q.optionsAr : q.optionsFr;
              const isAnswered = answers[qIdx] !== undefined;

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl p-4 border transition ${
                    isAnswered
                      ? 'bg-slate-50/80 border-brand-300'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black text-brand-700 uppercase tracking-wider">
                      Question {qIdx + 1}
                    </span>
                    {isAnswered && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <FiCheck className="text-[10px]" /> Répondu
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {qText}
                  </h4>
                  <div className="mt-3 space-y-2">
                    {options.map((opt, oIdx) => {
                      const isSelected = answers[qIdx] === oIdx;
                      return (
                        <label
                          key={oIdx}
                          className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition ${
                            isSelected
                              ? 'bg-brand-50 border-brand-700 text-brand-950 font-bold shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question_${qIdx}`}
                            checked={isSelected}
                            onChange={() => handleSelect(qIdx, oIdx)}
                            className="mt-0.5 accent-brand-700 h-4 w-4 shrink-0"
                          />
                          <span className="leading-snug">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="pt-2">
              <button
                onClick={handleValidate}
                disabled={!allAnswered || isSubmitting}
                className={`flex items-center justify-center gap-2 w-full rounded-2xl py-3.5 text-xs font-black text-white shadow-md transition cursor-pointer ${
                  allAnswered && !isSubmitting
                    ? 'bg-brand-700 hover:bg-brand-800 active:scale-98'
                    : 'bg-slate-300 cursor-not-allowed opacity-75'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="animate-spin text-sm" />
                    <span>Évaluation en cours...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {locale === 'ar'
                        ? 'تأكيد الإجابات وتفعيل الحساب'
                        : 'Valider mes réponses et activer mon compte'}
                    </span>
                    <FiArrowRight className="text-sm" />
                  </>
                )}
              </button>
              {!allAnswered && (
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  Veuillez cocher une réponse pour chaque question pour valider.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
