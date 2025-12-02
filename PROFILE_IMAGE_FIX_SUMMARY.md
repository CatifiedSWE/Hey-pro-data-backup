# Profile Image Display Fix for Collab Section

## Issue
Profile images were not displaying correctly in the collab section when users had Google OAuth metadata but no uploaded profile photo. The system was only checking the `profile_photo_url` field and falling back to a placeholder, ignoring Google profile pictures.

## Solution
Implemented a three-tier fallback system for profile images across all collab API endpoints:

### Priority Order
1. **User Uploaded Profile Photo** - `profile_photo_url` from `user_profiles` table
2. **Google OAuth Metadata** - `user_metadata.avatar_url` or `user_metadata.picture` from `auth.users` table
3. **Placeholder Image** - `/placeholder-avatar.png`

## Files Modified

### 1. `/app/app/api/collab/route.ts`
**Endpoint**: GET /api/collab (Public collab feed)
- Added batch fetching of Google OAuth avatars for all authors and interested users
- Created `googleAvatarMap` for efficient lookup
- Implemented fallback logic for author avatars and interested user avatars

### 2. `/app/app/api/collab/[id]/route.ts`
**Endpoint**: GET /api/collab/[id] (Individual collab details)
- Fetches Google OAuth metadata for the author
- Implements fallback for author avatar
- Implements fallback for collaborator avatars (when user is owner)

### 3. `/app/app/api/collab/[id]/interests/route.ts`
**Endpoint**: GET /api/collab/[id]/interests (List interested users - owner only)
- Fetches Google OAuth metadata for all interested users
- Implements fallback logic for each interested user's avatar

### 4. `/app/app/api/collab/[id]/collaborators/route.ts`
**Endpoint**: GET /api/collab/[id]/collaborators (List collaborators - public)
- Fetches Google OAuth metadata for all collaborators
- Implements fallback logic for collaborator avatars

### 5. `/app/app/api/collab/my/route.ts`
**Endpoint**: GET /api/collab/my (User's own collabs)
- Fetches Google OAuth metadata for all interested users across user's collabs
- Implements fallback logic for interested user avatars

## Implementation Details

### Pattern Used
```typescript
// 1. Fetch Google OAuth metadata
const { data: authUsersResponse } = await supabase.auth.admin.listUsers();

// 2. Create avatar map
const googleAvatarMap = new Map<string, string>();
if (authUsersResponse?.users) {
  authUsersResponse.users.forEach(authUser => {
    if (authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture) {
      googleAvatarMap.set(
        authUser.id, 
        authUser.user_metadata.avatar_url || authUser.user_metadata.picture
      );
    }
  });
}

// 3. Apply fallback logic
let avatar = '/placeholder-avatar.png';
if (profile?.profile_photo_url && profile.profile_photo_url.trim() !== '') {
  avatar = profile.profile_photo_url;
} else if (googleAvatarMap.has(userId)) {
  avatar = googleAvatarMap.get(userId)!;
}
```

## Testing Checklist
- [ ] User with uploaded profile photo displays correctly
- [ ] User with Google OAuth login (no uploaded photo) displays Google avatar
- [ ] User with neither displays placeholder image
- [ ] Main collab feed shows correct avatars for authors
- [ ] Interested users avatars display correctly
- [ ] Collaborator avatars display correctly
- [ ] Individual collab detail page shows correct author avatar
- [ ] User's own collabs page shows correct interested user avatars

## Expected Outcome
All profile images in the collab section should now display with the proper fallback:
1. If user uploaded a profile photo → show that
2. If user logged in with Google and has avatar → show Google profile picture
3. Otherwise → show placeholder image

This ensures a consistent user experience and matches the pattern already implemented in the explore page.

## Additional Notes
- This fix follows the same pattern used in `/app/app/(app)/(explore)/explore/page.tsx`
- The solution uses batch fetching to minimize API calls to Supabase Auth
- All avatar URLs are validated to ensure they're not empty strings before use
- The fix is backward compatible and won't break existing functionality
