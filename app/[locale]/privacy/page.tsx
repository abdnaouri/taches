export const runtime = 'edge';

import { Header } from '@/components/Header';
import { WorkzillaFooter } from '@/components/WorkzillaLandingSections';
import { FiShield, FiLock } from 'react-icons/fi';

export default function PrivacyPage({ params }: { params: { locale: string } }) {
  const locale = params.locale || 'fr';

  return (
    <div className="min-h-screen bg-surface-soft text-slate-900 flex flex-col justify-between">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
          <div className="border-b border-slate-100 pb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-800 px-3 py-1 text-xs font-bold mb-3 border border-emerald-200">
              <FiLock className="text-emerald-600" />
              <span>Protection des Données Personnelles (Loi 09-08 / CNDP)</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900">
              Politique de Confidentialité & Protection de la Vie Privée
            </h1>
            <p className="text-xs text-slate-500 mt-2">Conforme aux directives de la Commission Nationale de contrôle de la protection des Données à caractère Personnel (CNDP Maroc)</p>
          </div>

          <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">1. Collecte des Données Personnelles</h2>
            <p>
              Tâches.ma collecte uniquement les données strictement nécessaires au bon fonctionnement de la mise en relation et du traitement des paiements (nom, prénom, adresse email, numéro de téléphone, justificatif de domicile/CIN pour les profils certifiés, coordonnées bancaires RIB pour les virements).
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">2. Utilisation & Finalité du Traitement</h2>
            <p>
              Les données collectées sont utilisées pour la gestion des comptes utilisateurs, la vérification anti-fraude, la sécurisation des séquestres financiers et l'envoi de notifications opérationnelles par email et SMS/WhatsApp. Aucune donnée n'est cédée ou vendue à des tiers commerciaux.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">3. Sécurité des Transactions Financières</h2>
            <p>
              Toutes les données sensibles (numéros de carte, pièces d'identité, RIB marocain) sont transmises via des protocoles chiffrés SSL/TLS 256 bits et stockées sur des serveurs sécurisés conformes aux normes de sécurité bancaires internationales.
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">4. Vos Droits d'Accès et de Rectification</h2>
            <p>
              Conformément à la loi marocaine n° 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel, vous disposez d'un droit d'accès, de rectification et d'opposition sur vos données en nous contactant à support@taches.ma.
            </p>
          </section>
        </div>
      </main>

      <WorkzillaFooter />
    </div>
  );
}
