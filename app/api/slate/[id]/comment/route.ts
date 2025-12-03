import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/slate/[id]/comment
 * Get comments for a post
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    const supabase = createServerClient();

    // Check if post exists
    const { data: post, error: postError } = await supabase
      .from('slate_posts')
      .select('id')
      .eq('id', postId)
      .single();

    if (postError) {
      if (postError.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse('Post not found'),
          { status: 404 }
        );
      }
      return NextResponse.json(
        errorResponse('Failed to fetch post', postError.message),
        { status: 500 }
      );
    }

    // Fetch comments without author join
    const from = (page - 1) * limit;
    const { data: comments, error, count } = await supabase
      .from('slate_comments')
      .select(`
        id,
        content,
        parent_comment_id,
        created_at,
        updated_at,
        user_id
      `, { count: 'exact' })
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) {
      return NextResponse.json(
        errorResponse('Failed to fetch comments', error.message),
        { status: 500 }
      );
    }

    // Fetch user profiles for all comment authors
    let userProfiles: Record<string, any> = {};
    if (comments && comments.length > 0) {
      const userIds = [...new Set(comments.map(c => c.user_id))];
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

    // Format response
    const formattedComments = comments?.map(comment => ({
      id: comment.id,
      content: comment.content,
      parent_comment_id: comment.parent_comment_id,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      author: {
        id: comment.user_id,
        name: `${userProfiles[comment.user_id]?.alias_first_name || ''} ${userProfiles[comment.user_id]?.alias_surname || ''}`.trim(),
        avatar: userProfiles[comment.user_id]?.profile_photo_url || '',
      },
    })) || [];

    return NextResponse.json(
      successResponse(
        {
          comments: formattedComments,
          pagination: {
            page,
            limit,
            total: count || 0,
            hasMore: (count || 0) > from + limit,
          },
        },
        'Comments retrieved'
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
 * POST /api/slate/[id]/comment
 * Add a comment to a post
 */
export async function POST(
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
    const { content, parent_comment_id } = body;

    // Validate content
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        errorResponse('Content is required'),
        { status: 400 }
      );
    }

    if (content.length < 1 || content.length > 2000) {
      return NextResponse.json(
        errorResponse('Content must be between 1 and 2000 characters'),
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if post exists
    const { data: post, error: postError } = await supabase
      .from('slate_posts')
      .select('id')
      .eq('id', postId)
      .single();

    if (postError) {
      if (postError.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse('Post not found'),
          { status: 404 }
        );
      }
      return NextResponse.json(
        errorResponse('Failed to fetch post', postError.message),
        { status: 500 }
      );
    }

    // If parent_comment_id is provided, verify it exists
    if (parent_comment_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from('slate_comments')
        .select('id')
        .eq('id', parent_comment_id)
        .single();

      if (parentError) {
        return NextResponse.json(
          errorResponse('Parent comment not found'),
          { status: 404 }
        );
      }
    }

    // Insert comment
    const { data: comment, error: commentError } = await supabase
      .from('slate_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content,
        parent_comment_id: parent_comment_id || null,
      })
      .select(`
        id,
        content,
        parent_comment_id,
        created_at,
        updated_at,
        user_id
      `)
      .single();

    if (commentError) {
      return NextResponse.json(
        errorResponse('Failed to add comment', commentError.message),
        { status: 500 }
      );
    }

    // Fetch user profile for comment author
    let userProfile: any = null;
    if (comment.user_id) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_id, alias_first_name, alias_surname, profile_photo_url')
        .eq('user_id', comment.user_id)
        .single();
      userProfile = profile;
    }

    // Format response
    const formattedComment = {
      id: comment.id,
      content: comment.content,
      parent_comment_id: comment.parent_comment_id,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      author: {
        id: comment.user_id,
        name: `${userProfile?.alias_first_name || ''} ${userProfile?.alias_surname || ''}`.trim(),
        avatar: userProfile?.profile_photo_url || '',
      },
    };

    return NextResponse.json(
      successResponse(formattedComment, 'Comment added'),
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
