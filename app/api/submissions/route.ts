export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getAuthenticatedUser } from '@/lib/auth/serverAuth';

export async function GET(req: NextRequest) {
  try {
    const taskId = req.nextUrl.searchParams.get('taskId');
    if (!taskId) {
      return NextResponse.json({ success: false, error: 'taskId required' }, { status: 400 });
    }

    const authResult = await getAuthenticatedUser(req);
    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Authentification requise.' },
        { status: 401 }
      );
    }

    const supabase = getAdminClient();
    const callerId = authResult.user.id;

    // Check task access
    const { data: task } = await supabase
      .from('tasks')
      .select('client_id, assigned_to_id')
      .eq('id', taskId)
      .single();

    if (!task) {
      return NextResponse.json({ success: false, error: 'Mission introuvable.' }, { status: 404 });
    }

    const isAuthorized =
      task.client_id === callerId ||
      task.assigned_to_id === callerId ||
      authResult.isAdmin;

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé aux livrables de cette mission.' },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('task_id', taskId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: true, submission: null });
    }

    return NextResponse.json({
      success: true,
      submission: {
        id: data.id,
        taskId: data.task_id,
        performerId: data.performer_id,
        reportText: data.report_text,
        proofUrls: data.proof_urls || [],
        submittedAt: data.submitted_at,
        clientFeedback: data.client_feedback,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);
    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Authentification requise pour soumettre un livrable.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { taskId, reportText, proofUrls } = body;

    if (!taskId || !reportText?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Champs requis manquants (taskId, reportText)' },
        { status: 400 }
      );
    }

    const performerId = authResult.user.id;
    const supabase = getAdminClient();

    // Verify caller is assigned to task
    const { data: task, error: taskErr } = await supabase
      .from('tasks')
      .select('client_id, assigned_to_id, status, task_mode')
      .eq('id', taskId)
      .single();

    if (taskErr || !task) {
      return NextResponse.json({ success: false, error: 'Mission introuvable.' }, { status: 404 });
    }

    const isAssigned = task.assigned_to_id === performerId || task.task_mode === 'multi';
    if (!isAssigned && !authResult.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Vous devez être assigné à cette mission pour soumettre un livrable.' },
        { status: 403 }
      );
    }

    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .insert({
        task_id: taskId,
        performer_id: performerId,
        report_text: reportText.trim(),
        proof_urls: proofUrls || [],
      })
      .select()
      .single();

    if (subError) {
      console.error('Submission insert error:', subError);
      return NextResponse.json({ success: false, error: subError.message }, { status: 400 });
    }

    // Update task status to UNDER_REVIEW
    await supabase
      .from('tasks')
      .update({ status: 'UNDER_REVIEW' })
      .eq('id', taskId);

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        taskId: submission.task_id,
        performerId: submission.performer_id,
        reportText: submission.report_text,
        proofUrls: submission.proof_urls,
        submittedAt: submission.submitted_at,
      },
    });
  } catch (err: any) {
    console.error('Submissions POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
