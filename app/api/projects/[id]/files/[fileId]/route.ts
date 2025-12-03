import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * DELETE /api/projects/[id]/files/[fileId]
 * Delete a project file (owner, uploader, or admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
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
    const fileId = params.fileId;

    const supabase = createServerClient();

    // Get project owner
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

    // Get file details
    const { data: file, error: fileError } = await supabase
      .from('project_files')
      .select('uploaded_by, file_url')
      .eq('id', fileId)
      .eq('project_id', projectId)
      .single();

    if (fileError || !file) {
      return NextResponse.json(
        errorResponse('File not found'),
        { status: 404 }
      );
    }

    const isOwner = project.user_id === user.id;
    const isUploader = file.uploaded_by === user.id;

    // Check if user has admin permission
    let hasAdminPermission = false;
    if (!isOwner && !isUploader) {
      const { data: teamMember } = await supabase
        .from('project_team')
        .select('permission')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();

      hasAdminPermission = teamMember?.permission === 'admin';
    }

    if (!isOwner && !isUploader && !hasAdminPermission) {
      return NextResponse.json(
        errorResponse('Only project owner, file uploader, or admins can delete files'),
        { status: 403 }
      );
    }

    // Delete file from database (file in storage can be handled separately)
    const { error: deleteError } = await supabase
      .from('project_files')
      .delete()
      .eq('id', fileId);

    if (deleteError) {
      console.error('Error deleting file:', deleteError);
      return NextResponse.json(
        errorResponse('Failed to delete file', deleteError.message),
        { status: 500 }
      );
    }

    // Optionally delete from storage
    // Extract storage path from file_url if needed
    // await supabase.storage.from('project-assets').remove([storagePath]);

    return NextResponse.json(
      successResponse(null, 'File deleted successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in DELETE /api/projects/[id]/files/[fileId]:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
