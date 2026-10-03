export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getAuthenticatedUser } from '@/lib/auth/serverAuth';
import { filterOffPlatformContact } from '@/lib/antiCircumvention';

export async function GET(req: NextRequest) {
  try {
    const taskId = req.nextUrl.searchParams.get('taskId');
    if (!taskId) {
      return NextResponse.json({ success: false, error: 'taskId requis' }, { status: 400 });
    }

    const authResult = await getAuthenticatedUser(req);
    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Authentification requise pour lire les messages.' },
        { status: 401 }
      );
    }

    const supabase = getAdminClient();
    const callerId = authResult.user.id;

    // Check task access permission: caller must be client, assigned performer, admin, bidding applicant, or participant on open task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, client_id, assigned_to_id, status')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ success: false, error: 'Mission introuvable.' }, { status: 404 });
    }

    const isClient = Boolean(task.client_id && task.client_id === callerId);
    const isAssigned = Boolean(task.assigned_to_id && task.assigned_to_id === callerId);
    const isAdmin = authResult.isAdmin;

    let isApplicant = false;
    if (!isClient && !isAssigned && !isAdmin) {
      const { data: bid } = await supabase
        .from('bids')
        .select('id')
        .eq('task_id', taskId)
        .eq('performer_id', callerId)
        .maybeSingle();

      isApplicant = Boolean(bid);
    }

    const isOpenTask = task.status === 'OPEN';

    if (!isClient && !isAssigned && !isAdmin && !isApplicant && !isOpenTask) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé à cette discussion.' },
        { status: 403 }
      );
    }

    let query = supabase
      .from('messages')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    // Strict Workzilla Chat Privacy Isolation:
    // - Unassigned applicants & prospective candidates on OPEN task ONLY see their own 1-on-1 dialogue with the client or broadcasts.
    // - Assigned performer sees workspace discussion between client and themselves, plus room/system announcements.
    // - Client and admin see the full dialogue.
    if (!isClient && !isAdmin) {
      if (isAssigned) {
        query = query.or(`sender_id.eq.${callerId},receiver_id.eq.${callerId},receiver_id.is.null`);
      } else {
        query = query.or(`sender_id.eq.${callerId},receiver_id.eq.${callerId}`);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Messages table query error:', error.message);
      // If table does not exist or has cache error, return empty messages list rather than crashing
      return NextResponse.json({ 
        success: true, 
        messages: [],
        warning: error.code === 'PGRST205' ? 'Messages table not found in database. Please run migration script.' : undefined
      });
    }

    const formattedMessages = (data || []).map((m: any) => ({
      id: m.id,
      taskId: m.task_id,
      senderId: m.sender_id,
      senderName: m.sender_name,
      senderAvatar: m.sender_avatar,
      receiverId: m.receiver_id,
      content: m.content,
      attachmentUrl: m.attachment_url,
      createdAt: m.created_at,
    }));

    return NextResponse.json({ success: true, messages: formattedMessages });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);
    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Authentification requise pour envoyer un message.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { taskId, receiverId, content, attachmentUrl } = body;

    if (!taskId || !content?.trim()) {
      return NextResponse.json({ success: false, error: 'Champs requis manquants (taskId, content)' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const senderId = authResult.user.id;

    // 1. Verify task exists and caller is authorized to participate
    const { data: task, error: taskErr } = await supabase
      .from('tasks')
      .select('id, client_id, assigned_to_id, status')
      .eq('id', taskId)
      .single();

    if (taskErr || !task) {
      return NextResponse.json({ success: false, error: 'Mission introuvable.' }, { status: 404 });
    }

    const isClient = Boolean(task.client_id && task.client_id === senderId);
    const isAssigned = Boolean(task.assigned_to_id && task.assigned_to_id === senderId);
    const isAdmin = authResult.isAdmin;
    const isOpenTask = task.status === 'OPEN';

    let isApplicant = false;
    if (!isClient && !isAssigned && !isAdmin) {
      const { data: bid } = await supabase
        .from('bids')
        .select('id')
        .eq('task_id', taskId)
        .eq('performer_id', senderId)
        .maybeSingle();

      isApplicant = Boolean(bid);
    }

    const canParticipate = isClient || isAssigned || isAdmin || isApplicant || isOpenTask;
    if (!canParticipate) {
      return NextResponse.json(
        { success: false, error: 'Vous devez faire partie des participants ou candidats de cette mission pour envoyer un message.' },
        { status: 403 }
      );
    }

    // 2. Pre-assignment candidate guard: unassigned applicants cannot message if task has been assigned to someone else
    if (isApplicant && !isAssigned && !isClient && !isAdmin && !isOpenTask) {
      return NextResponse.json(
        { success: false, error: 'Cette mission a déjà été confiée à un prestataire. La phase de candidature est terminée.' },
        { status: 403 }
      );
    }

    // 3. Resolve proper receiver_id (ensure valid string or null)
    let targetReceiverId: string | null = null;
    if (receiverId && typeof receiverId === 'string' && receiverId.trim().length > 0 && receiverId !== 'null' && receiverId !== 'undefined') {
      targetReceiverId = receiverId.trim();
    } else {
      if ((isApplicant || !isClient) && task.client_id) {
        targetReceiverId = task.client_id;
      } else if (isClient && task.assigned_to_id) {
        targetReceiverId = task.assigned_to_id;
      }
    }

    // 4. Fetch or ensure sender profile exists in public.profiles to prevent foreign key errors
    const { data: senderProf } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', senderId)
      .maybeSingle();

    let senderName = senderProf?.full_name || authResult.user.user_metadata?.full_name || 'Utilisateur';
    let senderAvatar = senderProf?.avatar_url || authResult.user.user_metadata?.avatar_url || '';

    if (!senderProf) {
      // Auto-provision profile row if not present yet
      const { data: newProf } = await supabase
        .from('profiles')
        .upsert({
          id: senderId,
          email: authResult.user.email || '',
          full_name: senderName,
          avatar_url: senderAvatar,
          active_role: 'CUSTOMER',
        })
        .select('full_name, avatar_url')
        .maybeSingle();

      if (newProf) {
        senderName = newProf.full_name || senderName;
        senderAvatar = newProf.avatar_url || senderAvatar;
      }
    }

    // 5. Workzilla & Upwork-grade Anti-circumvention filter
    const securityCheck = filterOffPlatformContact(content.trim());
    const finalContent = securityCheck.sanitizedText;

    const { data, error } = await supabase
      .from('messages')
      .insert({
        task_id: taskId,
        sender_id: senderId,
        sender_name: senderName,
        sender_avatar: senderAvatar,
        receiver_id: targetReceiverId,
        content: finalContent,
        attachment_url: attachmentUrl || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to insert message into Supabase:', error);
      if (error.code === 'PGRST205') {
        return NextResponse.json({
          success: false,
          error: "La table 'messages' n'est pas encore créée dans Supabase. Veuillez exécuter la migration SQL.",
          missingTable: true,
        }, { status: 503 });
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      hasCircumventionWarning: securityCheck.hasViolation,
      warningMessage: securityCheck.warningMessage,
      message: {
        id: data.id,
        taskId: data.task_id,
        senderId: data.sender_id,
        senderName: data.sender_name,
        senderAvatar: data.sender_avatar,
        receiverId: data.receiver_id,
        content: data.content,
        attachmentUrl: data.attachment_url,
        createdAt: data.created_at,
      }
    });
  } catch (err: any) {
    console.error('POST /api/messages uncaught error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
