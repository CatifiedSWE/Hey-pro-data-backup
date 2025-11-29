import { useState, useEffect, useCallback } from 'react';
import apiCalling from '@/lib/apiCalling';
import { getAccessToken } from '@/lib/supabase/client';

export interface ProfileData {
  user_id: string;
  first_name?: string;
  surname?: string;
  alias_first_name?: string;
  alias_surname?: string;
  profile_photo_url?: string;
  banner_url?: string; // Changed from banner_photo_url
  bio?: string;
  country?: string;
  city?: string;
  email?: string;
  phone?: string;
  portfolio_url?: string;
  imdb_url?: string;
  day_rate?: number;
  day_rate_currency?: string;
  visible_in_explore?: boolean;
  is_profile_complete?: boolean;
  profile_completion_percentage?: number;
  created_at?: string;
  updated_at?: string;
}

export interface LinkData {
  id: string;
  user_id: string;
  label: string;
  url: string;
  sort_order: number;
}

export interface RecommendationData {
  id: string;
  user_id: string;
  recommender_name?: string;
  recommender_title?: string;
  recommender_photo_url?: string;
  recommendation_text?: string;
  created_at?: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiCalling({
        method: 'get',
        route: '/profile'
      });

      if (response.status && response.data?.data) {
        setProfile(response.data.data);
      } else {
        setProfile(null);
      }
    } catch (err) {
      setError('Failed to fetch profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch links
  const fetchLinks = useCallback(async () => {
    try {
      const response = await apiCalling({
        method: 'get',
        route: '/profile/links'
      });

      if (response.status && response.data?.data) {
        setLinks(response.data.data);
      } else {
        setLinks([]);
      }
    } catch (err) {
      console.error('Error fetching links:', err);
    }
  }, []);

  // Fetch recommendations
  const fetchRecommendations = useCallback(async () => {
    try {
      const response = await apiCalling({
        method: 'get',
        route: '/profile/recommendations'
      });

      if (response.status && response.data?.data) {
        setRecommendations(response.data.data);
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (data: Partial<ProfileData>) => {
    try {
      const response = await apiCalling({
        method: 'patch',
        route: '/profile',
        data
      });

      if (response.status) {
        await fetchProfile();
        return { success: true, message: 'Profile updated successfully' };
      } else {
        return { success: false, message: response.message || 'Failed to update profile' };
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      return { success: false, message: 'Failed to update profile' };
    }
  }, [fetchProfile]);

  // Add link
  const addLink = useCallback(async (label: string, url: string, sort_order = 0) => {
    try {
      const response = await apiCalling({
        method: 'post',
        route: '/profile/links',
        data: { label, url, sort_order }
      });

      if (response.status) {
        await fetchLinks();
        return { success: true, message: 'Link added successfully' };
      } else {
        return { success: false, message: response.message || 'Failed to add link' };
      }
    } catch (err) {
      console.error('Error adding link:', err);
      return { success: false, message: 'Failed to add link' };
    }
  }, [fetchLinks]);

  // Update link
  const updateLink = useCallback(async (id: string, label?: string, url?: string, sort_order?: number) => {
    try {
      const response = await apiCalling({
        method: 'post',
        route: '/profile/links',
        data: { id, label, url, sort_order }
      });

      if (response.status) {
        await fetchLinks();
        return { success: true, message: 'Link updated successfully' };
      } else {
        return { success: false, message: response.message || 'Failed to update link' };
      }
    } catch (err) {
      console.error('Error updating link:', err);
      return { success: false, message: 'Failed to update link' };
    }
  }, [fetchLinks]);

  // Delete link
  const deleteLink = useCallback(async (id: string) => {
    try {
      const response = await apiCalling({
        method: 'delete',
        route: `/profile/links?id=${id}`
      });

      if (response.status) {
        await fetchLinks();
        return { success: true, message: 'Link deleted successfully' };
      } else {
        return { success: false, message: response.message || 'Failed to delete link' };
      }
    } catch (err) {
      console.error('Error deleting link:', err);
      return { success: false, message: 'Failed to delete link' };
    }
  }, [fetchLinks]);

  // Upload profile photo or banner
  const uploadPhoto = useCallback(async (file: File, type: 'profile' | 'banner') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      // Get the access token from Supabase session
      const token = await getAccessToken();
      
      if (!token) {
        return { success: false, message: 'Not authenticated. Please log in again.' };
      }

      const response = await fetch('/api/upload/profile-photo', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success && data.data?.url) {
        // Profile is already updated by the API now, just refetch to get new data
        await fetchProfile();
        return { success: true, url: data.data.url };
      } else {
        return { success: false, message: data.error || 'Failed to upload photo' };
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
      return { success: false, message: 'Failed to upload photo' };
    }
  }, [fetchProfile]);

  // Initial load
  useEffect(() => {
    fetchProfile();
    fetchLinks();
    fetchRecommendations();
  }, [fetchProfile, fetchLinks, fetchRecommendations]);

  return {
    profile,
    links,
    recommendations,
    loading,
    error,
    updateProfile,
    addLink,
    updateLink,
    deleteLink,
    uploadPhoto,
    refetch: fetchProfile
  };
};
