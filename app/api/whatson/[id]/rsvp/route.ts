import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * POST /api/whatson/[id]/rsvp
 * Create an RSVP for an event
 */
export async function POST(
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

    const body = await request.json();
    const supabase = createServerClient();
    const { id: eventId } = await params;

    // Fetch event details
    const { data: event, error: eventError } = await supabase
      .from('whatson_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        errorResponse('Event not found'),
        { status: 404 }
      );
    }

    // Validate event is published
    if (event.status !== 'published') {
      return NextResponse.json(
        errorResponse('Cannot RSVP to non-published events'),
        { status: 400 }
      );
    }

    // Check user is not event creator
    if (event.created_by === user.id) {
      return NextResponse.json(
        errorResponse('Cannot RSVP to your own event'),
        { status: 400 }
      );
    }

    // Check RSVP deadline
    if (event.rsvp_deadline && new Date(event.rsvp_deadline) < new Date()) {
      return NextResponse.json(
        errorResponse('RSVP deadline has passed'),
        { status: 400 }
      );
    }

    // Check for existing RSVP
    const { data: existingRsvp } = await supabase
      .from('whatson_rsvps')
      .select('id, status')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingRsvp && existingRsvp.status === 'confirmed') {
      return NextResponse.json(
        errorResponse('You have already RSVP\'d to this event'),
        { status: 400 }
      );
    }

    // Validate number_of_spots
    const numberOfSpots = body.number_of_spots || 1;
    if (numberOfSpots < 1) {
      return NextResponse.json(
        errorResponse('Number of spots must be at least 1'),
        { status: 400 }
      );
    }

    if (numberOfSpots > event.max_spots_per_person) {
      return NextResponse.json(
        errorResponse(`Cannot book more than ${event.max_spots_per_person} spots per person`),
        { status: 400 }
      );
    }

    // Check capacity if not unlimited
    if (!event.is_unlimited_spots) {
      const { data: rsvps } = await supabase
        .from('whatson_rsvps')
        .select('number_of_spots')
        .eq('event_id', eventId)
        .eq('status', 'confirmed');

      const spotsBooked = rsvps?.reduce((sum, rsvp) => sum + rsvp.number_of_spots, 0) || 0;
      const availableSpots = (event.total_spots || 0) - spotsBooked;

      if (numberOfSpots > availableSpots) {
        return NextResponse.json(
          errorResponse(`Only ${availableSpots} spots available`),
          { status: 400 }
        );
      }
    }

    // Validate schedule_ids
    if (!body.schedule_ids || body.schedule_ids.length === 0) {
      return NextResponse.json(
        errorResponse('At least one date must be selected'),
        { status: 400 }
      );
    }

    // Verify schedule_ids belong to this event
    const { data: schedules, error: scheduleError } = await supabase
      .from('whatson_schedule')
      .select('id')
      .eq('event_id', eventId)
      .in('id', body.schedule_ids);

    if (scheduleError || !schedules || schedules.length !== body.schedule_ids.length) {
      return NextResponse.json(
        errorResponse('Invalid schedule IDs'),
        { status: 400 }
      );
    }

    // Generate ticket number and reference number using database functions
    const { data: ticketData, error: ticketError } = await supabase
      .rpc('generate_ticket_number');

    const { data: referenceData, error: referenceError } = await supabase
      .rpc('generate_reference_number');

    if (ticketError || referenceError) {
      return NextResponse.json(
        errorResponse('Failed to generate ticket/reference numbers'),
        { status: 500 }
      );
    }

    const ticketNumber = ticketData;
    const referenceNumber = referenceData;

    // Determine payment status
    const paymentStatus = event.is_paid ? 'unpaid' : 'n/a';

    // Insert RSVP
    const { data: rsvp, error: rsvpError } = await supabase
      .from('whatson_rsvps')
      .insert({
        event_id: eventId,
        user_id: user.id,
        ticket_number: ticketNumber,
        reference_number: referenceNumber,
        number_of_spots: numberOfSpots,
        payment_status: paymentStatus,
        status: 'confirmed'
      })
      .select()
      .single();

    if (rsvpError) {
      return NextResponse.json(
        errorResponse('Failed to create RSVP', rsvpError.message),
        { status: 500 }
      );
    }

    // Insert RSVP dates
    const rsvpDatesData = body.schedule_ids.map((scheduleId: string) => ({
      rsvp_id: rsvp.id,
      schedule_id: scheduleId
    }));

    const { error: datesError } = await supabase
      .from('whatson_rsvp_dates')
      .insert(rsvpDatesData);

    if (datesError) {
      // Rollback RSVP
      await supabase.from('whatson_rsvps').delete().eq('id', rsvp.id);
      return NextResponse.json(
        errorResponse('Failed to save selected dates', datesError.message),
        { status: 500 }
      );
    }

    // Fetch selected dates details
    const { data: selectedDates } = await supabase
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

    return NextResponse.json(
      successResponse(
        {
          ...rsvp,
          selected_dates: selectedDates || []
        },
        'RSVP created successfully'
      ),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/whatson/[id]/rsvp error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/whatson/[id]/rsvp
 * Cancel an RSVP (soft delete)
 */
export async function DELETE(
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

    // Find user's RSVP
    const { data: rsvp, error: fetchError } = await supabase
      .from('whatson_rsvps')
      .select('id, status')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError || !rsvp) {
      return NextResponse.json(
        errorResponse('RSVP not found'),
        { status: 404 }
      );
    }

    if (rsvp.status === 'cancelled') {
      return NextResponse.json(
        errorResponse('RSVP already cancelled'),
        { status: 400 }
      );
    }

    // Soft delete: Update status to 'cancelled'
    const { error: updateError } = await supabase
      .from('whatson_rsvps')
      .update({ status: 'cancelled' })
      .eq('id', rsvp.id);

    if (updateError) {
      return NextResponse.json(
        errorResponse('Failed to cancel RSVP', updateError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(null, 'RSVP cancelled successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE /api/whatson/[id]/rsvp error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
