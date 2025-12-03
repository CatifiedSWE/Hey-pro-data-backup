import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * POST /api/slate/[id]/save
 * Save/bookmark a slate post
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);

    if (!user) {
      return NextResponse.json(
        errorResponse('Authentication required'),
        { status: 401 }
      );
    }

    const { id: postId } = await params;
    const supabase = createServerClient();

    // Check if post exists
    const { data: post, error: postError } = await supabase
      .from('slate_posts')
      .select('id')
      .eq('id', postId)
      .single();

    if (postError) {
      if (postError.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse('Post not found'),
          { status: 404 }
        );
      }
      return NextResponse.json(
        errorResponse('Failed to fetch post', postError.message),
        { status: 500 }
      );
    }

    // Insert save (UNIQUE constraint will prevent duplicates)
    const { error: saveError } = await supabase
      .from('slate_saved')
      .insert({
        post_id: postId,
        user_id: user.id,
      });

    if (saveError) {
      if (saveError.code === '23505') {
        // Unique violation - already saved
        return NextResponse.json(
          errorResponse('Post already saved'),
          { status: 400 }
        );
      }
      return NextResponse.json(
        errorResponse('Failed to save post', saveError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(null, 'Post saved'),
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/slate/[id]/save
 * Unsave/unbookmark a slate post
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);

    if (!user) {
      return NextResponse.json(
        errorResponse('Authentication required'),
        { status: 401 }
      );
    }

    const { id: postId } = await params;
    const supabase = createServerClient();

    // Delete save
    const { error: deleteError } = await supabase
      .from('slate_saved')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (deleteError) {
      return NextResponse.json(
        errorResponse('Failed to unsave post', deleteError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(null, 'Post unsaved'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
