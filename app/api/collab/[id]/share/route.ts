import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * POST /api/collab/[id]/share
 * Track when a collab post is shared
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
    const body = await request.json();
    const { share_type } = body;

    // Validate share type
    const validShareTypes = ['link', 'twitter', 'linkedin', 'facebook'];
    if (!share_type || !validShareTypes.includes(share_type)) {
      return NextResponse.json(
        errorResponse('Invalid share type. Must be one of: link, twitter, linkedin, facebook'),
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if collab exists
    const { data: collab, error: collabError } = await supabase
      .from('collab_posts')
      .select('id, title')
      .eq('id', collabId)
      .single();

    if (collabError || !collab) {
      return NextResponse.json(
        errorResponse('Collab not found'),
        { status: 404 }
      );
    }

    // Create share record
    const { data: share, error: shareError } = await supabase
      .from('collab_shares')
      .insert({
        collab_id: collabId,
        user_id: user.id,
        share_type
      })
      .select()
      .single();

    if (shareError) {
      console.error('Error creating share:', shareError);
      return NextResponse.json(
        errorResponse('Failed to record share', shareError.message),
        { status: 500 }
      );
    }

    // Get total shares count
    const { count } = await supabase
      .from('collab_shares')
      .select('*', { count: 'exact', head: true })
      .eq('collab_id', collabId);

    return NextResponse.json(
      successResponse(
        {
          share_id: share.id,
          collab_id: collabId,
          share_type,
          totalShares: count || 0,
          created_at: share.created_at
        },
        'Share recorded successfully'
      ),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/collab/[id]/share:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
