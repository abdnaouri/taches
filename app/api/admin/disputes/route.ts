export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPayoutNotification } from '@/lib/notificationService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vzrmunzfkftydvgmylvu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export async function GET() {
  try {
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
    const body = await req.json();
    const {
      taskId,
      ruling, // 'REFUND_CLIENT' | 'RELEASE_PERFORMER' | 'SPLIT_50_50'
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
      // Release 100% (minus 15% commission) to performer
      const commissionEur = Number((budgetEur * 0.15).toFixed(2));
      const netPerformerEur = Number((budgetEur - commissionEur).toFixed(2));

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
        amount: budgetEur,
        currency: 'EUR',
        description: `Gains validés par arbitrage pour mission #${taskId.slice(0, 8)}`,
        status: 'COMPLETED',
      });

      await supabase.from('transactions').insert({
        user_id: task.assigned_to_id,
        type: 'COMMISSION',
        amount: -commissionEur,
        currency: 'EUR',
        description: `Commission Tâches.ma arbitrage (15%)`,
        status: 'COMPLETED',
      });
    }

    // 3. Post system message into task chat
    await supabase.from('messages').insert({
      task_id: taskId,
      sender_id: '00000000-0000-0000-0000-000000000000',
      sender_name: 'Arbitrage Officiel Tâches.ma',
      content: `⚖️ Décision finale d'arbitrage : ${
        ruling === 'REFUND_CLIENT'
          ? 'Remboursement intégral en faveur du client.'
          : 'Paiement débloqué en faveur du prestataire.'
      } Motif : ${arbitrationNotes || 'Conformité avec les règles de la plateforme.'}`,
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
