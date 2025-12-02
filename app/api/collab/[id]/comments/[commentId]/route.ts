import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * DELETE /api/collab/[id]/comments/[commentId]
 * Delete a comment (owner only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
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

    const { id: collabId, commentId } = params;
    const supabase = createServerClient();

    // Verify comment exists and user owns it
    const { data: comment, error: commentError } = await supabase
      .from('collab_comments')
      .select('id, user_id, collab_id')
      .eq('id', commentId)
      .eq('collab_id', collabId)
      .single();

    if (commentError || !comment) {
      return NextResponse.json(
        errorResponse('Comment not found'),
        { status: 404 }
      );
    }

    if (comment.user_id !== user.id) {
      return NextResponse.json(
        errorResponse('Forbidden: You do not own this comment'),
        { status: 403 }
      );
    }

    // Delete comment (CASCADE will delete replies)
    const { error: deleteError } = await supabase
      .from('collab_comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      console.error('Error deleting comment:', deleteError);
      return NextResponse.json(
        errorResponse('Failed to delete comment', deleteError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(null, 'Comment deleted successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in DELETE /api/collab/[id]/comments/[commentId]:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
