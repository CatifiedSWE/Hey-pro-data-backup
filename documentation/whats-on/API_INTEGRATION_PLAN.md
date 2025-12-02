# What's On - API Integration Plan

**Project:** HeyProData  
**Module:** What's On (Events Platform)  
**Version:** 2.5  
**Created:** January 2025  
**Status:** Ready for Implementation

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Current State Analysis](#current-state-analysis)
3. [API Endpoints Reference](#api-endpoints-reference)
4. [Database Schema Reference](#database-schema-reference)
5. [Implementation Phases](#implementation-phases)
6. [Phase 1: Event Listing (HIGH PRIORITY)](#phase-1-event-listing-high-priority)
7. [Phase 2: Event Details & RSVP (HIGH PRIORITY)](#phase-2-event-details--rsvp-high-priority)
8. [Phase 3: Event Management (MEDIUM PRIORITY)](#phase-3-event-management-medium-priority)
9. [Phase 4: Event Creation & Editing (MEDIUM PRIORITY)](#phase-4-event-creation--editing-medium-priority)
10. [Data Transformation Guide](#data-transformation-guide)
11. [Testing Strategy](#testing-strategy)
12. [Success Criteria](#success-criteria)

---

## Overview

### Goal
Connect frontend pages in `/app/(app)/(whatson)/` to backend API endpoints in `/app/api/whatson/`, replacing mock data with real database-driven functionality.

### Current Status
- ✅ Backend APIs fully implemented and documented
- ✅ Database tables created with RLS policies
- ✅ Frontend UI components built with mock data
- ❌ No API integration - using `/data/whatsOnEvents.ts` mock file
- ❌ No authentication flow connected
- ❌ No real RSVP functionality

### Expected Outcome
- ✅ All pages fetching data from Supabase via API routes
- ✅ Real-time event creation, editing, and management
- ✅ Functional RSVP system with ticket generation
- ✅ Filter and search working with database queries
- ✅ User-specific views (My Events, My RSVPs)

---

## Current State Analysis

### Frontend Files Structure

```
/app/(app)/(whatson)/
├── components/
│   ├── main-content.tsx           # Event listing cards grid
│   ├── rsvp.tsx                   # RSVP dialog component
│   ├── data-table.tsx             # RSVP management table
│   └── EditWhatsOnForm.tsx        # Event edit form
├── whats-on/
│   ├── page.tsx                   # Main event listing with filters
│   ├── [slug]/page.tsx            # Event detail page
│   └── manage-whats-on/
│       ├── page.tsx               # Event management dashboard
│       ├── add-new/page.tsx       # Create new event form
│       └── [id]/page.tsx          # Edit event page
```

### Current Data Source
**Mock File:** `/data/whatsOnEvents.ts`

**Mock Data Structure:**
```typescript
{
  id: string,
  slug: string,
  title: string,
  location: string,
  dateRangeLabel: string,
  isPaid: boolean,
  priceLabel: string,
  heroImage: string,
  thumbnail: string,
  description: string[],
  host: { name, organization, avatar },
  schedule: [{ dateLabel, timeRange, timezone }],
  tags: string[],
  terms: string[],
  rsvpBy: string,
  recommendedpopels: string[]
}
```

---

## API Endpoints Reference

### Base URL
```
/api/whatson
```

### Available Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/whatson` | List all published events with filters | Optional |
| POST | `/api/whatson` | Create new event | ✅ Required |
| GET | `/api/whatson/my` | Get current user's events | ✅ Required |
| GET | `/api/whatson/rsvps/my` | Get current user's RSVPs | ✅ Required |
| GET | `/api/whatson/[id]` | Get event details by ID | Optional |
| PATCH | `/api/whatson/[id]` | Update event (creator only) | ✅ Required |
| DELETE | `/api/whatson/[id]` | Delete event (creator only) | ✅ Required |
| POST | `/api/whatson/[id]/rsvp` | Create RSVP for event | ✅ Required |
| DELETE | `/api/whatson/[id]/rsvp` | Cancel RSVP | ✅ Required |
| GET | `/api/whatson/[id]/rsvp/list` | Get event RSVPs (creator only) | ✅ Required |
| GET | `/api/whatson/[id]/rsvp/export` | Export RSVPs as CSV (creator only) | ✅ Required |

### Query Parameters for GET `/api/whatson`

```typescript
{
  page?: number,           // Default: 1
  limit?: number,          // Default: 10
  status?: string,         // 'published' | 'draft' | 'cancelled'
  keyword?: string,        // Search in title/description
  isPaid?: boolean,        // Filter by free/paid
  isOnline?: boolean,      // Filter by online/in-person
  location?: string,       // Filter by location
  dateFrom?: string,       // ISO date
  dateTo?: string,         // ISO date
  tags?: string,           // Comma-separated tags
  sortBy?: string,         // Field to sort by
  sortOrder?: 'asc' | 'desc'
}
```

---

## Database Schema Reference

### Table: `whatson_events`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `created_by` | UUID | Creator user ID (FK) |
| `title` | TEXT | Event name (3-200 chars) |
| `slug` | TEXT | URL-friendly identifier (UNIQUE) |
| `location` | TEXT | Venue/address |
| `is_online` | BOOLEAN | Online event flag |
| `is_paid` | BOOLEAN | Paid event flag |
| `price_amount` | INTEGER | Price value (default 0) |
| `price_currency` | TEXT | Currency code (default AED) |
| `rsvp_deadline` | TIMESTAMPTZ | Last RSVP date |
| `max_spots_per_person` | INTEGER | Booking limit per user |
| `total_spots` | INTEGER | Total capacity |
| `is_unlimited_spots` | BOOLEAN | Unlimited capacity flag |
| `description` | TEXT | Event details (max 10000 chars) |
| `terms_conditions` | TEXT | Terms and conditions |
| `thumbnail_url` | TEXT | Card image URL |
| `hero_image_url` | TEXT | Banner image URL |
| `status` | TEXT | 'draft' \| 'published' \| 'cancelled' |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

### Table: `whatson_schedule`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `event_id` | UUID | Event ID (FK) |
| `event_date` | DATE | Event date |
| `start_time` | TIME | Start time |
| `end_time` | TIME | End time |
| `timezone` | TEXT | Timezone code |
| `sort_order` | INTEGER | Display order |

### Table: `whatson_tags`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `event_id` | UUID | Event ID (FK) |
| `tag_name` | TEXT | Tag label (1-50 chars) |

### Table: `whatson_rsvps`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `event_id` | UUID | Event ID (FK) |
| `user_id` | UUID | Attendee ID (FK) |
| `ticket_number` | TEXT | Auto-generated (WO-2025-NNNNNN) |
| `reference_number` | TEXT | Auto-generated (#ALPHANUMERIC13) |
| `number_of_spots` | INTEGER | Spots booked |
| `payment_status` | TEXT | 'paid' \| 'unpaid' \| 'n/a' |
| `status` | TEXT | 'confirmed' \| 'cancelled' \| 'waitlist' |
| `created_at` | TIMESTAMPTZ | RSVP timestamp |

---

## Implementation Phases

### Priority Matrix

| Phase | Priority | Complexity | Dependencies | Est. Time |
|-------|----------|------------|--------------|-----------|
| Phase 1: Event Listing | 🔴 HIGH | Low | Auth context | 2-3 hours |
| Phase 2: Event Details & RSVP | 🔴 HIGH | Medium | Phase 1 | 3-4 hours |
| Phase 3: Event Management | 🟡 MEDIUM | Medium | Phase 1, 2 | 2-3 hours |
| Phase 4: Event Creation & Editing | 🟡 MEDIUM | High | Phase 1, 2, 3 | 4-5 hours |

**Total Estimated Time:** 11-15 hours

---

## Phase 1: Event Listing (HIGH PRIORITY)

### Objective
Replace mock data in event listing page with real API calls, implement filters and search.

### Files to Modify
1. `/app/(app)/(whatson)/whats-on/page.tsx` - Main page
2. `/app/(app)/(whatson)/components/main-content.tsx` - Event cards grid

### Implementation Steps

#### Step 1.1: Create API Service Layer
**File:** `/lib/api/whatson.ts` (NEW)

```typescript
// Create API service for What's On endpoints
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
    const response = await axios.get('/api/whatson', { params: filters });
    return response.data;
  },

  // Get event by ID
  getEventById: async (id: string) => {
    const response = await axios.get(`/api/whatson/${id}`);
    return response.data;
  },

  // Get user's events
  getMyEvents: async () => {
    const response = await axios.get('/api/whatson/my');
    return response.data;
  },

  // Get user's RSVPs
  getMyRSVPs: async () => {
    const response = await axios.get('/api/whatson/rsvps/my');
    return response.data;
  },

  // Create RSVP
  createRSVP: async (eventId: string, data: {
    number_of_spots: number;
    attendee_names: string[];
    contact_email: string;
    contact_phone: string;
  }) => {
    const response = await axios.post(`/api/whatson/${eventId}/rsvp`, data);
    return response.data;
  },

  // Cancel RSVP
  cancelRSVP: async (eventId: string) => {
    const response = await axios.delete(`/api/whatson/${eventId}/rsvp`);
    return response.data;
  }
};
```

#### Step 1.2: Update Main Listing Page
**File:** `/app/(app)/(whatson)/whats-on/page.tsx`

**Tasks:**
1. Remove import of mock data
2. Add `useState` for events list
3. Add `useEffect` to fetch events on mount
4. Connect filter form to API query parameters
5. Implement filter submission handler
6. Add loading and error states
7. Pass real data to `<EventListingPage />` component

**Key Changes:**
```typescript
// Before (Mock)
import { whatsOnEvents } from "@/data/whatsOnEvents";

// After (Real API)
import { whatsOnAPI, WhatsOnEvent } from "@/lib/api/whatson";
import { useState, useEffect } from "react";

const [events, setEvents] = useState<WhatsOnEvent[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  fetchEvents();
}, []);

const fetchEvents = async () => {
  try {
    setLoading(true);
    const filters = buildFiltersFromState(); // Convert UI state to API params
    const data = await whatsOnAPI.listEvents(filters);
    setEvents(data.data.events);
  } catch (err) {
    setError('Failed to load events');
  } finally {
    setLoading(false);
  }
};

const handleFilterSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  await fetchEvents(); // Re-fetch with new filters
};
```

#### Step 1.3: Update Event Cards Component
**File:** `/app/(app)/(whatson)/components/main-content.tsx`

**Tasks:**
1. Accept events array as prop instead of importing mock
2. Transform API response to match card display format
3. Add loading skeleton component
4. Add empty state component
5. Handle image URLs from Supabase Storage

**Key Changes:**
```typescript
// Before
import { whatsOnEvents } from "@/data/whatsOnEvents";

export default function EventListingPage({ isFilterOpen }) {
  return (
    // Uses whatsOnEvents directly
  );
}

// After
interface EventListingPageProps {
  isFilterOpen?: boolean;
  events: WhatsOnEvent[];
  loading?: boolean;
}

export default function EventListingPage({ 
  isFilterOpen, 
  events,
  loading 
}: EventListingPageProps) {
  if (loading) return <EventListingSkeleton />;
  if (events.length === 0) return <EmptyState />;
  
  return (
    // Map over events prop
  );
}
```

#### Step 1.4: Implement Data Transformation
**File:** `/lib/utils/whatson-transforms.ts` (NEW)

```typescript
// Transform API response to match UI expectations
export function transformEventForCard(event: WhatsOnEvent) {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    location: event.is_online ? 'Online Event' : event.location,
    dateRangeLabel: formatDateRange(event.schedule),
    isPaid: event.is_paid,
    priceLabel: event.is_paid 
      ? `${event.price_currency} ${event.price_amount}` 
      : 'Free',
    heroImage: event.hero_image_url || '/placeholder-event.png',
    thumbnail: event.thumbnail_url || '/placeholder-event.png',
    host: {
      name: event.creator.name,
      avatar: event.creator.profile_photo_url
    },
    rsvpCount: event.rsvp_count,
    isFullyBooked: event.is_fully_booked
  };
}

function formatDateRange(schedule: any[]): string {
  if (!schedule || schedule.length === 0) return 'TBA';
  
  const first = new Date(schedule[0].event_date);
  const last = new Date(schedule[schedule.length - 1].event_date);
  
  if (schedule.length === 1) {
    return format(first, 'MMM d, yyyy');
  }
  
  return `${format(first, 'MMM d')} - ${format(last, 'MMM d, yyyy')}`;
}
```

#### Step 1.5: Add Loading & Error States

**Loading Skeleton Component:**
```tsx
function EventListingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-gray-100 rounded-lg animate-pulse">
          <div className="aspect-[160/105] bg-gray-200 rounded-t-lg" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Empty State Component:**
```tsx
function EmptyState() {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">No events found. Try adjusting your filters.</p>
    </div>
  );
}
```

---

## Phase 2: Event Details & RSVP (HIGH PRIORITY)

### Objective
Connect event detail page to API, implement functional RSVP system with ticket generation.

### Files to Modify
1. `/app/(app)/(whatson)/whats-on/[slug]/page.tsx` - Event details
2. `/app/(app)/(whatson)/components/rsvp.tsx` - RSVP dialog

### Implementation Steps

#### Step 2.1: Update Event Details Page
**File:** `/app/(app)/(whatson)/whats-on/[slug]/page.tsx`

**Current State:**
- Uses `generateStaticParams()` with mock data
- Fetches from mock file: `getWhatsOnEventBySlug(slug)`

**Tasks:**
1. Change to dynamic page (remove `generateStaticParams`)
2. Fetch event by slug from API using event ID
3. Transform schedule array for display
4. Handle loading and error states
5. Add authentication check for RSVP button
6. Pass event data to RSVP component

**Implementation:**
```typescript
// Change from static to dynamic
export const dynamic = 'force-dynamic';

export default async function WhatsOnPage({ params }: WhatsOnPageProps) {
  const { slug } = await params;
  
  // Fetch from API instead of mock
  let event;
  try {
    const response = await whatsOnAPI.getEventById(slug); // Or fetch by slug
    event = response.data;
  } catch (error) {
    notFound();
  }
  
  // Transform data for UI
  const eventData = transformEventForDetail(event);
  
  return (
    // Render with real data
  );
}
```

#### Step 2.2: Implement RSVP Functionality
**File:** `/app/(app)/(whatson)/components/rsvp.tsx`

**Current State:**
- Mock button with no functionality

**Tasks:**
1. Create RSVP form with validation
2. Collect attendee information:
   - Number of spots (1 to max_spots_per_person)
   - Attendee names (array)
   - Contact email
   - Contact phone
3. Submit RSVP to API: `POST /api/whatson/[id]/rsvp`
4. Display ticket information on success
5. Handle payment flow if `is_paid === true`
6. Show error messages for validation failures
7. Disable button if event is fully booked
8. Check if user already has RSVP (prevent duplicates)

**Implementation:**
```typescript
'use client';

import { useState } from 'react';
import { whatsOnAPI } from '@/lib/api/whatson';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

interface RSVPProps {
  event: {
    id: string;
    max_spots_per_person: number;
    is_paid: boolean;
    is_fully_booked: boolean;
    price_amount: number;
    price_currency: string;
  };
}

export function RSVP({ event }: RSVPProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [spots, setSpots] = useState(1);
  const [attendeeNames, setAttendeeNames] = useState<string[]>(['']);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ticketInfo, setTicketInfo] = useState(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      // Redirect to login
      return;
    }

    setLoading(true);
    try {
      const response = await whatsOnAPI.createRSVP(event.id, {
        number_of_spots: spots,
        attendee_names: attendeeNames.filter(name => name.trim()),
        contact_email: email,
        contact_phone: phone
      });
      
      setTicketInfo(response.data); // Contains ticket_number, reference_number
      
      // Show success state
    } catch (error) {
      // Show error message
    } finally {
      setLoading(false);
    }
  };

  if (event.is_fully_booked) {
    return <button disabled>Fully Booked</button>;
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        RSVP Now
      </button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          {ticketInfo ? (
            <TicketDisplay ticket={ticketInfo} />
          ) : (
            <RSVPForm
              event={event}
              spots={spots}
              setSpots={setSpots}
              attendeeNames={attendeeNames}
              setAttendeeNames={setAttendeeNames}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              onSubmit={handleSubmit}
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
```

#### Step 2.3: Add Ticket Display Component

```typescript
function TicketDisplay({ ticket }: { ticket: any }) {
  return (
    <div className="text-center space-y-4">
      <h3 className="text-xl font-semibold">RSVP Confirmed!</h3>
      <div className="bg-gray-50 p-6 rounded-lg">
        <p className="text-sm text-gray-600">Ticket Number</p>
        <p className="text-2xl font-bold">{ticket.ticket_number}</p>
        <p className="text-sm text-gray-600 mt-4">Reference Number</p>
        <p className="text-lg font-medium">{ticket.reference_number}</p>
      </div>
      <p className="text-sm text-gray-600">
        A confirmation has been sent to your email.
      </p>
    </div>
  );
}
```

---

## Phase 3: Event Management (MEDIUM PRIORITY)

### Objective
Enable creators to view and manage their events, view RSVP lists, and export attendee data.

### Files to Modify
1. `/app/(app)/(whatson)/whats-on/manage-whats-on/page.tsx` - Management dashboard
2. `/app/(app)/(whatson)/components/data-table.tsx` - RSVP data table

### Implementation Steps

#### Step 3.1: Update Management Dashboard
**File:** `/app/(app)/(whatson)/whats-on/manage-whats-on/page.tsx`

**Tasks:**
1. Fetch user's events: `GET /api/whatson/my`
2. Display event cards with management actions
3. Show RSVP counts per event
4. Add delete confirmation dialog
5. Handle event status changes (publish/draft/cancel)

**Implementation:**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { whatsOnAPI } from '@/lib/api/whatson';
import { useAuth } from '@/contexts/AuthContext';

export default function ManageWhatsOnPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const response = await whatsOnAPI.getMyEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await axios.delete(`/api/whatson/${eventId}`);
      setEvents(events.filter(e => e.id !== eventId));
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-10 p-4 md:p-8">
      <div className="flex justify-between">
        <h1>Manage What's On</h1>
        <Link href="/whats-on/manage-whats-on/add-new">
          Create What's On
        </Link>
      </div>
      
      <section className="space-y-4">
        {events.map(event => (
          <ManageCard 
            key={event.id} 
            event={event}
            onDelete={() => handleDelete(event.id)}
          />
        ))}
      </section>
    </div>
  );
}
```

#### Step 3.2: Implement Event Card with Actions

```typescript
function ManageCard({ event, onDelete }: { event: any; onDelete: () => void }) {
  const [rsvps, setRsvps] = useState([]);
  const [showRsvps, setShowRsvps] = useState(false);

  const fetchRsvps = async () => {
    try {
      const response = await axios.get(`/api/whatson/${event.id}/rsvp/list`);
      setRsvps(response.data.data);
      setShowRsvps(true);
    } catch (error) {
      console.error('Failed to fetch RSVPs', error);
    }
  };

  const exportRsvps = async () => {
    try {
      const response = await axios.get(`/api/whatson/${event.id}/rsvp/export`, {
        responseType: 'blob'
      });
      
      // Download CSV file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${event.slug}-rsvps.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      {/* Event Info */}
      <h3>{event.title}</h3>
      <p>RSVPs: {event.rsvp_count} / {event.total_spots || '∞'}</p>
      
      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <Link href={`/whats-on/manage-whats-on/${event.id}`}>
          Edit
        </Link>
        <button onClick={fetchRsvps}>View RSVPs</button>
        <button onClick={exportRsvps}>Export CSV</button>
        <button onClick={onDelete} className="text-red-600">Delete</button>
      </div>
      
      {/* RSVP List */}
      {showRsvps && (
        <RSVPDataTable rsvps={rsvps} />
      )}
    </div>
  );
}
```

---

## Phase 4: Event Creation & Editing (MEDIUM PRIORITY)

### Objective
Build functional forms to create and edit events with all fields including schedule, tags, images.

### Files to Modify
1. `/app/(app)/(whatson)/whats-on/manage-whats-on/add-new/page.tsx` - Create form
2. `/app/(app)/(whatson)/whats-on/manage-whats-on/[id]/page.tsx` - Edit form
3. `/app/(app)/(whatson)/components/EditWhatsOnForm.tsx` - Shared form component

### Implementation Steps

#### Step 4.1: Build Event Creation Form
**File:** `/app/(app)/(whatson)/whats-on/manage-whats-on/add-new/page.tsx`

**Form Fields Required:**
```typescript
interface EventFormData {
  title: string;                    // 3-200 chars
  description: string;               // Max 10000 chars
  location: string;                  // Required if not online
  is_online: boolean;
  is_paid: boolean;
  price_amount: number;              // If is_paid
  price_currency: string;            // Default AED
  rsvp_deadline: string;             // ISO date
  max_spots_per_person: number;      // Default 1
  total_spots: number | null;        // Required if not unlimited
  is_unlimited_spots: boolean;
  terms_conditions: string;
  thumbnail_url: string;             // Upload to /api/upload/whatson-image
  hero_image_url: string;            // Upload to /api/upload/whatson-image
  status: 'draft' | 'published';
  schedule: Array<{
    event_date: string;              // YYYY-MM-DD
    start_time: string;              // HH:MM
    end_time: string;                // HH:MM
    timezone: string;                // Default GST
  }>;
  tags: string[];                    // Array of tag names
}
```

**Implementation:**
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import axios from '@/lib/axios';

export default function AddNewEventPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    location: '',
    is_online: false,
    is_paid: false,
    price_amount: 0,
    price_currency: 'AED',
    rsvp_deadline: '',
    max_spots_per_person: 1,
    total_spots: null,
    is_unlimited_spots: false,
    terms_conditions: '',
    thumbnail_url: '',
    hero_image_url: '',
    status: 'draft',
    schedule: [{ 
      event_date: '', 
      start_time: '', 
      end_time: '', 
      timezone: 'GST' 
    }],
    tags: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please log in to create an event');
      return;
    }

    // Validation
    if (formData.title.length < 3 || formData.title.length > 200) {
      alert('Title must be between 3 and 200 characters');
      return;
    }

    if (!formData.is_online && !formData.location) {
      alert('Location is required for in-person events');
      return;
    }

    if (!formData.is_unlimited_spots && !formData.total_spots) {
      alert('Total spots required if capacity is limited');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/whatson', formData);
      const newEvent = response.data.data;
      
      alert('Event created successfully!');
      router.push(`/whats-on/manage-whats-on/${newEvent.id}`);
    } catch (error: any) {
      alert(`Failed to create event: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1>Create New Event</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 mt-8">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Event Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border rounded-lg px-4 py-2"
            required
            minLength={3}
            maxLength={200}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 h-32"
            required
            maxLength={10000}
          />
        </div>

        {/* Online/In-Person Toggle */}
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_online}
              onChange={(e) => setFormData({ 
                ...formData, 
                is_online: e.target.checked 
              })}
            />
            <span className="ml-2">Online Event</span>
          </label>
        </div>

        {/* Location (if not online) */}
        {!formData.is_online && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>
        )}

        {/* Paid/Free Toggle */}
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_paid}
              onChange={(e) => setFormData({ 
                ...formData, 
                is_paid: e.target.checked 
              })}
            />
            <span className="ml-2">Paid Event</span>
          </label>
        </div>

        {/* Price (if paid) */}
        {formData.is_paid && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Price Amount *
              </label>
              <input
                type="number"
                value={formData.price_amount}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  price_amount: parseInt(e.target.value) 
                })}
                className="w-full border rounded-lg px-4 py-2"
                required
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Currency
              </label>
              <select
                value={formData.price_currency}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  price_currency: e.target.value 
                })}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>
        )}

        {/* Schedule Section */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Event Schedule *
          </label>
          {formData.schedule.map((slot, index) => (
            <div key={index} className="grid grid-cols-4 gap-2 mb-2">
              <input
                type="date"
                value={slot.event_date}
                onChange={(e) => {
                  const newSchedule = [...formData.schedule];
                  newSchedule[index].event_date = e.target.value;
                  setFormData({ ...formData, schedule: newSchedule });
                }}
                className="border rounded px-2 py-1"
                required
              />
              <input
                type="time"
                value={slot.start_time}
                onChange={(e) => {
                  const newSchedule = [...formData.schedule];
                  newSchedule[index].start_time = e.target.value;
                  setFormData({ ...formData, schedule: newSchedule });
                }}
                className="border rounded px-2 py-1"
                required
              />
              <input
                type="time"
                value={slot.end_time}
                onChange={(e) => {
                  const newSchedule = [...formData.schedule];
                  newSchedule[index].end_time = e.target.value;
                  setFormData({ ...formData, schedule: newSchedule });
                }}
                className="border rounded px-2 py-1"
                required
              />
              <input
                type="text"
                value={slot.timezone}
                onChange={(e) => {
                  const newSchedule = [...formData.schedule];
                  newSchedule[index].timezone = e.target.value;
                  setFormData({ ...formData, schedule: newSchedule });
                }}
                placeholder="Timezone"
                className="border rounded px-2 py-1"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setFormData({
              ...formData,
              schedule: [...formData.schedule, {
                event_date: '',
                start_time: '',
                end_time: '',
                timezone: 'GST'
              }]
            })}
            className="text-sm text-blue-600"
          >
            + Add Another Date
          </button>
        </div>

        {/* Capacity Settings */}
        <div>
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={formData.is_unlimited_spots}
              onChange={(e) => setFormData({ 
                ...formData, 
                is_unlimited_spots: e.target.checked 
              })}
            />
            <span className="ml-2">Unlimited Spots</span>
          </label>

          {!formData.is_unlimited_spots && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Total Spots *
                </label>
                <input
                  type="number"
                  value={formData.total_spots || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    total_spots: parseInt(e.target.value) 
                  })}
                  className="w-full border rounded-lg px-4 py-2"
                  required
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Spots Per Person
                </label>
                <input
                  type="number"
                  value={formData.max_spots_per_person}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    max_spots_per_person: parseInt(e.target.value) 
                  })}
                  className="w-full border rounded-lg px-4 py-2"
                  min={1}
                  max={formData.total_spots || 100}
                />
              </div>
            </div>
          )}
        </div>

        {/* RSVP Deadline */}
        <div>
          <label className="block text-sm font-medium mb-2">
            RSVP Deadline
          </label>
          <input
            type="datetime-local"
            value={formData.rsvp_deadline}
            onChange={(e) => setFormData({ 
              ...formData, 
              rsvp_deadline: e.target.value 
            })}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={formData.tags.join(', ')}
            onChange={(e) => setFormData({ 
              ...formData, 
              tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
            })}
            placeholder="networking, film, media"
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        {/* Image Uploads */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Thumbnail Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = await uploadImage(file);
                  setFormData({ ...formData, thumbnail_url: url });
                }
              }}
              className="w-full"
            />
            {formData.thumbnail_url && (
              <img src={formData.thumbnail_url} alt="Thumbnail preview" className="mt-2 h-20" />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Hero Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = await uploadImage(file);
                  setFormData({ ...formData, hero_image_url: url });
                }
              }}
              className="w-full"
            />
            {formData.hero_image_url && (
              <img src={formData.hero_image_url} alt="Hero preview" className="mt-2 h-20" />
            )}
          </div>
        </div>

        {/* Terms & Conditions */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Terms & Conditions
          </label>
          <textarea
            value={formData.terms_conditions}
            onChange={(e) => setFormData({ 
              ...formData, 
              terms_conditions: e.target.value 
            })}
            className="w-full border rounded-lg px-4 py-2 h-24"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ 
              ...formData, 
              status: e.target.value as 'draft' | 'published'
            })}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#31A7AC] text-white px-6 py-2 rounded-lg"
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border px-6 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// Helper function to upload images
async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'whatson');

  const response = await axios.post('/api/upload/whatson-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data.url;
}
```

#### Step 4.2: Build Edit Event Form
**File:** `/app/(app)/(whatson)/whats-on/manage-whats-on/[id]/page.tsx`

**Tasks:**
1. Fetch existing event data: `GET /api/whatson/[id]`
2. Pre-populate form with existing values
3. Submit updates: `PATCH /api/whatson/[id]`
4. Handle schedule updates (add/remove/edit slots)
5. Handle tag updates (add/remove tags)
6. Allow image replacement

**Implementation:**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from '@/lib/axios';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<EventFormData | null>(null);

  useEffect(() => {
    fetchEventData();
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/whatson/${eventId}`);
      setFormData(transformEventToFormData(response.data.data));
    } catch (error) {
      console.error('Failed to fetch event', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSaving(true);
    try {
      await axios.patch(`/api/whatson/${eventId}`, formData);
      alert('Event updated successfully!');
      router.push('/whats-on/manage-whats-on');
    } catch (error: any) {
      alert(`Failed to update event: ${error.response?.data?.error || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading event...</div>;
  if (!formData) return <div>Event not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1>Edit Event</h1>
      
      {/* Same form as create, but with formData pre-populated */}
      <form onSubmit={handleSubmit} className="space-y-6 mt-8">
        {/* Same fields as Add New page */}
        
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#31A7AC] text-white px-6 py-2 rounded-lg"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border px-6 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function transformEventToFormData(event: any): EventFormData {
  return {
    title: event.title,
    description: event.description,
    location: event.location || '',
    is_online: event.is_online,
    is_paid: event.is_paid,
    price_amount: event.price_amount,
    price_currency: event.price_currency,
    rsvp_deadline: event.rsvp_deadline,
    max_spots_per_person: event.max_spots_per_person,
    total_spots: event.total_spots,
    is_unlimited_spots: event.is_unlimited_spots,
    terms_conditions: event.terms_conditions || '',
    thumbnail_url: event.thumbnail_url || '',
    hero_image_url: event.hero_image_url || '',
    status: event.status,
    schedule: event.schedule || [],
    tags: event.tags || []
  };
}
```

---

## Data Transformation Guide

### API Response → UI Display

#### Event List Card
```typescript
// API Response
{
  id: "uuid",
  slug: "event-slug",
  title: "Networking Event",
  is_online: false,
  location: "Dubai Media City",
  is_paid: true,
  price_amount: 50,
  price_currency: "AED",
  thumbnail_url: "https://storage.../image.jpg",
  schedule: [
    { event_date: "2025-02-01", start_time: "18:00", end_time: "21:00" }
  ],
  creator: { name: "John Doe", profile_photo_url: "..." },
  rsvp_count: 45
}

// Transform to UI format
{
  id: "uuid",
  slug: "event-slug",
  title: "Networking Event",
  location: "Dubai Media City",
  dateRangeLabel: "Feb 1, 2025",
  isPaid: true,
  priceLabel: "AED 50",
  heroImage: "https://storage.../image.jpg",
  thumbnail: "https://storage.../image.jpg",
  host: {
    name: "John Doe",
    avatar: "..."
  }
}
```

#### Schedule Array
```typescript
// API format
schedule: [
  {
    event_date: "2025-02-01",
    start_time: "18:00",
    end_time: "21:00",
    timezone: "GST"
  }
]

// UI format
schedule: [
  {
    dateLabel: "Sat, Feb 1, 2025",
    timeRange: "6:00 PM - 9:00 PM",
    timezone: "GST"
  }
]
```

---

## Testing Strategy

### Manual Testing Checklist

#### Phase 1: Event Listing
- [ ] Events load on page mount
- [ ] Loading skeleton displays while fetching
- [ ] Empty state shows when no events found
- [ ] Filter by price (free/paid) works
- [ ] Filter by event type works
- [ ] Filter by status (upcoming/past) works
- [ ] Filter by location works
- [ ] Filter by attendance mode (online/in-person) works
- [ ] Calendar date selection filters events
- [ ] Search by keyword works
- [ ] Pagination works (load more)
- [ ] Event cards display correctly with real images
- [ ] Click on card navigates to detail page

#### Phase 2: Event Details & RSVP
- [ ] Event detail page loads with correct data
- [ ] Schedule displays all dates correctly
- [ ] Tags display correctly
- [ ] Terms & conditions display
- [ ] RSVP button visible for authenticated users
- [ ] RSVP button disabled if fully booked
- [ ] RSVP form opens when clicked
- [ ] RSVP form validates spot selection (1 to max_spots_per_person)
- [ ] RSVP form validates attendee names
- [ ] RSVP form validates contact email
- [ ] RSVP form validates contact phone
- [ ] RSVP submission creates ticket
- [ ] Ticket number displays after successful RSVP
- [ ] Reference number displays after successful RSVP
- [ ] Duplicate RSVP prevented (show error message)
- [ ] Payment flow triggered if event is paid

#### Phase 3: Event Management
- [ ] User's events load in management dashboard
- [ ] RSVP counts display correctly
- [ ] Edit button navigates to edit form
- [ ] Delete button shows confirmation
- [ ] Delete removes event from list
- [ ] View RSVPs button shows RSVP list
- [ ] Export CSV downloads file
- [ ] CSV contains all RSVP data

#### Phase 4: Event Creation & Editing
- [ ] Create form displays with all fields
- [ ] Title validation (3-200 chars) works
- [ ] Description validation (max 10000 chars) works
- [ ] Location required if not online
- [ ] Total spots required if not unlimited
- [ ] Schedule date/time fields work
- [ ] Add multiple schedule slots works
- [ ] Remove schedule slots works
- [ ] Image upload works for thumbnail
- [ ] Image upload works for hero image
- [ ] Image preview displays after upload
- [ ] Tags input accepts comma-separated values
- [ ] Form submission creates event
- [ ] Draft status saves without publishing
- [ ] Published status makes event visible
- [ ] Edit form pre-populates with existing data
- [ ] Edit form updates event correctly
- [ ] Cancel button navigates back

### API Testing (curl commands)

```bash
# List events
curl -X GET 'http://localhost:3000/api/whatson?status=published&limit=10'

# Get event by ID
curl -X GET 'http://localhost:3000/api/whatson/[event-id]'

# Create RSVP (requires auth token)
curl -X POST 'http://localhost:3000/api/whatson/[event-id]/rsvp' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "number_of_spots": 2,
    "attendee_names": ["John Doe", "Jane Smith"],
    "contact_email": "john@example.com",
    "contact_phone": "+971501234567"
  }'

# Get my events
curl -X GET 'http://localhost:3000/api/whatson/my' \
  -H 'Authorization: Bearer YOUR_TOKEN'

# Get my RSVPs
curl -X GET 'http://localhost:3000/api/whatson/rsvps/my' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

---

## Success Criteria

### Phase 1 Complete When:
✅ Event listing page shows real events from database  
✅ All filters work and query the API correctly  
✅ Search functionality returns relevant results  
✅ Loading and error states handled gracefully  
✅ Event cards display with correct images and data

### Phase 2 Complete When:
✅ Event detail page loads with full event information  
✅ RSVP button functional for authenticated users  
✅ RSVP form validates all inputs  
✅ RSVP submission generates ticket with numbers  
✅ Ticket information displayed to user  
✅ Duplicate RSVPs prevented

### Phase 3 Complete When:
✅ Management dashboard shows user's created events  
✅ RSVP lists display for each event  
✅ CSV export downloads attendee data  
✅ Delete functionality removes events  
✅ Edit navigation works

### Phase 4 Complete When:
✅ Create form accepts all required fields  
✅ Form validation prevents invalid submissions  
✅ Image uploads work and display previews  
✅ Event creation adds record to database  
✅ Edit form updates existing events  
✅ Draft and published statuses work correctly

---

## Common Pitfalls & Solutions

### Pitfall 1: Image URLs Not Loading
**Problem:** Images from Supabase Storage show 403 errors

**Solution:**
- Check storage bucket is public for `whatson-images/`
- Verify RLS policies allow public read access
- Use signed URLs for private buckets

### Pitfall 2: RSVP Duplicate Error
**Problem:** User tries to RSVP twice to same event

**Solution:**
- Check for existing RSVP before showing form
- Display "Already Registered" message instead of form
- Offer "Cancel RSVP" option

### Pitfall 3: Schedule Time Format Issues
**Problem:** Time inputs save incorrectly

**Solution:**
- Use ISO format for time: `HH:MM` (24-hour)
- Validate time format before submission
- Display in user's local timezone on frontend

### Pitfall 4: Filter State Not Syncing
**Problem:** Filters don't update query parameters

**Solution:**
- Use URL query params to store filter state
- Sync filter form with URL on mount
- Update URL when filters change

### Pitfall 5: Unauthorized API Calls
**Problem:** Authenticated endpoints return 401

**Solution:**
- Ensure auth token passed in headers
- Check token validity and refresh if expired
- Redirect to login if no valid session

---

## Next Steps After Implementation

1. **Performance Optimization:**
   - Implement caching for event list
   - Add pagination with infinite scroll
   - Optimize images with Next.js Image component

2. **Enhanced Features:**
   - Email notifications for RSVP confirmations
   - Calendar integration (Add to Google Calendar)
   - Social sharing buttons
   - Event recommendations based on user interests

3. **Analytics:**
   - Track event views
   - Monitor RSVP conversion rates
   - Analyze popular event types

4. **Admin Features:**
   - Bulk event management
   - Event duplication
   - Attendance tracking (check-in system)

---

## Support & Resources

### Documentation References
- API Documentation: `/documentation/API-Docs/API_DOC.md`
- Backend Architecture: `/documentation/backend-documentation-and-commands/UPDATED_BACKEND_ARCHITECTURE.md`
- Supabase Docs: https://supabase.com/docs

### Key Files
- API Routes: `/app/api/whatson/`
- Frontend Pages: `/app/(app)/(whatson)/`
- Type Definitions: `/types/index.ts`
- Axios Config: `/lib/axios.ts`
- Auth Context: `/contexts/AuthContext.tsx`

### Contact
For questions or issues during implementation:
- Check existing API documentation first
- Test endpoints with curl/Postman
- Review RLS policies in Supabase dashboard
- Verify authentication token format

---

**End of API Integration Plan**
