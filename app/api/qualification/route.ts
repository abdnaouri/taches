export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getAuthenticatedUser } from '@/lib/auth/serverAuth';

// Secure Workzilla-grade question bank stored only on the server
const QUALIFICATION_QUESTIONS = [
  {
    id: 1,
    category: "charter",
    questionFr: "Que devez-vous faire si un client vous demande d'échanger des coordonnées hors plateforme (WhatsApp/Numéro personnel) avant l'attribution ?",
    questionAr: "ماذا تفعل إذا طلب منك العميل التواصل خارج المنصة (واتساب أو هاتف شخصي) قبل تعيين المهمة؟",
    optionsFr: [
      "Refuser poliment et continuer la communication via la messagerie sécurisée de tâches.ma pour garantir la protection du séquestre Daman.",
      "Lui envoyer immédiatement mon numéro WhatsApp personnel.",
      "Accepter uniquement s'il propose un paiement par Cash Plus ou virement direct hors plateforme."
    ],
    optionsAr: [
      "الرفض بأدب ومواصلة التواصل عبر المحادثة الآمنة في الموقع لضمان حماية الضمان المالي Daman.",
      "إرسال رقم الواتساب الشخصي فوراً.",
      "الموافقة فقط إذا اقترح الدفع نقداً أو تحويلاً خارج الموقع."
    ],
    correctOptionIndex: 0,
  },
  {
    id: 2,
    category: "timelines",
    questionFr: "Quel est le délai maximum de livraison après attribution d'une mission ?",
    questionAr: "ما هو الأجل الأقصى لتسليم العمل بعد تعيين المهمة؟",
    optionsFr: [
      "Quand je le souhaite, sans contrainte de temps.",
      "Le délai spécifié sur la fiche de la mission (ex: 24h) sous peine d'annulation et pénalité de score.",
      "Une semaine après la date prévue."
    ],
    optionsAr: [
      "في أي وقت أشاء دون التزام بوقت محدد.",
      "المدة المحددة بدقة في بطاقة المهمة (مثلاً: 24 ساعة) لتفادي إلغاء المهمة وتراجع التقييم.",
      "أسبوع بعد التاريخ المحدد."
    ],
    correctOptionIndex: 1,
  },
  {
    id: 3,
    category: "escrow",
    questionFr: "Quelles sont les conditions nécessaires pour débloquer les gains versés sous séquestre (Daman) ?",
    questionAr: "ما هي الشروط اللازمة لتحرير الأرباح المحفوظة تحت الضمان (Daman)؟",
    optionsFr: [
      "Téléverser l'ensemble des livrables/preuves demandés et obtenir l'approbation du client ou de l'arbitrage.",
      "Dès que j'ai déposé ma candidature à la mission.",
      "Uniquement après avoir payé des frais d'adhésion supplémentaires."
    ],
    optionsAr: [
      "رفع جميع الإثباتات والملفات المطلوبة والحصول على موافقة العميل أو لجنة التحكيم.",
      "بمجرد التقدم للمهمة.",
      "فقط بعد دفع رسوم اشتراك إضافية."
    ],
    correctOptionIndex: 0,
  },
  {
    id: 4,
    category: "web_search",
    questionFr: "Test de recherche web : Quel est l'identifiant fiscal obligatoire à 15 chiffres requis sur toute facture d'entreprise au Maroc ?",
    questionAr: "اختبار البحث والدقة: ما هو المعرف الضريبي الإلزامي المكون من 15 رقماً المطلوب في كل فاتورة تجارية بالمغرب؟",
    optionsFr: [
      "L'Identifiant Commun de l'Entreprise (ICE)",
      "Le numéro de Registre de Commerce (RC à 5 chiffres)",
      "Le code postal de Casablanca"
    ],
    optionsAr: [
      "المعرف الموحد للمقاولة (ICE)",
      "رقم السجل التجاري (RC)",
      "الرمز البريدي للدار البيضاء"
    ],
    correctOptionIndex: 0,
  },
  {
    id: 5,
    category: "quality",
    questionFr: "Test de recherche web : Sur quel portail officiel un auto-entrepreneur marocain déclare-t-il son chiffre d'affaires trimestriel ?",
    questionAr: "اختبار البحث: عبر أي بوابة رسمية يصرح المقاول الذاتي في المغرب برقم معاملاته الفصلي؟",
    optionsFr: [
      "Portail officiel de la DGI / Barid Al-Maghrib (rn.ae.gov.ma)",
      "Sur les réseaux sociaux Facebook",
      "Par email au support technique de tâches.ma"
    ],
    optionsAr: [
      "البوابة الرسمية للمقاول الذاتي التابعة لبريد المغرب (rn.ae.gov.ma)",
      "على مواقع التواصل الاجتماعي",
      "عبر إرسال بريد إلكتروني للدعم الفني للمنصة"
    ],
    correctOptionIndex: 0,
  },
  {
    id: 6,
    category: "dispute",
    questionFr: "Que faire si un imprévu vous empêche de terminer la mission dans le délai convenu ?",
    questionAr: "ماذا تفعل إذا طرأ ظرف طارئ يمنعك من إكمال المهمة في الوقت المحدد؟",
    optionsFr: [
      "Ne plus répondre au client et abandonner la mission.",
      "Prévenir immédiatement le client via la messagerie officielle pour convenir d'un délai ou demander une annulation à l'amiable.",
      "Envoyer des fichiers vides pour faire semblant d'avoir terminé avant le compte à rebours."
    ],
    optionsAr: [
      "تجاهل العميل والتوقف عن الرد.",
      "إبلاغ العميل فوراً عبر الرسائل الرسمية لطلب تمديد مهلة أو طلب إلغاء بالتراضي.",
      "إرسال ملفات فارغة لادعاء إتمام العمل قبل انتهاء العداد."
    ],
    correctOptionIndex: 1,
  },
];

