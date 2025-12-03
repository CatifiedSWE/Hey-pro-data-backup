import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * PATCH /api/notifications/[id]/read
 * Mark notification as read
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
    const notificationId = params.id;

    // Update notification as read
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', user.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating notification:', error);
      return NextResponse.json(
        errorResponse('Failed to mark notification as read', error.message),
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        errorResponse('Notification not found or unauthorized'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse(
        {
          id: data.id,
          isRead: data.is_read,
          updatedAt: data.updated_at
        },
        'Notification marked as read'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in PATCH /api/notifications/[id]/read:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
