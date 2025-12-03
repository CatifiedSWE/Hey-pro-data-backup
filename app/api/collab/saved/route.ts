import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/collab/saved
 * Get user's saved/bookmarked collab posts
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const supabase = createServerClient();

    // Fetch saved collabs
    const from = (page - 1) * limit;
    const { data: savedCollabs, error, count } = await supabase
      .from('collab_saves')
      .select(`
        id,
        created_at,
        collab:collab_id (
          id,
          title,
          slug,
          summary,
          cover_image_url,
          status,
          created_at,
          updated_at,
          user_id,
          tags:collab_tags(tag_name),
          interests:collab_interests(count)
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) {
      return NextResponse.json(
        errorResponse('Failed to fetch saved collabs', error.message),
        { status: 500 }
      );
    }

    // Fetch user profiles for collab authors
    let userProfiles: Record<string, any> = {};
    let googleAvatars: Record<string, string> = {};
    
    if (savedCollabs && savedCollabs.length > 0) {
      const userIds = [...new Set(savedCollabs.map(sc => sc.collab?.user_id).filter(Boolean))];
      
      if (userIds.length > 0) {
        // Fetch user profiles
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id, alias_first_name, alias_surname, profile_photo_url')
          .in('user_id', userIds);
        
        if (profiles) {
          userProfiles = profiles.reduce((acc, profile) => {
            acc[profile.user_id] = profile;
            return acc;
          }, {} as Record<string, any>);
        }

        // Fetch Google auth avatars as fallback
        const { data: authData } = await supabase.auth.admin.listUsers();
        if (authData?.users) {
          authData.users.forEach(authUser => {
            if (userIds.includes(authUser.id) && (authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture)) {
              googleAvatars[authUser.id] = authUser.user_metadata.avatar_url || authUser.user_metadata.picture;
            }
          });
        }
      }
    }

    // Get collab IDs for user save status check
    const collabIds = savedCollabs?.map(sc => sc.collab?.id).filter(Boolean) || [];
    let userSaves: string[] = collabIds; // All are saved in this context

    // Format response
    const formattedCollabs = savedCollabs
      ?.filter(sc => sc.collab) // Filter out any null collabs
      .map(savedCollab => ({
        id: savedCollab.collab.id,
        title: savedCollab.collab.title,
        slug: savedCollab.collab.slug,
        summary: savedCollab.collab.summary,
        cover_image_url: savedCollab.collab.cover_image_url,
        status: savedCollab.collab.status,
        tags: savedCollab.collab.tags?.map((t: any) => t.tag_name) || [],
        interests: savedCollab.collab.interests?.[0]?.count || 0,
        created_at: savedCollab.collab.created_at,
        updated_at: savedCollab.collab.updated_at,
        saved_at: savedCollab.created_at,
        author: {
          id: savedCollab.collab.user_id,
          name: `${userProfiles[savedCollab.collab.user_id]?.alias_first_name || ''} ${userProfiles[savedCollab.collab.user_id]?.alias_surname || ''}`.trim(),
          avatar: userProfiles[savedCollab.collab.user_id]?.profile_photo_url || googleAvatars[savedCollab.collab.user_id] || '',
        },
        user_has_saved: true, // Always true for saved collabs
      })) || [];

    return NextResponse.json(
      successResponse(
        {
          collabs: formattedCollabs,
          pagination: {
            page,
            limit,
            total: count || 0,
            hasMore: (count || 0) > from + limit,
          },
        },
        'Saved collabs retrieved'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
