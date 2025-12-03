import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/collab/[id]/comments
 * Get all comments for a collab post (with threading)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const collabId = params.id;
    const supabase = createServerClient();

    // Check if collab exists and is accessible
    const { data: collab, error: collabError } = await supabase
      .from('collab_posts')
      .select('id, status')
      .eq('id', collabId)
      .single();

    if (collabError || !collab) {
      return NextResponse.json(
        errorResponse('Collab not found'),
        { status: 404 }
      );
    }

    // Fetch all comments for this collab
    const { data: comments, error: commentsError } = await supabase
      .from('collab_comments')
      .select('*')
      .eq('collab_id', collabId)
      .order('created_at', { ascending: true });

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      return NextResponse.json(
        errorResponse('Failed to fetch comments', commentsError.message),
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
        collab_id: comment.collab_id,
        user_id: comment.user_id,
        parent_id: comment.parent_id,
        content: comment.content,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        user: {
          name: user.name,
          avatar: user.avatar
        },
        replies: []
      });
    });

    // Second pass: build the tree structure
    commentMap.forEach(comment => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
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
        'Comments retrieved successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/collab/[id]/comments:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * POST /api/collab/[id]/comments
 * Add a new comment or reply
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

    const collabId = params.id;
    const body = await request.json();
    const { content, parent_id } = body;

    // Validation
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        errorResponse('Comment content is required'),
        { status: 400 }
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        errorResponse('Comment must be 5000 characters or less'),
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if collab exists
    const { data: collab, error: collabError } = await supabase
      .from('collab_posts')
      .select('id, status')
      .eq('id', collabId)
      .single();

    if (collabError || !collab) {
      return NextResponse.json(
        errorResponse('Collab not found'),
        { status: 404 }
      );
    }

    // If parent_id is provided, verify it exists
    if (parent_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from('collab_comments')
        .select('id, collab_id')
        .eq('id', parent_id)
        .single();

      if (parentError || !parentComment || parentComment.collab_id !== collabId) {
        return NextResponse.json(
          errorResponse('Parent comment not found'),
          { status: 404 }
        );
      }
    }

    // Create comment
    const { data: comment, error: commentError } = await supabase
      .from('collab_comments')
      .insert({
        collab_id: collabId,
        user_id: user.id,
        parent_id: parent_id || null,
        content: content.trim()
      })
      .select()
      .single();

    if (commentError) {
      console.error('Error creating comment:', commentError);
      return NextResponse.json(
        errorResponse('Failed to create comment', commentError.message),
        { status: 500 }
      );
    }

    // Get user profile for response
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id, first_name, surname, alias_first_name, alias_surname, profile_photo_url')
      .eq('user_id', user.id)
      .single();

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

    const firstName = profile?.alias_first_name || profile?.first_name || '';
    const surname = profile?.alias_surname || profile?.surname || '';
    const userName = `${firstName} ${surname}`.trim() || 'Unknown';
    
    let userAvatar = '/default-profile.png';
    if (profile?.profile_photo_url && profile.profile_photo_url.trim() !== '') {
      userAvatar = profile.profile_photo_url;
    } else if (googleAvatarMap.has(user.id)) {
      userAvatar = googleAvatarMap.get(user.id)!;
    }

    return NextResponse.json(
      successResponse(
        {
          id: comment.id,
          collab_id: comment.collab_id,
          user_id: comment.user_id,
          parent_id: comment.parent_id,
          content: comment.content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          user: {
            name: userName,
            avatar: userAvatar
          },
          replies: []
        },
        'Comment created successfully'
      ),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/collab/[id]/comments:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
