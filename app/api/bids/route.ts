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
      console.error('Error fetching bids:', error);
      return NextResponse.json({ success: false, error: error.message, bids: [] }, { status: 500 });
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
    console.error('Bids GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskId, performerId, pitch, proposedHours = 24 } = body;

    if (!taskId || !performerId || !pitch) {
      return NextResponse.json(
        { success: false, error: 'Champs requis manquants (taskId, performerId, pitch)' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    const { data: createdBid, error: bidError } = await supabase
      .from('bids')
      .insert({
        task_id: taskId,
        performer_id: performerId,
        pitch: pitch.trim(),
        proposed_hours: proposedHours,
      })
      .select()
      .single();

    if (bidError) {
      console.error('Bid insertion error:', bidError);
      return NextResponse.json({ success: false, error: bidError.message }, { status: 400 });
    }

    // Increment applicants count on task
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

    return NextResponse.json({
      success: true,
      bid: createdBid,
    });
  } catch (err: any) {
    console.error('Bids POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
