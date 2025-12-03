import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/explore/[userId]
 * Get detailed profile for a specific user
 * Public access
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = createServerClient();
    const { userId } = await params;

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        errorResponse('Failed to fetch profile', profileError.message),
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        errorResponse('Profile not found'),
        { status: 404 }
      );
    }

    // Fetch user roles
    const { data: roles } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true });

    // Fetch user skills
    const { data: skills } = await supabase
      .from('applicant_skills')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true });

    // Fetch user links
    const { data: links } = await supabase
      .from('user_profile_links')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true });

    // Fetch user languages
    const { data: languages } = await supabase
      .from('user_languages')
      .select('*')
      .eq('user_id', userId);

    // Fetch travel countries
    const { data: travelCountries } = await supabase
      .from('user_travel_countries')
      .select('*')
      .eq('user_id', userId);

    // Fetch credits
    const { data: credits } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .order('year', { ascending: false });

    // Fetch highlights
    const { data: highlights } = await supabase
      .from('user_highlights')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true });

    // Fetch recommendations
    const { data: recommendations } = await supabase
      .from('user_recommendations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Build display name with priority: alias_first_name + alias_surname (1st), first_name + surname (2nd)
    const aliasName = `${profile.alias_first_name || ''} ${profile.alias_surname || ''}`.trim();
    const realName = `${profile.first_name || ''} ${profile.surname || ''}`.trim();
    const displayName = aliasName || realName || 'Anonymous';
    
    // Build comprehensive profile response
    const completeProfile = {
      id: profile.id,
      userId: profile.user_id,
      name: displayName,
      displayName: displayName,
      avatar: profile.profile_photo_url,
      banner: profile.banner_url,
      bio: profile.bio,
      country: profile.country,
      city: profile.city,
      location: profile.city && profile.country 
        ? `${profile.city}, ${profile.country}` 
        : profile.country || 'Not specified',
      email: profile.email,
      phone: profile.phone,
      portfolioUrl: profile.portfolio_url,
      imdbUrl: profile.imdb_url,
      dayRate: profile.day_rate,
      currency: profile.day_rate_currency || 'AED',
      experienceLevel: profile.experience_level,
      availableForWork: profile.available_for_work,
      visibleInExplore: profile.visible_in_explore,
      isProfileComplete: profile.is_profile_complete,
      profileCompletionPercentage: profile.profile_completion_percentage,
      roles: roles?.map(r => ({
        id: r.id,
        roleName: r.role_name,
        category: r.category,
        sortOrder: r.sort_order
      })) || [],
      skills: skills?.map(s => ({
        id: s.id,
        skillName: s.skill_name,
        proficiencyLevel: s.proficiency_level,
        sortOrder: s.sort_order
      })) || [],
      links: links?.map(l => ({
        id: l.id,
        platform: l.platform,
        url: l.url,
        label: l.label,
        sortOrder: l.sort_order
      })) || [],
      languages: languages?.map(lang => ({
        id: lang.id,
        language: lang.language,
        proficiency: lang.proficiency
      })) || [],
      travelCountries: travelCountries?.map(tc => ({
        id: tc.id,
        country: tc.country
      })) || [],
      credits: credits?.map(c => ({
        id: c.id,
        title: c.title,
        role: c.role,
        year: c.year,
        description: c.description,
        imdbUrl: c.imdb_url
      })) || [],
      highlights: highlights?.map(h => ({
        id: h.id,
        highlight: h.highlight,
        sortOrder: h.sort_order
      })) || [],
      recommendations: recommendations?.map(r => ({
        id: r.id,
        recommenderName: r.recommender_name,
        recommenderRole: r.recommender_role,
        recommendation: r.recommendation,
        createdAt: r.created_at
      })) || [],
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    };

    return NextResponse.json(
      successResponse(completeProfile, 'Profile retrieved successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/explore/[userId]:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