export async function GET() {
  // Return questions without the correct answers
  const publicQuestions = QUALIFICATION_QUESTIONS.map(q => ({
    id: q.id,
    questionFr: q.questionFr,
    questionAr: q.questionAr,
    optionsFr: q.optionsFr,
    optionsAr: q.optionsAr,
  }));

  return NextResponse.json({
    success: true,
    questions: publicQuestions,
  });
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);
    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Authentification requise pour valider le test de qualification.' },
        { status: 401 }
      );
    }

    const { answers } = await req.json();

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Réponses manquantes' },
        { status: 400 }
      );
    }

    const userId = authResult.user.id;
    const admin = getAdminClient();

    // Check cooldown status from user profile
    const { data: userProf } = await admin
      .from('profiles')
      .select('qualification_retry_after, passed_qualification')
      .eq('id', userId)
      .single();

    if (userProf?.passed_qualification) {
      return NextResponse.json({
        success: true,
        alreadyPassed: true,
        passed: true,
        message: 'Vous avez déjà validé votre test de qualification.',
      });
    }

    if (userProf?.qualification_retry_after && new Date(userProf.qualification_retry_after) > new Date()) {
      const waitHours = Math.ceil((new Date(userProf.qualification_retry_after).getTime() - Date.now()) / (3600 * 1000));
      return NextResponse.json(
        {
          success: false,
          inCooldown: true,
          retryAfter: userProf.qualification_retry_after,
          error: `Délai de révision requis (Standard Workzilla). Vous pourrez repasser le test dans ${waitHours} heure(s).`,
        },
        { status: 429 }
      );
    }

    let correctCount = 0;
    const total = QUALIFICATION_QUESTIONS.length;

    QUALIFICATION_QUESTIONS.forEach((q, idx) => {
      if (answers[idx] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / total) * 100);
    const passed = scorePercent >= 75;

    if (passed) {
      await admin
        .from('profiles')
        .update({
          passed_qualification: true,
          performer_tier: 'level_1',
          qualification_retry_after: null,
        })
        .eq('id', userId);
    } else {
      // Workzilla 24h lockout cooldown penalty
      const cooldownTimestamp = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      await admin
        .from('profiles')
        .update({
          qualification_retry_after: cooldownTimestamp,
        })
        .eq('id', userId);
    }

    return NextResponse.json({
      success: true,
      passed,
      scorePercent,
      correctCount,
      total,
      retryAfter: !passed ? new Date(Date.now() + 24 * 3600 * 1000).toISOString() : null,
      message: passed
        ? 'Félicitations ! Vous avez réussi le test de qualification.'
        : 'Score insuffisant. Conformément aux règles de qualité Workzilla, un délai de 24h est requis avant une nouvelle tentative.',
    });
  } catch (err: any) {
    console.error('Qualification evaluation error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
