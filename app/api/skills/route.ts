import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/skills
 * Get user's skills
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

    const supabase = createServerClient();

    // Fetch skills ordered by sort_order
    const { data: skills, error } = await supabase
      .from('applicant_skills')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Skills fetch error:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch skills', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(skills || [], 'Skills retrieved successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/skills:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * POST /api/skills
 * Add a new skill
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
    const { skill_name, description, sort_order } = body;

    // Validate required fields
    if (!skill_name || typeof skill_name !== 'string' || skill_name.trim().length === 0) {
      return NextResponse.json(
        errorResponse('Skill name is required'),
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Insert skill
    const { data: skill, error } = await supabase
      .from('applicant_skills')
      .insert({
        user_id: user.id,
        skill_name: skill_name.trim(),
        description: description || null,
        sort_order: sort_order || 0
      })
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          errorResponse('This skill already exists in your profile'),
          { status: 409 }
        );
      }
      console.error('Skill creation error:', error);
      return NextResponse.json(
        errorResponse('Failed to add skill', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(skill, 'Skill added successfully'),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/skills:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
