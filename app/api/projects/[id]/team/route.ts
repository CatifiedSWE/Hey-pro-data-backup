import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/projects/[id]/team
 * Get project team members
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

    // Check if project exists and user has access
    const { data: project, error: projectError } = await supabase
      .from('design_projects')
      .select('user_id, privacy')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        errorResponse('Project not found'),
        { status: 404 }
      );
    }

    // Check access based on privacy
    const isOwner = user?.id === project.user_id;

    // For private projects, only owner can view team
    if (project.privacy === 'private' && !isOwner) {
      return NextResponse.json(
        errorResponse('Access denied'),
        { status: 403 }
      );
    }

    // Fetch team members
    const { data: teamMembers, error: teamError } = await supabase
      .from('project_team')
      .select(`
        id,
        user_id,
        role,
        department,
        permission,
        added_at,
        added_by,
        user:user_id (
          id,
          raw_user_meta_data
        )
      `)
      .eq('project_id', projectId)
      .order('added_at', { ascending: false });

    if (teamError) {
      console.error('Error fetching team members:', teamError);
      return NextResponse.json(
        errorResponse('Failed to fetch team members', teamError.message),
        { status: 500 }
      );
    }

    // Format response
    const formattedTeam = (teamMembers || []).map((member: any) => ({
      id: member.id,
      user_id: member.user_id,
      role: member.role,
      department: member.department,
      permission: member.permission,
      added_at: member.added_at,
      added_by: member.added_by,
      user: {
        id: member.user?.id,
        name: member.user?.raw_user_meta_data?.name || 
              member.user?.raw_user_meta_data?.full_name || 
              'Unknown',
        avatar: member.user?.raw_user_meta_data?.avatar_url || 
                member.user?.raw_user_meta_data?.profile_photo_url || 
                '/default-profile.png',
        email: member.user?.raw_user_meta_data?.email
      }
    }));

    return NextResponse.json(
      successResponse(formattedTeam, 'Team members retrieved successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/projects/[id]/team:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[id]/team
 * Add a team member (owner or admin only)
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
    const projectId = params.id;
    const { user_id, role, department, permission = 'view' } = body;

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        errorResponse('User ID is required'),
        { status: 400 }
      );
    }

    // Validate permission value
    if (!['view', 'contribute', 'admin'].includes(permission)) {
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
        errorResponse('Only project owner or admins can add team members'),
        { status: 403 }
      );
    }

    // Check if user is already a team member
    const { data: existing } = await supabase
      .from('project_team')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', user_id)
      .single();

    if (existing) {
      return NextResponse.json(
        errorResponse('User is already a team member'),
        { status: 400 }
      );
    }

    // Add team member
    const { data: newMember, error: insertError } = await supabase
      .from('project_team')
      .insert({
        project_id: projectId,
        user_id,
        role,
        department,
        permission,
        added_by: user.id
      })
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

    if (insertError) {
      console.error('Error adding team member:', insertError);
      return NextResponse.json(
        errorResponse('Failed to add team member', insertError.message),
        { status: 500 }
      );
    }

    // Format response
    const formattedMember = {
      id: newMember.id,
      user_id: newMember.user_id,
      role: newMember.role,
      department: newMember.department,
      permission: newMember.permission,
      added_at: newMember.added_at,
      user: {
        id: newMember.user?.id,
        name: newMember.user?.raw_user_meta_data?.name || 
              newMember.user?.raw_user_meta_data?.full_name || 
              'Unknown',
        avatar: newMember.user?.raw_user_meta_data?.avatar_url || 
                newMember.user?.raw_user_meta_data?.profile_photo_url || 
                '/default-profile.png'
      }
    };

    return NextResponse.json(
      successResponse(formattedMember, 'Team member added successfully'),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/projects/[id]/team:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
