export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, requireAdminUser } from '@/lib/auth/serverAuth';

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

    // Fetch tasks currently in ARBITRATION or UNDER_REVIEW with disputes
    const { data: disputedTasks, error: tasksErr } = await supabase
      .from('tasks')
      .select('*')
      .in('status', ['ARBITRATION', 'UNDER_REVIEW'])
      .order('created_at', { ascending: false });

    if (tasksErr || !disputedTasks) {
      return NextResponse.json({ success: true, disputes: [] });
    }

    const disputes = disputedTasks.map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      category: t.category,
      status: t.status,
      totalBudgetDH: Math.round(Number(t.total_budget || t.reward || 0) * 10),
      totalBudgetEur: Number(t.total_budget || t.reward || 0),
      rewardDH: Math.round(Number(t.reward || 0) * 10),
      rewardEur: Number(t.reward || 0),
      clientId: t.client_id,
      clientName: t.client_name,
      clientAvatar: t.client_avatar,
      assignedToId: t.assigned_to_id,
      assignedToName: t.assigned_to_name,
      createdAt: t.created_at,
    }));

    return NextResponse.json({ success: true, disputes });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
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
      taskId,
      ruling, // 'REFUND_CLIENT' | 'RELEASE_PERFORMER'
      arbitrationNotes,
    } = body;

    if (!taskId || !ruling) {
      return NextResponse.json({ success: false, error: 'taskId et ruling requis' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // 1. Fetch task details
    const { data: task, error: taskErr } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (taskErr || !task) {
      return NextResponse.json({ success: false, error: 'Tâche introuvable' }, { status: 404 });
    }

    const budgetEur = Number(task.total_budget || task.reward);
    const budgetDH = Math.round(budgetEur * 10);

    // 2. Fetch profiles
    const { data: clientProfile } = await supabase
      .from('profiles')
      .select('id, balance_available, balance_escrow')
      .eq('id', task.client_id)
      .single();

    const { data: performerProfile } = await supabase
      .from('profiles')
      .select('id, balance_available')
      .eq('id', task.assigned_to_id)
      .single();

    if (ruling === 'REFUND_CLIENT') {
      // Refund 100% back to client
      if (clientProfile) {
        const newEscrow = Math.max(0, Number(clientProfile.balance_escrow || 0) - budgetEur);
        const newAvailable = Number(clientProfile.balance_available || 0) + budgetEur;

        await supabase
          .from('profiles')
          .update({
            balance_escrow: newEscrow,
            balance_available: newAvailable,
          })
          .eq('id', clientProfile.id);
      }

      await supabase
        .from('tasks')
        .update({ status: 'CANCELLED' })
        .eq('id', taskId);

      await supabase.from('transactions').insert({
        user_id: task.client_id,
        type: 'REFUND',
        amount: budgetEur,
        currency: 'EUR',
        description: `Remboursement suite arbitrage Tâches.ma pour mission #${taskId.slice(0, 8)} (${budgetDH} DH)`,
        status: 'COMPLETED',
      });
    } else if (ruling === 'RELEASE_PERFORMER') {
      // Release 100% (minus 15% commission) to performer — based on task reward (not total_budget which includes platform fee)
      const rewardEur = Number(task.reward || budgetEur);
      const commissionEur = Number((rewardEur * 0.15).toFixed(2));
      const netPerformerEur = Number((rewardEur - commissionEur).toFixed(2));

      if (clientProfile) {
        const newEscrow = Math.max(0, Number(clientProfile.balance_escrow || 0) - budgetEur);
        await supabase
          .from('profiles')
          .update({ balance_escrow: newEscrow })
          .eq('id', clientProfile.id);
      }

      if (performerProfile) {
        const newAvailable = Number(performerProfile.balance_available || 0) + netPerformerEur;
        await supabase
          .from('profiles')
          .update({ balance_available: newAvailable })
          .eq('id', performerProfile.id);
      }

      await supabase
        .from('tasks')
        .update({ status: 'COMPLETED', completed_at: new Date().toISOString() })
        .eq('id', taskId);

      await supabase.from('transactions').insert({
        user_id: task.assigned_to_id,
        type: 'ESCROW_RELEASE',
        amount: rewardEur,
        currency: 'EUR',
        description: `Gains validés par arbitrage pour mission #${taskId.slice(0, 8)} (${Math.round(rewardEur * 10)} DH brut)`,
        status: 'COMPLETED',
      });

      await supabase.from('transactions').insert({
        user_id: task.assigned_to_id,
        type: 'COMMISSION',
        amount: -commissionEur,
        currency: 'EUR',
        description: `Commission Tâches.ma arbitrage (15%) = ${Math.round(commissionEur * 10)} DH`,
        status: 'COMPLETED',
      });
    } else if (ruling === 'SPLIT_50_50') {
      // Compromis Arbitrage: 50% refund to client, 50% (minus 15% commission) to performer
      // Split based on task reward, not total_budget (which includes platform escrow fee)
      const rewardEur = Number(task.reward || budgetEur);
      const halfRewardEur = Number((rewardEur * 0.5).toFixed(2));
      const halfCommissionEur = Number((halfRewardEur * 0.15).toFixed(2));
      const netPerformerHalfEur = Number((halfRewardEur - halfCommissionEur).toFixed(2));
      // Client refund: 50% of reward + the entire platform fee portion
      const clientRefundEur = Number((budgetEur - halfRewardEur).toFixed(2));

      if (clientProfile) {
        const newEscrow = Math.max(0, Number(clientProfile.balance_escrow || 0) - budgetEur);
        const newAvailable = Number(clientProfile.balance_available || 0) + clientRefundEur;
        await supabase
          .from('profiles')
          .update({
            balance_escrow: newEscrow,
            balance_available: newAvailable,
          })
          .eq('id', clientProfile.id);
      }

      if (performerProfile) {
        const newAvailable = Number(performerProfile.balance_available || 0) + netPerformerHalfEur;
        await supabase
          .from('profiles')
          .update({ balance_available: newAvailable })
          .eq('id', performerProfile.id);
      }

      await supabase
        .from('tasks')
        .update({
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
          final_payout_percentage: 50,
          final_performer_amount_dh: Math.round(netPerformerHalfEur * 10),
          final_client_refund_dh: Math.round(clientRefundEur * 10),
        })
        .eq('id', taskId);

      // Ledger: Refund to client
      await supabase.from('transactions').insert({
        user_id: task.client_id,
        type: 'REFUND',
        amount: clientRefundEur,
        currency: 'EUR',
        description: `Remboursement 50% compromis arbitrage mission #${taskId.slice(0, 8)} (${Math.round(clientRefundEur * 10)} DH)`,
        status: 'COMPLETED',
      });

      // Ledger: Payout 50% to performer
      await supabase.from('transactions').insert({
        user_id: task.assigned_to_id,
        type: 'ESCROW_RELEASE',
        amount: halfRewardEur,
        currency: 'EUR',
        description: `Paiement 50% compromis arbitrage mission #${taskId.slice(0, 8)} (${Math.round(halfRewardEur * 10)} DH brut)`,
        status: 'COMPLETED',
      });

      await supabase.from('transactions').insert({
        user_id: task.assigned_to_id,
        type: 'COMMISSION',
        amount: -halfCommissionEur,
        currency: 'EUR',
        description: `Commission Tâches.ma 50% arbitrage (15%) = ${Math.round(halfCommissionEur * 10)} DH`,
        status: 'COMPLETED',
      });
    }

    // 3. Post system message into task chat
    let decisionText = "Partage équitable 50% Client / 50% Prestataire.";
    if (ruling === 'REFUND_CLIENT') {
      decisionText = 'Remboursement intégral en faveur du client.';
    } else if (ruling === 'RELEASE_PERFORMER') {
      decisionText = 'Paiement débloqué en faveur du prestataire.';
    }

    await supabase.from('messages').insert({
      task_id: taskId,
      sender_id: authResult.user!.id,
      sender_name: 'Arbitrage Officiel Tâches.ma',
      content: `⚖️ Décision finale d'arbitrage : ${decisionText} Motif : ${arbitrationNotes || 'Conformité avec les règles de la plateforme.'}`,
    });

    return NextResponse.json({
      success: true,
      ruling,
      taskId,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
