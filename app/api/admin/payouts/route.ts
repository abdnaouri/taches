export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, requireAdminUser } from '@/lib/auth/serverAuth';
import { sendPayoutNotification } from '@/lib/notificationService';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAdminUser(req);
    if (!authResult.isAdmin) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Accès réservé aux administrateurs.' },
        { status: authResult.status || 403 }
      );
    }

    const supabase = getAdminClient();

    // 1. Fetch all withdrawal transactions
    const { data: withdrawals, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('type', 'WITHDRAWAL')
      .order('created_at', { ascending: false });

    // 2. Fetch all profiles for reference
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, performer_tier, performer_completed_tasks');

    const profileMap = new Map<string, any>();
    if (profiles) {
      profiles.forEach((p: any) => profileMap.set(p.id, p));
    }

    const items = (withdrawals || []).map((tx: any) => {
      const profile = profileMap.get(tx.user_id) || {
        id: tx.user_id,
        full_name: 'Prestataire Tâches.ma',
        email: 'user@taches.ma',
      };

      const grossEur = Math.abs(Number(tx.amount || 0));
      const grossDH = Math.round(grossEur * 10);
      const isBinance = (tx.description || '').toLowerCase().includes('binance');

      const feeDH = 0; // Free / direct
      const method: 'REMITLY' | 'BINANCE_PAY' = isBinance ? 'BINANCE_PAY' : 'REMITLY';
      const netDH = grossDH;

      return {
        id: tx.id,
        userId: tx.user_id,
        userName: profile.full_name,
        userEmail: profile.email,
        userAvatar: profile.avatar_url,
        type: tx.type,
        grossAmountDH: grossDH,
        grossAmountEur: grossEur,
        feeDH,
        netAmountDH: netDH,
        method,
        description: tx.description,
        status: tx.status || 'PENDING',
        createdAt: tx.created_at,
      };
    });

    // Compute platform summary stats
    const pendingItems = items.filter((i: any) => i.status === 'PENDING' || i.status === 'PROCESSING');
    const completedItems = items.filter((i: any) => i.status === 'COMPLETED');

    const pendingVolumeDH = pendingItems.reduce((acc: number, cur: any) => acc + cur.grossAmountDH, 0);
    const completedVolumeDH = completedItems.reduce((acc: number, cur: any) => acc + cur.grossAmountDH, 0);
    const totalFeesCollectedDH = items.reduce((acc: number, cur: any) => acc + cur.feeDH, 0);

    return NextResponse.json({
      success: true,
      items,
      stats: {
        totalPayoutsCount: items.length,
        pendingCount: pendingItems.length,
        pendingVolumeDH,
        completedVolumeDH,
        totalFeesCollectedDH,
      },
    });
  } catch (err: any) {
    console.error('Admin Payouts GET error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur lors de la récupération des virements.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdminUser(req);
    if (!authResult.isAdmin) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Accès réservé aux administrateurs.' },
        { status: authResult.status || 403 }
      );
    }

    const body = await req.json();
    const {
      transactionId,
      status, // 'PROCESSING' | 'COMPLETED' | 'CANCELLED'
      trackingReference,
      rejectionReason,
    } = body;

    if (!transactionId || !status) {
      return NextResponse.json(
        { success: false, error: 'Paramètres manquants (transactionId, status).' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // 1. Fetch original transaction
    const { data: tx, error: fetchErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (fetchErr || !tx) {
      return NextResponse.json(
        { success: false, error: 'Transaction de virement introuvable.' },
        { status: 404 }
      );
    }

    // 2. Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, balance_available, email, full_name')
      .eq('id', tx.user_id)
      .single();

    // 3. Handle cancellation refund
    if (status === 'CANCELLED' && tx.status !== 'CANCELLED') {
      const refundAmountEur = Math.abs(Number(tx.amount || 0));
      if (profile && refundAmountEur > 0) {
        const restoredBalance = Number(profile.balance_available || 0) + refundAmountEur;
        await supabase
          .from('profiles')
          .update({ balance_available: restoredBalance })
          .eq('id', profile.id);

        // Record refund reversal
        await supabase.from('transactions').insert({
          user_id: tx.user_id,
          type: 'DEPOSIT',
          amount: refundAmountEur,
          currency: 'EUR',
          description: `Remboursement de la demande de virement annulée #${tx.id.slice(0, 8)}${rejectionReason ? ` (${rejectionReason})` : ''}`,
          status: 'COMPLETED',
        });
      }
    }

    // 4. Update transaction status
    let updatedDescription = tx.description;
    if (trackingReference) {
      updatedDescription += ` • Réf: ${trackingReference}`;
    }
    if (rejectionReason) {
      updatedDescription += ` • Motif de rejet: ${rejectionReason}`;
    }

    const { data: updatedTx, error: updateErr } = await supabase
      .from('transactions')
      .update({
        status,
        description: updatedDescription,
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json(
        { success: false, error: updateErr.message },
        { status: 500 }
      );
    }

    // 5. Send notification to recipient
    if (profile && profile.email) {
      const grossEur = Math.abs(Number(tx.amount || 0));
      const grossDH = Math.round(grossEur * 10);
      const isBinance = (tx.description || '').toLowerCase().includes('binance');
      const method = isBinance ? 'BINANCE_PAY' : 'REMITLY';

      await sendPayoutNotification({
        recipientEmail: profile.email,
        recipientName: profile.full_name || 'Prestataire',
        amountDH: grossDH,
        netAmountDH: grossDH,
        feeDH: 0,
        payoutMethod: method,
        maskedDestination: 'Compte vérifié',
        trackingReference: trackingReference || `REF-${Date.now().toString().slice(-6)}`,
        status,
        rejectionReason,
      });
    }

    return NextResponse.json({
      success: true,
      transaction: updatedTx,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
