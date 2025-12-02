# What's On Feature - "Unknown User" Issue Analysis

## Executive Summary
The What's On feature is fetching events successfully via API, but displays "Unknown User" for event creators due to a **field name mismatch** between the database schema and the API queries.

---

## Issue Details

### Problem Statement
- API calls to `/api/whatson` return successful responses (200 OK)
- Events are fetched correctly with all data
- However, the `creator` object shows `name: "Unknown"` instead of the actual user name
- This affects both the listing page and detail pages

### Root Cause

**Database Schema Mismatch:**

The API code is querying **incorrect field names** from the `user_profiles` table:

**What the API is currently querying:**
```typescript
// In /app/app/api/whatson/route.ts (line 101)
// In /app/app/api/whatson/[id]/route.ts (line 79)

.select('legal_first_name, legal_surname, alias_first_name, alias_surname, profile_photo_url')
```

**Actual field names in database (per architecture docs):**
```
- first_name          ✅ (NOT legal_first_name ❌)
- surname             ✅ (NOT legal_surname ❌)
- alias_first_name    ✅
- alias_surname       ✅
- profile_photo_url   ✅
```

**Reference:** `/app/documentation/backend-documentation-and-commands/UPDATED_BACKEND_ARCHITECTURE.md` Line 203-204

---

## Impact Analysis

### Affected Files
1. `/app/app/api/whatson/route.ts` - Line 101 (GET listing endpoint)
2. `/app/app/api/whatson/[id]/route.ts` - Line 79 (GET detail endpoint)
3. `/app/app/api/whatson/my/route.ts` - Does NOT fetch creator info (no impact)

### User Experience Impact
- ❌ Event cards show "Unknown" as host name
- ❌ Event detail pages show "Unknown" as organizer
- ❌ Host avatars default to placeholder image
- ✅ All other event data displays correctly (title, location, dates, etc.)
- ✅ API calls succeed (no 500 errors)

### Why the API Call Succeeds
- The query uses `.maybeSingle()` which returns `null` instead of throwing an error when fields don't exist
- The code has fallback logic: `creator?.name || 'Unknown'`
- Since querying non-existent fields returns `null`, the fallback kicks in

---

## Technical Analysis

### Code Flow

**Step 1: API Query (BROKEN)**
```typescript
const { data: creator } = await supabase
  .from('user_profiles')
  .select('legal_first_name, legal_surname, alias_first_name, alias_surname, profile_photo_url')
  .eq('user_id', event.created_by)
  .maybeSingle();
```

**Result:** 
```json
{
  "legal_first_name": null,    // ❌ Field doesn't exist
  "legal_surname": null,        // ❌ Field doesn't exist
  "alias_first_name": null,     // ✅ Field exists but may be empty
  "alias_surname": null,        // ✅ Field exists but may be empty
  "profile_photo_url": "..."    // ✅ Field exists
}
```

**Step 2: Name Construction (BROKEN)**
```typescript
const constructFullName = (creator: any) => {
  if (!creator) return 'Unknown';
  
  // Trying to access non-existent fields!
  const firstName = creator.alias_first_name || creator.legal_first_name || '';
  const surname = creator.alias_surname || creator.legal_surname || '';
  
  const fullName = `${firstName} ${surname}`.trim();
  return fullName || 'Unknown';  // Returns 'Unknown' because both are null/empty
};
```

**Step 3: Response (BROKEN)**
```json
{
  "creator": {
    "name": "Unknown",  // ❌ Incorrect
    "profile_photo_url": "..."
  }
}
```

---

## Solution

### Fix Required
Replace **ALL** occurrences of `legal_first_name` and `legal_surname` with `first_name` and `surname` in the What's On API files.

### Files to Modify

#### 1. `/app/app/api/whatson/route.ts`
**Line 101** - Change:
```typescript
// FROM:
.select('legal_first_name, legal_surname, alias_first_name, alias_surname, profile_photo_url')

// TO:
.select('first_name, surname, alias_first_name, alias_surname, profile_photo_url')
```

