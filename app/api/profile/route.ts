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
    const userId = req.nextUrl.searchParams.get('userId') || req.nextUrl.searchParams.get('id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { data: dbProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !dbProfile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    const mapped = {
      id: dbProfile.id,
      email: dbProfile.email,
      fullName: dbProfile.full_name,
      avatarUrl: dbProfile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      activeRole: dbProfile.active_role || 'PERFORMER',
      balanceAvailable: Number(dbProfile.balance_available ?? 0),
      balanceEscrow: Number(dbProfile.balance_escrow ?? 0),
      isAdmin: Boolean(dbProfile.is_admin ?? false),
      performerTier: dbProfile.performer_tier || 'level_1',
      performerXp: Number(dbProfile.performer_xp ?? 0),
      performerRating: Number(dbProfile.performer_rating ?? 5.0),
      performerReviewsCount: Number(dbProfile.performer_reviews_count ?? 0),
      performerCompletedTasks: Number(dbProfile.performer_completed_tasks ?? 0),
      passedQualification: Boolean(dbProfile.passed_qualification ?? false),
      customerRating: Number(dbProfile.customer_rating ?? 5.0),
      customerTotalSpent: Number(dbProfile.customer_total_spent ?? 0),
      customerTasksPosted: Number(dbProfile.customer_tasks_posted ?? 0),
      headline: dbProfile.headline || '',
      bio: dbProfile.bio || '',
      city: dbProfile.city || 'Casablanca',
      phone: dbProfile.phone || '',
      whatsappEnabled: dbProfile.whatsapp_enabled !== undefined ? Boolean(dbProfile.whatsapp_enabled) : true,
      cin: dbProfile.cin || '',
      cinVerified: Boolean(dbProfile.cin_verified ?? false),
      languages: dbProfile.languages || [],
      skills: dbProfile.skills || [],
      specializedCategories: dbProfile.specialized_categories || [],
      minTaskReward: dbProfile.min_task_reward ? Number(dbProfile.min_task_reward) : 30,
      isAvailableForHire: dbProfile.is_available_for_hire !== undefined ? Boolean(dbProfile.is_available_for_hire) : true,
      bankName: dbProfile.bank_name || 'CIH Bank',
      bankRib: dbProfile.bank_rib || '',
      bankAccountHolder: dbProfile.bank_account_holder || '',
      portfolio: dbProfile.portfolio || [],
      certifications: dbProfile.certifications || [],
      notifyWhatsapp: dbProfile.notify_whatsapp !== undefined ? Boolean(dbProfile.notify_whatsapp) : true,
      notifyEmail: dbProfile.notify_email !== undefined ? Boolean(dbProfile.notify_email) : true,
      createdAt: dbProfile.created_at || new Date().toISOString(),
    };

    return NextResponse.json({ success: true, profile: mapped, source: 'supabase' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, userId, ...updates } = body;
    const targetId = id || userId;

    if (!targetId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const dbUpdates: Record<string, any> = {};

    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.activeRole !== undefined) dbUpdates.active_role = updates.activeRole;
    if (updates.headline !== undefined) dbUpdates.headline = updates.headline;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.whatsappEnabled !== undefined) dbUpdates.whatsapp_enabled = updates.whatsappEnabled;
    if (updates.cin !== undefined) dbUpdates.cin = updates.cin;
    if (updates.cinVerified !== undefined) dbUpdates.cin_verified = updates.cinVerified;
    if (updates.languages !== undefined) dbUpdates.languages = updates.languages;
    if (updates.skills !== undefined) dbUpdates.skills = updates.skills;
    if (updates.specializedCategories !== undefined) dbUpdates.specialized_categories = updates.specializedCategories;
    if (updates.minTaskReward !== undefined) dbUpdates.min_task_reward = updates.minTaskReward;
    if (updates.isAvailableForHire !== undefined) dbUpdates.is_available_for_hire = updates.isAvailableForHire;
    if (updates.bankName !== undefined) dbUpdates.bank_name = updates.bankName;
    if (updates.bankRib !== undefined) dbUpdates.bank_rib = updates.bankRib;
    if (updates.bankAccountHolder !== undefined) dbUpdates.bank_account_holder = updates.bankAccountHolder;
    if (updates.portfolio !== undefined) dbUpdates.portfolio = updates.portfolio;
    if (updates.certifications !== undefined) dbUpdates.certifications = updates.certifications;
    if (updates.notifyWhatsapp !== undefined) dbUpdates.notify_whatsapp = updates.notifyWhatsapp;
    if (updates.notifyEmail !== undefined) dbUpdates.notify_email = updates.notifyEmail;
    if (updates.balanceAvailable !== undefined) dbUpdates.balance_available = updates.balanceAvailable;
    if (updates.balanceEscrow !== undefined) dbUpdates.balance_escrow = updates.balanceEscrow;
    if (updates.passedQualification !== undefined) dbUpdates.passed_qualification = updates.passedQualification;

    if (Object.keys(dbUpdates).length > 0) {
      const { data, error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', targetId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        profile: data,
      });
    }

    return NextResponse.json({
      success: true,
      updated: { ...updates, id: targetId },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
