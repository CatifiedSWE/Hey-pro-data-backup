import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { calculateAndUpdateProfileCompletion } from '@/lib/profile-completion';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/profile/highlights
 * Get user's profile highlights with enriched source data
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

    // Enrich highlights with source data
    const enrichedHighlights = await Promise.all(
      (highlights || []).map(async (highlight) => {
        let sourceData = null;

        if (highlight.source_type === 'credit' && highlight.source_id) {
          const { data: credit } = await supabase
            .from('user_credits')
            .select('*')
            .eq('id', highlight.source_id)
            .single();
          sourceData = credit;
        } else if (highlight.source_type === 'slate_post' && highlight.source_id) {
          const { data: post } = await supabase
            .from('slate_posts')
            .select(`
              id,
              content,
              slug,
              likes_count,
              comments_count,
              created_at,
              media:slate_media(
                id,
                media_url,
                media_type,
                sort_order
              )
            `)
            .eq('id', highlight.source_id)
            .single();
          sourceData = post;
        }

        return {
          ...highlight,
          source_data: sourceData
        };
      })
    );

    return NextResponse.json(
      successResponse(enrichedHighlights, 'Highlights retrieved successfully'),
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
 * Add a new highlight (supports both old and new format)
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
    const { source_type, source_id, sort_order, title, description, image_url } = body;

    // Check if using new source-based format
    if (source_type && source_id) {
      // Validate source_type
      if (!['credit', 'slate_post'].includes(source_type)) {
        return NextResponse.json(
          errorResponse('Invalid source_type. Must be "credit" or "slate_post"'),
          { status: 400 }
        );
      }

      // Check max 3 highlights
      const { count } = await supabase
        .from('user_highlights')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (count && count >= 3) {
        return NextResponse.json(
          errorResponse('Maximum 3 highlights allowed'),
          { status: 400 }
        );
      }

      // Validate source exists
      if (source_type === 'credit') {
        const { data: credit, error: creditError } = await supabase
          .from('user_credits')
          .select('id')
          .eq('id', source_id)
          .eq('user_id', user.id)
          .single();

        if (creditError || !credit) {
          return NextResponse.json(
            errorResponse('Credit not found or access denied'),
            { status: 404 }
          );
        }
      } else if (source_type === 'slate_post') {
        const { data: post, error: postError } = await supabase
          .from('slate_posts')
          .select('id')
          .eq('id', source_id)
          .eq('user_id', user.id)
          .single();

        if (postError || !post) {
          return NextResponse.json(
            errorResponse('Slate post not found or access denied'),
            { status: 404 }
          );
        }
      }

      // Insert highlight with source reference
      const { data, error } = await supabase
        .from('user_highlights')
        .insert({
          user_id: user.id,
          source_type,
          source_id,
          sort_order: sort_order !== undefined ? sort_order : 0
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
    } else {
      // Legacy format: title and description
      if (!title || !description) {
        return NextResponse.json(
          errorResponse('Either (source_type and source_id) or (title and description) are required'),
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
    }
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
