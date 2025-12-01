import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * PATCH /api/skills/batch
 * Update multiple skills in a single batch operation
 * 
 * This endpoint reduces multiple individual skill updates into 1 call:
 * OLD: 10 individual PATCH calls + 1 GET refetch = 11 API calls
 * NEW: 1 batch PATCH call = 1 API call
 * 
 * Expected reduction: 11 calls → 1 call (91% reduction for bulk skill updates)
 * 
 * Request body format:
 * {
 *   "skills": [
 *     { "id": "skill-id-1", "skill_name": "Updated Name", "description": "...", ... },
 *     { "id": "skill-id-2", "skill_name": "Another Skill", "description": "...", ... }
 *   ]
 * }
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
    const { skills } = body;

    // Validate request body
    if (!Array.isArray(skills)) {
      return NextResponse.json(
        errorResponse('Request body must contain a "skills" array'),
        { status: 400 }
      );
    }

    if (skills.length === 0) {
      return NextResponse.json(
        errorResponse('At least one skill is required'),
        { status: 400 }
      );
    }

    // Validate all skills have an ID
    const invalidSkills = skills.filter(skill => !skill.id);
    if (invalidSkills.length > 0) {
      return NextResponse.json(
        errorResponse('All skills must have an "id" field'),
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Perform batch updates using Promise.all for parallel execution
    const updatePromises = skills.map(skill => {
      const { id, ...updateData } = skill;
      
      return supabase
        .from('applicant_skills')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
    });

    const results = await Promise.all(updatePromises);

    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Batch skill update errors:', errors);
      return NextResponse.json(
        errorResponse(
          `Failed to update ${errors.length} skill(s)`,
          errors.map(e => e.error?.message)
        ),
        { status: 500 }
      );
    }

    // Extract updated skills
    const updatedSkills = results.map(result => result.data).filter(Boolean);

    return NextResponse.json(
      successResponse(
        { skills: updatedSkills },
        `Successfully updated ${updatedSkills.length} skill(s)`
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in PATCH /api/skills/batch:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * POST /api/skills/batch
 * Create multiple skills in a single batch operation
 * 
 * Request body format:
 * {
 *   "skills": [
 *     { "skill_name": "Skill 1", "description": "...", ... },
 *     { "skill_name": "Skill 2", "description": "...", ... }
 *   ]
 * }
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
    const { skills } = body;

    // Validate request body
    if (!Array.isArray(skills)) {
      return NextResponse.json(
        errorResponse('Request body must contain a "skills" array'),
        { status: 400 }
      );
    }

    if (skills.length === 0) {
      return NextResponse.json(
        errorResponse('At least one skill is required'),
        { status: 400 }
      );
    }

    // Validate all skills have required fields
    const invalidSkills = skills.filter(skill => !skill.skill_name || typeof skill.skill_name !== 'string');
    if (invalidSkills.length > 0) {
      return NextResponse.json(
        errorResponse('All skills must have a valid "skill_name" field'),
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Prepare skills for batch insert
    const skillsToInsert = skills.map(skill => ({
      user_id: user.id,
      skill_name: skill.skill_name.trim(),
      description: skill.description || null,
      department: skill.department || null,
      role: skill.role || null,
      proficiency_level: skill.proficiency_level || null,
      experience_level: skill.experience_level || null,
      day_rate: skill.day_rate || null,
      day_rate_currency: skill.day_rate_currency || null,
      is_public: skill.is_public !== undefined ? skill.is_public : true,
      sort_order: skill.sort_order || 0
    }));

    // Batch insert
    const { data: createdSkills, error } = await supabase
      .from('applicant_skills')
      .insert(skillsToInsert)
      .select();

    if (error) {
      console.error('Batch skill creation error:', error);
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          errorResponse('One or more skills already exist in your profile'),
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        errorResponse('Failed to create skills', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(
        { skills: createdSkills },
        `Successfully created ${createdSkills?.length || 0} skill(s)`
      ),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/skills/batch:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/skills/batch
 * Delete multiple skills in a single batch operation
 * 
 * Query parameter format: ?ids=id1,id2,id3
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
    const ids = searchParams.get('ids');

    if (!ids) {
      return NextResponse.json(
        errorResponse('Skill IDs parameter is required (e.g., ?ids=id1,id2,id3)'),
        { status: 400 }
      );
    }

    const idArray = ids.split(',').filter(Boolean);
    
    if (idArray.length === 0) {
      return NextResponse.json(
        errorResponse('At least one skill ID is required'),
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Batch delete
    const { error } = await supabase
      .from('applicant_skills')
      .delete()
      .in('id', idArray)
      .eq('user_id', user.id);

    if (error) {
      console.error('Batch skill deletion error:', error);
      return NextResponse.json(
        errorResponse('Failed to delete skills', error.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(null, `Successfully deleted ${idArray.length} skill(s)`),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in DELETE /api/skills/batch:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
