export const runtime = 'edge';

import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { WorkzillaFooter } from '@/components/WorkzillaLandingSections';
import { FiShield, FiLock } from 'react-icons/fi';

interface PrivacyPageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params }: PrivacyPageProps): Promise<Metadata> {
  const locale = params.locale || 'fr';
  const isAr = locale === 'ar';
  const baseUrl = 'https://taches.ma';

  return {
    title: isAr
      ? 'سياسة الخصوصية وحماية المعطيات الشخصية | tâches.ma'
      : 'Politique de Confidentialité & Protection des Données (CNDP) | tâches.ma',
    description: isAr
      ? 'سياسة الخصوصية وحماية المعطيات ذات الطابع الشخصي وفقاً للقانون 09-08 وتوجيهات CNDP في المغرب.'
      : 'Politique de confidentialité et engagements de protection des données personnelles sur tâches.ma conformes à la loi marocaine 09-08 / CNDP.',
    alternates: {
      canonical: `${baseUrl}/${locale}/privacy`,
      languages: {
        'x-default': `${baseUrl}/fr/privacy`,
        'fr-MA': `${baseUrl}/fr/privacy`,
        'ar-MA': `${baseUrl}/ar/privacy`,
      },
    },
    openGraph: {
      title: isAr ? 'سياسة الخصوصية | tâches.ma' : 'Politique de Confidentialité | tâches.ma',
      description: isAr
        ? 'حماية المعطيات ذات الطابع الشخصي وفقاً للقانون المغربي 09-08.'
        : 'Protection des données personnelles conformément à la loi marocaine 09-08 (CNDP).',
      url: `${baseUrl}/${locale}/privacy`,
      siteName: 'tâches.ma',
      locale: isAr ? 'ar_MA' : 'fr_MA',
      type: 'website',
    },
  };
}

export default function PrivacyPage({ params }: PrivacyPageProps) {
  const locale = params.locale || 'fr';
  const isAr = locale === 'ar';

  return (
    <div className="min-h-screen bg-surface-soft text-slate-900 flex flex-col justify-between" dir={isAr ? 'rtl' : 'ltr'}>
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
          <div className="border-b border-slate-100 pb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-800 px-3 py-1 text-xs font-bold mb-3 border border-emerald-200">
              <FiLock className="text-emerald-600" />
              <span>
                {isAr
                  ? 'حماية المعطيات ذات الطابع الشخصي (قانون 09-08 / CNDP)'
                  : 'Protection des Données Personnelles (Loi 09-08 / CNDP)'}
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900">
              {isAr
                ? 'سياسة الخصوصية وحماية الحياة الخاصة'
                : 'Politique de Confidentialité & Protection de la Vie Privée'}
            </h1>
            <p className="text-xs text-slate-500 mt-2">
              {isAr
                ? 'متوافق مع توجيهات اللجنة الوطنية لمراقبة حماية المعطيات ذات الطابع الشخصي (CNDP المغرب)'
                : 'Conforme aux directives de la Commission Nationale de contrôle de la protection des Données à caractère Personnel (CNDP Maroc)'}
            </p>
          </div>

          <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">
              {isAr ? '1. جمع المعطيات الشخصية' : '1. Collecte des Données Personnelles'}
            </h2>
            <p>
              {isAr
                ? 'تجمع tâches.ma فقط البيانات الضرورية لتشغيل خدمة الوساطة ومعالجة المدفوعات (الاسم، اللقب، البريد الإلكتروني، رقم الهاتف، إثبات الهوية/CIN للحسابات الموثقة، والحساب البنكي RIB للتحويلات).'
                : 'Tâches.ma collecte uniquement les données strictement nécessaires au bon fonctionnement de la mise en relation et du traitement des paiements (nom, prénom, adresse email, numéro de téléphone, justificatif de domicile/CIN pour les profils certifiés, coordonnées bancaires RIB pour les virements).'}
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">
              {isAr ? '2. الغرض واستخدام المعطيات' : '2. Utilisation & Finalité du Traitement'}
            </h2>
            <p>
              {isAr
                ? 'تُستخدم البيانات لإدارة حسابات المستخدمين، مكافحة الاحتيال، تأمين الضمان المالي Daman، وإرسال الإشعارات التشغيلية. لا يتم بيع أو تأجير أي بيانات لأطراف تجارية ثالثة.'
                : 'Les données collectées sont utilisées pour la gestion des comptes utilisateurs, la vérification anti-fraude, la sécurisation des séquestres financiers et l\'envoi de notifications opérationnelles par email et SMS/WhatsApp. Aucune donnée n\'est cédée ou vendue à des tiers commerciaux.'}
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">
              {isAr ? '3. أمن المعاملات المالية' : '3. Sécurité des Transactions Financières'}
            </h2>
            <p>
              {isAr
                ? 'تُنقل جميع البيانات الحساسة (أرقام البطاقات، وثائق الهوية، RIB) عبر بروتوكولات مشفرة SSL/TLS 256-bit وتُخزن في خوادم آمنة متوافقة مع معايير الأمان المصرفي.'
                : 'Toutes les données sensibles (numéros de carte, pièces d\'identité, RIB marocain) sont transmises via des protocoles chiffrés SSL/TLS 256 bits et stockées sur des serveurs sécurisés conformes aux normes de sécurité bancaires internationales.'}
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">
              {isAr ? '4. حقوق الوصول والتصحيح' : '4. Vos Droits d\'Accès et de Rectification'}
            </h2>
            <p>
              {isAr
                ? 'وفقاً للقانون المغربي رقم 09-08، يحق للمستخدمين الوصول إلى بياناتهم وتصحيحها أو الاعتراض عليها عبر التواصل مع support@taches.ma.'
                : 'Conformément à la loi marocaine n° 09-08 relative à la protection des personnes physiques à l\'égard du traitement des données à caractère personnel, vous disposez d\'un droit d\'accès, de rectification et d\'opposition sur vos données en nous contactant à support@taches.ma.'}
            </p>
          </section>
        </div>
      </main>

      <WorkzillaFooter />
    </div>
  );
}
