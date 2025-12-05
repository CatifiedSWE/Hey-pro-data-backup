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

    // Enrich profiles with roles and Google avatars
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

            // Priority: profile_photo_url > Google metadata avatar > default (empty string)
            const profileImage = profile.profile_photo_url || googleAvatarMap.get(profile.user_id) || '';

            return {
            id: profile.id,
            userId: profile.user_id,
            name: displayName,
            banner: profile.banner_url || '',
            image: profileImage,
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
