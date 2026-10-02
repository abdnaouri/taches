export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getAuthenticatedUser } from '@/lib/auth/serverAuth';
import { filterOffPlatformContact } from '@/lib/antiCircumvention';

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
    const authResult = await getAuthenticatedUser(req);
    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Authentification requise pour postuler.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { taskId, pitch, proposedHours = 24 } = body;

    if (!taskId || !pitch?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Champs requis manquants (taskId, pitch)' },
        { status: 400 }
      );
    }

    const performerId = authResult.user.id;
    const supabase = getAdminClient();

    // Check task status & prevent client from bidding on own task
    const { data: task, error: taskErr } = await supabase
      .from('tasks')
      .select('client_id, status')
      .eq('id', taskId)
      .single();

    if (taskErr || !task) {
      return NextResponse.json({ success: false, error: 'Mission introuvable.' }, { status: 404 });
    }

    if (task.client_id === performerId) {
      return NextResponse.json(
        { success: false, error: 'Vous ne pouvez pas postuler à votre propre mission.' },
        { status: 400 }
      );
    }

    if (task.status !== 'OPEN') {
      return NextResponse.json(
        { success: false, error: 'Cette mission n\'accepte plus de nouvelles candidatures.' },
        { status: 400 }
      );
    }

    // Verify Performer Qualification & Active Subscription / Free Trial (Workzilla Barrier)
    const { data: performerProfile } = await supabase
      .from('profiles')
      .select('passed_qualification, subscription_active_until, free_tasks_remaining, is_admin')
      .eq('id', performerId)
      .single();

    if (!performerProfile?.is_admin) {
      if (!performerProfile?.passed_qualification) {
        return NextResponse.json(
          {
            success: false,
            error: 'Vous devez réussir le test de qualification prestataire pour pouvoir postuler.',
            requiresQualification: true,
          },
          { status: 403 }
        );
      }

      const hasActiveSub = performerProfile.subscription_active_until && new Date(performerProfile.subscription_active_until) > new Date();
      const freeRemaining = Number(performerProfile.free_tasks_remaining ?? 3);

      if (!hasActiveSub && freeRemaining <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Vos 3 candidatures d\'essai sont épuisées. Activez votre Pass Prestataire pour continuer à postuler.',
            requiresSubscription: true,
          },
          { status: 403 }
        );
      }

      // If relying on free trial, decrement it
      if (!hasActiveSub && freeRemaining > 0) {
        await supabase
          .from('profiles')
          .update({ free_tasks_remaining: freeRemaining - 1 })
          .eq('id', performerId);
      }
    }

    // Anti-circumvention filter on proposal pitch
    const sanitizedPitch = filterOffPlatformContact(pitch.trim()).sanitizedText;

    const { data: createdBid, error: bidError } = await supabase
      .from('bids')
      .insert({
        task_id: taskId,
        performer_id: performerId,
        pitch: sanitizedPitch,
        proposed_hours: proposedHours,
      })
      .select()
      .single();

    if (bidError) {
      console.error('Bid insertion error:', bidError);
      return NextResponse.json({ success: false, error: 'Vous avez déjà postulé à cette mission.' }, { status: 400 });
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
