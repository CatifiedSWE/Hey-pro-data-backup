import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/collab/[id]/collaborators
 * Get list of collaborators (public)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const collabId = params.id;
    const supabase = createServerClient();

    // Fetch collaborators
    const { data: collaborators, error } = await supabase
      .from('collab_collaborators')
      .select('id, role, department, added_at, user_id, added_by')
      .eq('collab_id', collabId)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching collaborators:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch collaborators', error.message),
        { status: 500 }
      );
    }

    // Get user profiles for collaborators
    let formattedCollaborators: any[] = [];
    if (collaborators && collaborators.length > 0) {
      const userIds = [...new Set([
        ...collaborators.map((c: any) => c.user_id),
        ...collaborators.map((c: any) => c.added_by)
      ])];

      const { data: userProfiles } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, surname, profile_photo_url')
        .in('user_id', userIds);

      // Fetch Google OAuth avatars for collaborators
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

      formattedCollaborators = collaborators.map((collab: any) => {
        const userProfile = userProfiles?.find((p: any) => p.user_id === collab.user_id);
        const addedByProfile = userProfiles?.find((p: any) => p.user_id === collab.added_by);
        
        const userName = userProfile 
          ? `${userProfile.first_name || ''} ${userProfile.surname || ''}`.trim() || 'Unknown'
          : 'Unknown';
        
        const addedByName = addedByProfile 
          ? `${addedByProfile.first_name || ''} ${addedByProfile.surname || ''}`.trim() || 'Unknown'
          : 'Unknown';

        // Priority: uploaded profile photo -> Google metadata -> placeholder
        let userAvatar = '/default-profile.png';
        if (userProfile?.profile_photo_url && userProfile.profile_photo_url.trim() !== '') {
          userAvatar = userProfile.profile_photo_url;
        } else if (googleAvatarMap.has(collab.user_id)) {
          userAvatar = googleAvatarMap.get(collab.user_id)!;
        }

        return {
          id: collab.id,
          user: {
            id: collab.user_id,
            name: userName,
            avatar: userAvatar
          },
          role: collab.role,
          department: collab.department,
          added_at: collab.added_at,
          added_by: {
            id: collab.added_by,
            name: addedByName
          }
        };
      });
    }

    return NextResponse.json(
      successResponse(
        { collaborators: formattedCollaborators },
        'Collaborators retrieved successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/collab/[id]/collaborators:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * POST /api/collab/[id]/collaborators
 * Add a collaborator (owner only)
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
    const { user_id, role, department } = body;

    if (!user_id) {
      return NextResponse.json(
        errorResponse('user_id is required'),
        { status: 400 }
      );
    }

    const supabase = createServerClient();

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
        errorResponse('Forbidden: Only the owner can add collaborators'),
        { status: 403 }
      );
    }

    // Check if user exists (optional - Supabase FK will handle this)
    const { data: targetUser, error: userError } = await supabase.auth.admin.getUserById(user_id);
    
    if (userError) {
      return NextResponse.json(
        errorResponse('User not found'),
        { status: 404 }
      );
    }

    // Check if already a collaborator
    const { data: existingCollaborator } = await supabase
      .from('collab_collaborators')
      .select('id')
      .eq('collab_id', collabId)
      .eq('user_id', user_id)
      .single();

    if (existingCollaborator) {
      return NextResponse.json(
        errorResponse('User is already a collaborator'),
        { status: 409 }
      );
    }

    // Add collaborator
    const { data: collaborator, error: insertError } = await supabase
      .from('collab_collaborators')
      .insert({
        collab_id: collabId,
        user_id: user_id,
        role: role || null,
        department: department || null,
        added_by: user.id
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error adding collaborator:', insertError);
      return NextResponse.json(
        errorResponse('Failed to add collaborator', insertError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(
        {
          id: collaborator.id,
          collab_id: collaborator.collab_id,
          user_id: collaborator.user_id,
          role: collaborator.role,
          department: collaborator.department,
          added_at: collaborator.added_at,
          added_by: collaborator.added_by
        },
        'Collaborator added successfully'
      ),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/collab/[id]/collaborators:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
