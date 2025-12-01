/**
 * Supabase Helper Functions
 * Utility functions for common operations across API routes
 */

/**
 * Format budget label for gigs
 * @param amount - The budget amount
 * @param currency - Currency code (e.g., 'USD', 'AED')
 * @param requestQuote - Whether the gig requests a quote instead of fixed price
 * @returns Formatted budget string
 */
export const formatBudgetLabel = (
  amount: number | null,
  currency: string | null,
  requestQuote: boolean
): string => {
  if (requestQuote) {
    return 'Request Quote';
  }
  
  if (!amount || !currency) {
    return 'Budget TBD';
  }
  
  // Format number with commas
  const formattedAmount = new Intl.NumberFormat('en-US').format(amount);
  
  return `${currency} ${formattedAmount}`;
};

/**
 * Generate a unique slug for a gig
 * @param title - The gig title
 * @returns Unique slug string
 */
export const generateUniqueSlug = async (title: string): Promise<string> => {
  const { createServerClient } = await import('@/lib/supabase/server');
  const supabase = createServerClient();
  
  // Create base slug from title
  let slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .substring(0, 50); // Limit length
  
  // Check if slug exists and append number if needed
  let counter = 1;
  let uniqueSlug = slug;
  
  while (true) {
    const { data } = await supabase
      .from('gigs')
      .select('id')
      .eq('slug', uniqueSlug)
      .maybeSingle();
    
    if (!data) {
      break; // Slug is unique
    }
    
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  
  return uniqueSlug;
};

/**
 * Check if a user has a complete profile
 * @param userId - The user ID to check
 * @returns Object with isComplete boolean
 */
export const checkProfileComplete = async (
  userId: string
): Promise<{ isComplete: boolean }> => {
  const { createServerClient } = await import('@/lib/supabase/server');
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .select('first_name, surname, country, city')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return { isComplete: false };
  }

  const profile = data as {
    first_name?: string;
    surname?: string;
    country?: string;
    city?: string;
  };

  // Check if required fields are filled
  const isComplete = !!(
    profile.first_name &&
    profile.surname &&
    profile.country &&
    profile.city
  );
  
  return { isComplete };
};

/**
 * Transform calendar months data for frontend
 * @param months - Array of month/days objects
 * @returns Transformed calendar data
 */
export const transformCalendarMonths = (
  months: Array<{ month: string; days: string }>
): Array<{ label: string; range: string }> => {
  return months.map(m => ({
    label: m.month,
    range: m.days
  }));
};

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns Whether email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize string for database insertion
 * @param str - String to sanitize
 * @returns Sanitized string
 */
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/\s+/g, ' ');
};
