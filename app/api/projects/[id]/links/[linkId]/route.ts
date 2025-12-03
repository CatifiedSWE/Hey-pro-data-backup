import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * DELETE /api/projects/[id]/links/[linkId]
 * Delete a project link (owner, contributor, or admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; linkId: string }> }
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
    const linkId = params.linkId;

    const supabase = createServerClient();

    // Check if user is project owner or has appropriate permission
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
        errorResponse('You need contribute or admin permission to delete links'),
        { status: 403 }
      );
    }

    // Verify link belongs to project
    const { data: link, error: linkError } = await supabase
      .from('project_links')
      .select('id')
      .eq('id', linkId)
      .eq('project_id', projectId)
      .single();

    if (linkError || !link) {
      return NextResponse.json(
        errorResponse('Link not found'),
        { status: 404 }
      );
    }

    // Delete link
    const { error: deleteError } = await supabase
      .from('project_links')
      .delete()
      .eq('id', linkId);

    if (deleteError) {
      console.error('Error deleting link:', deleteError);
      return NextResponse.json(
        errorResponse('Failed to delete link', deleteError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(null, 'Link deleted successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in DELETE /api/projects/[id]/links/[linkId]:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
