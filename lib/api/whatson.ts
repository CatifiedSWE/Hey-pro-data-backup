// API service for What's On endpoints
import axios from '@/lib/axios';

export interface WhatsOnEvent {
  id: string;
  slug: string;
  title: string;
  location: string;
  is_online: boolean;
  is_paid: boolean;
  price_amount: number;
  price_currency: string;
  rsvp_deadline: string;
  max_spots_per_person: number;
  total_spots: number | null;
  is_unlimited_spots: boolean;
  description: string;
  thumbnail_url: string;
  hero_image_url: string;
  status: string;
  schedule: Array<{
    event_date: string;
    start_time: string;
    end_time: string;
    timezone: string;
  }>;
  tags: string[];
  creator: {
    name: string;
    profile_photo_url: string;
  };
  rsvp_count: number;
  spots_booked: number;
  is_fully_booked: boolean;
  terms_conditions?: string;
}

export interface WhatsOnFilters {
  page?: number;
  limit?: number;
  status?: 'published' | 'draft' | 'cancelled';
  keyword?: string;
  isPaid?: boolean;
  isOnline?: boolean;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const whatsOnAPI = {
  // List events with filters
  listEvents: async (filters?: WhatsOnFilters) => {
    const response = await axios.get('/whatson', { params: filters });
    return response.data;
  },

  // Get event by ID
  getEventById: async (id: string) => {
    const response = await axios.get(`/whatson/${id}`);
    return response.data;
  },

  // Get user's events
  getMyEvents: async () => {
    const response = await axios.get('/whatson/my');
    return response.data;
  },

  // Get user's RSVPs
  getMyRSVPs: async () => {
    const response = await axios.get('/whatson/rsvps/my');
    return response.data;
  },

  // Create RSVP
  createRSVP: async (eventId: string, data: {
    number_of_spots: number;
    attendee_names: string[];
    contact_email: string;
    contact_phone: string;
  }) => {
    const response = await axios.post(`/whatson/${eventId}/rsvp`, data);
    return response.data;
  },

  // Cancel RSVP
  cancelRSVP: async (eventId: string) => {
    const response = await axios.delete(`/whatson/${eventId}/rsvp`);
    return response.data;
  },

  // Create event
  createEvent: async (data: any) => {
    const response = await axios.post('/whatson', data);
    return response.data;
  },

  // Update event
  updateEvent: async (eventId: string, data: any) => {
    const response = await axios.patch(`/whatson/${eventId}`, data);
    return response.data;
  },

  // Delete event
  deleteEvent: async (eventId: string) => {
    const response = await axios.delete(`/whatson/${eventId}`);
    return response.data;
  },

  // Get RSVP list for event (creator only)
  getRSVPList: async (eventId: string) => {
    const response = await axios.get(`/whatson/${eventId}/rsvp/list`);
    return response.data;
  },

  // Export RSVPs as CSV (creator only)
  exportRSVPs: async (eventId: string) => {
    const response = await axios.get(`/whatson/${eventId}/rsvp/export`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
