# Saved Page Real-Time Data Integration Plan

**Date Created:** January 2025  
**Target Route:** `/app/(app)/saved`  
**Goal:** Replace mock data with real-time API calls for Slates, Collabs, and What's On tabs

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Database Requirements](#database-requirements)
3. [Backend API Development](#backend-api-development)
4. [Frontend Integration](#frontend-integration)
5. [Implementation Steps](#implementation-steps)
6. [Testing Strategy](#testing-strategy)

---

## Current State Analysis

### Existing Implementation

**Frontend:**
- **File:** `/app/app/(app)/saved/page.tsx`
- **Status:** Using mock/hardcoded data
- **Features:**
  - 3 tabs: Slates, Collabs, What's On
  - Empty states
  - Loading skeletons
  - Card layouts for each content type

**Backend:**
- ✅ **Slates:** `/app/app/api/slate/saved/route.ts` - FULLY IMPLEMENTED
- ⚠️ **Collabs:** Save/unsave exists (`/api/collab/[id]/save`) but no "get all saved" endpoint
- ❌ **What's On:** No save/unsave functionality at all

**Database Tables:**
- ✅ `slate_saved` - Exists and working
- ✅ `collab_saves` - Exists (used by save/unsave endpoint)
- ❓ `whatson_saves` - Needs to be verified/created

---

## Database Requirements

### Table 1: `slate_saved` (Already Exists ✅)

```sql
-- Already implemented, no changes needed
CREATE TABLE slate_saved (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES slate_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Indexes
CREATE INDEX idx_slate_saved_user_id ON slate_saved(user_id);
CREATE INDEX idx_slate_saved_post_id ON slate_saved(post_id);
CREATE INDEX idx_slate_saved_user_created ON slate_saved(user_id, created_at DESC);
```

### Table 2: `collab_saves` (Already Exists ✅)

```sql
-- Already implemented in /api/collab/[id]/save
-- Verify structure matches:
CREATE TABLE collab_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collab_id UUID NOT NULL REFERENCES collab_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collab_id, user_id)
);

-- Indexes
CREATE INDEX idx_collab_saves_user_id ON collab_saves(user_id);
CREATE INDEX idx_collab_saves_collab_id ON collab_saves(collab_id);
CREATE INDEX idx_collab_saves_user_created ON collab_saves(user_id, created_at DESC);
```

### Table 3: `whatson_saves` (Need to Create ❌)

```sql
-- New table for What's On event saves
CREATE TABLE whatson_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES whatson_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_whatson_saves_user_id ON whatson_saves(user_id);
CREATE INDEX idx_whatson_saves_event_id ON whatson_saves(event_id);
CREATE INDEX idx_whatson_saves_user_created ON whatson_saves(user_id, created_at DESC);

-- Row Level Security Policies
ALTER TABLE whatson_saves ENABLE ROW LEVEL SECURITY;

-- Users can view their own saves
CREATE POLICY "Users can view own saves"
ON whatson_saves FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own saves
CREATE POLICY "Users can create saves"
ON whatson_saves FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own saves
CREATE POLICY "Users can delete own saves"
ON whatson_saves FOR DELETE
USING (auth.uid() = user_id);

-- Event creators can view who saved their events
CREATE POLICY "Event creators can view saves"
ON whatson_saves FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM whatson_events
    WHERE whatson_events.id = whatson_saves.event_id
    AND whatson_events.created_by = auth.uid()
  )
);
```

---

## Backend API Development

### API 1: Get Saved Collabs (NEW)

**Endpoint:** `GET /api/collab/saved`  
**File:** `/app/app/api/collab/saved/route.ts`

**Implementation:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/collab/saved
 * Get user's saved/bookmarked collab posts
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);

    if (!user) {
      return NextResponse.json(
        errorResponse('Authentication required'),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const supabase = createServerClient();

    // Fetch saved collabs
    const from = (page - 1) * limit;
    const { data: savedCollabs, error, count } = await supabase
      .from('collab_saves')
      .select(`
        id,
        created_at,
        collab:collab_id (
          id,
          title,
          slug,
          summary,
          cover_image_url,
          status,
          created_at,
          updated_at,
          user_id,
          tags:collab_tags(tag_name),
          interests:collab_interests(count)
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) {
      return NextResponse.json(
        errorResponse('Failed to fetch saved collabs', error.message),
        { status: 500 }
      );
    }

    // Fetch user profiles for collab authors
    let userProfiles: Record<string, any> = {};
    let googleAvatars: Record<string, string> = {};
    
    if (savedCollabs && savedCollabs.length > 0) {
      const userIds = [...new Set(savedCollabs.map(sc => sc.collab?.user_id).filter(Boolean))];
      
      if (userIds.length > 0) {
        // Fetch user profiles
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id, alias_first_name, alias_surname, profile_photo_url')
          .in('user_id', userIds);
        
        if (profiles) {
          userProfiles = profiles.reduce((acc, profile) => {
            acc[profile.user_id] = profile;
            return acc;
          }, {} as Record<string, any>);
        }

        // Fetch Google auth avatars as fallback
        const { data: authData } = await supabase.auth.admin.listUsers();
        if (authData?.users) {
          authData.users.forEach(authUser => {
            if (userIds.includes(authUser.id) && (authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture)) {
              googleAvatars[authUser.id] = authUser.user_metadata.avatar_url || authUser.user_metadata.picture;
            }
          });
        }
      }
    }

    // Get collab IDs for user save status check
    const collabIds = savedCollabs?.map(sc => sc.collab?.id).filter(Boolean) || [];
    let userSaves: string[] = collabIds; // All are saved in this context

    // Format response
    const formattedCollabs = savedCollabs
      ?.filter(sc => sc.collab) // Filter out any null collabs
      .map(savedCollab => ({
        id: savedCollab.collab.id,
        title: savedCollab.collab.title,
        slug: savedCollab.collab.slug,
        summary: savedCollab.collab.summary,
        cover_image_url: savedCollab.collab.cover_image_url,
        status: savedCollab.collab.status,
        tags: savedCollab.collab.tags?.map((t: any) => t.tag_name) || [],
        interests: savedCollab.collab.interests?.[0]?.count || 0,
        created_at: savedCollab.collab.created_at,
        updated_at: savedCollab.collab.updated_at,
        saved_at: savedCollab.created_at,
        author: {
          id: savedCollab.collab.user_id,
          name: `${userProfiles[savedCollab.collab.user_id]?.alias_first_name || ''} ${userProfiles[savedCollab.collab.user_id]?.alias_surname || ''}`.trim(),
          avatar: userProfiles[savedCollab.collab.user_id]?.profile_photo_url || googleAvatars[savedCollab.collab.user_id] || '',
        },
        user_has_saved: true, // Always true for saved collabs
      })) || [];

    return NextResponse.json(
      successResponse(
        {
          collabs: formattedCollabs,
          pagination: {
            page,
            limit,
            total: count || 0,
            hasMore: (count || 0) > from + limit,
          },
        },
        'Saved collabs retrieved'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
```

---

### API 2: Save/Unsave What's On Event (NEW)

**Endpoint:** `POST/DELETE /api/whatson/[id]/save`  
**File:** `/app/app/api/whatson/[id]/save/route.ts`

**Implementation:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * POST /api/whatson/[id]/save
 * Save/bookmark a What's On event
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);

    if (!user) {
      return NextResponse.json(
        errorResponse('Authentication required'),
        { status: 401 }
      );
    }

    const eventId = params.id;
    const supabase = createServerClient();

    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from('whatson_events')
      .select('id, created_by')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        errorResponse('Event not found'),
        { status: 404 }
      );
    }

    // Check if already saved
    const { data: existingSave } = await supabase
      .from('whatson_saves')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single();

    if (existingSave) {
      return NextResponse.json(
        errorResponse('Event already saved'),
        { status: 409 }
      );
    }

    // Create save
    const { data: save, error: saveError } = await supabase
      .from('whatson_saves')
      .insert({
        event_id: eventId,
        user_id: user.id
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving event:', saveError);
      return NextResponse.json(
        errorResponse('Failed to save event', saveError.message),
        { status: 500 }
      );
    }

    // Get total saves count
    const { count } = await supabase
      .from('whatson_saves')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    return NextResponse.json(
      successResponse(
        {
          save_id: save.id,
          event_id: eventId,
          user_id: user.id,
          created_at: save.created_at,
          totalSaves: count || 0
        },
        'Event saved successfully'
      ),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/whatson/[id]/save:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/whatson/[id]/save
 * Remove save/bookmark from a What's On event
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);

    if (!user) {
      return NextResponse.json(
        errorResponse('Authentication required'),
        { status: 401 }
      );
    }

    const eventId = params.id;
    const supabase = createServerClient();

    // Delete save
    const { error: deleteError } = await supabase
      .from('whatson_saves')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error removing save:', deleteError);
      return NextResponse.json(
        errorResponse('Failed to remove save', deleteError.message),
        { status: 500 }
      );
    }

    // Get total saves count
    const { count } = await supabase
      .from('whatson_saves')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    return NextResponse.json(
      successResponse(
        {
          totalSaves: count || 0
        },
        'Save removed successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in DELETE /api/whatson/[id]/save:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
```

---

### API 3: Get Saved What's On Events (NEW)

**Endpoint:** `GET /api/whatson/saved`  
**File:** `/app/app/api/whatson/saved/route.ts`

**Implementation:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/whatson/saved
 * Get user's saved/bookmarked What's On events
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);

    if (!user) {
      return NextResponse.json(
        errorResponse('Authentication required'),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const supabase = createServerClient();

    // Fetch saved events
    const from = (page - 1) * limit;
    const { data: savedEvents, error, count } = await supabase
      .from('whatson_saves')
      .select(`
        id,
        created_at,
        event:event_id (
          id,
          title,
          slug,
          description,
          location,
          is_online,
          is_paid,
          price_amount,
          price_currency,
          thumbnail_url,
          hero_image_url,
          status,
          created_at,
          updated_at,
          created_by,
          schedule:whatson_schedule(
            event_date,
            start_time,
            end_time,
            timezone
          ),
          tags:whatson_tags(tag_name),
          rsvps:whatson_rsvps(count)
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) {
      return NextResponse.json(
        errorResponse('Failed to fetch saved events', error.message),
        { status: 500 }
      );
    }

    // Fetch user profiles for event creators
    let userProfiles: Record<string, any> = {};
    let googleAvatars: Record<string, string> = {};
    
    if (savedEvents && savedEvents.length > 0) {
      const userIds = [...new Set(savedEvents.map(se => se.event?.created_by).filter(Boolean))];
      
      if (userIds.length > 0) {
        // Fetch user profiles
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id, alias_first_name, alias_surname, profile_photo_url')
          .in('user_id', userIds);
        
        if (profiles) {
          userProfiles = profiles.reduce((acc, profile) => {
            acc[profile.user_id] = profile;
            return acc;
          }, {} as Record<string, any>);
        }

        // Fetch Google auth avatars as fallback
        const { data: authData } = await supabase.auth.admin.listUsers();
        if (authData?.users) {
          authData.users.forEach(authUser => {
            if (userIds.includes(authUser.id) && (authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture)) {
              googleAvatars[authUser.id] = authUser.user_metadata.avatar_url || authUser.user_metadata.picture;
            }
          });
        }
      }
    }

    // Format response
    const formattedEvents = savedEvents
      ?.filter(se => se.event) // Filter out any null events
      .map(savedEvent => {
        const firstSchedule = savedEvent.event.schedule?.[0];
        return {
          id: savedEvent.event.id,
          title: savedEvent.event.title,
          slug: savedEvent.event.slug,
          description: savedEvent.event.description,
          location: savedEvent.event.location,
          is_online: savedEvent.event.is_online,
          is_paid: savedEvent.event.is_paid,
          price_amount: savedEvent.event.price_amount,
          price_currency: savedEvent.event.price_currency,
          thumbnail_url: savedEvent.event.thumbnail_url,
          hero_image_url: savedEvent.event.hero_image_url,
          status: savedEvent.event.status,
          schedule: savedEvent.event.schedule || [],
          tags: savedEvent.event.tags?.map((t: any) => t.tag_name) || [],
          rsvp_count: savedEvent.event.rsvps?.[0]?.count || 0,
          created_at: savedEvent.event.created_at,
          updated_at: savedEvent.event.updated_at,
          saved_at: savedEvent.created_at,
          creator: {
            id: savedEvent.event.created_by,
            name: `${userProfiles[savedEvent.event.created_by]?.alias_first_name || ''} ${userProfiles[savedEvent.event.created_by]?.alias_surname || ''}`.trim(),
            avatar: userProfiles[savedEvent.event.created_by]?.profile_photo_url || googleAvatars[savedEvent.event.created_by] || '',
          },
          user_has_saved: true, // Always true for saved events
        };
      }) || [];

    return NextResponse.json(
      successResponse(
        {
          events: formattedEvents,
          pagination: {
            page,
            limit,
            total: count || 0,
            hasMore: (count || 0) > from + limit,
          },
        },
        'Saved events retrieved'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
```

---

## Frontend Integration

### Updated Saved Page

**File:** `/app/app/(app)/saved/page.tsx`

**Key Changes:**

1. **Add API Imports and State Management**
```typescript
import { useEffect } from "react";
import axios from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
```

2. **Replace Mock Data with API Calls**
```typescript
const [savedSlates, setSavedSlates] = useState([]);
const [savedCollabs, setSavedCollabs] = useState([]);
const [savedWhatsOn, setSavedWhatsOn] = useState([]);
const [loading, setLoading] = useState({
  slates: true,
  collabs: true,
  whatsOn: true
});
const [errors, setErrors] = useState({
  slates: null,
  collabs: null,
  whatsOn: null
});

// Fetch saved slates
useEffect(() => {
  const fetchSavedSlates = async () => {
    try {
      setLoading(prev => ({ ...prev, slates: true }));
      const response = await axios.get('/api/slate/saved');
      setSavedSlates(response.data.data.posts);
    } catch (error) {
      console.error('Error fetching saved slates:', error);
      setErrors(prev => ({ ...prev, slates: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, slates: false }));
    }
  };
  fetchSavedSlates();
}, []);

// Similar for collabs and whatson...
```

3. **Update Card Rendering with Real Data**
```typescript
{savedSlates.map((slate) => (
  <Card key={slate.id} ...>
    <Image src={slate.author.avatar || '/default-profile.png'} ... />
    <h3>{slate.author.name}</h3>
    {/* Use real data fields */}
  </Card>
))}
```

4. **Add Error States**
```typescript
{errors.slates && (
  <div className="text-red-500 p-4">
    Failed to load saved slates: {errors.slates}
  </div>
)}
```

---

## Implementation Steps

### Phase 1: Database Setup (If Needed)

**Step 1.1:** Verify `collab_saves` table exists
```bash
# Connect to Supabase and run:
SELECT * FROM collab_saves LIMIT 1;
```

**Step 1.2:** Create `whatson_saves` table
```bash
# Run the SQL script from the "Database Requirements" section
# Execute in Supabase SQL Editor
```

**Step 1.3:** Verify RLS policies
```bash
# Test that users can only see their own saves
```

---

### Phase 2: Backend API Development

**Step 2.1:** Create `/app/app/api/collab/saved/route.ts`
- Copy implementation from API 1 section above
- Test with Postman/curl with valid JWT token
- Verify pagination works
- Verify author info is correctly fetched

**Step 2.2:** Create `/app/app/api/whatson/[id]/save/route.ts`
- Copy implementation from API 2 section above
- Test POST to save an event
- Test DELETE to unsave
- Test duplicate save returns 409

**Step 2.3:** Create `/app/app/api/whatson/saved/route.ts`
- Copy implementation from API 3 section above
- Test with Postman/curl
- Verify schedule and tags are included
- Verify creator info is correctly fetched

---

### Phase 3: Frontend Integration

**Step 3.1:** Update `/app/app/(app)/saved/page.tsx`
- Add state management for API data
- Add loading states for each tab
- Add error states for each tab
- Replace mock data with API calls

**Step 3.2:** Test Authentication
- Verify JWT token is sent with requests
- Test redirect to login if not authenticated
- Verify data only shows current user's saved items

**Step 3.3:** Add Pagination (Optional)
- Add "Load More" buttons if needed
- Implement infinite scroll (optional enhancement)

---

### Phase 4: Testing & Verification

**Step 4.1:** Manual Testing
- Save items from Slate, Collab, and What's On pages
- Navigate to /saved page
- Verify all 3 tabs show real data
- Unsave items and verify they disappear
- Test empty states when no saved items

**Step 4.2:** Edge Case Testing
- Test with no internet connection
- Test with expired JWT token
- Test with deleted content (saved item deleted by author)
- Test pagination boundaries

**Step 4.3:** Performance Testing
- Test with 100+ saved items
- Verify loading performance
- Check for N+1 query issues

---

## Testing Strategy

### Unit Tests (Optional but Recommended)

```typescript
// Test API endpoints
describe('GET /api/collab/saved', () => {
  it('should return saved collabs for authenticated user', async () => {
    // Test implementation
  });
  
  it('should return 401 for unauthenticated requests', async () => {
    // Test implementation
  });
  
  it('should handle pagination correctly', async () => {
    // Test implementation
  });
});
```

### Integration Tests

1. **E2E Test Flow:**
   - User logs in
   - User saves a slate post
   - User saves a collab
   - User saves a whatson event
   - User navigates to /saved page
   - Verify all 3 items appear
   - User unsaves items
   - Verify items disappear

2. **API Contract Tests:**
   - Verify response structure matches documentation
   - Verify status codes are correct
   - Verify error responses have proper format

---

## Rollback Plan

If issues arise:

1. **Backend Issues:**
   - Revert API files to previous version
   - Keep frontend showing mock data
   - Add feature flag to enable/disable real-time data

2. **Database Issues:**
   - Drop new tables if causing problems
   - Restore from backup if data corruption

3. **Frontend Issues:**
   - Revert to mock data display
   - Fix issues in separate branch
   - Deploy fixed version

---

## Success Criteria

✅ All 3 tabs (Slates, Collabs, What's On) fetch real data from database  
✅ Pagination works for all endpoints  
✅ Error handling displays user-friendly messages  
✅ Loading states show proper skeletons  
✅ Empty states display when no saved items  
✅ Save/unsave functionality works from detail pages  
✅ Real-time updates (saved items appear immediately after saving)  
✅ Performance is acceptable (< 1s load time for typical data volumes)  
✅ No console errors or warnings  
✅ Authentication properly enforced  

---

## Additional Enhancements (Future Scope)

1. **Real-time Updates:** Use Supabase Realtime to automatically update when items are saved/unsaved
2. **Bulk Actions:** Add ability to unsave multiple items at once
3. **Search/Filter:** Add search within saved items
4. **Categories:** Group saved items by date, type, or custom tags
5. **Export:** Allow exporting saved items list
6. **Sharing:** Share saved collections with other users
7. **Analytics:** Track most saved content types

---

## References

- **API Documentation:** `/app/documentation/API-Docs/API_DOC.md`
- **Backend Architecture:** `/app/documentation/backend-documentation-and-commands/UPDATED_BACKEND_ARCHITECTURE.md`
- **Existing Saved API:** `/app/app/api/slate/saved/route.ts`
- **Existing Save API:** `/app/app/api/collab/[id]/save/route.ts`

---

**Document Status:** DRAFT - Ready for Review  
**Last Updated:** January 2025
