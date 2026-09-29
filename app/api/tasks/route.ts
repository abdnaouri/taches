export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { initialTasks } from '@/lib/mockData';
import { Task } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vzrmunzfkftydvgmylvu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export async function GET() {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Table doesn't exist yet or other query error
      return NextResponse.json({
        isDbReady: false,
        source: 'fallback',
        tasks: initialTasks,
        message: error.message,
      });
    }

    if (!data || data.length === 0) {
      // Database connected but empty, return initial tasks
      return NextResponse.json({
        isDbReady: true,
        source: 'initial_seeded',
        tasks: initialTasks,
      });
    }

    // Map database snake_case columns to frontend camelCase
    const formattedTasks: Task[] = data.map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      category: t.category,
      status: t.status,
      reward: Number(t.reward),
      platformFee: Number(t.platform_fee),
      totalBudget: Number(t.total_budget),
      timeLimitHours: Number(t.time_limit_hours),
      minLevelRequired: Number(t.min_level_required || 1),
      requiredProofs: t.required_proofs || [],
      applicantsCount: Number(t.applicants_count || 0),
      clientId: t.client_id || 'usr_me_1',
      clientName: t.client_name || 'Client',
      clientAvatar: t.client_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60',
      clientRating: Number(t.client_rating || 5.0),
      clientHireRate: Number(t.client_hire_rate || 100),
      assignedToId: t.assigned_to_id,
      assignedToName: t.assigned_to_name,
      assignedAt: t.assigned_at,
      completedAt: t.completed_at,
      createdAt: t.created_at,
    }));

    return NextResponse.json({
      isDbReady: true,
      source: 'supabase',
      tasks: formattedTasks,
    });
  } catch (err: any) {
    return NextResponse.json({
      isDbReady: false,
      source: 'fallback',
      tasks: initialTasks,
      error: err.message,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getAdminClient();

    const dbPayload = {
      title: body.title,
      description: body.description,
      category: body.category,
      status: body.status || 'OPEN',
      reward: body.reward,
      platform_fee: body.platformFee,
      total_budget: body.totalBudget,
      time_limit_hours: body.timeLimitHours,
      min_level_required: body.minLevelRequired || 1,
      required_proofs: body.requiredProofs || [],
      applicants_count: 0,
      client_name: body.clientName || 'Aero Mehdi (Vous)',
      client_avatar: body.clientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      client_rating: body.clientRating || 5.0,
      client_hire_rate: body.clientHireRate || 100,
      client_id: body.clientId && body.clientId.includes('-') ? body.clientId : undefined,
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert(dbPayload)
      .select()
      .single();

    if (error) {
      console.warn('Could not insert task into Supabase tasks table:', error.message);
      return NextResponse.json({
        success: false,
        error: error.message,
        task: body,
      });
    }

    return NextResponse.json({
      success: true,
      source: 'supabase',
      task: {
        ...body,
        id: data.id,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
