import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vzrmunzfkftydvgmylvu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
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
    if (body.status) updates.status = body.status;
    if (body.assignedToId) updates.assigned_to_id = body.assignedToId;
    if (body.assignedAt) updates.assigned_at = body.assignedAt;
    if (body.completedAt) updates.completed_at = body.completedAt;
    if (typeof body.applicantsCount === 'number') updates.applicants_count = body.applicantsCount;

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, task: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
