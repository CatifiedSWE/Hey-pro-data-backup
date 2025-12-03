import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * POST /api/slate/[id]/like
 * Like a slate post
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

    // Insert like (UNIQUE constraint will prevent duplicates)
    const { error: likeError } = await supabase
      .from('slate_likes')
      .insert({
        post_id: postId,
        user_id: user.id,
      });

    if (likeError) {
      if (likeError.code === '23505') {
        // Unique violation - already liked
        return NextResponse.json(
          errorResponse('Post already liked'),
          { status: 400 }
        );
      }
      return NextResponse.json(
        errorResponse('Failed to like post', likeError.message),
        { status: 500 }
      );
    }

    // Get updated like count (trigger automatically updated it)
    const { data: updatedPost } = await supabase
      .from('slate_posts')
      .select('likes_count')
      .eq('id', postId)
      .single();

    return NextResponse.json(
      successResponse(
        {
          likes_count: updatedPost?.likes_count || 0,
        },
        'Post liked'
      ),
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
 * DELETE /api/slate/[id]/like
 * Unlike a slate post
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

    // Delete like
    const { error: deleteError } = await supabase
      .from('slate_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (deleteError) {
      return NextResponse.json(
        errorResponse('Failed to unlike post', deleteError.message),
        { status: 500 }
      );
    }

    // Get updated like count (trigger automatically updated it)
    const { data: updatedPost } = await supabase
      .from('slate_posts')
      .select('likes_count')
      .eq('id', postId)
      .single();

    return NextResponse.json(
      successResponse(
        {
          likes_count: updatedPost?.likes_count || 0,
        },
        'Post unliked'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
