# Slate API 500 Error - Root Cause Analysis & Fix Plan

**Date:** January 2025  
**Issue:** GET /api/slate?page=1&limit=20&sort=latest returns 500 error  
**Severity:** High - Breaks main social feed functionality  
**Status:** Analysis Complete - Ready for Implementation

---

## 📋 Table of Contents

1. [Root Cause Analysis](#root-cause-analysis)
2. [Affected Files](#affected-files)
3. [Step-by-Step Fix Plan](#step-by-step-fix-plan)
4. [Testing Plan](#testing-plan)
5. [Rollback Plan](#rollback-plan)
6. [Prevention Strategy](#prevention-strategy)

---

## 🔍 Root Cause Analysis

### The Problem

**File:** `/app/app/api/slate/route.ts` (lines 34-39)  
**Issue:** Foreign key relationship mismatch in Supabase query JOIN

### Technical Details

**Current Query (BROKEN):**
```typescript
author:user_id (
  id,
  alias_first_name,      // ❌ These fields don't exist in auth.users
  alias_surname,         // ❌ They exist in user_profiles table
  profile_photo_url      // ❌
)
```

**Database Schema:**
```
slate_posts.user_id → auth.users.id (FK)
user_profiles.user_id → auth.users.id (FK)

Profile fields are in user_profiles, NOT in auth.users
```

**Why It Fails:**
- The query uses `author:user_id` syntax which tries to JOIN directly through the `user_id` foreign key
- This FK points to `auth.users` table (Supabase Auth)
- However, the fields being requested (`alias_first_name`, `alias_surname`, `profile_photo_url`) exist in `user_profiles` table
- Result: Supabase can't find these columns in `auth.users` → 500 error

### Impact Assessment

**Severity:** HIGH
- Main slate feed is completely broken
- Users cannot view any posts
- No social media functionality working

**Affected Endpoints:**
- ✅ GET /api/slate (main feed) - **PRIMARY ISSUE**
- ✅ GET /api/slate/my (user's posts) - Same pattern
- ✅ GET /api/slate/saved (saved posts) - Same pattern
- ✅ GET /api/slate/[id] (single post) - Same pattern
- ✅ GET /api/slate/[id]/likes (who liked) - Same pattern
- ✅ GET /api/slate/[id]/comment (comments) - Same pattern

---

## 📂 Affected Files

### Files Requiring Updates

| File Path | Issue | Priority |
|-----------|-------|----------|
| `/app/app/api/slate/route.ts` | Main feed query broken | **CRITICAL** |
| `/app/app/api/slate/my/route.ts` | User's posts query broken | HIGH |
| `/app/app/api/slate/saved/route.ts` | Saved posts query broken | HIGH |
| `/app/app/api/slate/[id]/route.ts` | Single post detail broken | HIGH |
| `/app/app/api/slate/[id]/likes/route.ts` | Likes list broken | MEDIUM |
| `/app/app/api/slate/[id]/comment/route.ts` | Comments with user data broken | MEDIUM |

### Files to Review (Potential Issues)

| File Path | Concern |
|-----------|---------|
| `/app/app/api/collab/route.ts` | May have similar JOIN pattern |
| `/app/app/api/whatson/route.ts` | May have similar JOIN pattern |
| `/app/app/api/gigs/route.ts` | May have similar JOIN pattern |

---

## 🛠️ Step-by-Step Fix Plan

### Phase 1: Database Schema Verification (5 minutes)

**Goal:** Confirm the database relationships before making code changes

#### Step 1.1: Verify Foreign Key Relationships
```bash
# Connect to your Supabase project and run:
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'slate_posts' AND tc.constraint_type = 'FOREIGN KEY';
```

**Expected Result:**
- `slate_posts.user_id` → `auth.users.id`

#### Step 1.2: Verify user_profiles Table Structure
```bash
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('user_id', 'alias_first_name', 'alias_surname', 'profile_photo_url');
```

**Expected Result:**
- All 4 columns should exist with appropriate data types

#### Step 1.3: Check if Data Exists
```bash
SELECT COUNT(*) FROM slate_posts;
SELECT COUNT(*) FROM user_profiles;
SELECT COUNT(*) FROM slate_posts sp 
LEFT JOIN user_profiles up ON sp.user_id = up.user_id 
WHERE up.user_id IS NULL;
```

**Action:** If the last query returns > 0, there are orphaned posts (posts without user profiles). Document this for later handling.

---

### Phase 2: Fix Main Slate Feed Endpoint (10 minutes)

**File:** `/app/app/api/slate/route.ts`

#### Step 2.1: Backup Current File
```bash
cp /app/app/api/slate/route.ts /app/app/api/slate/route.ts.backup
```

#### Step 2.2: Update the GET Query (Lines 21-46)

**REPLACE THIS:**
```typescript
let query = supabase
  .from('slate_posts')
  .select(`
    id,
    content,
    slug,
    status,
    likes_count,
    comments_count,
    shares_count,
    created_at,
    updated_at,
    user_id,
    author:user_id (
      id,
      alias_first_name,
      alias_surname,
      profile_photo_url
    ),
    media:slate_media(
      id,
      media_url,
      media_type,
      sort_order
    )
  `, { count: 'exact' })
  .eq('status', 'published');
```

**WITH THIS (Option A - Nested JOIN):**
```typescript
let query = supabase
  .from('slate_posts')
  .select(`
    id,
    content,
    slug,
    status,
    likes_count,
    comments_count,
    shares_count,
    created_at,
    updated_at,
    user_id,
    user_profiles!inner (
      user_id,
      alias_first_name,
      alias_surname,
      profile_photo_url
    ),
    media:slate_media(
      id,
      media_url,
      media_type,
      sort_order
    )
  `, { count: 'exact' })
  .eq('status', 'published');
```

**OR THIS (Option B - Separate Query - More Reliable):**
```typescript
// First, select without author join
let query = supabase
  .from('slate_posts')
  .select(`
    id,
    content,
    slug,
    status,
    likes_count,
    comments_count,
    shares_count,
    created_at,
    updated_at,
    user_id,
    media:slate_media(
      id,
      media_url,
      media_type,
      sort_order
    )
  `, { count: 'exact' })
  .eq('status', 'published');
```

#### Step 2.3: Update Response Formatting (Lines 97-115)

**IF USING OPTION A (Nested JOIN):**

Update lines 107-111 from:
```typescript
author: {
  id: post.author?.id,
  name: `${post.author?.alias_first_name || ''} ${post.author?.alias_surname || ''}`.trim(),
  avatar: post.author?.profile_photo_url || '',
},
```

To:
```typescript
author: {
  id: post.user_profiles?.user_id,
  name: `${post.user_profiles?.alias_first_name || ''} ${post.user_profiles?.alias_surname || ''}`.trim(),
  avatar: post.user_profiles?.profile_photo_url || '',
},
```

**IF USING OPTION B (Separate Query):**

Add after line 65 (after the main query):
```typescript
const { data: posts, error, count } = await query;

if (error) {
  return NextResponse.json(
    errorResponse('Failed to fetch posts', error.message),
    { status: 500 }
  );
}

// Fetch user profiles for all post authors
let userProfiles: Record<string, any> = {};
if (posts && posts.length > 0) {
  const userIds = [...new Set(posts.map(p => p.user_id))];
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
}
```

Then update lines 107-111:
```typescript
author: {
  id: post.user_id,
  name: `${userProfiles[post.user_id]?.alias_first_name || ''} ${userProfiles[post.user_id]?.alias_surname || ''}`.trim(),
  avatar: userProfiles[post.user_id]?.profile_photo_url || '',
},
```

#### Step 2.4: Recommended Approach

**USE OPTION B (Separate Query)** because:
- ✅ More reliable - explicit control over JOINs
- ✅ Better error handling - can gracefully handle missing profiles
- ✅ More efficient for large datasets - can use IN query with unique user_ids
- ✅ Easier to debug and maintain

---

### Phase 3: Fix Related Slate Endpoints (20 minutes)

Apply the same fix pattern to all other slate endpoints.

#### Step 3.1: Fix GET /api/slate/my

**File:** `/app/app/api/slate/my/route.ts`

1. Backup file: `cp /app/app/api/slate/my/route.ts /app/app/api/slate/my/route.ts.backup`
2. Apply the same query fix as Phase 2
3. Update response formatting

#### Step 3.2: Fix GET /api/slate/saved

**File:** `/app/app/api/slate/saved/route.ts`

1. Backup file: `cp /app/app/api/slate/saved/route.ts /app/app/api/slate/saved/route.ts.backup`
2. Apply the same query fix as Phase 2
3. Update response formatting

#### Step 3.3: Fix GET /api/slate/[id]

**File:** `/app/app/api/slate/[id]/route.ts`

1. Backup file: `cp /app/app/api/slate/[id]/route.ts /app/app/api/slate/[id]/route.ts.backup`
2. Apply the same query fix (for single post)
3. Update response formatting

#### Step 3.4: Fix GET /api/slate/[id]/likes

**File:** `/app/app/api/slate/[id]/likes/route.ts`

1. Check if this endpoint fetches user profiles
2. If yes, apply the same fix pattern
3. If no, skip

#### Step 3.5: Fix GET /api/slate/[id]/comment

**File:** `/app/app/api/slate/[id]/comment/route.ts`

1. Check if comments query includes user profile data
2. Apply fix if needed (comments likely have the same issue)

---

### Phase 4: Review Other Modules (15 minutes)

Check if similar patterns exist in other API modules.

#### Step 4.1: Check Collab API
```bash
grep -n "author:user_id" /app/app/api/collab/route.ts
```

If found, apply similar fix.

#### Step 4.2: Check What's On API
```bash
grep -n "author:user_id" /app/app/api/whatson/route.ts
grep -n "creator:created_by" /app/app/api/whatson/route.ts
```

If found, apply similar fix.

#### Step 4.3: Check Gigs API
```bash
grep -n "author:created_by" /app/app/api/gigs/route.ts
grep -n "postedBy:created_by" /app/app/api/gigs/route.ts
```

If found, apply similar fix.

#### Step 4.4: Search All API Files
```bash
cd /app/app/api
grep -r "author:" . | grep -v ".backup" | grep "route.ts"
grep -r "user_id (" . | grep -v ".backup" | grep "route.ts"
```

Document all findings and add to fix list.

---

### Phase 5: Restart Services (2 minutes)

#### Step 5.1: Restart Backend
```bash
sudo supervisorctl restart backend
```

#### Step 5.2: Verify Backend is Running
```bash
sudo supervisorctl status backend
```

Expected output: `backend RUNNING`

#### Step 5.3: Check for Errors
```bash
tail -50 /var/log/supervisor/backend.err.log
```

Should show no errors related to slate endpoints.

---

## 🧪 Testing Plan

### Manual Testing

#### Test 1: Main Feed Endpoint
```bash
# Without authentication
curl -X GET "http://localhost:3000/api/slate?page=1&limit=5&sort=latest" \
  -H "Content-Type: application/json"

# Expected: 200 OK with posts array
# Expected: Each post has author object with name and avatar
```

#### Test 2: With Search Parameter
```bash
curl -X GET "http://localhost:3000/api/slate?page=1&limit=5&search=test" \
  -H "Content-Type: application/json"

# Expected: 200 OK with filtered results
```

#### Test 3: Sort by Popular
```bash
curl -X GET "http://localhost:3000/api/slate?page=1&limit=5&sort=popular" \
  -H "Content-Type: application/json"

# Expected: 200 OK with posts sorted by likes_count
```

#### Test 4: With Authentication (User Likes/Saves)
```bash
curl -X GET "http://localhost:3000/api/slate?page=1&limit=5" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Expected: 200 OK with user_has_liked and user_has_saved flags
```

#### Test 5: My Posts
```bash
curl -X GET "http://localhost:3000/api/slate/my" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Expected: 200 OK with user's posts
```

#### Test 6: Saved Posts
```bash
curl -X GET "http://localhost:3000/api/slate/saved" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Expected: 200 OK with saved posts
```

#### Test 7: Single Post
```bash
curl -X GET "http://localhost:3000/api/slate/POST_ID_HERE" \
  -H "Content-Type: application/json"

# Expected: 200 OK with single post and author data
```

### Edge Cases to Test

#### Test 8: Post with Missing User Profile
```bash
# Manually create a test scenario where user_profile is missing
# Expected: Post should still return, but author data should be gracefully empty/null
```

#### Test 9: Post with Multiple Media Items
```bash
# Expected: Media array should be sorted by sort_order
```

#### Test 10: Empty Feed
```bash
# Test with no published posts
# Expected: 200 OK with empty posts array
```

### Performance Testing

#### Test 11: Large Dataset
```bash
# Request large limit
curl -X GET "http://localhost:3000/api/slate?page=1&limit=50" \
  -H "Content-Type: application/json"

# Expected: Response time < 500ms
# Expected: Proper pagination data
```

#### Test 12: Pagination
```bash
# Test multiple pages
for i in {1..5}; do
  curl -X GET "http://localhost:3000/api/slate?page=$i&limit=10"
done

# Expected: Each page returns correct data
# Expected: pagination.hasMore is accurate
```

### Automated Testing Checklist

- [ ] All manual tests pass
- [ ] No 500 errors in logs
- [ ] Response format matches API documentation
- [ ] Author data is present and correct
- [ ] Media items are properly attached and sorted
- [ ] User interaction flags work (likes/saves)
- [ ] Pagination works correctly
- [ ] Search functionality works
- [ ] Sorting works (latest/popular)
- [ ] Performance is acceptable (< 500ms for normal queries)

---

## 🔙 Rollback Plan

### If Issues Occur After Deployment

#### Step 1: Restore Original Files
```bash
# Restore main endpoint
cp /app/app/api/slate/route.ts.backup /app/app/api/slate/route.ts

# Restore other endpoints if needed
cp /app/app/api/slate/my/route.ts.backup /app/app/api/slate/my/route.ts
cp /app/app/api/slate/saved/route.ts.backup /app/app/api/slate/saved/route.ts
cp /app/app/api/slate/[id]/route.ts.backup /app/app/api/slate/[id]/route.ts
```

#### Step 2: Restart Services
```bash
sudo supervisorctl restart backend
```

#### Step 3: Verify Rollback
```bash
curl -X GET "http://localhost:3000/api/slate?page=1&limit=5"
# Should return to previous state (even if broken)
```

#### Step 4: Document Issue
Create a file `/app/documentation/SLATE_FIX_ROLLBACK_NOTES.md` with:
- What went wrong
- Error messages observed
- Why rollback was needed
- Next steps for retry

---

## 🛡️ Prevention Strategy

### 1. Add Database Schema Validation

Create a script to validate foreign key relationships match code expectations:

**File:** `/app/scripts/validate-db-schema.sh`
```bash
#!/bin/bash
# Validates that foreign keys in code match database schema

echo "Checking slate_posts foreign keys..."
# Add validation queries here
```

### 2. Add Unit Tests

Create tests for Supabase query patterns:

**File:** `/app/__tests__/api/slate.test.ts`
```typescript
describe('Slate API - User Profile JOIN', () => {
  it('should fetch posts with user profiles', async () => {
    // Test the query pattern
  });
  
  it('should handle missing user profiles gracefully', async () => {
    // Test edge case
  });
});
```

### 3. Add Type Safety

Create TypeScript types for database relations:

**File:** `/app/types/database.ts`
```typescript
export interface SlatePostWithAuthor {
  id: string;
  content: string;
  user_id: string;
  user_profiles: {
    user_id: string;
    alias_first_name: string;
    alias_surname: string;
    profile_photo_url: string;
  };
  // ... other fields
}
```

### 4. Documentation Updates

Update `/app/documentation/API-Docs/API_DOC.md` to include:
- Notes about foreign key relationships
- Examples of correct JOIN patterns
- Common pitfalls to avoid

### 5. Code Review Checklist

Add to `/app/documentation/CODE_REVIEW_CHECKLIST.md`:
- [ ] All foreign key JOINs verified against database schema
- [ ] Profile data fetched from user_profiles, not auth.users
- [ ] Graceful handling of missing related data
- [ ] Performance consideration for N+1 query issues

---

## 📊 Success Criteria

### Definition of Done

- [ ] All slate API endpoints return 200 OK
- [ ] No 500 errors in backend logs
- [ ] Author data appears correctly in all responses
- [ ] All manual tests pass
- [ ] Performance is acceptable (< 500ms)
- [ ] Edge cases handled gracefully
- [ ] Backup files created and documented
- [ ] Rollback plan tested
- [ ] Code committed with clear commit message
- [ ] Documentation updated

### Monitoring Post-Deployment

**For 24 hours after deployment:**
- Monitor error logs every 2 hours
- Check response times
- Verify no increase in 500 errors
- Check user feedback/reports

**Commands:**
```bash
# Check error rate
grep "500" /var/log/supervisor/backend.*.log | wc -l

# Check slate endpoint calls
grep "/api/slate" /var/log/supervisor/backend.*.log | tail -20

# Check for specific errors
grep -i "error\|failed\|exception" /var/log/supervisor/backend.*.log | grep slate
```

---

## 📝 Implementation Notes

### Estimated Time

- **Phase 1 (Schema Verification):** 5 minutes
- **Phase 2 (Main Fix):** 10 minutes
- **Phase 3 (Related Endpoints):** 20 minutes
- **Phase 4 (Other Modules):** 15 minutes
- **Phase 5 (Restart):** 2 minutes
- **Testing:** 30 minutes
- **Total:** ~80 minutes (1.5 hours)

### Prerequisites

- Access to database (Supabase dashboard or SQL client)
- Backend access with sudo privileges
- Understanding of Supabase PostgREST query syntax
- Backup strategy in place

### Risk Assessment

**Risk Level:** LOW
- Query pattern is well-understood
- Fix is isolated to specific endpoints
- Easy to rollback if needed
- No database schema changes required

**Potential Issues:**
- Existing posts without user_profiles → Handle with null checks
- Performance with large datasets → Monitor query times
- Cached responses → May need cache clear

---

## 📞 Support

### If Issues Arise

1. **Check Logs:**
   ```bash
   tail -100 /var/log/supervisor/backend.err.log
   ```

2. **Check Database Connection:**
   ```bash
   # Verify Supabase credentials in .env
   cat /app/.env.local | grep SUPABASE
   ```

3. **Test Database Query Directly:**
   - Go to Supabase dashboard
   - Run SQL Editor
   - Test the JOIN query manually

4. **Contact:**
   - Database Admin: For schema issues
   - DevOps: For deployment issues
   - Backend Team Lead: For code review

---

## ✅ Final Checklist

Before marking this issue as resolved:

- [ ] Root cause documented
- [ ] Fix plan created and reviewed
- [ ] All affected files identified
- [ ] Backup files created
- [ ] Code changes implemented
- [ ] Services restarted successfully
- [ ] All tests pass
- [ ] No errors in logs
- [ ] Performance acceptable
- [ ] Rollback plan documented and tested
- [ ] Prevention strategy implemented
- [ ] Documentation updated
- [ ] Team notified of changes
- [ ] Monitoring in place for 24 hours

---

**End of Document**

*Last Updated: January 2025*  
*Author: E1 Analysis Agent*  
*Status: Ready for Implementation*
