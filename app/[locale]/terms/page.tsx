export const runtime = 'edge';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { WorkzillaFooter } from '@/components/WorkzillaLandingSections';
import { FiShield, FiFileText } from 'react-icons/fi';

export default function TermsPage({ params }: { params: { locale: string } }) {
  const locale = params.locale || 'fr';

  return (
    <div className="min-h-screen bg-surface-soft text-slate-900 flex flex-col justify-between">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
          <div className="border-b border-slate-100 pb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 text-brand-700 px-3 py-1 text-xs font-bold mb-3 border border-brand-200">
              <FiFileText />
              <span>Conditions Générales d'Utilisation (CGU)</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900">
              Conditions Générales d'Utilisation & Charte de Séquestre Tâches.ma
            </h1>
            <p className="text-xs text-slate-500 mt-2">Dernière mise à jour : 30 septembre 2026 • Conforme au droit marocain (Loi 31-08 et Loi 09-08)</p>
          </div>

          <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">1. Objet de la plateforme</h2>
            <p>
              Tâches.ma est une plateforme numérique marocaine de mise en relation entre donneurs d'ordre (clients) et prestataires indépendants (freelances, auto-entrepreneurs, micro-prestataires). Elle fournit une infrastructure sécurisée de commande, de suivi de livrables et de séquestre financier Daman.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">2. Fonctionnement du Séquestre Garanti (Daman)</h2>
            <p>
              Lors de la publication ou de l'attribution d'une tâche, le montant total convenu en Dirhams marocains (MAD) est bloqué sur le compte de séquestre sécurisé. Les fonds ne sont libérés en faveur du prestataire qu'après validation expresse du travail rendu par le client, ou suite à une décision de la commission d'arbitrage.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">3. Engagements des Prestataires & Clients</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Le prestataire s'engage à livrer des travaux conformes aux spécifications du cahier des charges et dans les délais convenus.</li>
              <li>Le client s'engage à vérifier les livrables dans un délai maximal de 72h après remise de la preuve de travail.</li>
              <li>Les communications et échanges financiers relatifs aux missions doivent obligatoirement transiter par la plateforme pour bénéficier de la protection Daman.</li>
            </ul>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">4. Commissions et Frais de Retrait</h2>
            <p>
              La plateforme prélève une commission transparente de 15% sur les rémunérations débloquées pour couvrir les frais d'arbitrage, d'infrastructure et de maintenance. Les retraits vers les comptes bancaires marocains (RIB) sont exécutés sous 24h ouvrées.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">5. Médiation & Arbitrage</h2>
            <p>
              En cas de contestation sur la conformité d'un livrable, chaque partie peut solliciter l'intervention des arbitres Tâches.ma. La commission examine le brief initial, les fichiers déposés et l'historique des échanges pour rendre une décision impartiale (remboursement intégral, déblocage ou retouche obligatoire).
            </p>
          </section>
        </div>
      </main>

      <WorkzillaFooter />
    </div>
  );
}
