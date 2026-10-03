export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getAuthenticatedUser } from '@/lib/auth/serverAuth';
import { MAD_TO_EUR_RATE } from '@/lib/payoutService';

export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);
    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Authentification requise pour effectuer une recharge.' },
        { status: 401 }
      );
    }

    // SECURITY: Manual deposit endpoint is admin-only in production.
    // Real user deposits come through the Viva Smart Checkout webhook (/api/webhooks/viva).
    // This endpoint is reserved for admin top-ups and customer support credits.
    // To allow self-deposits (e.g. simulated environment), set ALLOW_SELF_DEPOSIT=true in env.
    const allowSelfDeposit = process.env.ALLOW_SELF_DEPOSIT === 'true';
    if (!authResult.isAdmin && !allowSelfDeposit) {
      return NextResponse.json(
        { success: false, error: 'Les recharges manuelles sont traitées via le système de paiement Viva Smart Checkout. Contactez le support si votre paiement n\'est pas reflété.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      amountDH,
      depositMethod = 'REMITLY',
    } = body;

    if (!amountDH || Number(amountDH) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Montant de recharge invalide.' },
        { status: 400 }
      );
    }

    const numAmountDH = Number(amountDH);
    // Anti-fraud guard: cap single deposit transactions
    if (numAmountDH > 20000) {
      return NextResponse.json(
        { success: false, error: 'Le montant maximum par recharge est plafonné à 20 000 DH (Plafond de sécurité CMI / Daman).' },
        { status: 400 }
      );
    }

    const userId = authResult.user.id;
    const amountEur = Number((numAmountDH * MAD_TO_EUR_RATE).toFixed(2));
    const supabase = getAdminClient();

    let methodLabel = 'Carte Bancaire Marocaine (CMI)';
    const methodUpper = String(depositMethod).toUpperCase();
    if (methodUpper === 'CMI' || methodUpper === 'CARD') {
      methodLabel = 'Carte Bancaire Marocaine (CMI / Visa / Mastercard)';
    } else if (methodUpper === 'VIREMENT_INSTANTANE' || methodUpper === 'BANK_TRANSFER') {
      methodLabel = 'Virement Bancaire Instantané (24/7)';
    } else if (methodUpper === 'CASHP' || methodUpper === 'CASHPLUS') {
      methodLabel = 'Dépôt Espèces Cash Plus';
    } else if (methodUpper === 'REMITLY') {
      methodLabel = 'Transfert Remitly (MRE)';
    } else if (methodUpper === 'CRYPTO' || methodUpper === 'BINANCE_PAY') {
      methodLabel = 'Binance Pay (USDT)';
    }

    const txDescription = `Recharge de compte (${numAmountDH} DH / ${amountEur} €) via ${methodLabel}`;

    // 1. Fetch current profile
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, balance_available')
      .eq('id', userId)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json(
        { success: false, error: 'Profil utilisateur introuvable dans la base de données.' },
        { status: 404 }
      );
    }

    const newBalance = Number(profile.balance_available || 0) + amountEur;
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ balance_available: newBalance })
      .eq('id', userId);

    if (updateErr) {
      return NextResponse.json(
        { success: false, error: updateErr.message },
        { status: 500 }
      );
    }

    // 2. Insert transaction into ledger
    const { data: txData, error: txErr } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'DEPOSIT',
        amount: amountEur,
        currency: 'EUR',
        description: txDescription,
        status: 'COMPLETED',
      })
      .select()
      .single();

    if (txErr) {
      console.error('Error recording deposit transaction:', txErr);
    }

    return NextResponse.json({
      success: true,
      transaction: txData,
      creditedAmountDH: Number(amountDH),
      creditedAmountEur: amountEur,
      newBalanceAvailableEur: newBalance,
    });
  } catch (err: any) {
    console.error('Deposit POST error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur lors du dépôt.' },
      { status: 500 }
    );
  }
}
