"use client";
import { Separator } from "@/components/ui/separator";
import { Ellipsis, Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function SlatePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            const token = session.access_token;
            // Retry mechanism for profile check (handles race conditions)
            const checkProfileWithRetry = async (retries = 3, delay = 1000): Promise<boolean> => {
                for (let attempt = 1; attempt <= retries; attempt++) {
                    try {
                        const response = await fetch('/api/profile', {
                            headers: { 'Authorization': `Bearer ${token}` },
                            cache: 'no-store' // Prevent caching
                        });
                        const data = await response.json();
                        if (data.success && data.data) {
                            return true;
                        }
                        if (attempt < retries) {
                            await new Promise(resolve => setTimeout(resolve, delay));
                        }
                    } catch (error) {
                        if (attempt < retries) {
                            await new Promise(resolve => setTimeout(resolve, delay));
                        }
                    }
                }
                return false;
            };
            try {
                const profileExists = await checkProfileWithRetry();
                if (!profileExists) {
                    router.push('/form');
                    return;
                }
                setLoading(false);
            } catch (error) {
                router.push('/login');
            }
        };
        checkAuth();
    }, [router]);

    interface Slate {
        id: string,
        profileAvtar: string,
        profileName: string,
        role: string,
        totlerole: string,
        noLike: number,
        noComment: number,
        description: string
        slateSrc?: string
    }

    const slate: Slate[] = [
        {
            id: "1",
            profileAvtar: "/Image (1).png",
            profileName: "Jone Dev",
            role: "Cinematographer",
            totlerole: "15 Roles",
            noLike: 10000,
            noComment: 1000,
            slateSrc: "/slate.png",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
        {
            id: "2",
            profileAvtar: "/Image (2).png",
            profileName: "Jone Dev",
            role: "Cinematographer",
            totlerole: "15 Roles",
            noLike: 10000,
            noComment: 1000,
            slateSrc: "/slate.png",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
        {
            id: "3",
            profileAvtar: "/Image (3).png",
            profileName: "Jone Dev",
            role: "Cinematographer",
            totlerole: "15 Roles",
            noLike: 10000,
            noComment: 1000,
            slateSrc: "/slate.png",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
        {
            id: "4",
            profileAvtar: "/slate.png",
            profileName: "Jone Dev",
            role: "Cinematographer",
            totlerole: "15 Roles",
            noLike: 10000,
            noComment: 1000,
            slateSrc: "/slate.png",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        }
    ]

    if (loading) {
        return (
            <div className="space-y-6 mt-4">
                {[1, 2, 3].map((i) => (
                    <SlateSkeleton key={i} />
                ))}
            </div>
        );
    }

    return (
        <div className="mt-3">
            <div>
                {
                    slate.map((item) => (
                        <div key={item.id} className="mb-4">
                            <SlateCard
                                profileAvtar={item.profileAvtar}
                                profileName={item.profileName}
                                role={item.role}
                                totlerole={item.totlerole}
                                noLike={item.noLike}
                                noComment={item.noComment}
                                description={item.description}
                                slateSrc={item.slateSrc}
                            />
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

function SlateSkeleton() {
    return (
        <div className="w-full bg-white rounded-xl p-4 space-y-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-[300px] w-full rounded-lg" />
            <div className="flex gap-4">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-6 w-6" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        </div>
    );
}

function SlateCard({ profileAvtar,
    profileName,
    role,
    totlerole,
    description,
    slateSrc
}: {
    profileAvtar: string,
    profileName: string,
    role: string,
    totlerole: string,
    noLike: number,
    noComment: number,
    description: string,
    slateSrc?: string
}) {
    return (
        <div className=" border-gray-300 rounded-lg p-4 md:p-7 bg-white">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center mb-4">
                    <Image
                        src={profileAvtar}
                        alt={profileName}
                        height={100}
                        width={100}
                        className="w-11 h-11 rounded-full mr-4 object-cover"
                    />
                    <div>
                        <h2 className="text-lg font-semibold">{profileName}</h2>
                        <p className="text-sm text-gray-600">{role} + {totlerole}</p>
                    </div>
                </div>
                <div>
                    {<Ellipsis className="h-6 w-6 md:h-7 md:w-7" />}
                </div>
            </div>
            <div>
                {slateSrc && (
                    <Image
                        src={slateSrc}
                        alt={profileName}
                        height={377}
                        width={377}
                        className="w-[377px] h-[377px] md:w-[520px] md:h-[520px] object-cover rounded-lg mb-4"
                    />
                )}
            </div>
            <div className="flex items-center justify-between">
                <div className="flex flex-row gap-3.5 justify-start">
                    <span><Heart className="h-6 w-6 md:h-7 md:w-7" /></span>
                    <span><MessageCircle className="h-6 w-6 md:h-7 md:w-7" /></span>
                    <span><Send className="h-6 w-6 md:h-7 md:w-7" /></span>
                </div>
                <div>
                    <span><Bookmark className="h-6 w-6 md:h-7 md:w-7" /></span>
                </div>
            </div>
            <DescriptionWithShowMore description={description} />
            <Separator className="" />

        </div>
    );
}

function DescriptionWithShowMore({ description }: { description: string }) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const shouldTruncate = description.length > 150;
    const displayedDescription = isExpanded || !shouldTruncate
        ? description
        : description.slice(0, 200) + '...';

    return (
        <div className="mb-4">
            <p className="text-gray-700 mb-1 text-[12px] md:text-[15px]">{displayedDescription}</p>
            {shouldTruncate && (
                <button
                    onClick={toggleExpand}
                    className="text-[12px] md:text-[15px]"
                >
                    {isExpanded ? 'Show Less' : 'Show More'}
                </button>
            )}
        </div>
    );
}
