# Profile Picture Fix Summary

## Issues Fixed

### Issue 1: Gigs Page - Missing Profile Pictures
**Status**: ✅ Already Working (No changes needed)
**Location**: `/app/app/api/gigs/route.ts`

The gigs page API was already correctly implemented with proper field mappings:
- Queries: `first_name`, `surname`, `alias_first_name`, `alias_surname`, `profile_photo_url`
- Proper name concatenation with fallbacks
- Profile photos should display correctly if data exists in database

### Issue 2: Manage Gigs Application Tab - "Unknown" User with No Profile Picture
**Status**: ✅ FIXED
**Location**: `/app/app/api/gigs/[id]/applications/route.ts`

**Root Cause**:
- The API was querying for a `name` field that doesn't exist in the `user_profiles` table
- This caused the profile query to fail silently, returning null for both name and profile photo

**Changes Made**:

1. **Updated Profile Query** (Lines 87-99):
   ```typescript
   // BEFORE (Incorrect - 'name' field doesn't exist)
   .select(`
     user_id,
     name,
     profile_photo_url,
     ...
   `)
   
   // AFTER (Correct - using actual database fields)
   .select(`
     user_id,
     first_name,
     surname,
     alias_first_name,
     alias_surname,
     profile_photo_url,
     ...
   `)
   ```

2. **Fixed Name Concatenation** (Lines 136-138):
   ```typescript
   // BEFORE
   name: profile?.name || 'Unknown',
   
   // AFTER (matches working pattern from gigs route)
   name: profile 
     ? `${profile.alias_first_name || profile.first_name || ''} ${profile.alias_surname || profile.surname || ''}`.trim() || 'Unknown'
     : 'Unknown',
   ```

## How It Works

The fix now properly:
1. Queries the correct fields from `user_profiles` table
2. Prioritizes alias names if available, falls back to real names
3. Trims and handles empty strings
4. Falls back to 'Unknown' only if no name data exists
5. Correctly maps `profile_photo_url` to `profilePhoto` in the response

## Testing

To test the fix:

1. **Restart the development server**:
   ```bash
   cd /app
   npm run dev
   ```

2. **Navigate to Manage Gigs**:
   - Go to `/gigs/manage-gigs`
   - Select a gig that has applications
   - Go to the "Application" tab

3. **Verify**:
   - User names should display correctly (not "Unknown")
   - Profile pictures should display if users have uploaded them
   - If no profile picture exists, the placeholder initial should show

## Database Schema Reference

The `user_profiles` table has these fields:
- `first_name` - User's first name
- `surname` - User's last name
- `alias_first_name` - Optional alias first name (shown publicly if set)
- `alias_surname` - Optional alias surname (shown publicly if set)
- `profile_photo_url` - URL to profile picture in Supabase storage

## Files Modified

- ✅ `/app/app/api/gigs/[id]/applications/route.ts` - Fixed profile data fetching

## Files Verified (No Changes Needed)

- ✅ `/app/app/api/gigs/route.ts` - Already correct
- ✅ `/app/app/(app)/(gigs)/gigs/page.tsx` - Frontend correctly displays data
- ✅ `/app/app/(app)/(gigs)/components/manage-gigs/application-tab.tsx` - Frontend correctly displays data

## Notes

- The fix follows the same pattern used successfully in other parts of the codebase
- Profile pictures will only show if users have actually uploaded them to their profiles
- The fix handles both cases: when profile data exists and when it doesn't
- No frontend changes were needed - the issue was purely in the API layer
