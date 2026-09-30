export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, requireAdminUser } from '@/lib/auth/serverAuth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAdminUser(req);
    if (!authResult.isAdmin) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Accès réservé aux administrateurs.' },
        { status: authResult.status || 403 }
      );
    }

    const statusFilter = req.nextUrl.searchParams.get('status') || 'ALL';
    const supabase = getAdminClient();

    let query = supabase
      .from('profiles')
      .select('id, full_name, email, phone, city, cin, cin_verified, cin_document_front_url, cin_document_back_url, kyc_status, kyc_submitted_at, kyc_rejection_reason, avatar_url, performer_tier, created_at')
      .order('kyc_submitted_at', { ascending: false, nullsFirst: false });

    if (statusFilter !== 'ALL') {
      query = query.eq('kyc_status', statusFilter);
    } else {
      // Return profiles that either submitted KYC or have documents or have status
      query = query.or('kyc_status.neq.UNVERIFIED,cin_document_front_url.is.not.null,cin.is.not.null');
    }

    const { data: items, error } = await query;

    if (error) {
      console.error('Error fetching KYC submissions:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const mapped = (items || []).map((p: any) => ({
      userId: p.id,
      fullName: p.full_name,
      email: p.email,
      phone: p.phone || '',
      city: p.city || 'Casablanca',
      cin: p.cin || '',
      cinVerified: Boolean(p.cin_verified ?? false),
      cinDocumentFrontUrl: p.cin_document_front_url || '',
      cinDocumentBackUrl: p.cin_document_back_url || '',
      kycStatus: p.kyc_status || (p.cin_verified ? 'VERIFIED' : 'UNVERIFIED'),
      kycSubmittedAt: p.kyc_submitted_at || p.created_at,
      kycRejectionReason: p.kyc_rejection_reason || '',
      avatarUrl: p.avatar_url || '',
      performerTier: p.performer_tier || 'level_1',
      createdAt: p.created_at,
    }));

    return NextResponse.json({
      success: true,
      items: mapped,
    });
  } catch (err: any) {
    console.error('Admin KYC GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdminUser(req);
    if (!authResult.isAdmin) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Accès réservé aux administrateurs.' },
        { status: authResult.status || 403 }
      );
    }

    const body = await req.json();
    const { userId, action, rejectionReason } = body;

    if (!userId || !action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Paramètres manquants : userId et action (APPROVE | REJECT) requis.' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    const updates: Record<string, any> = {};
    if (action === 'APPROVE') {
      updates.kyc_status = 'VERIFIED';
      updates.cin_verified = true;
      updates.kyc_rejection_reason = null;
    } else {
      updates.kyc_status = 'REJECTED';
      updates.cin_verified = false;
      updates.kyc_rejection_reason = rejectionReason || 'Documents illisibles ou non conformes.';
    }

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Admin KYC update error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      action,
      userId,
      profile: updatedProfile,
      message: action === 'APPROVE' ? 'Dossier KYC approuvé avec succès.' : 'Dossier KYC rejeté.',
    });
  } catch (err: any) {
    console.error('Admin KYC POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
