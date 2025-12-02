import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { calculateAndUpdateProfileCompletion } from '@/lib/profile-completion';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/profile/links
 * Get user's social media and portfolio links
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

    const { data: links, error } = await supabase
      .from('user_links')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Links fetch error:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch links', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(links || [], 'Links retrieved successfully'),
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
 * POST /api/profile/links
 * Add a new link
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
    const { label, url, sort_order } = body;

    // Validate required fields
    if (!label || !url) {
      return NextResponse.json(
        errorResponse('Label and URL are required'),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('user_links')
      .insert({
        user_id: user.id,
        label,
        url,
        sort_order: sort_order || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Link creation error:', error);
      return NextResponse.json(
        errorResponse('Failed to add link', error.message),
        { status: 500 }
      );
    }

    // Recalculate profile completion percentage
    await calculateAndUpdateProfileCompletion(user.id);

    return NextResponse.json(
      successResponse(data, 'Link added successfully'),
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
 * PATCH /api/profile/links
 * Update a link
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
    const { id, label, url, sort_order } = body;

    if (!id) {
      return NextResponse.json(
        errorResponse('Link ID is required'),
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (label !== undefined) updateData.label = label;
    if (url !== undefined) updateData.url = url;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    const { data, error } = await supabase
      .from('user_links')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Link update error:', error);
      return NextResponse.json(
        errorResponse('Failed to update link', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(data, 'Link updated successfully'),
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
 * DELETE /api/profile/links
 * Delete a link
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
        errorResponse('Link ID is required'),
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('user_links')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Link deletion error:', error);
      return NextResponse.json(
        errorResponse('Failed to delete link', error.message),
        { status: 500 }
      );
    }

    // Recalculate profile completion percentage
    await calculateAndUpdateProfileCompletion(user.id);

    return NextResponse.json(
      successResponse(null, 'Link deleted successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
