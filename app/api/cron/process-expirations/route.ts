export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth/serverAuth';

/**
 * Background Cron Runner for Workzilla & UNU parity:
 * 1. Auto-approves deliverables under review for > 72 hours and releases escrow to performer.
 * 2. Auto-expires slot reservations in multi-execution campaigns held for > 45 minutes without submission.
 * 3. Identifies overdue in-progress tasks.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = getAdminClient();

    // Call atomic RPC if exists, or execute resilient fallback logic
    const { data: rpcData, error: rpcError } = await supabase.rpc('process_task_expirations');

    if (!rpcError && rpcData) {
      return NextResponse.json({
        success: true,
        source: 'rpc',
        ...rpcData,
      });
    }

    // Resilient Fallback Logic
    let autoApproved = 0;
    let expiredSlots = 0;

    // A. Find submissions older than 72 hours on tasks UNDER_REVIEW
    const threshold72h = new Date(Date.now() - 72 * 3600 * 1000).toISOString();
    const { data: staleSubmissions } = await supabase
      .from('submissions')
      .select('id, task_id, performer_id, submitted_at, tasks!inner(id, client_id, reward, platform_fee, total_budget, status)')
      .eq('tasks.status', 'UNDER_REVIEW')
      .lt('submitted_at', threshold72h);

    if (staleSubmissions && staleSubmissions.length > 0) {
      for (const sub of staleSubmissions) {
        const taskObj = (sub as any).tasks;
        if (!taskObj) continue;

        const reward = Number(taskObj.reward || 0);
        const commission = reward * 0.15;
        const totalBudget = Number(taskObj.total_budget || reward);

        await supabase.rpc('release_task_escrow', {
          p_task_id: taskObj.id,
          p_client_id: taskObj.client_id,
          p_performer_id: sub.performer_id,
          p_reward: reward,
          p_commission: commission,
          p_total_budget: totalBudget,
          p_rating: 5.0,
          p_comment: 'Validation automatique du livrable après 72h sans réclamation du client.',
        });
        autoApproved++;
      }
    }

    // B. Expire multi-execution slots held > 45min
    const nowIso = new Date().toISOString();
    const { data: expiredExecutions } = await supabase
      .from('task_executions')
      .select('id, task_id')
      .eq('status', 'RESERVED')
      .lt('reserved_until', nowIso);

    if (expiredExecutions && expiredExecutions.length > 0) {
      for (const exec of expiredExecutions) {
        await supabase
          .from('task_executions')
          .update({ status: 'EXPIRED' })
          .eq('id', exec.id);

        // Decrement reserved count
        const { data: currentTask } = await supabase
          .from('tasks')
          .select('executions_reserved_count')
          .eq('id', exec.task_id)
          .single();

        if (currentTask) {
          await supabase
            .from('tasks')
            .update({
              executions_reserved_count: Math.max(0, (currentTask.executions_reserved_count || 0) - 1),
            })
            .eq('id', exec.task_id);
        }
        expiredSlots++;
      }
    }

    return NextResponse.json({
      success: true,
      source: 'fallback',
      autoApprovedTasks: autoApproved,
      expiredSlotReservations: expiredSlots,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Cron process expirations error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
