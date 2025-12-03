import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';
import { generateUniqueSlug, formatBudgetLabel } from '@/lib/supabase/helpers';

/**
 * GET /api/gigs/[id]
 * Get gig details by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const gigId = params.id;

    // Fetch gig
    const { data: gig, error: gigError } = await supabase
      .from('gigs')
      .select('*')
      .eq('id', gigId)
      .maybeSingle();

    if (gigError) {
      console.error('Gig fetch error:', gigError);
      return NextResponse.json(
        errorResponse('Failed to fetch gig', gigError.message),
        { status: 500 }
      );
    }

    if (!gig) {
      return NextResponse.json(
        errorResponse('Gig not found'),
        { status: 404 }
      );
    }

    // Get creator profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id, first_name, surname, alias_first_name, alias_surname, profile_photo_url')
      .eq('user_id', gig.created_by)
      .maybeSingle();

    // Get gig dates
    const { data: dates } = await supabase
      .from('gig_dates')
      .select('month, days')
      .eq('gig_id', gig.id)
      .order('created_at');

    // Get gig locations
    const { data: locations } = await supabase
      .from('gig_locations')
      .select('location_name')
      .eq('gig_id', gig.id)
      .order('created_at');

    // Get gig references
    const { data: references } = await supabase
      .from('gig_references')
      .select('id, label, url, type')
      .eq('gig_id', gig.id)
      .order('created_at');

    // Count applications
    const { count: applicationCount } = await supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('gig_id', gig.id);

    return NextResponse.json(
      successResponse(
        {
          id: gig.id,
          slug: gig.slug,
          title: gig.title,
          description: gig.description,
          qualifyingCriteria: gig.qualifying_criteria,
          amount: gig.amount,
          currency: gig.currency,
          budgetLabel: formatBudgetLabel(gig.amount, gig.currency, gig.request_quote),
          crewCount: gig.crew_count,
          role: gig.role,
          type: gig.type,
          department: gig.department,
          company: gig.company,
          isTbc: gig.is_tbc,
          requestQuote: gig.request_quote,
          expiryDate: gig.expiry_date,
          supportingFileLabel: gig.supporting_file_label,
          referenceUrl: gig.reference_url,
          status: gig.status,
          postedOn: gig.created_at,
          postedBy: {
            name: profile?.name || 'Unknown',
            avatar: profile?.profile_photo_url || null
          },
          dateWindows: (dates || []).map(d => ({
            label: d.month,
            range: d.days
          })),
          locations: (locations || []).map(l => l.location_name),
          location: (locations || []).map(l => l.location_name).join(', '),
          references: references || [],
          applicationCount: applicationCount || 0
        },
        'Gig retrieved successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/gigs/[id] error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/gigs/[id]
 * Update a gig (creator only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);

    if (!user) {
      return NextResponse.json(
        errorResponse('Authentication required'),
        { status: 401 }
      );
    }

    const gigId = params.id;
    const body = await request.json();

    // Verify user is gig creator
    const { data: existingGig, error: fetchError } = await supabase
      .from('gigs')
      .select('created_by, title, slug')
      .eq('id', gigId)
      .maybeSingle();

    if (fetchError || !existingGig) {
      return NextResponse.json(
        errorResponse('Gig not found'),
        { status: 404 }
      );
    }

    if (existingGig.created_by !== user.id) {
      return NextResponse.json(
        errorResponse('You do not have permission to update this gig'),
        { status: 403 }
      );
    }

    // Generate new slug if title changed
    let slug = existingGig.slug;
    if (body.title && body.title !== existingGig.title) {
      slug = await generateUniqueSlug(body.title);
    }

    // Update gig
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (slug !== existingGig.slug) updateData.slug = slug;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.qualifyingCriteria !== undefined) updateData.qualifying_criteria = body.qualifyingCriteria;
    if (body.amount !== undefined) updateData.amount = body.amount;
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.crewCount !== undefined) updateData.crew_count = body.crewCount;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.department !== undefined) updateData.department = body.department;
    if (body.company !== undefined) updateData.company = body.company;
    if (body.isTbc !== undefined) updateData.is_tbc = body.isTbc;
    if (body.requestQuote !== undefined) updateData.request_quote = body.requestQuote;
    if (body.expiryDate !== undefined) updateData.expiry_date = body.expiryDate;
    if (body.supportingFileLabel !== undefined) updateData.supporting_file_label = body.supportingFileLabel;
    if (body.referenceUrl !== undefined) updateData.reference_url = body.referenceUrl;
    if (body.status !== undefined) {
      // Map frontend status to database status
      // Frontend sends 'published' but DB expects 'active'
      updateData.status = body.status === 'published' ? 'active' : body.status;
    }

    const { data: updatedGig, error: updateError } = await supabase
      .from('gigs')
      .update(updateData)
      .eq('id', gigId)
      .select()
      .single();

    if (updateError) {
      console.error('Gig update error:', updateError);
      return NextResponse.json(
        errorResponse('Failed to update gig', updateError.message),
        { status: 500 }
      );
    }

    // Update gig_dates if provided
    if (body.dateWindows !== undefined) {
      // Delete existing dates
      await supabase.from('gig_dates').delete().eq('gig_id', gigId);
      
      // Insert new dates
      if (Array.isArray(body.dateWindows) && body.dateWindows.length > 0) {
        const dateRecords = body.dateWindows.map((dw: any) => ({
          gig_id: gigId,
          month: dw.label,
          days: dw.range
        }));
        await supabase.from('gig_dates').insert(dateRecords);
      }
    }

    // Update gig_locations if provided
    if (body.locations !== undefined) {
      // Delete existing locations
      await supabase.from('gig_locations').delete().eq('gig_id', gigId);
      
      // Insert new locations
      if (Array.isArray(body.locations) && body.locations.length > 0) {
        const locationRecords = body.locations.map((loc: string) => ({
          gig_id: gigId,
          location_name: loc
        }));
        await supabase.from('gig_locations').insert(locationRecords);
      }
    }

    // Update gig_references if provided
    if (body.references !== undefined) {
      // Delete existing references
      await supabase.from('gig_references').delete().eq('gig_id', gigId);
      
      // Insert new references
      if (Array.isArray(body.references) && body.references.length > 0) {
        const referenceRecords = body.references.map((ref: any) => ({
          gig_id: gigId,
          label: ref.label,
          url: ref.url,
          type: ref.type
        }));
        await supabase.from('gig_references').insert(referenceRecords);
      }
    }

    // Fetch updated gig with relations
    const { data: dates } = await supabase
      .from('gig_dates')
      .select('month, days')
      .eq('gig_id', gigId);
    
    const { data: locations } = await supabase
      .from('gig_locations')
      .select('location_name')
      .eq('gig_id', gigId);
    
    const { data: references } = await supabase
      .from('gig_references')
      .select('id, label, url, type')
      .eq('gig_id', gigId);

    return NextResponse.json(
      successResponse(
        {
          id: updatedGig.id,
          slug: updatedGig.slug,
          title: updatedGig.title,
          description: updatedGig.description,
          qualifyingCriteria: updatedGig.qualifying_criteria,
          amount: updatedGig.amount,
          currency: updatedGig.currency,
          crewCount: updatedGig.crew_count,
          role: updatedGig.role,
          type: updatedGig.type,
          department: updatedGig.department,
          company: updatedGig.company,
          isTbc: updatedGig.is_tbc,
          requestQuote: updatedGig.request_quote,
          expiryDate: updatedGig.expiry_date,
          supportingFileLabel: updatedGig.supporting_file_label,
          referenceUrl: updatedGig.reference_url,
          status: updatedGig.status,
          updatedAt: updatedGig.updated_at,
          dateWindows: (dates || []).map(d => ({ label: d.month, range: d.days })),
          locations: (locations || []).map(l => l.location_name),
          references: references || []
        },
        'Gig updated successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('PATCH /api/gigs/[id] error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/gigs/[id]
 * Delete a gig (creator only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);

    if (!user) {
      return NextResponse.json(
        errorResponse('Authentication required'),
        { status: 401 }
      );
    }

    const gigId = params.id;

    // Verify user is gig creator
    const { data: existingGig, error: fetchError } = await supabase
      .from('gigs')
      .select('created_by')
      .eq('id', gigId)
      .maybeSingle();

    if (fetchError || !existingGig) {
      return NextResponse.json(
        errorResponse('Gig not found'),
        { status: 404 }
      );
    }

    if (existingGig.created_by !== user.id) {
      return NextResponse.json(
        errorResponse('You do not have permission to delete this gig'),
        { status: 403 }
      );
    }

    // Delete gig (CASCADE will handle related tables)
    const { error: deleteError } = await supabase
      .from('gigs')
      .delete()
      .eq('id', gigId);

    if (deleteError) {
      console.error('Gig delete error:', deleteError);
      return NextResponse.json(
        errorResponse('Failed to delete gig', deleteError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(null, 'Gig deleted successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE /api/gigs/[id] error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
