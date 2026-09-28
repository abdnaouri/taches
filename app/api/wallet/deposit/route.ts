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
      paymentDetails = {},
    } = body;

    if (!userId || !amountDH || Number(amountDH) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Montant de recharge invalide.' },
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

    if (userId.includes('-')) {
      // 1. Fetch current profile
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('id, balance_available')
        .eq('id', userId)
        .single();

      if (!profileErr && profile) {
        const newBalance = Number(profile.balance_available || 0) + amountEur;
        await supabase
          .from('profiles')
          .update({ balance_available: newBalance })
          .eq('id', userId);
      }

      // 2. Insert transaction
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

      return NextResponse.json({
        success: true,
        transaction: txData || {
          id: `tx_${Date.now()}`,
          userId,
          type: 'DEPOSIT',
          amount: amountEur,
          currency: 'EUR',
          description: txDescription,
          status: 'COMPLETED',
          createdAt: new Date().toISOString(),
        },
        creditedAmountDH: Number(amountDH),
        creditedAmountEur: amountEur,
      });
    }

    // Fallback response for demo
    return NextResponse.json({
      success: true,
      transaction: {
        id: `tx_${Date.now()}`,
        userId,
        type: 'DEPOSIT',
        amount: amountEur,
        currency: 'EUR',
        description: txDescription,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
      },
      creditedAmountDH: Number(amountDH),
      creditedAmountEur: amountEur,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur lors du dépôt.' },
      { status: 500 }
    );
  }
}
