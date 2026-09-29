export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vzrmunzfkftydvgmylvu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

// Secure question bank stored only on the server
const QUALIFICATION_QUESTIONS = [
  {
    id: 1,
    questionFr: "Que devez-vous faire si un client vous demande d'échanger des coordonnées hors plateforme (WhatsApp/Numéro personnel) avant l'attribution ?",
    questionAr: "ماذا تفعل إذا طلب منك العميل التواصل خارج المنصة (واتساب أو هاتف شخصي) قبل تعيين المهمة؟",
    optionsFr: [
      "Refuser poliment et continuer la communication via le chat sécurisé de tâches.ma pour garantir la protection du séquestre.",
      "Lui envoyer immédiatement mon numéro WhatsApp personnel.",
      "Accepter uniquement s'il propose un paiement par Cash Plus hors plateforme."
    ],
    optionsAr: [
      "الرفض بأدب ومواصلة التواصل عبر المحادثة الآمنة في الموقع لضمان حماية الضمان المالي.",
      "إرسال رقم الواتساب الشخصي فوراً.",
      "الموافقة فقط إذا اقترح الدفع نقداً خارج الموقع."
    ],
    correctOptionIndex: 0,
  },
  {
    id: 2,
    questionFr: "Quel est le délai maximum de livraison après attribution d'une mission ?",
    questionAr: "ما هو الأجل الأقصى لتسليم العمل بعد تعيين المهمة؟",
    optionsFr: [
      "Quand je le souhaite, sans contrainte de temps.",
      "Le délai spécifié sur la fiche de la tâche (ex: 24h) sous peine d'annulation.",
      "Une semaine après la date prévue."
    ],
    optionsAr: [
      "في أي وقت أشاء دون التزام بوقت محدد.",
      "المدة المحددة بدقة في بطاقة المهمة (مثلاً: 24 ساعة) لتفادي إلغاء المهمة.",
      "أسبوع بعد التاريخ المحدد."
    ],
    correctOptionIndex: 1,
  },
  {
    id: 3,
    questionFr: "Quelles sont les conditions nécessaires pour débloquer les gains versés sous séquestre (Daman) ?",
    questionAr: "ما هي الشروط اللازمة لتحرير الأرباح المحفوظة تحت الضمان (Daman)؟",
    optionsFr: [
      "Livrer l'ensemble des preuves/fichiers demandés et obtenir l'approbation du client ou de l'arbitrage.",
      "Dès que j'ai postulé à la tâche.",
      "Uniquement après avoir payé des frais d'adhésion supplémentaires."
    ],
    optionsAr: [
      "تسليم جميع الإثباتات والملفات المطلوبة والحصول على موافقة العميل أو لجنة التحكيم.",
      "بمجرد التقدم للمهمة.",
      "فقط بعد دفع رسوم اشتراك إضافية."
    ],
    correctOptionIndex: 0,
  },
  {
    id: 4,
    questionFr: "Que faire si un imprévu vous empêche de terminer la tâche dans les délais ?",
    questionAr: "ماذا تفعل إذا طرأ ظرف يمنعك من إكمال المهمة في الوقت المحدد؟",
    optionsFr: [
      "Ne plus répondre au client et abandonner la tâche.",
      "Prévenir immédiatement le client via la messagerie pour convenir d'un délai ou annuler proprement.",
      "Envoyer des fichiers vides pour faire semblant d'avoir terminé."
    ],
    optionsAr: [
      "تجاهل العميل والتوقف عن الرد.",
      "إبلاغ العميل فوراً عبر الرسائل لطلب تمديد مهلة أو الإلغاء بشكل لائق.",
      "إرسال ملفات فارغة لادعاء إتمام العمل."
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
    const { userId, answers } = await req.json();

    if (!userId || !answers || typeof answers !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Paramètres manquants' },
        { status: 400 }
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

    if (passed && userId.includes('-')) {
      const admin = getAdminClient();
      await admin
        .from('profiles')
        .update({
          passed_qualification: true,
          performer_tier: 'level_1',
        })
        .eq('id', userId);
    }

    return NextResponse.json({
      success: true,
      passed,
      scorePercent,
      correctCount,
      total,
      message: passed
        ? 'Félicitations ! Vous avez réussi le test de qualification.'
        : 'Score insuffisant. Veuillez relire la charte de qualité et réessayer.',
    });
  } catch (err: any) {
    console.error('Qualification evaluation error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
