import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * PATCH /api/slate/comment/[commentId]
 * Edit a comment (owner only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
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

    const body = await request.json();
    const { commentId } = await params;
    const { content } = body;

    // Validate content
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        errorResponse('Content is required'),
        { status: 400 }
      );
    }

    if (content.length < 1 || content.length > 2000) {
      return NextResponse.json(
        errorResponse('Content must be between 1 and 2000 characters'),
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Verify comment exists and user is owner
    const { data: existingComment, error: fetchError } = await supabase
      .from('slate_comments')
      .select('id, user_id')
      .eq('id', commentId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse('Comment not found'),
          { status: 404 }
        );
      }
      return NextResponse.json(
        errorResponse('Failed to fetch comment', fetchError.message),
        { status: 500 }
      );
    }

    if (existingComment.user_id !== user.id) {
      return NextResponse.json(
        errorResponse('You do not have permission to edit this comment'),
        { status: 403 }
      );
    }

    // Update comment - fetch without author join
    const { data: updatedComment, error: updateError } = await supabase
      .from('slate_comments')
      .update({ content })
      .eq('id', commentId)
      .select(`
        id,
        content,
        parent_comment_id,
        created_at,
        updated_at,
        user_id
      `)
      .single();

    if (updateError) {
      return NextResponse.json(
        errorResponse('Failed to update comment', updateError.message),
        { status: 500 }
      );
    }

    // Fetch user profile for comment author
    let userProfile: any = null;
    let googleAvatar: string = '';
    
    if (updatedComment.user_id) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_id, alias_first_name, alias_surname, profile_photo_url')
        .eq('user_id', updatedComment.user_id)
        .single();
      userProfile = profile;

      // Fetch Google auth avatar as fallback
      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(updatedComment.user_id);
      if (authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture) {
        googleAvatar = authUser.user_metadata.avatar_url || authUser.user_metadata.picture;
      }
    }

    // Format response
    const formattedComment = {
      id: updatedComment.id,
      content: updatedComment.content,
      parent_comment_id: updatedComment.parent_comment_id,
      created_at: updatedComment.created_at,
      updated_at: updatedComment.updated_at,
      author: {
        id: updatedComment.user_id,
        name: `${userProfile?.alias_first_name || ''} ${userProfile?.alias_surname || ''}`.trim(),
        avatar: userProfile?.profile_photo_url || googleAvatar || '',
      },
    };

    return NextResponse.json(
      successResponse(formattedComment, 'Comment updated'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/slate/comment/[commentId]
 * Delete a comment (owner only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { commentId: string } }
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

    const commentId = params.commentId;
    const supabase = createServerClient();

    // Verify comment exists and user is owner
    const { data: existingComment, error: fetchError } = await supabase
      .from('slate_comments')
      .select('id, user_id')
      .eq('id', commentId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse('Comment not found'),
          { status: 404 }
        );
      }
      return NextResponse.json(
        errorResponse('Failed to fetch comment', fetchError.message),
        { status: 500 }
      );
    }

    if (existingComment.user_id !== user.id) {
      return NextResponse.json(
        errorResponse('You do not have permission to delete this comment'),
        { status: 403 }
      );
    }

    // Delete comment (CASCADE will handle nested replies)
    const { error: deleteError } = await supabase
      .from('slate_comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      return NextResponse.json(
        errorResponse('Failed to delete comment', deleteError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(null, 'Comment deleted'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
