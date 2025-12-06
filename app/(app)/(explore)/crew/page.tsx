import ExplorePage from "@/components/modules/pages/explore-page";
import { createServerClient } from "@/lib/supabase/server";
import { ProjectCardType } from "@/types";
export const dynamic = "force-dynamic";

/**
 * Fetch explore data directly from Supabase
 * Filtered by search params and excludes current user
 */
async function getExploreData(searchParams: { [key: string]: string | string[] | undefined }): Promise<(ProjectCardType & { userId?: string })[]> {
  try {
    const supabase = createServerClient();
    
    // Get current logged-in user to exclude from results
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const currentUserId = currentUser?.id;
    
    // Extract all filter parameters
    const keyword = searchParams?.keyword as string;
    const role = searchParams?.role as string;
    const category = searchParams?.category as string;
    const location = searchParams?.location as string;
    const availability = searchParams?.availability as string;
    const productionType = searchParams?.productionType as string;
    const experience = searchParams?.experience as string;
    const minRate = searchParams?.minRate as string;
    const maxRate = searchParams?.maxRate as string;
    
    let query = supabase
      .from('user_profiles')
      .select(`
        id,
        user_id,
        alias_first_name,
        alias_surname,
        first_name,
        surname,
        profile_photo_url,
        banner_url,
        bio,
        country,
        city,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    // Exclude current user from explore results
    if (currentUserId) {
      query = query.neq('user_id', currentUserId);
    }

    // Apply keyword search
    if (keyword) {
        // Sanitized keyword for search
      const sanitizedKeyword = keyword.replace(/[^a-zA-Z0-9 ]/g, "");
      if (sanitizedKeyword) {
           query = query.or(`alias_first_name.ilike.%${sanitizedKeyword}%,alias_surname.ilike.%${sanitizedKeyword}%,first_name.ilike.%${sanitizedKeyword}%,surname.ilike.%${sanitizedKeyword}%,bio.ilike.%${sanitizedKeyword}%`);
      }
    }
    
    // Apply location filter
    if (location) {
      const sanitizedLocation = location.replace(/[^a-zA-Z0-9 ]/g, "");
      if (sanitizedLocation) {
        query = query.or(`country.ilike.%${sanitizedLocation}%,city.ilike.%${sanitizedLocation}%`);
      }
    }

    const { data: profiles, error } = await query;

    if (error) {
      console.error("Error fetching explore profiles:", JSON.stringify(error, null, 2));
      return [];
    }

    if (!profiles || profiles.length === 0) {
      return [];
    }

    // Fetch Google OAuth avatars for all users at once (batch query)
    const userIds = profiles.map(p => p.user_id);
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    
    // Create a map of user_id to Google avatar
    const googleAvatarMap = new Map<string, string>();
    if (authUsers?.users) {
      authUsers.users.forEach(authUser => {
        if (authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture) {
          googleAvatarMap.set(
            authUser.id, 
            authUser.user_metadata.avatar_url || authUser.user_metadata.picture
          );
        }
      });
    }

    // Enrich profiles with roles, skills, and Google avatars
    const enrichedProfiles = await Promise.all(
      profiles.map(async (profile) => {
        try {
            // Fetch user roles
            const { data: roles } = await supabase
            .from('user_roles')
            .select('role_name')
            .eq('user_id', profile.user_id)
            .order('sort_order', { ascending: true });
            
            // Filter by role if specified
            if (role || category) {
                const roleNames = roles?.map(r => r.role_name.toLowerCase()) || [];
                const searchRole = (role || category).toLowerCase();
                if (!roleNames.some(r => r.includes(searchRole))) {
                    return null;
                }
            }

            // Fetch user skills for experience and rate filtering
            const { data: skills } = await supabase
            .from('user_skills')
            .select('skill_name, experience_level, rate_per_day')
            .eq('user_id', profile.user_id);

            // Filter by experience level if specified
            if (experience && skills) {
                const hasMatchingExperience = skills.some(skill => 
                    skill.experience_level && 
                    skill.experience_level.toLowerCase().includes(experience.toLowerCase())
                );
                if (!hasMatchingExperience) {
                    return null;
                }
            }

            // Filter by rate range if specified
            if ((minRate || maxRate) && skills) {
                const min = minRate ? parseInt(minRate) : 0;
                const max = maxRate ? parseInt(maxRate) : 5000;
                
                const hasMatchingRate = skills.some(skill => {
                    if (!skill.rate_per_day) return false;
                    const rate = parseFloat(skill.rate_per_day.toString());
                    return rate >= min && rate <= max;
                });
                
                if (!hasMatchingRate) {
                    return null;
                }
            }

            // Filter by production type if specified
            // Production type is typically part of the role name (e.g., "Director | Commercial")
            if (productionType && roles) {
                const prodType = productionType.toLowerCase();
                const hasMatchingProdType = roles.some(r => 
                    r.role_name.toLowerCase().includes(prodType)
                );
                if (!hasMatchingProdType) {
                    return null;
                }
            }

            // Check availability if specified
            // Note: This requires checking the availability table
            if (availability) {
                const today = new Date().toISOString().split('T')[0];
                const { data: availabilityData } = await supabase
                    .from('availability')
                    .select('status, start_date, end_date')
                    .eq('user_id', profile.user_id)
                    .gte('end_date', today)
                    .order('start_date', { ascending: true })
                    .limit(1);

                if (availability === 'available') {
                    // User should be marked as available
                    const isAvailable = availabilityData && availabilityData.length > 0 && 
                        availabilityData[0].status === 'available';
                    if (!isAvailable) {
                        return null;
                    }
                } else if (availability === 'unavailable') {
                    // User should be marked as unavailable
                    const isUnavailable = availabilityData && availabilityData.length > 0 && 
                        availabilityData[0].status === 'unavailable';
                    if (!isUnavailable) {
                        return null;
                    }
                }
            }

            // Build display name with priority: alias_first_name + alias_surname (1st), first_name + surname (2nd)
            const aliasName = `${profile.alias_first_name || ''} ${profile.alias_surname || ''}`.trim();
            const realName = `${profile.first_name || ''} ${profile.surname || ''}`.trim();
            const displayName = aliasName || realName || 'Anonymous';
            
            const profileLocation = profile.city && profile.country 
            ? `${profile.city}, ${profile.country}` 
            : profile.country || 'Not specified';

            // Priority: profile_photo_url > Google metadata avatar > default (empty string)
            const profileImage = profile.profile_photo_url || googleAvatarMap.get(profile.user_id) || '';

            return {
            id: profile.id,
            userId: profile.user_id,
            name: displayName,
            banner: profile.banner_url || '',
            image: profileImage,
            bio: profile.bio || '',
            location: profileLocation,
            skills: roles?.map(r => r.role_name) || []
            };
        } catch (innerError) {
            console.error(`Error processing profile ${profile.id}:`, innerError);
            return null;
        }
      })
    );
    
    return enrichedProfiles.filter(p => p !== null) as ProjectCardType[];
  } catch (error) {
    console.error("Unexpected error in getExploreData:", error);
    return [];
  }
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const profiles = await getExploreData(resolvedSearchParams);
  
  return (
    <div className="w-full">
      <ExplorePage projectsCardData={profiles} />
    </div>
  );
}
