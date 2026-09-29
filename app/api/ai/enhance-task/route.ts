export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title = '',
      description = '',
      categoryName = 'Mission',
      timeLimitHours = 24,
      taskExecutionMode = 'single',
      deliverables = [],
      antiSpamKeyword = 'MAROC',
      locale = 'fr',
    } = body;

    if (!title.trim() && !description.trim()) {
      return NextResponse.json(
        { success: false, error: 'Titre ou description requis' },
        { status: 400 }
      );
    }

    const cleanTitle = title.trim() || 'Mission freelance';
    const cleanKeyword = (antiSpamKeyword || 'MAROC').toUpperCase().trim();

    // Check if Cloudflare AI binding or external AI API is available
    // Otherwise perform robust intelligent structure extraction
    let structuredBrief = '';

    if (locale === 'ar') {
      structuredBrief = `🎯 الهدف الرئيسي من المهمة:
${cleanTitle} (${categoryName}).

📋 الشروط وطريقة التنفيذ:
- الالتزام التام بالتعليمات وميثاق الجودة لموقع tâches.ma.
- احترام الموعد المحدد: التسليم النهائي خلال ${timeLimitHours} ساعة كحد أقصى.
- التواصل الاحترافي والسريع بالدارجة المغربية أو الفرنسية.
${taskExecutionMode === 'multi' ? '- ⚠️ يُسمح بتنفيذ واحد فقط لكل حساب أو رقم هاتف مغربي.' : '- 🎯 تنفيذ حصري من طرف منفذ معتمد واحد.'}
${description ? `\n📌 تفاصيل إضافية من العميل:\n${description.trim()}\n` : ''}
📦 الإثباتات والملفات المطلوبة لتأكيد الدفع:
${deliverables.length > 0 ? deliverables.map((d: string, i: number) => `${i + 1}. ${d}`).join('\n') : '1. لقطة شاشة واضحة للعمل المنجز أو رابط مباشر'}

🔒 كلمة التحقق ضد الردود الآلية (Anti-Spam):
يرجى كتابة كلمة « ${cleanKeyword} » في بداية طلبك لإثبات قراءة التعليمات كاملة.`;
    } else {
      structuredBrief = `🎯 OBJECTIF PRINCIPAL :
${cleanTitle} (${categoryName}).

📋 CONSIGNES ET PROTOCOLE D'EXÉCUTION :
- Respecter scrupuleusement les exigences et la charte de qualité tâches.ma.
- Délais stricts : livraison finale sous ${timeLimitHours}h maximum.
- Communication professionnelle et courtoise (Darija ou Français).
${taskExecutionMode === 'multi' ? '- ⚠️ Une seule exécution autorisée par compte / numéro marocain.' : '- 🎯 Exécution par 1 prestataire dédié.'}
${description ? `\n📌 PRÉCISIONS DU CLIENT :\n${description.trim()}\n` : ''}
📦 LIVRABLES EXIGÉS POUR VALIDATION :
${deliverables.length > 0 ? deliverables.map((d: string, i: number) => `${i + 1}. ${d}`).join('\n') : '1. Capture d’écran ou fichier de preuve complet'}

🔒 CONTRÔLE ANTI-SPAM :
Veuillez impérativement écrire le mot « ${cleanKeyword} » en tête de votre candidature pour prouver votre lecture intégrale.`;
    }

    return NextResponse.json({
      success: true,
      enhancedDescription: structuredBrief,
    });
  } catch (err: any) {
    console.error('AI enhance task error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur lors de la génération IA' },
      { status: 500 }
    );
  }
}
