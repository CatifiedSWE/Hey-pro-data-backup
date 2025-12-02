"use client";
import Image from "next/image";
import { Heart, Loader2, Plus, X, Search } from "lucide-react";
import React, { useEffect, useState, useRef, useCallback } from "react";

import { Header } from "../components/Header";
import { Avatar } from "../components/Avatar";
import CollabComment from "@/components/collab/CollabComment";
import { ShareModal } from "@/components/collab/ShareModal";
import { getCollabs, expressInterest, removeInterest, saveCollab, unsaveCollab, createCollab, uploadCollabCover, type CollabPost } from "@/lib/api/collab";

const TagPill = ({ label }: { label: string }) => (
    <span className="rounded-full h-[28px] flex justify-center items-center border border-[#2FD3D8] px-4 py-1 text-xs font-medium text-[#2FD3D8] bg-[#2FD3D8]/5">{label}</span>
);

const CreateTagPill = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#2FD3D8] px-4 py-2 text-xs font-medium text-[#2FD3D8] bg-white">
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
                className="rounded-full w-[140px] bg-[#2FD3D8] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm hover:bg-[#26B8BD] transition-colors"
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
            className="rounded-full w-[140px] border border-[#2FD3D8] bg-white px-6 py-2.5 text-sm font-semibold text-[#2FD3D8] disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-[#2FD3D8]/5 transition-colors"
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

const inputBase = "w-full rounded-xl border border-[#E4E7EC] bg-white px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[#2FD3D8] focus:outline-none focus:ring-1 focus:ring-[#2FD3D8] transition-colors";

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
    const [searchQuery, setSearchQuery] = useState("");

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
            const response = await getCollabs({ page: pageNum, limit: 20, search: searchQuery });
            
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
    }, [loading, searchQuery]);

    // Initial load
    useEffect(() => {
        fetchCollabs(1);
    }, [searchQuery]);

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
        <div className="flex flex-col items-center min-h-screen w-full bg-gray-50">
            <Header />

            <div className="mt-8 max-w-[1200px] w-full space-y-8 px-4 pb-10">
                {/* Search Section */}
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 max-w-2xl mx-auto">
                        <Search className="h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search collabs"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-500"
                        />
                        <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FA6E80] text-white hover:bg-[#f5576b] transition-colors">
                            <Search className="h-4 w-4" />
                        </button>
                    </div>
                </section>

                {/* Creation Form */}
                <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <form onSubmit={handleCreateSubmit} className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-shrink-0">
                            <div className="relative flex h-[280px] w-full lg:w-[400px] items-center justify-center overflow-hidden rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 hover:border-[#2FD3D8] transition-colors group">
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg"
                                    className="absolute inset-0 cursor-pointer opacity-0"
                                    onChange={handlePosterChange}
                                    disabled={submitting}
                                />
                                {posterPreview ? (
                                    <Image
                                        src={posterPreview}
                                        alt="Poster preview"
                                        fill
                                        sizes="400px"
                                        className="object-cover rounded-xl"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-3 text-gray-500 group-hover:text-[#2FD3D8] transition-colors">
                                        <Plus className="h-8 w-8" />
                                        <span className="text-sm font-medium">Upload poster / moodboard</span>
                                    </div>
                                )}
                            </div>
                            <p className="mt-3 text-xs text-gray-500 text-center">16:9 recommended • PNG / JPG up to 5MB</p>
                        </div>
                        
                        <div className="flex-1 space-y-6">
                            <input
                                className={inputBase}
                                placeholder="Collab title"
                                value={collabTitle}
                                onChange={(e) => setCollabTitle(e.target.value)}
                                disabled={submitting}
                                required
                            />
                            
                            <textarea
                                className={`${inputBase} min-h-[120px] resize-none`}
                                placeholder="What's your collab idea?"
                                value={collabIdea}
                                onChange={(e) => setCollabIdea(e.target.value)}
                                disabled={submitting}
                                required
                            />
                            
                            <div className="space-y-4">
                                <div className="flex gap-3 p-2 border border-gray-200 rounded-xl bg-gray-50">
                                    <input
                                        className="flex-1 border-none bg-transparent text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none px-2"
                                        placeholder="Add collab tags"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                                event.preventDefault();
                                                handleAddTag();
                                            }
                                        }}
                                        disabled={submitting}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddTag}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FA6E80] text-white hover:bg-[#f5576b] transition-colors"
                                        disabled={submitting}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                
                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag) => (
                                            <CreateTagPill key={tag} label={tag} onRemove={() => handleRemoveTag(tag)} />
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <button 
                                type="submit" 
                                className="w-full rounded-xl h-12 bg-[#FA6E80] text-white font-semibold hover:bg-[#f5576b] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shadow-sm"
                                disabled={submitting}
                            >
                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {submitting ? 'Posting...' : 'Post your collab'}
                            </button>
                        </div>
                    </form>
                </section>

                {/* Collab Posts Feed */}
                <section className="space-y-6">
                    {collabPosts.map((post) => (
                        <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex flex-col lg:flex-row">
                                <div className="lg:w-[500px] h-[300px] relative bg-gray-100">
                                    <Image
                                        src={post.cover_image_url || '/bg.jpg'}
                                        alt={post.title}
                                        fill
                                        sizes="500px"
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                
                                <div className="flex-1 p-8">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <Avatar
                                                    src={post.author.avatar}
                                                    alt={post.author.name}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-full"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{post.author.name}</p>
                                                    <p className="text-xs text-gray-500">Posted on {formatDate(post.created_at)}</p>
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{post.title}</h3>
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">{post.summary}</p>
                                    
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {post.tags.map((tag) => (
                                            <TagPill key={tag} label={tag} />
                                        ))}
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
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
                                                onClick={() => handleSaveToggle(post.id)}
                                                disabled={saveLoading[post.id]}
                                                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-[#FA6E80] hover:bg-[#FA6E80]/10 transition-colors disabled:opacity-50 border border-gray-200"
                                                title={savedCollabs.has(post.id) ? "Unsave" : "Save"}
                                            >
                                                {saveLoading[post.id] ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Heart className={`h-4 w-4 ${savedCollabs.has(post.id) ? 'fill-current' : ''}`} />
                                                )}
                                            </button>
                                            
                                            <ShareModal
                                                collabId={post.id}
                                                collabTitle={post.title}
                                                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-[#31A7AC] hover:bg-[#31A7AC]/10 transition-colors border border-gray-200"
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
                            </div>
                        </article>
                    ))}

                    {loading && (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-[#2FD3D8]" />
                        </div>
                    )}

                    {!loading && collabPosts.length === 0 && (
                        <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100">
                            <div className="max-w-md mx-auto">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No collabs found</h3>
                                <p className="text-sm">Be the first to create a collaboration project!</p>
                            </div>
                        </div>
                    )}

                    {/* Infinite scroll trigger */}
                    {hasMore && <div ref={loadMoreRef} className="h-10" />}
                </section>
            </div>
        </div>
    );
}