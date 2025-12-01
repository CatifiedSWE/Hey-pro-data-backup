"use client";
import Image from "next/image";
import { Heart, MessageCircle, Share2, Loader2 } from "lucide-react";
import React, { useEffect, useState, useRef, useCallback } from "react";

import { Header } from "../components/Header";
import Comment from "@/components/comment/comment";
import { getCollabs, expressInterest, removeInterest, type CollabPost } from "@/lib/api/collab";

const TagPill = ({ label }: { label: string }) => (
    <span className="rounded-[40px] h-[24px] flex justify-center items-center border border-[#2FD3D8] px-4 py-1 text-xs font-medium text-[#2FD3D8]">{label}</span>
);

type InterestButtonProps = {
    collabId: string;
    userHasInterest: boolean;
    onToggle: () => void;
    isLoading: boolean;
};

const InterestButton = ({ collabId, userHasInterest, onToggle, isLoading }: InterestButtonProps) => {
    if (userHasInterest) {
        return (
            <button
                onClick={onToggle}
                disabled={isLoading}
                className="rounded-[33px] w-[129px] bg-[#2FD3D8] px-6 py-2 text-sm font-[600] text-black disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {!isLoading && "Interested"}
            </button>
        );
    }
    return (
        <button
            onClick={onToggle}
            disabled={isLoading}
            className="rounded-[33px] w-[129px] border flex items-center justify-center border-[#2FD3D8] px-2 py-2 text-[14px] font-[600] text-[#2FD3D8] disabled:opacity-50 gap-2"
        >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {!isLoading && "I'm interested"}
        </button>
    );
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function Collab() {
    const [collabPosts, setCollabPosts] = useState<CollabPost[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [interestLoading, setInterestLoading] = useState<{ [key: string]: boolean }>({});
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Fetch collabs
    const fetchCollabs = useCallback(async (pageNum: number) => {
        if (loading) return;
        
        setLoading(true);
        try {
            const response = await getCollabs({ page: pageNum, limit: 20 });
            
            if (pageNum === 1) {
                setCollabPosts(response.collabs);
            } else {
                setCollabPosts(prev => [...prev, ...response.collabs]);
            }
            
            setHasMore(response.pagination.hasNextPage);
        } catch (error) {
            console.error('Failed to fetch collabs:', error);
        } finally {
            setLoading(false);
        }
    }, [loading]);

    // Initial load
    useEffect(() => {
        fetchCollabs(1);
    }, []);

    // Infinite scroll
    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                setPage(prev => prev + 1);
            }
        });

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [hasMore, loading]);

    // Fetch next page when page changes
    useEffect(() => {
        if (page > 1) {
            fetchCollabs(page);
        }
    }, [page]);

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
            alert(error instanceof Error ? error.message : 'Failed to update interest');
        } finally {
            setInterestLoading(prev => ({ ...prev, [collabId]: false }));
        }
    };

    return (
        <div className="flex flex-col items-center h-screen overflow-y-auto">
            <Header />

            <div className="mt-16 sm:max-w-[960px] max-w-[393px] w-full space-y-10 text-black bg-transparent pb-10">
                <section className="space-y-8">
                    {collabPosts.map((post) => (
                        <article key={post.id} className="grid gap-6 md:grid-cols-[360px_auto] p-2">
                            <div className="overflow-hidden">
                                <Image
                                    src={post.cover_image_url || '/bg.jpg'}
                                    alt={post.title}
                                    width={360}
                                    height={220}
                                    className="h-full w-full object-cover rounded-[10px]"
                                    unoptimized
                                />
                            </div>
                            <div className="rounded-[32px] border border-white/10 p-6">
                                <div className="flex items-center gap-3">
                                    <Image
                                        src={post.author.avatar}
                                        alt={post.author.name}
                                        width={48}
                                        height={48}
                                        className="rounded-full border border-white/10"
                                        unoptimized
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-black">{post.author.name}</p>
                                        <p className="text-xs text-black/60">Posted on {formatDate(post.created_at)}</p>
                                    </div>
                                </div>
                                <p className="text-[18px] font-[400] mt-3">{post.title}</p>
                                <p className="mt-4 text-sm leading-relaxed text-black">{post.summary}</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {post.tags.map((tag) => (
                                        <TagPill key={tag} label={tag} />
                                    ))}
                                </div>
                                <div className="mt-6 flex sm:flex-wrap flex-row items-center gap-4 text-sm text-white/70">
                                    <div className="flex items-center gap-2">
                                        {post.interestAvatars.length > 0 && (
                                            <div className="flex items-center">
                                                {post.interestAvatars.map((avatar, index) => (
                                                    <Image
                                                        key={`${avatar}-${index}`}
                                                        src={avatar}
                                                        alt="Interested member"
                                                        width={25}
                                                        height={25}
                                                        className="rounded-full object-cover"
                                                        style={{ marginLeft: index === 0 ? 0 : -10 }}
                                                        unoptimized
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        <span className="text-xs hidden sm:flex text-black/70">{post.interests} interested</span>
                                    </div>
                                    <div className="ml-auto flex items-center gap-3">
                                        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAFAFA] text-[#FA6E80]">
                                            <Heart className="h-5 w-5" />
                                        </button>
                                        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAFAFA] text-[#31A7AC]">
                                            <Share2 className="h-5 w-5" />
                                        </button>
                                        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAFAFA] text-black">
                                            <Comment />
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
                        </article>
                    ))}

                    {loading && (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-[#2FD3D8]" />
                        </div>
                    )}

                    {!loading && collabPosts.length === 0 && (
                        <div className="text-center py-8 text-black/60">
                            No collabs found. Be the first to create one!
                        </div>
                    )}

                    {/* Infinite scroll trigger */}
                    {hasMore && <div ref={loadMoreRef} className="h-10" />}
                </section>
            </div>
        </div>
    );
}