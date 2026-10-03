export const runtime = 'edge';

import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { WorkzillaFooter } from '@/components/WorkzillaLandingSections';
import { FiShield, FiFileText } from 'react-icons/fi';

interface TermsPageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params }: TermsPageProps): Promise<Metadata> {
  const locale = params.locale || 'fr';
  const isAr = locale === 'ar';
  const baseUrl = 'https://taches.ma';

  return {
    title: isAr
      ? 'شروط الاستخدام وميثاق الضمان المالي | tâches.ma'
      : 'Conditions Générales d\'Utilisation & Charte Séquestre | tâches.ma',
    description: isAr
      ? 'الشروط العامة للاستخدام وميثاق حماية المعاملات المالية Daman على منصة tâches.ma وفقاً للقانون المغربي.'
      : 'Conditions Générales d\'Utilisation (CGU) et charte de fonctionnement du séquestre sécurisé Daman sur tâches.ma conformes au droit marocain.',
    alternates: {
      canonical: `${baseUrl}/${locale}/terms`,
      languages: {
        'x-default': `${baseUrl}/fr/terms`,
        'fr-MA': `${baseUrl}/fr/terms`,
        'ar-MA': `${baseUrl}/ar/terms`,
      },
    },
    openGraph: {
      title: isAr ? 'شروط الاستخدام | tâches.ma' : 'Conditions Générales d\'Utilisation | tâches.ma',
      description: isAr
        ? 'الشروط العامة وميثاق الضمان المالي Daman على tâches.ma.'
        : 'Conditions Générales d\'Utilisation et charte de séquestre Daman sur tâches.ma.',
      url: `${baseUrl}/${locale}/terms`,
      siteName: 'tâches.ma',
      locale: isAr ? 'ar_MA' : 'fr_MA',
      type: 'website',
    },
  };
}

export default function TermsPage({ params }: TermsPageProps) {
  const locale = params.locale || 'fr';
  const isAr = locale === 'ar';

  return (
    <div className="min-h-screen bg-surface-soft text-slate-900 flex flex-col justify-between" dir={isAr ? 'rtl' : 'ltr'}>
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
          <div className="border-b border-slate-100 pb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 text-brand-700 px-3 py-1 text-xs font-bold mb-3 border border-brand-200">
              <FiFileText />
              <span>{isAr ? 'شروط الاستخدام العامة (CGU)' : 'Conditions Générales d\'Utilisation (CGU)'}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900">
              {isAr
                ? 'الشروط العامة للاستخدام وميثاق الضمان المالي Séquestre Daman'
                : 'Conditions Générales d\'Utilisation & Charte de Séquestre Tâches.ma'}
            </h1>
            <p className="text-xs text-slate-500 mt-2">
              {isAr
                ? 'آخر تحديث: 30 سبتمبر 2026 • متوافق مع القانون المغربي (قانون 31-08 وقانون 09-08)'
                : 'Dernière mise à jour : 30 septembre 2026 • Conforme au droit marocain (Loi 31-08 et Loi 09-08)'}
            </p>
          </div>

          <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">
              {isAr ? '1. الغرض من المنصة' : '1. Objet de la plateforme'}
            </h2>
            <p>
              {isAr
                ? 'منصة tâches.ma هي سوق رقمي مغربي للربط بين أصحاب المشاريع والشركات (العملاء) والمستقلين والمهنيين المستقلين. توفر المنصة بنية تحتية آمنة لنشر المهام ومتابعة الإنجاز والضمان المالي Daman.'
                : 'Tâches.ma est une plateforme numérique marocaine de mise en relation entre donneurs d\'ordre (clients) et prestataires indépendants (freelances, auto-entrepreneurs, micro-prestataires). Elle fournit une infrastructure sécurisée de commande, de suivi de livrables et de séquestre financier Daman.'}
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">
              {isAr ? '2. آلية الضمان المالي المحمي (Séquestre Daman)' : '2. Fonctionnement du Séquestre Garanti (Daman)'}
            </h2>
            <p>
              {isAr
                ? 'عند إسناد مهمة أو مشروع، يتم تجميد المبلغ الإجمالي المتفق عليه بالدرهم المغربي (MAD) في حساب الضمان المحايد. لا يتم صرف الأموال للمستقل إلا بعد موافقة وتأكيد العميل على جودة العمل المسلم، أو بقرار من لجنة التحكيم.'
                : 'Lors de la publication ou de l\'attribution d\'une tâche, le montant total convenu en Dirhams marocains (MAD) est bloqué sur le compte de séquestre sécurisé. Les fonds ne sont libérés en faveur du prestataire qu\'après validation expresse du travail rendu par le client, ou suite à une décision de la commission d\'arbitrage.'}
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">
              {isAr ? '3. التزامات أصحاب المشاريع والمستقلين' : '3. Engagements des Prestataires & Clients'}
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                {isAr
                  ? 'يلتزم المستقل بتقديم أعمال مطابقة للمواصفات وفي المواعيد الزمنية المحددة.'
                  : 'Le prestataire s\'engage à livrer des travaux conformes aux spécifications du cahier des charges et dans les délais convenus.'}
              </li>
              <li>
                {isAr
                  ? 'يلتزم صاحب العمل بمراجعة العمل المسلم في غضون 72 ساعة كحد أقصى.'
                  : 'Le client s\'engage à vérifier les livrables dans un délai maximal de 72h après remise de la preuve de travail.'}
              </li>
              <li>
                {isAr
                  ? 'يجب أن تمر جميع المراسلات والتحويلات المالية عبر المنصة للاستفادة من حماية Daman.'
                  : 'Les communications et échanges financiers relatifs aux missions doivent obligatoirement transiter par la plateforme pour bénéficier de la protection Daman.'}
              </li>
            </ul>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">
              {isAr ? '4. العمولات والسحب المالي' : '4. Commissions et Frais de Retrait'}
            </h2>
            <p>
              {isAr
                ? 'تقتطع المنصة عمولة شفافة بنسبة 15% على المبالغ المحررة لتغطية تكاليف الحماية والتحكيم والخدمات التشغيلية. تتم معالجة طلبات السحب البنكي نحو الحسابات المغربية (RIB) خلال 24 ساعة عمل.'
                : 'La plateforme prélève une commission transparente de 15% sur les rémunérations débloquées pour couvrir les frais d\'arbitrage, d\'infrastructure et de maintenance. Les retraits vers les comptes bancaires marocains (RIB) sont exécutés sous 24h ouvrées.'}
            </p>
          </section>

          <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">
              {isAr ? '5. الوساطة والتحكيم' : '5. Médiation & Arbitrage'}
            </h2>
            <p>
              {isAr
                ? 'في حالة وجود خلاف حول مطابقة التسليم، يمكن لأي طرف طلب تدخل محكمي tâches.ma. تقوم اللجنة بفحص الشروط الأولية والملفات وسجل المحادثات لإصدار قرار عادل وملزم.'
                : 'En cas de contestation sur la conformité d\'un livrable, chaque partie peut solliciter l\'intervention des arbitres Tâches.ma. La commission examine le brief initial, les fichiers déposés et l\'historique des échanges pour rendre une décision impartiale (remboursement intégral, déblocage ou retouche obligatoire).'}
            </p>
          </section>
        </div>
      </main>

      <WorkzillaFooter />
    </div>
  );
}
