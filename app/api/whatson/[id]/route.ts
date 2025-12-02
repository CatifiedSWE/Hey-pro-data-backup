import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/whatson/[id]
 * Get event details by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const eventIdentifier = params.id;
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);

    // Try to fetch event by ID first, then by slug if not found
    // Check if it looks like a UUID (contains dashes in UUID format)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventIdentifier);
    
    let event = null;
    let eventError = null;

    if (isUUID) {
      // Try by ID first
      const result = await supabase
        .from('whatson_events')
        .select('*')
        .eq('id', eventIdentifier)
        .maybeSingle();
      event = result.data;
      eventError = result.error;
    }
    
    // If not found by ID or not a UUID, try by slug
    if (!event) {
      const result = await supabase
        .from('whatson_events')
        .select('*')
        .eq('slug', eventIdentifier)
        .maybeSingle();
      event = result.data;
      eventError = result.error;
    }

    if (eventError || !event) {
      return NextResponse.json(
        errorResponse('Event not found'),
        { status: 404 }
      );
    }

    // Check access: published events are public, draft/cancelled only for creator
    if (event.status !== 'published' && (!user || user.id !== event.created_by)) {
      return NextResponse.json(
        errorResponse('Access denied'),
        { status: 403 }
      );
    }

    // Fetch schedule
    const { data: schedule } = await supabase
      .from('whatson_schedule')
      .select('*')
      .eq('event_id', event.id)
      .order('sort_order', { ascending: true });

    // Fetch tags
    const { data: eventTags } = await supabase
      .from('whatson_tags')
      .select('tag_name')
      .eq('event_id', event.id);

    // Fetch creator info from user_profiles
    const { data: creator } = await supabase
      .from('user_profiles')
      .select('id, name, profile_photo_url')
      .eq('id', event.created_by)
      .maybeSingle();

    // Fetch Google photo from auth.users if profile photo is not set
    let googlePhotoUrl = null;
    if (creator && (!creator.profile_photo_url || creator.profile_photo_url.trim() === '')) {
      const { data: authUser } = await supabase.auth.admin.getUserById(event.created_by);
      if (authUser?.user?.user_metadata?.avatar_url) {
        googlePhotoUrl = authUser.user.user_metadata.avatar_url;
      }
    }

    // Enhance creator object with Google photo if available
    const creatorWithFallback = creator ? {
      ...creator,
      profile_photo_url: creator.profile_photo_url || googlePhotoUrl || null
    } : null;

    // Count RSVPs
    const { count: rsvpCount } = await supabase
      .from('whatson_rsvps')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', event.id)
      .eq('status', 'confirmed');

    // Calculate total spots booked
    const { data: rsvps } = await supabase
      .from('whatson_rsvps')
      .select('number_of_spots')
      .eq('event_id', event.id)
      .eq('status', 'confirmed');

    const spotsBooked = rsvps?.reduce((sum, rsvp) => sum + rsvp.number_of_spots, 0) || 0;

    // Check if user has RSVP'd
    let userRsvp = null;
    if (user) {
      const { data: rsvp } = await supabase
        .from('whatson_rsvps')
        .select('*')
        .eq('event_id', event.id)
        .eq('user_id', user.id)
        .maybeSingle();
      userRsvp = rsvp;
    }

    return NextResponse.json(
      successResponse(
        {
          ...event,
          schedule: schedule || [],
          tags: eventTags?.map(t => t.tag_name) || [],
          creator: creatorWithFallback,
          rsvp_count: rsvpCount || 0,
          spots_booked: spotsBooked,
          is_fully_booked: !event.is_unlimited_spots && spotsBooked >= (event.total_spots || 0),
          user_rsvp: userRsvp
        },
        'Event retrieved successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/whatson/[id] error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/whatson/[id]
 * Update event (creator only)
 */
export async function PATCH(
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

    const body = await request.json();
    const supabase = createServerClient();
    const eventId = params.id;

    // Verify user is event creator
    const { data: event, error: fetchError } = await supabase
      .from('whatson_events')
      .select('created_by')
      .eq('id', eventId)
      .single();

    if (fetchError || !event) {
      return NextResponse.json(
        errorResponse('Event not found'),
        { status: 404 }
      );
    }

    if (event.created_by !== user.id) {
      return NextResponse.json(
        errorResponse('Only event creator can update this event'),
        { status: 403 }
      );
    }

    // Validate fields if provided
    if (body.title && (body.title.length < 3 || body.title.length > 200)) {
      return NextResponse.json(
        errorResponse('Title must be between 3 and 200 characters'),
        { status: 400 }
      );
    }

    if (body.description && body.description.length > 10000) {
      return NextResponse.json(
        errorResponse('Description must be less than 10000 characters'),
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {};
    const allowedFields = [
      'title', 'location', 'is_online', 'is_paid', 'price_amount', 'price_currency',
      'rsvp_deadline', 'max_spots_per_person', 'total_spots', 'is_unlimited_spots',
      'description', 'terms_conditions', 'thumbnail_url', 'hero_image_url', 'status'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Update event
    const { data: updatedEvent, error: updateError } = await supabase
      .from('whatson_events')
      .update(updateData)
      .eq('id', eventId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        errorResponse('Failed to update event', updateError.message),
        { status: 500 }
      );
    }

    // Update schedule if provided
    if (body.schedule && Array.isArray(body.schedule)) {
      // Delete existing schedule
      await supabase
        .from('whatson_schedule')
        .delete()
        .eq('event_id', eventId);

      // Insert new schedule
      const scheduleData = body.schedule.map((slot: any, index: number) => ({
        event_id: eventId,
        event_date: slot.event_date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        timezone: slot.timezone || 'GST',
        sort_order: index
      }));

      await supabase
        .from('whatson_schedule')
        .insert(scheduleData);
    }

    // Update tags if provided
    if (body.tags && Array.isArray(body.tags)) {
      // Delete existing tags
      await supabase
        .from('whatson_tags')
        .delete()
        .eq('event_id', eventId);

      // Insert new tags
      if (body.tags.length > 0) {
        const tagsData = body.tags.map((tag: string) => ({
          event_id: eventId,
          tag_name: tag.trim()
        }));

        await supabase
          .from('whatson_tags')
          .insert(tagsData);
      }
    }

    // Fetch complete event with relations
    const { data: schedule } = await supabase
      .from('whatson_schedule')
      .select('*')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: true });

    const { data: eventTags } = await supabase
      .from('whatson_tags')
      .select('tag_name')
      .eq('event_id', eventId);

    return NextResponse.json(
      successResponse(
        {
          ...updatedEvent,
          schedule: schedule || [],
          tags: eventTags?.map(t => t.tag_name) || []
        },
        'Event updated successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('PATCH /api/whatson/[id] error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/whatson/[id]
 * Delete event (creator only)
 */
export async function DELETE(
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

    // Verify user is event creator
    const { data: event, error: fetchError } = await supabase
      .from('whatson_events')
      .select('created_by')
      .eq('id', eventId)
      .single();

    if (fetchError || !event) {
      return NextResponse.json(
        errorResponse('Event not found'),
        { status: 404 }
      );
    }

    if (event.created_by !== user.id) {
      return NextResponse.json(
        errorResponse('Only event creator can delete this event'),
        { status: 403 }
      );
    }

    // Delete event (CASCADE will handle related tables)
    const { error: deleteError } = await supabase
      .from('whatson_events')
      .delete()
      .eq('id', eventId);

    if (deleteError) {
      return NextResponse.json(
        errorResponse('Failed to delete event', deleteError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(null, 'Event deleted successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE /api/whatson/[id] error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
