import { useState, useEffect, useCallback } from 'react';
import apiCalling from '@/lib/apiCalling';
import { getAccessToken } from '@/lib/supabase/client';

export interface WorkIdentities {
  freelance: boolean;
  employee: {
    enabled: boolean;
    company: string;
    designation: string;
  };
  businessOwner: {
    enabled: boolean;
    designation: string;
    businessName: string;
    businessType: string;
  };
}

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
  country_code?: string;
  portfolio_url?: string;
  imdb_url?: string;
  day_rate?: number;
  day_rate_currency?: string;
  work_identities?: WorkIdentities;
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

export interface RoleData {
  id: string;
  user_id: string;
  role_name: string;
  sort_order: number;
  created_at?: string;
}

export interface VisaData {
  id?: string;
  user_id?: string;
  nationality?: string;
  passport_expiry_date?: string;
  visa_type?: string;
  visa_issued_by?: string;
  visa_expiry_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LanguageData {
  id: string;
  user_id: string;
  language_name: string;
  proficiency_level?: string;
  can_speak?: boolean;
  can_write?: boolean;
  sort_order?: number;
  created_at?: string;
}

export interface TravelCountryData {
  id: string;
  user_id: string;
  country_name: string;
  sort_order?: number;
  created_at?: string;
}

export interface HighlightData {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url?: string;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SkillData {
  id: string;
  user_id: string;
  skill_name: string;
  department?: string;
  role?: string;
  description?: string;
  proficiency_level?: string;
  experience_level?: string;
  day_rate?: number;
  day_rate_currency?: string;
  is_public?: boolean;
  sort_order?: number;
  created_at?: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationData[]>([]);
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [visa, setVisa] = useState<VisaData | null>(null);
  const [languages, setLanguages] = useState<LanguageData[]>([]);
  const [travelCountries, setTravelCountries] = useState<TravelCountryData[]>([]);
  const [highlights, setHighlights] = useState<HighlightData[]>([]);
  const [skills, setSkills] = useState<SkillData[]>([]);
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

