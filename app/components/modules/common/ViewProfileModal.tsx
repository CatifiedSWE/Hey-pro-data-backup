"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "@/lib/axios";
import ReadOnlyProfileContent from "./ReadOnlyProfileContent";

interface ViewProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

interface UserProfileData {
  id: number;
  userId: string;
  name: string;
  displayName: string;
  avatar: string;
  banner: string;
  bio: string;
  country: string;
  city: string;
  location: string;
  email: string;
  phone: string;
  portfolioUrl?: string;
  imdbUrl?: string;
  dayRate?: number;
  currency: string;
  experienceLevel?: string;
  availableForWork: boolean;
  profileCompletionPercentage: number;
  roles: Array<{
    id: string;
    roleName: string;
    category?: string;
    sortOrder: number;
  }>;
  skills: Array<{
    id: string;
    skillName: string;
    proficiencyLevel?: string;
    sortOrder: number;
  }>;
  links: Array<{
    id: string;
    platform: string;
    url: string;
    label?: string;
    sortOrder: number;
  }>;
  languages: Array<{
    id: string;
    language: string;
    proficiency?: string;
  }>;
  travelCountries: Array<{
    id: string;
    country: string;
  }>;
  credits: Array<{
    id: string;
    title: string;
    role: string;
    year: number;
    description?: string;
    imdbUrl?: string;
  }>;
  highlights: Array<{
    id: string;
    highlight: string;
    sortOrder: number;
  }>;
  recommendations: Array<{
    id: string;
    recommenderName: string;
    recommenderRole?: string;
    recommendation: string;
    createdAt: string;
  }>;
}

export default function ViewProfileModal({ isOpen, onClose, userId }: ViewProfileModalProps) {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserProfile();
    }

    // Lock body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, userId]);

  const fetchUserProfile = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/explore/${userId}`);
      if (response.data.success) {
        setProfile(response.data.data);
      } else {
        setError(response.data.error || 'Failed to load profile');
      }
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
      data-testid="view-profile-modal"
    >
      <div 
        className="relative w-full max-w-[1180px] min-h-screen bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - High visibility with contrast */}
        <Button
          onClick={onClose}
          className="fixed top-4 right-4 z-[60] h-12 w-12 rounded-full bg-white shadow-2xl hover:bg-gray-50 border-2 border-gray-300 transition-all hover:scale-110"
          size="icon"
          data-testid="close-profile-modal"
          aria-label="Close profile"
        >
          <X className="h-7 w-7 text-gray-900 stroke-[2.5]" />
        </Button>

        {/* Content Area */}
        <div className="px-3 xs:px-4 sm:px-6 pt-6 pb-20">
          {loading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA6E80] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading profile...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={onClose} variant="outline">
                  Close
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && profile && (
            <ReadOnlyProfileContent profile={profile} />
          )}
        </div>
      </div>
    </div>
  );
}
