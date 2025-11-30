"use client"

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { BookmarkIcon, HelpCircle, SettingsIcon, UserRound } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    // Fetch real profile data
    const { profile: userProfile, loading: profileLoading, error } = useProfile();
    const { user, loading: authLoading } = useAuth();

    interface SimilarAccount {
        id: string | number;
        name: string;
        image: string;
        role: string;
        totlerole: string;
        proifleurl: string;
    }

    interface Profile {
        name: string;
        bio: string;
        backgroundImage: string;
        avatarImage: string;
        referencesavatar: string[];
        totalref: number;
        profileurl: string;
        urls: {
            id: string;
            name: string;
            icon: React.ReactNode;
            link: string;
        }[]
    }

    const [similarAccounts, setSimilarAccounts] = useState<SimilarAccount[]>([]);
    const [loadingSimilar, setLoadingSimilar] = useState(true);

    useEffect(() => {
        const fetchSimilarUsers = async () => {
            try {
                setLoadingSimilar(true);
                
                console.log('Starting to fetch profiles...');
                console.log('Current user ID:', user?.id);
                
                // Get current user ID to exclude from results
                const currentUserId = user?.id;
                
                // Build query for user profiles
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
                    .limit(6);

                // Exclude current user from results
                if (currentUserId) {
                    query = query.neq('user_id', currentUserId);
                }

                const { data: profiles, error } = await query;

                if (error) {
                    console.error('Error fetching profiles:', error);
                    setSimilarAccounts([]);
                    setLoadingSimilar(false);
                    return;
                }

                if (!profiles || profiles.length === 0) {
                    console.log('No profiles found');
                    setSimilarAccounts([]);
                    setLoadingSimilar(false);
                    return;
                }

                console.log('Fetched profiles:', profiles.length);

                // Fetch Google OAuth avatars for all users at once (batch query)
                const { data: authData } = await supabase.auth.admin.listUsers();
                
                // Create a map of user_id to Google avatar
                const googleAvatarMap = new Map<string, string>();
                if (authData?.users) {
                    authData.users.forEach(authUser => {
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
                            // Fetch user roles
                            const { data: roles } = await supabase
                                .from('user_roles')
                                .select('role_name')
                                .eq('user_id', profile.user_id)
                                .order('sort_order', { ascending: true });
                            
                            const roleCount = roles?.length || 0;
                            const primaryRole = roles && roles.length > 0 ? roles[0].role_name : 'Crew Member';

                            // Build display name with priority: alias_first_name + alias_surname (1st), first_name + surname (2nd)
                            const aliasName = `${profile.alias_first_name || ''} ${profile.alias_surname || ''}`.trim();
                            const realName = `${profile.first_name || ''} ${profile.surname || ''}`.trim();
                            const displayName = aliasName || realName || 'Anonymous';

                            // Priority: profile_photo_url > Google metadata avatar > default
                            const profileImage = profile.profile_photo_url || googleAvatarMap.get(profile.user_id) || '/image (1).png';

                            return {
                                id: profile.user_id,
                                name: displayName,
                                image: profileImage,
                                role: primaryRole,
                                totlerole: `${roleCount} Role${roleCount !== 1 ? 's' : ''}`,
                                proifleurl: `/explore/${profile.user_id}`
                            };
                        } catch (innerError) {
                            console.error(`Error processing profile ${profile.id}:`, innerError);
                            return null;
                        }
                    })
                );
                
                // Filter out null profiles and update state
                const validProfiles = enrichedProfiles.filter(p => p !== null) as SimilarAccount[];
                console.log('Final users count:', validProfiles.length);
                setSimilarAccounts(validProfiles);

            } catch (error) {
                console.error('Error in fetchSimilarUsers:', error);
                setSimilarAccounts([]);
            } finally {
                setLoadingSimilar(false);
            }
        };

        // Fetch when auth has finished loading
        if (!authLoading) {
            fetchSimilarUsers();
        }
    }, [authLoading, user?.id]);

    // Construct profile object from real user data
    const profile: Profile = {
        name: userProfile 
            ? `${userProfile.first_name || userProfile.alias_first_name || ''} ${userProfile.surname || userProfile.alias_surname || ''}`.trim() || "User"
            : "Loading...",
        bio: userProfile?.bio || "No bio available",
        backgroundImage: userProfile?.banner_url || "/bg.jpg",
        avatarImage: userProfile?.profile_photo_url || user?.user_metadata?.avatar_url || "/image (1).png",
        referencesavatar: ["/image (1).png", "/image (2).png", "/image (3).png"],
        totalref: 3000,
        profileurl: "/profile",
        urls: [
            {
                id: '1',
                name: "Profile",
                icon: <UserRound />,
                link: "/profile"
            },
            {
                id: '2',
                name: "Saved",
                icon: <BookmarkIcon />,
                link: "/slate/saved"
            },
            {
                id: '3',
                name: "Help",
                icon: <HelpCircle />,
                link: "/help"
            },
            {
                id: '4',
                name: "setting",
                icon: <SettingsIcon />,
                link: "/settings"
            }
        ],
    };

    return (
        <div className="mt-22 px-2 sm:px-4">
            <div className="max-w-[962px] mx-auto flex flex-row justify-between items-center mt-[50px] gap-2 w-full">
                <span className="font-bold bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent">SLATE</span>
                <span className="h-[1px] w-full bg-gradient-to-r from-[#31A7AC] via-[#6A89BE] to-[#FA6E80]" />
            </div>
            <div className="flex flex-col md:flex-row justify-center mx-auto max-w-7xl w-full gap-3.5">
                {/* Sidebar Profile */}
                <div className="w-full md:w-80 md:h-screen mt-3 md:block flex-shrink-0 order-2 md:order-1 mb-4 md:mb-0 hidden ">
                    {profileLoading ? (
                        <div className="animate-pulse">
                            <div className="w-full h-[72px] bg-gray-200 rounded-t-[13px]" />
                            <div className="w-17 h-17 bg-gray-300 rounded-full border-4 border-white -mt-12" />
                            <div className="mt-4 space-y-2">
                                <div className="h-5 bg-gray-200 rounded w-3/4" />
                                <div className="h-4 bg-gray-200 rounded w-full" />
                                <div className="h-4 bg-gray-200 rounded w-5/6" />
                            </div>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 rounded-lg">
                            <p className="text-sm text-red-600">Failed to load profile</p>
                        </div>
                    ) : (
                        <div>
                            <div>
                                <Image src={profile.backgroundImage} alt={profile.name} width={284} height={72} className="w-full h-[72px] object-cover rounded-t-[13px]" />
                            </div>
                            <div>
                                <Image src={profile.avatarImage} alt={profile.name} width={96} height={96} className="w-17 h-17 rounded-full border-4 border-white -mt-12 object-cover" />
                            </div>
                            <div>
                                <h2 className="text-lg">{profile.name}</h2>
                                <p className="text-[12px] text-gray-600 mt-1">{profile.bio}</p>
                            <div className="flex items-center mt-3 w-full max-w-[160px]">
                                {profile.referencesavatar.map((avatar, index) => (
                                    <Image
                                        key={index}
                                        src={avatar}
                                        alt={`Reference ${index + 1}`}
                                        width={10}
                                        height={10}
                                        className={`w-[24px] h-[24px] rounded-full border-2 border-white ${index !== 0 ? '-ml-3' : ''} object-cover`}
                                    />
                                ))}
                                <span className="text-sm text-[#FA6E80] ml-2">+{profile.totalref} Referrals</span>
                            </div>
                            <div>
                                <div className="flex flex-col space-y-2 mt-2">
                                    {profile.urls.map((url) => (
                                        <div key={url.id} className="h-10 w-full rounded-[12.5px] bg-[#F8F8F8] px-2 py-2 mx-auto text-black">
                                            <Link href={url.link} className="text-sm flex flex-row items-center gap-2">
                                                {url.icon} {url.name}
                                            </Link>
                                        </div>
                                    ))}
                                    <div>
                                        <div className="p-[2px] rounded-[12.5px] bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC]">
                                            <Button
                                                className="w-full bg-white hover:bg-white rounded-[10px] text-black"
                                                style={{
                                                    borderRadius: "10px",
                                                }}
                                            >
                                                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC]">
                                                    Send Invite
                                                </span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    )}
                </div>
                {/* Main Content */}
                <div
                    className="w-full md:flex-1 md:h-screen order-1 md:order-2 mb-4 md:mb-0 overflow-y-auto overflow-x-hidden no-scrollbar"
                >
                    {children}
                </div>
                {/* Similar Accounts Sidebar */}
                <div className="w-full max-w-72 flex-col md:block flex-shrink-0 order-3 hidden">
                    <div>
                        <h1 className="mt-3 font-bold bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent">
                            View Profiles
                        </h1>
                        {loadingSimilar ? (
                           <div className="space-y-4 mt-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center space-x-2">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                                        <div className="space-y-1">
                                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                           </div>
                        ) : similarAccounts.length > 0 ? (
                            similarAccounts.map((account) => (
                                <div key={account.id} className="mb-1 p-1 flex flex-col gap-[9px]">
                                    <Link href={account.proifleurl} className="flex items-center space-x-2">
                                        <Image
                                            src={account.image}
                                            alt={account.name}
                                            width={80}
                                            height={80}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="font-semibold text-sm">{account.name}</p>
                                            <div className="flex flex-row gap-1 items-center">
                                                <span className="text-xs text-gray-600 truncate max-w-[100px]">{account.role}</span>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-xs text-gray-500">{account.totlerole}</span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="mt-2 text-sm text-gray-500">
                                <p>No profiles available yet.</p>
                            </div>
                        )}
                        <Link href="#" className="text-[10px] text-black mt-2 block">View crew directory</Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
