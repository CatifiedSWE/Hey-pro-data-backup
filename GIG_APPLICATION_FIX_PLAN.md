# Gig Application Fix Plan

## Issues Identified

### Issue 1: Hardcoded Mock Data in Frontend ❌
**Location:** `/app/app/(app)/(gigs)/components/applygigs.tsx` (lines 99-100)

**Problem:**
```typescript
const availableCredits = useMemo(() => profileData.credits ?? [], [profileData.credits])
const availableRates = useMemo(() => profileData.rate ?? [], [profileData.rate])
```
- Uses mock data from `/data/profile.ts`
- Should fetch from user's actual Supabase profile

### Issue 2: Application Not Submitted to Backend ❌
**Location:** `/app/app/(app)/(gigs)/components/applygigs.tsx` (lines 196-230)

**Problem:**
- `handleSubmit()` only logs to console
- Shows success dialog without API call
- No data is saved to Supabase

### Issue 3: Backend API Missing Fields ❌
**Location:** `/app/app/api/gigs/[id]/apply/route.ts`

**Problem:**
- API only accepts: `coverLetter`, `portfolioLinks`, `resumeUrl`
- Frontend collects but doesn't send:
  - Selected credits (work history)
  - Selected rate
  - Availability dates with status (A, P1, P2, N/A)

---

## Solution Implementation

### Step 1: Update Database Schema ✅
Add columns to `applications` table:
- `selected_credits` JSONB - Array of credit objects
- `selected_rate` TEXT - Rate value selected
- `availability_data` JSONB - Array of {date, status} pairs

### Step 2: Update Backend API ✅
**File:** `/app/app/api/gigs/[id]/apply/route.ts`
- Accept new fields in request body
- Validate and store them in applications table

### Step 3: Update Frontend Component ✅
**File:** `/app/app/(app)/(gigs)/components/applygigs.tsx`
- Fetch user's actual credits from `/api/profile/credits`
- Fetch user's actual rates from profile/skills
- Connect handleSubmit to call API with all data
- Handle loading and error states

---

## Implementation Steps

1. ✅ Create database migration SQL
2. ✅ Update backend apply API
3. ✅ Update frontend to fetch real data
4. ✅ Connect frontend submit to API
5. ✅ Test end-to-end flow

---

## Testing Checklist

- [ ] User can see their real credits in dropdown
- [ ] User can see their real rates in dropdown
- [ ] User can select credits
- [ ] User can select rate
- [ ] User can mark availability dates
- [ ] Submit button calls API
- [ ] Application is stored in Supabase
- [ ] All data (credits, rate, availability) is saved
- [ ] Success notification shows
- [ ] Application appears in manage-gigs page

---

## Files Modified

1. `/app/documentation/backend-documentation-and-commands/gigs/06_ALTER_APPLICATIONS_TABLE.sql` - NEW
2. `/app/app/api/gigs/[id]/apply/route.ts` - UPDATED
3. `/app/app/(app)/(gigs)/components/applygigs.tsx` - UPDATED

