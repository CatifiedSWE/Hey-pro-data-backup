"use client";
import { Separator } from "@/components/ui/separator";
import { Ellipsis, Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { likePost, unlikePost, savePost, unsavePost, sharePost } from "@/lib/api/slate";
import CommentsModal from "@/components/modules/slate/CommentsModal";

interface SlatePost {
    id: string;
    content: string;
    slug?: string;
    status: string;
    likes_count: number;
    comments_count: number;
    shares_count: number;
    created_at: string;
    updated_at: string;
    media: Array<{
        id: string;
        media_url: string;
        media_type: 'image' | 'video';
        sort_order: number;
    }>;
    user_has_liked?: boolean;
    user_has_saved?: boolean;
}

interface Author {
    id: string;
    name: string;
    avatar: string;
    role?: string;
}

export default function SlateView() {
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<SlatePost[]>([]);
    const [author, setAuthor] = useState<Author | null>(null);

    useEffect(() => {
        loadUserSlates();
    }, []);

    const loadUserSlates = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error('Please login to view your slates');
                return;
            }

            const token = session.access_token;

            // Fetch user profile first
            const profileResponse = await fetch('/api/profile', {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store'
            });
            const profileData = await profileResponse.json();
            
            if (profileData.success && profileData.data) {
                setAuthor({
                    id: profileData.data.id,
                    name: profileData.data.name || 'User',
                    avatar: profileData.data.profile_photo || '/default-profile.png',
                    role: profileData.data.current_role
                });
            }

            // Fetch ONLY user's own uploaded slate posts (not all posts)
            // /api/slate/my endpoint filters by user_id automatically
            const response = await fetch('/api/slate/my?status=published', {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store'
            });

            const data = await response.json();
            
            if (data.success && data.data.posts) {
                setPosts(data.data.posts);
            } else {
                toast.error(data.error || 'Failed to load slate posts');
            }
        } catch (error: any) {
            console.error('Failed to load slate posts:', error);
            toast.error('Failed to load slate posts');
        } finally {
            setLoading(false);
        }
    };

    // Like handler
    const handleLike = useCallback(async (postId: string, currentlyLiked: boolean) => {
        setPosts(prev => prev.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    user_has_liked: !currentlyLiked,
                    likes_count: currentlyLiked ? post.likes_count - 1 : post.likes_count + 1
                };
            }
            return post;
        }));

        try {
            if (currentlyLiked) {
                await unlikePost(postId);
            } else {
                await likePost(postId);
            }
        } catch (error: any) {
            setPosts(prev => prev.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        user_has_liked: currentlyLiked,
                        likes_count: currentlyLiked ? post.likes_count + 1 : post.likes_count - 1
                    };
                }
                return post;
            }));
            toast.error(error.message || 'Failed to update like');
        }
    }, []);

    // Save handler
    const handleSave = useCallback(async (postId: string, currentlySaved: boolean) => {
        setPosts(prev => prev.map(post => {
            if (post.id === postId) {
                return { ...post, user_has_saved: !currentlySaved };
            }
            return post;
        }));

        try {
            if (currentlySaved) {
                await unsavePost(postId);
                toast.success('Post removed from saved');
            } else {
                await savePost(postId);
                toast.success('Post saved');
            }
        } catch (error: any) {
            setPosts(prev => prev.map(post => {
                if (post.id === postId) {
                    return { ...post, user_has_saved: currentlySaved };
                }
                return post;
            }));
            toast.error(error.message || 'Failed to update save');
        }
    }, []);

    // Share handler
    const handleShare = useCallback(async (postId: string) => {
        try {
            const result = await sharePost(postId);
            setPosts(prev => prev.map(post => {
                if (post.id === postId) {
                    return { ...post, shares_count: result.shares_count };
                }
                return post;
            }));
            toast.success('Post shared');
        } catch (error: any) {
            toast.error(error.message || 'Failed to share post');
        }
    }, []);

    if (loading) {
        return (
            <div className="mt-3 space-y-6">
                {[1, 2, 3].map((i) => (
                    <SlateSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="mt-10 text-center">
                <p className="text-gray-500">No slate posts yet. Create your first slate!</p>
            </div>
        );
    }

    return (
        <div className="mt-3 space-y-6">
            {posts.map((post) => (
                <SlateCard
                    key={post.id}
                    post={post}
                    author={author}
                    onLike={handleLike}
                    onSave={handleSave}
                    onShare={handleShare}
                />
            ))}
        </div>
    );
}

function SlateSkeleton() {
    return (
        <div className="w-full bg-white rounded-xl p-4 sm:p-6 space-y-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-11 w-11 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
                <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <Skeleton className="h-[400px] w-full rounded-3xl" />
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

interface SlateCardProps {
    post: SlatePost;
    author: Author | null;
    onLike: (postId: string, currentlyLiked: boolean) => void;
    onSave: (postId: string, currentlySaved: boolean) => void;
    onShare: (postId: string) => void;
}

function SlateCard({ post, author, onLike, onSave, onShare }: SlateCardProps) {
    const [showShareModal, setShowShareModal] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const firstMedia = post.media && post.media.length > 0 ? post.media[0] : null;

    const handleShareClick = () => {
        setShowShareModal(true);
        onShare(post.id);
    };

    const copyLink = () => {
        const link = `${window.location.origin}/slate/${post.slug || post.id}`;
        navigator.clipboard.writeText(link);
        toast.success('Link copied to clipboard');
        setShowShareModal(false);
    };

    const handleCommentAdded = () => {
        setShowComments(false);
    };

    return (
        <>
            {/* Share Modal */}
            {showShareModal && (
                <div 
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" 
                    onClick={() => setShowShareModal(false)}
                >
                    <div 
                        className="bg-white rounded-lg p-6 max-w-sm w-full mx-4" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold mb-4">Share this post</h3>
                        <div className="space-y-3">
                            <button 
                                onClick={copyLink}
                                className="w-full p-3 border rounded-lg hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy link
                            </button>
                            <button 
                                onClick={() => setShowShareModal(false)}
                                className="w-full p-3 border rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-[600px] rounded-3xl bg-white p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center">
                        <div className="relative w-11 h-11 mr-4">
                            <Image
                                src={author?.avatar || "/default-profile.png"}
                                alt={author?.name || "User"}
                                fill
                                sizes="44px"
                                className="rounded-full object-cover"
                            />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-semibold">{author?.name || "User"}</h2>
                            <p className="text-xs sm:text-sm text-gray-600">
                                {new Date(post.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div>
                        <Ellipsis className="h-6 w-6 text-slate-500 cursor-pointer" />
                    </div>
                </div>

                {firstMedia && (
                    <div className="mb-4 sm:mb-5 overflow-hidden rounded-lg sm:rounded-3xl relative w-full h-[300px] sm:h-[400px]">
                        {firstMedia.media_type === 'image' ? (
                            <Image
                                src={firstMedia.media_url}
                                alt="Post media"
                                fill
                                sizes="(max-width: 768px) 100vw, 600px"
                                className="object-cover"
                            />
                        ) : (
                            <video
                                src={firstMedia.media_url}
                                controls
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-row gap-3 sm:gap-4 text-slate-600">
                        <button 
                            onClick={() => onLike(post.id, post.user_has_liked || false)}
                            className="transition-colors"
                        >
                            <Heart 
                                className={`h-6 w-6 ${
                                    post.user_has_liked 
                                        ? 'fill-red-500 text-red-500' 
                                        : 'text-gray-700'
                                }`} 
                            />
                        </button>
                        <button 
                            onClick={() => setShowComments(true)}
                            className="transition-colors"
                        >
                            <MessageCircle className="h-6 w-6" />
                        </button>
                        <button 
                            onClick={handleShareClick}
                            className="transition-colors"
                        >
                            <Send className="h-6 w-6" />
                        </button>
                    </div>
                    <div>
                        <button 
                            onClick={() => onSave(post.id, post.user_has_saved || false)}
                            className="transition-colors"
                        >
                            <Bookmark 
                                className={`h-6 w-6 ${
                                    post.user_has_saved 
                                        ? 'fill-gray-900 text-gray-900' 
                                        : 'text-gray-700'
                                }`} 
                            />
                        </button>
                    </div>
                </div>

                <div className="mb-2">
                    <p className="text-sm font-semibold">{post.likes_count.toLocaleString()} likes</p>
                </div>

                <DescriptionWithShowMore description={post.content} />

                {post.comments_count > 0 && (
                    <button 
                        onClick={() => setShowComments(true)}
                        className="text-xs sm:text-sm text-gray-500 mb-4"
                    >
                        View all {post.comments_count} comments
                    </button>
                )}

                <Separator />
            </div>

            {/* Comments Modal */}
            {author && (
                <CommentsModal
                    open={showComments}
                    onOpenChange={setShowComments}
                    postId={post.id}
                    postAuthor={{
                        id: author.id,
                        name: author.name,
                        avatar: author.avatar
                    }}
                    postContent={post.content}
                    commentsCount={post.comments_count}
                    onCommentAdded={handleCommentAdded}
                />
            )}
        </>
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
            <p className="text-gray-700 mb-1 text-[12px]">{displayedDescription}</p>
            {shouldTruncate && (
                <button
                    onClick={toggleExpand}
                    className="text-[12px]"
                >
                    {isExpanded ? 'Show Less' : 'Show More'}
                </button>
            )}
        </div>
    );
}
