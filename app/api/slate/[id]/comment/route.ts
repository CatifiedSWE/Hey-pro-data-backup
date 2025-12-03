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

    // Fetch all comments for this post (no pagination for threaded structure)
    const { data: comments, error } = await supabase
      .from('slate_comments')
      .select(`
        id,
        content,
        parent_comment_id,
        created_at,
        updated_at,
        user_id
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json(
        errorResponse('Failed to fetch comments', error.message),
        { status: 500 }
      );
    }

    // Get all unique user IDs
    const userIds = [...new Set(comments?.map(c => c.user_id) || [])];

    // Fetch user profiles
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('user_id, first_name, surname, alias_first_name, alias_surname, profile_photo_url')
      .in('user_id', userIds);

    // Fetch Google OAuth avatars
    const { data: authUsersResponse } = await supabase.auth.admin.listUsers();
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

    // Create user map
    const userMap = new Map();
    profiles?.forEach(profile => {
      const firstName = profile.alias_first_name || profile.first_name || '';
      const surname = profile.alias_surname || profile.surname || '';
      const name = `${firstName} ${surname}`.trim() || 'Unknown';
      
      let avatar = '/default-profile.png';
      if (profile.profile_photo_url && profile.profile_photo_url.trim() !== '') {
        avatar = profile.profile_photo_url;
      } else if (googleAvatarMap.has(profile.user_id)) {
        avatar = googleAvatarMap.get(profile.user_id)!;
      }

      userMap.set(profile.user_id, { name, avatar });
    });

    // Build threaded comment structure
    const commentMap = new Map();
    const rootComments: any[] = [];

    // First pass: create all comment objects
    comments?.forEach(comment => {
      const user = userMap.get(comment.user_id) || { name: 'Unknown', avatar: '/default-profile.png' };
      commentMap.set(comment.id, {
        id: comment.id,
        post_id: postId,
        user_id: comment.user_id,
        parent_comment_id: comment.parent_comment_id,
        content: comment.content,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        author: {
          id: comment.user_id,
          name: user.name,
          avatar: user.avatar
        },
        replies: []
      });
    });

    // Second pass: build the tree structure
    commentMap.forEach(comment => {
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    return NextResponse.json(
      successResponse(
        {
          comments: rootComments,
          totalComments: comments?.length || 0
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
    let googleAvatar: string = '';
    
    if (comment.user_id) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_id, alias_first_name, alias_surname, profile_photo_url')
        .eq('user_id', comment.user_id)
        .single();
      userProfile = profile;

      // Fetch Google auth avatar as fallback
      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(comment.user_id);
      if (authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture) {
        googleAvatar = authUser.user_metadata.avatar_url || authUser.user_metadata.picture;
      }
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
        avatar: userProfile?.profile_photo_url || googleAvatar || '',
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
