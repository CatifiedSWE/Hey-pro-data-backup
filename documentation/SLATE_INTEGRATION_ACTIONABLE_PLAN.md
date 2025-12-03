# Slate Post Integration - Actionable Plan

**Feature:** Integrate backend APIs with frontend Slate Post feature (Instagram-like social posts)  
**Status:** 🔄 Ready for Implementation  
**Created:** January 2025  
**Priority:** HIGH

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Gap Analysis](#gap-analysis)
4. [Integration Roadmap](#integration-roadmap)
5. [Phase 1: Feed Integration](#phase-1-feed-integration)
6. [Phase 2: Post Interactions](#phase-2-post-interactions)
7. [Phase 3: Comments System](#phase-3-comments-system)
8. [Phase 4: Saved Posts](#phase-4-saved-posts)
9. [Phase 5: Profile Integration](#phase-5-profile-integration)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Checklist](#deployment-checklist)

---

## 📊 Executive Summary

### What We Have
- ✅ **Backend Database**: 6 tables fully implemented (slate_posts, slate_media, slate_likes, slate_comments, slate_shares, slate_saved)
- ✅ **Backend APIs**: 11 REST endpoints fully implemented and documented
- ✅ **Frontend UI**: Complete UI components with hardcoded data
- ✅ **Create Post Dialog**: Fully functional CreateSlateDialog component

### What We Need
- ❌ **API Integration**: Connect frontend to backend APIs
- ❌ **State Management**: Handle loading, errors, optimistic updates
- ❌ **Real-time Updates**: Sync engagement actions (likes, comments, shares)
- ❌ **Pagination**: Implement infinite scroll for feed
- ❌ **Error Handling**: User-friendly error messages and retry logic

### Estimated Effort
- **Phase 1 (Feed)**: 4-6 hours
- **Phase 2 (Interactions)**: 6-8 hours
- **Phase 3 (Comments)**: 4-5 hours
- **Phase 4 (Saved)**: 2-3 hours
- **Phase 5 (Profile)**: 3-4 hours
- **Testing**: 4-6 hours
- **Total**: 23-32 hours (3-4 working days)

---

## 🔍 Current State Analysis

### Backend (✅ Complete)

**Database Tables:**
```
slate_posts          - Main posts table (id, user_id, content, status, likes_count, etc.)
slate_media          - Media attachments (images/videos)
slate_likes          - Like tracking with UNIQUE constraint
slate_comments       - Comments with nested replies support
slate_shares         - Share tracking
slate_saved          - Bookmarked posts
```

**API Endpoints (11 total):**
```
✅ POST   /api/slate                      - Create post
✅ GET    /api/slate                      - Get feed (paginated)
✅ GET    /api/slate/my                   - User's posts
✅ GET    /api/slate/saved                - Saved posts
✅ GET    /api/slate/[id]                 - Post details
✅ PATCH  /api/slate/[id]                 - Update post
✅ DELETE /api/slate/[id]                 - Delete post
✅ POST   /api/slate/[id]/like            - Like post
✅ DELETE /api/slate/[id]/like            - Unlike post
✅ GET    /api/slate/[id]/likes           - Get who liked
✅ POST   /api/slate/[id]/comment         - Add comment
✅ GET    /api/slate/[id]/comment         - Get comments
✅ PATCH  /api/slate/comment/[id]         - Edit comment
✅ DELETE /api/slate/comment/[id]         - Delete comment
✅ POST   /api/slate/[id]/share           - Share post
✅ DELETE /api/slate/[id]/share           - Unshare
✅ POST   /api/slate/[id]/save            - Save post
✅ DELETE /api/slate/[id]/save            - Unsave post
✅ POST   /api/upload/slate-media         - Upload media
✅ GET    /api/slate/recommendations      - Get profile recommendations
```

### Frontend (⚠️ Hardcoded Data)

**Files:**
- `/app/(app)/(slate-group)/slate/page.tsx` - Feed page with 4 hardcoded posts
- `/app/(app)/(slate-group)/template.tsx` - Sidebar layout
- `/components/modules/slate/CreateSlateDialog.tsx` - ✅ Already integrated with API

**Hardcoded Data:**
```typescript
// page.tsx
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
    description: "Lorem ipsum..."
  },
  // ... 3 more static posts
]
```

---

## 🔴 Gap Analysis

### Critical Gaps

| Component | Current State | Required State | Priority |
|-----------|--------------|----------------|----------|
| Feed Data | Hardcoded 4 posts | Fetch from GET /api/slate | 🔴 HIGH |
| Like Button | Static display | POST/DELETE /api/slate/[id]/like | 🔴 HIGH |
| Comment Button | No action | Open modal → POST /api/slate/[id]/comment | 🔴 HIGH |
| Share Button | No action | POST /api/slate/[id]/share | 🟡 MEDIUM |
| Save Button | No action | POST /api/slate/[id]/save | 🟡 MEDIUM |
| Pagination | None | Infinite scroll | 🔴 HIGH |
| Real Profiles | Hardcoded | Fetch from /api/profile | 🟡 MEDIUM |
| User Roles | "15 Roles" | COUNT from user_roles table | 🟢 LOW |
| Error Handling | None | Toast notifications | 🔴 HIGH |
| Loading States | Basic skeleton | Comprehensive loaders | 🟡 MEDIUM |

---

## 🗺️ Integration Roadmap

### Phase Overview

```
Phase 1: Feed Integration (FOUNDATION)
   ├─ Replace hardcoded data with API calls
   ├─ Implement pagination
   └─ Add loading & error states

Phase 2: Post Interactions (CORE FEATURES)
   ├─ Like/Unlike functionality
   ├─ Share functionality
   └─ Optimistic UI updates

Phase 3: Comments System (ENGAGEMENT)
   ├─ Comments modal
   ├─ Add/edit/delete comments
   └─ Nested replies support

Phase 4: Saved Posts (BOOKMARKING)
   ├─ Save/unsave functionality
   ├─ Saved posts page
   └─ Visual indicators

Phase 5: Profile Integration (POLISH)
   ├─ Real profile data in sidebar
   ├─ Dynamic role counts
   └─ Profile recommendations
```

---

## 🚀 Phase 1: Feed Integration

**Goal:** Replace hardcoded posts with real data from backend API

**Duration:** 4-6 hours

### 1.1 Create API Service Layer

**File:** `/app/lib/api/slate.ts`

```typescript
// /app/lib/api/slate.ts
import { supabase } from '@/lib/supabase/client';

export interface SlatePost {
  id: string;
  content: string;
  slug?: string;
  status: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  media: Array<{
    id: string;
    media_url: string;
    media_type: 'image' | 'video';
    sort_order: number;
  }>;
  user_has_liked: boolean;
  user_has_saved: boolean;
}

export interface FeedResponse {
  success: boolean;
  data: {
    posts: SlatePost[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  };
  message: string;
}

/**
 * Fetch slate feed with pagination
 */
export async function fetchSlateFeed(
  page: number = 1,
  limit: number = 20,
  sort: 'latest' | 'popular' = 'latest'
): Promise<FeedResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort,
  });

  const response = await fetch(`/api/slate?${params}`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch slate feed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Like a post
 */
export async function likePost(postId: string): Promise<{ likes_count: number }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Authentication required');

  const response = await fetch(`/api/slate/${postId}/like`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to like post');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Unlike a post
 */
export async function unlikePost(postId: string): Promise<{ likes_count: number }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Authentication required');

  const response = await fetch(`/api/slate/${postId}/like`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to unlike post');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Save a post
 */
export async function savePost(postId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Authentication required');

  const response = await fetch(`/api/slate/${postId}/save`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save post');
  }
}

/**
 * Unsave a post
 */
export async function unsavePost(postId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Authentication required');

  const response = await fetch(`/api/slate/${postId}/save`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to unsave post');
  }
}

/**
 * Share a post
 */
export async function sharePost(postId: string): Promise<{ shares_count: number }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Authentication required');

  const response = await fetch(`/api/slate/${postId}/share`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to share post');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Add a comment to a post
 */
export async function addComment(
  postId: string,
  content: string,
  parentCommentId?: string
): Promise<any> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Authentication required');

  const response = await fetch(`/api/slate/${postId}/comment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      content,
      parent_comment_id: parentCommentId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add comment');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get comments for a post
 */
export async function getComments(postId: string): Promise<any[]> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api/slate/${postId}/comment`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }

  const result = await response.json();
  return result.data.comments || [];
}
```

### 1.2 Update Feed Page Component

**File:** `/app/(app)/(slate-group)/slate/page.tsx`

**Changes Required:**

```typescript
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
import { useInView } from 'react-intersection-observer'; // Install: npm install react-intersection-observer

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
    const firstMedia = post.media && post.media.length > 0 ? post.media[0] : null;

    return (
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
                    <button className="transition-colors">
                        <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />
                    </button>
                    <button 
                        onClick={() => onShare(post.id)}
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
                    className="text-[12px] md:text-[15px] text-gray-500 hover:text-gray-700"
                >
                    {isExpanded ? 'Show Less' : 'Show More'}
                </button>
            )}
        </div>
    );
}
```

### 1.3 Install Dependencies

```bash
npm install react-intersection-observer sonner
# or
yarn add react-intersection-observer sonner
```

### 1.4 Update CreateSlateDialog (Minor Fix)

**File:** `/app/components/modules/slate/CreateSlateDialog.tsx`

**Line 154:** Change `window.location.reload()` to emit event or use router:

```typescript
// Instead of: window.location.reload();
// Use:
router.push('/slate'); // If router is imported from next/navigation
// OR emit custom event that parent component listens to
```

### 1.5 Testing Checklist

- [ ] Feed loads with real posts from database
- [ ] Loading skeleton shows during initial load
- [ ] Infinite scroll loads more posts when scrolling down
- [ ] Empty state shows when no posts exist
- [ ] Posts display correctly with author info
- [ ] Media (images/videos) display correctly
- [ ] Like count displays correctly
- [ ] Comments count displays correctly

---

## ⚡ Phase 2: Post Interactions

**Goal:** Implement like, share, and save functionality with optimistic UI updates

**Duration:** 6-8 hours

### 2.1 Like Button (✅ Already implemented in Phase 1)

**Features:**
- ✅ Click to like/unlike
- ✅ Visual feedback (filled heart when liked)
- ✅ Optimistic UI update
- ✅ Error handling with rollback
- ✅ Like count updates

### 2.2 Share Button Implementation

**Features:**
- Share post (increment share count)
- Copy link to clipboard
- Share to social media (optional)

**File:** Update `SlateCard` component with share modal

```typescript
// Add to SlateCard component
const [showShareModal, setShowShareModal] = useState(false);

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

// In JSX, replace share button:
<button 
  onClick={handleShareClick}
  className="transition-colors relative"
>
  <Send className="h-6 w-6 md:h-7 md:w-7" />
</button>

{/* Share Modal */}
{showShareModal && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowShareModal(false)}>
    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
      <h3 className="text-lg font-semibold mb-4">Share this post</h3>
      <div className="space-y-3">
        <button 
          onClick={copyLink}
          className="w-full p-3 border rounded-lg hover:bg-gray-50 flex items-center gap-3"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy link
        </button>
      </div>
    </div>
  </div>
)}
```

### 2.3 Save Button (✅ Already implemented in Phase 1)

**Features:**
- ✅ Click to save/unsave
- ✅ Visual feedback (filled bookmark when saved)
- ✅ Optimistic UI update
- ✅ Toast notification
- ✅ Error handling with rollback

### 2.4 Testing Checklist

- [ ] Like button toggles correctly
- [ ] Like count updates immediately (optimistic)
- [ ] Like persists after page refresh
- [ ] Unlike works correctly
- [ ] Share modal opens
- [ ] Share count increments
- [ ] Copy link works
- [ ] Save button toggles correctly
- [ ] Saved posts persist
- [ ] Toast notifications show on errors
- [ ] Optimistic updates revert on error

---

## 💬 Phase 3: Comments System

**Goal:** Implement comments modal with add/view/edit/delete functionality

**Duration:** 4-5 hours

### 3.1 Create Comments Modal Component

**File:** `/app/components/modules/slate/CommentsModal.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Heart, Send, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { getComments, addComment } from "@/lib/api/slate";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  parent_comment_id: string | null;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
}

interface CommentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  postAuthor: {
    name: string;
    avatar: string;
  };
  postContent: string;
  commentsCount: number;
  onCommentAdded?: () => void;
}

export default function CommentsModal({
  open,
  onOpenChange,
  postId,
  postAuthor,
  postContent,
  commentsCount,
  onCommentAdded,
}: CommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadComments();
    }
  }, [open, postId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await getComments(postId);
      setComments(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const comment = await addComment(postId, newComment, replyingTo || undefined);
      setComments(prev => [...prev, comment]);
      setNewComment("");
      setReplyingTo(null);
      toast.success('Comment added');
      if (onCommentAdded) onCommentAdded();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>

        {/* Post Preview */}
        <div className="px-4 py-3 border-b bg-gray-50">
          <div className="flex items-start gap-3">
            <Image
              src={postAuthor.avatar || "/image (1).png"}
              alt={postAuthor.name}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold text-sm">{postAuthor.name}</p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{postContent}</p>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={() => setReplyingTo(comment.id)}
              />
            ))
          )}
        </div>

        {/* Comment Input */}
        <div className="p-4 border-t bg-white">
          {replyingTo && (
            <div className="mb-2 text-sm text-gray-600 flex items-center justify-between">
              <span>Replying to comment</span>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-blue-500 hover:text-blue-600"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 resize-none min-h-[40px] max-h-[120px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
            />
            <Button
              onClick={handleSubmitComment}
              disabled={submitting || !newComment.trim()}
              className="self-end"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to post, Shift + Enter for new line
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface CommentItemProps {
  comment: Comment;
  onReply: () => void;
}

function CommentItem({ comment, onReply }: CommentItemProps) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="flex gap-3">
      <Image
        src={comment.author.avatar || "/image (1).png"}
        alt={comment.author.name}
        width={32}
        height={32}
        className="rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1">
        <div className="bg-gray-100 rounded-2xl px-4 py-2">
          <p className="font-semibold text-sm">{comment.author.name}</p>
          <p className="text-sm mt-1">{comment.content}</p>
        </div>
        <div className="flex items-center gap-4 mt-1 px-4 text-xs text-gray-500">
          <span>{new Date(comment.created_at).toLocaleDateString()}</span>
          <button
            onClick={() => setLiked(!liked)}
            className={`font-semibold ${liked ? 'text-red-500' : ''}`}
          >
            Like
          </button>
          <button onClick={onReply} className="font-semibold">
            Reply
          </button>
          <button>
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 3.2 Integrate Comments Modal in SlateCard

**File:** `/app/(app)/(slate-group)/slate/page.tsx`

**Add to SlateCard:**

```typescript
import CommentsModal from "@/components/modules/slate/CommentsModal";

function SlateCard({ post, onLike, onSave, onShare }: SlateCardProps) {
    const [showComments, setShowComments] = useState(false);
    
    const handleCommentAdded = () => {
        // Optionally refetch post or update count
        // For now, just close modal
        setShowComments(false);
    };

    // ... existing code ...

    // Update comment button:
    <button 
        onClick={() => setShowComments(true)}
        className="transition-colors"
    >
        <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />
    </button>

    // Add modal at end of component:
    <CommentsModal
        open={showComments}
        onOpenChange={setShowComments}
        postId={post.id}
        postAuthor={post.author}
        postContent={post.content}
        commentsCount={post.comments_count}
        onCommentAdded={handleCommentAdded}
    />
}
```

### 3.3 Testing Checklist

- [ ] Comments modal opens when clicking comment button
- [ ] Existing comments load correctly
- [ ] Loading state shows while fetching
- [ ] Empty state shows when no comments
- [ ] Add comment works
- [ ] Comment appears immediately after adding
- [ ] Reply to comment opens reply input
- [ ] Character limit enforced
- [ ] Enter key submits comment
- [ ] Shift+Enter adds new line
- [ ] Error handling for failed submissions

---

## 🔖 Phase 4: Saved Posts

**Goal:** Create saved posts page and integrate save functionality

**Duration:** 2-3 hours

### 4.1 Create Saved Posts Page

**File:** `/app/(app)/(slate-group)/slate/saved/page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { SlatePost } from "@/lib/api/slate";
import Image from "next/image";
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";

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
```

### 4.2 Update Sidebar Link

**File:** `/app/(app)/(slate-group)/template.tsx`

**Line 238:** Update saved link to point to correct route:

```typescript
{
  id: '2',
  name: "Saved",
  icon: <BookmarkIcon />,
  link: "/slate/saved"  // Change from "/profile/johndoe/saved"
}
```

### 4.3 Testing Checklist

- [ ] Saved posts page loads correctly
- [ ] Saved posts display in grid layout
- [ ] Empty state shows when no saved posts
- [ ] Unsave button removes post from list
- [ ] Media thumbnails display correctly
- [ ] Post stats (likes, comments) display correctly
- [ ] Navigation from sidebar works

---

## 👤 Phase 5: Profile Integration

**Goal:** Replace hardcoded profile data with real data from backend

**Duration:** 3-4 hours

### 5.1 Fetch User Roles Count

**Add to API service layer:**

```typescript
// /app/lib/api/profile.ts (create new file or add to existing)
export async function getUserRolesCount(userId: string): Promise<number> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api/profile/roles?userId=${userId}`, {
    headers,
    cache: 'no-store',
  });

  if (!response.ok) throw new Error('Failed to fetch roles');

  const result = await response.json();
  return result.data?.length || 0;
}
```

### 5.2 Update Template Sidebar

**File:** `/app/(app)/(slate-group)/template.tsx`

**Already using real profile data from useProfile hook! ✅**

The template is already integrated with real profile data. Just verify:

- ✅ Using `useProfile()` hook for profile data
- ✅ Displaying real avatar and banner
- ✅ Showing real name and bio
- ✅ Fetching referrals from `/api/referrals`
- ✅ Fetching recommendations from `/api/slate/recommendations`

**Only improvement needed:** Display actual roles count instead of hardcoded "15 Roles"

Add this to the similar accounts mapping in template.tsx (line 189):

```typescript
// Replace:
totlerole: profile.totalRoles

// With actual count from user_roles table (if available in API response)
// Or keep as is if totalRoles is already computed by API
```

### 5.3 Testing Checklist

- [ ] Profile sidebar shows real user data
- [ ] Avatar and banner display correctly
- [ ] Bio displays correctly
- [ ] Referrals count is accurate
- [ ] Profile recommendations load dynamically
- [ ] Roles count is dynamic (if updated)
- [ ] All sidebar links work

---

## 🧪 Testing Strategy

### Unit Testing

**Tools:** Jest + React Testing Library

**Priority Tests:**
1. API service functions (slate.ts)
2. SlateCard component interactions
3. CommentsModal functionality
4. Optimistic updates rollback

**Example test:**

```typescript
// __tests__/slate/likePost.test.ts
import { likePost, unlikePost } from '@/lib/api/slate';

describe('Like functionality', () => {
  it('should like a post successfully', async () => {
    const result = await likePost('test-post-id');
    expect(result.likes_count).toBeGreaterThan(0);
  });

  it('should handle authentication errors', async () => {
    // Mock unauthenticated session
    await expect(likePost('test-post-id')).rejects.toThrow('Authentication required');
  });
});
```

### Integration Testing

**Tools:** Playwright or Cypress

**Critical Flows:**
1. ✅ User can view feed
2. ✅ User can create a post
3. ✅ User can like/unlike a post
4. ✅ User can comment on a post
5. ✅ User can save/unsave a post
6. ✅ Infinite scroll loads more posts
7. ✅ Saved posts page displays correctly

### Manual Testing Checklist

**Feed Page:**
- [ ] Posts load on initial page load
- [ ] Skeleton loaders show during loading
- [ ] Empty state shows when no posts
- [ ] Infinite scroll works
- [ ] Posts display correctly (author, media, content, stats)
- [ ] Loading more indicator shows at bottom
- [ ] "End of feed" message shows when appropriate

**Interactions:**
- [ ] Like button toggles correctly
- [ ] Unlike button works
- [ ] Like count updates immediately
- [ ] Save button toggles correctly
- [ ] Bookmark icon fills when saved
- [ ] Share modal opens and works
- [ ] Comments modal opens
- [ ] Comments load correctly
- [ ] Add comment works
- [ ] Reply to comment works

**Create Post:**
- [ ] Dialog opens on "Create Slate" click
- [ ] Media upload works
- [ ] Image preview displays
- [ ] Video preview displays
- [ ] Post submission works
- [ ] Feed updates after creating post
- [ ] Tags and location append to content

**Saved Posts:**
- [ ] Saved posts page loads
- [ ] Grid layout displays correctly
- [ ] Unsave removes post from list
- [ ] Empty state shows appropriately

**Error Handling:**
- [ ] Toast shows on API errors
- [ ] Optimistic updates revert on error
- [ ] Auth errors redirect to login
- [ ] Network errors show user-friendly messages

**Performance:**
- [ ] Initial load < 2 seconds
- [ ] Infinite scroll smooth (no jank)
- [ ] Images lazy load
- [ ] No memory leaks on long scrolling

---

## 📦 Deployment Checklist

### Pre-Deployment

- [ ] All API endpoints tested and working
- [ ] Database tables verified in production
- [ ] RLS policies tested
- [ ] Storage bucket configured
- [ ] Environment variables set
- [ ] Error logging configured (Sentry/LogRocket)

### Code Quality

- [ ] ESLint passes with no errors
- [ ] TypeScript compilation successful
- [ ] No console.log statements in production code
- [ ] Code reviewed by team member
- [ ] All TODOs addressed or documented

### Performance

- [ ] Images optimized (< 200KB each)
- [ ] Videos compressed
- [ ] Lazy loading implemented
- [ ] Bundle size optimized (< 500KB)
- [ ] Lighthouse score > 85

### Security

- [ ] Authentication enforced on all protected routes
- [ ] RLS policies prevent unauthorized access
- [ ] Input sanitization in place
- [ ] CORS configured correctly
- [ ] Rate limiting implemented (if needed)

### Monitoring

- [ ] Error tracking setup (Sentry)
- [ ] Analytics tracking (Google Analytics/Mixpanel)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] API response time monitoring

### Post-Deployment

- [ ] Smoke tests passed
- [ ] User acceptance testing completed
- [ ] Documentation updated
- [ ] Team trained on new features
- [ ] Support team briefed on common issues

---

## 🚨 Common Issues & Solutions

### Issue 1: Infinite Scroll Not Triggering

**Symptoms:** More posts don't load when scrolling to bottom

**Solution:**
```typescript
// Check if IntersectionObserver is supported
if (!('IntersectionObserver' in window)) {
  console.warn('IntersectionObserver not supported, falling back to scroll listener');
  // Implement fallback
}

// Ensure ref is attached to trigger element
<div ref={ref} className="py-4">
  {loadingMore && <SlateSkeleton />}
</div>
```

### Issue 2: Optimistic Updates Not Reverting

**Symptoms:** Like count stays incorrect after failed API call

**Solution:**
```typescript
// Store previous state before optimistic update
const previousPosts = [...posts];

try {
  // ... API call
} catch (error) {
  // Revert to previous state
  setPosts(previousPosts);
  toast.error('Action failed');
}
```

### Issue 3: Comments Not Updating Count

**Symptoms:** Comment count doesn't increase after adding comment

**Solution:**
```typescript
// After successful comment addition:
setPosts(prev => prev.map(post => {
  if (post.id === postId) {
    return { ...post, comments_count: post.comments_count + 1 };
  }
  return post;
}));
```

### Issue 4: Media Upload Fails

**Symptoms:** "Failed to upload media" error

**Solution:**
1. Check file size < 10MB
2. Verify Supabase storage bucket exists
3. Confirm bucket permissions (authenticated users can upload)
4. Check allowed MIME types in bucket configuration

### Issue 5: Auth Token Expired

**Symptoms:** 401 errors after some time

**Solution:**
```typescript
// Implement token refresh
const { data: { session }, error } = await supabase.auth.getSession();
if (error || !session) {
  await supabase.auth.refreshSession();
  // Retry request
}
```

---

## 📝 Next Steps After Integration

### Enhancements (Optional)

1. **Notifications System**
   - Notify users when someone likes/comments on their post
   - Real-time updates using Supabase Realtime

2. **Post Details Page**
   - Dedicated page for each post (`/slate/[slug]`)
   - Shareable links
   - SEO metadata

3. **Edit Post**
   - Allow users to edit their posts
   - Show edit history

4. **Delete Post**
   - Add delete option in post menu
   - Confirmation dialog

5. **Report Post**
   - Allow users to report inappropriate content
   - Admin moderation dashboard

6. **Hashtag Support**
   - Extract hashtags from content
   - Create hashtag pages
   - Trending hashtags section

7. **Mentions**
   - @mention other users in posts/comments
   - Link to user profiles

8. **Stories/Reels**
   - Temporary posts (24-hour expiry)
   - Video-first format

### Analytics to Track

- Daily active users
- Posts created per day
- Engagement rate (likes, comments, shares)
- Average time on feed
- Most liked posts
- Most active users
- Retention rate

---

## 📖 Documentation Updates Needed

After integration is complete, update:

1. **README.md** - Add slate feature overview
2. **API_DOC.md** - Verify all endpoints documented
3. **USER_GUIDE.md** - Create user-facing documentation
4. **TROUBLESHOOTING.md** - Document common issues
5. **CHANGELOG.md** - Log all changes made

---

## ✅ Definition of Done

The integration is complete when:

- [ ] All 5 phases implemented
- [ ] All testing checklists passed
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Deployed to staging environment
- [ ] User acceptance testing completed
- [ ] Deployed to production
- [ ] Monitoring and analytics configured
- [ ] Team trained on new features
- [ ] Support documentation provided

---

## 📞 Support & Resources

**Internal Resources:**
- Backend Architecture: `/documentation/backend-documentation-and-commands/UPDATED_BACKEND_ARCHITECTURE.md`
- API Documentation: `/documentation/API-Docs/API_DOC.md`
- Slate SQL Scripts: `/documentation/backend-documentation-and-commands/slate-group/`

**External Resources:**
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- React Query (for data fetching): https://tanstack.com/query
- Intersection Observer API: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API

**Team Contacts:**
- Backend Lead: [Name]
- Frontend Lead: [Name]
- QA Lead: [Name]
- Product Manager: [Name]

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Ready for Implementation  
**Estimated Completion:** 3-4 working days

---

## 🎯 Summary

This actionable plan provides a comprehensive, step-by-step guide to integrate the backend slate post APIs with the frontend UI. By following this plan phase by phase, you will transform the hardcoded prototype into a fully functional, Instagram-like social posts feature with:

- ✅ Real-time data fetching
- ✅ Interactive like, comment, share, save functionality
- ✅ Infinite scroll pagination
- ✅ Optimistic UI updates
- ✅ Comprehensive error handling
- ✅ Profile integration
- ✅ Production-ready code

Each phase is designed to be independently testable and deliverable, allowing for incremental progress and early feedback.

**Ready to start? Begin with Phase 1: Feed Integration! 🚀**
