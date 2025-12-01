# API Documentation

> **Project:** Next.js 15 App Router + TypeScript + Supabase  
> **Base URL:** `/api`  
> **Authentication:** Bearer token in `Authorization` header

---

## API File Structure

All API routes are implemented using Next.js 15 App Router and are located in:

**Base Directory:** `app/api/`

### Folder Structure
```
app/api/
├── health/              # Health check endpoint
├── profile/             # User profile management
│   ├── check/
│   ├── credits/
│   ├── highlights/
│   ├── languages/
│   ├── links/
│   ├── recommendations/
│   ├── roles/
│   ├── travel-countries/
│   ├── visa/
│   └── route.ts
├── skills/              # Skills management
│   ├── [id]/
│   └── route.ts
├── availability/        # Availability calendar
│   ├── [id]/
│   ├── check/
│   └── route.ts
├── notifications/       # Notifications system
│   ├── [id]/
│   ├── mark-all-read/
│   └── route.ts
├── contacts/            # Contacts management
│   ├── [id]/
│   ├── gig/
│   └── route.ts
├── referrals/           # Referrals system
│   └── route.ts
├── upload/              # File uploads (6 types)
│   ├── resume/
│   ├── portfolio/
│   ├── profile-photo/
│   ├── collab-cover/
│   ├── slate-media/
│   └── project-asset/
├── gigs/                # Gigs marketplace
│   ├── [id]/
│   ├── slug/
│   └── route.ts
├── applications/        # Job applications
│   ├── [id]/
│   └── my/
├── collab/              # Collaboration platform
│   ├── [id]/
│   ├── my/
│   └── route.ts
├── slate/               # Social media feed
│   ├── [id]/
│   ├── comment/
│   ├── my/
│   ├── saved/
│   └── route.ts
├── whatson/             # Events platform
│   ├── [id]/
│   ├── my/
│   ├── rsvps/
│   └── route.ts
├── projects/            # Design projects
│   ├── [id]/
│   ├── my/
│   └── route.ts
└── explore/             # Crew directory
    ├── [userId]/
    ├── categories/
    └── route.ts
```

### Route File Convention
- Each API route is implemented in a `route.ts` file (Next.js App Router convention)
- Dynamic routes use bracket notation: `[id]`, `[userId]`, etc.
- HTTP methods are exported functions: `GET`, `POST`, `PATCH`, `DELETE`

**Example:** The endpoint `/api/profile` is implemented in `app/api/profile/route.ts`

---

## Table of Contents

