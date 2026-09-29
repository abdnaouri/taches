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
    const { taskId, performerId, pitch, proposedHours } = body;
    const supabase = getAdminClient();

    // If valid UUIDs, try inserting into bids table
    if (taskId && taskId.includes('-') && performerId && performerId.includes('-')) {
      const { data, error } = await supabase
        .from('bids')
        .insert({
          task_id: taskId,
          performer_id: performerId,
          pitch,
          proposed_hours: proposedHours || 24,
        })
        .select()
        .single();

      if (error) {
        console.warn('Bid insert error:', error.message);
      }
    }

    return NextResponse.json({ success: true, bid: body });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
