import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Calculate profile completion percentage based on filled fields
 * @param userId - User ID to calculate completion for
 * @n @returns Object with completionPercentage (0-100) and isComplete (boolean)
 * 
 * Weighted Scoring System (Total: 100%):
 * - Basic Information (25%): first_name, surname, bio, country, city (5% each)
 * - Profile Photos (10%): profile_photo_url (5%), banner_url (5%)
 * - Contact Details (10%): email (5%), phone + country_code (5%)
 * - Professional Roles (15%): At least 1 role (10%), 3+ roles (15%)
 * - Skills (15%): At least 1 skill (5%), 3+ skills (10%), 5+ skills (15%)
 * - Social Links (5%): At least 1 link (5%)
 * - Work History (10%): At least 1 credit (5%), 3+ credits (10%)
 * - Languages (5%): At least 1 language (5%)
 * - Availability (5%): Availability status set (5%)
 * 
 * Completion Threshold:
 * - Profile Complete: >= 80% completion
 */
export async function calculateProfileCompletion(userId: string): Promise<{
  completionPercentage: number;
  isComplete: boolean;
}> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    let score = 0;

    // Fetch all profile-related data in parallel for performance
    const [
      profileResult,
      rolesResult,
      linksResult,
      skillsResult,
      creditsResult,
      languagesResult
    ] = await Promise.all([
      // Profile data
      supabase
        .from('user_profiles')
        .select('first_name, surname, bio, country, city, profile_photo_url, banner_url, email, phone, country_code, availability')
        .eq('user_id', userId)
        .maybeSingle(),
      
      // Roles
      supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId),
      
      // Links
      supabase
        .from('user_links')
        .select('id')
        .eq('user_id', userId),
      
      // Skills
      supabase
        .from('applicant_skills')
        .select('id')
        .eq('user_id', userId),
      
      // Credits
      supabase
        .from('user_credits')
        .select('id')
        .eq('user_id', userId),
      
      // Languages
      supabase
        .from('user_languages')
        .select('id')
        .eq('user_id', userId)
    ]);

    const profile = profileResult.data;
    const rolesCount = rolesResult.data?.length || 0;
    const linksCount = linksResult.data?.length || 0;
    const skillsCount = skillsResult.data?.length || 0;
    const creditsCount = creditsResult.data?.length || 0;
    const languagesCount = languagesResult.data?.length || 0;

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

    // === PROFESSIONAL ROLES (15%) ===
    // At least 1 role = 10%, 3+ roles = 15%
    if (rolesCount >= 1) score += 10;
    if (rolesCount >= 3) score += 5; // Additional 5% for 3+ roles

    // === SKILLS (15%) ===
    // At least 1 skill = 5%, 3+ skills = 10%, 5+ skills = 15%
    if (skillsCount >= 1) score += 5;
    if (skillsCount >= 3) score += 5; // Additional 5% for 3+ skills
    if (skillsCount >= 5) score += 5; // Additional 5% for 5+ skills

    // === SOCIAL LINKS (5%) ===
    // At least 1 link = 5%
    if (linksCount >= 1) score += 5;

    // === WORK HISTORY/CREDITS (10%) ===
    // At least 1 credit = 5%, 3+ credits = 10%
    if (creditsCount >= 1) score += 5;
    if (creditsCount >= 3) score += 5; // Additional 5% for 3+ credits

    // === LANGUAGES (5%) ===
    // At least 1 language = 5%
    if (languagesCount >= 1) score += 5;

    // === AVAILABILITY (5%) ===
    // Availability status set = 5%
    if (profile?.availability && profile.availability !== null) score += 5;

    // Ensure score doesn't exceed 100
    const completionPercentage = Math.min(score, 100);
    const isComplete = completionPercentage >= 80;

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
