import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/profile/complete
 * Get ALL profile data in a single aggregated call
 * 
 * This endpoint reduces 9 separate API calls into 1 call:
 * - /api/profile
 * - /api/profile/links
 * - /api/profile/recommendations
 * - /api/profile/roles
 * - /api/profile/visa
 * - /api/profile/languages
 * - /api/profile/travel-countries
 * - /api/profile/highlights
 * - /api/skills
 * 
 * Expected reduction: 9 calls → 1 call (89% reduction on page load)
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

    // Execute all queries in parallel for maximum performance
    const [
      profileResult,
      linksResult,
      recommendationsListResult,
      rolesResult,
      visaResult,
      languagesResult,
      travelCountriesResult,
      highlightsResult,
      skillsResult
    ] = await Promise.all([
      // Profile data
      supabase
        .from('user_profiles')
        .select(`
          user_id,
          first_name,
          surname,
          alias_first_name,
          alias_surname,
          profile_photo_url,
          banner_url,
          bio,
          country,
          city,
          email,
          phone,
          country_code,
          availability,
          profile_completion_percentage,
          is_profile_complete,
          visible_in_explore,
          day_rate,
          day_rate_currency,
          work_identities,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .single(),

      // Links
      supabase
        .from('user_links')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true }),

      // Recommendations list (we'll fetch profiles separately)
      supabase
        .from('user_recommendations')
        .select('id, recommended_user_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),

      // Roles
      supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true }),

      // Visa info
      supabase
        .from('user_visa_info')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(),

      // Languages
      supabase
        .from('user_languages')
        .select('*')
        .eq('user_id', user.id)
        .order('language_name', { ascending: true }),

      // Travel countries
      supabase
        .from('user_travel_countries')
        .select('*')
        .eq('user_id', user.id)
        .order('country_name', { ascending: true }),

      // Highlights
      supabase
        .from('user_highlights')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true }),

      // Skills
      supabase
        .from('applicant_skills')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true })
    ]);

    // Fetch recommended user profiles if there are any recommendations
    let recommendations = [];
    if (recommendationsListResult.data && recommendationsListResult.data.length > 0) {
      const recommendedUserIds = recommendationsListResult.data.map(rec => rec.recommended_user_id);
      
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, surname, profile_photo_url')
        .in('user_id', recommendedUserIds);

      // Combine recommendations with profile data
      recommendations = recommendationsListResult.data.map(rec => {
        const profile = profiles?.find(p => p.user_id === rec.recommended_user_id);
        return {
          id: rec.id,
          recommended_user_id: rec.recommended_user_id,
          created_at: rec.created_at,
          user_profiles: profile || null
        };
      });
    }

    // Check for critical errors (profile not found is acceptable)
    if (profileResult.error && profileResult.error.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileResult.error);
      return NextResponse.json(
        errorResponse('Failed to fetch profile', profileResult.error.message),
        { status: 500 }
      );
    }

    // Log any non-critical errors for debugging
    if (linksResult.error) console.error('Links fetch error:', linksResult.error);
    if (recommendationsListResult.error) console.error('Recommendations fetch error:', recommendationsListResult.error);
    if (rolesResult.error) console.error('Roles fetch error:', rolesResult.error);
    if (visaResult.error) console.error('Visa fetch error:', visaResult.error);
    if (languagesResult.error) console.error('Languages fetch error:', languagesResult.error);
    if (travelCountriesResult.error) console.error('Travel countries fetch error:', travelCountriesResult.error);
    if (highlightsResult.error) console.error('Highlights fetch error:', highlightsResult.error);
    if (skillsResult.error) console.error('Skills fetch error:', skillsResult.error);

    // Return aggregated data
    const completeProfile = {
      profile: profileResult.data || null,
      links: linksResult.data || [],
      recommendations: recommendations,
      roles: rolesResult.data || [],
      visa: visaResult.data || null,
      languages: languagesResult.data || [],
      travelCountries: travelCountriesResult.data || [],
      highlights: highlightsResult.data || [],
      skills: skillsResult.data || []
    };

    return NextResponse.json(
      successResponse(completeProfile, 'Complete profile data retrieved successfully'),
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Complete profile GET error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
