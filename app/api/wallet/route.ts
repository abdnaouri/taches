export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getAuthenticatedUser } from '@/lib/auth/serverAuth';
import { WalletTransaction } from '@/types/database';

export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);
    if (!authResult.user) {
      return NextResponse.json(
        { success: false, isDbReady: false, transactions: [], error: authResult.error || 'Authentification requise.' },
        { status: 401 }
      );
    }

    const requestedUserId = req.nextUrl.searchParams.get('userId');
    const targetUserId = authResult.isAdmin && requestedUserId ? requestedUserId : authResult.user.id;

    const supabase = getAdminClient();

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching transactions from Supabase:', error);
      return NextResponse.json({
        success: false,
        isDbReady: false,
        transactions: [],
        error: error.message,
      }, { status: 500 });
    }

    const formatted: WalletTransaction[] = (data || []).map((t: any) => ({
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
      success: true,
      isDbReady: true,
      transactions: formatted,
    });
  } catch (err: any) {
    console.error('Wallet GET error:', err);
    return NextResponse.json({
      success: false,
      isDbReady: false,
      transactions: [],
      error: err.message,
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);
    if (!authResult.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Seuls les processus autorisés ou administrateurs peuvent insérer directement des transactions.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, type, amount, currency = 'EUR', description, status = 'COMPLETED' } = body;

    if (!userId || !type || amount === undefined || !description) {
      return NextResponse.json(
        { success: false, error: 'Champs obligatoires manquants (userId, type, amount, description)' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type,
        amount: Number(amount),
        currency,
        description,
        status,
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording transaction:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    const formatted: WalletTransaction = {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      amount: Number(data.amount),
      currency: data.currency,
      description: data.description,
      status: data.status,
      createdAt: data.created_at,
    };

    return NextResponse.json({ success: true, transaction: formatted });
  } catch (err: any) {
    console.error('Wallet POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
