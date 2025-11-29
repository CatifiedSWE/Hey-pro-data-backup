# HeyProData - Professional Networking Platform

**Version**: 2.7  
**Last Updated**: January 2025  
**Tech Stack**: Next.js 15 (App Router) + TypeScript + Supabase + Tailwind CSS

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [File Structure](#file-structure)
- [API Structure](#api-structure)
- [Frontend Routes](#frontend-routes)
- [Authentication](#authentication)
- [Database](#database)
- [Installation & Setup](#installation--setup)
- [Development Commands](#development-commands)
- [Key Features](#key-features)

---

## 🎯 Project Overview

**HeyProData** is a professional networking and marketplace platform designed specifically for the **film, media, and creative industries**. It connects artists, producers, filmmakers, actors, crew members, and production professionals for collaboration and hiring opportunities.

### Core Functionality
- **Professional Profiles**: Showcase portfolios, skills, credits, and availability
- **Gigs & Jobs Marketplace**: Post and apply for production opportunities
- **Collab Platform**: Collaborative project creation and team formation
- **Slate Social Feed**: Industry-focused social media features
- **What's On Events**: Industry events with RSVP management
- **Explore/Crew Directory**: Search and filter professionals by role, location, and skills
- **Real-time Notifications**: Track applications, interests, and interactions

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15.5.4 (App Router with Turbopack)
- **Language**: TypeScript 5
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS 4 + PostCSS
- **UI Components**: Radix UI primitives (Accordion, Dialog, Dropdown, Select, etc.)
- **Icons**: Lucide React, Tabler Icons
- **State Management**: React Context API (AuthContext)
- **HTTP Client**: Axios 1.12.2
- **Date Handling**: date-fns 4.1.0
- **Drag & Drop**: @dnd-kit/core
- **Forms**: React Day Picker
- **Notifications**: Sonner (toast notifications)

### Backend
- **API**: Next.js API Routes (App Router)
- **Authentication**: Supabase Auth with JWT tokens
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (file uploads)
- **Validation**: Custom server-side validation
- **Middleware**: Next.js middleware for route protection

### Development Tools
- **Linting**: ESLint 9 with Next.js config
- **Package Manager**: npm
- **Build Tool**: Next.js with Turbopack

---

## 🏗 Project Architecture

### Application Structure
```
HeyProData/
├── /app/                    # Next.js App Router directory
│   ├── (app)/              # Authenticated app routes (with layout)
│   ├── (auth)/             # Authentication routes (login, signup, etc.)
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
│
├── /api/                   # API routes (73 endpoints)
│   ├── /health/           # Health check
│   ├── /profile/          # User profile management (10 endpoints)
│   ├── /skills/           # Skills management
│   ├── /availability/     # Availability calendar
│   ├── /gigs/             # Gigs marketplace
│   ├── /collab/           # Collaboration platform
│   ├── /slate/            # Social media feed
│   ├── /whatson/          # Events management
│   ├── /explore/          # Crew directory
│   ├── /projects/         # Design projects
│   ├── /notifications/    # Notifications
│   ├── /upload/           # File uploads (6 types)
│   └── ...                # Other modules
│
├── /components/            # Reusable React components
│   ├── /ui/               # Shadcn UI components (28 components)
│   ├── /header/           # Header component
│   ├── /modules/          # Feature-specific modules
│   ├── /profile/          # Profile components
│   └── /jobs/             # Job-related components
│
├── /lib/                   # Utility libraries
│   ├── /supabase/         # Supabase client & server utilities
│   ├── apiCalling.ts      # API helper functions
│   ├── axios.ts           # Axios configuration
│   └── utils.ts           # General utilities
│
├── /contexts/              # React Context providers
│   └── AuthContext.tsx    # Authentication context
│
├── /types/                 # TypeScript type definitions
│   └── index.ts           # Shared types
│
├── /data/                  # Mock/sample data
│   ├── collabPosts.ts
│   ├── exploreProfiles.ts
│   ├── gigs.ts
│   └── ...
│
├── /documentation/         # Technical documentation
│   ├── /API-Docs/         # API documentation
│   └── /backend-documentation-and-commands/  # Module-specific docs
│
├── /public/                # Static assets
│   ├── /assets/           # Images and media
│   └── /logo/             # Branding assets
│
├── middleware.ts           # Authentication & routing middleware
├── next.config.ts          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── package.json            # Dependencies
```

---

## 📁 File Structure

### Root Level Files
| File | Purpose |
|------|---------|  
| `middleware.ts` | Route protection, authentication checks, session management |
| `next.config.ts` | Next.js configuration (Turbopack, images, etc.) |
| `tailwind.config.js` | Tailwind CSS theme and plugin configuration |
| `tsconfig.json` | TypeScript compiler configuration |
| `eslint.config.mjs` | ESLint rules configuration |
| `postcss.config.mjs` | PostCSS configuration for Tailwind |
| `components.json` | Shadcn UI component configuration |
| `package.json` | Project dependencies and scripts |
| `.env.sample` | Environment variables template |

### Key Directories

#### `/app/` - Frontend Pages
```
/app/
├── (app)/                          # Protected routes (requires auth)
│   ├── page.tsx                    # Home/Explore page
│   ├── create/page.tsx             # Create content page
│   │
│   ├── (explore)/                  # Crew directory
│   │   └── explore/
│   │       ├── page.tsx            # Explore listing
│   │       └── [slug]/page.tsx    # User profile view
│   │
│   ├── (gigs)/                     # Gigs marketplace
│   │   └── gigs/
│   │       ├── page.tsx            # Gigs listing
│   │       ├── [slug]/page.tsx    # Gig details
│   │       └── manage-gigs/       # Gig management
│   │
│   ├── (collab)/                   # Collaboration platform
│   │   └── collab/
│   │       ├── page.tsx            # Collab feed
│   │       └── manage-collab/     # Collab management
│   │
│   ├── (slate-group)/              # Social feed
│   │   └── slate/page.tsx         # Slate feed
│   │
│   ├── (whatson)/                  # Events platform
│   │   └── whats-on/
│   │       ├── page.tsx            # Events listing
│   │       ├── [slug]/page.tsx    # Event details
│   │       └── manage-whats-on/   # Event management
│   │
│   ├── jobs/                       # Jobs hub
│   │   ├── page.tsx               # Jobs listing
│   │   └── (jobs)/
│   │       ├── gig/[id]/          # Gig job details
│   │       └── project/[id]/      # Project job details
│   │
│   └── profile/                    # User profile
│       └── page.tsx               # Profile page with 20+ components
│
└── (auth)/                         # Public auth routes
    ├── login/page.tsx             # Login page
    ├── signup/page.tsx            # Registration page
    ├── otp/page.tsx               # OTP verification
    ├── callback/page.tsx          # OAuth callback
    ├── forget-password/page.tsx   # Password reset request
    ├── reset-password/page.tsx    # Password reset form
    └── form/page.tsx              # Additional form page
```

#### `/components/` - React Components
```
/components/
├── /ui/                            # Shadcn UI components (28 components)
│   ├── button.tsx                 # Button component
│   ├── dialog.tsx                 # Modal/Dialog
│   ├── dropdown-menu.tsx          # Dropdown menus
│   ├── input.tsx                  # Form inputs
│   ├── select.tsx                 # Select dropdown
│   ├── calendar.tsx               # Date picker
│   ├── card.tsx                   # Card container
│   ├── avatar.tsx                 # User avatar
│   ├── badge.tsx                  # Badge/tag component
│   ├── checkbox.tsx               # Checkbox input
│   ├── accordion.tsx              # Accordion/collapse
│   ├── navigation-menu.tsx        # Navigation component
│   ├── scroll-area.tsx            # Scrollable container
│   ├── separator.tsx              # Divider line
│   ├── skeleton.tsx               # Loading skeleton
│   ├── sonner.tsx                 # Toast notifications
│   └── ...                        # 13 more UI components
│
├── /header/                        # Header components
│   └── index.tsx                  # Main header
│
├── /modules/                       # Feature modules
│   ├── /common/
│   │   └── projectCard.tsx        # Project card component
│   └── /pages/
│       └── explore-page.tsx       # Explore page module
│
├── /profile/                       # Profile-specific components
│   ├── Card.tsx                   # Profile card
│   └── personalDetails.tsx        # Personal details section
│
├── /jobs/                          # Job-related components
│   └── JobList.tsx                # Job listing component
│
├── /Providers/                     # Context providers
│   └── index.tsx                  # Provider wrapper
│
├── icons.tsx                       # Icon components
└── logo.tsx                        # Logo component
```

#### `/lib/` - Utility Libraries
```
/lib/
├── /supabase/
│   ├── client.ts                  # Browser-side Supabase client
│   └── server.ts                  # Server-side Supabase client + helpers
│       ├── createServerClient()   # Create server client
│       ├── validateAuthToken()    # Token validation
│       ├── getUserFromRequest()   # Extract user from request
│       ├── successResponse()      # Standard success response
│       ├── errorResponse()        # Standard error response
│       └── hasCompleteProfile()   # Profile completeness check
│
├── apiCalling.ts                   # API helper functions
├── axios.ts                        # Axios instance configuration
├── countries.ts                    # Country data (18KB)
└── utils.ts                        # General utility functions
```

---

## 🔌 API Structure

### API Statistics
- **Total Endpoints**: 73 routes
- **Total Modules**: 15
- **Authentication Required**: 60+ endpoints
- **Public Endpoints**: 10+ endpoints

### API Modules Overview

#### 1. Health Check (1 endpoint)
```
GET /api/health                    # API health check
```

#### 2. Profile Management (10 endpoints)
```
GET    /api/profile                # Get user profile
PATCH  /api/profile                # Update user profile
GET    /api/profile/check          # Check profile completion
GET    /api/profile/links          # Get social media links
POST   /api/profile/links          # Add social link
PATCH  /api/profile/links          # Update social link
DELETE /api/profile/links          # Delete social link
GET    /api/profile/roles          # Get professional roles
POST   /api/profile/roles          # Add role
DELETE /api/profile/roles          # Delete role
GET    /api/profile/languages      # Get languages
POST   /api/profile/languages      # Add language
PATCH  /api/profile/languages      # Update language
DELETE /api/profile/languages      # Delete language
GET    /api/profile/visa           # Get visa information
POST   /api/profile/visa           # Add visa info
PATCH  /api/profile/visa           # Update visa info
GET    /api/profile/travel-countries  # Get travel countries
POST   /api/profile/travel-countries  # Add travel country
DELETE /api/profile/travel-countries  # Delete travel country
GET    /api/profile/credits        # Get work history
POST   /api/profile/credits        # Add credit
PATCH  /api/profile/credits        # Update credit
DELETE /api/profile/credits        # Delete credit
GET    /api/profile/highlights     # Get profile highlights
POST   /api/profile/highlights     # Add highlight
PATCH  /api/profile/highlights     # Update highlight
DELETE /api/profile/highlights     # Delete highlight
GET    /api/profile/recommendations  # Get recommendations
POST   /api/profile/recommendations  # Add recommendation
DELETE /api/profile/recommendations  # Delete recommendation
```

#### 3. Skills Management (3 endpoints)
```
GET    /api/skills                 # Get user skills
POST   /api/skills                 # Add skill
PATCH  /api/skills/[id]            # Update skill
DELETE /api/skills/[id]            # Delete skill
```

#### 4. Availability Management (4 endpoints)
```
GET    /api/availability           # Get availability calendar
POST   /api/availability           # Set availability
GET    /api/availability/check     # Check availability conflicts
PATCH  /api/availability/[id]      # Update availability status
```

#### 5. Notifications (3 endpoints)
```
GET    /api/notifications          # Get user notifications
PATCH  /api/notifications/[id]/read  # Mark as read
PATCH  /api/notifications/mark-all-read  # Mark all as read
```

#### 6. Contacts Management (3 endpoints)
```
POST   /api/contacts               # Add contact to gig
GET    /api/contacts/gig/[gigId]   # Get gig contacts
DELETE /api/contacts/[id]          # Delete contact
```

#### 7. Referrals (2 endpoints)
```
GET    /api/referrals              # Get referrals
POST   /api/referrals              # Create referral
```

#### 8. File Uploads (6 endpoints)
```
POST   /api/upload/resume          # Upload resume (5MB, PDF/DOC/DOCX)
POST   /api/upload/portfolio       # Upload portfolio (10MB, PDF/Images/Videos)
POST   /api/upload/profile-photo   # Upload profile photo (2MB, JPEG/PNG/WebP)
POST   /api/upload/collab-cover    # Upload collab cover (5MB, JPEG/PNG)
POST   /api/upload/slate-media     # Upload slate media (10MB, Images/Videos)
POST   /api/upload/project-asset   # Upload project asset (20MB, Multiple types)
```

#### 9. Gigs & Jobs Marketplace (6 endpoints)
```
GET    /api/gigs                   # List gigs (with filters)
POST   /api/gigs                   # Create gig
GET    /api/gigs/[id]              # Get gig details
PATCH  /api/gigs/[id]              # Update gig
DELETE /api/gigs/[id]              # Delete gig
GET    /api/gigs/slug/[slug]       # Get gig by slug
POST   /api/gigs/[id]/apply        # Apply to gig
GET    /api/gigs/[id]/applications  # Get gig applications (creator only)
PATCH  /api/gigs/[id]/applications/[applicationId]/status  # Update application status
```

#### 10. Applications (2 endpoints)
```
GET    /api/applications/my        # Get user's applications
GET    /api/applications/[id]      # Get application details
```

#### 11. Explore/Crew Directory (3 endpoints)
```
GET    /api/explore                # Search and filter crew profiles
GET    /api/explore/categories     # Get role categories with counts
GET    /api/explore/[userId]       # Get detailed user profile
```

#### 12. Collab Platform (8 endpoints)
```
GET    /api/collab                 # List collab posts (with filters)
POST   /api/collab                 # Create collab post
GET    /api/collab/my              # Get user's collab posts
GET    /api/collab/[id]            # Get collab post details
PATCH  /api/collab/[id]            # Update collab post
DELETE /api/collab/[id]            # Delete collab post
POST   /api/collab/[id]/interest   # Express interest
DELETE /api/collab/[id]/interest   # Remove interest
GET    /api/collab/[id]/interests  # List interested users (owner only)
GET    /api/collab/[id]/collaborators  # List collaborators
POST   /api/collab/[id]/collaborators  # Add collaborator
DELETE /api/collab/[id]/collaborators/[userId]  # Remove collaborator
PATCH  /api/collab/[id]/close      # Close collab post
```

#### 13. Slate Social Media (10 endpoints)
```
GET    /api/slate                  # Get feed (with pagination)
POST   /api/slate                  # Create post
GET    /api/slate/my               # Get user's posts
GET    /api/slate/saved            # Get saved posts
GET    /api/slate/[id]             # Get post details
PATCH  /api/slate/[id]             # Update post
DELETE /api/slate/[id]             # Delete post
POST   /api/slate/[id]/like        # Like post
DELETE /api/slate/[id]/like        # Unlike post
GET    /api/slate/[id]/likes       # Get users who liked
GET    /api/slate/[id]/comment     # Get comments
POST   /api/slate/[id]/comment     # Add comment
POST   /api/slate/[id]/share       # Share post
DELETE /api/slate/[id]/share       # Unshare post
POST   /api/slate/[id]/save        # Save post
DELETE /api/slate/[id]/save        # Unsave post
PATCH  /api/slate/comment/[commentId]  # Edit comment
DELETE /api/slate/comment/[commentId]  # Delete comment
```

#### 14. What's On Events (7 endpoints)
```
GET    /api/whatson                # List events (with filters)
POST   /api/whatson                # Create event
GET    /api/whatson/my             # Get user's events
GET    /api/whatson/rsvps/my       # Get user's RSVPs
GET    /api/whatson/[id]           # Get event details
PATCH  /api/whatson/[id]           # Update event
DELETE /api/whatson/[id]           # Delete event
POST   /api/whatson/[id]/rsvp      # Create RSVP
DELETE /api/whatson/[id]/rsvp      # Cancel RSVP
GET    /api/whatson/[id]/rsvp/list  # Get event RSVPs (creator only)
GET    /api/whatson/[id]/rsvp/export  # Export RSVPs as CSV (creator only)
```

#### 15. Design Projects (9 endpoints)
```
GET    /api/projects               # List projects
POST   /api/projects               # Create project
GET    /api/projects/my            # Get user's projects
GET    /api/projects/[id]          # Get project details
PATCH  /api/projects/[id]          # Update project
DELETE /api/projects/[id]          # Delete project
GET    /api/projects/[id]/team     # List team members
POST   /api/projects/[id]/team     # Add team member
PATCH  /api/projects/[id]/team/[userId]  # Update team member role
DELETE /api/projects/[id]/team/[userId]  # Remove team member
GET    /api/projects/[id]/files    # Get project files
DELETE /api/projects/[id]/files/[fileId]  # Delete file
GET    /api/projects/[id]/links    # List project links
POST   /api/projects/[id]/links    # Add project link
DELETE /api/projects/[id]/links/[linkId]  # Delete link
```

---

## 🔐 Authentication

### Authentication System
- **Provider**: Supabase Auth
- **Method**: JWT Bearer Tokens
- **Storage**: HTTP-only cookies (via Supabase SSR)
- **Validation**: Server-side token validation on protected routes

### Authentication Flow

#### 1. Login/Registration
```
User → Login Page → Supabase Auth → JWT Token → Cookie Storage
```

#### 2. Token Validation (API Routes)
```typescript
// Pattern used in all protected API routes
const authHeader = request.headers.get('Authorization');
const user = await validateAuthToken(authHeader);

if (!user) {
  return NextResponse.json(
    errorResponse('Authentication required'),
    { status: 401 }
  );
}
```

#### 3. Middleware Protection
```typescript
// middleware.ts protects routes
const protectedRoutes = [
  '/home', '/profile', '/explore', '/gigs', 
  '/collab', '/whatson', '/notifications'
];

// Redirects to /login if not authenticated
```

### Protected vs Public Routes

#### Protected Routes (Require Authentication)
- `/home` - Home page
- `/profile` - User profile
- `/explore` - Crew directory
- `/gigs` - Gigs marketplace
- `/collab` - Collaboration platform
- `/slate` - Social feed
- `/whatson` - Events
- `/jobs` - Jobs hub
- All `/api/*` routes (except health check)

#### Public Routes (No Authentication Required)
- `/login` - Login page
- `/signup` - Registration page
- `/otp` - OTP verification
- `/callback` - OAuth callback
- `/forget-password` - Password reset
- `/reset-password` - Reset form
- `/api/health` - Health check

### Session Management
- **Token Refresh**: Handled automatically by Supabase SSR
- **Session Expiry**: Configurable in Supabase
- **Logout**: Clears cookies and redirects to login

---

## 🗄 Database

### Database System
- **Provider**: Supabase (PostgreSQL)
- **ORM**: Supabase Client (query builder)
- **Row Level Security (RLS)**: Enabled for user data protection

### Key Tables (Based on API Routes)

#### User & Profile
- `user_profiles` - User profile information
- `user_roles` - Professional roles
- `user_languages` - Language proficiency
- `user_skills` - Skills and expertise
- `user_links` - Social media links
- `user_visa` - Visa information
- `user_travel_countries` - Travel availability
- `user_credits` - Work history/credits
- `user_highlights` - Profile highlights
- `user_recommendations` - Recommendations

#### Availability
- `availability` - User availability calendar
- `availability_conflicts` - Conflict detection

#### Gigs & Applications
- `gigs` - Job postings
- `gig_applications` - Applications to gigs
- `gig_contacts` - Contact information

#### Collaboration
- `collab_posts` - Collaboration posts
- `collab_interests` - Interest expressions
- `collab_collaborators` - Confirmed collaborators

#### Social (Slate)
- `slate_posts` - Social media posts
- `slate_likes` - Post likes
- `slate_comments` - Post comments
- `slate_shares` - Post shares
- `slate_saved` - Saved posts

#### Events (What's On)
- `whatson_events` - Events
- `whatson_rsvps` - Event RSVPs

#### Projects
- `projects` - Design projects
- `project_team` - Team members
- `project_files` - Project files
- `project_links` - External links

#### System
- `notifications` - User notifications
- `referrals` - Referral tracking

### Storage Buckets
```
Supabase Storage:
├── resumes/              # Resume uploads (5MB limit)
├── portfolios/           # Portfolio files (10MB limit)
├── profile-photos/       # Profile photos (2MB limit)
├── collab-covers/        # Collab post covers (5MB limit)
├── slate-media/          # Slate post media (10MB limit)
└── project-assets/       # Project files (20MB limit)
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ (for Next.js 15)
- npm package manager
- Supabase account and project

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Other configurations
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HeyProData
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.sample .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Set up database schema**
   ```bash
   # Run the SQL schema in your Supabase SQL Editor
   # File: /app/supabase_schema.sql
   # Or follow instructions in SETUP_INSTRUCTIONS.md
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   ```
   Frontend: http://localhost:3000
   API Health: http://localhost:3000/api/health
   ```

---

## 💻 Development Commands

### Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack

# Production
npm run build        # Build for production with Turbopack
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

### Development Workflow

1. **Hot Reload**: Enabled by default in development mode
2. **Turbopack**: Used for faster builds and HMR
3. **TypeScript**: Strict mode enabled for type safety
4. **API Development**: 
   - API routes auto-reload on save
   - Test with `http://localhost:3000/api/<endpoint>`
5. **Component Development**:
   - Components hot-reload instantly
   - Styled with Tailwind CSS utilities

---

## ✨ Key Features

### Profile Management
- **Comprehensive Profiles**: 
  - Personal details (name, location, bio)
  - Professional roles and positions
  - Skills with experience levels and rates
  - Work credits and production history
  - Profile highlights and recommendations
  - Social media links
  - Language proficiency
  - Visa and travel information
- **Availability Calendar**: Set and manage availability dates
- **Profile Completion Tracker**: Visual progress indicator
- **Portfolio Uploads**: Showcase work with file uploads

### Marketplace Features
- **Gigs Marketplace**: 
  - Create and manage job postings
  - Apply to gigs with custom applications
  - Track application status
  - Filter by role, location, budget
- **Application Management**: Track all applications in one place

### Collaboration Platform
- **Collab Posts**: 
  - Create collaborative project opportunities
  - Express interest in projects
  - Manage collaborators and team members
  - Close posts when positions are filled
- **Team Management**: Add/remove collaborators

### Social Features (Slate)
- **Feed**: Browse industry-related posts
- **Interactions**: Like, comment, share posts
- **Bookmarks**: Save posts for later
- **User Content**: Create and manage your own posts
- **Engagement Tracking**: View likes and comment counts

### Events (What's On)
- **Event Creation**: Create industry events
- **RSVP Management**: Track attendees
- **Event Discovery**: Browse upcoming events
- **CSV Export**: Export RSVP lists for organizers

### Search & Discovery
- **Explore/Crew Directory**: 
  - Search professionals by role
  - Filter by location, skills, availability
  - View detailed profiles
  - Category-based browsing
- **Role Categories**: Organized by department and role type

### Notifications System
- **Real-time Notifications**: Track all activities
- **Notification Types**: 
  - Application updates
  - Interest expressions
  - Event RSVPs
  - System messages
- **Mark as Read**: Individual or bulk mark as read

---

## 📚 Documentation

### Additional Documentation Files
- `/documentation/API-Docs/API_DOC.md` - Detailed API documentation
- `/documentation/API-Docs/API_ROUTES_SUMMARY.md` - Complete API routes summary
- `/documentation/MIGRATION_ROADMAP.md` - Migration and upgrade guides
- `/documentation/PHASE_1_SUMMARY.md` - Project phase summaries
- `/documentation/backend-documentation-and-commands/` - Module-specific docs
- `AUTHENTICATION_TEST_CHECKLIST.md` - Authentication testing guide
- `GOOGLE_AUTH_SETUP.md` - Google OAuth setup instructions

---

## 🔧 Technical Notes

### API Response Format
All API endpoints follow this standard response format:

**Success Response:**
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

### Authentication Pattern
All protected API routes use this pattern:
```typescript
const authHeader = request.headers.get('Authorization');
const user = await validateAuthToken(authHeader);

if (!user) {
  return NextResponse.json(
    errorResponse('Authentication required'),
    { status: 401 }
  );
}

// Proceed with authenticated request
```

### File Upload Constraints
| Upload Type | Max Size | Allowed Types | Bucket |
|-------------|----------|---------------|--------|
| Resume | 5MB | PDF, DOC, DOCX | resumes/ |
| Portfolio | 10MB | PDF, Images, Videos | portfolios/ |
| Profile Photo | 2MB | JPEG, PNG, WebP | profile-photos/ |
| Collab Cover | 5MB | JPEG, PNG | collab-covers/ |
| Slate Media | 10MB | Images, Videos | slate-media/ |
| Project Asset | 20MB | Multiple types | project-assets/ |

### Next.js App Router Features
- **Server Components**: Default for all components
- **Client Components**: Used for interactive UI (`'use client'`)
- **Route Groups**: Organized with `(app)` and `(auth)` groups
- **Dynamic Routes**: `[slug]`, `[id]`, `[userId]` patterns
- **Layouts**: Nested layouts for different sections
- **Middleware**: Route protection and authentication

---

## 🏷 Version History

- **v2.7** (January 2025) - Current version with 73 API endpoints
- **v2.6** - Added Design Projects module
- **v2.5** - Implemented What's On events platform
- **v2.0** - Major architecture update with Supabase
- **v1.0** - Initial release

---

## 📄 License

[Your License Here]

---

## 👥 Contributors

[Your Team/Contributors Here]

---

**Last Updated**: January 2025  
**Maintained By**: HeyProData Team
