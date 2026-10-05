export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getAuthenticatedUser } from '@/lib/auth/serverAuth';
import { filterOffPlatformContact } from '@/lib/antiCircumvention';
import { sendNewBidNotification } from '@/lib/notificationService';

export async function GET(req: NextRequest) {
  try {
    const taskId = req.nextUrl.searchParams.get('taskId');
    if (!taskId) {
      return NextResponse.json({ success: false, error: 'taskId is required' }, { status: 400 });
    }

    const authResult = await getAuthenticatedUser(req);
    const callerId = authResult.user?.id;
    const isAdmin = authResult.isAdmin;

    const supabase = getAdminClient();

    // Fetch task client for permission check
    const { data: task } = await supabase
      .from('tasks')
      .select('client_id')
      .eq('id', taskId)
      .single();

    const isClient = task?.client_id === callerId;

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
        .select('id, full_name, avatar_url, performer_tier, performer_rating, performer_completed_tasks, passed_qualification, cin_verified, kyc_status')
        .in('id', performerIds);

      (profiles || []).forEach((p: any) => profileMap.set(p.id, p));
    }

    // Workzilla Sealed Bids Isolation:
    // Only the task Client, an Admin, or the submitting Performer can read the full pitch.
    // Competitors see candidate presence without access to private proposals or pitch text.
    const formattedBids = (bids || []).map((b: any) => {
      const prof = profileMap.get(b.performer_id) || {};
      const canReadPitch = isClient || isAdmin || (callerId && b.performer_id === callerId);
      const isVerified = Boolean(
        prof.passed_qualification || prof.cin_verified || prof.kyc_status === 'VERIFIED'
      );

      return {
        id: b.id,
        taskId: b.task_id,
        performerId: b.performer_id,
        performerName: prof.full_name || 'Prestataire',
        performerAvatar: prof.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60',
        performerTier: prof.performer_tier || 'level_1',
        performerRating: Number(prof.performer_rating || 5.0),
        performerCompletedCount: Number(prof.performer_completed_tasks || 0),
        isVerified,
        pitch: canReadPitch
          ? b.pitch
          : '🔒 Offre sous pli confidentiel (consultable par le client uniquement).',
        isOwnBid: callerId ? b.performer_id === callerId : false,
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
      .select('title, client_id, status')
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

    // Fetch Performer Profile (for notifications & details)
    const { data: performerProfile } = await supabase
      .from('profiles')
      .select('full_name, performer_tier, performer_rating, passed_qualification, cin_verified, is_admin')
      .eq('id', performerId)
      .single();

    // Anti-circumvention filter on proposal pitch
    const sanitizedPitch = filterOffPlatformContact(pitch.trim()).sanitizedText;

    // Explicit duplicate bid check before insert (better error messages + prevents duplicate error masking other failures)
    const { data: existingBid } = await supabase
      .from('bids')
      .select('id')
      .eq('task_id', taskId)
      .eq('performer_id', performerId)
      .maybeSingle();

    if (existingBid) {
      return NextResponse.json(
        { success: false, error: 'Vous avez déjà postulé à cette mission.' },
        { status: 400 }
      );
    }

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
      return NextResponse.json({ success: false, error: bidError.message }, { status: 400 });
    }

    // Atomic increment of applicants_count to prevent race condition on concurrent bids
    try {
      const { error: rpcErr } = await supabase.rpc('increment_applicants_count', { task_id_param: taskId });
      if (rpcErr) throw rpcErr;
    } catch {
      // Fallback: read-increment-write (less safe but works if RPC not available)
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

    // Notify task client about new applicant (non-blocking)
    if (task.client_id) {
      (async () => {
        try {
          const { data: clientInfo } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', task.client_id)
            .single();

          if (clientInfo?.email) {
            await sendNewBidNotification({
              clientEmail: clientInfo.email,
              clientName: clientInfo.full_name || 'Client',
              clientUserId: task.client_id,
              performerName: performerProfile?.full_name || 'Prestataire',
              performerTier: performerProfile?.performer_tier || 'Niveau 1',
              performerRating: Number(performerProfile?.performer_rating || 5.0),
              taskTitle: task.title || 'Mission',
              taskId,
              proposedHours,
              pitchPreview: sanitizedPitch,
            });
          }
        } catch (notifErr: any) {
          console.warn('[Bids] Failed to send new bid notification:', notifErr.message);
        }
      })();
    }

    return NextResponse.json({
      success: true,
      bid: createdBid,
    });
  } catch (err: any) {
    console.error('Bids POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);
    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Authentification requise.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { bidId, pitch, proposedHours } = body;

    if (!bidId) {
      return NextResponse.json({ success: false, error: 'bidId est requis.' }, { status: 400 });
    }

    const performerId = authResult.user.id;
    const supabase = getAdminClient();

    // Verify ownership
    const { data: existingBid, error: fetchErr } = await supabase
      .from('bids')
      .select('id, performer_id, task_id')
      .eq('id', bidId)
      .maybeSingle();

    if (fetchErr || !existingBid) {
      return NextResponse.json({ success: false, error: 'Candidature introuvable.' }, { status: 404 });
    }

    if (existingBid.performer_id !== performerId) {
      return NextResponse.json(
        { success: false, error: 'Vous ne pouvez modifier que votre propre candidature.' },
        { status: 403 }
      );
    }

    // Ensure task is still OPEN
    const { data: task } = await supabase
      .from('tasks')
      .select('status')
      .eq('id', existingBid.task_id)
      .single();

    if (task?.status !== 'OPEN') {
      return NextResponse.json(
        { success: false, error: "La mission n'est plus ouverte aux modifications." },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {};
    if (pitch?.trim()) {
      updates.pitch = filterOffPlatformContact(pitch.trim()).sanitizedText;
    }
    if (proposedHours !== undefined) {
      updates.proposed_hours = proposedHours;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'Aucun champ à mettre à jour.' }, { status: 400 });
    }

    const { data: updatedBid, error: updateErr } = await supabase
      .from('bids')
      .update(updates)
      .eq('id', bidId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, bid: updatedBid });
  } catch (err: any) {
    console.error('Bids PATCH error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);
    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Authentification requise.' },
        { status: 401 }
      );
    }

    const bidId = req.nextUrl.searchParams.get('bidId');
    if (!bidId) {
      return NextResponse.json({ success: false, error: 'bidId est requis.' }, { status: 400 });
    }

    const callerId = authResult.user.id;
    const supabase = getAdminClient();

    // Verify ownership
    const { data: existingBid, error: fetchErr } = await supabase
      .from('bids')
      .select('id, performer_id, task_id')
      .eq('id', bidId)
      .maybeSingle();

    if (fetchErr || !existingBid) {
      return NextResponse.json({ success: false, error: 'Candidature introuvable.' }, { status: 404 });
    }

    // Ensure task is still OPEN
    const { data: task } = await supabase
      .from('tasks')
      .select('status, client_id')
      .eq('id', existingBid.task_id)
      .single();

    const isPerformer = existingBid.performer_id === callerId;
    const isClient =
      task?.client_id === callerId ||
      (!task?.client_id && (authResult.isAdmin || authResult.user.email === 'aero@example.com')) ||
      (task?.client_id?.startsWith('cli_') && (authResult.isAdmin || authResult.user.email === 'aero@example.com'));
    const isAdmin = Boolean(authResult.isAdmin);

    if (!isPerformer && !isClient && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Vous ne disposez pas des autorisations nécessaires pour supprimer cette candidature.' },
        { status: 403 }
      );
    }

    if (task?.status !== 'OPEN') {
      return NextResponse.json(
        { success: false, error: 'Impossible de modifier les candidatures sur une mission déjà en cours ou clôturée.' },
        { status: 400 }
      );
    }

    const { error: deleteErr } = await supabase.from('bids').delete().eq('id', bidId);

    if (deleteErr) {
      return NextResponse.json({ success: false, error: deleteErr.message }, { status: 400 });
    }

    // Decrement applicants_count
    try {
      const { error: rpcErr } = await supabase.rpc('decrement_applicants_count', { task_id_param: existingBid.task_id });
      if (rpcErr) throw rpcErr;
    } catch {
      const { data: taskData } = await supabase
        .from('tasks')
        .select('applicants_count')
        .eq('id', existingBid.task_id)
        .single();
      const newCount = Math.max(0, Number(taskData?.applicants_count || 0) - 1);
      await supabase.from('tasks').update({ applicants_count: newCount }).eq('id', existingBid.task_id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Bids DELETE error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
