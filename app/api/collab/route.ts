import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/collab
 * Get all collab posts (public feed with pagination)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const status = searchParams.get('status') || 'all';
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const supabase = createServerClient();
    const offset = (page - 1) * limit;

    // Build base query
    // Note: Fetch user data separately as direct foreign key joins to auth.users 
    // may not work in all Supabase configurations
    let query = supabase
      .from('collab_posts')
      .select(`
        *,
        tags:collab_tags(tag_name),
        interests:collab_interests(count)
      `, { count: 'exact' });

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    } else {
      // For public feed, show only open and closed, not drafts
      query = query.in('status', ['open', 'closed']);
    }

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);
    }

    // Apply sorting
    const ascending = sortOrder === 'asc';
    if (sortBy === 'interests') {
      // For interests sorting, we'll need to handle it after fetch
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order(sortBy, { ascending });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: collabs, error, count } = await query;

    if (error) {
      console.error('Error fetching collabs:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch collabs', error.message),
        { status: 500 }
      );
    }

    // Filter by tag if specified
    let filteredCollabs = collabs || [];
    if (tag) {
      filteredCollabs = filteredCollabs.filter(collab => 
        collab.tags?.some((t: any) => t.tag_name.toLowerCase() === tag.toLowerCase())
      );
    }

    // Fetch Google OAuth avatars for all users at once (batch query)
    // Collect all unique user IDs (authors + interested users)
    const allUserIds = new Set<string>();
    filteredCollabs.forEach((collab: any) => {
      allUserIds.add(collab.user_id);
    });

    // Also collect interested user IDs
    const interestedUsersData = await Promise.all(
      filteredCollabs.map(async (collab: any) => {
        const { data } = await supabase
          .from('collab_interests')
          .select('user_id')
          .eq('collab_id', collab.id)
          .limit(3);
        return { collabId: collab.id, users: data || [] };
      })
    );

    interestedUsersData.forEach((item: any) => {
      item.users.forEach((u: any) => allUserIds.add(u.user_id));
    });

    // Fetch Google OAuth metadata for all users
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

    // Get interest avatars and author details for each collab
    const collabsWithDetails = await Promise.all(
      filteredCollabs.map(async (collab: any) => {
        // Get author details from user_profiles table
        // Try both first_name/surname and alias_first_name/alias_surname for compatibility
        const { data: authorProfile } = await supabase
          .from('user_profiles')
          .select('user_id, first_name, surname, alias_first_name, alias_surname, profile_photo_url')
          .eq('user_id', collab.user_id)
          .single();

        // Get interested users data from cached results
        const interestedData = interestedUsersData.find((item: any) => item.collabId === collab.id);
        const interestedUserIds = interestedData?.users || [];

        let interestAvatars: string[] = [];
        if (interestedUserIds.length > 0) {
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

        // Use alias name if available, otherwise use regular name
        const firstName = authorProfile?.alias_first_name || authorProfile?.first_name || '';
        const surname = authorProfile?.alias_surname || authorProfile?.surname || '';
        const authorName = `${firstName} ${surname}`.trim() || 'Unknown';
        
        // Priority: uploaded profile photo -> Google metadata -> placeholder
        let authorAvatar = '/placeholder-avatar.png';
        if (authorProfile?.profile_photo_url && authorProfile.profile_photo_url.trim() !== '') {
          authorAvatar = authorProfile.profile_photo_url;
        } else if (googleAvatarMap.has(collab.user_id)) {
          authorAvatar = googleAvatarMap.get(collab.user_id)!;
        }

        return {
          id: collab.id,
          title: collab.title,
          slug: collab.slug,
          summary: collab.summary,
          tags: collab.tags?.map((t: any) => t.tag_name) || [],
          cover_image_url: collab.cover_image_url,
          status: collab.status,
          interests: collab.interests?.[0]?.count || 0,
          interestAvatars,
          author: {
            id: collab.user_id,
            name: authorName,
            avatar: authorAvatar
          },
          created_at: collab.created_at,
          updated_at: collab.updated_at
        };
      })
    );

    // Sort by interests if requested
    if (sortBy === 'interests') {
      collabsWithDetails.sort((a, b) => {
        return ascending ? a.interests - b.interests : b.interests - a.interests;
      });
    }

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
        'Collabs retrieved successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/collab:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * POST /api/collab
 * Create a new collab post
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);

    if (!user) {
      return NextResponse.json(
        errorResponse('Authentication required'),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, summary, tags, cover_image_url, status } = body;

    // Validation
    if (!title || title.length < 3 || title.length > 200) {
      return NextResponse.json(
        errorResponse('Title must be between 3 and 200 characters'),
        { status: 400 }
      );
    }

    if (!summary || summary.length < 10 || summary.length > 5000) {
      return NextResponse.json(
        errorResponse('Summary must be between 10 and 5000 characters'),
        { status: 400 }
      );
    }

    if (tags && (!Array.isArray(tags) || tags.length > 10)) {
      return NextResponse.json(
        errorResponse('Tags must be an array with maximum 10 items'),
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 100);

    const supabase = createServerClient();

    // Insert collab post
    const { data: collab, error: collabError } = await supabase
      .from('collab_posts')
      .insert({
        user_id: user.id,
        title,
        slug,
        summary,
        cover_image_url: cover_image_url || null,
        status: status || 'open'
      })
      .select()
      .single();

    if (collabError) {
      console.error('Error creating collab:', collabError);
      return NextResponse.json(
        errorResponse('Failed to create collab', collabError.message),
        { status: 500 }
      );
    }

    // Insert tags if provided
    if (tags && tags.length > 0) {
      const tagRecords = tags.map((tag: string) => ({
        collab_id: collab.id,
        tag_name: tag
      }));

      const { error: tagsError } = await supabase
        .from('collab_tags')
        .insert(tagRecords);

      if (tagsError) {
        console.error('Error inserting tags:', tagsError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json(
      successResponse(
        {
          id: collab.id,
          user_id: collab.user_id,
          title: collab.title,
          slug: collab.slug,
          summary: collab.summary,
          cover_image_url: collab.cover_image_url,
          status: collab.status,
          tags: tags || [],
          created_at: collab.created_at,
          updated_at: collab.updated_at
        },
        'Collab post created successfully'
      ),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/collab:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
