import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/whatson/[id]/rsvp/list
 * Get event RSVPs (creator only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const supabase = createServerClient();
    const eventId = params.id;
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // Filters
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('payment_status');

    // Verify event exists and user is creator
    const { data: event, error: eventError } = await supabase
      .from('whatson_events')
      .select('id, created_by, title')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        errorResponse('Event not found'),
        { status: 404 }
      );
    }

    if (event.created_by !== user.id) {
      return NextResponse.json(
        errorResponse('Only event creator can view RSVPs'),
        { status: 403 }
      );
    }

    // Build query
    let query = supabase
      .from('whatson_rsvps')
      .select('*', { count: 'exact' })
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus);
    }

    const { data: rsvps, error: rsvpsError, count } = await query;

    if (rsvpsError) {
      return NextResponse.json(
        errorResponse('Failed to fetch RSVPs', rsvpsError.message),
        { status: 500 }
      );
    }

    // Enrich RSVPs with user profiles and selected dates
    const enrichedRsvps = await Promise.all(
      (rsvps || []).map(async (rsvp) => {
        // Fetch attendee profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_id, first_name, surname, alias_first_name, alias_surname, email, profile_photo_url')
          .eq('user_id', rsvp.user_id)
          .maybeSingle();

        // Construct full name from available fields
        const constructFullName = (profile: any) => {
          if (!profile) return 'Unknown';
          
          // Prefer alias name if available, otherwise use first name
          const firstName = profile.alias_first_name || profile.first_name || '';
          const surname = profile.alias_surname || profile.surname || '';
          
          const fullName = `${firstName} ${surname}`.trim();
          return fullName || 'Unknown';
        };

        // Fetch selected dates
        const { data: rsvpDates } = await supabase
          .from('whatson_rsvp_dates')
          .select(`
            schedule_id,
            whatson_schedule (
              id,
              event_date,
              start_time,
              end_time,
              timezone
            )
          `)
          .eq('rsvp_id', rsvp.id);

        return {
          ...rsvp,
          user_profile: profile ? {
            name: constructFullName(profile),
            profile_photo_url: profile.profile_photo_url
          } : null,
          selected_dates: rsvpDates || []
        };
      })
    );

    // Calculate summary statistics
    const summary = {
      total_rsvps: count || 0,
      confirmed: enrichedRsvps.filter(r => r.status === 'confirmed').length,
      cancelled: enrichedRsvps.filter(r => r.status === 'cancelled').length,
      waitlist: enrichedRsvps.filter(r => r.status === 'waitlist').length,
      paid: enrichedRsvps.filter(r => r.payment_status === 'paid').length,
      unpaid: enrichedRsvps.filter(r => r.payment_status === 'unpaid').length,
      total_spots_booked: enrichedRsvps
        .filter(r => r.status === 'confirmed')
        .reduce((sum, r) => sum + r.number_of_spots, 0)
    };

    return NextResponse.json(
      successResponse(
        {
          rsvps: enrichedRsvps,
          summary,
          pagination: {
            page,
            limit,
            total: count || 0,
            total_pages: Math.ceil((count || 0) / limit)
          }
        },
        'Event RSVPs retrieved successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/whatson/[id]/rsvp/list error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
