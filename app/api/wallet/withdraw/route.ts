import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculatePayoutFees, PayoutMethod, PayoutSpeed } from '@/lib/payoutService';

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
      payoutMethod = 'RIB',
      speedTier = 'STANDARD',
      payoutDetails = {},
    } = body;

    if (!userId || !amountDH || amountDH <= 0) {
      return NextResponse.json(
        { success: false, error: 'Paramètres de retrait invalides ou montant manquant.' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // 1. Fetch user profile to verify current balance
    let currentBalanceEur = 0;
    let userProfile = null;

    if (userId.includes('-')) {
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('id, balance_available, full_name, email')
        .eq('id', userId)
        .single();

      if (profileErr || !profile) {
        return NextResponse.json(
          { success: false, error: 'Profil utilisateur introuvable.' },
          { status: 404 }
        );
      }
      userProfile = profile;
      currentBalanceEur = Number(profile.balance_available || 0);
    } else {
      // Mock / fallback user balance
      currentBalanceEur = 285.5;
    }

    const availableDH = Math.round(currentBalanceEur * 10);

    // 2. Calculate fee and validation
    const feeCalculation = calculatePayoutFees(
      Number(amountDH),
      payoutMethod as PayoutMethod,
      speedTier as PayoutSpeed,
      availableDH
    );

    if (!feeCalculation.isValid) {
      return NextResponse.json(
        { success: false, error: feeCalculation.errorMessage || 'Montant de retrait non autorisé.' },
        { status: 400 }
      );
    }

    // 3. Format destination description based on payout method
    let methodLabel = 'Virement Bancaire (RIB)';
    let destinationSummary = '';

    if (payoutMethod === 'RIB') {
      const rib = payoutDetails.rib || '';
      const bankName = payoutDetails.bankName || 'Banque Marocaine';
      methodLabel = `Virement ${bankName}`;
      destinationSummary = `RIB: ...${rib.slice(-8)}`;
    } else if (payoutMethod === 'CASHPLUS') {
      methodLabel = 'Mise à disposition Cash Plus / Wafacash';
      destinationSummary = `Bénéficiaire: ${payoutDetails.fullName || userProfile?.full_name || ''} (CIN: ${payoutDetails.cin || ''})`;
    } else if (payoutMethod === 'BINANCE_PAY') {
      methodLabel = 'Virement Crypto Instantané (Binance Pay)';
      destinationSummary = `Binance Pay ID: ${payoutDetails.binancePayId || ''}`;
    } else if (payoutMethod === 'USDT') {
      methodLabel = 'Virement Crypto USDT';
      destinationSummary = `USDT (${payoutDetails.network || 'TRC20'}): ${payoutDetails.usdtAddress ? `${payoutDetails.usdtAddress.slice(0, 6)}...${payoutDetails.usdtAddress.slice(-4)}` : ''}`;
    }

    const txDescription = `Retrait ${methodLabel} - Net: ${feeCalculation.netAmountDH} DH (Frais: ${feeCalculation.feeDH} DH) ${destinationSummary ? `• ${destinationSummary}` : ''}`;

    // 4. If Supabase profile exists, execute balance deduction and transaction record
    if (userId.includes('-')) {
      const newAvailableEur = Math.max(0, currentBalanceEur - feeCalculation.requestedAmountEur);

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ balance_available: newAvailableEur })
        .eq('id', userId);

      if (updateErr) {
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la mise à jour du solde.' },
          { status: 500 }
        );
      }

      const { data: txData, error: txErr } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'WITHDRAWAL',
          amount: -feeCalculation.requestedAmountEur,
          currency: 'EUR',
          description: txDescription,
          status: 'PENDING',
        })
        .select()
        .single();

      if (txErr) {
        console.error('Error inserting transaction:', txErr);
      }

      return NextResponse.json({
        success: true,
        transaction: txData || {
          id: `tx_${Date.now()}`,
          userId,
          type: 'WITHDRAWAL',
          amount: -feeCalculation.requestedAmountEur,
          currency: 'EUR',
          description: txDescription,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        },
        feeCalculation,
        estimatedDeliveryTime: speedTier === 'EXPRESS' ? 'Moins de 2 heures' : 'Sous 24 heures ouvrées',
        status: 'PENDING',
      });
    }

    // Fallback response
    return NextResponse.json({
      success: true,
      transaction: {
        id: `tx_${Date.now()}`,
        userId,
        type: 'WITHDRAWAL',
        amount: -feeCalculation.requestedAmountEur,
        currency: 'EUR',
        description: txDescription,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      },
      feeCalculation,
      estimatedDeliveryTime: speedTier === 'EXPRESS' ? 'Moins de 2 heures' : 'Sous 24 heures ouvrées',
      status: 'PENDING',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur serveur interne lors du retrait.' },
      { status: 500 }
    );
  }
}
