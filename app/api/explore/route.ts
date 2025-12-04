import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/explore
 * Search and filter crew profiles (Explore/Crew Directory)
 * Public access with optional authentication
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    
    // Get current logged-in user to exclude from results
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const currentUserId = currentUser?.id;
    
    // Parse query parameters
    const keyword = searchParams.get('keyword');
    const role = searchParams.get('role');
    const category = searchParams.get('category');
    const availability = searchParams.get('availability');
    const productionType = searchParams.get('productionType');
    const location = searchParams.get('location');
    const experienceLevel = searchParams.get('experienceLevel');
    const minRate = searchParams.get('minRate');
    const maxRate = searchParams.get('maxRate');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const offset = (page - 1) * limit;

    // Build base query
    // Removed .eq('visible_in_explore', true) to show all profiles for now
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
        day_rate,
        day_rate_currency,
        experience_level,
        available_for_work,
        created_at,
        updated_at
      `, { count: 'exact' });

    // Exclude current user from explore results
    if (currentUserId) {
      query = query.neq('user_id', currentUserId);
    }

    // Apply keyword search
    if (keyword) {
      query = query.or(`alias_first_name.ilike.%${keyword}%,alias_surname.ilike.%${keyword}%,first_name.ilike.%${keyword}%,surname.ilike.%${keyword}%,bio.ilike.%${keyword}%`);
    }

    // Apply location filter
    if (location) {
      query = query.or(`country.ilike.%${location}%,city.ilike.%${location}%`);
    }

    // Apply availability filter
    if (availability === 'available') {
      query = query.eq('available_for_work', true);
    } else if (availability === 'unavailable') {
      query = query.eq('available_for_work', false);
    }

    // Apply experience level filter
    if (experienceLevel) {
      query = query.eq('experience_level', experienceLevel);
    }

    // Apply rate range filters
    if (minRate) {
      query = query.gte('day_rate', parseInt(minRate));
    }
    if (maxRate) {
      query = query.lte('day_rate', parseInt(maxRate));
    }

    // Apply sorting
    const ascending = sortOrder === 'asc';
    query = query.order(sortBy, { ascending });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: profiles, error, count } = await query;

    if (error) {
      console.error('Error fetching profiles:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch profiles', error.message),
        { status: 500 }
      );
    }

    // Fetch Google OAuth avatars for all users at once (batch query)
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    
    // Create a map of user_id to Google avatar
    const googleAvatarMap = new Map<string, string>();
    if (authUsers?.users) {
      authUsers.users.forEach(authUser => {
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
      (profiles || []).map(async (profile) => {
        // Fetch user roles
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role_name')
          .eq('user_id', profile.user_id)
          .order('sort_order', { ascending: true });

        // Filter by role if specified
        if (role || category) {
          const roleNames = roles?.map(r => r.role_name.toLowerCase()) || [];
          const searchRole = (role || category || '').toLowerCase();
          if (!roleNames.some(r => r.includes(searchRole))) {
            return null; // Skip this profile
          }
        }

        // Build display name with priority: alias_first_name + alias_surname (1st), first_name + surname (2nd)
        const aliasName = `${profile.alias_first_name || ''} ${profile.alias_surname || ''}`.trim();
        const realName = `${profile.first_name || ''} ${profile.surname || ''}`.trim();
        const displayName = aliasName || realName || 'Anonymous';
        
        // Priority: profile_photo_url > Google metadata avatar > null
        const profileAvatar = profile.profile_photo_url || googleAvatarMap.get(profile.user_id) || null;
        
        return {
          id: profile.id,
          userId: profile.user_id,
          name: displayName,
          displayName: displayName,
          avatar: profileAvatar,
          banner: profile.banner_url,
          bio: profile.bio,
          location: profile.city && profile.country 
            ? `${profile.city}, ${profile.country}` 
            : profile.country || 'Not specified',
          country: profile.country,
          city: profile.city,
          dayRate: profile.day_rate,
          currency: profile.day_rate_currency || 'AED',
          roles: roles?.map(r => r.role_name) || [],
          portfolioUrl: profile.portfolio_url,
          imdbUrl: profile.imdb_url,
          experienceLevel: profile.experience_level,
          availableForWork: profile.available_for_work,
          createdAt: profile.created_at,
          visibleInExplore: profile.visible_in_explore
        };
      })
    );

    // Filter out null profiles (those that didn't match role filter)
    const filteredProfiles = enrichedProfiles.filter(p => p !== null);

    const totalProfiles = filteredProfiles.length;
    const totalPages = Math.ceil(totalProfiles / limit);

    return NextResponse.json(
      successResponse(
        {
          profiles: filteredProfiles,
          pagination: {
            currentPage: page,
            totalPages,
            totalProfiles,
            limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        },
        'Profiles retrieved successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/explore:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
