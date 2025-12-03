import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/slate
 * Get slate feed (all published posts)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const sort = searchParams.get('sort') || 'latest';
    const search = searchParams.get('search');

    const supabase = createServerClient();
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);

    // Build query without author join
    let query = supabase
      .from('slate_posts')
      .select(`
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
      `, { count: 'exact' })
      .eq('status', 'published');

    // Search
    if (search) {
      query = query.textSearch('content', search);
    }

    // Sort
    if (sort === 'popular') {
      query = query.order('likes_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Pagination
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data: posts, error, count } = await query;

    if (error) {
      return NextResponse.json(
        errorResponse('Failed to fetch posts', error.message),
        { status: 500 }
      );
    }

    // Fetch user profiles for all post authors
    let userProfiles: Record<string, any> = {};
    if (posts && posts.length > 0) {
      const userIds = [...new Set(posts.map(p => p.user_id))];
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
    }

    // If user logged in, check likes and saves
    let userLikes: string[] = [];
    let userSaves: string[] = [];
    
    if (user && posts && posts.length > 0) {
      const postIds = posts.map(p => p.id);
      
      const { data: likes } = await supabase
        .from('slate_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);
      userLikes = likes?.map(l => l.post_id) || [];

      const { data: saves } = await supabase
        .from('slate_saved')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);
      userSaves = saves?.map(s => s.post_id) || [];
    }

    // Format response
    const formattedPosts = posts?.map(post => ({
      id: post.id,
      content: post.content,
      slug: post.slug,
      status: post.status,
      likes_count: post.likes_count,
      comments_count: post.comments_count,
      shares_count: post.shares_count,
      created_at: post.created_at,
      updated_at: post.updated_at,
      author: {
        id: post.user_id,
        name: `${userProfiles[post.user_id]?.alias_first_name || ''} ${userProfiles[post.user_id]?.alias_surname || ''}`.trim(),
        avatar: userProfiles[post.user_id]?.profile_photo_url || '',
      },
      media: post.media?.sort((a, b) => a.sort_order - b.sort_order) || [],
      user_has_liked: userLikes.includes(post.id),
      user_has_saved: userSaves.includes(post.id),
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
        'Slate feed retrieved'
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

/**
 * POST /api/slate
 * Create a new slate post
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
    const { content, status = 'published', media_urls } = body;

    // Validate content
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        errorResponse('Content is required'),
        { status: 400 }
      );
    }

    if (content.length < 1 || content.length > 5000) {
      return NextResponse.json(
        errorResponse('Content must be between 1 and 5000 characters'),
        { status: 400 }
      );
    }

    // Validate status
    if (!['published', 'draft', 'archived'].includes(status)) {
      return NextResponse.json(
        errorResponse('Invalid status. Must be: published, draft, or archived'),
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Generate slug (optional - simple implementation)
    const slug = content
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .split(/\s+/)
      .slice(0, 8)
      .join('-') + '-' + Date.now().toString(36);

    // Create post
    const { data: post, error: postError } = await supabase
      .from('slate_posts')
      .insert({
        user_id: user.id,
        content,
        status,
        slug: slug || null,
      })
      .select()
      .single();

    if (postError) {
      return NextResponse.json(
        errorResponse('Failed to create post', postError.message),
        { status: 500 }
      );
    }

    // Add media if provided
    if (media_urls && Array.isArray(media_urls) && media_urls.length > 0) {
      const mediaInserts = media_urls.map((url, index) => ({
        post_id: post.id,
        media_url: url,
        media_type: (url.includes('.mp4') || url.includes('.mov') || url.includes('.avi')) ? 'video' : 'image',
        sort_order: index,
      }));

      const { error: mediaError } = await supabase
        .from('slate_media')
        .insert(mediaInserts);

      if (mediaError) {
        console.error('Media insert error:', mediaError);
        // Continue anyway - post is created
      }
    }

    return NextResponse.json(
      successResponse(
        {
          id: post.id,
          content: post.content,
          slug: post.slug,
          status: post.status,
          likes_count: post.likes_count,
          comments_count: post.comments_count,
          shares_count: post.shares_count,
          created_at: post.created_at,
          updated_at: post.updated_at,
        },
        'Post created successfully'
      ),
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
