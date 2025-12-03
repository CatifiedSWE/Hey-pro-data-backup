import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/gigs/[id]/applications
 * Get all applications for a gig (creator only)
 */
export async function GET(
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
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status'); // Filter by status: pending, shortlisted, confirmed, released

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
        errorResponse('You do not have permission to view applications for this gig'),
        { status: 403 }
      );
    }

    // Fetch applications with applicant profiles
    let query = supabase
      .from('applications')
      .select(`
        id,
        gig_id,
        applicant_user_id,
        status,
        cover_letter,
        portfolio_links,
        resume_url,
        updated_at
      `)
      .eq('gig_id', gigId)
      .order('updated_at', { ascending: false });

    // Apply status filter if provided
    if (statusFilter && ['pending', 'shortlisted', 'confirmed', 'released'].includes(statusFilter)) {
      query = query.eq('status', statusFilter);
    }

    const { data: applications, error: applicationsError } = await query;

    if (applicationsError) {
      console.error('Applications fetch error:', applicationsError);
      return NextResponse.json(
        errorResponse('Failed to fetch applications', applicationsError.message),
        { status: 500 }
      );
    }

    // Fetch applicant profiles for each application
    const applicationsWithProfiles = await Promise.all(
      (applications || []).map(async (app) => {
        // Get applicant profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select(`
            user_id,
            name,
            profile_photo_url,
            bio,
            country,
            city,
            email,
            phone
          `)
          .eq('user_id', app.applicant_user_id)
          .maybeSingle();

        // Get applicant skills
        const { data: skills } = await supabase
          .from('user_skills')
          .select('skill_name, proficiency_level')
          .eq('user_id', app.applicant_user_id)
          .order('sort_order');

        // Get applicant experience
        const { data: experience } = await supabase
          .from('user_experience')
          .select(`
            id,
            job_title,
            company_name,
            start_date,
            end_date,
            is_current
          `)
          .eq('user_id', app.applicant_user_id)
          .order('start_date', { ascending: false })
          .limit(3); // Get latest 3 experiences

        return {
          id: app.id,
          gigId: app.gig_id,
          status: app.status,
          coverLetter: app.cover_letter,
          portfolioLinks: app.portfolio_links,
          resumeUrl: app.resume_url,
          appliedAt: app.created_at,
          updatedAt: app.updated_at,
          applicant: {
            id: app.applicant_user_id,
            name: profile?.name || 'Unknown',
            profilePhoto: profile?.profile_photo_url || null,
            bio: profile?.bio || null,
            location: profile?.city && profile?.country 
              ? `${profile.city}, ${profile.country}` 
              : profile?.country || 'Not specified',
            email: profile?.email || null,
            phone: profile?.phone || null,
            skills: (skills || []).map(s => ({
              name: s.skill_name,
              level: s.proficiency_level
            })),
            recentExperience: (experience || []).map(exp => ({
              id: exp.id,
              title: exp.job_title,
              company: exp.company_name,
              startDate: exp.start_date,
              endDate: exp.end_date,
              isCurrent: exp.is_current
            }))
          }
        };
      })
    );

    // Get statistics
    const stats = {
      total: applications?.length || 0,
      pending: applications?.filter(a => a.status === 'pending').length || 0,
      shortlisted: applications?.filter(a => a.status === 'shortlisted').length || 0,
      confirmed: applications?.filter(a => a.status === 'confirmed').length || 0,
      released: applications?.filter(a => a.status === 'released').length || 0
    };

    return NextResponse.json(
      successResponse(
        {
          applications: applicationsWithProfiles,
          stats,
          gigTitle: gig.title
        },
        'Applications retrieved successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/gigs/[id]/applications error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/gigs/[id]/applications/[applicationId]
 * Update application status (for gig creators)
 * Note: This is a bonus endpoint for updating individual application status
 */
export async function PATCH(
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
    const { applicationId, status: newStatus } = body;

    if (!applicationId || !newStatus) {
      return NextResponse.json(
        errorResponse('applicationId and status are required'),
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

    // Update application status
    const { data: updatedApplication, error: updateError } = await supabase
      .from('applications')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .eq('gig_id', gigId)
      .select()
      .single();

    if (updateError) {
      console.error('Application update error:', updateError);
      return NextResponse.json(
        errorResponse('Failed to update application', updateError.message),
        { status: 500 }
      );
    }

    // Create notification for applicant
    const statusMessages: { [key: string]: string } = {
      shortlisted: 'Your application has been shortlisted!',
      confirmed: 'Congratulations! Your application has been confirmed.',
      released: 'Your application status has been updated to released.'
    };

    if (statusMessages[newStatus]) {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: updatedApplication.applicant_user_id,
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
          status: updatedApplication.status,
          updatedAt: updatedApplication.updated_at
        },
        'Application status updated successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('PATCH /api/gigs/[id]/applications error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
