export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getAuthenticatedUser } from '@/lib/auth/serverAuth';

const SUBSCRIPTION_PLANS = [
  {
    planType: '1_MONTH',
    name: 'Pass Mensuel (30 jours)',
    priceDH: 30,
    priceEUR: 3.0,
    badge: 'Standard',
    features: ['Candidatures illimitées pendant 30 jours', 'Accès prioritaire aux missions Express', 'Badge Prestataire Actif'],
  },
  {
    planType: '3_MONTHS',
    name: 'Pass Trimestriel (90 jours)',
    priceDH: 75,
    priceEUR: 7.5,
    popular: true,
    badge: 'Économique (-17%)',
    features: ['Candidatures illimitées pendant 90 jours', 'Commission réduite à 12%', 'Badge Prestataire Vérifié ⭐', 'Support prioritaire WhatsApp'],
  },
  {
    planType: '1_YEAR',
    name: 'Pass Annuel (365 jours)',
    priceDH: 240,
    priceEUR: 24.0,
    badge: 'Pro (-33%)',
    features: ['Candidatures illimitées pendant 1 an', 'Commission réduite à 10%', 'Mise en avant sur le Radar en ligne', 'Certificat officiel Prestataire Tâches.ma'],
  },
];

export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);
    if (!authResult.user) {
      return NextResponse.json({
        success: true,
        plans: SUBSCRIPTION_PLANS,
        subscription: null,
      });
    }

    const supabase = getAdminClient();
    const userId = authResult.user.id;

    const { data: profile } = await supabase
      .from('profiles')
      .select('passed_qualification, subscription_active_until, free_tasks_remaining, balance_available')
      .eq('id', userId)
      .single();

    const now = new Date();
    const hasActiveSub = Boolean(profile?.subscription_active_until && new Date(profile.subscription_active_until) > now);

    const { data: latestSub } = await supabase
      .from('performer_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      success: true,
      plans: SUBSCRIPTION_PLANS,
      hasActiveSubscription: hasActiveSub,
      subscriptionExpiresAt: profile?.subscription_active_until || null,
      freeTasksRemaining: Number(profile?.free_tasks_remaining ?? 3),
      passedQualification: Boolean(profile?.passed_qualification),
      balanceAvailableEUR: Number(profile?.balance_available || 0),
      balanceAvailableDH: Math.round(Number(profile?.balance_available || 0) * 10),
      latestSubscription: latestSub || null,
    });
  } catch (err: any) {
    console.error('Subscriptions GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);
    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentification requise pour souscrire au pass.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { planType } = body;

    const plan = SUBSCRIPTION_PLANS.find((p) => p.planType === planType);
    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Plan d\'abonnement invalide.' },
        { status: 400 }
      );
    }

    const userId = authResult.user.id;
    const supabase = getAdminClient();

    // Call atomic RPC
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('purchase_performer_subscription', {
      p_user_id: userId,
      p_plan_type: plan.planType,
      p_amount_dh: plan.priceDH,
    });

    if (!rpcErr && rpcRes && rpcRes.success) {
      return NextResponse.json({
        success: true,
        message: `Pass ${plan.name} activé avec succès !`,
        expiresAt: rpcRes.expires_at,
      });
    }

    // Fallback: check balance & activate directly
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance_available, subscription_active_until')
      .eq('id', userId)
      .single();

    const availableEur = Number(profile?.balance_available || 0);
    if (availableEur < plan.priceEUR) {
      return NextResponse.json(
        {
          success: false,
          error: `Solde insuffisant (${Math.round(availableEur * 10)} DH disponibles, ${plan.priceDH} DH requis). Veuillez recharger votre portefeuille.`,
          requiresDeposit: true,
        },
        { status: 400 }
      );
    }

    const durationDays = plan.planType === '1_YEAR' ? 365 : plan.planType === '3_MONTHS' ? 90 : 30;
    const expiresAt = new Date(Date.now() + durationDays * 24 * 3600 * 1000).toISOString();

    await supabase
      .from('profiles')
      .update({
        balance_available: availableEur - plan.priceEUR,
        subscription_active_until: expiresAt,
      })
      .eq('id', userId);

    await supabase
      .from('performer_subscriptions')
      .insert({
        user_id: userId,
        plan_type: plan.planType,
        amount_paid_dh: plan.priceDH,
        expires_at: expiresAt,
        status: 'ACTIVE',
      });

    await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'COMMISSION',
        amount: -plan.priceEUR,
        currency: 'EUR',
        description: `Pass Prestataire Vérifié (${plan.name})`,
        status: 'COMPLETED',
      });

    return NextResponse.json({
      success: true,
      message: `Pass ${plan.name} activé avec succès !`,
      expiresAt,
    });
  } catch (err: any) {
    console.error('Subscriptions POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
