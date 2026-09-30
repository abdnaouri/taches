export const runtime = 'edge';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { WorkzillaFooter } from '@/components/WorkzillaLandingSections';
import {
  FiShield,
  FiLock,
  FiCheckCircle,
  FiArrowRight,
  FiDollarSign,
  FiRefreshCw,
  FiUsers
} from 'react-icons/fi';

export default function DamanEscrowPage({ params }: { params: { locale: string } }) {
  const locale = params.locale || 'fr';

  return (
    <div className="min-h-screen bg-surface-soft text-slate-900 flex flex-col justify-between">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl mb-10 relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold">
              <FiShield className="text-emerald-400" />
              <span>Garantie Financière 100% Marocaine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Le Séquestre Daman : La Protection Absolue de Vos Projets
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Le système Daman protège équitablement le client et le freelance au Maroc. Fini le risque d'acompte sans livraison ou de travail rendu sans paiement.
            </p>
          </div>
        </div>

        {/* 3 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-brand-50 text-brand-700 font-black text-lg flex items-center justify-center border border-brand-200">
              1
            </div>
            <h3 className="font-extrabold text-base text-slate-900">1. Dépôt Garanti</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Le donneur d'ordre dépose le budget en Dirhams (MAD). Les fonds sont conservés sous séquestre neutre et ne sont pas débités vers le prestataire.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-brand-50 text-brand-700 font-black text-lg flex items-center justify-center border border-brand-200">
              2
            </div>
            <h3 className="font-extrabold text-base text-slate-900">2. Exécution Sereine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Le freelance commence le travail avec la certitude que la rémunération est réservée et disponible.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 font-black text-lg flex items-center justify-center border border-emerald-200">
              3
            </div>
            <h3 className="font-extrabold text-base text-slate-900">3. Validation & Déblocage</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Après examen des preuves et fichiers livrés, le client clique sur "Valider" et les fonds sont débloqués immédiatement.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-2xs space-y-6">
          <h2 className="text-2xl font-black text-slate-900">Questions Fréquentes sur Daman</h2>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700">
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
              <h4 className="font-bold text-slate-900 mb-1">Que se passe-t-il si le travail n'est pas livré dans les temps ?</h4>
              <p className="text-slate-600">Le client peut annuler la commande et récupérer 100% de son dépôt directement sur son solde disponible sans frais.</p>
            </div>

            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
              <h4 className="font-bold text-slate-900 mb-1">Que se passe-t-il si le travail est non conforme au brief ?</h4>
              <p className="text-slate-600">Le client peut d'abord demander une retouche gratuite, ou ouvrir un arbitrage. Nos médiateurs examinent les preuves et tranchent sous 24h.</p>
            </div>
          </div>

          <div className="pt-4 text-center">
            <Link
              href={`/${locale}/tasks`}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-700 hover:bg-brand-800 text-white px-6 py-3 text-xs font-bold shadow-md transition"
            >
              <span>Découvrir les missions en cours</span>
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </main>

      <WorkzillaFooter />
    </div>
  );
}
