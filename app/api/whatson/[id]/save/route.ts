import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * POST /api/whatson/[id]/save
 * Save/bookmark a What's On event
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

    const { id: eventId } = await params;
    const supabase = createServerClient();

    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from('whatson_events')
      .select('id, created_by')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        errorResponse('Event not found'),
        { status: 404 }
      );
    }

    // Check if already saved
    const { data: existingSave } = await supabase
      .from('whatson_saves')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single();

    if (existingSave) {
      return NextResponse.json(
        errorResponse('Event already saved'),
        { status: 409 }
      );
    }

    // Create save
    const { data: save, error: saveError } = await supabase
      .from('whatson_saves')
      .insert({
        event_id: eventId,
        user_id: user.id
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving event:', saveError);
      return NextResponse.json(
        errorResponse('Failed to save event', saveError.message),
        { status: 500 }
      );
    }

    // Get total saves count
    const { count } = await supabase
      .from('whatson_saves')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    return NextResponse.json(
      successResponse(
        {
          save_id: save.id,
          event_id: eventId,
          user_id: user.id,
          created_at: save.created_at,
          totalSaves: count || 0
        },
        'Event saved successfully'
      ),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/whatson/[id]/save:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/whatson/[id]/save
 * Remove save/bookmark from a What's On event
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

    const { id: eventId } = await params;
    const supabase = createServerClient();

    // Delete save
    const { error: deleteError } = await supabase
      .from('whatson_saves')
      .delete()
      .eq('event_id', eventId)
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
      .from('whatson_saves')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

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
    console.error('Error in DELETE /api/whatson/[id]/save:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
