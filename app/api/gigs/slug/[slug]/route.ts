import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/supabase/server';
import { transformCalendarMonths, formatBudgetLabel } from '@/lib/supabase/helpers';

/**
 * GET /api/gigs/slug/[slug]
 * Get gig details by slug (for /gigs/[slug] page)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createServerClient();
    const slug = params.slug;

    // Fetch gig by slug
    const { data: gig, error: gigError } = await supabase
      .from('gigs')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (gigError) {
      console.error('Gig fetch error:', gigError);
      return NextResponse.json(
        errorResponse('Failed to fetch gig', gigError.message),
        { status: 500 }
      );
    }

    if (!gig) {
      return NextResponse.json(
        errorResponse('Gig not found'),
        { status: 404 }
      );
    }

    // Get creator profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('name, profile_photo_url')
      .eq('user_id', gig.created_by)
      .maybeSingle();

    // Get gig dates
    const { data: dates } = await supabase
      .from('gig_dates')
      .select('month, days')
      .eq('gig_id', gig.id)
      .order('created_at');

    // Get gig locations
    const { data: locations } = await supabase
      .from('gig_locations')
      .select('location_name')
      .eq('gig_id', gig.id)
      .order('created_at');

    // Get gig references
    const { data: references } = await supabase
      .from('gig_references')
      .select('id, label, url, type')
      .eq('gig_id', gig.id)
      .order('created_at');

    // Count applications
    const { count: applicationCount } = await supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('gig_id', gig.id);

    // Transform dates to calendar format
    const dateWindows = (dates || []).map(d => ({
      label: d.month,
      range: d.days
    }));
    
    const calendarMonths = dates && dates.length > 0 
      ? transformCalendarMonths(dates) 
      : [];

    return NextResponse.json(
      successResponse(
        {
          id: gig.id,
          slug: gig.slug,
          title: gig.title,
          description: gig.description,
          qualifyingCriteria: gig.qualifying_criteria,
          amount: gig.amount,
          currency: gig.currency,
          budgetLabel: formatBudgetLabel(gig.amount, gig.currency, gig.request_quote),
          crewCount: gig.crew_count,
          role: gig.role,
          type: gig.type,
          department: gig.department,
          company: gig.company,
          isTbc: gig.is_tbc,
          requestQuote: gig.request_quote,
          expiryDate: gig.expiry_date,
          supportingFileLabel: gig.supporting_file_label,
          referenceUrl: gig.reference_url,
          status: gig.status,
          postedOn: gig.created_at,
          postedBy: {
            name: profile?.name || 'Unknown',
            avatar: profile?.profile_photo_url || null
          },
          dateWindows,
          calendarMonths,
          locations: (locations || []).map(l => l.location_name),
          location: (locations || []).map(l => l.location_name).join(', '),
          references: references || [],
          applicationCount: applicationCount || 0
        },
        'Gig retrieved successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/gigs/slug/[slug] error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
