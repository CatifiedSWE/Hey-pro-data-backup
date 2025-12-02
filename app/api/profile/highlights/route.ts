import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { calculateAndUpdateProfileCompletion } from '@/lib/profile-completion';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/profile/highlights
 * Get user's profile highlights
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

    const { data: highlights, error } = await supabase
      .from('user_highlights')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Highlights fetch error:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch highlights', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(highlights || [], 'Highlights retrieved successfully'),
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
 * POST /api/profile/highlights
 * Add a new highlight
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
    const { title, description, image_url, sort_order } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        errorResponse('Title and description are required'),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('user_highlights')
      .insert({
        user_id: user.id,
        title,
        description,
        image_url,
        sort_order: sort_order || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Highlight creation error:', error);
      return NextResponse.json(
        errorResponse('Failed to add highlight', error.message),
        { status: 500 }
      );
    }

    // Recalculate profile completion percentage
    await calculateAndUpdateProfileCompletion(user.id);

    return NextResponse.json(
      successResponse(data, 'Highlight added successfully'),
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
 * PATCH /api/profile/highlights
 * Update a highlight
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
    const { id, title, description, image_url, sort_order } = body;

    if (!id) {
      return NextResponse.json(
        errorResponse('Highlight ID is required'),
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    const { data, error } = await supabase
      .from('user_highlights')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Highlight update error:', error);
      return NextResponse.json(
        errorResponse('Failed to update highlight', error.message),
        { status: 500 }
      );
    }

    // Recalculate profile completion percentage
    await calculateAndUpdateProfileCompletion(user.id);

    return NextResponse.json(
      successResponse(data, 'Highlight updated successfully'),
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
 * DELETE /api/profile/highlights
 * Delete a highlight
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
        errorResponse('Highlight ID is required'),
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('user_highlights')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Highlight deletion error:', error);
      return NextResponse.json(
        errorResponse('Failed to delete highlight', error.message),
        { status: 500 }
      );
    }

    // Recalculate profile completion percentage
    await calculateAndUpdateProfileCompletion(user.id);

    return NextResponse.json(
      successResponse(null, 'Highlight deleted successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
