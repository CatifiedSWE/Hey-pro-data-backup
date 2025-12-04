import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';
import { checkProfileComplete } from '@/lib/supabase/helpers';

/**
 * POST /api/gigs/[id]/apply
 * Apply to a gig
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: gigId } = await params;
    const body = await request.json();

    // Check profile completeness
    const { isComplete } = await checkProfileComplete(user.id);
    if (!isComplete) {
      return NextResponse.json(
        errorResponse('Please complete your profile before applying to gigs'),
        { status: 403 }
      );
    }

    // Verify gig exists and is not expired
    const { data: gig, error: gigError } = await supabase
      .from('gigs')
      .select('id, created_by, status, expiry_date, title')
      .eq('id', gigId)
      .maybeSingle();

    if (gigError || !gig) {
      return NextResponse.json(
        errorResponse('Gig not found'),
        { status: 404 }
      );
    }

    // Verify not applying to own gig
    if (gig.created_by === user.id) {
      return NextResponse.json(
        errorResponse('You cannot apply to your own gig'),
        { status: 400 }
      );
    }

    // Check if gig is active and not expired
    if (gig.status !== 'active') {
      return NextResponse.json(
        errorResponse('This gig is no longer accepting applications'),
        { status: 400 }
      );
    }

    if (gig.expiry_date && new Date(gig.expiry_date) < new Date()) {
      return NextResponse.json(
        errorResponse('This gig has expired'),
        { status: 400 }
      );
    }

    // Check for duplicate application
    const { data: existingApplication } = await supabase
      .from('applications')
      .select('id')
      .eq('gig_id', gigId)
      .eq('applicant_user_id', user.id)
      .maybeSingle();

    if (existingApplication) {
      return NextResponse.json(
        errorResponse('You have already applied to this gig'),
        { status: 400 }
      );
    }

    // Insert into applications table
    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .insert({
        gig_id: gigId,
        applicant_user_id: user.id,
        cover_letter: body.coverLetter || null,
        portfolio_links: body.portfolioLinks || null,
        resume_url: body.resumeUrl || null,
        selected_credits: body.selectedCredits || [],
        selected_rate: body.selectedRate || null,
        availability_data: body.availabilityData || [],
        status: 'pending'
      })
      .select()
      .single();

    if (applicationError) {
      console.error('Application insert error:', applicationError);
      return NextResponse.json(
        errorResponse('Failed to submit application', applicationError.message),
        { status: 500 }
      );
    }

    // Create notification for gig creator
    const { data: applicantProfile } = await supabase
      .from('user_profiles')
      .select('name')
      .eq('user_id', user.id)
      .maybeSingle();

    const applicantName = applicantProfile?.name || 'Someone';

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: gig.created_by,
        type: 'application_received',
        title: 'New Application Received',
        message: `${applicantName} has applied to your gig "${gig.title}"`,
        related_gig_id: gigId,
        related_application_id: application.id,
        is_read: false
      });

    if (notificationError) {
      console.error('Notification creation error:', notificationError);
      // Don't fail the application if notification fails
    }

    return NextResponse.json(
      successResponse(
        {
          id: application.id,
          gigId: application.gig_id,
          status: application.status,
          appliedAt: application.updated_at
        },
        'Application submitted successfully'
      ),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/gigs/[id]/apply error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
