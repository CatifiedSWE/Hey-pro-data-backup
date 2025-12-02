import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { calculateAndUpdateProfileCompletion } from '@/lib/profile-completion';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/profile/languages
 * Get user's languages with speaking and writing proficiency
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

    const { data: languages, error } = await supabase
      .from('user_languages')
      .select('*')
      .eq('user_id', user.id)
      .order('language_name', { ascending: true });

    if (error) {
      console.error('Languages fetch error:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch languages', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(languages || [], 'Languages retrieved successfully'),
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
 * POST /api/profile/languages
 * Add a new language
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
    const { language_name, can_speak, can_write } = body;

    // Validate required fields
    if (!language_name) {
      return NextResponse.json(
        errorResponse('Language name is required'),
        { status: 400 }
      );
    }

    // Validate that at least one proficiency is true
    if (!can_speak && !can_write) {
      return NextResponse.json(
        errorResponse('At least one of can_speak or can_write must be true'),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('user_languages')
      .insert({
        user_id: user.id,
        language_name,
        can_speak: can_speak || false,
        can_write: can_write || false
      })
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          errorResponse('This language already exists for the user'),
          { status: 409 }
        );
      }
      console.error('Language creation error:', error);
      return NextResponse.json(
        errorResponse('Failed to add language', error.message),
        { status: 500 }
      );
    }

    // Recalculate profile completion percentage
    await calculateAndUpdateProfileCompletion(user.id);

    return NextResponse.json(
      successResponse(data, 'Language added successfully'),
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
 * PATCH /api/profile/languages
 * Update a language
 */
export async function PATCH(request: NextRequest) {
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
    const { id, can_speak, can_write } = body;

    if (!id) {
      return NextResponse.json(
        errorResponse('Language ID is required'),
        { status: 400 }
      );
    }

    // Validate that at least one proficiency is true
    if (can_speak === false && can_write === false) {
      return NextResponse.json(
        errorResponse('At least one of can_speak or can_write must be true'),
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (can_speak !== undefined) updateData.can_speak = can_speak;
    if (can_write !== undefined) updateData.can_write = can_write;

    const { data, error } = await supabase
      .from('user_languages')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Language update error:', error);
      return NextResponse.json(
        errorResponse('Failed to update language', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(data, 'Language updated successfully'),
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
 * DELETE /api/profile/languages
 * Delete a language
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
        errorResponse('Language ID is required'),
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('user_languages')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Language deletion error:', error);
      return NextResponse.json(
        errorResponse('Failed to delete language', error.message),
        { status: 500 }
      );
    }

    // Recalculate profile completion percentage
    await calculateAndUpdateProfileCompletion(user.id);

    return NextResponse.json(
      successResponse(null, 'Language deleted successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
