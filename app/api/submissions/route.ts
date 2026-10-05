export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getAuthenticatedUser } from '@/lib/auth/serverAuth';
import { sendSubmissionReceivedNotification } from '@/lib/notificationService';

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

    const isClient =
      task.client_id === callerId ||
      (!task.client_id && (authResult.isAdmin || authResult.user.email === 'aero@example.com')) ||
      (task.client_id?.startsWith('cli_') && (authResult.isAdmin || authResult.user.email === 'aero@example.com'));

    const isAuthorized =
      isClient ||
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
    const { taskId, reportText, proofUrls, antiSpamEntered } = body;

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
      .select('title, client_id, assigned_to_id, status, task_mode, anti_spam_keyword')
      .eq('id', taskId)
      .single();

    if (taskErr || !task) {
      return NextResponse.json({ success: false, error: 'Mission introuvable.' }, { status: 404 });
    }

    // Check anti-spam secret keyword if required by client (UNU Anti-Spam barrier)
    if (task.anti_spam_keyword && task.anti_spam_keyword.trim().length > 0) {
      const requiredKeyword = task.anti_spam_keyword.trim().toLowerCase();
      const enteredKeyword = (antiSpamEntered || '').trim().toLowerCase();
      const textIncludesKeyword = reportText.toLowerCase().includes(requiredKeyword);

      if (enteredKeyword !== requiredKeyword && !textIncludesKeyword) {
        return NextResponse.json(
          {
            success: false,
            error: 'Le mot secret anti-spam est incorrect. Veuillez vérifier les consignes de la mission.',
            antiSpamFailed: true,
          },
          { status: 400 }
        );
      }
    }

    if (task.client_id === performerId) {
      return NextResponse.json(
        { success: false, error: 'Le donneur d\'ordre ne peut pas soumettre de livrable sur sa propre mission.' },
        { status: 400 }
      );
    }

    if (!['IN_PROGRESS', 'ASSIGNED', 'REVISION_REQUESTED', 'UNDER_REVIEW'].includes(task.status) && !authResult.isAdmin) {
      return NextResponse.json(
        { success: false, error: `Impossible de soumettre un livrable pour une mission au statut ${task.status}.` },
        { status: 400 }
      );
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

    // Notify client by transactional email (non-blocking)
    if (task.client_id) {
      (async () => {
        try {
          const { data: clientInfo } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', task.client_id)
            .single();

          const { data: performerInfo } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', performerId)
            .single();

          if (clientInfo?.email) {
            await sendSubmissionReceivedNotification({
              clientEmail: clientInfo.email,
              clientName: clientInfo.full_name || 'Client',
              clientUserId: task.client_id,
              performerName: performerInfo?.full_name || 'Prestataire',
              taskTitle: task.title || 'Mission',
              taskId,
              reportPreview: reportText.trim(),
              proofsCount: (proofUrls || []).length,
            });
          }
        } catch (notifErr: any) {
          console.warn('[Submissions] Failed to dispatch email notification:', notifErr.message);
        }
      })();
    }

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
