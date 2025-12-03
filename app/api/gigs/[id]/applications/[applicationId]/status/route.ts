import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * PATCH /api/gigs/[id]/applications/[applicationId]/status
 * Update application status (creator only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; applicationId: string }> }
) {
  try {
    const supabase = createServerClient();
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);

    if (!user) {
      return NextResponse.json(
        errorResponse('Authentication required'),
        { status: 401 }
      );
    }

    const { id: gigId, applicationId } = await params;
    const body = await request.json();
    const { status: newStatus } = body;

    if (!newStatus) {
      return NextResponse.json(
        errorResponse('Status is required'),
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'shortlisted', 'confirmed', 'released'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        errorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`),
        { status: 400 }
      );
    }

    // Verify user is gig creator
    const { data: gig, error: gigError } = await supabase
      .from('gigs')
      .select('id, created_by, title')
      .eq('id', gigId)
      .maybeSingle();

    if (gigError || !gig) {
      return NextResponse.json(
        errorResponse('Gig not found'),
        { status: 404 }
      );
    }

    if (gig.created_by !== user.id) {
      return NextResponse.json(
        errorResponse('You do not have permission to update applications for this gig'),
        { status: 403 }
      );
    }

    // Verify application exists and belongs to this gig
    const { data: existingApplication, error: appCheckError } = await supabase
      .from('applications')
      .select('id, gig_id, applicant_user_id, status')
      .eq('id', applicationId)
      .eq('gig_id', gigId)
      .maybeSingle();

    if (appCheckError || !existingApplication) {
      return NextResponse.json(
        errorResponse('Application not found'),
        { status: 404 }
      );
    }

    // Update application status
    const { data: updatedApplication, error: updateError } = await supabase
      .from('applications')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (updateError) {
      console.error('Application update error:', updateError);
      return NextResponse.json(
        errorResponse('Failed to update application status', updateError.message),
        { status: 500 }
      );
    }

    // Create notification for applicant
    const statusMessages: { [key: string]: string } = {
      pending: 'Your application status has been updated to pending.',
      shortlisted: 'Great news! Your application has been shortlisted.',
      confirmed: 'Congratulations! Your application has been confirmed.',
      released: 'Your application status has been updated to released.'
    };

    if (statusMessages[newStatus] && newStatus !== existingApplication.status) {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: existingApplication.applicant_user_id,
          type: 'status_changed',
          title: 'Application Status Updated',
          message: `${statusMessages[newStatus]} - "${gig.title}"`,
          related_gig_id: gigId,
          related_application_id: applicationId,
          is_read: false
        });

      if (notificationError) {
        console.error('Notification creation error:', notificationError);
        // Don't fail the update if notification fails
      }
    }

    return NextResponse.json(
      successResponse(
        {
          id: updatedApplication.id,
          gigId: updatedApplication.gig_id,
          status: updatedApplication.status,
          updatedAt: updatedApplication.updated_at
        },
        'Application status updated successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('PATCH /api/gigs/[id]/applications/[applicationId]/status error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
