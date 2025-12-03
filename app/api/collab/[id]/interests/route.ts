import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/collab/[id]/interests
 * Get list of interested users (owner only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const collabId = params.id;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));

    const supabase = createServerClient();
    const offset = (page - 1) * limit;

    // Verify ownership
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

    if (collab.user_id !== user.id) {
      return NextResponse.json(
        errorResponse('Forbidden: Only the owner can view interested users'),
        { status: 403 }
      );
    }

    // Fetch interested users with pagination
    const { data: interests, error, count } = await supabase
      .from('collab_interests')
      .select('id, created_at, user_id', { count: 'exact' })
      .eq('collab_id', collabId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching interests:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch interested users', error.message),
        { status: 500 }
      );
    }

    // Get user profiles for interested users
    let formattedInterests: any[] = [];
    if (interests && interests.length > 0) {
      const userIds = interests.map((i: any) => i.user_id);
      const { data: userProfiles } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, surname, alias_first_name, alias_surname, profile_photo_url, bio')
        .in('user_id', userIds);

      // Fetch Google OAuth avatars for interested users
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

      formattedInterests = interests.map((interest: any) => {
        const profile = userProfiles?.find((p: any) => p.user_id === interest.user_id);
        // Use alias name if available, otherwise use regular name
        const firstName = profile?.alias_first_name || profile?.first_name || '';
        const surname = profile?.alias_surname || profile?.surname || '';
        const name = `${firstName} ${surname}`.trim() || 'Unknown';
        
        // Priority: uploaded profile photo -> Google metadata -> placeholder
        let avatar = '/default-profile.png';
        if (profile?.profile_photo_url && profile.profile_photo_url.trim() !== '') {
          avatar = profile.profile_photo_url;
        } else if (googleAvatarMap.has(interest.user_id)) {
          avatar = googleAvatarMap.get(interest.user_id)!;
        }

        return {
          id: interest.id,
          user: {
            id: interest.user_id,
            name,
            avatar,
            bio: profile?.bio || ''
          },
          created_at: interest.created_at
        };
      });
    }

    const totalInterests = count || 0;
    const totalPages = Math.ceil(totalInterests / limit);

    return NextResponse.json(
      successResponse(
        {
          interests: formattedInterests,
          pagination: {
            currentPage: page,
            totalPages,
            totalInterests,
            limit
          }
        },
        'Interested users retrieved successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/collab/[id]/interests:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
