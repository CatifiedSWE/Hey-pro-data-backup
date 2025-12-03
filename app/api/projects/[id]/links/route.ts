import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/projects/[id]/links
 * Get project links
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
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

    // Check if user is team member
    let isTeamMember = false;
    if (user) {
      const { data: teamMember } = await supabase
        .from('project_team')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();
      
      isTeamMember = !!teamMember;
    }

    // Check access permissions
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

    // Fetch links ordered by sort_order
    const { data: links, error: linksError } = await supabase
      .from('project_links')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true });

    if (linksError) {
      console.error('Error fetching links:', linksError);
      return NextResponse.json(
        errorResponse('Failed to fetch links', linksError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(links || [], 'Project links retrieved successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/projects/[id]/links:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[id]/links
 * Add a project link (team members with contribute/admin permission)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { label, url, sort_order = 0 } = body;

    // Validate required fields
    if (!label || label.length < 1 || label.length > 100) {
      return NextResponse.json(
        errorResponse('Label must be between 1 and 100 characters'),
        { status: 400 }
      );
    }

    if (!url || url.length < 1 || url.length > 2000) {
      return NextResponse.json(
        errorResponse('URL must be between 1 and 2000 characters'),
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if user is project owner or has contribute/admin permission
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

    // Check team member permission
    let hasPermission = isOwner;
    if (!isOwner) {
      const { data: teamMember } = await supabase
        .from('project_team')
        .select('permission')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();

      hasPermission = teamMember?.permission === 'contribute' || teamMember?.permission === 'admin';
    }

    if (!hasPermission) {
      return NextResponse.json(
        errorResponse('You need contribute or admin permission to add links'),
        { status: 403 }
      );
    }

    // Add link
    const { data: newLink, error: insertError } = await supabase
      .from('project_links')
      .insert({
        project_id: projectId,
        label,
        url,
        sort_order
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error adding link:', insertError);
      return NextResponse.json(
        errorResponse('Failed to add link', insertError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(newLink, 'Link added successfully'),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/projects/[id]/links:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
