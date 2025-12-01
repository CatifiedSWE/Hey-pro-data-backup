'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useProfile as useProfileHook } from '@/hooks/useProfile';
import type { 
  ProfileData, 
  LinkData, 
  RecommendationData, 
  RoleData, 
  VisaData, 
  LanguageData, 
  TravelCountryData, 
  HighlightData, 
  SkillData,
  CreditData,
  AvailabilityData
} from '@/hooks/useProfile';

// Define the context type
interface ProfileContextType {
  // Profile data
  profile: ProfileData | null;
  links: LinkData[];
  recommendations: RecommendationData[];
  roles: RoleData[];
  visa: VisaData | null;
  languages: LanguageData[];
  travelCountries: TravelCountryData[];
  highlights: HighlightData[];
  skills: SkillData[];
  credits: CreditData[];
  availability: AvailabilityData[];
  loading: boolean;
  error: string | null;
  
  // Profile methods
  updateProfile: (data: Partial<ProfileData>) => Promise<{ success: boolean; message: string }>;
  refetch: () => Promise<void>;
  fetchCompleteProfile: () => Promise<void>;
  
  // Link methods
  addLink: (label: string, url: string, sort_order?: number) => Promise<{ success: boolean; message: string }>;
  updateLink: (id: string, label?: string, url?: string, sort_order?: number) => Promise<{ success: boolean; message: string }>;
  deleteLink: (id: string) => Promise<{ success: boolean; message: string }>;
  fetchLinks: () => Promise<void>;
  
  // Recommendation methods
  fetchRecommendations: () => Promise<void>;
  
  // Role methods
  addRole: (role_name: string, sort_order?: number) => Promise<{ success: boolean; message: string }>;
  deleteRole: (id: string) => Promise<{ success: boolean; message: string }>;
  
  // Visa methods
  fetchVisa: () => Promise<void>;
  updateVisa: (data: Partial<VisaData>) => Promise<{ success: boolean; message: string }>;
  
  // Language methods
  fetchLanguages: () => Promise<void>;
  addLanguage: (language_name: string, can_speak?: boolean, can_write?: boolean, proficiency_level?: string, sort_order?: number) => Promise<{ success: boolean; message: string }>;
  deleteLanguage: (id: string) => Promise<{ success: boolean; message: string }>;
  
  // Travel country methods
  fetchTravelCountries: () => Promise<void>;
  addTravelCountry: (country_name: string, country_code: string, sort_order?: number) => Promise<{ success: boolean; message: string }>;
  addTravelCountriesBatch: (countries: Array<{ country_name: string; country_code: string }>) => Promise<{ success: boolean; message: string }>;
  deleteTravelCountry: (id: string) => Promise<{ success: boolean; message: string }>;
  deleteTravelCountriesBatch: (ids: string[]) => Promise<{ success: boolean; message: string }>;
  
  // Highlight methods
  fetchHighlights: () => Promise<void>;
  addHighlight: (title: string, description: string, image_url?: string, sort_order?: number) => Promise<{ success: boolean; message: string }>;
  updateHighlight: (id: string, data: Partial<HighlightData>) => Promise<{ success: boolean; message: string }>;
  deleteHighlight: (id: string) => Promise<{ success: boolean; message: string }>;
  
  // Skill methods
  fetchSkills: () => Promise<void>;
  addSkill: (data: Partial<SkillData>) => Promise<{ success: boolean; message: string }>;
  updateSkill: (id: string, data: Partial<SkillData>) => Promise<{ success: boolean; message: string }>;
  deleteSkill: (id: string) => Promise<{ success: boolean; message: string }>;
  
  // Credits methods
  fetchCredits: () => Promise<void>;
  
  // Availability methods
  fetchAvailability: (month?: string) => Promise<void>;
  updateAvailability: (availability_date: string, status: 'available' | 'hold' | 'na') => Promise<{ success: boolean; message: string }>;
  
  // Upload methods
  uploadPhoto: (file: File, type: 'profile' | 'banner') => Promise<{ success: boolean; message?: string; url?: string }>;
}

// Create context with undefined default
const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Provider component
interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  // Use the hook once at the top level
  const profileData = useProfileHook();

  return (
    <ProfileContext.Provider value={profileData}>
      {children}
    </ProfileContext.Provider>
  );
};

// Custom hook to use the profile context
export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  
  return context;
};

// Export types for convenience
export type { 
  ProfileData, 
  LinkData, 
  RecommendationData, 
  RoleData, 
  VisaData, 
  LanguageData, 
  TravelCountryData, 
  HighlightData, 
  SkillData,
  CreditData,
  AvailabilityData
};
