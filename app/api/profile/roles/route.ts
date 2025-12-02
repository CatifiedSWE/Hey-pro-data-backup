import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { calculateAndUpdateProfileCompletion } from '@/lib/profile-completion';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/profile/roles
 * Get user's professional roles
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

    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Roles fetch error:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch roles', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(roles || [], 'Roles retrieved successfully'),
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
 * POST /api/profile/roles
 * Add a new role
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
    const { role_name, sort_order } = body;

    // Validate required fields
    if (!role_name) {
      return NextResponse.json(
        errorResponse('Role name is required'),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        role_name,
        sort_order: sort_order || 0
      })
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          errorResponse('This role already exists for the user'),
          { status: 409 }
        );
      }
      console.error('Role creation error:', error);
      return NextResponse.json(
        errorResponse('Failed to add role', error.message),
        { status: 500 }
      );
    }

    // Recalculate profile completion percentage
    await calculateAndUpdateProfileCompletion(user.id);

    return NextResponse.json(
      successResponse(data, 'Role added successfully'),
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
 * DELETE /api/profile/roles
 * Delete a role
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
        errorResponse('Role ID is required'),
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Role deletion error:', error);
      return NextResponse.json(
        errorResponse('Failed to delete role', error.message),
        { status: 500 }
      );
    }

    // Recalculate profile completion percentage
    await calculateAndUpdateProfileCompletion(user.id);

    return NextResponse.json(
      successResponse(null, 'Role deleted successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
