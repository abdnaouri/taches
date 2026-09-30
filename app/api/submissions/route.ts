export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vzrmunzfkftydvgmylvu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export async function GET(req: NextRequest) {
  try {
    const taskId = req.nextUrl.searchParams.get('taskId');
    if (!taskId) {
      return NextResponse.json({ success: false, error: 'taskId required' }, { status: 400 });
    }

    const supabase = getAdminClient();
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
    const body = await req.json();
    const { taskId, performerId, reportText, proofUrls } = body;

    if (!taskId || !performerId || !reportText) {
      return NextResponse.json(
        { success: false, error: 'Champs requis manquants (taskId, performerId, reportText)' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

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
