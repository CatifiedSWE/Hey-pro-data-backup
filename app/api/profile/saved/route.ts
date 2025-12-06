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

    // Fetch saved profiles
    const { data: savedProfiles, error: savedError } = await supabase
      .from('profile_saves')
      .select('id, profile_user_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (savedError) {
      console.error('Error fetching saved profiles:', savedError);
      return NextResponse.json(
        errorResponse('Failed to fetch saved profiles', savedError.message),
        { status: 500 }
      );
    }

    // Fetch user profile details for each saved profile
    const profiles = await Promise.all(
      (savedProfiles || []).map(async (save: any) => {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select(`
            id,
            user_id,
            first_name,
            surname,
            alias_first_name,
            alias_surname,
            profile_photo_url,
            bio,
            city,
            country,
            available_for_work
          `)
          .eq('user_id', save.profile_user_id)
          .single();

        if (!profile) return null;

        // Build display name
        const aliasName = `${profile.alias_first_name || ''} ${profile.alias_surname || ''}`.trim();
        const realName = `${profile.first_name || ''} ${profile.surname || ''}`.trim();
        const displayName = aliasName || realName || 'Anonymous';

        return {
          save_id: save.id,
          saved_at: save.created_at,
          user_id: save.profile_user_id,
          profile: {
            id: profile.id,
            user_id: profile.user_id,
            name: displayName,
            avatar: profile.profile_photo_url || '/default-profile.png',
            bio: profile.bio || '',
            location: profile.city && profile.country 
              ? `${profile.city}, ${profile.country}` 
              : profile.country || 'Not specified',
            city: profile.city || '',
            country: profile.country || '',
            available_for_work: profile.available_for_work
          }
        };
      })
    );

    // Filter out null entries (profiles that weren't found)
    const validProfiles = profiles.filter((item: any) => item !== null);

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
