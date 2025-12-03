# Test Plan for Gigs API Fix

## Prerequisites
- Ensure you have valid Supabase credentials in `.env.local`
- Ensure you have a user account with a complete profile
- Ensure you have an authentication token

## Test 1: Verify API Health
```bash
curl http://localhost:3000/api/health
```
**Expected**: `{"success":true,"message":"API is healthy","data":{"status":"ok","timestamp":"..."}}`

## Test 2: Create a New Gig (POST /api/gigs)
```bash
curl -X POST http://localhost:3000/api/gigs \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Cinematographer Gig",
    "description": "Looking for an experienced cinematographer for a 2-week shoot in Dubai",
    "qualifyingCriteria": "5+ years experience required",
    "amount": 5000,
    "currency": "AED",
    "crewCount": 2,
    "role": "Cinematographer",
    "type": "Contract",
    "department": "Camera",
    "company": "Test Productions",
    "isTbc": false,
    "requestQuote": false,
    "expiryDate": "2025-03-01T00:00:00Z",
    "status": "active",
    "dateWindows": [
      {
        "label": "Feb 2025",
        "range": "15-20"
      }
    ],
    "locations": ["Dubai", "Abu Dhabi"]
  }'
```

**Expected**: 
- Status: 201 Created
- Response includes gig with proper slug and all fields
- No 500 error

## Test 3: Fetch All Gigs (GET /api/gigs)
```bash
curl http://localhost:3000/api/gigs
```

**Expected**:
- Status: 200 OK
- Response includes array of gigs
- Each gig has `postedBy` object with `name` (not "Unknown")
- Each gig has `avatar` URL if profile has photo

**Verification Points**:
- `postedBy.name` should NOT be "Unknown"
- `postedBy.avatar` should be a valid URL or null
- No 500 errors

## Test 4: Fetch Gig by ID (GET /api/gigs/[id])
```bash
curl http://localhost:3000/api/gigs/YOUR_GIG_ID
```

**Expected**:
- Status: 200 OK
- Gig details include proper creator name
- All fields populated correctly

## Test 5: Fetch Gig by Slug (GET /api/gigs/slug/[slug])
```bash
curl http://localhost:3000/api/gigs/slug/test-cinematographer-gig
```

**Expected**:
- Status: 200 OK
- Creator information correctly displayed

## Test 6: Apply to Gig (POST /api/gigs/[id]/apply)
```bash
curl -X POST http://localhost:3000/api/gigs/YOUR_GIG_ID/apply \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "coverLetter": "I am very interested in this position",
    "portfolioLinks": ["https://example.com/portfolio"]
  }'
```

**Expected**:
- Status: 201 Created
- Application created successfully
- Notification created for gig creator with applicant name

## Test 7: View Applications (GET /api/gigs/[id]/applications)
```bash
curl http://localhost:3000/api/gigs/YOUR_GIG_ID/applications \
  -H "Authorization: Bearer CREATOR_AUTH_TOKEN"
```

**Expected**:
- Status: 200 OK
- Applications list shows applicant profiles with correct names
- Applicant profile includes `name`, `profile_photo_url`, `bio`, etc.
- No "Unknown" or missing profile data

## Frontend Testing

### Test 8: Create Gig via UI
1. Navigate to `/gigs/manage-gigs/add-new`
2. Fill in the Quick GIG form with:
   - Description: "Looking for a camera operator"
   - Select some dates
3. Click "Publish"

**Expected**:
- ✅ Success toast appears
- ✅ Gig is created in database
- ✅ No 500 error in console
- ✅ No error about user_profiles queries

### Test 9: View Gigs List
1. Navigate to `/gigs`
2. Observe the gigs list

**Expected**:
- ✅ All gigs display with creator names (not "Unknown")
- ✅ Creator avatars display if available
- ✅ No 500 errors in console
- ✅ No "Internal Server Error" messages

### Test 10: View Gig Details
1. Click on any gig from the list
2. View the gig details page

**Expected**:
- ✅ Creator name displays correctly
- ✅ All gig information is complete
- ✅ Apply button works (if logged in)

## Common Issues to Check

### Issue 1: Still seeing "Unknown" for creator names
- **Cause**: User profile doesn't have a `name` field populated
- **Solution**: Ensure the user has filled in their first_name and surname in profile

### Issue 2: Still getting 500 errors
- **Check**: Browser console for exact error
- **Check**: Supabase credentials are correct
- **Check**: Table structure matches expected schema

### Issue 3: React Key Warnings
- These are separate from the database query fix
- Can be addressed later if needed
- Don't affect functionality, just console cleanliness

## Success Criteria

All tests pass when:
1. ✅ No 500 errors when creating gigs
2. ✅ No 500 errors when fetching gigs
3. ✅ Creator names display correctly (not "Unknown")
4. ✅ Applications show complete applicant information
5. ✅ All database queries use `user_id` consistently

## Rollback Plan

If issues persist, check:
1. Database schema - ensure `user_profiles` table uses `user_id` as PK
2. Revert changes if schema is different than expected
3. Contact database admin to verify table structure
