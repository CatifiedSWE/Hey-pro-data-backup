import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';
import { calculateAndUpdateProfileCompletion } from '@/lib/profile-completion';

export const dynamic = 'force-dynamic';

/**
 * POST /api/profile/recalculate-completion
 * Manually trigger profile completion recalculation
 * 
 * Useful for:
 * - Initial migration
 * - Manual refresh by user
 * - Admin operations
 * - Debugging/testing
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

    // Calculate and update profile completion
    const { completionPercentage, isComplete } = await calculateAndUpdateProfileCompletion(user.id);

    return NextResponse.json(
      successResponse(
        { 
          completionPercentage, 
          isComplete,
          userId: user.id 
        },
        'Profile completion recalculated successfully'
      ),
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Profile completion recalculation error:', error);
    return NextResponse.json(
      errorResponse('Failed to recalculate profile completion', error.message),
      { status: 500 }
    );
  }
}
