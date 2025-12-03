"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { SlatePost } from "@/lib/api/slate";
import Image from "next/image";
import { Heart, MessageCircle, Bookmark } from "lucide-react";

export default function SavedPostsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<SlatePost[]>([]);

    useEffect(() => {
        loadSavedPosts();
    }, []);

    const loadSavedPosts = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }

            const response = await fetch('/api/slate/saved', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
                cache: 'no-store',
            });

            if (!response.ok) throw new Error('Failed to fetch saved posts');

            const result = await response.json();
            setPosts(result.data.posts || []);
        } catch (error: any) {
            console.error('Failed to load saved posts:', error);
            toast.error(error.message || 'Failed to load saved posts');
        } finally {
            setLoading(false);
        }
    };

    const handleUnsave = async (postId: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Authentication required');

            await fetch(`/api/slate/${postId}/save`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            setPosts(prev => prev.filter(post => post.id !== postId));
            toast.success('Post removed from saved');
        } catch (error: any) {
            toast.error(error.message || 'Failed to unsave post');
        }
    };

    if (loading) {
        return (
            <div className="mt-4 space-y-6">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-[400px] w-full" />
                ))}
            </div>
        );
    }

    return (
        <div className="mt-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent">
                    Saved Posts
                </h1>
                <p className="text-gray-600 mt-1">Posts you've bookmarked</p>
            </div>

            {posts.length === 0 ? (
                <div className="text-center py-12">
                    <Bookmark className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No saved posts</h3>
                    <p className="text-gray-500">Posts you save will appear here</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {posts.map((post) => (
                        <SavedPostCard
                            key={post.id}
                            post={post}
                            onUnsave={handleUnsave}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function SavedPostCard({ post, onUnsave }: { post: SlatePost; onUnsave: (id: string) => void }) {
    const firstMedia = post.media?.[0];

    return (
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
            {firstMedia && (
                <div className="relative h-48 bg-gray-100">
                    {firstMedia.media_type === 'image' ? (
                        <Image
                            src={firstMedia.media_url}
                            alt="Post media"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <video
                            src={firstMedia.media_url}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>
            )}
            <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Image
                        src={post.author.avatar || "/image (1).png"}
                        alt={post.author.name}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                    />
                    <p className="font-semibold text-sm">{post.author.name}</p>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3 mb-4">
                    {post.content}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {post.likes_count}
                        </span>
                        <span className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {post.comments_count}
                        </span>
                    </div>
                    <button
                        onClick={() => onUnsave(post.id)}
                        className="text-red-500 hover:text-red-600"
                    >
                        <Bookmark className="h-5 w-5 fill-current" />
                    </button>
                </div>
            </div>
        </div>
    );
}
