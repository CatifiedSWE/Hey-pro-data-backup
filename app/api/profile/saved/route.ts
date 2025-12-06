import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/profile/saved
 * Get all saved/bookmarked profiles for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);

    if (!user) {
      return NextResponse.json(
        errorResponse('Authentication required'),
        { status: 401 }
      );
    }

    const supabase = createServerClient();

    // Fetch saved profiles with profile details
    const { data: savedProfiles, error: savedError } = await supabase
      .from('profile_saves')
      .select(`
        id,
        profile_user_id,
        created_at,
        user_profiles!profile_saves_profile_user_id_fkey (
          id,
          user_id,
          name,
          avatar,
          bio,
          location,
          city,
          country,
          available_from
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (savedError) {
      console.error('Error fetching saved profiles:', savedError);
      return NextResponse.json(
        errorResponse('Failed to fetch saved profiles', savedError.message),
        { status: 500 }
      );
    }

    // Format the response
    const profiles = (savedProfiles || []).map((save: any) => {
      const profile = save.user_profiles;
      return {
        save_id: save.id,
        saved_at: save.created_at,
        user_id: save.profile_user_id,
        profile: profile ? {
          id: profile.id,
          user_id: profile.user_id,
          name: profile.name || 'Anonymous',
          avatar: profile.avatar || '/default-profile.png',
          bio: profile.bio || '',
          location: profile.location || '',
          city: profile.city || '',
          country: profile.country || '',
          available_from: profile.available_from
        } : null
      };
    }).filter((item: any) => item.profile !== null);

    return NextResponse.json(
      successResponse(
        {
          profiles,
          count: profiles.length
        },
        'Saved profiles fetched successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/profile/saved:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
