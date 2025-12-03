import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';
import { formatBudgetLabel } from '@/lib/supabase/helpers';

/**
 * GET /api/applications/[id]
 * Get application details
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

    const { id: applicationId } = await params;

    // Fetch application with gig details
    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .select(`
        id,
        gig_id,
        applicant_user_id,
        status,
        cover_letter,
        portfolio_links,
        resume_url,
        created_at,
        updated_at
      `)
      .eq('id', applicationId)
      .maybeSingle();

    if (applicationError || !application) {
      return NextResponse.json(
        errorResponse('Application not found'),
        { status: 404 }
      );
    }

    // Verify user is applicant or gig creator
    const { data: gig } = await supabase
      .from('gigs')
      .select('id, created_by, title, description, company, amount, currency, request_quote, status, expiry_date, role, type')
      .eq('id', application.gig_id)
      .maybeSingle();

    if (!gig) {
      return NextResponse.json(
        errorResponse('Associated gig not found'),
        { status: 404 }
      );
    }

    const isApplicant = application.applicant_user_id === user.id;
    const isCreator = gig.created_by === user.id;

    if (!isApplicant && !isCreator) {
      return NextResponse.json(
        errorResponse('You do not have permission to view this application'),
        { status: 403 }
      );
    }

    // Get applicant profile (visible to both applicant and creator)
    const { data: applicantProfile } = await supabase
      .from('user_profiles')
      .select(`
        id,
        name,
        profile_photo_url,
        bio,
        country,
        city,
        email,
        phone
      `)
      .eq('id', application.applicant_user_id)
      .maybeSingle();

    // Get applicant skills
    const { data: skills } = await supabase
      .from('user_skills')
      .select('skill_name, proficiency_level')
      .eq('user_id', application.applicant_user_id)
      .order('sort_order');

    // Get applicant experience
    const { data: experience } = await supabase
      .from('user_experience')
      .select(`
        id,
        job_title,
        company_name,
        description,
        start_date,
        end_date,
        is_current
      `)
      .eq('user_id', application.applicant_user_id)
      .order('start_date', { ascending: false });

    // Get gig creator profile
    const { data: creatorProfile } = await supabase
      .from('user_profiles')
      .select('name, profile_photo_url')
      .eq('id', gig.created_by)
      .maybeSingle();

    // Get gig locations
    const { data: locations } = await supabase
      .from('gig_locations')
      .select('location_name')
      .eq('gig_id', gig.id);

    return NextResponse.json(
      successResponse(
        {
          id: application.id,
          status: application.status,
          coverLetter: application.cover_letter,
          portfolioLinks: application.portfolio_links,
          resumeUrl: application.resume_url,
          appliedAt: application.created_at,
          updatedAt: application.updated_at,
          applicant: {
            id: application.applicant_user_id,
            name: applicantProfile?.name || 'Unknown',
            profilePhoto: applicantProfile?.profile_photo_url || null,
            bio: applicantProfile?.bio || null,
            location: applicantProfile?.city && applicantProfile?.country 
              ? `${applicantProfile.city}, ${applicantProfile.country}` 
              : applicantProfile?.country || 'Not specified',
            email: isCreator ? applicantProfile?.email : null, // Only show email to creator
            phone: isCreator ? applicantProfile?.phone : null, // Only show phone to creator
            skills: (skills || []).map(s => ({
              name: s.skill_name,
              level: s.proficiency_level
            })),
            experience: (experience || []).map(exp => ({
              id: exp.id,
              title: exp.job_title,
              company: exp.company_name,
              description: exp.description,
              startDate: exp.start_date,
              endDate: exp.end_date,
              isCurrent: exp.is_current
            }))
          },
          gig: {
            id: gig.id,
            title: gig.title,
            description: gig.description,
            company: gig.company,
            budgetLabel: formatBudgetLabel(gig.amount, gig.currency, gig.request_quote),
            status: gig.status,
            expiryDate: gig.expiry_date,
            role: gig.role,
            type: gig.type,
            locations: (locations || []).map(l => l.location_name),
            postedBy: {
              name: creatorProfile?.name || 'Unknown',
              avatar: creatorProfile?.profile_photo_url || null
            }
          },
          permissions: {
            canUpdateStatus: isCreator,
            canWithdraw: isApplicant && application.status === 'pending'
          }
        },
        'Application retrieved successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/applications/[id] error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/applications/[id]
 * Withdraw application (applicant only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const applicationId = params.id;

    // Fetch application
    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .select('id, applicant_user_id, status, gig_id')
      .eq('id', applicationId)
      .maybeSingle();

    if (applicationError || !application) {
      return NextResponse.json(
        errorResponse('Application not found'),
        { status: 404 }
      );
    }

    // Verify user is the applicant
    if (application.applicant_user_id !== user.id) {
      return NextResponse.json(
        errorResponse('You do not have permission to withdraw this application'),
        { status: 403 }
      );
    }

    // Only allow withdrawal if status is pending
    if (application.status !== 'pending') {
      return NextResponse.json(
        errorResponse(`Cannot withdraw application with status: ${application.status}`),
        { status: 400 }
      );
    }

    // Delete application
    const { error: deleteError } = await supabase
      .from('applications')
      .delete()
      .eq('id', applicationId);

    if (deleteError) {
      console.error('Application delete error:', deleteError);
      return NextResponse.json(
        errorResponse('Failed to withdraw application', deleteError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(
        null,
        'Application withdrawn successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE /api/applications/[id] error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
