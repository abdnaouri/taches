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
    const body = await req.json();
    const { taskId, authorId, authorName, targetUserId, rating, comment } = body;

    if (!taskId || !authorId || !targetUserId || !rating || !comment?.trim()) {
      return NextResponse.json({ success: false, error: 'Champs requis manquants' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const numericRating = Math.min(5, Math.max(1, Number(rating)));

    // 1. Insert review
    const { data: reviewData, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        task_id: taskId,
        author_id: authorId,
        author_name: authorName || 'Client',
        target_user_id: targetUserId,
        rating: numericRating,
        comment: comment.trim(),
      })
      .select()
      .single();

    // 2. Recalculate target profile rating
    if (targetUserId.includes('-')) {
      const { data: userReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('target_user_id', targetUserId);

      if (userReviews && userReviews.length > 0) {
        const totalRating = userReviews.reduce((acc, r) => acc + Number(r.rating), 0);
        const avgRating = Number((totalRating / userReviews.length).toFixed(2));

        await supabase
          .from('profiles')
          .update({
            performer_rating: avgRating,
            performer_reviews_count: userReviews.length,
          })
          .eq('id', targetUserId);
      }
    }

    return NextResponse.json({
      success: true,
      review: reviewData || {
        id: `rev_${Date.now()}`,
        taskId,
        authorId,
        authorName,
        targetUserId,
        rating: numericRating,
        comment,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
