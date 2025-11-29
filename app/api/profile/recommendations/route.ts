import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/profile/recommendations
 * Get recommended profiles ("People also viewed")
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

    // Fetch recommendations - first get the list
    const { data: recommendationsList, error: recsError } = await supabase
      .from('user_recommendations')
      .select('id, recommended_user_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (recsError) {
      console.error('Recommendations fetch error:', recsError);
      return NextResponse.json(
        errorResponse('Failed to fetch recommendations', recsError.message),
        { status: 500 }
      );
    }

    if (!recommendationsList || recommendationsList.length === 0) {
      return NextResponse.json(
        successResponse([], 'No recommendations found'),
        { status: 200 }
      );
    }

    // Then fetch the profile details for recommended users
    const recommendedUserIds = recommendationsList.map(rec => rec.recommended_user_id);
    
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, first_name, surname, profile_photo_url')
      .in('user_id', recommendedUserIds);

    if (profilesError) {
      console.error('Profiles fetch error:', profilesError);
      return NextResponse.json(
        errorResponse('Failed to fetch profile details', profilesError.message),
        { status: 500 }
      );
    }

    // Combine the data
    const recommendations = recommendationsList.map(rec => {
      const profile = profiles?.find(p => p.user_id === rec.recommended_user_id);
      return {
        id: rec.id,
        recommended_user_id: rec.recommended_user_id,
        created_at: rec.created_at,
        user_profiles: profile || null
      };
    });

    return NextResponse.json(
      successResponse(recommendations, 'Recommendations retrieved successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * POST /api/profile/recommendations
 * Add a recommendation
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
    const { recommended_user_id } = body;

    // Validate required fields
    if (!recommended_user_id) {
      return NextResponse.json(
        errorResponse('Recommended user ID is required'),
        { status: 400 }
      );
    }

    // Validate not recommending self
    if (recommended_user_id === user.id) {
      return NextResponse.json(
        errorResponse('Cannot recommend yourself'),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('user_recommendations')
      .insert({
        user_id: user.id,
        recommended_user_id
      })
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          errorResponse('This recommendation already exists'),
          { status: 409 }
        );
      }
      // Check for check constraint violation (user_id = recommended_user_id)
      if (error.code === '23514') {
        return NextResponse.json(
          errorResponse('Cannot recommend yourself'),
          { status: 400 }
        );
      }
      console.error('Recommendation creation error:', error);
      return NextResponse.json(
        errorResponse('Failed to add recommendation', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(data, 'Recommendation added successfully'),
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile/recommendations
 * Delete a recommendation
 */
export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        errorResponse('Recommendation ID is required'),
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('user_recommendations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Recommendation deletion error:', error);
      return NextResponse.json(
        errorResponse('Failed to delete recommendation', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(null, 'Recommendation deleted successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

