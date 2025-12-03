import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * POST /api/collab/[id]/interest
 * Express interest in collab post
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

    // Prevent expressing interest in own collab
    if (collab.user_id === user.id) {
      return NextResponse.json(
        errorResponse('Cannot express interest in your own collab'),
        { status: 400 }
      );
    }

    // Check if already expressed interest
    const { data: existingInterest } = await supabase
      .from('collab_interests')
      .select('id')
      .eq('collab_id', collabId)
      .eq('user_id', user.id)
      .single();

    if (existingInterest) {
      return NextResponse.json(
        errorResponse('You have already expressed interest in this collab'),
        { status: 409 }
      );
    }

    // Insert interest
    const { data: interest, error: insertError } = await supabase
      .from('collab_interests')
      .insert({
        collab_id: collabId,
        user_id: user.id
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting interest:', insertError);
      return NextResponse.json(
        errorResponse('Failed to express interest', insertError.message),
        { status: 500 }
      );
    }

    // Get total interest count
    const { count: totalInterests } = await supabase
      .from('collab_interests')
      .select('*', { count: 'exact', head: true })
      .eq('collab_id', collabId);

    return NextResponse.json(
      successResponse(
        {
          collab_id: interest.collab_id,
          user_id: interest.user_id,
          created_at: interest.created_at,
          totalInterests: totalInterests || 0
        },
        'Interest expressed successfully'
      ),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/collab/[id]/interest:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/collab/[id]/interest
 * Remove interest from collab post
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

    // Delete interest
    const { error: deleteError } = await supabase
      .from('collab_interests')
      .delete()
      .eq('collab_id', collabId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error removing interest:', deleteError);
      return NextResponse.json(
        errorResponse('Failed to remove interest', deleteError.message),
        { status: 500 }
      );
    }

    // Get updated total interest count
    const { count: totalInterests } = await supabase
      .from('collab_interests')
      .select('*', { count: 'exact', head: true })
      .eq('collab_id', collabId);

    return NextResponse.json(
      successResponse(
        {
          totalInterests: totalInterests || 0
        },
        'Interest removed successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in DELETE /api/collab/[id]/interest:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
