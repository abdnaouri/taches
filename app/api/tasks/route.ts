export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getAuthenticatedUser } from '@/lib/auth/serverAuth';
import { Task } from '@/types/database';
import { sendTelegramTaskAlert } from '@/lib/notificationService';
import { filterOffPlatformContact } from '@/lib/antiCircumvention';

export async function GET(req: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');

    let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tasks from Supabase:', error);
      return NextResponse.json({
        success: false,
        isDbReady: false,
        tasks: [],
        error: error.message,
      }, { status: 500 });
    }

    // Map database snake_case columns to frontend camelCase
    const formattedTasks: Task[] = (data || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      category: t.category,
      subCategory: t.sub_category || undefined,
      city: t.city || 'Casablanca',
      taskMode: t.task_mode || 'single',
      unitPriceDH: t.unit_price_dh ? Number(t.unit_price_dh) : undefined,
      targetExecutionsCount: t.target_executions_count ? Number(t.target_executions_count) : undefined,
      status: t.status,
      reward: Number(t.reward),
      platformFee: Number(t.platform_fee || 0),
      totalBudget: Number(t.total_budget || t.reward),
      timeLimitHours: Number(t.time_limit_hours || 24),
      minLevelRequired: Number(t.min_level_required || 1),
      requiredProofs: t.required_proofs || [],
      applicantsCount: Number(t.applicants_count || 0),
      clientId: t.client_id || '',
      clientName: t.client_name || 'Client',
      clientAvatar: t.client_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60',
      clientRating: Number(t.client_rating || 5.0),
      clientHireRate: Number(t.client_hire_rate || 100),
      assignedToId: t.assigned_to_id || undefined,
      assignedToName: t.assigned_to_name || undefined,
      assignedAt: t.assigned_at || undefined,
      completedAt: t.completed_at || undefined,
      createdAt: t.created_at,
      settlementProposal: t.settlement_proposal || undefined,
      finalPayoutPercentage: t.final_payout_percentage || undefined,
      finalPerformerAmountDH: t.final_performer_amount_dh || undefined,
      finalClientRefundDH: t.final_client_refund_dh || undefined,
    }));

    return NextResponse.json({
      success: true,
      isDbReady: true,
      source: 'supabase',
      tasks: formattedTasks,
    });
  } catch (err: any) {
    console.error('Task GET error:', err);
    return NextResponse.json({
      success: false,
      isDbReady: false,
      tasks: [],
      error: err.message,
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);
    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Authentification requise pour publier une mission.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const supabase = getAdminClient();

    if (!body.title || !body.reward) {
      return NextResponse.json(
        { success: false, error: 'Titre et rémunération sont obligatoires.' },
        { status: 400 }
      );
    }

    const reward = Number(body.reward);
    const platformFee = Number(body.platformFee || 0);
    const totalBudget = Number(body.totalBudget || (reward + platformFee));

    if (totalBudget <= 0) {
      return NextResponse.json(
        { success: false, error: 'Le budget de la mission doit être supérieur à zéro.' },
        { status: 400 }
      );
    }

    const clientId = authResult.user.id;

    // Check client profile balance
    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('balance_available, balance_escrow, customer_tasks_posted, full_name, avatar_url')
      .eq('id', clientId)
      .single();

    if (profErr || !profile) {
      return NextResponse.json(
        { success: false, error: 'Profil client introuvable.' },
        { status: 404 }
      );
    }

    const currentBalance = Number(profile.balance_available || 0);
    if (currentBalance < totalBudget) {
      return NextResponse.json(
        {
          success: false,
          error: `Solde disponible insuffisant (${Math.round(currentBalance * 10)} DH). Veuillez recharger votre compte de ${Math.round((totalBudget - currentBalance) * 10)} DH pour bloquer le séquestre.`,
          requiredAmountDH: Math.round(totalBudget * 10),
          availableBalanceDH: Math.round(currentBalance * 10),
        },
        { status: 402 }
      );
    }

    const sanitizedTitle = filterOffPlatformContact(body.title.trim()).sanitizedText;
    const sanitizedDesc = filterOffPlatformContact((body.description || '').trim()).sanitizedText;

    const dbPayload: Record<string, any> = {
      title: sanitizedTitle,
      description: sanitizedDesc,
      category: body.category || 'assistance',
      sub_category: body.subCategory || undefined,
      city: body.city || 'Casablanca',
      task_mode: body.taskMode || 'single',
      unit_price_dh: body.unitPriceDH ? Number(body.unitPriceDH) : undefined,
      target_executions_count: body.targetExecutionsCount ? Number(body.targetExecutionsCount) : 1,
      anti_spam_keyword: body.antiSpamKeyword || undefined,
      status: 'OPEN',
      reward,
      platform_fee: platformFee,
      total_budget: totalBudget,
      time_limit_hours: Number(body.timeLimitHours || 24),
      min_level_required: Number(body.minLevelRequired || 1),
      required_proofs: body.requiredProofs || [],
      applicants_count: 0,
      client_id: clientId,
      client_name: profile.full_name || body.clientName || 'Client',
      client_avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      client_rating: 5.0,
      client_hire_rate: 100,
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert(dbPayload)
      .select()
      .single();

    if (error) {
      console.error('Could not insert task into Supabase tasks table:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 400 });
    }

    // Lock Escrow atomically
    const newAvailable = Math.max(0, currentBalance - totalBudget);
    const newEscrow = Number(profile.balance_escrow || 0) + totalBudget;
    const newPosted = Number(profile.customer_tasks_posted || 0) + 1;

    await supabase
      .from('profiles')
      .update({
        balance_available: newAvailable,
        balance_escrow: newEscrow,
        customer_tasks_posted: newPosted,
      })
      .eq('id', clientId);

    await supabase
      .from('transactions')
      .insert({
        user_id: clientId,
        type: 'ESCROW_LOCK',
        amount: totalBudget,
        currency: 'EUR',
        description: `Séquestre Daman bloqué pour mission #${data.id.slice(0, 8)}: "${data.title.slice(0, 30)}"`,
        status: 'COMPLETED',
      });

    const createdTask: Task = {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      subCategory: data.sub_category || undefined,
      city: data.city || 'Casablanca',
      taskMode: data.task_mode || 'single',
      unitPriceDH: data.unit_price_dh ? Number(data.unit_price_dh) : undefined,
      targetExecutionsCount: data.target_executions_count ? Number(data.target_executions_count) : undefined,
      status: data.status,
      reward: Number(data.reward),
      platformFee: Number(data.platform_fee || 0),
      totalBudget: Number(data.total_budget || data.reward),
      timeLimitHours: Number(data.time_limit_hours || 24),
      minLevelRequired: Number(data.min_level_required || 1),
      requiredProofs: data.required_proofs || [],
      applicantsCount: Number(data.applicants_count || 0),
      clientId: data.client_id || '',
      clientName: data.client_name,
      clientAvatar: data.client_avatar,
      clientRating: Number(data.client_rating || 5.0),
      clientHireRate: Number(data.client_hire_rate || 100),
      createdAt: data.created_at,
    };

    // Broadcast instant alert to Telegram subscribers (Workzilla / UNU rapid dispatch)
    sendTelegramTaskAlert({
      taskId: data.id,
      title: data.title,
      rewardDH: Math.round(reward * 10),
      category: data.category,
      city: data.city,
      taskMode: data.task_mode,
      timeLimitHours: Number(data.time_limit_hours || 24),
    }).catch((err) => console.warn('Telegram dispatch error:', err));

    return NextResponse.json({
      success: true,
      source: 'supabase',
      task: createdTask,
    });
  } catch (err: any) {
    console.error('Task POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
