import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/slate/saved
 * Get user's saved/bookmarked slate posts
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

    // Fetch saved posts without author join
    const from = (page - 1) * limit;
    const { data: savedPosts, error, count } = await supabase
      .from('slate_saved')
      .select(`
        id,
        created_at,
        post:post_id (
          id,
          content,
          slug,
          status,
          likes_count,
          comments_count,
          shares_count,
          created_at,
          updated_at,
          user_id,
          media:slate_media(
            id,
            media_url,
            media_type,
            sort_order
          )
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) {
      return NextResponse.json(
        errorResponse('Failed to fetch saved posts', error.message),
        { status: 500 }
      );
    }

    // Fetch user profiles for all post authors
    let userProfiles: Record<string, any> = {};
    let googleAvatars: Record<string, string> = {};
    
    if (savedPosts && savedPosts.length > 0) {
      const userIds = [...new Set(savedPosts.map(sp => sp.post?.user_id).filter(Boolean))];
      
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

    // Get post IDs for likes check
    const postIds = savedPosts?.map(sp => sp.post?.id).filter(Boolean) || [];
    let userLikes: string[] = [];

    if (postIds.length > 0) {
      const { data: likes } = await supabase
        .from('slate_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);
      userLikes = likes?.map(l => l.post_id) || [];
    }

    // Format response
    const formattedPosts = savedPosts
      ?.filter(sp => sp.post) // Filter out any null posts
      .map(savedPost => ({
        id: savedPost.post.id,
        content: savedPost.post.content,
        slug: savedPost.post.slug,
        status: savedPost.post.status,
        likes_count: savedPost.post.likes_count,
        comments_count: savedPost.post.comments_count,
        shares_count: savedPost.post.shares_count,
        created_at: savedPost.post.created_at,
        updated_at: savedPost.post.updated_at,
        saved_at: savedPost.created_at,
        author: {
          id: savedPost.post.user_id,
          name: `${userProfiles[savedPost.post.user_id]?.alias_first_name || ''} ${userProfiles[savedPost.post.user_id]?.alias_surname || ''}`.trim(),
          avatar: userProfiles[savedPost.post.user_id]?.profile_photo_url || googleAvatars[savedPost.post.user_id] || '',
        },
        media: savedPost.post.media?.sort((a, b) => a.sort_order - b.sort_order) || [],
        user_has_liked: userLikes.includes(savedPost.post.id),
        user_has_saved: true, // Always true for saved posts
      })) || [];

    return NextResponse.json(
      successResponse(
        {
          posts: formattedPosts,
          pagination: {
            page,
            limit,
            total: count || 0,
            hasMore: (count || 0) > from + limit,
          },
        },
        'Saved posts retrieved'
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
