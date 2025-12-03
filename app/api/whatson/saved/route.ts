import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/whatson/saved
 * Get user's saved/bookmarked What's On events
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);

    if (!user) {
      return NextResponse.json(
        errorResponse('Authentication required'),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const supabase = createServerClient();

    // Fetch saved events
    const from = (page - 1) * limit;
    const { data: savedEvents, error, count } = await supabase
      .from('whatson_saves')
      .select(`
        id,
        created_at,
        event:event_id (
          id,
          title,
          slug,
          description,
          location,
          is_online,
          is_paid,
          price_amount,
          price_currency,
          thumbnail_url,
          hero_image_url,
          status,
          created_at,
          updated_at,
          created_by,
          schedule:whatson_schedule(
            event_date,
            start_time,
            end_time,
            timezone
          ),
          tags:whatson_tags(tag_name),
          rsvps:whatson_rsvps(count)
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) {
      return NextResponse.json(
        errorResponse('Failed to fetch saved events', error.message),
        { status: 500 }
      );
    }

    // Fetch user profiles for event creators
    let userProfiles: Record<string, any> = {};
    let googleAvatars: Record<string, string> = {};
    
    if (savedEvents && savedEvents.length > 0) {
      const userIds = [...new Set(savedEvents.map(se => se.event?.created_by).filter(Boolean))];
      
      if (userIds.length > 0) {
        // Fetch user profiles
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id, alias_first_name, alias_surname, profile_photo_url')
          .in('user_id', userIds);
        
        if (profiles) {
          userProfiles = profiles.reduce((acc, profile) => {
            acc[profile.user_id] = profile;
            return acc;
          }, {} as Record<string, any>);
        }

        // Fetch Google auth avatars as fallback
        const { data: authData } = await supabase.auth.admin.listUsers();
        if (authData?.users) {
          authData.users.forEach(authUser => {
            if (userIds.includes(authUser.id) && (authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture)) {
              googleAvatars[authUser.id] = authUser.user_metadata.avatar_url || authUser.user_metadata.picture;
            }
          });
        }
      }
    }

    // Format response
    const formattedEvents = savedEvents
      ?.filter(se => se.event) // Filter out any null events
      .map(savedEvent => {
        const firstSchedule = savedEvent.event.schedule?.[0];
        return {
          id: savedEvent.event.id,
          title: savedEvent.event.title,
          slug: savedEvent.event.slug,
          description: savedEvent.event.description,
          location: savedEvent.event.location,
          is_online: savedEvent.event.is_online,
          is_paid: savedEvent.event.is_paid,
          price_amount: savedEvent.event.price_amount,
          price_currency: savedEvent.event.price_currency,
          thumbnail_url: savedEvent.event.thumbnail_url,
          hero_image_url: savedEvent.event.hero_image_url,
          status: savedEvent.event.status,
          schedule: savedEvent.event.schedule || [],
          tags: savedEvent.event.tags?.map((t: any) => t.tag_name) || [],
          rsvp_count: savedEvent.event.rsvps?.[0]?.count || 0,
          created_at: savedEvent.event.created_at,
          updated_at: savedEvent.event.updated_at,
          saved_at: savedEvent.created_at,
          creator: {
            id: savedEvent.event.created_by,
            name: `${userProfiles[savedEvent.event.created_by]?.alias_first_name || ''} ${userProfiles[savedEvent.event.created_by]?.alias_surname || ''}`.trim(),
            avatar: userProfiles[savedEvent.event.created_by]?.profile_photo_url || googleAvatars[savedEvent.event.created_by] || '',
          },
          user_has_saved: true, // Always true for saved events
        };
      }) || [];

    return NextResponse.json(
      successResponse(
        {
          events: formattedEvents,
          pagination: {
            page,
            limit,
            total: count || 0,
            hasMore: (count || 0) > from + limit,
          },
        },
        'Saved events retrieved'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
