import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';
import { ensureProfileCompletion } from '@/lib/profile-completion';

/**
 * GET /api/profile/check
 * Check profile completion status
 * OPTIMIZED: Auto-calculates for old users with NULL completion
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

    // OPTIMIZED: Smart check - only calculates if completion is NULL
    // This efficiently handles both old users and new users
    const result = await ensureProfileCompletion(user.id);
    
    if (result.wasCalculated) {
      console.log(`[Profile Check API] Auto-calculated completion for user ${user.id}: ${result.completionPercentage}%`);
    }

    return NextResponse.json(
      successResponse({
        isComplete: result.isComplete,
        completionPercentage: result.completionPercentage,
        wasAutoCalculated: result.wasCalculated // Useful for debugging
      }, 'Profile status retrieved successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Profile check error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
