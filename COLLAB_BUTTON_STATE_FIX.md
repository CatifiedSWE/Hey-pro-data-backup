# Collab Button State Persistence Fix

## Issue
The "I'm interested" button and saved/bookmark buttons were not showing persistent state on both the Collab feed and Manage Collab pages, even though the data existed in the Supabase database.

## Root Cause
The `getCollabs()` function in `/app/lib/api/collab.ts` was not including the Authorization header when making API requests to `/api/collab`. This meant:

1. The backend could not identify the current user
2. The backend always returned `userHasInterest: false` and `userHasSaved: false`
3. The frontend had no way to know which collabs the user had saved or expressed interest in

## Solution Applied

### File Modified: `/app/lib/api/collab.ts`

**Before:**
```typescript
export async function getCollabs(params?: {...}): Promise<PaginationResponse> {
  const searchParams = new URLSearchParams();
  // ... params setup ...

  const response = await fetch(`/api/collab?${searchParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch collabs');
  }

  const result = await response.json();
  return result.data;
}
```

**After:**
```typescript
export async function getCollabs(params?: {...}): Promise<PaginationResponse> {
  const searchParams = new URLSearchParams();
  // ... params setup ...

  // Include auth token if available to get user-specific data (saved, interest status)
  const token = await getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api/collab?${searchParams.toString()}`, { headers });
  
  if (!response.ok) {
    throw new Error('Failed to fetch collabs');
  }

  const result = await response.json();
  return result.data;
}
```

## What This Fixes

1. **Collab Feed Page** (`/collab`):
   - Heart/bookmark button now shows filled state for saved collabs
   - Interest button now shows "Waitlisted" state for collabs user has expressed interest in
   - State persists across page refreshes

2. **Manage Collab Page** (`/collab/manage-collab`):
   - Shows correct saved state for user's own collabs
   - Shows correct interest state (if user expressed interest in their own collabs)
   - State persists across page refreshes

## How It Works

1. **On Page Load:**
   - Frontend calls `getCollabs()` with Authorization header
   - Backend receives auth token and validates user
   - Backend queries `collab_saves` and `collab_interests` tables for current user
   - Backend returns `userHasSaved` and `userHasInterest` flags for each collab
   - Frontend initializes button states based on these flags

2. **On Button Click:**
   - User clicks heart/save button or interest button
   - Frontend makes API call to save/unsave or express/remove interest
   - Frontend optimistically updates local state
   - Button UI updates immediately

3. **State Persistence:**
   - Data is stored in Supabase database tables:
     - `collab_saves` - saved/bookmarked collabs
     - `collab_interests` - expressed interests
   - Every page load fetches fresh data from backend
   - Button states reflect actual database state

## Testing Checklist

- [x] Dependencies installed
- [x] Development server running on port 3000
- [ ] Navigate to http://localhost:3000/collab
- [ ] Verify saved collabs show filled heart icon
- [ ] Verify interested collabs show "Waitlisted" button
- [ ] Click heart button to save/unsave - verify state updates
- [ ] Click interest button to add/remove interest - verify state updates
- [ ] Refresh page - verify states persist
- [ ] Navigate to http://localhost:3000/collab/manage-collab
- [ ] Verify same behavior on user's own collabs
- [ ] Refresh page - verify states persist

## Database Tables Involved

### `collab_saves`
- `id` - Primary key
- `collab_id` - Foreign key to collab_posts
- `user_id` - Foreign key to auth.users
- `created_at` - Timestamp

### `collab_interests`
- `id` - Primary key
- `collab_id` - Foreign key to collab_posts
- `user_id` - Foreign key to auth.users
- `created_at` - Timestamp

## API Endpoints Used

- `GET /api/collab` - Fetch all collabs with user-specific states
- `GET /api/collab/my` - Fetch user's own collabs
- `POST /api/collab/[id]/interest` - Express interest
- `DELETE /api/collab/[id]/interest` - Remove interest
- `POST /api/collab/[id]/save` - Save collab
- `DELETE /api/collab/[id]/save` - Unsave collab

## Fix Status
✅ **IMPLEMENTED** - Ready for testing in localhost
