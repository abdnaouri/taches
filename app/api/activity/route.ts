export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    // 1. Fetch recent real tasks
    const { data: recentTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title, reward, category, city, status, created_at, assigned_to_name, client_name')
      .order('created_at', { ascending: false })
      .limit(10);

    if (tasksError) {
      console.error('Error fetching activity tasks:', tasksError);
    }

    // 2. Fetch real active performers count
    const { count: performersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('active_role', 'PERFORMER');

    const items = (recentTasks || []).map((t: any) => ({
      id: t.id,
      type: t.status === 'COMPLETED' ? 'completed' : t.status === 'IN_PROGRESS' ? 'match' : 'paid',
      city: t.city || 'Casablanca',
      taskTitle: t.title,
      priceDH: Math.round(Number(t.reward || 0) * 10),
      userName: t.assigned_to_name || t.client_name || 'Utilisateur vérifié',
      createdAt: t.created_at,
    }));

    return NextResponse.json({
      success: true,
      items,
      activePerformersCount: performersCount ?? 0,
    });
  } catch (err: any) {
    console.error('Activity GET error:', err);
    return NextResponse.json({
      success: false,
      items: [],
      activePerformersCount: 0,
      error: err.message,
    }, { status: 500 });
  }
}
