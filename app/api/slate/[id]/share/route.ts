import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * POST /api/slate/[id]/share
 * Share a slate post
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

    // Insert share
    const { error: shareError } = await supabase
      .from('slate_shares')
      .insert({
        post_id: postId,
        user_id: user.id,
      });

    if (shareError) {
      return NextResponse.json(
        errorResponse('Failed to share post', shareError.message),
        { status: 500 }
      );
    }

    // Get updated share count (trigger automatically updated it)
    const { data: updatedPost } = await supabase
      .from('slate_posts')
      .select('shares_count')
      .eq('id', postId)
      .single();

    return NextResponse.json(
      successResponse(
        {
          shares_count: updatedPost?.shares_count || 0,
        },
        'Post shared'
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
 * DELETE /api/slate/[id]/share
 * Unshare a slate post
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

    // Delete share
    const { error: deleteError } = await supabase
      .from('slate_shares')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (deleteError) {
      return NextResponse.json(
        errorResponse('Failed to unshare post', deleteError.message),
        { status: 500 }
      );
    }

    // Get updated share count (trigger automatically updated it)
    const { data: updatedPost } = await supabase
      .from('slate_posts')
      .select('shares_count')
      .eq('id', postId)
      .single();

    return NextResponse.json(
      successResponse(
        {
          shares_count: updatedPost?.shares_count || 0,
        },
        'Post unshared'
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
