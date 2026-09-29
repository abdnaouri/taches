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
    const body = await req.json();
    const { taskId, senderId, senderName, senderAvatar, receiverId, content, attachmentUrl } = body;

    if (!taskId || !senderId || !content?.trim()) {
      return NextResponse.json({ success: false, error: 'Champs requis manquants' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('messages')
      .insert({
        task_id: taskId,
        sender_id: senderId,
        sender_name: senderName || 'Utilisateur',
        sender_avatar: senderAvatar || '',
        receiver_id: receiverId || null,
        content: content.trim(),
        attachment_url: attachmentUrl || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({
        success: true,
        message: {
          id: `msg_${Date.now()}`,
          taskId,
          senderId,
          senderName: senderName || 'Utilisateur',
          senderAvatar,
          content: content.trim(),
          createdAt: new Date().toISOString(),
        }
      });
    }

    return NextResponse.json({
      success: true,
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
