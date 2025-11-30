import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/slate/recommendations
 * Get user profile recommendations for slate page sidebar
 * Fetches real user profiles excluding the current user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);
    
    // Get current user ID to exclude from results
    const currentUserId = user?.id;
    
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '6'), 20);

    // Build query for user profiles
    let query = supabase
      .from('user_profiles')
      .select(`
        id,
        user_id,
        alias_first_name,
        alias_surname,
        first_name,
        surname,
        profile_photo_url,
        banner_url,
        bio,
        country,
        city,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Exclude current user from results
    if (currentUserId) {
      query = query.neq('user_id', currentUserId);
    }

    const { data: profiles, error } = await query;

    if (error) {
      console.error('Error fetching profiles:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch profiles', error.message),
        { status: 500 }
      );
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json(
        successResponse(
          { profiles: [] },
          'No profiles found'
        ),
        { status: 200 }
      );
    }

    // Fetch Google OAuth avatars for all users at once (batch query)
    const { data: authData } = await supabase.auth.admin.listUsers();
    
    // Create a map of user_id to Google avatar
    const googleAvatarMap = new Map<string, string>();
    if (authData?.users) {
      authData.users.forEach(authUser => {
        if (authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture) {
          googleAvatarMap.set(
            authUser.id, 
            authUser.user_metadata.avatar_url || authUser.user_metadata.picture
          );
        }
      });
    }

    // Enrich profiles with roles and Google avatars
    const enrichedProfiles = await Promise.all(
      profiles.map(async (profile) => {
        try {
          // Fetch user roles
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role_name')
            .eq('user_id', profile.user_id)
            .order('sort_order', { ascending: true });
          
          const roleCount = roles?.length || 0;
          const primaryRole = roles && roles.length > 0 ? roles[0].role_name : 'Crew Member';

          // Build display name with priority: alias_first_name + alias_surname (1st), first_name + surname (2nd)
          const aliasName = `${profile.alias_first_name || ''} ${profile.alias_surname || ''}`.trim();
          const realName = `${profile.first_name || ''} ${profile.surname || ''}`.trim();
          const displayName = aliasName || realName || 'Anonymous';

          // Priority: profile_photo_url > Google metadata avatar > null
          const profileImage = profile.profile_photo_url || googleAvatarMap.get(profile.user_id) || null;

          return {
            id: profile.user_id,
            name: displayName,
            image: profileImage,
            role: primaryRole,
            roleCount: roleCount,
            totalRoles: `${roleCount} Role${roleCount !== 1 ? 's' : ''}`,
            profileUrl: `/explore/${profile.user_id}`
          };
        } catch (innerError) {
          console.error(`Error processing profile ${profile.id}:`, innerError);
          return null;
        }
      })
    );
    
    // Filter out null profiles
    const validProfiles = enrichedProfiles.filter(p => p !== null);

    return NextResponse.json(
      successResponse(
        { profiles: validProfiles },
        'Profiles retrieved successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/slate/recommendations:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
