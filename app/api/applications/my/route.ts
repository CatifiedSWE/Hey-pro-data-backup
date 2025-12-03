import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';
import { formatBudgetLabel } from '@/lib/supabase/helpers';

/**
 * GET /api/applications/my
 * Get user's applications
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status'); // Filter by status: pending, shortlisted, confirmed, released
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Fetch user's applications
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
      `, { count: 'exact' })
      .eq('applicant_user_id', user.id)
      .order('updated_at', { ascending: false });

    // Apply status filter if provided
    if (statusFilter && ['pending', 'shortlisted', 'confirmed', 'released'].includes(statusFilter)) {
      query = query.eq('status', statusFilter);
    }

    // Apply pagination
    const { data: applications, error: applicationsError, count } = await query
      .range(offset, offset + limit - 1);

    if (applicationsError) {
      console.error('Applications fetch error:', applicationsError);
      return NextResponse.json(
        errorResponse('Failed to fetch applications', applicationsError.message),
        { status: 500 }
      );
    }

    // Fetch gig details for each application
    const applicationsWithGigs = await Promise.all(
      (applications || []).map(async (app) => {
        // Get gig details
        const { data: gig } = await supabase
          .from('gigs')
          .select(`
            id,
            slug,
            title,
            description,
            company,
            amount,
            currency,
            request_quote,
            role,
            type,
            department,
            status,
            expiry_date,
            created_by,
            created_at
          `)
          .eq('id', app.gig_id)
          .maybeSingle();

        if (!gig) {
          return null; // Skip if gig was deleted
        }

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
          .eq('gig_id', gig.id)
          .order('created_at');

        // Count total applications for this gig
        const { count: totalApplications } = await supabase
          .from('applications')
          .select('id', { count: 'exact', head: true })
          .eq('gig_id', gig.id);

        return {
          id: app.id,
          status: app.status,
          coverLetter: app.cover_letter,
          portfolioLinks: app.portfolio_links,
          resumeUrl: app.resume_url,
          appliedAt: app.created_at,
          updatedAt: app.updated_at,
          gig: {
            id: gig.id,
            slug: gig.slug,
            title: gig.title,
            description: gig.description,
            company: gig.company,
            budgetLabel: formatBudgetLabel(gig.amount, gig.currency, gig.request_quote),
            role: gig.role,
            type: gig.type,
            department: gig.department,
            status: gig.status,
            expiryDate: gig.expiry_date,
            postedOn: gig.created_at,
            locations: (locations || []).map(l => l.location_name),
            location: (locations || []).map(l => l.location_name).join(', '),
            postedBy: {
              name: creatorProfile?.name || 'Unknown',
              avatar: creatorProfile?.profile_photo_url || null
            },
            totalApplications: totalApplications || 0
          }
        };
      })
    );

    // Filter out null entries (deleted gigs)
    const validApplications = applicationsWithGigs.filter(app => app !== null);

    // Calculate statistics
    const allApplicationsForStats = await supabase
      .from('applications')
      .select('status')
      .eq('applicant_user_id', user.id);

    const stats = {
      total: allApplicationsForStats.data?.length || 0,
      pending: allApplicationsForStats.data?.filter(a => a.status === 'pending').length || 0,
      shortlisted: allApplicationsForStats.data?.filter(a => a.status === 'shortlisted').length || 0,
      confirmed: allApplicationsForStats.data?.filter(a => a.status === 'confirmed').length || 0,
      released: allApplicationsForStats.data?.filter(a => a.status === 'released').length || 0
    };

    return NextResponse.json(
      successResponse(
        {
          applications: validApplications,
          stats,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil((count || 0) / limit),
            totalApplications: count || 0,
            limit
          }
        },
        'Applications retrieved successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/applications/my error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
