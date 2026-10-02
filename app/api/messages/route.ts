export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getAuthenticatedUser } from '@/lib/auth/serverAuth';

import { filterOffPlatformContact } from '@/lib/antiCircumvention';

export async function GET(req: NextRequest) {
  try {
    const taskId = req.nextUrl.searchParams.get('taskId');
    if (!taskId) {
      return NextResponse.json({ success: false, error: 'taskId required' }, { status: 400 });
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

    // Check task access permission: caller must be client, assigned performer, or admin
    const { data: task } = await supabase
      .from('tasks')
      .select('client_id, assigned_to_id')
      .eq('id', taskId)
      .single();

    if (!task) {
      return NextResponse.json({ success: false, error: 'Mission introuvable.' }, { status: 404 });
    }

    const isAuthorized =
      task.client_id === callerId ||
      task.assigned_to_id === callerId ||
      authResult.isAdmin;

    // Also allow applicants who have placed a bid to participate in discussion
    if (!isAuthorized) {
      const { data: bid } = await supabase
        .from('bids')
        .select('id')
        .eq('task_id', taskId)
        .eq('performer_id', callerId)
        .single();

      if (!bid) {
        return NextResponse.json(
          { success: false, error: 'Accès non autorisé à cette discussion.' },
          { status: 403 }
        );
      }
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ success: true, messages: [] });
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

    // Fetch sender profile to guarantee genuine name and avatar
    const { data: senderProf } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', senderId)
      .single();

    const senderName = senderProf?.full_name || 'Utilisateur';
    const senderAvatar = senderProf?.avatar_url || '';

    // Workzilla & Upwork-grade Anti-circumvention filter
    const securityCheck = filterOffPlatformContact(content.trim());
    const finalContent = securityCheck.sanitizedText;

    const { data, error } = await supabase
      .from('messages')
      .insert({
        task_id: taskId,
        sender_id: senderId,
        sender_name: senderName,
        sender_avatar: senderAvatar,
        receiver_id: receiverId || null,
        content: finalContent,
        attachment_url: attachmentUrl || null,
      })
      .select()
      .single();

    if (error) {
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
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
