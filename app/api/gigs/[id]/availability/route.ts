import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/gigs/[id]/availability
 * Get applicant availability for gig dates (creator only)
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
        errorResponse('You do not have permission to view availability for this gig'),
        { status: 403 }
      );
    }

    // Get gig dates
    const { data: gigDates, error: datesError } = await supabase
      .from('gig_dates')
      .select('month, days')
      .eq('gig_id', gigId)
      .order('created_at');

    if (datesError) {
      console.error('Gig dates fetch error:', datesError);
      return NextResponse.json(
        errorResponse('Failed to fetch gig dates', datesError.message),
        { status: 500 }
      );
    }

    // Get all applicants for this gig
    const { data: applications, error: applicationsError } = await supabase
      .from('applications')
      .select('applicant_user_id, status')
      .eq('gig_id', gigId)
      .in('status', ['pending', 'shortlisted', 'confirmed']);

    if (applicationsError) {
      console.error('Applications fetch error:', applicationsError);
      return NextResponse.json(
        errorResponse('Failed to fetch applications', applicationsError.message),
        { status: 500 }
      );
    }

    if (!applications || applications.length === 0) {
      return NextResponse.json(
        successResponse(
          {
            gigDates: (gigDates || []).map(d => ({
              label: d.month,
              range: d.days
            })),
            applicantsAvailability: []
          },
          'No applications found for this gig'
        ),
        { status: 200 }
      );
    }

    // Parse gig dates to get specific dates
    const parseDateRange = (month: string, days: string): string[] => {
      const dates: string[] = [];
      const ranges = days.split(',').map(r => r.trim());
      
      ranges.forEach(range => {
        if (range.includes('-')) {
          const [start, end] = range.split('-').map(d => parseInt(d.trim()));
          for (let day = start; day <= end; day++) {
            dates.push(`${month}-${day}`);
          }
        } else {
          dates.push(`${month}-${range}`);
        }
      });
      
      return dates;
    };

    // Collect all dates from gig
    const allGigDates: string[] = [];
    (gigDates || []).forEach(gd => {
      allGigDates.push(...parseDateRange(gd.month, gd.days));
    });

    // Get availability for each applicant
    const applicantsAvailability = await Promise.all(
      applications.map(async (app) => {
        // Get applicant profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('name, profile_photo_url')
          .eq('user_id', app.applicant_user_id)
          .maybeSingle();

        // Get user credits to check status
        const { data: credits } = await supabase
          .from('user_credits')
          .select('id')
          .eq('user_id', app.applicant_user_id)
          .limit(1);

        const creditsStatus = credits && credits.length > 0 ? 'added' : 'not_added';

        // Get availability for this applicant
        const { data: availability } = await supabase
          .from('crew_availability')
          .select('availability_date, status')
          .eq('user_id', app.applicant_user_id);

        // Build schedule object
        const schedule: { [key: string]: string } = {};
        
        allGigDates.forEach(gigDate => {
          // Parse gigDate (format: "Sep 2025-12")
          const [monthYear, day] = gigDate.split('-');
          
          // Convert to date format for comparison
          const [monthName, year] = monthYear.split(' ');
          const monthMap: { [key: string]: string } = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
            'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
            'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
          };
          
          const month = monthMap[monthName] || '01';
          const paddedDay = day.padStart(2, '0');
          const dateStr = `${year}-${month}-${paddedDay}`;
          
          // Find availability for this date
          const availabilityRecord = (availability || []).find(
            a => a.availability_date === dateStr
          );
          
          // Set status: available (default), hold, na (not available)
          schedule[gigDate] = availabilityRecord?.status || 'available';
        });

        return {
          applicantId: app.applicant_user_id,
          name: profile?.name || 'Unknown',
          avatar: profile?.profile_photo_url || null,
          creditsStatus,
          applicationStatus: app.status,
          schedule
        };
      })
    );

    return NextResponse.json(
      successResponse(
        {
          gigDates: (gigDates || []).map(d => ({
            label: d.month,
            range: d.days
          })),
          applicantsAvailability
        },
        'Availability retrieved successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/gigs/[id]/availability error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
