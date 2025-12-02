"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { whatsOnAPI } from '@/lib/api/whatson';
import { EditWhatsOnForm } from '../../../components/EditWhatsOnForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import axios from '@/lib/axios';

interface EventFormData {
  title: string;
  description: string;
  location: string;
  is_online: boolean;
  is_paid: boolean;
  price_amount: number;
  price_currency: string;
  rsvp_deadline: string;
  max_spots_per_person: number;
  total_spots: number | null;
  is_unlimited_spots: boolean;
  terms_conditions: string;
  thumbnail_url: string;
  hero_image_url: string;
  status: 'draft' | 'published';
  schedule: Array<{
    event_date: string;
    start_time: string;
    end_time: string;
    timezone: string;
  }>;
  tags: string[];
}

interface EventFormHandlerProps {
  mode: 'create' | 'edit';
  eventId?: string;
  initialData?: any;
}

export function EventFormHandler({ mode, eventId, initialData }: EventFormHandlerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(initialData);

  // Transform UI schedule format to API format
  const transformScheduleToAPI = (schedule: any[]) => {
    return schedule.map(slot => {
      // Parse date from "EEE, MMM dd yyyy" format
      const dateParts = slot.dateLabel.split(',');
      const monthDayYear = dateParts[1]?.trim() || '';
      const parsedDate = new Date(monthDayYear);
      
      // Parse time range from "HH:MM AM/PM - HH:MM AM/PM" format
      const timeRange = slot.timeRange.split('-');
      const startTime = convertTo24Hour(timeRange[0]?.trim() || '');
      const endTime = convertTo24Hour(timeRange[1]?.trim() || '');

      return {
        event_date: parsedDate.toISOString().split('T')[0], // YYYY-MM-DD
        start_time: startTime,
        end_time: endTime,
        timezone: slot.timezone || 'GST'
      };
    });
  };

  // Convert 12-hour time to 24-hour format
  const convertTo24Hour = (time12h: string): string => {
    if (!time12h) return '00:00';
    
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    
    if (modifier?.toUpperCase() === 'PM') {
      hours = String(parseInt(hours, 10) + 12);
    }
    
    return `${hours.padStart(2, '0')}:${minutes || '00'}`;
  };

  // Transform UI format to API format
  const transformFormDataToAPI = (uiData: any): EventFormData => {
    return {
      title: uiData.title,
      description: uiData.description,
      location: uiData.location,
      is_online: uiData.isOnline || false,
      is_paid: uiData.isPaid || false,
      price_amount: uiData.isPaid ? (parseInt(uiData.priceAmount) || 0) : 0,
      price_currency: uiData.priceCurrency || 'AED',
      rsvp_deadline: uiData.rsvpBy ? new Date(uiData.rsvpBy).toISOString() : new Date().toISOString(),
      max_spots_per_person: parseInt(uiData.maxSpotsPerPerson) || 1,
      total_spots: uiData.isUnlimitedSpots ? null : (parseInt(uiData.totalSpots) || 20),
      is_unlimited_spots: uiData.isUnlimitedSpots || false,
      terms_conditions: uiData.terms,
      thumbnail_url: uiData.thumbnail || '',
      hero_image_url: uiData.heroImage || '',
      status: uiData.status || 'draft',
      schedule: transformScheduleToAPI(uiData.schedule || []),
      tags: uiData.tags || []
    };
  };

  // Handle image upload
  const uploadImage = async (file: File, type: 'thumbnail' | 'hero'): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await axios.post('/upload/whatson-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data.data.url;
    } catch (err: any) {
      console.error('Image upload failed:', err);
      throw new Error(`Failed to upload ${type} image`);
    }
  };

  const handleSave = async (updatedFormData: any) => {
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!updatedFormData.title || updatedFormData.title.length < 3) {
        throw new Error('Title must be at least 3 characters long');
      }

      if (!updatedFormData.description) {
        throw new Error('Description is required');
      }

      if (!updatedFormData.isOnline && !updatedFormData.location) {
        throw new Error('Location is required for in-person events');
      }

      if (!updatedFormData.isUnlimitedSpots && !updatedFormData.totalSpots) {
        throw new Error('Total spots is required when capacity is limited');
      }

      if (!updatedFormData.schedule || updatedFormData.schedule.length === 0) {
        throw new Error('At least one schedule entry is required');
      }

      // Transform data
      const apiData = transformFormDataToAPI(updatedFormData);

      let response;
      if (mode === 'create') {
        response = await whatsOnAPI.createEvent(apiData);
        alert('Event created successfully!');
        router.push('/whats-on/manage-whats-on');
      } else if (mode === 'edit' && eventId) {
        response = await whatsOnAPI.updateEvent(eventId, apiData);
        alert('Event updated successfully!');
        router.push('/whats-on/manage-whats-on');
      }
    } catch (err: any) {
      console.error('Save failed:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to save event';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-y-2 sm:gap-0 sm:items-center sm:justify-between p-4 bg-white rounded-lg">
        <span className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent text-3xl font-semibold">
          {mode === 'create' ? "Add New What's On" : "Manage What's On"}
        </span>
        <div className="flex gap-4">
          <Link 
            href="/whats-on/manage-whats-on" 
            className="rounded-lg border border-[#31A7AC] h-[44px] px-4 py-2 text-[#31A7AC] hover:bg-[#f0f0f0] flex items-center justify-center"
          >
            Discard
          </Link>
          <Button 
            onClick={() => handleSave(formData)}
            disabled={loading}
            className="rounded-lg h-[44px] hover:bg-[#31A7AC] bg-[#31A7AC] px-4 py-2 text-sm font-semibold text-white"
          >
            {loading ? 'Saving...' : 'Save Event'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <EditWhatsOnForm 
        event={formData} 
        onChange={setFormData}
      />
    </div>
  );
}
