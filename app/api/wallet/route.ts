export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { initialTransactions } from '@/lib/mockData';
import { WalletTransaction } from '@/types/database';

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
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({
        isDbReady: !error,
        transactions: initialTransactions,
      });
    }

    const formatted: WalletTransaction[] = data.map((t: any) => ({
      id: t.id,
      userId: t.user_id,
      type: t.type,
      amount: Number(t.amount),
      currency: t.currency || 'EUR',
      description: t.description,
      status: t.status || 'COMPLETED',
      createdAt: t.created_at,
    }));

    return NextResponse.json({
      isDbReady: true,
      transactions: formatted,
    });
  } catch (err: any) {
    return NextResponse.json({
      isDbReady: false,
      transactions: initialTransactions,
      error: err.message,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getAdminClient();

    if (body.userId && body.userId.includes('-')) {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: body.userId,
          type: body.type,
          amount: body.amount,
          currency: body.currency || 'EUR',
          description: body.description,
          status: body.status || 'COMPLETED',
        })
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, transaction: data });
      }
    }

    return NextResponse.json({ success: true, transaction: body });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
