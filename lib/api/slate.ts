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
