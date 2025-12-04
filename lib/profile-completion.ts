import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * OPTIMIZED: Calculate profile completion using efficient aggregation queries
 * Reduces 6 separate queries to COUNT queries for maximum performance
 * 
 * @param userId - User ID to calculate completion for
 * @returns Object with completionPercentage (0-100) and isComplete (boolean)
 * 
 * REFORMED Weighted Scoring System (Total: 100%):
 * - Basic Information (25%): first_name, surname, bio, country, city (5% each)
 * - Profile Photos (10%): profile_photo_url (5%), banner_url (5%)
 * - Contact Details (10%): email (5%), phone + country_code (5%)
 * - Professional Role (10%): At least 1 role = 10%
 * - Skills (10%): At least 1 skill = 10%
 * - Social Link (10%): At least 1 link = 10%
 * - Language (10%): At least 1 language = 10%
 * - Availability (10%): Availability status set = 10%
 * - Work History (5%): At least 1 credit = 5% (lowest priority)
 * 
 * Completion Threshold:
 * - Profile Complete: >= 100% completion (all required fields filled)
 * - Users can reach 100% with minimum requirements (1 role, 1 skill, 1 link, 1 language, 1 credit)
 */
export async function calculateProfileCompletion(userId: string): Promise<{
  completionPercentage: number;
  isComplete: boolean;
}> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    let score = 0;

    // OPTIMIZED: Use count queries with minimal data transfer
    // This reduces network payload and database processing significantly
    const [
      profileResult,
      rolesCountResult,
      linksCountResult,
      skillsCountResult,
      creditsCountResult,
      languagesCountResult
    ] = await Promise.all([
      // Profile data - only fetch fields needed for scoring
      supabase
        .from('user_profiles')
        .select('first_name, surname, bio, country, city, profile_photo_url, banner_url, email, phone, country_code, availability')
        .eq('user_id', userId)
        .maybeSingle(),
      
      // OPTIMIZED: Get counts directly instead of fetching all IDs
      supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      
      supabase
        .from('user_links')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      
      supabase
        .from('applicant_skills')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      
      supabase
        .from('user_credits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      
      supabase
        .from('user_languages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
    ]);

    const profile = profileResult.data;
    const rolesCount = rolesCountResult.count || 0;
    const linksCount = linksCountResult.count || 0;
    const skillsCount = skillsCountResult.count || 0;
    const creditsCount = creditsCountResult.count || 0;
    const languagesCount = languagesCountResult.count || 0;

    // === BASIC INFORMATION (25%) ===
    // 5% each for: first_name, surname, bio, country, city
    if (profile?.first_name && profile.first_name.trim().length > 0) score += 5;
    if (profile?.surname && profile.surname.trim().length > 0) score += 5;
    if (profile?.bio && profile.bio.trim().length > 20) score += 5; // Meaningful bio (>20 chars)
    if (profile?.country && profile.country.trim().length > 0) score += 5;
    if (profile?.city && profile.city.trim().length > 0) score += 5;

    // === PROFILE PHOTOS (10%) ===
    // 5% for profile photo, 5% for banner
    if (profile?.profile_photo_url) score += 5;
    if (profile?.banner_url) score += 5;

    // === CONTACT DETAILS (10%) ===
    // 5% for email, 5% for phone with country code
    if (profile?.email && profile.email.trim().length > 0) score += 5;
    if (profile?.phone && profile.phone.trim().length > 0 && profile?.country_code) score += 5;

    // === PROFESSIONAL ROLE (10%) ===
    // At least 1 role = 10% (full points)
    if (rolesCount >= 1) score += 10;

    // === SKILLS (10%) ===
    // At least 1 skill = 10% (full points)
    if (skillsCount >= 1) score += 10;

    // === SOCIAL LINK (10%) ===
    // At least 1 link = 10% (full points)
    if (linksCount >= 1) score += 10;

    // === LANGUAGE (10%) ===
    // At least 1 language = 10% (full points)
    if (languagesCount >= 1) score += 10;

    // === AVAILABILITY (10%) ===
    // Availability status set = 10% (full points)
    if (profile?.availability && profile.availability !== null) score += 10;

    // === WORK HISTORY/CREDITS (5%) ===
    // At least 1 credit = 5% (lowest priority, full points)
    if (creditsCount >= 1) score += 5;

    // Ensure score doesn't exceed 100
    const completionPercentage = Math.min(score, 100);
    const isComplete = completionPercentage >= 100; // Changed from 80% to 100%

    return {
      completionPercentage,
      isComplete
    };

  } catch (error) {
    console.error('Error calculating profile completion:', error);
    // Return 0 on error rather than throwing
    return {
      completionPercentage: 0,
      isComplete: false
    };
  }
}

/**
 * Update profile completion percentage in database
 * @param userId - User ID to update
 * @param completionPercentage - Calculated completion percentage
 * @param isComplete - Whether profile is complete (>=80%)
 */
export async function updateProfileCompletionInDB(
  userId: string,
  completionPercentage: number,
  isComplete: boolean
): Promise<void> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    await supabase
      .from('user_profiles')
      .update({
        profile_completion_percentage: completionPercentage,
        is_profile_complete: isComplete,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
  } catch (error) {
    console.error('Error updating profile completion in DB:', error);
    // Don't throw - this is a non-critical update
  }
}

/**
 * Calculate and update profile completion in one call
 * @param userId - User ID to calculate and update for
 * @returns Calculated completion data
 */
export async function calculateAndUpdateProfileCompletion(userId: string): Promise<{
  completionPercentage: number;
  isComplete: boolean;
}> {
  const result = await calculateProfileCompletion(userId);
  await updateProfileCompletionInDB(userId, result.completionPercentage, result.isComplete);
  return result;
}

/**
 * SMART CHECK: Check if user has NULL completion and auto-calculate if needed
 * This is efficient - only recalculates if completion is NULL (for old users)
 * 
 * @param userId - User ID to check
 * @returns Current completion data (calculated if was NULL, or existing value)
 */
export async function ensureProfileCompletion(userId: string): Promise<{
  completionPercentage: number;
  isComplete: boolean;
  wasCalculated: boolean; // Indicates if calculation was performed
}> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fast check: Does user have completion data?
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('profile_completion_percentage, is_profile_complete')
      .eq('user_id', userId)
      .maybeSingle();

    // If completion exists and is not NULL, return it immediately
    if (profile && profile.profile_completion_percentage !== null && profile.profile_completion_percentage !== undefined) {
      return {
        completionPercentage: profile.profile_completion_percentage,
        isComplete: profile.is_profile_complete || false,
        wasCalculated: false
      };
    }

    // Completion is NULL - calculate it now (for old users or new profiles)
    console.log(`[Profile Completion] Calculating for user ${userId} (was NULL)`);
    const result = await calculateAndUpdateProfileCompletion(userId);
    
    return {
      ...result,
      wasCalculated: true
    };

  } catch (error) {
    console.error('Error ensuring profile completion:', error);
    return {
      completionPercentage: 0,
      isComplete: false,
      wasCalculated: false
    };
  }
}
