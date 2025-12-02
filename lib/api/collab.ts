import { supabase } from '@/lib/supabase/client';

// Types
export type CollabPost = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  cover_image_url: string | null;
  status: 'open' | 'closed' | 'draft';
  interests: number;
  interestAvatars: string[];
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  created_at: string;
  updated_at: string;
  userHasInterest?: boolean;
  userHasSaved?: boolean;
  isOwner?: boolean;
};

export type CollabDetail = CollabPost & {
  author: {
    id: string;
    name: string;
    avatar: string;
    bio: string;
  };
  collaborators?: Array<{
    id: string;
    name: string;
    avatar: string;
    role: string;
    department: string;
    added_at: string;
  }>;
};

export type CreateCollabData = {
  title: string;
  summary: string;
  tags?: string[];
  cover_image_url?: string;
  status?: 'open' | 'closed' | 'draft';
};

export type UpdateCollabData = Partial<CreateCollabData>;

export type PaginationResponse = {
  collabs: CollabPost[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCollabs: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

// Helper function to get auth token
async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// API Functions

/**
 * Get all collab posts (public feed)
 */
export async function getCollabs(params?: {
  page?: number;
  limit?: number;
  status?: 'all' | 'open' | 'closed';
  tag?: string;
  search?: string;
  sortBy?: 'created_at' | 'interests';
  sortOrder?: 'asc' | 'desc';
}): Promise<PaginationResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.status) searchParams.set('status', params.status);
  if (params?.tag) searchParams.set('tag', params.tag);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const response = await fetch(`/api/collab?${searchParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch collabs');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get user's collab posts
 */
export async function getMyCollabs(params?: {
  page?: number;
  limit?: number;
  status?: 'all' | 'open' | 'closed' | 'draft';
}): Promise<PaginationResponse> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.status) searchParams.set('status', params.status);

  const response = await fetch(`/api/collab/my?${searchParams.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch your collabs');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get specific collab post details
 */
export async function getCollabById(id: string): Promise<CollabDetail> {
  const token = await getAuthToken();
  
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api/collab/${id}`, { headers });

  if (!response.ok) {
    throw new Error('Failed to fetch collab details');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Create a new collab post
 */
export async function createCollab(data: CreateCollabData): Promise<CollabPost> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch('/api/collab', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create collab');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Update collab post
 */
export async function updateCollab(id: string, data: UpdateCollabData): Promise<CollabPost> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`/api/collab/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update collab');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Delete collab post
 */
export async function deleteCollab(id: string): Promise<void> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`/api/collab/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete collab');
  }
}

/**
 * Express interest in a collab
 */
export async function expressInterest(collabId: string): Promise<{ totalInterests: number }> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`/api/collab/${collabId}/interest`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to express interest');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Remove interest from a collab
 */
export async function removeInterest(collabId: string): Promise<{ totalInterests: number }> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`/api/collab/${collabId}/interest`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove interest');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Upload collab cover image
 */
export async function uploadCollabCover(file: File, collabId?: string): Promise<{ url: string }> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const formData = new FormData();
  formData.append('file', file);
  if (collabId) {
    formData.append('collab_id', collabId);
  }

  const response = await fetch('/api/upload/collab-cover', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload cover image');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Close a collab post
 */
export async function closeCollab(id: string): Promise<void> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`/api/collab/${id}/close`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to close collab');
  }
}

/**
 * Get users interested in a collab (owner only)
 */
export async function getInterestedUsers(collabId: string, params?: {
  page?: number;
  limit?: number;
}): Promise<any> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const response = await fetch(`/api/collab/${collabId}/interests?${searchParams.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch interested users');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Save/bookmark a collab post
 */
export async function saveCollab(collabId: string): Promise<{ totalSaves: number }> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`/api/collab/${collabId}/save`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save collab');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Remove save/bookmark from a collab post
 */
export async function unsaveCollab(collabId: string): Promise<{ totalSaves: number }> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`/api/collab/${collabId}/save`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to unsave collab');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Share a collab post
 */
export async function shareCollab(
  collabId: string, 
  shareType: 'link' | 'twitter' | 'linkedin' | 'facebook'
): Promise<{ totalShares: number }> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`/api/collab/${collabId}/share`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ share_type: shareType })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to share collab');
  }

  const result = await response.json();
  return result.data;
}

// Comment types
export type Comment = {
  id: string;
  collab_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  user: {
    name: string;
    avatar: string;
  };
  replies: Comment[];
};

/**
 * Get comments for a collab post
 */
export async function getComments(collabId: string): Promise<{ comments: Comment[]; totalComments: number }> {
  const response = await fetch(`/api/collab/${collabId}/comments`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch comments');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Add a comment or reply
 */
export async function addComment(
  collabId: string, 
  content: string, 
  parentId?: string
): Promise<Comment> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`/api/collab/${collabId}/comments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content, parent_id: parentId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add comment');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Delete a comment
 */
export async function deleteComment(collabId: string, commentId: string): Promise<void> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`/api/collab/${collabId}/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete comment');
  }
}
