import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/collab/[id]
 * Get specific collab post details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const collabId = params.id;
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);

    const supabase = createServerClient();

    // Fetch collab with tags
    const { data: collab, error } = await supabase
      .from('collab_posts')
      .select(`
        *,
        tags:collab_tags(tag_name)
      `)
      .eq('id', collabId)
      .single();

    if (error || !collab) {
      return NextResponse.json(
        errorResponse('Collab not found'),
        { status: 404 }
      );
    }

    // Get author details from user_profiles
    const { data: authorProfile } = await supabase
      .from('user_profiles')
      .select('user_id, first_name, surname, alias_first_name, alias_surname, profile_photo_url, bio')
      .eq('user_id', collab.user_id)
      .single();

    // Fetch Google OAuth avatar for author
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

    // Get interest count
    const { count: interestCount } = await supabase
      .from('collab_interests')
      .select('*', { count: 'exact', head: true })
      .eq('collab_id', collabId);

    // Check if current user has expressed interest (if authenticated)
    let userHasInterest = false;
    if (user) {
      const { data: interest } = await supabase
        .from('collab_interests')
        .select('id')
        .eq('collab_id', collabId)
        .eq('user_id', user.id)
        .single();
      
      userHasInterest = !!interest;
    }

    // Get collaborators if user is the owner
    let collaborators = [];
    const isOwner = user?.id === collab.user_id;
    
    if (isOwner) {
        // Get interested users for the collaborators table
        const { data: interestedUsers, error: interestedError } = await supabase
          .from('collab_interests')
          .select('id, created_at, user_id')
          .eq('collab_id', collabId)
          .order('created_at', { ascending: false });

        if (interestedUsers && interestedUsers.length > 0) {
            const interestedUserIds = interestedUsers.map((i: any) => i.user_id);
            const { data: interestedProfiles } = await supabase
                .from('user_profiles')
                .select('user_id, first_name, surname, alias_first_name, alias_surname, profile_photo_url')
                .in('user_id', interestedUserIds);

            collaborators = interestedUsers.map((interest: any) => {
                const profile = interestedProfiles?.find((p: any) => p.user_id === interest.user_id);
                // Use alias name if available, otherwise use regular name
                const firstName = profile?.alias_first_name || profile?.first_name || '';
                const surname = profile?.alias_surname || profile?.surname || '';
                const name = `${firstName} ${surname}`.trim() || 'Unknown';
                
                // Priority: uploaded profile photo -> Google metadata -> placeholder
                let avatar = '/placeholder-avatar.png';
                if (profile?.profile_photo_url && profile.profile_photo_url.trim() !== '') {
                    avatar = profile.profile_photo_url;
                } else if (googleAvatarMap.has(interest.user_id)) {
                    avatar = googleAvatarMap.get(interest.user_id)!;
                }
                
                return {
                    id: interest.id,
                    name,
                    avatar,
                    role: 'DOP', // Default role for interested users
                    department: '', // Empty department for interested users
                    added_at: interest.created_at
                };
            });
        }

        // Also get actual confirmed collaborators if any exist
        const { data: confirmedCollabData } = await supabase
            .from('collab_collaborators')
            .select('id, role, department, added_at, user_id')
            .eq('collab_id', collabId);

        if (confirmedCollabData && confirmedCollabData.length > 0) {
            const collaboratorUserIds = confirmedCollabData.map((c: any) => c.user_id);
            const { data: collaboratorProfiles } = await supabase
                .from('user_profiles')
                .select('user_id, first_name, surname, alias_first_name, alias_surname, profile_photo_url')
                .in('user_id', collaboratorUserIds);

            const confirmedCollaborators = confirmedCollabData.map((c: any) => {
                const profile = collaboratorProfiles?.find((p: any) => p.user_id === c.user_id);
                // Use alias name if available, otherwise use regular name
                const firstName = profile?.alias_first_name || profile?.first_name || '';
                const surname = profile?.alias_surname || profile?.surname || '';
                const name = `${firstName} ${surname}`.trim() || 'Unknown';
                
                // Priority: uploaded profile photo -> Google metadata -> placeholder
                let avatar = '/placeholder-avatar.png';
                if (profile?.profile_photo_url && profile.profile_photo_url.trim() !== '') {
                    avatar = profile.profile_photo_url;
                } else if (googleAvatarMap.has(c.user_id)) {
                    avatar = googleAvatarMap.get(c.user_id)!;
                }
                
                return {
                    id: c.id,
                    name,
                    avatar,
                    role: c.role || 'DOP',
                    department: c.department || '',
                    added_at: c.added_at
                };
            });

            // Add confirmed collaborators to the list (they should appear first)
            collaborators = [...confirmedCollaborators, ...collaborators];
        }
    }

    const response = {
      id: collab.id,
      title: collab.title,
      slug: collab.slug,
      summary: collab.summary,
      tags: collab.tags?.map((t: any) => t.tag_name) || [],
      cover_image_url: collab.cover_image_url,
      status: collab.status,
      interests: interestCount || 0,
      author: {
        id: collab.user_id,
        name: authorName,
        avatar: authorAvatar,
        bio: authorProfile?.bio || ''
      },
      ...(user && { userHasInterest, isOwner }),
      ...(isOwner && { collaborators }),
      created_at: collab.created_at,
      updated_at: collab.updated_at
    };

    return NextResponse.json(
      successResponse(response, 'Collab post retrieved successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/collab/[id]:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/collab/[id]
 * Update collab post (owner only)
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

    const collabId = params.id;
    const body = await request.json();
    const { title, summary, tags, cover_image_url, status } = body;

    const supabase = createServerClient();

    // Verify ownership
    const { data: existingCollab, error: fetchError } = await supabase
      .from('collab_posts')
      .select('user_id')
      .eq('id', collabId)
      .single();

    if (fetchError || !existingCollab) {
      return NextResponse.json(
        errorResponse('Collab not found'),
        { status: 404 }
      );
    }

    if (existingCollab.user_id !== user.id) {
      return NextResponse.json(
        errorResponse('Forbidden: You do not own this collab'),
        { status: 403 }
      );
    }

    // Build update object
    const updateData: any = {};
    
    if (title !== undefined) {
      if (title.length < 3 || title.length > 200) {
        return NextResponse.json(
          errorResponse('Title must be between 3 and 200 characters'),
          { status: 400 }
        );
      }
      updateData.title = title;
      updateData.slug = title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .substring(0, 100);
    }

    if (summary !== undefined) {
      if (summary.length < 10 || summary.length > 5000) {
        return NextResponse.json(
          errorResponse('Summary must be between 10 and 5000 characters'),
          { status: 400 }
        );
      }
      updateData.summary = summary;
    }

    if (cover_image_url !== undefined) {
      updateData.cover_image_url = cover_image_url;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    // Update collab post
    const { data: updatedCollab, error: updateError } = await supabase
      .from('collab_posts')
      .update(updateData)
      .eq('id', collabId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating collab:', updateError);
      return NextResponse.json(
        errorResponse('Failed to update collab', updateError.message),
        { status: 500 }
      );
    }

    // Update tags if provided
    if (tags !== undefined && Array.isArray(tags)) {
      // Delete existing tags
      await supabase
        .from('collab_tags')
        .delete()
        .eq('collab_id', collabId);

      // Insert new tags
      if (tags.length > 0) {
        const tagRecords = tags.map((tag: string) => ({
          collab_id: collabId,
          tag_name: tag
        }));

        await supabase
          .from('collab_tags')
          .insert(tagRecords);
      }
    }

    // Fetch updated tags
    const { data: updatedTags } = await supabase
      .from('collab_tags')
      .select('tag_name')
      .eq('collab_id', collabId);

    return NextResponse.json(
      successResponse(
        {
          ...updatedCollab,
          tags: updatedTags?.map((t: any) => t.tag_name) || []
        },
        'Collab post updated successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in PATCH /api/collab/[id]:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/collab/[id]
 * Delete collab post (owner only)
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

    const collabId = params.id;
    const supabase = createServerClient();

    // Verify ownership
    const { data: existingCollab, error: fetchError } = await supabase
      .from('collab_posts')
      .select('user_id')
      .eq('id', collabId)
      .single();

    if (fetchError || !existingCollab) {
      return NextResponse.json(
        errorResponse('Collab not found'),
        { status: 404 }
      );
    }

    if (existingCollab.user_id !== user.id) {
      return NextResponse.json(
        errorResponse('Forbidden: You do not own this collab'),
        { status: 403 }
      );
    }

    // Delete collab (CASCADE will handle related records)
    const { error: deleteError } = await supabase
      .from('collab_posts')
      .delete()
      .eq('id', collabId);

    if (deleteError) {
      console.error('Error deleting collab:', deleteError);
      return NextResponse.json(
        errorResponse('Failed to delete collab', deleteError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(null, 'Collab post deleted successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in DELETE /api/collab/[id]:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
