export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getAuthenticatedUser } from '@/lib/auth/serverAuth';

export async function GET(req: NextRequest) {
  try {
    const taskId = req.nextUrl.searchParams.get('taskId');
    if (!taskId) {
      return NextResponse.json({ success: false, error: 'taskId required' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // Fetch executions
    const { data: executions, error } = await supabase
      .from('task_executions')
      .select('*')
      .eq('task_id', taskId)
      .order('reserved_at', { ascending: false });

    if (error) {
      console.error('Task executions error:', error);
      return NextResponse.json({ success: false, error: error.message, executions: [] }, { status: 500 });
    }

    // Enrich with performer profiles
    const performerIds = (executions || []).map((e: any) => e.performer_id).filter(Boolean);
    const profileMap = new Map<string, any>();

    if (performerIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, performer_rating')
        .in('id', performerIds);

      (profiles || []).forEach((p: any) => profileMap.set(p.id, p));
    }

    const formatted = (executions || []).map((e: any) => {
      const prof = profileMap.get(e.performer_id) || {};
      return {
        id: e.id,
        taskId: e.task_id,
        performerId: e.performer_id,
        performerName: prof.full_name || 'Prestataire',
        performerAvatar: prof.avatar_url || '',
        performerRating: Number(prof.performer_rating || 5.0),
        status: e.status,
        reservedAt: e.reserved_at,
        reservedUntil: e.reserved_until,
        submittedAt: e.submitted_at,
        reportText: e.report_text,
        proofUrls: e.proof_urls || [],
        antiSpamEntered: e.anti_spam_entered,
        clientFeedback: e.client_feedback,
        reviewedAt: e.reviewed_at,
        unitRewardDH: Number(e.unit_reward_dh || 0),
      };
    });

    return NextResponse.json({ success: true, executions: formatted });
  } catch (err: any) {
    console.error('Slots GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);
    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentification requise.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, taskId, executionId, reportText, proofUrls, antiSpamEntered, clientFeedback } = body;
    const userId = authResult.user.id;
    const supabase = getAdminClient();

    // 1. ACTION: RESERVE A SLOT (Performer claims a slot for 45 min)
    if (action === 'reserve') {
      if (!taskId) {
        return NextResponse.json({ success: false, error: 'taskId required' }, { status: 400 });
      }

      // Check qualification & subscription
      const { data: profile } = await supabase
        .from('profiles')
        .select('passed_qualification, subscription_active_until, free_tasks_remaining, is_admin')
        .eq('id', userId)
        .single();

      if (!profile?.is_admin) {
        if (!profile?.passed_qualification) {
          return NextResponse.json(
            { success: false, error: 'Vous devez réussir le test de qualification pour participer aux missions.' },
            { status: 403 }
          );
        }
      }

      // Call atomic RPC
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('reserve_task_slot', {
        p_task_id: taskId,
        p_performer_id: userId,
      });

      if (!rpcErr && rpcRes && rpcRes.success) {
        return NextResponse.json({
          success: true,
          executionId: rpcRes.execution_id,
          reservedUntil: rpcRes.reserved_until,
          message: 'Place réservée avec succès ! Vous avez 45 minutes pour soumettre votre livrable.',
        });
      }

      if (rpcRes && !rpcRes.success) {
        return NextResponse.json({ success: false, error: rpcRes.error }, { status: 400 });
      }

      // Fallback reservation logic
      const { data: task } = await supabase.from('tasks').select('*').eq('id', taskId).single();
      if (!task || task.task_mode !== 'multi') {
        return NextResponse.json({ success: false, error: 'Mission multi-exécutions introuvable.' }, { status: 404 });
      }

      const unitDH = Number(task.unit_price_dh || (task.reward * 10) / Math.max(1, task.target_executions_count || 1));
      const reservedUntil = new Date(Date.now() + 45 * 60 * 1000).toISOString();

      const { data: inserted, error: insErr } = await supabase
        .from('task_executions')
        .insert({
          task_id: taskId,
          performer_id: userId,
          status: 'RESERVED',
          reserved_until: reservedUntil,
          unit_reward_dh: unitDH,
        })
        .select()
        .single();

      if (insErr) {
        return NextResponse.json({ success: false, error: 'Impossible de réserver cette place.' }, { status: 400 });
      }

      await supabase
        .from('tasks')
        .update({ executions_reserved_count: (task.executions_reserved_count || 0) + 1 })
        .eq('id', taskId);

      return NextResponse.json({
        success: true,
        executionId: inserted.id,
        reservedUntil,
        message: 'Place réservée avec succès ! Vous avez 45 minutes pour soumettre votre livrable.',
      });
    }

    // 2. ACTION: SUBMIT PROOF FOR RESERVED SLOT
    if (action === 'submit') {
      if (!executionId || !reportText?.trim()) {
        return NextResponse.json({ success: false, error: 'executionId et reportText requis' }, { status: 400 });
      }

      const { data: execution } = await supabase
        .from('task_executions')
        .select('*, tasks!inner(*)')
        .eq('id', executionId)
        .single();

      if (!execution || execution.performer_id !== userId) {
        return NextResponse.json({ success: false, error: 'Réservation introuvable ou non autorisée.' }, { status: 404 });
      }

      const taskObj = execution.tasks;

      // Anti-spam secret check
      if (taskObj?.anti_spam_keyword && taskObj.anti_spam_keyword.trim().length > 0) {
        const required = taskObj.anti_spam_keyword.trim().toLowerCase();
        const entered = (antiSpamEntered || '').trim().toLowerCase();
        const inText = reportText.toLowerCase().includes(required);

        if (entered !== required && !inText) {
          return NextResponse.json(
            { success: false, error: 'Mot secret anti-spam incorrect. Vérifiez les consignes.' },
            { status: 400 }
          );
        }
      }

      const { error: updErr } = await supabase
        .from('task_executions')
        .update({
          status: 'SUBMITTED',
          submitted_at: new Date().toISOString(),
          report_text: reportText.trim(),
          proof_urls: proofUrls || [],
          anti_spam_entered: antiSpamEntered || '',
        })
        .eq('id', executionId);

      if (updErr) {
        return NextResponse.json({ success: false, error: updErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Livrable soumis avec succès ! En attente de validation du client.',
      });
    }

    // 3. ACTION: APPROVE EXECUTION (Client releases unit reward to performer)
    if (action === 'approve') {
      if (!executionId) {
        return NextResponse.json({ success: false, error: 'executionId requis' }, { status: 400 });
      }

      const { data: rpcRes, error: rpcErr } = await supabase.rpc('approve_task_execution', {
        p_execution_id: executionId,
        p_client_id: userId,
      });

      if (!rpcErr && rpcRes && rpcRes.success) {
        return NextResponse.json({ success: true, message: 'Exécution validée et rémunération débloquée !' });
      }

      // Fallback approval
      const { data: execution } = await supabase
        .from('task_executions')
        .select('*, tasks!inner(*)')
        .eq('id', executionId)
        .single();

      if (!execution || execution.tasks?.client_id !== userId) {
        return NextResponse.json({ success: false, error: 'Non autorisé à valider cette exécution.' }, { status: 403 });
      }

      const unitEur = Number(execution.unit_reward_dh) / 10.0;
      const commissionEur = unitEur * 0.15;
      const netEur = unitEur - commissionEur;

      // Update client escrow
      const { data: clientProf } = await supabase.from('profiles').select('balance_escrow').eq('id', userId).single();
      await supabase.from('profiles').update({
        balance_escrow: Math.max(0, (clientProf?.balance_escrow || 0) - unitEur),
      }).eq('id', userId);

      // Update performer available
      const { data: perfProf } = await supabase.from('profiles').select('balance_available, performer_completed_tasks').eq('id', execution.performer_id).single();
      await supabase.from('profiles').update({
        balance_available: (perfProf?.balance_available || 0) + netEur,
        performer_completed_tasks: (perfProf?.performer_completed_tasks || 0) + 1,
      }).eq('id', execution.performer_id);

      await supabase.from('task_executions').update({
        status: 'APPROVED',
        reviewed_at: new Date().toISOString(),
      }).eq('id', executionId);

      await supabase.from('tasks').update({
        executions_approved_count: (execution.tasks.executions_approved_count || 0) + 1,
        executions_reserved_count: Math.max(0, (execution.tasks.executions_reserved_count || 0) - 1),
      }).eq('id', execution.task_id);

      return NextResponse.json({ success: true, message: 'Exécution validée et rémunération débloquée !' });
    }

    return NextResponse.json({ success: false, error: 'Action non reconnue.' }, { status: 400 });
  } catch (err: any) {
    console.error('Slots POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
