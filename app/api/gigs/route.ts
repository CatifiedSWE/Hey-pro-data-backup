import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';
import { generateUniqueSlug, checkProfileComplete, formatBudgetLabel } from '@/lib/supabase/helpers';

/**
 * GET /api/gigs
 * Get all gigs (public access with pagination and filters)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // Filters
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const type = searchParams.get('type');
    const location = searchParams.get('location');
    const createdBy = searchParams.get('createdBy');
    
    // Base query for active, non-expired gigs
    let query = supabase
      .from('gigs')
      .select(`
        id,
        slug,
        title,
        description,
        qualifying_criteria,
        amount,
        currency,
        crew_count,
        role,
        type,
        department,
        company,
        is_tbc,
        request_quote,
        expiry_date,
        supporting_file_label,
        reference_url,
        status,
        created_by,
        created_at,
        updated_at
      `, { count: 'exact' })
      .eq('status', 'active')
      .or('expiry_date.gt.' + new Date().toISOString() + ',expiry_date.is.null')
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (role) {
      query = query.eq('role', role);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (createdBy === 'me') {
      const authHeader = request.headers.get('Authorization');
      const user = await validateAuthToken(authHeader);
      if (user) {
        query = query.eq('created_by', user.id);
      }
    } else if (createdBy) {
      query = query.eq('created_by', createdBy);
    }
    
    // Execute query with pagination
    const { data: gigs, error, count } = await query.range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Gigs fetch error:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch gigs', error.message),
        { status: 500 }
      );
    }
    
    // Fetch related data for each gig
    const gigsWithRelations = await Promise.all(
      (gigs || []).map(async (gig) => {
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
        
        // Count applications
        const { count: applicationCount } = await supabase
          .from('applications')
          .select('id', { count: 'exact', head: true })
          .eq('gig_id', gig.id);
        
        return {
          id: gig.id,
          slug: gig.slug,
          title: gig.title,
          description: gig.description,
          qualifyingCriteria: gig.qualifying_criteria,
          budgetLabel: formatBudgetLabel(gig.amount, gig.currency, gig.request_quote),
          amount: gig.amount,
          currency: gig.currency,
          crewCount: gig.crew_count,
          role: gig.role,
          type: gig.type,
          department: gig.department,
          company: gig.company,
          isTbc: gig.is_tbc,
          requestQuote: gig.request_quote,
          supportingFileLabel: gig.supporting_file_label,
          referenceUrl: gig.reference_url,
          postedOn: gig.created_at,
          postedBy: {
            name: profile?.name || 'Unknown',
            avatar: profile?.profile_photo_url || null
          },
          dateWindows: (dates || []).map(d => ({
            label: d.month,
            range: d.days
          })),
          location: (locations || []).map(l => l.location_name).join(', '),
          applyBefore: gig.expiry_date,
          applicationCount: applicationCount || 0
        };
      })
    );
    
    return NextResponse.json(
      successResponse(
        {
          gigs: gigsWithRelations,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil((count || 0) / limit),
            totalGigs: count || 0,
            limit
          }
        },
        'Gigs retrieved successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/gigs error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * POST /api/gigs
 * Create a new gig (requires authentication and complete profile)
 */
export async function POST(request: NextRequest) {
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

    // Check profile completeness
    const { isComplete } = await checkProfileComplete(user.id);
    if (!isComplete) {
      return NextResponse.json(
        errorResponse('Please complete your profile before creating gigs'),
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description'];
    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        errorResponse(`Missing required fields: ${missingFields.join(', ')}`),
        { status: 400 }
      );
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(body.title);

    // Map frontend status to database status
    // Frontend sends 'published' but DB expects 'active'
    let dbStatus = body.status || 'active';
    if (dbStatus === 'published') {
      dbStatus = 'active';
    }

    // Insert gig
    const { data: gig, error: gigError } = await supabase
      .from('gigs')
      .insert({
        title: body.title,
        slug,
        description: body.description,
        qualifying_criteria: body.qualifyingCriteria || null,
        amount: body.amount || null,
        currency: body.currency || 'AED',
        crew_count: body.crewCount || 1,
        role: body.role || null,
        type: body.type || null,
        department: body.department || null,
        company: body.company || null,
        is_tbc: body.isTbc || false,
        request_quote: body.requestQuote || false,
        expiry_date: body.expiryDate || null,
        supporting_file_label: body.supportingFileLabel || null,
        reference_url: body.referenceUrl || null,
        status: dbStatus,
        created_by: user.id
      })
      .select()
      .single();

    if (gigError) {
      console.error('Gig creation error:', gigError);
      return NextResponse.json(
        errorResponse('Failed to create gig', gigError.message),
        { status: 500 }
      );
    }

    // Insert gig_dates if provided
    if (body.dateWindows && Array.isArray(body.dateWindows) && body.dateWindows.length > 0) {
      const dateRecords = body.dateWindows.map((dw: any) => ({
        gig_id: gig.id,
        month: dw.label,
        days: dw.range
      }));
      
      const { error: datesError } = await supabase
        .from('gig_dates')
        .insert(dateRecords);
      
      if (datesError) {
        console.error('Gig dates insert error:', datesError);
      }
    }

    // Insert gig_locations if provided
    if (body.locations && Array.isArray(body.locations) && body.locations.length > 0) {
      const locationRecords = body.locations.map((loc: string) => ({
        gig_id: gig.id,
        location_name: loc
      }));
      
      const { error: locationsError } = await supabase
        .from('gig_locations')
        .insert(locationRecords);
      
      if (locationsError) {
        console.error('Gig locations insert error:', locationsError);
      }
    }

    // Insert gig_references if provided
    if (body.references && Array.isArray(body.references) && body.references.length > 0) {
      const referenceRecords = body.references.map((ref: any) => ({
        gig_id: gig.id,
        label: ref.label,
        url: ref.url,
        type: ref.type
      }));
      
      const { error: referencesError } = await supabase
        .from('gig_references')
        .insert(referenceRecords);
      
      if (referencesError) {
        console.error('Gig references insert error:', referencesError);
      }
    }

    // Fetch complete gig with relations
    const { data: dates } = await supabase
      .from('gig_dates')
      .select('month, days')
      .eq('gig_id', gig.id);
    
    const { data: locations } = await supabase
      .from('gig_locations')
      .select('location_name')
      .eq('gig_id', gig.id);
    
    const { data: references } = await supabase
      .from('gig_references')
      .select('id, label, url, type')
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
          createdBy: gig.created_by,
          createdAt: gig.created_at,
          dateWindows: (dates || []).map(d => ({ label: d.month, range: d.days })),
          locations: (locations || []).map(l => l.location_name),
          references: references || []
        },
        'Gig created successfully'
      ),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/gigs error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
