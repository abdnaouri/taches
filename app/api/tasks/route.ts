export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Task } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vzrmunzfkftydvgmylvu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

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
    const body = await req.json();
    const supabase = getAdminClient();

    if (!body.title || !body.reward) {
      return NextResponse.json(
        { success: false, error: 'Titre et rémunération sont obligatoires' },
        { status: 400 }
      );
    }

    const reward = Number(body.reward);
    const platformFee = Number(body.platformFee || 0);
    const totalBudget = Number(body.totalBudget || (reward + platformFee));

    const dbPayload: Record<string, any> = {
      title: body.title.trim(),
      description: (body.description || '').trim(),
      category: body.category || 'assistance',
      status: body.status || 'OPEN',
      reward,
      platform_fee: platformFee,
      total_budget: totalBudget,
      time_limit_hours: Number(body.timeLimitHours || 24),
      min_level_required: Number(body.minLevelRequired || 1),
      required_proofs: body.requiredProofs || [],
      applicants_count: 0,
      client_name: body.clientName || 'Client',
      client_avatar: body.clientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      client_rating: Number(body.clientRating || 5.0),
      client_hire_rate: Number(body.clientHireRate || 100),
    };

    if (body.clientId && body.clientId.includes('-')) {
      dbPayload.client_id = body.clientId;
    }

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

    // Lock Escrow & Record transaction if valid clientId
    if (dbPayload.client_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance_available, balance_escrow, customer_tasks_posted')
        .eq('id', dbPayload.client_id)
        .single();

      if (profile) {
        const newAvailable = Math.max(0, Number(profile.balance_available || 0) - totalBudget);
        const newEscrow = Number(profile.balance_escrow || 0) + totalBudget;
        const newPosted = Number(profile.customer_tasks_posted || 0) + 1;

        await supabase
          .from('profiles')
          .update({
            balance_available: newAvailable,
            balance_escrow: newEscrow,
            customer_tasks_posted: newPosted,
          })
          .eq('id', dbPayload.client_id);

        await supabase
          .from('transactions')
          .insert({
            user_id: dbPayload.client_id,
            type: 'ESCROW_LOCK',
            amount: totalBudget,
            currency: 'EUR',
            description: `Séquestre Daman bloqué pour mission #${data.id.slice(0, 8)}: "${data.title.slice(0, 30)}"`,
            status: 'COMPLETED',
          });
      }
    }

    const createdTask: Task = {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
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
