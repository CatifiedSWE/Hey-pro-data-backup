import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/collab/my
 * Get user's collab posts (all statuses including drafts)
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

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const status = searchParams.get('status') || 'all';

    const supabase = createServerClient();
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('collab_posts')
      .select(`
        *,
        tags:collab_tags(tag_name),
        interests:collab_interests(count),
        collaborators:collab_collaborators(count)
      `, { count: 'exact' })
      .eq('user_id', user.id);

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply sorting and pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: collabs, error, count } = await query;

    if (error) {
      console.error('Error fetching user collabs:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch collabs', error.message),
        { status: 500 }
      );
    }

    // Fetch Google OAuth avatars for all interested users (batch query)
    const allInterestedUserIds = new Set<string>();
    await Promise.all(
      (collabs || []).map(async (collab: any) => {
        const { data } = await supabase
          .from('collab_interests')
          .select('user_id')
          .eq('collab_id', collab.id)
          .limit(3);
        data?.forEach((u: any) => allInterestedUserIds.add(u.user_id));
      })
    );

    // Fetch Google OAuth metadata for all interested users
    const { data: authUsersResponse } = await supabase.auth.admin.listUsers();
    
    // Create a map of user_id to Google avatar
    const googleAvatarMap = new Map<string, string>();
    if (authUsersResponse?.users) {
      authUsersResponse.users.forEach(authUser => {
        if (authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture) {
          googleAvatarMap.set(
            authUser.id, 
            authUser.user_metadata.avatar_url || authUser.user_metadata.picture
          );
        }
      });
    }

    // Format collabs with details
    const collabsWithDetails = await Promise.all(
      (collabs || []).map(async (collab: any) => {
        // Get first 3 interested users' avatars from user_profiles
        const { data: interestedUserIds } = await supabase
          .from('collab_interests')
          .select('user_id')
          .eq('collab_id', collab.id)
          .limit(3);

        let interestAvatars: string[] = [];
        if (interestedUserIds && interestedUserIds.length > 0) {
          const userIds = interestedUserIds.map((u: any) => u.user_id);
          const { data: interestedProfiles } = await supabase
            .from('user_profiles')
            .select('user_id, profile_photo_url')
            .in('user_id', userIds)
            .limit(3);

          interestAvatars = interestedProfiles?.map((profile: any) => {
            // Priority: uploaded profile photo -> Google metadata -> placeholder
            if (profile.profile_photo_url && profile.profile_photo_url.trim() !== '') {
              return profile.profile_photo_url;
            } else if (googleAvatarMap.has(profile.user_id)) {
              return googleAvatarMap.get(profile.user_id)!;
            } else {
              return '/placeholder-avatar.png';
            }
          }) || [];
        }

        // Check if current user has expressed interest in their own collab
        const { data: interestCheck } = await supabase
          .from('collab_interests')
          .select('id')
          .eq('collab_id', collab.id)
          .eq('user_id', user.id)
          .single();
        const userHasInterest = !!interestCheck;

        // Check if current user has saved their own collab
        const { data: saveCheck } = await supabase
          .from('collab_saves')
          .select('id')
          .eq('collab_id', collab.id)
          .eq('user_id', user.id)
          .single();
        const userHasSaved = !!saveCheck;

        return {
          id: collab.id,
          title: collab.title,
          slug: collab.slug,
          summary: collab.summary,
          tags: collab.tags?.map((t: any) => t.tag_name) || [],
          cover_image_url: collab.cover_image_url,
          status: collab.status,
          interests: collab.interests?.[0]?.count || 0,
          collaborators: collab.collaborators?.[0]?.count || 0,
          interestAvatars,
          created_at: collab.created_at,
          updated_at: collab.updated_at,
          userHasInterest,
          userHasSaved
        };
      })
    );

    const totalCollabs = count || 0;
    const totalPages = Math.ceil(totalCollabs / limit);

    return NextResponse.json(
      successResponse(
        {
          collabs: collabsWithDetails,
          pagination: {
            currentPage: page,
            totalPages,
            totalCollabs,
            limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        },
        'User collabs retrieved successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/collab/my:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
