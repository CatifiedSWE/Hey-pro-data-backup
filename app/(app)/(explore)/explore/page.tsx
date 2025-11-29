import ExplorePage from "@/components/modules/pages/explore-page";
import { createServerClient } from "@/lib/supabase/server";
import { ProjectCardType } from "@/types";

/**
 * Fetch explore data directly from Supabase
 * This mimics the logic in /api/explore but optimized for initial page load
 */
async function getExploreData(): Promise<ProjectCardType[]> {
  try {
    const supabase = createServerClient();
    
    // Fetch profiles
    // Limit to 50 for initial load
    // Removed .eq('visible_in_explore', true) to ensure data shows up even if flag is missing
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        user_id,
        name,
        alias_first_name,
        alias_surname,
        profile_photo_url,
        banner_photo_url,
        bio,
        country,
        city,
        created_at,
        visible_in_explore
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching explore profiles:", error);
      return [];
    }

    if (!profiles || profiles.length === 0) {
      console.log("No profiles found in explore");
      return [];
    }

    // Enrich profiles with roles
    const enrichedProfiles = await Promise.all(
      profiles.map(async (profile) => {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role_name')
          .eq('user_id', profile.user_id)
          .order('sort_order', { ascending: true });
          
        const displayName = `${profile.alias_first_name || ''} ${profile.alias_surname || ''}`.trim() || profile.name || 'Anonymous';
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
      })
    );
    
    return enrichedProfiles;
  } catch (error) {
    console.error("Unexpected error in getExploreData:", error);
    return [];
  }
}

export default async function Page() {
  const profiles = await getExploreData();
  
  return (
    <div className="w-full">
      <ExplorePage projectsCardData={profiles} />
    </div>
  );
}
