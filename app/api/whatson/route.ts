import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/whatson
 * Get all What's On events (public feed with pagination and filters)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    // Filters
    const status = searchParams.get('status') || 'published';
    const keyword = searchParams.get('keyword');
    const isPaid = searchParams.get('isPaid');
    const isOnline = searchParams.get('isOnline');
    const location = searchParams.get('location');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const tags = searchParams.get('tags');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    let query = supabase
      .from('whatson_events')
      .select(`
        id,
        created_by,
        title,
        slug,
        location,
        is_online,
        is_paid,
        price_amount,
        price_currency,
        rsvp_deadline,
        max_spots_per_person,
        total_spots,
        is_unlimited_spots,
        description,
        terms_conditions,
        thumbnail_url,
        hero_image_url,
        status,
        created_at,
        updated_at
      `, { count: 'exact' })
      .eq('status', status)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);
    }
    if (isPaid !== null && isPaid !== undefined) {
      query = query.eq('is_paid', isPaid === 'true');
    }
    if (isOnline !== null && isOnline !== undefined) {
      query = query.eq('is_online', isOnline === 'true');
    }
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    const { data: events, error: eventsError, count } = await query;

    if (eventsError) {
      return NextResponse.json(
        errorResponse('Failed to fetch events', eventsError.message),
        { status: 500 }
      );
    }

    // Enrich events with schedule, tags, creator info, and RSVP count
    const enrichedEvents = await Promise.all(
      (events || []).map(async (event) => {
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

        // Fetch creator info
        const { data: creator } = await supabase
          .from('user_profiles')
          .select('name, profile_photo_url')
          .eq('id', event.created_by)
          .maybeSingle();

        // Fetch Google photo from auth.users if profile photo is not set
        let googlePhotoUrl = null;
        if (creator && (!creator.profile_photo_url || creator.profile_photo_url.trim() === '')) {
          try {
            const { data: authUser } = await supabase.auth.admin.getUserById(event.created_by);
            if (authUser?.user?.user_metadata?.avatar_url) {
              googlePhotoUrl = authUser.user.user_metadata.avatar_url;
            }
          } catch (error) {
            // Silently fail if auth fetch fails
            console.error('Failed to fetch Google photo for user:', event.created_by);
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

        return {
          ...event,
          schedule: schedule || [],
          tags: eventTags?.map(t => t.tag_name) || [],
          creator: creatorWithFallback,
          rsvp_count: rsvpCount || 0,
          spots_booked: spotsBooked,
          is_fully_booked: !event.is_unlimited_spots && spotsBooked >= (event.total_spots || 0)
        };
      })
    );

    // Filter by date range if provided
    let filteredEvents = enrichedEvents;
    if (dateFrom || dateTo) {
      filteredEvents = enrichedEvents.filter(event => {
        const eventDates = event.schedule.map((s: any) => new Date(s.event_date));
        if (eventDates.length === 0) return false;
        
        const minDate = new Date(Math.min(...eventDates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...eventDates.map(d => d.getTime())));
        
        if (dateFrom && maxDate < new Date(dateFrom)) return false;
        if (dateTo && minDate > new Date(dateTo)) return false;
        return true;
      });
    }

    // Filter by tags if provided
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim());
      filteredEvents = filteredEvents.filter(event => 
        tagArray.some(tag => event.tags.includes(tag))
      );
    }

    return NextResponse.json(
      successResponse(
        {
          events: filteredEvents,
          pagination: {
            page,
            limit,
            total: count || 0,
            total_pages: Math.ceil((count || 0) / limit)
          }
        },
        'Events retrieved successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/whatson error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * POST /api/whatson
 * Create a new event
 */
export async function POST(request: NextRequest) {
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

    // Validate required fields
    if (!body.title || body.title.length < 3 || body.title.length > 200) {
      return NextResponse.json(
        errorResponse('Title must be between 3 and 200 characters'),
        { status: 400 }
      );
    }

    if (!body.description || body.description.length > 10000) {
      return NextResponse.json(
        errorResponse('Description is required and must be less than 10000 characters'),
        { status: 400 }
      );
    }

    if (!body.is_online && (!body.location || body.location.trim().length === 0)) {
      return NextResponse.json(
        errorResponse('Location is required for in-person events'),
        { status: 400 }
      );
    }

    if (!body.is_unlimited_spots && (!body.total_spots || body.total_spots < 1)) {
      return NextResponse.json(
        errorResponse('Total spots must be at least 1 if not unlimited'),
        { status: 400 }
      );
    }

    if (!body.schedule || body.schedule.length === 0) {
      return NextResponse.json(
        errorResponse('At least one schedule slot is required'),
        { status: 400 }
      );
    }

    // Generate unique slug
    const baseSlug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const { data: existing } = await supabase
        .from('whatson_events')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Insert event
    const { data: event, error: eventError } = await supabase
      .from('whatson_events')
      .insert({
        created_by: user.id,
        title: body.title,
        slug,
        location: body.location || null,
        is_online: body.is_online || false,
        is_paid: body.is_paid || false,
        price_amount: body.price_amount || 0,
        price_currency: body.price_currency || 'AED',
        rsvp_deadline: body.rsvp_deadline || null,
        max_spots_per_person: body.max_spots_per_person || 1,
        total_spots: body.is_unlimited_spots ? null : body.total_spots,
        is_unlimited_spots: body.is_unlimited_spots || false,
        description: body.description,
        terms_conditions: body.terms_conditions || null,
        thumbnail_url: body.thumbnail_url || null,
        hero_image_url: body.hero_image_url || null,
        status: body.status || 'draft'
      })
      .select()
      .single();

    if (eventError) {
      return NextResponse.json(
        errorResponse('Failed to create event', eventError.message),
        { status: 500 }
      );
    }

    // Insert schedule slots
    if (body.schedule && body.schedule.length > 0) {
      const scheduleData = body.schedule.map((slot: any, index: number) => ({
        event_id: event.id,
        event_date: slot.event_date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        timezone: slot.timezone || 'GST',
        sort_order: index
      }));

      const { error: scheduleError } = await supabase
        .from('whatson_schedule')
        .insert(scheduleData);

      if (scheduleError) {
        // Rollback event creation
        await supabase.from('whatson_events').delete().eq('id', event.id);
        return NextResponse.json(
          errorResponse('Failed to create schedule', scheduleError.message),
          { status: 500 }
        );
      }
    }

    // Insert tags
    if (body.tags && body.tags.length > 0) {
      const tagsData = body.tags.map((tag: string) => ({
        event_id: event.id,
        tag_name: tag.trim()
      }));

      const { error: tagsError } = await supabase
        .from('whatson_tags')
        .insert(tagsData);

      if (tagsError) {
        // Continue even if tags fail - not critical
        console.error('Failed to insert tags:', tagsError);
      }
    }

    // Fetch complete event with relations
    const { data: schedule } = await supabase
      .from('whatson_schedule')
      .select('*')
      .eq('event_id', event.id)
      .order('sort_order', { ascending: true });

    const { data: eventTags } = await supabase
      .from('whatson_tags')
      .select('tag_name')
      .eq('event_id', event.id);

    return NextResponse.json(
      successResponse(
        {
          ...event,
          schedule: schedule || [],
          tags: eventTags?.map(t => t.tag_name) || []
        },
        'Event created successfully'
      ),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/whatson error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
