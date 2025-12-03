import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/slate/[id]
 * Get slate post details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    const supabase = createServerClient();
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);

    // Fetch post without author join
    const { data: post, error } = await supabase
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
      `)
      .eq('id', postId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse('Post not found'),
          { status: 404 }
        );
      }
      return NextResponse.json(
        errorResponse('Failed to fetch post', error.message),
        { status: 500 }
      );
    }

    // Fetch user profile for post author
    let userProfile: any = null;
    let googleAvatar: string = '';
    
    if (post.user_id) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_id, alias_first_name, alias_surname, profile_photo_url')
        .eq('user_id', post.user_id)
        .single();
      userProfile = profile;

      // Fetch Google auth avatar as fallback
      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(post.user_id);
      if (authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture) {
        googleAvatar = authUser.user_metadata.avatar_url || authUser.user_metadata.picture;
      }
    }

    // Check if user has liked/saved (if authenticated)
    let userHasLiked = false;
    let userHasSaved = false;

    if (user) {
      const { data: like } = await supabase
        .from('slate_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();
      userHasLiked = !!like;

      const { data: saved } = await supabase
        .from('slate_saved')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();
      userHasSaved = !!saved;
    }

    // Format response
    const formattedPost = {
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
        name: `${userProfile?.alias_first_name || ''} ${userProfile?.alias_surname || ''}`.trim(),
        avatar: userProfile?.profile_photo_url || googleAvatar || '',
      },
      media: post.media?.sort((a, b) => a.sort_order - b.sort_order) || [],
      user_has_liked: userHasLiked,
      user_has_saved: userHasSaved,
    };

    return NextResponse.json(
      successResponse(formattedPost, 'Slate post retrieved'),
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
 * PATCH /api/slate/[id]
 * Update slate post (owner only)
 */
export async function PATCH(
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

    const body = await request.json();
    const postId = params.id;
    const { content, status } = body;

    const supabase = createServerClient();

    // Verify post exists and user is owner
    const { data: existingPost, error: fetchError } = await supabase
      .from('slate_posts')
      .select('id, user_id')
      .eq('id', postId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse('Post not found'),
          { status: 404 }
        );
      }
      return NextResponse.json(
        errorResponse('Failed to fetch post', fetchError.message),
        { status: 500 }
      );
    }

    if (existingPost.user_id !== user.id) {
      return NextResponse.json(
        errorResponse('You do not have permission to update this post'),
        { status: 403 }
      );
    }

    // Build update object
    const updates: any = {};

    if (content !== undefined) {
      if (typeof content !== 'string' || content.length < 1 || content.length > 5000) {
        return NextResponse.json(
          errorResponse('Content must be between 1 and 5000 characters'),
          { status: 400 }
        );
      }
      updates.content = content;
    }

    if (status !== undefined) {
      if (!['published', 'draft', 'archived'].includes(status)) {
        return NextResponse.json(
          errorResponse('Invalid status. Must be: published, draft, or archived'),
          { status: 400 }
        );
      }
      updates.status = status;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        errorResponse('No valid fields to update'),
        { status: 400 }
      );
    }

    // Update post
    const { data: updatedPost, error: updateError } = await supabase
      .from('slate_posts')
      .update(updates)
      .eq('id', postId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        errorResponse('Failed to update post', updateError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(
        {
          id: updatedPost.id,
          content: updatedPost.content,
          slug: updatedPost.slug,
          status: updatedPost.status,
          updated_at: updatedPost.updated_at,
        },
        'Slate post updated'
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
 * DELETE /api/slate/[id]
 * Delete slate post (owner only)
 */
export async function DELETE(
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

    const postId = params.id;
    const supabase = createServerClient();

    // Verify post exists and user is owner
    const { data: existingPost, error: fetchError } = await supabase
      .from('slate_posts')
      .select('id, user_id')
      .eq('id', postId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse('Post not found'),
          { status: 404 }
        );
      }
      return NextResponse.json(
        errorResponse('Failed to fetch post', fetchError.message),
        { status: 500 }
      );
    }

    if (existingPost.user_id !== user.id) {
      return NextResponse.json(
        errorResponse('You do not have permission to delete this post'),
        { status: 403 }
      );
    }

    // Delete post (CASCADE will handle related tables)
    const { error: deleteError } = await supabase
      .from('slate_posts')
      .delete()
      .eq('id', postId);

    if (deleteError) {
      return NextResponse.json(
        errorResponse('Failed to delete post', deleteError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(null, 'Slate post deleted'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
