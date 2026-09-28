import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

if (typeof window === 'undefined' && typeof (globalThis as any).WebSocket === 'undefined') {
  (globalThis as any).WebSocket = class WebSocket {};
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vzrmunzfkftydvgmylvu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const admin = getAdminClient();
    const assignedRole = role === 'PERFORMER' ? 'PERFORMER' : 'CUSTOMER';
    const name = fullName?.trim() || email.split('@')[0];
    const defaultAvatar = assignedRole === 'PERFORMER'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'
      : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120';

    // Create user in Supabase Auth with email pre-confirmed
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        avatar_url: defaultAvatar,
        active_role: assignedRole,
      },
    });

    if (authError) {
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: 'Could not create user account' },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // Ensure profile in public.profiles exists and has the requested role
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      await admin
        .from('profiles')
        .update({
          full_name: name,
          avatar_url: defaultAvatar,
          active_role: assignedRole,
        })
        .eq('id', userId);
    } else {
      await admin
        .from('profiles')
        .insert({
          id: userId,
          email,
          full_name: name,
          avatar_url: defaultAvatar,
          active_role: assignedRole,
          balance_available: 100.00,
          balance_escrow: 0.00,
          passed_qualification: true,
        });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: authData.user.email,
        fullName: name,
        activeRole: assignedRole,
      },
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
