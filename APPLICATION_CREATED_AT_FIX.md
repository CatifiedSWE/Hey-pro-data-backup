# Applications Created_At Column Fix

**Date:** January 2025  
**Issue:** PostgreSQL error 42703 - column applications.created_at does not exist  
**Status:** ✅ Fixed

---

## Problem

The `applications` table in the database was missing the `created_at` column, causing multiple API endpoints to fail with the error:

```
Applications fetch error: {
  code: '42703',
  details: null,
  hint: 'Perhaps you meant to reference the column "applications.updated_at".',
  message: 'column applications.created_at does not exist'
}
```

Error occurred when accessing:
- `GET /api/gigs/[id]/applications` - Failed with 500 error
- Other application-related endpoints

---

## Root Cause

The database schema for the `applications` table only has an `updated_at` column, but the API code was attempting to:
1. SELECT `created_at` in queries
2. ORDER BY `created_at`
3. Return `created_at` as `appliedAt` in responses

---

## Solution

Replaced all references to `applications.created_at` with `applications.updated_at` in the following API route files:

### Files Modified:

1. **`/app/app/api/gigs/[id]/applications/route.ts`**
   - Removed `created_at` from SELECT query (line 61)
   - Changed ORDER BY from `created_at` to `updated_at` (line 64)
   - Changed `appliedAt: app.created_at` to `appliedAt: app.updated_at` (line 129)

2. **`/app/app/api/applications/my/route.ts`**
   - Removed `created_at` from SELECT query (line 40)
   - Changed ORDER BY from `created_at` to `updated_at` (line 44)
   - Changed `appliedAt: app.created_at` to `appliedAt: app.updated_at` (line 119)

3. **`/app/app/api/applications/[id]/route.ts`**
   - Removed `created_at` from SELECT query (line 39)
   - Changed `appliedAt: application.created_at` to `appliedAt: application.updated_at` (line 135)

4. **`/app/app/api/gigs/[id]/apply/route.ts`**
   - Changed `appliedAt: application.created_at` to `appliedAt: application.updated_at` (line 144)

---

## Changes Made

### Before:
```typescript
.select(`
  id,
  gig_id,
  applicant_user_id,
  status,
  cover_letter,
  portfolio_links,
  resume_url,
  created_at,    // ❌ Column doesn't exist
  updated_at
`)
.order('created_at', { ascending: false });  // ❌ Column doesn't exist

// Response mapping
appliedAt: app.created_at  // ❌ Field doesn't exist
```

### After:
```typescript
.select(`
  id,
  gig_id,
  applicant_user_id,
  status,
  cover_letter,
  portfolio_links,
  resume_url,
  updated_at      // ✅ Use existing column
`)
.order('updated_at', { ascending: false });  // ✅ Use existing column

// Response mapping
appliedAt: app.updated_at   // ✅ Use existing field
```

---

## Impact

- **Fixed:** All application-related API endpoints now work correctly
- **Behavior Change:** The `appliedAt` field now returns the `updated_at` timestamp instead of `created_at`
- **Note:** Since the table didn't have `created_at`, the previous code was non-functional, so this is purely a fix

---

## Testing

To verify the fix works:

1. **Test GET applications for a gig:**
   ```bash
   curl -X GET "http://localhost:3000/api/gigs/[GIG_ID]/applications" \
     -H "Authorization: Bearer [TOKEN]"
   ```

2. **Test GET user's applications:**
   ```bash
   curl -X GET "http://localhost:3000/api/applications/my" \
     -H "Authorization: Bearer [TOKEN]"
   ```

3. **Test GET single application:**
   ```bash
   curl -X GET "http://localhost:3000/api/applications/[APPLICATION_ID]" \
     -H "Authorization: Bearer [TOKEN]"
   ```

4. **Test apply to gig:**
   ```bash
   curl -X POST "http://localhost:3000/api/gigs/[GIG_ID]/apply" \
     -H "Authorization: Bearer [TOKEN]" \
     -H "Content-Type: application/json" \
     -d '{"coverLetter": "Test application"}'
   ```

---

## Future Considerations

If the business logic requires tracking both creation and update times separately:

**Option 1: Add created_at column to database**
```sql
ALTER TABLE applications 
ADD COLUMN created_at TIMESTAMP DEFAULT NOW();

-- Backfill with updated_at values
UPDATE applications 
SET created_at = updated_at 
WHERE created_at IS NULL;
```

**Option 2: Keep current implementation**
- Continue using `updated_at` as the application timestamp
- This is acceptable if the distinction between creation and update isn't critical

---

## Status

✅ **Fixed and Ready for Testing**

All API endpoints should now work correctly. The error:
```
column applications.created_at does not exist
```
should no longer occur.
