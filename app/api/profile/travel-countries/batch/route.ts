import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/profile/travel-countries/batch
 * Add and/or remove multiple travel countries in a single batch operation
 * 
 * This endpoint reduces hundreds of individual operations into 1 call:
 * OLD: 196 individual POST/DELETE calls + 1 GET refetch = 197 API calls
 * NEW: 1 batch operation call = 1 API call
 * 
 * Expected reduction: 197 calls → 1 call (99.5% reduction for bulk country updates)
 * 
 * Request body format:
 * {
 *   "add": [
 *     { "country_name": "United States", "country_code": "US" },
 *     { "country_name": "Canada", "country_code": "CA" }
 *   ],
 *   "remove": ["country-id-1", "country-id-2"]
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
    const { add, remove } = body;

    // Validate at least one operation is provided
    if ((!add || add.length === 0) && (!remove || remove.length === 0)) {
      return NextResponse.json(
        errorResponse('At least one "add" or "remove" operation is required'),
        { status: 400 }
      );
    }

    let deletedCount = 0;
    let addedCount = 0;

    // Execute delete and insert operations in a transaction-like manner
    // Delete first, then insert to avoid conflicts

    // 1. Delete countries if provided
    if (remove && Array.isArray(remove) && remove.length > 0) {
      const { error: deleteError, count } = await supabase
        .from('user_travel_countries')
        .delete({ count: 'exact' })
        .in('id', remove)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Batch travel country deletion error:', deleteError);
        return NextResponse.json(
          errorResponse('Failed to delete travel countries', deleteError.message),
          { status: 500 }
        );
      }

      deletedCount = count || 0;
    }

    // 2. Add countries if provided
    if (add && Array.isArray(add) && add.length > 0) {
      // Validate all countries have required fields
      const invalidCountries = add.filter(
        c => !c.country_name || !c.country_code
      );
      
      if (invalidCountries.length > 0) {
        return NextResponse.json(
          errorResponse('All countries must have "country_name" and "country_code" fields'),
          { status: 400 }
        );
      }

      // Prepare countries for batch insert
      const countriesToInsert = add.map(c => ({
        user_id: user.id,
        country_name: c.country_name,
        country_code: c.country_code
      }));

      const { data: insertedCountries, error: insertError } = await supabase
        .from('user_travel_countries')
        .insert(countriesToInsert)
        .select();

      if (insertError) {
        console.error('Batch travel country insertion error:', insertError);
        
        // Handle unique constraint violation
        if (insertError.code === '23505') {
          return NextResponse.json(
            errorResponse('One or more countries are already in your travel list'),
            { status: 409 }
          );
        }
        
        return NextResponse.json(
          errorResponse('Failed to add travel countries', insertError.message),
          { status: 500 }
        );
      }

      addedCount = insertedCountries?.length || 0;
    }

    // 3. Fetch and return the updated list of travel countries
    const { data: updatedCountries, error: fetchError } = await supabase
      .from('user_travel_countries')
      .select('*')
      .eq('user_id', user.id)
      .order('country_name', { ascending: true });

    if (fetchError) {
      console.error('Travel countries fetch error:', fetchError);
      // Don't fail the request if fetch fails - operation was successful
      return NextResponse.json(
        successResponse(
          { countries: [] },
          `Batch operation completed: Added ${addedCount}, Removed ${deletedCount}. Failed to fetch updated list.`
        ),
        { status: 200 }
      );
    }

    // Build summary message
    const summaryParts = [];
    if (addedCount > 0) summaryParts.push(`Added ${addedCount}`);
    if (deletedCount > 0) summaryParts.push(`Removed ${deletedCount}`);
    const summary = summaryParts.join(', ') || 'No changes';

    return NextResponse.json(
      successResponse(
        { countries: updatedCountries || [] },
        `Travel countries updated successfully: ${summary}`
      ),
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Batch travel countries error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile/travel-countries/batch
 * Replace all travel countries with a new set in a single operation
 * 
 * This is useful when you want to completely replace the user's travel countries list.
 * 
 * Request body format:
 * {
 *   "countries": [
 *     { "country_name": "United States", "country_code": "US" },
 *     { "country_name": "Canada", "country_code": "CA" }
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
    const { countries } = body;

    // Validate request body
    if (!Array.isArray(countries)) {
      return NextResponse.json(
        errorResponse('Request body must contain a "countries" array'),
        { status: 400 }
      );
    }

    // Validate all countries have required fields
    if (countries.length > 0) {
      const invalidCountries = countries.filter(
        c => !c.country_name || !c.country_code
      );
      
      if (invalidCountries.length > 0) {
        return NextResponse.json(
          errorResponse('All countries must have "country_name" and "country_code" fields'),
          { status: 400 }
        );
      }
    }

    // 1. Delete all existing travel countries for the user
    const { error: deleteError } = await supabase
      .from('user_travel_countries')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Travel countries deletion error:', deleteError);
      return NextResponse.json(
        errorResponse('Failed to clear existing travel countries', deleteError.message),
        { status: 500 }
      );
    }

    // 2. Insert new countries if provided
    let insertedCountries = [];
    if (countries.length > 0) {
      const countriesToInsert = countries.map(c => ({
        user_id: user.id,
        country_name: c.country_name,
        country_code: c.country_code
      }));

      const { data, error: insertError } = await supabase
        .from('user_travel_countries')
        .insert(countriesToInsert)
        .select();

      if (insertError) {
        console.error('Travel countries insertion error:', insertError);
        return NextResponse.json(
          errorResponse('Failed to add new travel countries', insertError.message),
          { status: 500 }
        );
      }

      insertedCountries = data || [];
    }

    return NextResponse.json(
      successResponse(
        { countries: insertedCountries },
        `Travel countries replaced successfully: ${insertedCountries.length} countries`
      ),
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Replace travel countries error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
