import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/projects/[id]
 * Get project details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);

    const supabase = createServerClient();

    // Fetch project with related data
    const { data: project, error } = await supabase
      .from('design_projects')
      .select(`
        *,
        owner:user_id (
          id,
          raw_user_meta_data
        ),
        tags:project_tags(id, tag_name),
        team:project_team(
          id,
          user_id,
          role,
          department,
          permission,
          added_at,
          user:user_id (
            id,
            raw_user_meta_data
          )
        ),
        files:project_files(
          id,
          file_name,
          file_url,
          file_type,
          file_size,
          description,
          uploaded_by,
          created_at
        ),
        links:project_links(
          id,
          label,
          url,
          sort_order
        )
      `)
      .eq('id', projectId)
      .single();

    if (error || !project) {
      return NextResponse.json(
        errorResponse('Project not found'),
        { status: 404 }
      );
    }

    // Check access permissions based on privacy
    const isOwner = user?.id === project.user_id;
    const isTeamMember = project.team?.some((member: any) => member.user_id === user?.id);

    if (project.privacy === 'private' && !isOwner) {
      return NextResponse.json(
        errorResponse('Access denied'),
        { status: 403 }
      );
    }

    if (project.privacy === 'team_only' && !isOwner && !isTeamMember) {
      return NextResponse.json(
        errorResponse('Access denied'),
        { status: 403 }
      );
    }

    // Format response
    const formattedProject = {
      id: project.id,
      title: project.title,
      slug: project.slug,
      description: project.description,
      project_type: project.project_type,
      status: project.status,
      privacy: project.privacy,
      start_date: project.start_date,
      end_date: project.end_date,
      estimated_duration: project.estimated_duration,
      budget_amount: project.budget_amount,
      budget_currency: project.budget_currency,
      location: project.location,
      is_remote: project.is_remote,
      thumbnail_url: project.thumbnail_url,
      hero_image_url: project.hero_image_url,
      tags: project.tags?.map((t: any) => t.tag_name) || [],
      owner: {
        id: project.owner?.id,
        name: project.owner?.raw_user_meta_data?.name || 
              project.owner?.raw_user_meta_data?.full_name || 
              'Unknown',
        avatar: project.owner?.raw_user_meta_data?.avatar_url || 
                project.owner?.raw_user_meta_data?.profile_photo_url || 
                '/default-profile.png'
      },
      team: project.team?.map((member: any) => ({
        id: member.id,
        user_id: member.user_id,
        role: member.role,
        department: member.department,
        permission: member.permission,
        added_at: member.added_at,
        user: {
          id: member.user?.id,
          name: member.user?.raw_user_meta_data?.name || 
                member.user?.raw_user_meta_data?.full_name || 
                'Unknown',
          avatar: member.user?.raw_user_meta_data?.avatar_url || 
                  member.user?.raw_user_meta_data?.profile_photo_url || 
                  '/default-profile.png'
        }
      })) || [],
      files: project.files || [],
      links: (project.links || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
      is_owner: isOwner,
      is_team_member: isTeamMember,
      created_at: project.created_at,
      updated_at: project.updated_at
    };

    return NextResponse.json(
      successResponse(formattedProject, 'Project retrieved successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/projects/[id]:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects/[id]
 * Update project (owner only)
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
    const projectId = params.id;

    const supabase = createServerClient();

    // Verify user is project owner
    const { data: existingProject, error: fetchError } = await supabase
      .from('design_projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    if (fetchError || !existingProject) {
      return NextResponse.json(
        errorResponse('Project not found'),
        { status: 404 }
      );
    }

    if (existingProject.user_id !== user.id) {
      return NextResponse.json(
        errorResponse('Only project owner can update the project'),
        { status: 403 }
      );
    }

    // Extract fields to update
    const {
      title,
      description,
      project_type,
      status,
      start_date,
      end_date,
      estimated_duration,
      budget_amount,
      budget_currency,
      location,
      is_remote,
      thumbnail_url,
      hero_image_url,
      privacy,
      tags
    } = body;

    // Validate fields if provided
    if (title && (title.length < 3 || title.length > 200)) {
      return NextResponse.json(
        errorResponse('Title must be between 3 and 200 characters'),
        { status: 400 }
      );
    }

    if (description && (description.length < 10 || description.length > 10000)) {
      return NextResponse.json(
        errorResponse('Description must be between 10 and 10000 characters'),
        { status: 400 }
      );
    }

    // Validate dates
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      if (endDate < startDate) {
        return NextResponse.json(
          errorResponse('End date must be after start date'),
          { status: 400 }
        );
      }
    }

    // Build update object
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (project_type !== undefined) updateData.project_type = project_type;
    if (status !== undefined) updateData.status = status;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (estimated_duration !== undefined) updateData.estimated_duration = estimated_duration;
    if (budget_amount !== undefined) updateData.budget_amount = budget_amount;
    if (budget_currency !== undefined) updateData.budget_currency = budget_currency;
    if (location !== undefined) updateData.location = location;
    if (is_remote !== undefined) updateData.is_remote = is_remote;
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url;
    if (hero_image_url !== undefined) updateData.hero_image_url = hero_image_url;
    if (privacy !== undefined) updateData.privacy = privacy;

    // Update project
    const { data: updatedProject, error: updateError } = await supabase
      .from('design_projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single();

    if (updateError) {
      console.error('Project update error:', updateError);
      return NextResponse.json(
        errorResponse('Failed to update project', updateError.message),
        { status: 500 }
      );
    }

    // Update tags if provided
    if (tags !== undefined && Array.isArray(tags)) {
      // Delete existing tags
      await supabase
        .from('project_tags')
        .delete()
        .eq('project_id', projectId);

      // Insert new tags
      if (tags.length > 0) {
        const tagInserts = tags.map((tag: string) => ({
          project_id: projectId,
          tag_name: tag.trim()
        }));

        await supabase
          .from('project_tags')
          .insert(tagInserts);
      }
    }

    return NextResponse.json(
      successResponse(
        { ...updatedProject, tags: tags || [] },
        'Project updated successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in PATCH /api/projects/[id]:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * Delete project (owner only)
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

    const projectId = params.id;
    const supabase = createServerClient();

    // Verify user is project owner
    const { data: project, error: fetchError } = await supabase
      .from('design_projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    if (fetchError || !project) {
      return NextResponse.json(
        errorResponse('Project not found'),
        { status: 404 }
      );
    }

    if (project.user_id !== user.id) {
      return NextResponse.json(
        errorResponse('Only project owner can delete the project'),
        { status: 403 }
      );
    }

    // Delete project (CASCADE will handle related tables)
    const { error: deleteError } = await supabase
      .from('design_projects')
      .delete()
      .eq('id', projectId);

    if (deleteError) {
      console.error('Project deletion error:', deleteError);
      return NextResponse.json(
        errorResponse('Failed to delete project', deleteError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(null, 'Project deleted successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in DELETE /api/projects/[id]:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
