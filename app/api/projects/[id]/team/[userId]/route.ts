import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * PATCH /api/projects/[id]/team/[userId]
 * Update team member permissions (owner or admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
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
    const { id: projectId } = await params;
    const teamUserId = params.userId;
    const { role, department, permission } = body;

    // Validate permission if provided
    if (permission && !['view', 'contribute', 'admin'].includes(permission)) {
      return NextResponse.json(
        errorResponse('Invalid permission. Must be view, contribute, or admin'),
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if requester is owner or admin
    const { data: project, error: projectError } = await supabase
      .from('design_projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        errorResponse('Project not found'),
        { status: 404 }
      );
    }

    const isOwner = project.user_id === user.id;

    // Check if user has admin permission
    let hasAdminPermission = false;
    if (!isOwner) {
      const { data: teamMember } = await supabase
        .from('project_team')
        .select('permission')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();

      hasAdminPermission = teamMember?.permission === 'admin';
    }

    if (!isOwner && !hasAdminPermission) {
      return NextResponse.json(
        errorResponse('Only project owner or admins can update team members'),
        { status: 403 }
      );
    }

    // Build update object
    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (permission !== undefined) updateData.permission = permission;

    // Update team member
    const { data: updatedMember, error: updateError } = await supabase
      .from('project_team')
      .update(updateData)
      .eq('project_id', projectId)
      .eq('user_id', teamUserId)
      .select(`
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
      `)
      .single();

    if (updateError) {
      console.error('Error updating team member:', updateError);
      return NextResponse.json(
        errorResponse('Failed to update team member', updateError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(updatedMember, 'Team member updated successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in PATCH /api/projects/[id]/team/[userId]:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]/team/[userId]
 * Remove team member (owner or admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
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

    const { id: projectId } = await params;
    const teamUserId = params.userId;

    const supabase = createServerClient();

    // Check if requester is owner or admin
    const { data: project, error: projectError } = await supabase
      .from('design_projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        errorResponse('Project not found'),
        { status: 404 }
      );
    }

    const isOwner = project.user_id === user.id;

    // Check if user has admin permission
    let hasAdminPermission = false;
    if (!isOwner) {
      const { data: teamMember } = await supabase
        .from('project_team')
        .select('permission')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();

      hasAdminPermission = teamMember?.permission === 'admin';
    }

    if (!isOwner && !hasAdminPermission) {
      return NextResponse.json(
        errorResponse('Only project owner or admins can remove team members'),
        { status: 403 }
      );
    }

    // Prevent owner from being removed
    if (teamUserId === project.user_id) {
      return NextResponse.json(
        errorResponse('Cannot remove project owner from team'),
        { status: 400 }
      );
    }

    // Remove team member
    const { error: deleteError } = await supabase
      .from('project_team')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', teamUserId);

    if (deleteError) {
      console.error('Error removing team member:', deleteError);
      return NextResponse.json(
        errorResponse('Failed to remove team member', deleteError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(null, 'Team member removed successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in DELETE /api/projects/[id]/team/[userId]:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
