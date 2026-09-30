export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Task } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vzrmunzfkftydvgmylvu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Task ID is required' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { data: t, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !t) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    const task: Task = {
      id: t.id,
      title: t.title,
      description: t.description,
      category: t.category,
      subCategory: t.sub_category || undefined,
      city: t.city || 'Casablanca',
      taskMode: t.task_mode || 'single',
      unitPriceDH: t.unit_price_dh ? Number(t.unit_price_dh) : undefined,
      targetExecutionsCount: t.target_executions_count ? Number(t.target_executions_count) : undefined,
      status: t.status,
      reward: Number(t.reward),
      platformFee: Number(t.platform_fee || 0),
      totalBudget: Number(t.total_budget || t.reward),
      timeLimitHours: Number(t.time_limit_hours || 24),
      minLevelRequired: Number(t.min_level_required || 1),
      requiredProofs: t.required_proofs || [],
      applicantsCount: Number(t.applicants_count || 0),
      clientId: t.client_id || '',
      clientName: t.client_name || 'Client',
      clientAvatar: t.client_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60',
      clientRating: Number(t.client_rating || 5.0),
      clientHireRate: Number(t.client_hire_rate || 100),
      assignedToId: t.assigned_to_id || undefined,
      assignedToName: t.assigned_to_name || undefined,
      assignedAt: t.assigned_at || undefined,
      completedAt: t.completed_at || undefined,
      createdAt: t.created_at,
      settlementProposal: t.settlement_proposal || undefined,
      finalPayoutPercentage: t.final_payout_percentage || undefined,
      finalPerformerAmountDH: t.final_performer_amount_dh || undefined,
      finalClientRefundDH: t.final_client_refund_dh || undefined,
    };

    return NextResponse.json({ success: true, task });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const supabase = getAdminClient();

    const updates: Record<string, any> = {};
    if (body.status !== undefined) updates.status = body.status;
    if (body.assignedToId !== undefined) updates.assigned_to_id = body.assignedToId;
    if (body.assignedToName !== undefined) updates.assigned_to_name = body.assignedToName;
    if (body.assignedAt !== undefined) updates.assigned_at = body.assignedAt;
    if (body.completedAt !== undefined) updates.completed_at = body.completedAt;
    if (typeof body.applicantsCount === 'number') updates.applicants_count = body.applicantsCount;
    if (body.settlementProposal !== undefined) updates.settlement_proposal = body.settlementProposal;
    if (body.finalPayoutPercentage !== undefined) updates.final_payout_percentage = body.finalPayoutPercentage;
    if (body.finalPerformerAmountDH !== undefined) updates.final_performer_amount_dh = body.finalPerformerAmountDH;
    if (body.finalClientRefundDH !== undefined) updates.final_client_refund_dh = body.finalClientRefundDH;

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    // If status transitioned to COMPLETED, release escrow to performer
    if (updates.status === 'COMPLETED' && data.assigned_to_id && data.client_id) {
      const rewardEur = Number(data.reward);
      const commissionEur = Number((rewardEur * 0.15).toFixed(2));
      const netPerformerEur = Number((rewardEur - commissionEur).toFixed(2));
      const totalBudgetEur = Number(data.total_budget || rewardEur);

      // 1. Deduct client locked escrow
      const { data: clientProf } = await supabase
        .from('profiles')
        .select('balance_escrow, customer_total_spent')
        .eq('id', data.client_id)
        .single();

      if (clientProf) {
        await supabase
          .from('profiles')
          .update({
            balance_escrow: Math.max(0, Number(clientProf.balance_escrow || 0) - totalBudgetEur),
            customer_total_spent: Number(clientProf.customer_total_spent || 0) + totalBudgetEur,
          })
          .eq('id', data.client_id);
      }

      // 2. Credit performer available balance & increment stats
      const { data: perfProf } = await supabase
        .from('profiles')
        .select('balance_available, performer_completed_tasks, performer_xp')
        .eq('id', data.assigned_to_id)
        .single();

      if (perfProf) {
        await supabase
          .from('profiles')
          .update({
            balance_available: Number(perfProf.balance_available || 0) + netPerformerEur,
            performer_completed_tasks: Number(perfProf.performer_completed_tasks || 0) + 1,
            performer_xp: Number(perfProf.performer_xp || 0) + 25,
          })
          .eq('id', data.assigned_to_id);
      }

      // 3. Record transactions
      await supabase.from('transactions').insert([
        {
          user_id: data.assigned_to_id,
          type: 'ESCROW_RELEASE',
          amount: rewardEur,
          currency: 'EUR',
          description: `Rémunération pour mission #${data.id.slice(0, 8)} (${Math.round(rewardEur * 10)} DH)`,
          status: 'COMPLETED',
        },
        {
          user_id: data.assigned_to_id,
          type: 'COMMISSION',
          amount: -commissionEur,
          currency: 'EUR',
          description: `Commission de service Tâches.ma (15%)`,
          status: 'COMPLETED',
        }
      ]);
    }

    return NextResponse.json({ success: true, task: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
