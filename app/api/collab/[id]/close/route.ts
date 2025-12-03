import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * PATCH /api/collab/[id]/close
 * Close a collab post (owner only)
 */
export async function PATCH(
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

    const { id: collabId } = await params;
    const supabase = createServerClient();

    // Verify ownership
    const { data: collab, error: fetchError } = await supabase
      .from('collab_posts')
      .select('user_id, status')
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
        errorResponse('Forbidden: Only the owner can close this collab'),
        { status: 403 }
      );
    }

    // Update status to closed
    const { data: updatedCollab, error: updateError } = await supabase
      .from('collab_posts')
      .update({ status: 'closed' })
      .eq('id', collabId)
      .select('id, status, updated_at')
      .single();

    if (updateError) {
      console.error('Error closing collab:', updateError);
      return NextResponse.json(
        errorResponse('Failed to close collab', updateError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(
        {
          id: updatedCollab.id,
          status: updatedCollab.status,
          updated_at: updatedCollab.updated_at
        },
        'Collab closed successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in PATCH /api/collab/[id]/close:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
