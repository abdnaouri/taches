export const runtime = 'edge';

import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { WorkzillaFooter } from '@/components/WorkzillaLandingSections';
import { getDamanEscrowSchema } from '@/lib/seoSchema';
import {
  FiShield,
  FiLock,
  FiCheckCircle,
  FiArrowRight,
  FiDollarSign,
  FiRefreshCw,
  FiUsers
} from 'react-icons/fi';

interface DamanPageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params }: DamanPageProps): Promise<Metadata> {
  const locale = params.locale || 'fr';
  const isAr = locale === 'ar';
  const baseUrl = 'https://taches.ma';

  return {
    title: isAr
      ? 'ضمان Séquestre Daman — حماية المدفوعات والصفقات في المغرب | tâches.ma'
      : 'Séquestre Daman — Garantie & Protection des Paiements Freelance Maroc | tâches.ma',
    description: isAr
      ? 'نظام الضمان المالي وسيكستر Daman لحماية صفقات العمل الحر والمصغر في المغرب. أموالك محفوظة ولا تُصرف إلا بعد رضاك التام عن العمل.'
      : 'Le système de séquestre financier Daman protège vos projets freelance et micro-tâches au Maroc. Paiement 100% garanti et débloqué uniquement après votre validation.',
    alternates: {
      canonical: `${baseUrl}/${locale}/daman`,
      languages: {
        'x-default': `${baseUrl}/fr/daman`,
        'fr-MA': `${baseUrl}/fr/daman`,
        'ar-MA': `${baseUrl}/ar/daman`,
      },
    },
    openGraph: {
      title: isAr
        ? 'ضمان Séquestre Daman | tâches.ma'
        : 'Séquestre Daman — Protection Freelance Maroc | tâches.ma',
      description: isAr
        ? 'حماية مالية 100% للعميل والمستقل في المغرب مع ضمان Daman.'
        : 'Paiement garanti sous séquestre Daman pour tous vos projets freelance au Maroc.',
      url: `${baseUrl}/${locale}/daman`,
      siteName: 'tâches.ma',
      locale: isAr ? 'ar_MA' : 'fr_MA',
      type: 'website',
    },
  };
}

export default function DamanEscrowPage({ params }: DamanPageProps) {
  const locale = params.locale || 'fr';
  const isAr = locale === 'ar';
  const damanJsonLd = getDamanEscrowSchema(locale);

  return (
    <div className="min-h-screen bg-surface-soft text-slate-900 flex flex-col justify-between" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Page-Scoped Daman Escrow & HowTo Knowledge Graph Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(damanJsonLd) }}
      />

      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl mb-10 relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold">
              <FiShield className="text-emerald-400" />
              <span>{isAr ? 'ضمان مالي 100% في المغرب' : 'Garantie Financière 100% Marocaine'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              {isAr
                ? 'ضمان Séquestre Daman : الحماية المطلقة لمشاريعكم وأموالكم'
                : 'Le Séquestre Daman : La Protection Absolue de Vos Projets'}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              {isAr
                ? 'يحمي نظام Daman أصحاب الأعمال والمستقلين على حد سواء في المغرب. وداعاً لمخاطر الدفع المسبق دون تسليم أو تسليم العمل دون استلام المستحقات.'
                : 'Le système Daman protège équitablement le client et le freelance au Maroc. Fini le risque d’acompte sans livraison ou de travail rendu sans paiement.'}
            </p>
          </div>
        </div>

        {/* 3 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div id="step-1" className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-brand-50 text-brand-700 font-black text-lg flex items-center justify-center border border-brand-200">
              1
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              {isAr ? '1. إيداع المبلغ المالي' : '1. Dépôt Garanti'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isAr
                ? 'يقوم صاحب العمل بإيداع الميزانية المتفق عليها بالدرهم المغربي (MAD). تبقى الأموال محفوظة بأمان تحت الضمان المحايد ولا تُحول للمنفذ.'
                : 'Le donneur d’ordre dépose le budget en Dirhams (MAD). Les fonds sont conservés sous séquestre neutre et ne sont pas débités vers le prestataire.'}
            </p>
          </div>

          <div id="step-2" className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-brand-50 text-brand-700 font-black text-lg flex items-center justify-center border border-brand-200">
              2
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              {isAr ? '2. تنفيذ العمل بثقة' : '2. Exécution Sereine'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isAr
                ? 'يبدأ المستقل في إنجاز المهمة وهو مطمئن بأن مستحقاته المالية محجوزة وجاهزة للصرف.'
                : 'Le freelance commence le travail avec la certitude que la rémunération est réservée et disponible.'}
            </p>
          </div>

          <div id="step-3" className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 font-black text-lg flex items-center justify-center border border-emerald-200">
              3
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              {isAr ? '3. التحقق وتحرير الدفع' : '3. Validation & Déblocage'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isAr
                ? 'بعد فحص الملفات والنتائج المسلمة، يضغط العميل على "تأكيد واستلام" ليتم تحويل الأرباح فوراً لمحفظة المنفذ.'
                : 'Après examen des preuves et fichiers livrés, le client clique sur "Valider" et les fonds sont débloqués immédiatement.'}
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-2xs space-y-6">
          <h2 className="text-2xl font-black text-slate-900">
            {isAr ? 'أسئلة شائعة حول ضمان Daman' : 'Questions Fréquentes sur Daman'}
          </h2>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700">
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
              <h4 className="font-bold text-slate-900 mb-1">
                {isAr ? 'ماذا يحدث إذا لم يتم تسليم العمل في الوقت المحدد؟' : 'Que se passe-t-il si le travail n’est pas livré dans les temps ?'}
              </h4>
              <p className="text-slate-600">
                {isAr
                  ? 'يمكن لصاحب العمل إلغاء الطلب واستعادة 100% من المبلغ المودع مباشرة إلى رصيده المتاح بدون أي اقتطاعات.'
                  : 'Le client peut annuler la commande et récupérer 100% de son dépôt directement sur son solde disponible sans frais.'}
              </p>
            </div>

            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
              <h4 className="font-bold text-slate-900 mb-1">
                {isAr ? 'ماذا يحدث إذا كان العمل غير مطابق للشروط المتفق عليها؟' : 'Que se passe-t-il si le travail est non conforme au brief ?'}
              </h4>
              <p className="text-slate-600">
                {isAr
                  ? 'يمكن للعميل طلب تعديل مجاني، أو فتح نزاع للتحكيم. يقوم وسطاؤنا بفحص الأدلة والبت في النزاع خلال 24 ساعة.'
                  : 'Le client peut d’abord demander une retouche gratuite, ou ouvrir un arbitrage. Nos médiateurs examinent les preuves et tranchent sous 24h.'}
              </p>
            </div>
          </div>

          <div className="pt-4 text-center">
            <Link
              href={`/${locale}/tasks`}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-700 hover:bg-brand-800 text-white px-6 py-3 text-xs font-bold shadow-md transition"
            >
              <span>{isAr ? 'استكشاف المهام الجارية' : 'Découvrir les missions en cours'}</span>
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </main>

      <WorkzillaFooter />
    </div>
  );
}
