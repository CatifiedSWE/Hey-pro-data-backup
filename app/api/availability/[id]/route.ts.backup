import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * PATCH /api/availability/[id]
 * Update availability status
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

    const supabase = createServerClient();
    const body = await request.json();
    const availabilityId = params.id;
    const { status } = body;

    // Validate status
    const validStatuses = ['available', 'hold', 'na'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        errorResponse('Status must be one of: available, hold, na'),
        { status: 400 }
      );
    }

    // Update availability
    const { data: availability, error } = await supabase
      .from('crew_availability')
      .update({ status })
      .eq('id', availabilityId)
      .eq('user_id', user.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Availability update error:', error);
      return NextResponse.json(
        errorResponse('Failed to update availability', error.message),
        { status: 500 }
      );
    }

    if (!availability) {
      return NextResponse.json(
        errorResponse('Availability not found or unauthorized'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse(availability, 'Availability updated successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in PATCH /api/availability/[id]:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