**Lines 123-125** - Change:
```typescript
// FROM:
const firstName = creator.alias_first_name || creator.legal_first_name || '';
const surname = creator.alias_surname || creator.legal_surname || '';

// TO:
const firstName = creator.alias_first_name || creator.first_name || '';
const surname = creator.alias_surname || creator.surname || '';
```

#### 2. `/app/app/api/whatson/[id]/route.ts`
**Line 79** - Change:
```typescript
// FROM:
.select('user_id, legal_first_name, legal_surname, alias_first_name, alias_surname, profile_photo_url')

// TO:
.select('user_id, first_name, surname, alias_first_name, alias_surname, profile_photo_url')
```

**Lines 97-98** - Change:
```typescript
// FROM:
const firstName = creator.alias_first_name || creator.legal_first_name || '';
const surname = creator.alias_surname || creator.legal_surname || '';

// TO:
const firstName = creator.alias_first_name || creator.first_name || '';
const surname = creator.alias_surname || creator.surname || '';
```

#### 3. `/app/app/api/whatson/my/route.ts`
**No changes needed** - This file doesn't fetch creator information

---

## Testing Recommendations

### Before Fix (Current Behavior)
```bash
# Test listing endpoint
curl http://localhost:3000/api/whatson

# Expected: creator.name = "Unknown"
```

### After Fix (Expected Behavior)
```bash
# Test listing endpoint
curl http://localhost:3000/api/whatson

# Expected: creator.name = "John Doe" (actual user name)
```

### Test Cases
1. ✅ Events with users who have `first_name` and `surname`
2. ✅ Events with users who have `alias_first_name` and `alias_surname`
3. ✅ Events with users who have both (alias should take priority)
4. ✅ Events with users who have neither (should fallback to "Unknown")
5. ✅ Events detail page (`/api/whatson/[id]`)
6. ✅ Events listing page (`/api/whatson`)

---

## Additional Findings

### Consistent Pattern Across Codebase
This issue may exist in **other API endpoints** that fetch user profile data. Recommended audit of:
- ❓ `/app/api/gigs/**` - Check if same field name issue exists
- ❓ `/app/api/collab/**` - Check if same field name issue exists
- ❓ `/app/api/slate/**` - Check if same field name issue exists
- ❓ `/app/api/explore/**` - Check if same field name issue exists

### Database Schema Clarification
According to the official architecture document:

**`user_profiles` table has:**
- `first_name` (PRIMARY name field)
- `surname` (PRIMARY surname field)
- `alias_first_name` (OPTIONAL alias)
- `alias_surname` (OPTIONAL alias)

**There are NO fields named:**
- ~~`legal_first_name`~~ ❌
- ~~`legal_surname`~~ ❌

---

## Priority & Severity

- **Severity:** Medium-High
- **Priority:** High
- **Effort:** Low (simple find-replace fix)
- **Risk:** Low (change is isolated to specific fields)

### Why High Priority?
1. Core functionality (event discovery) is broken for users
2. Affects user trust and platform credibility
3. Simple fix with low risk
4. High visibility issue (shown on every event card)

---

## Implementation Checklist

- [ ] Fix `/app/app/api/whatson/route.ts` (2 locations)
- [ ] Fix `/app/app/api/whatson/[id]/route.ts` (2 locations)
- [ ] Test event listing API (`GET /api/whatson`)
- [ ] Test event detail API (`GET /api/whatson/[id]`)
- [ ] Verify frontend displays correct creator names
- [ ] Audit other API endpoints for same issue
- [ ] Update any API documentation if needed

---

## Conclusion

The "Unknown User" issue in the What's On feature is caused by **incorrect database field names** being queried in the API. The fix is straightforward: replace `legal_first_name` with `first_name` and `legal_surname` with `surname` in 4 locations across 2 files.

**Estimated Time to Fix:** 5-10 minutes  
**Testing Time:** 10-15 minutes  
**Total Resolution Time:** ~20 minutes

---

**Document Version:** 1.0  
**Created:** January 2025  
**Author:** E1 Analysis Agent  
**Status:** Ready for Implementation
