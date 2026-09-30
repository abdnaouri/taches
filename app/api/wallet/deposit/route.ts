export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MAD_TO_EUR_RATE } from '@/lib/payoutService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vzrmunzfkftydvgmylvu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      amountDH,
      depositMethod = 'CARD',
    } = body;

    if (!userId || !amountDH || Number(amountDH) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Montant de recharge invalide ou utilisateur manquant.' },
        { status: 400 }
      );
    }

    const amountEur = Number((Number(amountDH) * MAD_TO_EUR_RATE).toFixed(2));
    const supabase = getAdminClient();

    let methodLabel = 'Carte Bancaire / Apple Pay';
    if (depositMethod === 'BANK') {
      methodLabel = 'Virement Bancaire';
    } else if (depositMethod === 'CRYPTO' || depositMethod === 'BINANCE_PAY') {
      methodLabel = 'Dépôt Crypto (Binance Pay / USDT)';
    } else if (depositMethod === 'CASH') {
      methodLabel = 'Dépôt Espèces (Cash Plus / Wafacash)';
    }

    const txDescription = `Recharge de compte (${amountDH} DH / ${amountEur} €) via ${methodLabel}`;

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
