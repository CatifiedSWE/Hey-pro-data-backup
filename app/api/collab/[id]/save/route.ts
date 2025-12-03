import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * POST /api/collab/[id]/save
 * Save/bookmark a collab post
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

    const { id: collabId } = await params;
    const supabase = createServerClient();

    // Check if collab exists
    const { data: collab, error: collabError } = await supabase
      .from('collab_posts')
      .select('id, user_id')
      .eq('id', collabId)
      .single();

    if (collabError || !collab) {
      return NextResponse.json(
        errorResponse('Collab not found'),
        { status: 404 }
      );
    }

    // Check if already saved
    const { data: existingSave } = await supabase
      .from('collab_saves')
      .select('id')
      .eq('collab_id', collabId)
      .eq('user_id', user.id)
      .single();

    if (existingSave) {
      return NextResponse.json(
        errorResponse('Collab already saved'),
        { status: 409 }
      );
    }

    // Create save
    const { data: save, error: saveError } = await supabase
      .from('collab_saves')
      .insert({
        collab_id: collabId,
        user_id: user.id
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving collab:', saveError);
      return NextResponse.json(
        errorResponse('Failed to save collab', saveError.message),
        { status: 500 }
      );
    }

    // Get total saves count
    const { count } = await supabase
      .from('collab_saves')
      .select('*', { count: 'exact', head: true })
      .eq('collab_id', collabId);

    return NextResponse.json(
      successResponse(
        {
          save_id: save.id,
          collab_id: collabId,
          user_id: user.id,
          created_at: save.created_at,
          totalSaves: count || 0
        },
        'Collab saved successfully'
      ),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/collab/[id]/save:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/collab/[id]/save
 * Remove save/bookmark from a collab post
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

    const { id: collabId } = await params;
    const supabase = createServerClient();

    // Delete save
    const { error: deleteError } = await supabase
      .from('collab_saves')
      .delete()
      .eq('collab_id', collabId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error removing save:', deleteError);
      return NextResponse.json(
        errorResponse('Failed to remove save', deleteError.message),
        { status: 500 }
      );
    }

    // Get total saves count
    const { count } = await supabase
      .from('collab_saves')
      .select('*', { count: 'exact', head: true })
      .eq('collab_id', collabId);

    return NextResponse.json(
      successResponse(
        {
          totalSaves: count || 0
        },
        'Save removed successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in DELETE /api/collab/[id]/save:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
