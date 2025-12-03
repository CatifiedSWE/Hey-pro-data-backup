import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/whatson/[id]/rsvp/export
 * Export event RSVPs as CSV (creator only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id: eventId } = await params;

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
        errorResponse('Only event creator can export RSVPs'),
        { status: 403 }
      );
    }

    // Fetch all RSVPs for the event
    const { data: rsvps, error: rsvpsError } = await supabase
      .from('whatson_rsvps')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

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
          .select('name, email')
          .eq('id', rsvp.user_id)
          .maybeSingle();

        // Fetch selected dates
        const { data: rsvpDates } = await supabase
          .from('whatson_rsvp_dates')
          .select(`
            schedule_id,
            whatson_schedule (
              event_date,
              start_time,
              end_time,
              timezone
            )
          `)
          .eq('rsvp_id', rsvp.id);

        // Format selected dates as string
        const datesString = rsvpDates
          ?.map((rd: any) => {
            const schedule = rd.whatson_schedule;
            if (!schedule) return '';
            return `${schedule.event_date} ${schedule.start_time}-${schedule.end_time} ${schedule.timezone}`;
          })
          .join('; ') || '';

        return {
          name: profile?.name || 'N/A',
          email: profile?.email || 'N/A',
          ticket_number: rsvp.ticket_number,
          reference_number: rsvp.reference_number,
          number_of_spots: rsvp.number_of_spots,
          payment_status: rsvp.payment_status,
          status: rsvp.status,
          selected_dates: datesString,
          rsvp_date: new Date(rsvp.created_at).toISOString().split('T')[0]
        };
      })
    );

    // Generate CSV
    const headers = [
      'Name',
      'Email',
      'Ticket Number',
      'Reference',
      'Spots Booked',
      'Payment Status',
      'Status',
      'Selected Dates',
      'RSVP Date'
    ];

    const csvRows = [];
    csvRows.push(headers.join(','));

    enrichedRsvps.forEach((rsvp) => {
      const row = [
        escapeCsvValue(rsvp.name),
        escapeCsvValue(rsvp.email),
        escapeCsvValue(rsvp.ticket_number),
        escapeCsvValue(rsvp.reference_number),
        rsvp.number_of_spots,
        escapeCsvValue(rsvp.payment_status),
        escapeCsvValue(rsvp.status),
        escapeCsvValue(rsvp.selected_dates),
        rsvp.rsvp_date
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');

    // Generate filename with event title and date
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${sanitizeFilename(event.title)}-rsvps-${timestamp}.csv`;

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('GET /api/whatson/[id]/rsvp/export error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * Helper function to escape CSV values
 */
function escapeCsvValue(value: string | number): string {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  // Escape double quotes and wrap in quotes if contains comma, quote, or newline
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * Helper function to sanitize filename
 */
function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}
