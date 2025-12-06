import { supabase } from '@/lib/supabase/client';

// Helper function to get auth token
async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * Save/bookmark a user profile
 */
export async function saveProfile(profileUserId: string): Promise<{ totalSaves: number }> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`/api/profile/${profileUserId}/save`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save profile');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Remove save/bookmark from a user profile
 */
export async function unsaveProfile(profileUserId: string): Promise<{ totalSaves: number }> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`/api/profile/${profileUserId}/save`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to unsave profile');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Check if a profile is saved by the current user
 */
export async function checkProfileSaved(profileUserId: string): Promise<boolean> {
  const token = await getAuthToken();
  if (!token) {
    return false;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('profile_saves')
      .select('id')
      .eq('profile_user_id', profileUserId)
      .eq('user_id', user.id)
      .single();

    return !!data && !error;
  } catch (error) {
    return false;
  }
}
