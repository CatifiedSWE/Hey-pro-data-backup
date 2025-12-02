"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Heart, Share2, MessageSquare } from "lucide-react";

import { Avatar } from "../../components/Avatar";
import { getMyCollabs, expressInterest, removeInterest, saveCollab, unsaveCollab, type CollabPost } from "@/lib/api/collab";
import { toast } from "sonner";

const TagPill = ({ label }: { label: string }) => (
    <span className="rounded-full border border-[#2FD3D8] px-4 py-2 text-xs font-medium text-[#2FD3D8] bg-[#2FD3D8]/5">{label}</span>
);

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const InterestButton = ({ collabId, userHasInterest, onToggle, isLoading }: { 
    collabId: string; 
    userHasInterest: boolean; 
    onToggle: () => void; 
    isLoading: boolean;
}) => {
    if (userHasInterest) {
        return (
            <button
                onClick={onToggle}
                disabled={isLoading}
                className="rounded-full min-w-[140px] bg-[#2FD3D8] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm hover:bg-[#26B8BD] transition-colors"
            >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {!isLoading && "Waitlisted"}
            </button>
        );
    }
    return (
        <button
            onClick={onToggle}
            disabled={isLoading}
            className="rounded-full min-w-[140px] border border-[#2FD3D8] bg-white px-6 py-2.5 text-sm font-semibold text-[#2FD3D8] disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-[#2FD3D8]/5 transition-colors"
        >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {!isLoading && "I'm interested"}
        </button>
    );
};

export default function ManageCollab() {
    const router = useRouter();
    const [collabPosts, setCollabPosts] = useState<CollabPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [interestLoading, setInterestLoading] = useState<{ [key: string]: boolean }>({});
    const [saveLoading, setSaveLoading] = useState<{ [key: string]: boolean }>({});

    // Fetch user's collabs
    useEffect(() => {
        const fetchMyCollabs = async () => {
            try {
                const response = await getMyCollabs({ limit: 50 });
                setCollabPosts(response.collabs);
            } catch (error) {
                console.error('Failed to fetch collabs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyCollabs();
    }, []);

    // Handle interest toggle
    const handleInterestToggle = async (collabId: string, currentState: boolean) => {
        setInterestLoading(prev => ({ ...prev, [collabId]: true }));
        
        try {
            if (currentState) {
                await removeInterest(collabId);
            } else {
                await expressInterest(collabId);
            }
            
            // Update local state
            setCollabPosts(prev => prev.map(post => 
                post.id === collabId 
                    ? { 
                        ...post, 
                        userHasInterest: !currentState,
                        interests: currentState ? post.interests - 1 : post.interests + 1
                      }
                    : post
            ));
        } catch (error) {
            console.error('Failed to toggle interest:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update interest');
        } finally {
            setInterestLoading(prev => ({ ...prev, [collabId]: false }));
        }
    };

    // Handle save toggle
    const handleSaveToggle = async (collabId: string, currentState: boolean) => {
        setSaveLoading(prev => ({ ...prev, [collabId]: true }));
        
        try {
            if (currentState) {
                await unsaveCollab(collabId);
            } else {
                await saveCollab(collabId);
            }
            
            // Update local state
            setCollabPosts(prev => prev.map(post => 
                post.id === collabId 
                    ? { ...post, userHasSaved: !currentState }
                    : post
            ));
        } catch (error) {
            console.error('Failed to toggle save:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update save');
        } finally {
            setSaveLoading(prev => ({ ...prev, [collabId]: false }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <div className="max-w-[1200px] mx-auto px-4">
                 <div className="w-full mt-8 mb-8">
                    <h1 className="text-3xl font-bold text-[#FA6E80]">Manage Collab</h1>
                </div>
                
                <div className="space-y-8">
                    {/* User's Collabs */}
                    <section className="space-y-6">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-[#2FD3D8]" />
                            </div>
                        ) : collabPosts.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100">
                                <div className="max-w-md mx-auto">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No collabs yet</h3>
                                    <p className="text-sm">Create your first collaboration project from the Collab feed!</p>
                                    <Link href="/collab" className="inline-block mt-4 text-[#2FD3D8] hover:underline">
                                        Go to Collab Feed
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            collabPosts.map((post) => (
                                <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col lg:flex-row">
                                        <div className="lg:w-[450px] h-[300px] relative bg-gray-100">
                                            <Image
                                                src={post.cover_image_url || '/bg.jpg'}
                                                alt={post.title}
                                                fill
                                                sizes="450px"
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                        
                                        <div className="flex-1 p-8 flex flex-col">
                                            <div className="mb-4 flex-grow">
                                                <div className="flex items-center justify-between mb-4">
                                                    <p className="text-sm text-gray-500">Posted on {formatDate(post.created_at)}</p>
                                                    <Link 
                                                        href={`/collab/manage-collab/${post.id}`}
                                                        className="text-sm font-medium text-[#2FD3D8] hover:text-[#26B8BD] transition-colors"
                                                    >
                                                        Edit →
                                                    </Link>
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h3>
                                                <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">{post.summary}</p>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {post.tags.map((tag) => (
                                                    <TagPill key={tag} label={tag} />
                                                ))}
                                            </div>
                                            
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    {post.interestAvatars.length > 0 && (
                                                        <div className="flex items-center -space-x-2">
                                                            {post.interestAvatars.slice(0, 3).map((avatar, index) => (
                                                                <Avatar
                                                                    key={`${avatar}-${index}`}
                                                                    src={avatar}
                                                                    alt="Interested member"
                                                                    width={28}
                                                                    height={28}
                                                                    className="rounded-full border-2 border-white"
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                    <span className="text-sm font-medium text-gray-600">
                                                        <span className="text-[#2FD3D8] font-semibold">{post.interests}</span> interested
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        onClick={() => handleSaveToggle(post.id, post.userHasSaved || false)}
                                                        disabled={saveLoading[post.id]}
                                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-[#FA6E80] hover:bg-[#FA6E80]/10 transition-colors disabled:opacity-50 border border-gray-200"
                                                        title={post.userHasSaved ? "Unsave" : "Save"}
                                                    >
                                                        {saveLoading[post.id] ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Heart className={`h-4 w-4 ${post.userHasSaved ? 'fill-current' : ''}`} />
                                                        )}
                                                    </button>
                                                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-[#31A7AC] hover:bg-[#31A7AC]/10 transition-colors border border-gray-200">
                                                        <Share2 className="h-4 w-4" />
                                                    </button>
                                                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200">
                                                        <MessageSquare className="h-4 w-4" />
                                                    </button>
                                                    <InterestButton
                                                        collabId={post.id}
                                                        userHasInterest={post.userHasInterest || false}
                                                        onToggle={() => handleInterestToggle(post.id, post.userHasInterest || false)}
                                                        isLoading={interestLoading[post.id] || false}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
