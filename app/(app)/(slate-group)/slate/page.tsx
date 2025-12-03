"use client";
import { Separator } from "@/components/ui/separator";
import { Ellipsis, Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { fetchSlateFeed, likePost, unlikePost, savePost, unsavePost, sharePost, SlatePost } from "@/lib/api/slate";
import { useInView } from 'react-intersection-observer';
import CommentsModal from "@/components/modules/slate/CommentsModal";

export default function SlatePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<SlatePost[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const { ref, inView } = useInView();

    // Auth check
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            const token = session.access_token;
            
            const checkProfileWithRetry = async (retries = 3, delay = 1000): Promise<boolean> => {
                for (let attempt = 1; attempt <= retries; attempt++) {
                    try {
                        const response = await fetch('/api/profile', {
                            headers: { 'Authorization': `Bearer ${token}` },
                            cache: 'no-store'
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
                // Load initial posts
                loadPosts();
            } catch (error) {
                router.push('/login');
            }
        };
        checkAuth();
    }, [router]);

    // Load posts
    const loadPosts = async (pageNum: number = 1) => {
        try {
            if (pageNum === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await fetchSlateFeed(pageNum, 20, 'latest');
            
            if (pageNum === 1) {
                setPosts(response.data.posts);
            } else {
                setPosts(prev => [...prev, ...response.data.posts]);
            }
            
            setHasMore(response.data.pagination.hasMore);
            setPage(pageNum);
        } catch (error: any) {
            console.error('Failed to load posts:', error);
            toast.error(error.message || 'Failed to load posts');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Infinite scroll
    useEffect(() => {
        if (inView && hasMore && !loadingMore && !loading) {
            loadPosts(page + 1);
        }
    }, [inView, hasMore, loadingMore, loading, page]);

    // Like handler with optimistic update
    const handleLike = useCallback(async (postId: string, currentlyLiked: boolean) => {
        // Optimistic update
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
            // Revert on error
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
        // Optimistic update
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
            // Revert on error
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
            <div className="space-y-6 mt-4">
                {[1, 2, 3].map((i) => (
                    <SlateSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="mt-10 text-center">
                <p className="text-gray-500">No posts yet. Be the first to create a slate!</p>
            </div>
        );
    }

    return (
        <div className="mt-3">
            <div>
                {posts.map((post) => (
                    <div key={post.id} className="mb-4">
                        <SlateCard
                            post={post}
                            onLike={handleLike}
                            onSave={handleSave}
                            onShare={handleShare}
                        />
                    </div>
                ))}
            </div>
            
            {/* Infinite scroll trigger */}
            {hasMore && (
                <div ref={ref} className="py-4">
                    {loadingMore && <SlateSkeleton />}
                </div>
            )}
            
            {!hasMore && posts.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p>You've reached the end</p>
                </div>
            )}
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

interface SlateCardProps {
    post: SlatePost;
    onLike: (postId: string, currentlyLiked: boolean) => void;
    onSave: (postId: string, currentlySaved: boolean) => void;
    onShare: (postId: string) => void;
}

function SlateCard({ post, onLike, onSave, onShare }: SlateCardProps) {
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
        // Optionally refetch post or update count
        // For now, just close modal
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

        <div className="border-gray-300 rounded-lg p-4 md:p-7 bg-white">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center mb-4">
                    <Image
                        src={post.author.avatar || "/image (1).png"}
                        alt={post.author.name}
                        height={100}
                        width={100}
                        className="w-11 h-11 rounded-full mr-4 object-cover"
                    />
                    <div>
                        <h2 className="text-lg font-semibold">{post.author.name}</h2>
                        <p className="text-sm text-gray-600">
                            {new Date(post.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div>
                    <Ellipsis className="h-6 w-6 md:h-7 md:w-7 cursor-pointer" />
                </div>
            </div>
            
            {firstMedia && (
                <div>
                    {firstMedia.media_type === 'image' ? (
                        <Image
                            src={firstMedia.media_url}
                            alt="Post media"
                            height={520}
                            width={520}
                            className="w-full max-h-[520px] object-cover rounded-lg mb-4"
                        />
                    ) : (
                        <video
                            src={firstMedia.media_url}
                            controls
                            className="w-full max-h-[520px] rounded-lg mb-4"
                        />
                    )}
                </div>
            )}
            
            <div className="flex items-center justify-between mb-4">
                <div className="flex flex-row gap-3.5 justify-start">
                    <button 
                        onClick={() => onLike(post.id, post.user_has_liked)}
                        className="transition-colors"
                    >
                        <Heart 
                            className={`h-6 w-6 md:h-7 md:w-7 ${
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
                        <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />
                    </button>
                    <button 
                        onClick={handleShareClick}
                        className="transition-colors"
                    >
                        <Send className="h-6 w-6 md:h-7 md:w-7" />
                    </button>
                </div>
                <div>
                    <button 
                        onClick={() => onSave(post.id, post.user_has_saved)}
                        className="transition-colors"
                    >
                        <Bookmark 
                            className={`h-6 w-6 md:h-7 md:w-7 ${
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
                <button className="text-sm text-gray-500 mb-4">
                    View all {post.comments_count} comments
                </button>
            )}
            
            <Separator className="" />
        </div>

        {/* Comments Modal */}
        <CommentsModal
            open={showComments}
            onOpenChange={setShowComments}
            postId={post.id}
            postAuthor={post.author}
            postContent={post.content}
            commentsCount={post.comments_count}
            onCommentAdded={handleCommentAdded}
        />
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
