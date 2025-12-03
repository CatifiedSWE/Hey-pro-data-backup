// Transform API response to match UI expectations
import { format } from 'date-fns';
import { WhatsOnEvent } from '@/lib/api/whatson';

/**
 * Get profile photo with fallback chain:
 * 1. User uploaded photo (profile_photo_url)
 * 2. Google photo (if available from auth metadata - not implemented yet in API)
 * 3. Default photo
 */
function getProfilePhotoWithFallback(profilePhotoUrl: string | null | undefined, googlePhotoUrl?: string | null): string {
  // Priority 1: User uploaded photo
  if (profilePhotoUrl && profilePhotoUrl.trim() !== '') {
    return profilePhotoUrl;
  }
  
  // Priority 2: Google photo (if available)
  if (googlePhotoUrl && googlePhotoUrl.trim() !== '') {
    return googlePhotoUrl;
  }
  
  // Priority 3: Default photo
  return '/default-profile.png';
}

export function transformEventForCard(event: WhatsOnEvent) {
  // Handle null creator gracefully
  const creatorName = event.creator?.name || 'Unknown';
  const creatorAvatar = event.creator?.profile_photo_url || null;
  
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    location: event.is_online ? 'Online Event' : event.location,
    dateRangeLabel: formatDateRange(event.schedule),
    isPaid: event.is_paid,
    priceLabel: event.is_paid 
      ? `${event.price_amount} ${event.price_currency}` 
      : 'Free',
    heroImage: event.hero_image_url || '/whats-on.png',
    thumbnail: event.thumbnail_url || '/whats-on.png',
    host: {
      name: event.creator?.name || 'Unknown',
      avatar: event.creator?.profile_photo_url || '/default-profile.png',
      organization: event.creator?.name || 'Unknown'
    },
    rsvpCount: event.rsvp_count,
    isFullyBooked: event.is_fully_booked
  };
}

export function formatDateRange(schedule: any[]): string {
  if (!schedule || schedule.length === 0) return 'TBA';
  
  try {
    const first = new Date(schedule[0].event_date);
    const last = new Date(schedule[schedule.length - 1].event_date);
    
    if (schedule.length === 1) {
      return format(first, 'MMM d, yyyy');
    }
    
    // Check if same month and year
    if (first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear()) {
      return `${format(first, 'MMM d')} - ${format(last, 'd, yyyy')}`;
    }
    
    return `${format(first, 'MMM d, yyyy')} - ${format(last, 'MMM d, yyyy')}`;
  } catch (error) {
    console.error('Error formatting date range:', error);
    return 'TBA';
  }
}

export function transformEventForDetail(event: WhatsOnEvent) {
  // Handle null creator gracefully
  const creatorName = event.creator?.name || 'Unknown';
  const creatorAvatar = event.creator?.profile_photo_url || null;
  
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    location: event.is_online ? 'Online Event' : event.location,
    isOnline: event.is_online,
    isPaid: event.is_paid,
    priceLabel: event.is_paid 
      ? `${event.price_amount} ${event.price_currency}` 
      : 'Free',
    dateRangeLabel: formatDateRange(event.schedule),
    rsvpBy: event.rsvp_deadline ? format(new Date(event.rsvp_deadline), 'EEE, MMM d yyyy') : 'TBA',
    host: {
      name: event.creator?.name || 'Unknown',
      organization: event.creator?.name || 'Unknown',
      avatar: event.creator?.profile_photo_url || '/image (2).png'
    },
    schedule: event.schedule.map(slot => ({
      id: (slot as any).id, // Preserve the schedule ID
      dateLabel: format(new Date(slot.event_date), 'EEE, MMM d yyyy'),
      timeRange: `${slot.start_time} - ${slot.end_time}`,
      timezone: slot.timezone
    })),
    description: event.description ? event.description.split('\n').filter(Boolean) : [],
    terms: event.terms_conditions ? event.terms_conditions.split('\n').filter(Boolean) : [],
    tags: event.tags || [],
    thumbnail: event.thumbnail_url || '/whats-on.png',
    heroImage: event.hero_image_url || '/whats-on.png',
    rsvpCount: event.rsvp_count,
    isFullyBooked: event.is_fully_booked,
    maxSpotsPerPerson: event.max_spots_per_person,
    totalSpots: event.total_spots,
    isUnlimitedSpots: event.is_unlimited_spots,
    spotsBooked: event.spots_booked
  };
}

