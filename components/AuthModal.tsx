'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { UserRole } from '@/types/database';
import {
  FiX,
  FiMail,
  FiLock,
  FiUser,
  FiArrowRight,
  FiCheckCircle,
  FiAlertCircle,
  FiBriefcase,
  FiShield,
  FiEye,
  FiEyeOff,
  FiZap
} from 'react-icons/fi';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    authPromptMessage,
    closeAuthModal,
    signIn,
    signUp,
    openAuthModal,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync mode with context state when opening
  React.useEffect(() => {
    setMode(authModalMode);
    setError(null);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await signIn(email, password);
        if (!res.success) {
          setError(res.error || 'Identifiants invalides. Veuillez réessayer.');
        }
      } else {
        if (!fullName.trim()) {
          setError('Veuillez renseigner votre nom complet.');
          setLoading(false);
          return;
        }
        const res = await signUp(email, password, fullName, role);
        if (!res.success) {
          setError(res.error || 'Impossible de créer le compte. Veuillez réessayer.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur inattendue est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await signIn('aero@example.com', 'password123');
      if (!res.success) {
        setError('Impossible de se connecter au compte de démonstration.');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion démo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
          aria-label="Fermer"
        >
          <FiX className="text-lg" />
        </button>

        {/* Modal Brand Logo & Header */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-700 text-white font-black text-xl shadow-md mb-3">
            T
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {mode === 'login' ? 'Connexion à votre compte' : 'Créer un compte'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login'
              ? 'Accédez à votre espace tâches et votre portefeuille Daman'
              : 'Rejoignez la communauté de micro-services n°1 au Maroc'}
          </p>
        </div>

        {/* Prompt Contextual Banner (e.g. "Connectez-vous pour publier une tâche") */}
        {authPromptMessage && (
          <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-brand-50 border border-brand-200/80 p-3 text-xs text-brand-900 font-semibold">
            <FiShield className="text-brand-700 text-base shrink-0" />
            <span>{authPromptMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
            <FiAlertCircle className="text-rose-600 text-base shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {/* Mode Switch Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-5 border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Créer un compte
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nom complet
              </label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Mehdi Bennani"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-brand-700 focus:ring-1 focus:ring-brand-700"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Adresse e-mail
            </label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-brand-700 focus:ring-1 focus:ring-brand-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Au moins 6 caractères"
                className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-xs text-slate-900 outline-none transition focus:border-brand-700 focus:ring-1 focus:ring-brand-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Vous souhaitez principalement
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('CUSTOMER')}
                  className={`flex flex-col items-center p-3 rounded-xl border text-center transition cursor-pointer ${
                    role === 'CUSTOMER'
                      ? 'border-brand-700 bg-brand-50 text-brand-900 ring-2 ring-brand-700/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FiBriefcase className={`text-base mb-1 ${role === 'CUSTOMER' ? 'text-brand-700' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Publier des tâches</span>
                  <span className="text-[10px] text-slate-500">Mode Client</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('PERFORMER')}
                  className={`flex flex-col items-center p-3 rounded-xl border text-center transition cursor-pointer ${
                    role === 'PERFORMER'
                      ? 'border-brand-700 bg-brand-50 text-brand-900 ring-2 ring-brand-700/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FiCheckCircle className={`text-base mb-1 ${role === 'PERFORMER' ? 'text-brand-700' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Réaliser des missions</span>
                  <span className="text-[10px] text-slate-500">Mode Prestataire</span>
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-bold py-3 text-xs sm:text-sm shadow-md transition-all active:scale-98 cursor-pointer mt-2"
          >
            {loading ? (
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Se connecter' : 'Créer mon compte'}</span>
                <FiArrowRight className="text-sm" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Option */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 py-2.5 px-3 text-xs font-bold transition cursor-pointer"
          >
            <FiZap className="text-amber-500 text-sm" />
            <span>Connexion rapide Démo (Aero Mehdi)</span>
          </button>
        </div>

        {/* Security / Moroccan Escrow Guarantee Footer */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <FiShield className="text-emerald-600" />
          <span>Sécurité Daman • Données chiffrées Supabase</span>
        </div>
      </div>
    </div>
  );
};
