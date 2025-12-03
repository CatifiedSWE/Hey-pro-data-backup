import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/projects
 * Get all public projects (with pagination)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const projectType = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const supabase = createServerClient();
    const offset = (page - 1) * limit;

    // Build base query - only public projects that are not drafts
    let query = supabase
      .from('design_projects')
      .select(`
        *,
        owner:user_id (
          id,
          raw_user_meta_data
        ),
        tags:project_tags(tag_name),
        team:project_team(count)
      `, { count: 'exact' })
      .eq('privacy', 'public')
      .neq('status', 'draft');

    // Apply filters
    if (projectType) {
      query = query.eq('project_type', projectType);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
    const ascending = sortOrder === 'asc';
    query = query.order(sortBy, { ascending });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: projects, error, count } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch projects', error.message),
        { status: 500 }
      );
    }

    // Format response
    const formattedProjects = (projects || []).map((project: any) => ({
      id: project.id,
      title: project.title,
      slug: project.slug,
      description: project.description,
      project_type: project.project_type,
      status: project.status,
      thumbnail_url: project.thumbnail_url,
      hero_image_url: project.hero_image_url,
      location: project.location,
      is_remote: project.is_remote,
      start_date: project.start_date,
      end_date: project.end_date,
      budget_amount: project.budget_amount,
      budget_currency: project.budget_currency,
      tags: project.tags?.map((t: any) => t.tag_name) || [],
      team_count: project.team?.[0]?.count || 0,
      owner: {
        id: project.owner?.id,
        name: project.owner?.raw_user_meta_data?.name || 
              project.owner?.raw_user_meta_data?.full_name || 
              'Unknown',
        avatar: project.owner?.raw_user_meta_data?.avatar_url || 
                project.owner?.raw_user_meta_data?.profile_photo_url || 
                '/default-profile.png'
      },
      created_at: project.created_at,
      updated_at: project.updated_at
    }));

    const totalProjects = count || 0;
    const totalPages = Math.ceil(totalProjects / limit);

    return NextResponse.json(
      successResponse(
        {
          projects: formattedProjects,
          pagination: {
            currentPage: page,
            totalPages,
            totalProjects,
            limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        },
        'Projects retrieved successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/projects:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create a new project
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
    const {
      title,
      description,
      project_type = 'other',
      status = 'draft',
      start_date,
      end_date,
      estimated_duration,
      budget_amount,
      budget_currency = 'AED',
      location,
      is_remote = false,
      thumbnail_url,
      hero_image_url,
      privacy = 'public',
      tags = []
    } = body;

    // Validate required fields
    if (!title || title.length < 3 || title.length > 200) {
      return NextResponse.json(
        errorResponse('Title must be between 3 and 200 characters'),
        { status: 400 }
      );
    }

    if (!description || description.length < 10 || description.length > 10000) {
      return NextResponse.json(
        errorResponse('Description must be between 10 and 10000 characters'),
        { status: 400 }
      );
    }

    // Validate dates
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      if (endDate < startDate) {
        return NextResponse.json(
          errorResponse('End date must be after start date'),
          { status: 400 }
        );
      }
    }

    // Generate unique slug from title
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const supabase = createServerClient();

    // Insert project
    const { data: project, error: projectError } = await supabase
      .from('design_projects')
      .insert({
        user_id: user.id,
        title,
        slug,
        description,
        project_type,
        status,
        start_date,
        end_date,
        estimated_duration,
        budget_amount,
        budget_currency,
        location,
        is_remote,
        thumbnail_url,
        hero_image_url,
        privacy
      })
      .select()
      .single();

    if (projectError) {
      console.error('Project creation error:', projectError);
      return NextResponse.json(
        errorResponse('Failed to create project', projectError.message),
        { status: 500 }
      );
    }

    // Insert tags if provided
    if (tags && tags.length > 0) {
      const tagInserts = tags.map((tag: string) => ({
        project_id: project.id,
        tag_name: tag.trim()
      }));

      const { error: tagsError } = await supabase
        .from('project_tags')
        .insert(tagInserts);

      if (tagsError) {
        console.error('Tags insertion error:', tagsError);
        // Don't fail the request, tags are optional
      }
    }

    return NextResponse.json(
      successResponse(
        { ...project, tags },
        'Project created successfully'
      ),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/projects:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
