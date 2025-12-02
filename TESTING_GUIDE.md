# Testing Guide for Profile Image Display Fix

## Overview
This guide helps verify that profile images display correctly in the collab section with the proper fallback mechanism.

## Test Scenarios

### Scenario 1: User with Uploaded Profile Photo
**Setup:**
- User has uploaded a profile photo (`profile_photo_url` is set in `user_profiles` table)

**Expected Result:**
- User's uploaded photo should be displayed

**Test Endpoints:**
- GET `/api/collab` - Check author avatar in feed
- GET `/api/collab/{id}` - Check author avatar in detail view
- GET `/api/collab/{id}/interests` - Check interested user avatars
- GET `/api/collab/{id}/collaborators` - Check collaborator avatars

### Scenario 2: User with Google OAuth (No Uploaded Photo)
**Setup:**
- User logged in with Google OAuth
- User has NOT uploaded a profile photo (`profile_photo_url` is NULL or empty)
- User has Google avatar in `auth.users.user_metadata.avatar_url` or `user_metadata.picture`

**Expected Result:**
- Google profile picture should be displayed

**Test Endpoints:**
- Same as Scenario 1

### Scenario 3: User with No Photo at All
**Setup:**
- User has NO uploaded profile photo
- User has NO Google OAuth metadata

**Expected Result:**
- Placeholder image (`/placeholder-avatar.png`) should be displayed

**Test Endpoints:**
- Same as Scenario 1

## Manual Testing Steps

### Step 1: Test Main Collab Feed
```bash
# Get auth token first (login via UI and extract from browser)
# Then test the API
curl -X GET "http://localhost:3000/api/collab?page=1&limit=10"
```

**Check:**
- `author.avatar` field in each collab post
- `interestAvatars` array in each collab post

### Step 2: Test Individual Collab Detail
```bash
curl -X GET "http://localhost:3000/api/collab/{COLLAB_ID}" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Check:**
- `author.avatar` field
- `collaborators[].avatar` field (if owner)

### Step 3: Test Interested Users List
```bash
curl -X GET "http://localhost:3000/api/collab/{COLLAB_ID}/interests" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Check:**
- `interests[].user.avatar` field for each interested user

### Step 4: Test Collaborators List
```bash
curl -X GET "http://localhost:3000/api/collab/{COLLAB_ID}/collaborators"
```

**Check:**
- `collaborators[].user.avatar` field

### Step 5: Test User's Own Collabs
```bash
curl -X GET "http://localhost:3000/api/collab/my?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Check:**
- `interestAvatars` array in each collab

## UI Testing

### Test in Browser
1. Navigate to the collab page: `/collab`
2. Check profile images for:
   - Post authors
   - Interested users (small avatars at bottom)
3. Create test users with different scenarios:
   - User A: Upload profile photo
   - User B: Login with Google (don't upload photo)
   - User C: Regular signup (no photo)
4. Have each user:
   - Create a collab post
   - Express interest in another collab
5. Verify images display correctly for all three scenarios

## Database Verification

### Check User Profile Data
```sql
-- Check a user's profile photo
SELECT user_id, profile_photo_url 
FROM user_profiles 
WHERE user_id = 'USER_ID';

-- Check Google OAuth metadata
SELECT id, raw_user_meta_data
FROM auth.users
WHERE id = 'USER_ID';
```

### Expected Google Metadata Structure
```json
{
  "avatar_url": "https://lh3.googleusercontent.com/...",
  "email": "user@example.com",
  "picture": "https://lh3.googleusercontent.com/...",
  ...
}
```

## Common Issues & Debugging

### Issue 1: All Images Show Placeholder
**Possible Causes:**
- `supabase.auth.admin.listUsers()` might be failing
- Service role key not configured properly

**Debug:**
Check API logs for errors related to auth admin API calls

### Issue 2: Google Images Not Loading
**Possible Causes:**
- CORS issues with Google's CDN
- Image URLs might be expired
- Next.js image domains not configured

**Fix:**
Add Google's image domain to `next.config.ts`:
```typescript
images: {
  domains: ['lh3.googleusercontent.com']
}
```

### Issue 3: Uploaded Images Not Showing
**Possible Causes:**
- Supabase Storage bucket permissions
- Image URL format incorrect

**Debug:**
- Check if `profile_photo_url` is a valid URL
- Verify Supabase Storage bucket is publicly accessible

## Success Criteria
✅ Users with uploaded photos see their uploaded images
✅ Users with Google OAuth see their Google profile pictures
✅ Users without either see placeholder images
✅ No broken image links or 404 errors
✅ Image fallback works across all collab endpoints
✅ Performance is acceptable (no significant slowdown)

## Notes
- The fix uses batch fetching to minimize API calls
- Google avatar URLs are fetched once per request and cached in a Map
- The implementation matches the pattern used in the explore page
- All changes are backward compatible
