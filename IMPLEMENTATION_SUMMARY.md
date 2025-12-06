# Profile Save/Share/Message Feature Implementation

## Overview
Added heart (save), share, and message buttons to user profile pages, similar to the collab page functionality.

## Features Implemented

### 1. Save Profile (Heart Button)
- Users can save/unsave other user profiles
- Heart icon fills when profile is saved
- Shows loading state during save/unsave operations
- Toast notifications for success/error states
- Desktop: Small circular button next to availability
- Mobile: Full-width button with text

### 2. Share Profile (Share Button)
- Users can share profiles via:
  - Copy link to clipboard
  - Share on Twitter
  - Share on LinkedIn
  - Share on Facebook
- Desktop: Small circular button
- Mobile: Full-width button with text

### 3. Message Button
- Shows "Preparing soon" toast message when clicked
- Indicates feature is coming soon
- Desktop: Small circular button
- Mobile: Full-width button with text

## Files Created

### 1. API Route
**File**: `/app/app/api/profile/[userId]/save/route.ts`
- POST endpoint to save a profile
- DELETE endpoint to unsave a profile
- Includes validation to prevent self-saving
- Returns total save count

### 2. API Helper Functions
**File**: `/app/lib/api/profile-save.ts`
- `saveProfile(profileUserId)` - Save a profile
- `unsaveProfile(profileUserId)` - Unsave a profile
- `checkProfileSaved(profileUserId)` - Check if profile is saved
- Handles authentication tokens automatically

### 3. Share Modal Component
**File**: `/app/components/profile/ProfileShareModal.tsx`
- Reusable dialog component for sharing profiles
- Copy link functionality with clipboard API
- Social media sharing buttons
- Toast notifications for user feedback

### 4. SQL Schema
**File**: `/app/documentation/backend-documentation-and-commands/profile/PROFILE_SAVES_TABLE.sql`
- Complete SQL schema for `profile_saves` table
- Includes indexes for performance
- Row Level Security (RLS) policies
- Usage examples and verification queries

## Files Modified

### 1. ReadOnlyShortProfile Component
**File**: `/app/app/(app)/profile/[userId]/components/ReadOnlyShortProfile.tsx`
- Added heart/save button with state management
- Added share button using ProfileShareModal
- Added message button with toast notification
- Added buttons in desktop layout (aside availability)
- Added buttons in mobile layout (below profile info)
- Imported necessary icons and dependencies

### 2. User Profile Page
**File**: `/app/app/(app)/profile/[userId]/page.tsx`
- Added `isSaved` state to track save status
- Passes `initialSaved` prop to ReadOnlyShortProfile
- Fetches and sets saved status from API response

### 3. Explore API
**File**: `/app/app/api/explore/[userId]/route.ts`
- Added logic to check if profile is saved by current user
- Returns `userHasSaved` boolean in API response
- Handles both authenticated and public access

## Database Changes Required

### SQL Command to Run:
Run the SQL commands from: `/app/documentation/backend-documentation-and-commands/profile/PROFILE_SAVES_TABLE.sql`

**Quick command**:
```sql
CREATE TABLE IF NOT EXISTS profile_saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_user_id, user_id),
    CHECK (profile_user_id != user_id)
);

CREATE INDEX idx_profile_saves_user_id ON profile_saves(user_id);
CREATE INDEX idx_profile_saves_profile_user_id ON profile_saves(profile_user_id);

ALTER TABLE profile_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saves"
    ON profile_saves FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can save profiles"
    ON profile_saves FOR INSERT
    WITH CHECK (auth.uid() = user_id AND profile_user_id != user_id);

CREATE POLICY "Users can delete their own saves"
    ON profile_saves FOR DELETE
    USING (auth.uid() = user_id);
```

## UI/UX Details

### Desktop Layout
- Three circular buttons positioned next to the availability status
- Icons only (no text)
- Hover effects with color transitions
- Border styling for visual consistency
- Heart icon fills when saved
- Size: 36px (h-9 w-9)

### Mobile Layout
- Three full-width buttons below profile information
- Icons + text labels
- Responsive flex layout
- Border top separator
- Size: 40px height (h-10)

### Color Scheme
- Heart/Message buttons: `#FA6E80` (pink/coral)
- Share button: `#31A7AC` (teal)
- Background: Gray-50 with hover states
- Border: Gray-200

## Testing Checklist

- [ ] Run SQL command to create `profile_saves` table
- [ ] Verify table exists with correct schema
- [ ] Test save profile functionality (heart button)
- [ ] Test unsave profile functionality (filled heart button)
- [ ] Test share profile functionality (copy link)
- [ ] Test share profile on social media (Twitter, LinkedIn, Facebook)
- [ ] Test message button (should show "Preparing soon" toast)
- [ ] Test on desktop layout
- [ ] Test on mobile layout
- [ ] Verify saved state persists on page refresh
- [ ] Verify cannot save own profile
- [ ] Test authentication error handling
- [ ] Verify loading states work correctly
- [ ] Test toast notifications appear correctly

## API Contracts

### Save Profile
**Endpoint**: `POST /api/profile/[userId]/save`
**Auth**: Required
**Response**:
```json
{
  "success": true,
  "message": "Profile saved successfully",
  "data": {
    "save_id": "uuid",
    "profile_user_id": "uuid",
    "user_id": "uuid",
    "created_at": "timestamp",
    "totalSaves": 1
  }
}
```

### Unsave Profile
**Endpoint**: `DELETE /api/profile/[userId]/save`
**Auth**: Required
**Response**:
```json
{
  "success": true,
  "message": "Save removed successfully",
  "data": {
    "totalSaves": 0
  }
}
```

### Get Profile (Updated)
**Endpoint**: `GET /api/explore/[userId]`
**Auth**: Optional
**Response**: (includes new field)
```json
{
  "success": true,
  "data": {
    ...existing fields...,
    "userHasSaved": false
  }
}
```

## Notes
- The implementation follows the same pattern as collab saves
- All components use proper TypeScript types
- Error handling includes user-friendly toast messages
- Loading states prevent duplicate requests
- RLS policies ensure data security
- Public profiles can be viewed without authentication
- Save status only available for authenticated users
