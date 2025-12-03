import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * DELETE /api/collab/[id]/collaborators/[userId]
 * Remove a collaborator (owner only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
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

    const { id: collabId, userId: collaboratorUserId } = await params;
    const supabase = createServerClient();

    // Verify ownership
    const { data: collab, error: fetchError } = await supabase
      .from('collab_posts')
      .select('user_id')
      .eq('id', collabId)
      .single();

    if (fetchError || !collab) {
      return NextResponse.json(
        errorResponse('Collab not found'),
        { status: 404 }
      );
    }

    if (collab.user_id !== user.id) {
      return NextResponse.json(
        errorResponse('Forbidden: Only the owner can remove collaborators'),
        { status: 403 }
      );
    }

    // Delete collaborator
    const { error: deleteError } = await supabase
      .from('collab_collaborators')
      .delete()
      .eq('collab_id', collabId)
      .eq('user_id', collaboratorUserId);

    if (deleteError) {
      console.error('Error removing collaborator:', deleteError);
      return NextResponse.json(
        errorResponse('Failed to remove collaborator', deleteError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(null, 'Collaborator removed successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in DELETE /api/collab/[id]/collaborators/[userId]:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
