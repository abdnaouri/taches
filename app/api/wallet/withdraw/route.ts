export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getAuthenticatedUser } from '@/lib/auth/serverAuth';
import { calculatePayoutFees, detectMoroccanBank, validateMoroccanRIB, PayoutMethod } from '@/lib/payoutService';

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
      payoutMethod = 'REMITLY',
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

    const cleanMethod = String(payoutMethod).toUpperCase();
    if (['RIB', 'CIH', 'AWB', 'BMCE', 'BCP', 'SGMB', 'ABB', 'BANK'].includes(cleanMethod)) {
      if (payoutDetails.rib) {
        const ribCheck = validateMoroccanRIB(payoutDetails.rib);
        if (!ribCheck.isValid) {
          return NextResponse.json({ success: false, error: ribCheck.error }, { status: 400 });
        }
      }
      const bankInfo = detectMoroccanBank(payoutDetails.rib || cleanMethod);
      const ribFormatted = (payoutDetails.rib || '').replace(/\s+/g, '');
      methodLabel = `Virement ${bankInfo.name}`;
      destinationSummary = `RIB: ${ribFormatted || 'N/A'} • Titulaire: ${payoutDetails.accountHolder || profile.full_name || 'Prestataire'}`;
    } else if (cleanMethod === 'CASHP' || cleanMethod === 'CASHPLUS') {
      methodLabel = 'Retrait Cash Plus';
      destinationSummary = `Bénéficiaire: ${payoutDetails.recipientName || profile.full_name || ''} • CIN: ${payoutDetails.cin || 'N/A'} • Tél: ${payoutDetails.phone || ''}`;
    } else if (cleanMethod === 'WAFACASH') {
      methodLabel = 'Retrait Wafacash';
      destinationSummary = `Bénéficiaire: ${payoutDetails.recipientName || profile.full_name || ''} • CIN: ${payoutDetails.cin || 'N/A'} • Tél: ${payoutDetails.phone || ''}`;
    } else if (cleanMethod === 'BINANCE_PAY' || cleanMethod === 'BINANCE' || cleanMethod === 'USDT') {
      methodLabel = 'Binance Pay (USDT)';
      destinationSummary = `Binance Pay ID: ${payoutDetails.binancePayId || ''}`;
    } else {
      methodLabel = 'Remitly';
      destinationSummary = `Bénéficiaire: ${payoutDetails.recipientName || profile.full_name || ''} (${payoutDetails.phoneOrEmail || ''}, ${payoutDetails.country || 'Maroc'})`;
    }

    const txDescription = `Retrait ${methodLabel} - Net: ${feeCalculation.netAmountDH} DH • ${destinationSummary}`;

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
      withdrawnAmountDH: Number(amountDH),
      netAmountDH: feeCalculation.netAmountDH,
      feeDH: feeCalculation.feeDH,
      newBalanceAvailableEur: newAvailableEur,
      method: payoutMethod,
    });
  } catch (err: any) {
    console.error('Withdraw POST error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur lors du traitement du retrait.' },
      { status: 500 }
    );
  }
}
