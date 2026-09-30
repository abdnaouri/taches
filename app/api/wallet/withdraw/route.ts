export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getAuthenticatedUser } from '@/lib/auth/serverAuth';
import { calculatePayoutFees, PayoutMethod, PayoutSpeed } from '@/lib/payoutService';

export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);
    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Authentification requise pour demander un retrait.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      amountDH,
      payoutMethod = 'RIB',
      speedTier = 'STANDARD',
      payoutDetails = {},
    } = body;

    if (!amountDH || Number(amountDH) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Paramètres de retrait invalides ou montant manquant.' },
        { status: 400 }
      );
    }

    const userId = authResult.user.id;
    const supabase = getAdminClient();

    // 1. Fetch user profile to verify current balance
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

    const currentBalanceEur = Number(profile.balance_available || 0);
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
      destinationSummary = `Bénéficiaire: ${payoutDetails.fullName || profile.full_name || ''} (CIN: ${payoutDetails.cin || ''})`;
    } else if (payoutMethod === 'BINANCE_PAY') {
      methodLabel = 'Virement Crypto Instantané (Binance Pay)';
      destinationSummary = `Binance Pay ID: ${payoutDetails.binancePayId || ''}`;
    } else if (payoutMethod === 'USDT') {
      methodLabel = 'Virement Crypto USDT';
      destinationSummary = `USDT (${payoutDetails.network || 'TRC20'}): ${payoutDetails.usdtAddress ? `${payoutDetails.usdtAddress.slice(0, 6)}...${payoutDetails.usdtAddress.slice(-4)}` : ''}`;
    }

    const txDescription = `Retrait ${methodLabel} - Net: ${feeCalculation.netAmountDH} DH (Frais: ${feeCalculation.feeDH} DH) ${destinationSummary ? `• ${destinationSummary}` : ''}`;

    // 4. Deduct balance from profile
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

    // 5. Insert withdrawal transaction
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
      console.error('Error inserting withdrawal transaction:', txErr);
    }

    return NextResponse.json({
      success: true,
      transaction: txData,
      feeCalculation,
      estimatedDeliveryTime: speedTier === 'EXPRESS' ? 'Moins de 2 heures' : 'Sous 24 heures ouvrées',
      status: 'PENDING',
    });
  } catch (err: any) {
    console.error('Withdrawal POST error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur serveur lors du retrait.' },
      { status: 500 }
    );
  }
}
