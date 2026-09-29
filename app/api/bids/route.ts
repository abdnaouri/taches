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
      return NextResponse.json({ success: false, error: 'taskId is required' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { data: bids, error } = await supabase
      .from('bids')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: true, bids: [] });
    }

    // Fetch performers profiles for richer details
    const performerIds = (bids || []).map((b: any) => b.performer_id).filter(Boolean);
    const profileMap = new Map<string, any>();

    if (performerIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, performer_tier, performer_rating, performer_completed_tasks')
        .in('id', performerIds);

      (profiles || []).forEach((p: any) => profileMap.set(p.id, p));
    }

    const formattedBids = (bids || []).map((b: any) => {
      const prof = profileMap.get(b.performer_id) || {};
      return {
        id: b.id,
        taskId: b.task_id,
        performerId: b.performer_id,
        performerName: prof.full_name || 'Prestataire',
        performerAvatar: prof.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60',
        performerTier: prof.performer_tier || 'level_1',
        performerRating: Number(prof.performer_rating || 5.0),
        performerCompletedCount: Number(prof.performer_completed_tasks || 0),
        pitch: b.pitch,
        proposedHours: Number(b.proposed_hours || 24),
        createdAt: b.created_at,
      };
    });

    return NextResponse.json({ success: true, bids: formattedBids });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskId, performerId, pitch, proposedHours } = body;
    const supabase = getAdminClient();

    let createdBid = null;

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

      if (!error && data) {
        createdBid = data;
      }

      // Increment applicants count
      const { data: taskData } = await supabase
        .from('tasks')
        .select('applicants_count')
        .eq('id', taskId)
        .single();

      const newCount = Number(taskData?.applicants_count || 0) + 1;
      await supabase
        .from('tasks')
        .update({ applicants_count: newCount })
        .eq('id', taskId);
    }

    return NextResponse.json({
      success: true,
      bid: createdBid || {
        id: `bid_${Date.now()}`,
        taskId,
        performerId,
        pitch,
        proposedHours: proposedHours || 24,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
