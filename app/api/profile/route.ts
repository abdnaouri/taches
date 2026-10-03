export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getAuthenticatedUser } from '@/lib/auth/serverAuth';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId') || req.nextUrl.searchParams.get('id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const authResult = await getAuthenticatedUser(req);
    const isOwner = authResult.user?.id === userId;
    const isAdmin = authResult.isAdmin;

    const supabase = getAdminClient();
    const { data: dbProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !dbProfile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    // Base public profile (safe to view by anyone)
    const publicProfile = {
      id: dbProfile.id,
      fullName: dbProfile.full_name,
      avatarUrl: dbProfile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      activeRole: dbProfile.active_role || 'PERFORMER',
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
      languages: dbProfile.languages || [],
      skills: dbProfile.skills || [],
      specializedCategories: dbProfile.specialized_categories || [],
      minTaskReward: dbProfile.min_task_reward ? Number(dbProfile.min_task_reward) : 30,
      isAvailableForHire: dbProfile.is_available_for_hire !== undefined ? Boolean(dbProfile.is_available_for_hire) : true,
      portfolio: dbProfile.portfolio || [],
      certifications: dbProfile.certifications || [],
      createdAt: dbProfile.created_at || new Date().toISOString(),
    };

    // Private fields (only for the profile owner or platform admin)
    if (isOwner || isAdmin) {
      const privateProfile = {
        ...publicProfile,
        email: dbProfile.email,
        phone: dbProfile.phone || '',
        whatsappEnabled: dbProfile.whatsapp_enabled !== undefined ? Boolean(dbProfile.whatsapp_enabled) : true,
        cin: dbProfile.cin || '',
        cinVerified: Boolean(dbProfile.cin_verified ?? false),
        cinDocumentFrontUrl: dbProfile.cin_document_front_url || '',
        cinDocumentBackUrl: dbProfile.cin_document_back_url || '',
        kycStatus: dbProfile.kyc_status || (dbProfile.cin_verified ? 'VERIFIED' : 'UNVERIFIED'),
        kycSubmittedAt: dbProfile.kyc_submitted_at || null,
        kycRejectionReason: dbProfile.kyc_rejection_reason || '',
        balanceAvailable: Number(dbProfile.balance_available ?? 0),
        balanceEscrow: Number(dbProfile.balance_escrow ?? 0),
        isAdmin: Boolean(dbProfile.is_admin ?? false),
        bankName: dbProfile.bank_name || 'CIH Bank',
        bankRib: dbProfile.bank_rib || '',
        bankAccountHolder: dbProfile.bank_account_holder || '',
        notifyWhatsapp: dbProfile.notify_whatsapp !== undefined ? Boolean(dbProfile.notify_whatsapp) : true,
        notifyEmail: dbProfile.notify_email !== undefined ? Boolean(dbProfile.notify_email) : true,
      };
      return NextResponse.json({ success: true, profile: privateProfile, source: 'supabase' });
    }

    return NextResponse.json({ success: true, profile: publicProfile, source: 'supabase' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);
    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Authentification requise.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, userId, ...updates } = body;
    const targetId = id || userId || authResult.user.id;

    // Strict Authorization: Only the owner or an admin can update profile
    if (targetId !== authResult.user.id && !authResult.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé à ce profil.' },
        { status: 403 }
      );
    }

    const supabase = getAdminClient();
    const dbUpdates: Record<string, any> = {};

    // Allowed user fields
    if (updates.fullName !== undefined) dbUpdates.full_name = String(updates.fullName).trim();
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.activeRole !== undefined && ['CUSTOMER', 'PERFORMER'].includes(updates.activeRole)) {
      dbUpdates.active_role = updates.activeRole;
    }
    if (updates.headline !== undefined) dbUpdates.headline = updates.headline;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.whatsappEnabled !== undefined) dbUpdates.whatsapp_enabled = Boolean(updates.whatsappEnabled);
    if (updates.cin !== undefined) dbUpdates.cin = updates.cin;
    if (updates.cinDocumentFrontUrl !== undefined) dbUpdates.cin_document_front_url = updates.cinDocumentFrontUrl;
    if (updates.cinDocumentBackUrl !== undefined) dbUpdates.cin_document_back_url = updates.cinDocumentBackUrl;
    if (updates.kycStatus !== undefined && ['UNVERIFIED', 'PENDING'].includes(updates.kycStatus)) {
      dbUpdates.kyc_status = updates.kycStatus;
      dbUpdates.kyc_submitted_at = new Date().toISOString();
    }
    if (updates.languages !== undefined) dbUpdates.languages = updates.languages;
    if (updates.skills !== undefined) dbUpdates.skills = updates.skills;
    if (updates.specializedCategories !== undefined) dbUpdates.specialized_categories = updates.specializedCategories;
    if (updates.minTaskReward !== undefined) dbUpdates.min_task_reward = Number(updates.minTaskReward);
    if (updates.isAvailableForHire !== undefined) dbUpdates.is_available_for_hire = Boolean(updates.isAvailableForHire);
    if (updates.bankName !== undefined) dbUpdates.bank_name = updates.bankName;
    if (updates.bankRib !== undefined) dbUpdates.bank_rib = updates.bankRib;
    if (updates.bankAccountHolder !== undefined) dbUpdates.bank_account_holder = updates.bankAccountHolder;
    if (updates.portfolio !== undefined) dbUpdates.portfolio = updates.portfolio;
    if (updates.certifications !== undefined) dbUpdates.certifications = updates.certifications;
    if (updates.notifyWhatsapp !== undefined) dbUpdates.notify_whatsapp = Boolean(updates.notifyWhatsapp);
    if (updates.notifyEmail !== undefined) dbUpdates.notify_email = Boolean(updates.notifyEmail);

    // Privileged fields (ONLY modifiable by Admin)
    if (authResult.isAdmin) {
      if (updates.cinVerified !== undefined) dbUpdates.cin_verified = Boolean(updates.cinVerified);
      if (updates.kycStatus !== undefined) dbUpdates.kyc_status = updates.kycStatus;
      if (updates.kycRejectionReason !== undefined) dbUpdates.kyc_rejection_reason = updates.kycRejectionReason;
      if (updates.passedQualification !== undefined) dbUpdates.passed_qualification = Boolean(updates.passedQualification);
      if (updates.isAdmin !== undefined) dbUpdates.is_admin = Boolean(updates.isAdmin);
      if (updates.performerTier !== undefined) dbUpdates.performer_tier = updates.performerTier;
    }

    if (Object.keys(dbUpdates).length > 0) {
      let profilePayload: Record<string, any> = { ...dbUpdates };
      let profileResult = await supabase
        .from('profiles')
        .update(profilePayload)
        .eq('id', targetId)
        .select()
        .single();

      let profAttempts = 0;
      while (profileResult.error && profAttempts < 20) {
        const errMsg = profileResult.error.message || '';
        const match = errMsg.match(/Could not find the '([^']+)' column/i);
        if (match && match[1] && match[1] in profilePayload) {
          const missingCol = match[1];
          console.warn(`Column '${missingCol}' not found in Supabase schema cache for profiles. Retrying without it...`);
          delete profilePayload[missingCol];
          profAttempts++;
          profileResult = await supabase
            .from('profiles')
            .update(profilePayload)
            .eq('id', targetId)
            .select()
            .single();
        } else {
          break;
        }
      }

      const { data, error } = profileResult;

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
      updated: { id: targetId },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
