import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/projects/[id]/files
 * Get project files
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);

    const { searchParams } = new URL(request.url);
    const fileType = searchParams.get('type');

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

    // Fetch files
    let query = supabase
      .from('project_files')
      .select(`
        id,
        file_name,
        file_url,
        file_type,
        file_size,
        description,
        uploaded_by,
        created_at,
        uploader:uploaded_by (
          id,
          raw_user_meta_data
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    // Filter by file type if provided
    if (fileType) {
      query = query.eq('file_type', fileType);
    }

    const { data: files, error: filesError } = await query;

    if (filesError) {
      console.error('Error fetching files:', filesError);
      return NextResponse.json(
        errorResponse('Failed to fetch files', filesError.message),
        { status: 500 }
      );
    }

    // Format response
    const formattedFiles = (files || []).map((file: any) => ({
      id: file.id,
      file_name: file.file_name,
      file_url: file.file_url,
      file_type: file.file_type,
      file_size: file.file_size,
      description: file.description,
      uploaded_by: file.uploaded_by,
      created_at: file.created_at,
      uploader: {
        id: file.uploader?.id,
        name: file.uploader?.raw_user_meta_data?.name || 
              file.uploader?.raw_user_meta_data?.full_name || 
              'Unknown',
        avatar: file.uploader?.raw_user_meta_data?.avatar_url || 
                file.uploader?.raw_user_meta_data?.profile_photo_url || 
                '/default-profile.png'
      }
    }));

    return NextResponse.json(
      successResponse(formattedFiles, 'Project files retrieved successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/projects/[id]/files:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
