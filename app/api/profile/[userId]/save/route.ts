import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * POST /api/profile/[userId]/save
 * Save/bookmark a user profile
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
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

    const { userId: profileUserId } = await params;
    const supabase = createServerClient();

    // Prevent users from saving their own profile
    if (user.id === profileUserId) {
      return NextResponse.json(
        errorResponse('Cannot save your own profile'),
        { status: 400 }
      );
    }

    // Check if profile user exists
    const { data: profileUser, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', profileUserId)
      .single();

    if (profileError || !profileUser) {
      return NextResponse.json(
        errorResponse('Profile not found'),
        { status: 404 }
      );
    }

    // Check if already saved
    const { data: existingSave } = await supabase
      .from('profile_saves')
      .select('id')
      .eq('profile_user_id', profileUserId)
      .eq('user_id', user.id)
      .single();

    if (existingSave) {
      return NextResponse.json(
        errorResponse('Profile already saved'),
        { status: 409 }
      );
    }

    // Create save
    const { data: save, error: saveError } = await supabase
      .from('profile_saves')
      .insert({
        profile_user_id: profileUserId,
        user_id: user.id
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving profile:', saveError);
      return NextResponse.json(
        errorResponse('Failed to save profile', saveError.message),
        { status: 500 }
      );
    }

    // Get total saves count for this profile
    const { count } = await supabase
      .from('profile_saves')
      .select('*', { count: 'exact', head: true })
      .eq('profile_user_id', profileUserId);

    return NextResponse.json(
      successResponse(
        {
          save_id: save.id,
          profile_user_id: profileUserId,
          user_id: user.id,
          created_at: save.created_at,
          totalSaves: count || 0
        },
        'Profile saved successfully'
      ),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/profile/[userId]/save:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile/[userId]/save
 * Remove save/bookmark from a user profile
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
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

    const { userId: profileUserId } = await params;
    const supabase = createServerClient();

    // Delete save
    const { error: deleteError } = await supabase
      .from('profile_saves')
      .delete()
      .eq('profile_user_id', profileUserId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error removing save:', deleteError);
      return NextResponse.json(
        errorResponse('Failed to remove save', deleteError.message),
        { status: 500 }
      );
    }

    // Get total saves count for this profile
    const { count } = await supabase
      .from('profile_saves')
      .select('*', { count: 'exact', head: true })
      .eq('profile_user_id', profileUserId);

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
    console.error('Error in DELETE /api/profile/[userId]/save:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
