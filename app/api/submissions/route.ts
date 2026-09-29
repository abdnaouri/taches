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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskId, performerId, reportText, proofUrls } = body;
    const supabase = getAdminClient();

    if (taskId && taskId.includes('-') && performerId && performerId.includes('-')) {
      await supabase
        .from('submissions')
        .insert({
          task_id: taskId,
          performer_id: performerId,
          report_text: reportText,
          proof_urls: proofUrls || [],
        });

      await supabase
        .from('tasks')
        .update({ status: 'UNDER_REVIEW' })
        .eq('id', taskId);
    }

    return NextResponse.json({ success: true, submission: body });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
