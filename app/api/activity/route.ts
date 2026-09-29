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

    // 1. Fetch recent transactions & tasks
    const { data: recentTasks } = await supabase
      .from('tasks')
      .select('id, title, reward, category, city, status, created_at, assigned_to_name')
      .order('created_at', { ascending: false })
      .limit(10);

    const { count: performersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('active_role', 'PERFORMER');

    const items = (recentTasks || []).map((t: any) => ({
      id: t.id,
      type: t.status === 'COMPLETED' ? 'completed' : t.status === 'IN_PROGRESS' ? 'match' : 'paid',
      city: t.city || 'Casablanca',
      taskTitle: t.title,
      priceDH: Math.round(Number(t.reward || 15) * 10),
      userName: t.assigned_to_name || 'Prestataire vérifié',
      createdAt: t.created_at,
    }));

    return NextResponse.json({
      success: true,
      items: items.length > 0 ? items : [
        { id: '1', type: 'completed', city: 'Casablanca (Maârif)', taskTitle: 'Logo & Charte graphique restaurant', priceDH: 250, userName: 'Yassine M.', createdAt: new Date().toISOString() },
        { id: '2', type: 'match', city: 'Rabat (Agdal)', taskTitle: 'Saisie de 80 factures sous Excel', priceDH: 120, userName: 'Salma K.', createdAt: new Date().toISOString() },
        { id: '3', type: 'paid', city: 'Tanger', taskTitle: 'Configuration boutique YouCan Shop', priceDH: 300, userName: 'Amine B.', createdAt: new Date().toISOString() },
      ],
      activePerformersCount: performersCount && performersCount > 0 ? performersCount : 142,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      items: [],
      activePerformersCount: 142,
      error: err.message,
    });
  }
}
