"use client";
import { Separator } from "@/components/ui/separator";
import { Ellipsis, Heart, MessageCircle, Send, Share2 } from "lucide-react";
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
            profileName: "John Doe",
            role: "Cinematographer",
            totlerole: "15 Roles",
            noLike: 10000,
            noComment: 1000,
            slateSrc: "/slate.png",
            description: "Award-winning cinematographer with 10+ years in narrative film and commercial work. Visual storytelling and collaborative filmmaking."
        },
        {
            id: "2",
            profileAvtar: "/Image (2).png",
            profileName: "Sophia Hernandez",
            role: "Producer",
            totlerole: "2 Roles",
            noLike: 10000,
            noComment: 1000,
            slateSrc: "/slate.png",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        },
        {
            id: "3",
            profileAvtar: "/Image (3).png",
            profileName: "James Rodriguez",
            role: "Music Director",
            totlerole: "4 Roles",
            noLike: 10000,
            noComment: 1000,
            slateSrc: "/slate.png",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        },
        {
            id: "4",
            profileAvtar: "/slate.png",
            profileName: "Mia Taylor",
            role: "Producer",
            totlerole: "2 Roles",
            noLike: 10000,
            noComment: 1000,
            slateSrc: "/slate.png",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
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
        <div className="flex flex-col gap-6 mt-4 pb-20">
            {slate.map((item) => (
                <SlateCard
                    key={item.id}
                    {...item}
                />
            ))}
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

function SlateCard({ 
    profileAvtar,
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
        <div className="w-full bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12">
                        <Image
                            src={profileAvtar}
                            alt={profileName}
                            fill
                            className="rounded-full object-cover border border-gray-100"
                        />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-gray-900">{profileName}</h2>
                        <p className="text-xs text-gray-500 font-medium">{role} • {totlerole}</p>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50">
                    <Ellipsis className="h-6 w-6" />
                </button>
            </div>

            {/* Content Image */}
            {slateSrc && (
                <div className="relative w-full aspect-square sm:aspect-[4/3] mb-4 overflow-hidden rounded-lg bg-gray-50">
                    <Image
                        src={slateSrc}
                        alt="Post content"
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 mb-3">
                <button className="text-gray-700 hover:text-[#FA6E80] transition-colors">
                    <Heart className="h-6 w-6" />
                </button>
                <button className="text-gray-700 hover:text-[#6A89BE] transition-colors">
                    <MessageCircle className="h-6 w-6" />
                </button>
                <button className="text-gray-700 hover:text-[#31A7AC] transition-colors">
                    <Send className="h-6 w-6" />
                </button>
            </div>

            {/* Description */}
            <DescriptionWithShowMore description={description} />
        </div>
    );
}

function DescriptionWithShowMore({ description }: { description: string }) {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const shouldTruncate = description.length > 100;

    return (
        <div className="text-sm text-gray-700 leading-relaxed">
            <span className={!isExpanded && shouldTruncate ? "line-clamp-2" : ""}>
                {description}
            </span>
            {shouldTruncate && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-gray-400 hover:text-gray-600 text-xs font-medium mt-1 ml-1"
                >
                    {isExpanded ? 'see less' : 'see more'}
                </button>
            )}
        </div>
    );
}