1. [Health Check](#health-check)
2. [Gigs API](#gigs-api)
3. [Applications API](#applications-api)
4. [Slate (Social Feed) API](#slate-social-feed-api)
5. [Collab (Collaboration) API](#collab-collaboration-api)
6. [What's On (Events) API](#whats-on-events-api)
7. [Projects API](#projects-api)
8. [Profile API](#profile-api)
9. [Explore (Crew Directory) API](#explore-crew-directory-api)
10. [Contacts API](#contacts-api)
11. [Notifications API](#notifications-api)
12. [Skills API](#skills-api)
13. [Availability API](#availability-api)
14. [Referrals API](#referrals-api)
15. [Upload API](#upload-api)
16. [Placeholder Routes Summary](#placeholder-routes-summary)

---

## Health Check

### GET `/api/health`
**Description:** Health check endpoint to verify API status  
**Authentication:** None  
**Status:** ✅ Implemented

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-01-15T10:30:00.000Z"
  },
  "message": "API is healthy"
}
```

---

## Gigs API

### GET `/api/gigs`
**Description:** Get all active gigs with pagination and filters  
**Authentication:** Optional (for `createdBy=me` filter)  
**Status:** ✅ Implemented

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `search` - Search in title/description
- `role` - Filter by role
- `type` - Filter by type
- `location` - Filter by location
- `createdBy` - Filter by creator (`me` or user ID)

**Response:**
```json
{
  "success": true,
  "data": {
    "gigs": [
      {
        "id": "uuid",
        "slug": "gig-title-slug",
        "title": "Camera Operator",
        "description": "...",
        "qualifyingCriteria": "...",
        "budgetLabel": "AED 500-1000",
        "amount": 500,
        "currency": "AED",
        "crewCount": 2,
        "role": "Camera",
        "type": "Film",
        "department": "Camera",
        "company": "Production Co.",
        "postedOn": "2025-01-01T00:00:00Z",
        "postedBy": {
          "name": "John Doe",
          "avatar": "url"
        },
        "dateWindows": [
          {
            "label": "January 2025",
            "range": "15-20"
          }
        ],
        "location": "Dubai, Abu Dhabi",
        "applyBefore": "2025-01-25T00:00:00Z",
        "applicationCount": 5
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalGigs": 95,
      "limit": 20
    }
  }
}
```

---

### POST `/api/gigs`
**Description:** Create a new gig (requires complete profile)  
**Authentication:** Required  
**Status:** ✅ Implemented

**Request Body:**
```json
{
  "title": "Camera Operator",
  "description": "Looking for experienced camera operator",
  "qualifyingCriteria": "3+ years experience",
  "amount": 500,
  "currency": "AED",
  "crewCount": 2,
  "role": "Camera",
  "type": "Film",
  "department": "Camera",
  "company": "Production Co.",
  "isTbc": false,
  "requestQuote": false,
  "expiryDate": "2025-01-25T00:00:00Z",
  "supportingFileLabel": "Portfolio",
  "referenceUrl": "https://...",
  "status": "active",
  "dateWindows": [
    {
      "label": "January 2025",
      "range": "15-20"
    }
  ],
  "locations": ["Dubai", "Abu Dhabi"],
  "references": [
    {
      "label": "Company Website",
      "url": "https://...",
      "type": "website"
    }
  ]
}
```

---

### GET `/api/gigs/[id]`
**Description:** Get gig details by ID  
**Authentication:** None  
**Status:** ✅ Implemented

---

### GET `/api/gigs/slug/[slug]`
**Description:** Get gig details by slug  
**Authentication:** None  
**Status:** ✅ Implemented

---

### PATCH `/api/gigs/[id]`
**Description:** Update gig (creator only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### DELETE `/api/gigs/[id]`
**Description:** Delete gig (creator only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### POST `/api/gigs/[id]/apply`
**Description:** Apply to a gig  
**Authentication:** Required  
**Status:** ✅ Implemented

**Request Body:**
```json
{
  "coverLetter": "I am interested...",
  "portfolioLinks": ["https://...", "https://..."],
  "resumeUrl": "https://..."
}
```

---

### GET `/api/gigs/[id]/applications`
**Description:** Get all applications for a gig (creator only)  
**Authentication:** Required  
**Status:** ✅ Implemented

**Query Parameters:**
- `status` - Filter by status: `pending`, `accepted`, `rejected`

---

### PATCH `/api/gigs/[id]/applications/[applicationId]/status`
**Description:** Update application status (creator only)  
**Authentication:** Required  
**Status:** ✅ Implemented

**Request Body:**
```json
{
  "status": "accepted"
}
```

---

## Applications API

### GET `/api/applications/[id]`
**Description:** Get application details (applicant or gig creator only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### GET `/api/applications/my`
**Description:** Get current user's applications  
**Authentication:** Required  
**Status:** ✅ Implemented

**Query Parameters:**
- `status` - Filter by status: `pending`, `accepted`, `rejected`
- `page` (default: 1)
- `limit` (default: 20)

---

### DELETE `/api/applications/[id]`
**Description:** Withdraw application (applicant only, pending status only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

## Slate (Social Feed) API

### GET `/api/slate`
**Description:** Get slate feed (published posts with pagination)  
**Authentication:** Optional  
**Status:** ✅ Implemented

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 50)
- `sort` - `latest` or `popular`
- `search` - Full-text search in content

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid",
        "content": "Post content here...",
        "slug": "post-slug",
        "status": "published",
        "likes_count": 42,
        "comments_count": 5,
        "shares_count": 3,
        "created_at": "2025-01-15T10:00:00Z",
        "author": {
          "id": "uuid",
          "name": "John Doe",
          "avatar": "url"
        },
        "media": [
          {
            "id": "uuid",
            "media_url": "https://...",
            "media_type": "image",
            "sort_order": 0
          }
        ],
        "user_has_liked": false,
        "user_has_saved": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "hasMore": true
    }
  }
}
```

---

### POST `/api/slate`
**Description:** Create a new slate post  
**Authentication:** Required  
**Status:** ✅ Implemented

**Request Body:**
```json
{
  "content": "Post content here (1-5000 characters)",
  "status": "published",
  "media_urls": [
    "https://storage-url/image1.jpg",
    "https://storage-url/video1.mp4"
  ]
}
```

---

### GET `/api/slate/[id]`
**Description:** Get slate post details  
**Authentication:** Optional  
**Status:** ✅ Implemented

---

### PATCH `/api/slate/[id]`
**Description:** Update slate post (owner only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### DELETE `/api/slate/[id]`
**Description:** Delete slate post (owner only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### GET `/api/slate/my`
**Description:** Get current user's posts  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### GET `/api/slate/saved`
**Description:** Get current user's saved posts  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### POST `/api/slate/[id]/like`
**Description:** Like/unlike a post  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### POST `/api/slate/[id]/save`
**Description:** Save/unsave a post  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### GET `/api/slate/[id]/likes`
**Description:** Get users who liked a post  
**Authentication:** Optional  
**Status:** ✅ Implemented

---

### POST `/api/slate/[id]/comment`
**Description:** Add a comment to a post  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### POST `/api/slate/[id]/share`
**Description:** Share a post (increment share count)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### PATCH `/api/slate/comment/[commentId]`
**Description:** Update a comment (owner only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### DELETE `/api/slate/comment/[commentId]`
**Description:** Delete a comment (owner only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

## Collab (Collaboration) API

### GET `/api/collab`
**Description:** Get all collab posts with pagination and filters  
**Authentication:** Optional  
**Status:** ✅ Implemented

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `status` - `all`, `open`, `closed`
- `tag` - Filter by tag
- `search` - Search in title/summary
- `sortBy` - `created_at`, `interests` (default: `created_at`)
- `sortOrder` - `asc`, `desc` (default: `desc`)

**Response:**
```json
{
  "success": true,
  "data": {
    "collabs": [
      {
        "id": "uuid",
        "title": "Collab Title",
        "slug": "collab-title-slug",
        "summary": "Collab description...",
        "tags": ["filmmaking", "production"],
        "cover_image_url": "https://...",
        "status": "open",
        "interests": 5,
        "interestAvatars": ["url1", "url2", "url3"],
        "author": {
          "id": "uuid",
          "name": "Jane Doe",
          "avatar": "url"
        },
        "created_at": "2025-01-10T00:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCollabs": 50,
      "limit": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### POST `/api/collab`
**Description:** Create a new collab post  
**Authentication:** Required  
**Status:** ✅ Implemented

**Request Body:**
```json
{
  "title": "Looking for cinematographer",
  "summary": "Detailed description (10-5000 chars)",
  "tags": ["filmmaking", "documentary"],
  "cover_image_url": "https://...",
  "status": "open"
}
```

---

### GET `/api/collab/[id]`
**Description:** Get specific collab post details  
**Authentication:** Optional  
**Status:** ✅ Implemented

---

### PATCH `/api/collab/[id]`
**Description:** Update collab post (owner only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### DELETE `/api/collab/[id]`
**Description:** Delete collab post (owner only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### GET `/api/collab/my`
**Description:** Get current user's collab posts  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### POST `/api/collab/[id]/interest`
**Description:** Express/remove interest in a collab  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### GET `/api/collab/[id]/interests`
**Description:** Get users interested in a collab (owner only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### POST `/api/collab/[id]/close`
**Description:** Close a collab (owner only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### GET `/api/collab/[id]/collaborators`
**Description:** Get collaborators for a collab (owner only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### POST `/api/collab/[id]/collaborators`
**Description:** Add a collaborator (owner only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### DELETE `/api/collab/[id]/collaborators/[userId]`
**Description:** Remove a collaborator (owner only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

## What's On (Events) API

### GET `/api/whatson`
**Description:** Get all events with pagination and filters  
**Authentication:** Optional  
**Status:** ✅ Implemented

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `status` - `published`, `draft`, `cancelled` (default: `published`)
- `keyword` - Search in title/description
- `isPaid` - `true` or `false`
- `isOnline` - `true` or `false`
- `location` - Filter by location
- `dateFrom` - Filter events from date
- `dateTo` - Filter events to date
- `tags` - Comma-separated tags
- `sortBy` - Field to sort by (default: `created_at`)
- `sortOrder` - `asc` or `desc` (default: `desc`)

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "uuid",
        "title": "Networking Event",
        "slug": "networking-event",
        "location": "Dubai Media City",
        "is_online": false,
        "is_paid": true,
        "price_amount": 50,
        "price_currency": "AED",
        "rsvp_deadline": "2025-01-20T00:00:00Z",
        "max_spots_per_person": 2,
        "total_spots": 100,
        "is_unlimited_spots": false,
        "description": "...",
        "thumbnail_url": "https://...",
        "hero_image_url": "https://...",
        "status": "published",
        "schedule": [
          {
            "event_date": "2025-01-25",
            "start_time": "18:00",
            "end_time": "21:00",
            "timezone": "GST"
          }
        ],
        "tags": ["networking", "media"],
        "creator": {
          "name": "John Doe",
          "profile_photo_url": "url"
        },
        "rsvp_count": 45,
        "spots_booked": 67,
        "is_fully_booked": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "total_pages": 3
    }
  }
}
```

---

### POST `/api/whatson`
**Description:** Create a new event  
**Authentication:** Required  
**Status:** ✅ Implemented

**Request Body:**
```json
{
  "title": "Event Title (3-200 chars)",
  "description": "Event description (required, max 10000 chars)",
  "location": "Dubai Media City",
  "is_online": false,
  "is_paid": true,
  "price_amount": 50,
  "price_currency": "AED",
  "rsvp_deadline": "2025-01-20T00:00:00Z",
  "max_spots_per_person": 2,
  "total_spots": 100,
  "is_unlimited_spots": false,
  "terms_conditions": "...",
  "thumbnail_url": "https://...",
  "hero_image_url": "https://...",
  "status": "draft",
  "schedule": [
    {
      "event_date": "2025-01-25",
      "start_time": "18:00",
      "end_time": "21:00",
      "timezone": "GST"
    }
  ],
  "tags": ["networking", "media"]
}
```

---

### GET `/api/whatson/[id]`
**Description:** Get event details  
**Authentication:** Optional  
**Status:** ✅ Implemented

---

### PATCH `/api/whatson/[id]`
**Description:** Update event (creator only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### DELETE `/api/whatson/[id]`
**Description:** Delete event (creator only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### GET `/api/whatson/my`
**Description:** Get current user's events  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### POST `/api/whatson/[id]/rsvp`
**Description:** RSVP to an event  
**Authentication:** Required  
**Status:** ✅ Implemented

**Request Body:**
```json
{
  "number_of_spots": 2,
  "attendee_names": ["John Doe", "Jane Smith"],
  "contact_email": "john@example.com",
  "contact_phone": "+971501234567"
}
```

---

### GET `/api/whatson/[id]/rsvp/list`
**Description:** Get RSVPs for an event (creator only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### GET `/api/whatson/[id]/rsvp/export`
**Description:** Export RSVPs as CSV (creator only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### GET `/api/whatson/rsvps/my`
**Description:** Get current user's RSVPs  
**Authentication:** Required  
**Status:** ✅ Implemented

---

## Projects API

### GET `/api/projects`
**Description:** Get all public projects with pagination  
**Authentication:** Optional  
**Status:** ✅ Implemented

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `type` - Filter by project type
- `status` - Filter by status
- `search` - Search in title/description
- `sortBy` - Field to sort by (default: `created_at`)
- `sortOrder` - `asc` or `desc` (default: `desc`)

---

### POST `/api/projects`
**Description:** Create a new project  
**Authentication:** Required  
**Status:** ✅ Implemented

**Request Body:**
```json
{
  "title": "Project Title (3-200 chars)",
  "description": "Project description (10-10000 chars)",
  "project_type": "film",
  "status": "draft",
  "start_date": "2025-02-01",
  "end_date": "2025-03-31",
  "estimated_duration": "2 months",
  "budget_amount": 50000,
  "budget_currency": "AED",
  "location": "Dubai",
  "is_remote": false,
  "thumbnail_url": "https://...",
  "hero_image_url": "https://...",
  "privacy": "public",
  "tags": ["documentary", "short-film"]
}
```

---

### GET `/api/projects/[id]`
**Description:** Get project details  
**Authentication:** Optional  
**Status:** ✅ Implemented

---

### PATCH `/api/projects/[id]`
**Description:** Update project (owner only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### DELETE `/api/projects/[id]`
**Description:** Delete project (owner only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### GET `/api/projects/my`
**Description:** Get current user's projects  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### GET `/api/projects/[id]/team`
**Description:** Get project team members  
**Authentication:** Optional  
**Status:** ✅ Implemented

---

### POST `/api/projects/[id]/team`
**Description:** Add team member (owner only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### DELETE `/api/projects/[id]/team/[userId]`
**Description:** Remove team member (owner only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### GET `/api/projects/[id]/files`
**Description:** Get project files  
**Authentication:** Optional  
**Status:** ✅ Implemented

---

### POST `/api/projects/[id]/files`
**Description:** Upload project file (team member only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### DELETE `/api/projects/[id]/files/[fileId]`
**Description:** Delete project file (uploader or owner only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### GET `/api/projects/[id]/links`
**Description:** Get project links  
**Authentication:** Optional  
**Status:** ✅ Implemented

---

### POST `/api/projects/[id]/links`
**Description:** Add project link (team member only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### DELETE `/api/projects/[id]/links/[linkId]`
**Description:** Delete project link (creator or owner only)  
**Authentication:** Required  
**Status:** ✅ Implemented

---

## Profile API

### GET `/api/profile`
**Description:** Get current user's profile  
**Authentication:** Required  
**Status:** ✅ Implemented

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "first_name": "John",
    "surname": "Doe",
    "alias_first_name": "John",
    "alias_surname": "D.",
    "profile_photo_url": "https://...",
    "banner_url": "https://...",
    "bio": "...",
    "country": "United Arab Emirates",
    "city": "Dubai",
    "email": "john@example.com",
    "phone": "+971501234567",
    "country_code": "+971",
    "portfolio_url": "https://...",
    "imdb_url": "https://...",
    "availability": "available",
    "day_rate": 150000,
    "day_rate_currency": "USD",
    "work_identities": {
      "freelance": true,
      "employee": {
        "enabled": false,
        "company": "",
        "designation": ""
      },
      "businessOwner": {
        "enabled": false,
        "designation": "",
        "businessName": "",
        "businessType": ""
      }
    },
    "visible_in_explore": true,
    "is_profile_complete": true,
    "profile_completion_percentage": 100,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-15T00:00:00Z"
  }
}
```

**Note:** `day_rate` is stored in cents (150000 = $1,500.00)

---

### PATCH `/api/profile`
**Description:** Create or update user profile  
**Authentication:** Required  
**Status:** ✅ Implemented

**Request Body:**
```json
{
  "first_name": "John",
  "surname": "Doe",
  "bio": "Professional cinematographer...",
  "country": "United Arab Emirates",
  "city": "Dubai",
  "phone": "+971501234567",
  "day_rate": 150000,
  "day_rate_currency": "USD",
  "work_identities": {
    "freelance": true,
    "employee": {
      "enabled": true,
      "company": "Warner Bros",
      "designation": "Senior Cinematographer"
    },
    "businessOwner": {
      "enabled": false,
      "designation": "",
      "businessName": "",
      "businessType": ""
    }
  }
}
```

**Validation Rules:**
- `day_rate`: Must be a positive number (stored in cents) or null
- `day_rate_currency`: Must be one of: USD, AED, EUR, GBP, INR, CAD, AUD, JPY, CNY, SGD
- `work_identities`: Must include all three keys (freelance, employee, businessOwner) with proper structure

---

### GET `/api/profile/check`
**Description:** Check profile completion status  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### GET `/api/profile/roles`
**Description:** Get user's professional roles  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### POST `/api/profile/roles`
**Description:** Add a professional role  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### DELETE `/api/profile/roles?id=[roleId]`
**Description:** Delete a professional role  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### GET `/api/profile/visa`
**Description:** Get user's visa status  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### PATCH `/api/profile/visa`
**Description:** Update user's visa status  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### GET `/api/profile/highlights`
**Description:** Get user's career highlights  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### POST `/api/profile/highlights`
**Description:** Add a career highlight  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### DELETE `/api/profile/highlights?id=[highlightId]`
**Description:** Delete a career highlight  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### GET `/api/profile/credits`
**Description:** Get user's credits  
**Authentication:** Required  
**Status:** ✅ Implemented

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "credit_title": "Nike Summer Campaign 2024",
      "description": "Directed major commercial campaign",
      "start_date": "2024-01-15",
      "end_date": "2024-02-28",
      "image_url": "https://...",
      "sort_order": 0,
      "production_type": "Commercial",
      "role": "Director",
      "project_title": "Just Do It - Summer Edition",
      "brand_client": "Nike",
      "local_company": "Dubai Media Productions",
      "international_company": "Wieden+Kennedy",
      "country": "UAE",
      "release_year": "2024",
      "is_unreleased": false,
      "headline_stats": "100M+ views across platforms",
      "awards": [
        {
          "title": "Best Commercial",
          "detail": "Dubai Advertising Awards 2024"
        }
      ],
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ],
  "message": "Credits retrieved successfully"
}
```

---

### POST `/api/profile/credits`
**Description:** Add a credit  
**Authentication:** Required  
**Status:** ✅ Implemented

**Request Body:**
```json
{
  "credit_title": "Nike Summer Campaign 2024",
  "description": "Directed major commercial campaign",
  "start_date": "2024-01-15",
  "end_date": "2024-02-28",
  "image_url": "https://...",
  "sort_order": 0,
  "production_type": "Commercial",
  "role": "Director",
  "project_title": "Just Do It - Summer Edition",
  "brand_client": "Nike",
  "local_company": "Dubai Media Productions",
  "international_company": "Wieden+Kennedy",
  "country": "UAE",
  "release_year": "2024",
  "is_unreleased": false,
  "headline_stats": "100M+ views across platforms",
  "awards": [
    {
      "title": "Best Commercial",
      "detail": "Dubai Advertising Awards 2024"
    }
  ]
}
```

**Required Fields:**
- `credit_title` (string)
- `start_date` (date in YYYY-MM-DD format)

**Optional Fields:**
- `description`, `end_date`, `image_url`, `sort_order`
- `production_type`: Commercial, Film, TV Series, Music Video, Documentary
- `role`: Director, Cinematographer, Editor, Producer, etc.
- `project_title`, `brand_client`, `local_company`, `international_company`, `country`
- `release_year`: Format "YYYY" or "Coming YYYY" (e.g., "2024" or "Coming 2025")
- `is_unreleased`: boolean (default: false)
- `headline_stats`: string
- `awards`: Array of objects with `title` (required) and `detail` (optional)

**Validation:**
- `end_date` must be after `start_date`
- `release_year` must match format: "YYYY" or "Coming YYYY"
- `awards` must be an array, each award must have a `title` field

---

### PATCH `/api/profile/credits`
**Description:** Update a credit  
**Authentication:** Required  
**Status:** ✅ Implemented

**Request Body:**
```json
{
  "id": "credit-uuid",
  "credit_title": "Updated Title",
  "production_type": "Film",
  "release_year": "Coming 2025",
  "awards": [
    {
      "title": "Best Film",
      "detail": "Cannes 2025"
    }
  ]
}
```

**Required Fields:**
- `id` (string, UUID of credit to update)

**Optional Fields:** All fields from POST (partial updates supported)

**Validation:** Same as POST endpoint

**Note:** Only the credit owner can update their credits

---

### DELETE `/api/profile/credits?id=[creditId]`
**Description:** Delete a credit  
**Authentication:** Required  
**Status:** ✅ Implemented

**Query Parameters:**
- `id` (required): Credit UUID to delete

**Note:** Only the credit owner can delete their credits

---

## Profile API - Enhanced Features (v2.7.1)

### Credits Enhancement Summary

The credits API has been enhanced with **11 new fields** to support rich professional portfolios:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `production_type` | TEXT | Type of production | Commercial, Film, TV Series, Music Video, Documentary |
| `role` | TEXT | User's role in production | Director, Cinematographer, Editor, Producer |
| `project_title` | TEXT | Specific project name | "Just Do It - Summer Edition" |
| `brand_client` | TEXT | Brand or client name | Nike, Apple, Coca-Cola |
| `local_company` | TEXT | Local production company | Dubai Media Productions |
| `international_company` | TEXT | International studio | Warner Bros, Universal Pictures |
| `country` | TEXT | Production country | UAE, USA, UK |
| `release_year` | TEXT | Release year | "2024" or "Coming 2025" |
| `is_unreleased` | BOOLEAN | Unreleased project flag | true/false |
| `headline_stats` | TEXT | Key statistics | "500M+ views across platforms" |
| `awards` | JSONB | Array of awards | `[{"title": "Best Film", "detail": "Cannes 2024"}]` |

### Profile Enhancement Summary

The profile API has been enhanced with **3 new fields** for day rates and work identities:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `day_rate` | INTEGER | Daily rate in cents (e.g., 150000 = $1,500) | 150000 |
| `day_rate_currency` | TEXT | Currency code | USD, AED, EUR, GBP, INR, CAD, AUD, JPY, CNY, SGD |
| `work_identities` | JSONB | Work identity configuration | See structure below |

**work_identities Structure:**
```json
{
  "freelance": true,
  "employee": {
    "enabled": true,
    "company": "Warner Bros",
    "designation": "Senior Cinematographer"
  },
  "businessOwner": {
    "enabled": false,
    "designation": "",
    "businessName": "",
    "businessType": ""
  }
}
```

### Backward Compatibility

✅ **All new fields are optional** - Existing API clients will continue to work without modification  
✅ **Default values provided** - New fields return null or default values for existing records  
✅ **Partial updates supported** - Update only the fields you need in PATCH requests  
✅ **Validation only when provided** - No validation errors for omitted fields

---

### GET `/api/profile/links`
**Description:** Get user's social/portfolio links  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### POST `/api/profile/links`
**Description:** Add a link  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### DELETE `/api/profile/links?id=[linkId]`
**Description:** Delete a link  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### GET `/api/profile/recommendations`
**Description:** Get user's recommendations  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### POST `/api/profile/recommendations`
**Description:** Add a recommendation  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### GET `/api/profile/languages`
**Description:** Get user's languages  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### POST `/api/profile/languages`
**Description:** Add a language  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### DELETE `/api/profile/languages?id=[languageId]`
**Description:** Delete a language  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### GET `/api/profile/travel-countries`
**Description:** Get user's travel countries  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### POST `/api/profile/travel-countries`
**Description:** Add a travel country  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### DELETE `/api/profile/travel-countries?id=[countryId]`
**Description:** Delete a travel country  
**Authentication:** Required  
**Status:** ✅ Implemented

---

## Explore (Crew Directory) API

### GET `/api/explore`
**Description:** Search and filter crew profiles  
**Authentication:** Optional  
**Status:** ✅ Implemented

**Query Parameters:**
- `keyword` - Search keyword
- `role` - Filter by role
- `category` - Filter by category
- `availability` - Filter by availability
- `productionType` - Filter by production type
- `location` - Filter by location
- `experienceLevel` - Filter by experience level
- `minRate` - Minimum day rate
- `maxRate` - Maximum day rate
- `page` (default: 1)
- `limit` (default: 20)
- `sortBy` (default: `created_at`)
- `sortOrder` (default: `desc`)

**Implementation Notes:**
- Fetch from `user_profiles` where `visible_in_explore = true`
- Join with `user_roles` for role filtering
- Include avatar, banner, bio, roles, location, day_rate
- Apply all filter parameters
- Implement pagination and sorting

---

### GET `/api/explore/[userId]`
**Description:** Get complete profile of a specific user  
**Authentication:** Optional  
**Status:** ✅ Implemented

**Implementation Notes:**
- Fetch complete profile from `user_profiles`
- Include roles, skills, experience, portfolio items
- Include highlights, credits, recommendations
- Include availability calendar summary

---

### GET `/api/explore/categories`
**Description:** Get all unique categories/roles  
**Authentication:** None  
**Status:** ✅ Implemented

**Implementation Notes:**
- Query `user_roles` to get all unique categories
- Return as array of strings
- Order alphabetically

---

## Contacts API

### POST `/api/contacts`
**Description:** Add a contact to a gig  
**Authentication:** Required  
**Status:** ✅ Implemented

**Implementation Notes:**
- Insert into `crew_contacts` table
- Verify user is the gig creator
- Link contact to specific gig
- Include contact details (name, email, phone, role)

---

### GET `/api/contacts/[id]`
**Description:** Get contact details  
**Authentication:** Required  
**Status:** ✅ Implemented

---

### DELETE `/api/contacts/[id]`
**Description:** Delete a contact  
**Authentication:** Required  
**Status:** ✅ Implemented

**Implementation Notes:**
- Delete from `crew_contacts` where `id = contactId`
- Verify user is the gig creator
- Return success message

---

### GET `/api/contacts/gig/[gigId]`
**Description:** Get all contacts for a specific gig  
**Authentication:** Required  
**Status:** ✅ Implemented

**Implementation Notes:**
- Fetch from `crew_contacts` where `gig_id = gigId`
- Verify user is the gig creator
- Include contact details and creation date

---

## Notifications API

### GET `/api/notifications`
**Description:** Get user's notifications  
**Authentication:** Required  
**Status:** ✅ Implemented

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `unread_only` - Filter unread notifications

**Implementation Notes:**
- Fetch from `notifications` table
- Order by `created_at DESC`
- Types: `application_received`, `status_changed`, `referral_received`, etc.
- Include actor info (who triggered the notification)
- Mark notification metadata (gig_id, application_id, etc.)

---

### PATCH `/api/notifications/[id]/read`
**Description:** Mark notification as read  
**Authentication:** Required  
**Status:** ✅ Implemented

**Implementation Notes:**
- Update `notifications` set `is_read = true`
- Where `id = notificationId` AND `user_id = user.id`
- Return updated notification

---

### POST `/api/notifications/mark-all-read`
**Description:** Mark all notifications as read  
**Authentication:** Required  
**Status:** ✅ Implemented

**Implementation Notes:**
- Update all notifications set `is_read = true`
- Where `user_id = user.id`
- Return count of updated notifications

---

## Skills API

### GET `/api/skills`
**Description:** Get user's skills  
**Authentication:** Required  
**Status:** ✅ Implemented

**Implementation Notes:**
- Fetch from `applicant_skills` or `user_skills` table
- Order by `sort_order`
- Include skill name and proficiency level

---

### POST `/api/skills`
**Description:** Add a new skill  
**Authentication:** Required  
**Status:** ✅ Implemented

**Request Body:**
```json
{
  "skill_name": "Adobe Premiere Pro",
  "proficiency_level": "Expert",
  "sort_order": 0
}
```

**Implementation Notes:**
- Insert into `applicant_skills` or `user_skills`
- Constraint: UNIQUE(user_id, skill_name)
- Handle duplicate error gracefully

---

### PATCH `/api/skills/[id]`
**Description:** Update skill details  
**Authentication:** Required  
**Status:** ✅ Implemented

**Implementation Notes:**
- Update `applicant_skills` or `user_skills`
- Where `id = skillId` AND `user_id = user.id`
- Allow updating proficiency_level and sort_order

---

### DELETE `/api/skills/[id]`
**Description:** Delete a skill  
**Authentication:** Required  
**Status:** ✅ Implemented

**Implementation Notes:**
- Delete from `applicant_skills` or `user_skills`
- Where `id = skillId` AND `user_id = user.id`

---

## Availability API

### GET `/api/availability`
**Description:** Get user's availability calendar  
**Authentication:** Required  
**Status:** ✅ Implemented

**Query Parameters:**
- `month` - Filter by month (YYYY-MM)
- `year` - Filter by year (YYYY)

**Implementation Notes:**
- Fetch from `crew_availability` table
- Status can be: `available`, `hold`, `na` (not available)
- Return array of dates with status

---

### POST `/api/availability`
**Description:** Set availability for a date  
**Authentication:** Required  
**Status:** ✅ Implemented

**Request Body:**
```json
{
  "availability_date": "2025-02-15",
  "status": "available"
}
```

**Implementation Notes:**
- Insert into `crew_availability`
- Constraint: UNIQUE(user_id, availability_date)
- Validate status: `available`, `hold`, `na`
- Use upsert to update if already exists

---

### PATCH `/api/availability/[id]`
**Description:** Update availability  
**Authentication:** Required  
**Status:** ✅ Implemented

**Implementation Notes:**
- Update `crew_availability`
- Where `id = availabilityId` AND `user_id = user.id`
- Allow changing status

---

### GET `/api/availability/check`
**Description:** Check availability for a date range  
**Authentication:** Required  
**Status:** ✅ Implemented

**Query Parameters:**
- `from_date` - Start date
- `to_date` - End date

**Implementation Notes:**
- Check `crew_availability` for conflicts
- Return dates that are already marked as `hold` or `na`
- Useful for gig creators to check crew availability

---

## Referrals API

### GET `/api/referrals`
**Description:** Get user's referrals (sent and received)  
**Authentication:** Required  
**Status:** ✅ Implemented

**Implementation Notes:**
- Fetch from `referrals` table
- Where `referred_user_id = user.id` OR `referrer_user_id = user.id`
- Include both referrer and referred user details
- Include referral context (gig, project, general)

---

### POST `/api/referrals`
**Description:** Create a referral  
**Authentication:** Required  
**Status:** ✅ Implemented

**Request Body:**
```json
{
  "referred_user_id": "uuid",
  "context_type": "gig",
  "context_id": "gig-uuid",
  "message": "I think you'd be great for this role"
}
```

**Implementation Notes:**
- Insert into `referrals` table
- Create notification for referred user
- Link to context (gig, project, collab, etc.)

---

## Upload API

### POST `/api/upload/profile-photo`
**Description:** Upload profile photo or banner  
**Authentication:** Required  
**Status:** ✅ Implemented

**Form Data:**
- `file` - Image file (JPEG, PNG, WebP)
- `type` - `profile` or `banner`

**Storage:**
- Bucket: `profile-photos/` (Public)
- Max Size: 2 MB
- Path: `profile-photos/{user_id}/{type}/{filename}`

**Implementation Notes:**
- Handle multipart/form-data upload
- Validate file size (max 2MB)
- Validate file type (JPEG, PNG, WebP)
- Upload to Supabase Storage
- Return public URL

---

### POST `/api/upload/portfolio`
**Description:** Upload portfolio file  
**Authentication:** Required  
**Status:** ✅ Implemented

**Form Data:**
- `file` - Portfolio file

**Storage:**
- Bucket: `portfolios/` (Private)
- Max Size: 10 MB
- Allowed Types: PDF, Images (JPEG/PNG/GIF/WebP), Videos (MP4/MOV/AVI)
- Path: `portfolios/{user_id}/{filename}`

**Implementation Notes:**
- Handle multipart/form-data upload
- Validate file size (max 10MB)
- Validate file type
- Upload to Supabase Storage
- Return URL (signed for private bucket)

---

### POST `/api/upload/slate-media`
**Description:** Upload slate post media  
**Authentication:** Required  
**Status:** ✅ Implemented

**Form Data:**
- `file` - Image or video file
- `post_id` - Slate post ID (optional)

**Storage:**
- Bucket: `slate-media/` (Public)
- Max Size: 10 MB
- Allowed Types: JPEG, JPG, PNG, WebP, MP4, MOV, AVI
- Path: `slate-media/{user_id}/{post_id}/{filename}`

**Implementation Notes:**
- Handle multipart/form-data upload
- Validate file size (max 10MB)
- Validate file type
- Upload to Supabase Storage
- Return public URL and media_type (image/video)

---

### POST `/api/upload/resume`
**Description:** Upload resume file  
**Authentication:** Required  
**Status:** ✅ Implemented

**Form Data:**
- `file` - Resume file

**Storage:**
- Bucket: `resumes/` (Private)
- Max Size: 5 MB
- Allowed Types: PDF, DOC, DOCX
- Path: `resumes/{user_id}/{filename}`

**Implementation Notes:**
- Handle multipart/form-data upload
- Validate file size (max 5MB)
- Validate file type (PDF, DOC, DOCX)
- Upload to Supabase Storage
- Return URL (signed for private bucket)

---

### POST `/api/upload/collab-cover`
**Description:** Upload collab post cover image  
**Authentication:** Required  
**Status:** ✅ Implemented

**Form Data:**
- `file` - Image file (JPEG, JPG, PNG)
- `collab_id` - Collab post ID (optional)

**Storage:**
- Bucket: `collab-covers/` (Public)
- Max Size: 5 MB
- Path: `{user_id}/{collab_id}/{filename}` or `{user_id}/{filename}`

---

### POST `/api/upload/project-asset`
**Description:** Upload project assets  
**Authentication:** Required  
**Status:** ✅ Implemented

**Form Data:**
- `file` - Asset file
- `project_id` - Project ID

**Storage:**
- Bucket: `project-assets/` (Mixed - based on project privacy)
- Max Size: 20 MB
- Allowed Types: Images, Videos, Documents, Archives, Audio
- Path: `project-assets/{user_id}/{project_id}/{filename}`

**Implementation Notes:**
- Handle multipart/form-data upload
- Validate file size (max 20MB)
- Validate file type (JPEG, PNG, WebP, GIF, MP4, MOV, AVI, PDF, DOC, DOCX, TXT, ZIP, MP3, WAV)
- Upload to Supabase Storage
- Return public URL and file_type

---

## Implementation Status Summary

### ✅ Fully Implemented Routes

All the following route categories are **fully implemented** and ready for use:

#### Core Functionality
- **Explore API** - Crew directory with filters, user profiles, role categories
- **Notifications API** - Get notifications, mark as read, mark all as read
- **Skills API** - Get, add, update, and delete user skills
- **Availability API** - Get availability calendar, set/update availability, check date range conflicts
- **Contacts API** - Add, get, and delete gig contacts
- **Referrals API** - Get and create referrals with notifications

#### File Upload API
All upload endpoints are fully implemented with validation and Supabase Storage integration:
- Profile photos and banners (2MB max, JPEG/PNG/WebP)
- Resumes (5MB max, PDF/DOC/DOCX)
- Portfolio files (10MB max, PDF/Images/Videos)
- Slate media (10MB max, Images/Videos)
- Project assets (20MB max, Multiple types)
- Collab cover images (5MB max, JPEG/PNG)

### 📊 Implementation Statistics

- **Total API Endpoints:** 74
- **Fully Implemented:** 74 (100%)
- **Remaining Placeholders:** 0

**All placeholder routes from the original specification have been successfully implemented!**

---

## Common Response Format

All API endpoints follow a consistent response format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

---

## Common Status Codes

- `200` - Success (GET, PATCH, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `413` - Payload Too Large (file size exceeded)
- `415` - Unsupported Media Type (invalid file type)
- `500` - Internal Server Error

---

## Authentication

Most endpoints require authentication via Bearer token:

```bash
Authorization: Bearer <supabase-jwt-token>
```

Token validation is performed using `validateAuthToken()` helper function which verifies the Supabase JWT and returns user information.

---

## Database Tables Referenced

- `gigs` - Job/gig postings
- `gig_dates` - Gig date windows
- `gig_locations` - Gig locations
- `gig_references` - Gig reference links
- `applications` - Gig applications
- `slate_posts` - Social feed posts
- `slate_media` - Post media attachments
- `slate_likes` - Post likes
- `slate_saved` - Saved posts
- `slate_comments` - Post comments
- `collab_posts` - Collaboration posts
- `collab_tags` - Collab tags
- `collab_interests` - Interest expressions
- `collab_collaborators` - Collaborators
- `whatson_events` - Events
- `whatson_schedule` - Event schedule
- `whatson_tags` - Event tags
- `whatson_rsvps` - Event RSVPs
- `design_projects` - Projects
- `project_tags` - Project tags
- `project_team` - Project team members
- `project_files` - Project files
- `project_links` - Project links
- `user_profiles` - User profiles
- `user_roles` - User professional roles
- `user_skills` / `applicant_skills` - User skills
- `crew_availability` - Availability calendar
- `crew_contacts` - Contacts
- `notifications` - User notifications
- `referrals` - User referrals

---

## Next Steps

To complete the placeholder routes, implement them in priority order:

1. **High Priority:** Explore API (crew directory) and Notifications API
2. **Medium Priority:** Skills API and Availability API
3. **Low Priority:** Referrals, Contacts, and remaining Upload endpoints

Each placeholder includes specific implementation notes for database queries and business logic.
