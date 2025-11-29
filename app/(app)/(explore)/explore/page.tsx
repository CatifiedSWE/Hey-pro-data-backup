import ExplorePage from "@/components/modules/pages/explore-page";
import { createServerClient } from "@/lib/supabase/server";
import { ProjectCardType } from "@/types";

/**
 * Fetch explore data directly from Supabase
 * Filtered by search params
 */
async function getExploreData(searchParams: { [key: string]: string | string[] | undefined }): Promise<ProjectCardType[]> {
  try {
    const supabase = createServerClient();
    
    const keyword = searchParams?.keyword as string;
    const role = searchParams?.role as string;
    const category = searchParams?.category as string;
    // Add other filters as needed
    
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

    // Apply keyword search
    if (keyword) {
        // Sanitized keyword for search
      const sanitizedKeyword = keyword.replace(/[^a-zA-Z0-9 ]/g, "");
      if (sanitizedKeyword) {
           query = query.or(`alias_first_name.ilike.%${sanitizedKeyword}%,alias_surname.ilike.%${sanitizedKeyword}%,first_name.ilike.%${sanitizedKeyword}%,surname.ilike.%${sanitizedKeyword}%,bio.ilike.%${sanitizedKeyword}%`);
      }
    }
    
    // Apply location search if passed in keyword (simple heuristic) or specific param
    // For now just basic keyword search

    const { data: profiles, error } = await query;

    if (error) {
      console.error("Error fetching explore profiles:", JSON.stringify(error, null, 2));
      return [];
    }

    if (!profiles || profiles.length === 0) {
      return [];
    }

    // Enrich profiles with roles
    const enrichedProfiles = await Promise.all(
      profiles.map(async (profile) => {
        try {
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

            // Build display name with priority: alias_first_name + alias_surname (1st), first_name + surname (2nd)
            const aliasName = `${profile.alias_first_name || ''} ${profile.alias_surname || ''}`.trim();
            const realName = `${profile.first_name || ''} ${profile.surname || ''}`.trim();
            const displayName = aliasName || realName || 'Anonymous';
            
            const location = profile.city && profile.country 
            ? `${profile.city}, ${profile.country}` 
            : profile.country || 'Not specified';

            return {
            id: profile.id,
            name: displayName,
            banner: profile.banner_photo_url || '',
            image: profile.profile_photo_url || '',
            bio: profile.bio || '',
            location: location,
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
