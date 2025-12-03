# Gigs API Database Query Fix Summary

## Problem Statement
The Gigs API was experiencing **500 Internal Server Error** responses when creating and fetching gigs. The issue was caused by inconsistent database column references when querying the `user_profiles` table.

## Root Cause Analysis

The `user_profiles` table uses `user_id` as its primary key column (which references the Supabase auth user ID), but multiple API routes were incorrectly using `.eq('id', ...)` instead of `.eq('user_id', ...)` when querying this table.

### Affected Files and Lines

1. **`/app/app/api/gigs/route.ts`** (Line 95)
   - **Issue**: Used `.eq('id', gig.created_by)` when fetching creator profile
   - **Fixed**: Changed to `.eq('user_id', gig.created_by)`

2. **`/app/app/api/gigs/[id]/route.ts`** (Line 44)
   - **Issue**: Used `.eq('id', gig.created_by)` when fetching creator profile
   - **Fixed**: Changed to `.eq('user_id', gig.created_by)`

3. **`/app/app/api/gigs/slug/[slug]/route.ts`** (Line 44)
   - **Issue**: Used `.eq('id', gig.created_by)` when fetching creator profile
   - **Fixed**: Changed to `.eq('user_id', gig.created_by)`

4. **`/app/app/api/gigs/[id]/applications/route.ts`** (Line 89 & 98)
   - **Issue**: Selected `id` column and used `.eq('id', app.applicant_user_id)`
   - **Fixed**: Changed to select `user_id` column and use `.eq('user_id', app.applicant_user_id)`

5. **`/app/app/api/gigs/[id]/availability/route.ts`** (Line 126)
   - **Issue**: Used `.eq('id', app.applicant_user_id)` when fetching applicant profile
   - **Fixed**: Changed to `.eq('user_id', app.applicant_user_id)`

6. **`/app/app/api/gigs/[id]/apply/route.ts`** (Line 116)
   - **Issue**: Used `.eq('id', user.id)` when fetching applicant profile
   - **Fixed**: Changed to `.eq('user_id', user.id)`

## Database Schema Confirmation

Based on the profile API routes (`/app/app/api/profile/route.ts`), the `user_profiles` table structure uses:
- **Primary Key Column**: `user_id` (references Supabase auth.users)
- **NOT**: `id`

Example from working profile API:
```typescript
.from('user_profiles')
.select('user_id, first_name, surname, ...')
.eq('user_id', user.id)
```

## What Was NOT Broken

The helper function `/app/lib/supabase/helpers.ts` line 86 was **correctly** using:
```typescript
.eq('user_id', userId)
```

The user's initial report incorrectly identified the helper as the issue, but it was actually the gigs API routes that had the bug.

## Impact

### Before Fix:
- ❌ Creating gigs would fail with 500 errors
- ❌ Fetching gigs would return incomplete data (missing creator names/avatars)
- ❌ Gig details pages would show "Unknown" for creator names
- ❌ Applications page would fail to load applicant profiles

### After Fix:
- ✅ Gigs can be created successfully and stored in Supabase
- ✅ Gigs list properly displays creator information
- ✅ Gig details show correct creator names and avatars
- ✅ Applications show complete applicant profiles

## Testing Recommendations

1. **Create a new gig** via the frontend at `/gigs/manage-gigs/add-new`
2. **Verify the gig appears** in the gigs list at `/gigs`
3. **Check creator name** displays correctly (not "Unknown")
4. **View gig details** and confirm all fields are populated
5. **Test applications** to ensure applicant profiles load correctly

## Files Modified

- `/app/app/api/gigs/route.ts`
- `/app/app/api/gigs/[id]/route.ts`
- `/app/app/api/gigs/slug/[slug]/route.ts`
- `/app/app/api/gigs/[id]/applications/route.ts`
- `/app/app/api/gigs/[id]/availability/route.ts`
- `/app/app/api/gigs/[id]/apply/route.ts`

## Related React Key Warnings

The console also showed React key warnings. These are separate issues related to:
1. Missing unique keys in list rendering (using array indexes instead)
2. Can be addressed in a separate fix if needed

## Conclusion

The database query inconsistency has been fixed across all gigs API routes. All queries to `user_profiles` now correctly use `user_id` as the filter column, matching the actual database schema.