  // Fetch roles
  const fetchRoles = useCallback(async () => {
    try {
      const response = await apiCalling({
        method: 'get',
        route: '/profile/roles'
      });

      if (response.status && response.data?.data) {
        setRoles(response.data.data);
      } else {
        setRoles([]);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
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

  // Add role
  const addRole = useCallback(async (role_name: string, sort_order = 0) => {
    try {
      const response = await apiCalling({
        method: 'post',
        route: '/profile/roles',
        data: { role_name, sort_order }
      });

      if (response.status) {
        await fetchRoles();
        return { success: true, message: 'Role added successfully' };
      } else {
        return { success: false, message: response.message || 'Failed to add role' };
      }
    } catch (err) {
      console.error('Error adding role:', err);
      return { success: false, message: 'Failed to add role' };
    }
  }, [fetchRoles]);

  // Delete role
  const deleteRole = useCallback(async (id: string) => {
    try {
      const response = await apiCalling({
        method: 'delete',
        route: `/profile/roles?id=${id}`
      });

      if (response.status) {
        await fetchRoles();
        return { success: true, message: 'Role deleted successfully' };
      } else {
        return { success: false, message: response.message || 'Failed to delete role' };
      }
    } catch (err) {
      console.error('Error deleting role:', err);
      return { success: false, message: 'Failed to delete role' };
    }
  }, [fetchRoles]);

  // ========== VISA METHODS ==========
  // Fetch visa
  const fetchVisa = useCallback(async () => {
    try {
      const response = await apiCalling({
        method: 'get',
        route: '/profile/visa'
      });

      if (response.status && response.data?.data) {
        setVisa(response.data.data);
      } else {
        setVisa(null);
      }
    } catch (err) {
      console.error('Error fetching visa:', err);
    }
  }, []);

  // Update visa
  const updateVisa = useCallback(async (data: Partial<VisaData>) => {
    try {
      const response = await apiCalling({
        method: 'patch',
        route: '/profile/visa',
        data
      });

      if (response.status) {
        await fetchVisa();
        return { success: true, message: 'Visa information updated successfully' };
      } else {
        return { success: false, message: response.message || 'Failed to update visa information' };
      }
    } catch (err) {
      console.error('Error updating visa:', err);
      return { success: false, message: 'Failed to update visa information' };
    }
  }, [fetchVisa]);

  // ========== LANGUAGE METHODS ==========
  // Fetch languages
  const fetchLanguages = useCallback(async () => {
    try {
      const response = await apiCalling({
        method: 'get',
        route: '/profile/languages'
      });

      if (response.status && response.data?.data) {
        setLanguages(response.data.data);
      } else {
        setLanguages([]);
      }
    } catch (err) {
      console.error('Error fetching languages:', err);
    }
  }, []);

  // Add language
  const addLanguage = useCallback(async (language_name: string, can_speak = false, can_write = false, proficiency_level?: string, sort_order = 0) => {
    try {
      const response = await apiCalling({
        method: 'post',
        route: '/profile/languages',
        data: { language_name, can_speak, can_write, proficiency_level, sort_order }
      });

      if (response.status) {
        await fetchLanguages();
        return { success: true, message: 'Language added successfully' };
      } else {
        return { success: false, message: response.message || 'Failed to add language' };
      }
    } catch (err) {
      console.error('Error adding language:', err);
      return { success: false, message: 'Failed to add language' };
    }
  }, [fetchLanguages]);

  // Delete language
  const deleteLanguage = useCallback(async (id: string) => {
    try {
      const response = await apiCalling({
        method: 'delete',
        route: `/profile/languages?id=${id}`
      });

      if (response.status) {
        await fetchLanguages();
        return { success: true, message: 'Language deleted successfully' };
      } else {
        return { success: false, message: response.message || 'Failed to delete language' };
      }
    } catch (err) {
      console.error('Error deleting language:', err);
      return { success: false, message: 'Failed to delete language' };
    }
  }, [fetchLanguages]);

  // ========== TRAVEL COUNTRY METHODS ==========
  // Fetch travel countries
  const fetchTravelCountries = useCallback(async () => {
    try {
      const response = await apiCalling({
        method: 'get',
        route: '/profile/travel-countries'
      });

      if (response.status && response.data?.data) {
        setTravelCountries(response.data.data);
      } else {
        setTravelCountries([]);
      }
    } catch (err) {
      console.error('Error fetching travel countries:', err);
    }
  }, []);

  // Add travel country (no auto-refetch - caller should refetch manually)
  const addTravelCountry = useCallback(async (country_name: string, country_code?: string, sort_order = 0) => {
    try {
      const response = await apiCalling({
        method: 'post',
        route: '/profile/travel-countries',
        data: { country_name, country_code: country_code || country_name.substring(0, 2).toUpperCase(), sort_order }
      });

      if (response.status) {
        return { success: true, message: 'Travel country added successfully' };
      } else {
        return { success: false, message: response.message || 'Failed to add travel country' };
      }
    } catch (err) {
      console.error('Error adding travel country:', err);
      return { success: false, message: 'Failed to add travel country' };
    }
  }, []);

  // Add travel countries in batch (no auto-refetch - caller should refetch manually)
  const addTravelCountriesBatch = useCallback(async (countries: Array<{ country_name: string; country_code: string }>) => {
    try {
      const response = await apiCalling({
        method: 'post',
        route: '/profile/travel-countries',
        data: countries
      });

      if (response.status) {
        return { success: true, message: response.data?.message || 'Travel countries added successfully', data: response.data?.data };
      } else {
        return { success: false, message: response.message || 'Failed to add travel countries' };
      }
    } catch (err) {
      console.error('Error adding travel countries in batch:', err);
      return { success: false, message: 'Failed to add travel countries' };
    }
  }, []);

  // Delete travel country (no auto-refetch - caller should refetch manually)
  const deleteTravelCountry = useCallback(async (id: string) => {
    try {
      const response = await apiCalling({
        method: 'delete',
        route: `/profile/travel-countries?id=${id}`
      });

      if (response.status) {
        return { success: true, message: 'Travel country deleted successfully' };
      } else {
        return { success: false, message: response.message || 'Failed to delete travel country' };
      }
    } catch (err) {
      console.error('Error deleting travel country:', err);
      return { success: false, message: 'Failed to delete travel country' };
    }
  }, []);

  // Delete travel countries in batch (no auto-refetch - caller should refetch manually)
  const deleteTravelCountriesBatch = useCallback(async (ids: string[]) => {
    try {
      const response = await apiCalling({
        method: 'delete',
        route: `/profile/travel-countries?ids=${ids.join(',')}`
      });

      if (response.status) {
        return { success: true, message: response.data?.message || 'Travel countries deleted successfully' };
      } else {
        return { success: false, message: response.message || 'Failed to delete travel countries' };
      }
    } catch (err) {
      console.error('Error deleting travel countries in batch:', err);
      return { success: false, message: 'Failed to delete travel countries' };
    }
  }, []);

  // ========== HIGHLIGHT METHODS ==========
  // Fetch highlights
  const fetchHighlights = useCallback(async () => {
    try {
      const response = await apiCalling({
        method: 'get',
        route: '/profile/highlights'
      });

      if (response.status && response.data?.data) {
        setHighlights(response.data.data);
      } else {
        setHighlights([]);
      }
    } catch (err) {
      console.error('Error fetching highlights:', err);
    }
  }, []);

  // Add highlight
  const addHighlight = useCallback(async (title: string, description: string, image_url?: string, sort_order = 0) => {
    try {
      const response = await apiCalling({
        method: 'post',
        route: '/profile/highlights',
        data: { title, description, image_url, sort_order }
      });

      if (response.status) {
        await fetchHighlights();
        return { success: true, message: 'Highlight added successfully' };
      } else {
        return { success: false, message: response.message || 'Failed to add highlight' };
      }
    } catch (err) {
      console.error('Error adding highlight:', err);
      return { success: false, message: 'Failed to add highlight' };
    }
  }, [fetchHighlights]);

  // Update highlight
  const updateHighlight = useCallback(async (id: string, data: Partial<HighlightData>) => {
    try {
      const response = await apiCalling({
        method: 'patch',
        route: '/profile/highlights',
        data: { id, ...data }
      });

      if (response.status) {
        await fetchHighlights();
        return { success: true, message: 'Highlight updated successfully' };
      } else {
        return { success: false, message: response.message || 'Failed to update highlight' };
      }
    } catch (err) {
      console.error('Error updating highlight:', err);
      return { success: false, message: 'Failed to update highlight' };
    }
  }, [fetchHighlights]);

  // Delete highlight
  const deleteHighlight = useCallback(async (id: string) => {
    try {
      const response = await apiCalling({
        method: 'delete',
        route: `/profile/highlights?id=${id}`
      });

      if (response.status) {
        await fetchHighlights();
        return { success: true, message: 'Highlight deleted successfully' };
      } else {
        return { success: false, message: response.message || 'Failed to delete highlight' };
      }
    } catch (err) {
      console.error('Error deleting highlight:', err);
      return { success: false, message: 'Failed to delete highlight' };
    }
  }, [fetchHighlights]);

  // ========== SKILL METHODS ==========
  // Fetch skills
  const fetchSkills = useCallback(async () => {
    try {
      const response = await apiCalling({
        method: 'get',
        route: '/skills'
      });

      if (response.status && response.data?.data) {
        setSkills(response.data.data);
      } else {
        setSkills([]);
      }
    } catch (err) {
      console.error('Error fetching skills:', err);
    }
  }, []);

  // Add skill
  const addSkill = useCallback(async (data: Partial<SkillData>) => {
    try {
      const response = await apiCalling({
        method: 'post',
        route: '/skills',
        data
      });

      if (response.status) {
        await fetchSkills();
        return { success: true, message: 'Skill added successfully' };
      } else {
        return { success: false, message: response.message || 'Failed to add skill' };
      }
    } catch (err) {
      console.error('Error adding skill:', err);
      return { success: false, message: 'Failed to add skill' };
    }
  }, [fetchSkills]);

  // Update skill
  const updateSkill = useCallback(async (id: string, data: Partial<SkillData>) => {
    try {
      const response = await apiCalling({
        method: 'patch',
        route: `/skills/${id}`,
        data
      });

      if (response.status) {
        await fetchSkills();
        return { success: true, message: 'Skill updated successfully' };
      } else {
        return { success: false, message: response.message || 'Failed to update skill' };
      }
    } catch (err) {
      console.error('Error updating skill:', err);
      return { success: false, message: 'Failed to update skill' };
    }
  }, [fetchSkills]);

  // Delete skill
  const deleteSkill = useCallback(async (id: string) => {
    try {
      const response = await apiCalling({
        method: 'delete',
        route: `/skills/${id}`
      });

      if (response.status) {
        await fetchSkills();
        return { success: true, message: 'Skill deleted successfully' };
      } else {
        return { success: false, message: response.message || 'Failed to delete skill' };
      }
    } catch (err) {
      console.error('Error deleting skill:', err);
      return { success: false, message: 'Failed to delete skill' };
    }
  }, [fetchSkills]);

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
    fetchRoles();
    fetchVisa();
    fetchLanguages();
    fetchTravelCountries();
    fetchHighlights();
    fetchSkills();
  }, [fetchProfile, fetchLinks, fetchRecommendations, fetchRoles, fetchVisa, fetchLanguages, fetchTravelCountries, fetchHighlights, fetchSkills]);

  return {
    // Profile data
    profile,
    links,
    recommendations,
    roles,
    visa,
    languages,
    travelCountries,
    highlights,
    skills,
    loading,
    error,
    
    // Profile methods
    updateProfile,
    refetch: fetchProfile,
    
    // Link methods
    addLink,
    updateLink,
    deleteLink,
    fetchLinks,
    
    // Recommendation methods
    fetchRecommendations,
    
    // Role methods
    addRole,
    deleteRole,
    
    // Visa methods
    fetchVisa,
    updateVisa,
    
    // Language methods
    fetchLanguages,
    addLanguage,
    deleteLanguage,
    
    // Travel country methods
    fetchTravelCountries,
    addTravelCountry,
    addTravelCountriesBatch,
    deleteTravelCountry,
    deleteTravelCountriesBatch,
    
    // Highlight methods
    fetchHighlights,
    addHighlight,
    updateHighlight,
    deleteHighlight,
    
    // Skill methods
    fetchSkills,
    addSkill,
    updateSkill,
    deleteSkill,
    
    // Upload methods
    uploadPhoto,
  };
};
