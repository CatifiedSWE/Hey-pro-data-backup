"use client";
import Image from "next/image";
import { Heart, Loader2, Plus, X } from "lucide-react";
import React, { useEffect, useState, useRef, useCallback } from "react";

import { Header } from "../components/Header";
import { Avatar } from "../components/Avatar";
import CollabComment from "@/components/collab/CollabComment";
import { ShareModal } from "@/components/collab/ShareModal";
import { getCollabs, expressInterest, removeInterest, saveCollab, unsaveCollab, createCollab, uploadCollabCover, type CollabPost } from "@/lib/api/collab";

const TagPill = ({ label }: { label: string }) => (
    <span className="rounded-[40px] h-[24px] flex justify-center items-center border border-[#2FD3D8] px-4 py-1 text-xs font-medium text-[#2FD3D8]">{label}</span>
);

const CreateTagPill = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
    <span className="inline-flex items-center gap-2 rounded-[15px] border border-[#2FD3D8] px-4 py-1 text-xs font-medium text-[#2FD3D8]">
        {label}
        <button type="button" onClick={onRemove} aria-label={`Remove ${label}`}>
            <X className="h-3 w-3" />
        </button>
    </span>
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

const inputBase = "w-full rounded-[15px] border border-[#2FD3D8]/40 bg-transparent px-5 py-3 text-sm text-black placeholder:text-black focus:border-[#2FD3D8] focus:outline-none";

export default function Collab() {
    const [collabPosts, setCollabPosts] = useState<CollabPost[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [interestLoading, setInterestLoading] = useState<{ [key: string]: boolean }>({});
    const [saveLoading, setSaveLoading] = useState<{ [key: string]: boolean }>({});
    const [savedCollabs, setSavedCollabs] = useState<Set<string>>(new Set());
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Creation form state
    const [submitting, setSubmitting] = useState(false);
    const [posterPreview, setPosterPreview] = useState<string>("");
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [collabTitle, setCollabTitle] = useState("");
    const [collabIdea, setCollabIdea] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);

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

    // Handle save toggle
    const handleSaveToggle = async (collabId: string) => {
        setSaveLoading(prev => ({ ...prev, [collabId]: true }));
        
        try {
            const isSaved = savedCollabs.has(collabId);
            
            if (isSaved) {
                await unsaveCollab(collabId);
                setSavedCollabs(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(collabId);
                    return newSet;
                });
            } else {
                await saveCollab(collabId);
                setSavedCollabs(prev => new Set(prev).add(collabId));
            }
        } catch (error) {
            console.error('Failed to toggle save:', error);
            alert(error instanceof Error ? error.message : 'Failed to update save');
        } finally {
            setSaveLoading(prev => ({ ...prev, [collabId]: false }));
        }
    };

    // Creation form functions
    const handlePosterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        // Validate file type
        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
            alert('Only JPG and PNG files are allowed');
            return;
        }

        setPosterFile(file);
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            if (typeof loadEvent.target?.result === "string") {
                setPosterPreview(loadEvent.target.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleAddTag = () => {
        const value = tagInput.trim();
        if (!value || tags.includes(value)) return;
        if (tags.length >= 10) {
            alert('Maximum 10 tags allowed');
            return;
        }
        setTags((prev) => [...prev, value]);
        setTagInput("");
    };

    const handleRemoveTag = (value: string) => {
        setTags((prev) => prev.filter((tag) => tag !== value));
    };

    const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        // Validation
        if (!collabTitle.trim()) {
            alert('Please enter a collab title');
            return;
        }
        
        if (collabTitle.length < 3 || collabTitle.length > 200) {
            alert('Title must be between 3 and 200 characters');
            return;
        }

        if (!collabIdea.trim()) {
            alert('Please enter your collab idea');
            return;
        }

        if (collabIdea.length < 10 || collabIdea.length > 5000) {
            alert('Summary must be between 10 and 5000 characters');
            return;
        }

        setSubmitting(true);

        try {
            let coverImageUrl: string | undefined = undefined;

            // Upload cover image if provided
            if (posterFile) {
                const uploadResult = await uploadCollabCover(posterFile);
                coverImageUrl = uploadResult.url;
            }

            // Create collab
            await createCollab({
                title: collabTitle,
                summary: collabIdea,
                tags: tags.length > 0 ? tags : undefined,
                cover_image_url: coverImageUrl,
                status: 'open'
            });

            // Reset form
            setCollabTitle("");
            setCollabIdea("");
            setTags([]);
            setPosterPreview("");
            setPosterFile(null);
            setTagInput("");

            // Refresh collabs list
            await fetchCollabs(1);
            
            alert('Collab created successfully!');
        } catch (error) {
            console.error('Failed to create collab:', error);
            alert(error instanceof Error ? error.message : 'Failed to create collab. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen w-full">
            <Header />

            <div className="mt-16 sm:max-w-[960px] max-w-[393px] w-full space-y-10 text-black bg-transparent pb-10">
                <section className="space-y-8">
                    {collabPosts.map((post) => (
                        <article key={post.id} className="grid gap-6 md:grid-cols-[360px_auto] p-2">
                            <div className="overflow-hidden rounded-[10px] w-full md:w-[360px] h-[220px] relative">
                                <Image
                                    src={post.cover_image_url || '/bg.jpg'}
                                    alt={post.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 360px"
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                            <div className="rounded-[32px] border border-white/10 p-6">
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        src={post.author.avatar}
                                        alt={post.author.name}
                                        width={48}
                                        height={48}
                                        className="rounded-full border border-white/10"
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
                                                    <Avatar
                                                        key={`${avatar}-${index}`}
                                                        src={avatar}
                                                        alt="Interested member"
                                                        width={25}
                                                        height={25}
                                                        className="rounded-full object-cover"
                                                        style={{ marginLeft: index === 0 ? 0 : -10 }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        <span className="text-xs hidden sm:flex text-black/70">{post.interests} interested</span>
                                    </div>
                                    <div className="ml-auto flex items-center gap-3">
                                        <button 
                                            onClick={() => handleSaveToggle(post.id)}
                                            disabled={saveLoading[post.id]}
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAFAFA] text-[#FA6E80] hover:bg-[#FA6E80]/10 transition-colors disabled:opacity-50"
                                            title={savedCollabs.has(post.id) ? "Unsave" : "Save"}
                                        >
                                            {saveLoading[post.id] ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <Heart className={`h-5 w-5 ${savedCollabs.has(post.id) ? 'fill-current' : ''}`} />
                                            )}
                                        </button>
                                        <ShareModal
                                            collabId={post.id}
                                            collabTitle={post.title}
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAFAFA] text-[#31A7AC] hover:bg-[#31A7AC]/10 transition-colors"
                                        />
                                        <CollabComment collabId={post.id} />
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