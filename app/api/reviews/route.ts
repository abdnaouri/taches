export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, getAuthenticatedUser } from '@/lib/auth/serverAuth';

export async function GET(req: NextRequest) {
  try {
    const taskId = req.nextUrl.searchParams.get('taskId');
    const userId = req.nextUrl.searchParams.get('userId');
    const supabase = getAdminClient();

    let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (taskId) query = query.eq('task_id', taskId);
    if (userId) query = query.eq('target_user_id', userId);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: true, reviews: [] });
    }

    return NextResponse.json({ success: true, reviews: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);
    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Authentification requise pour publier un avis.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { taskId, targetUserId, rating, comment } = body;

    if (!taskId || !targetUserId || !rating || !comment?.trim()) {
      return NextResponse.json({ success: false, error: 'Champs requis manquants' }, { status: 400 });
    }

    const authorId = authResult.user.id;
    if (authorId === targetUserId) {
      return NextResponse.json({ success: false, error: 'Vous ne pouvez pas vous évaluer vous-même.' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // 1. Verify task existence and completion status
    const { data: task, error: taskErr } = await supabase
      .from('tasks')
      .select('id, client_id, assigned_to_id, status')
      .eq('id', taskId)
      .single();

    if (taskErr || !task) {
      return NextResponse.json({ success: false, error: 'Mission introuvable.' }, { status: 404 });
    }

    if (task.status !== 'COMPLETED' && !authResult.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Un avis officiel ne peut être publié que pour une mission validée et clôturée.' },
        { status: 400 }
      );
    }

    // 2. Strict participant isolation
    const isClient = task.client_id === authorId;
    const isPerformer = task.assigned_to_id === authorId;
    const isAdmin = authResult.isAdmin;

    if (!isClient && !isPerformer && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Seuls le donneur d\'ordre ou le prestataire assigné à cette mission peuvent déposer une évaluation.' },
        { status: 403 }
      );
    }

    // 3. Counterparty validation
    const expectedTarget = isClient ? task.assigned_to_id : task.client_id;
    if (targetUserId !== expectedTarget && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Destinataire de l\'avis non conforme aux intervenants de cette mission.' },
        { status: 400 }
      );
    }

    // 4. Duplicate check
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('task_id', taskId)
      .eq('author_id', authorId)
      .single();

    if (existingReview) {
      return NextResponse.json({ success: false, error: 'Vous avez déjà évalué cette mission.' }, { status: 400 });
    }

    // Fetch author profile
    const { data: authorProf } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', authorId)
      .single();

    const authorName = authorProf?.full_name || (isClient ? 'Client' : 'Prestataire');
    const numericRating = Math.min(5, Math.max(1, Number(rating)));

    // 5. Insert review
    const { data: reviewData, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        task_id: taskId,
        author_id: authorId,
        author_name: authorName,
        target_user_id: targetUserId,
        rating: numericRating,
        comment: comment.trim(),
      })
      .select()
      .single();

    if (reviewError) {
      console.error('Review insertion error:', reviewError);
      return NextResponse.json({ success: false, error: 'Impossible d\'enregistrer l\'avis.' }, { status: 400 });
    }

    // 6. Recalculate target profile rating
    if (targetUserId) {
      const { data: userReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('target_user_id', targetUserId);

      if (userReviews && userReviews.length > 0) {
        const totalRating = userReviews.reduce((acc, r) => acc + Number(r.rating), 0);
        const avgRating = Number((totalRating / userReviews.length).toFixed(2));

        if (isClient) {
          // Reviewing performer
          await supabase
            .from('profiles')
            .update({
              performer_rating: avgRating,
              performer_reviews_count: userReviews.length,
            })
            .eq('id', targetUserId);
        } else {
          // Reviewing customer
          await supabase
            .from('profiles')
            .update({
              customer_rating: avgRating,
            })
            .eq('id', targetUserId);
        }
      }
    }

    return NextResponse.json({
      success: true,
      review: reviewData,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
