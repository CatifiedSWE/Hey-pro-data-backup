# Gigs API Testing Guide

## Overview

This document provides comprehensive testing procedures for the Gigs API endpoints. The gigs feature is a core part of the HeyProData platform, allowing users to create, browse, and apply to job opportunities in the film and media industry.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Test Scripts](#test-scripts)
3. [Manual Testing with curl](#manual-testing-with-curl)
4. [Automated Testing](#automated-testing)
5. [API Endpoints Reference](#api-endpoints-reference)
6. [Common Test Scenarios](#common-test-scenarios)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Setup

1. **Next.js Development Server Running**
   ```bash
   cd /app
   npm run dev
   ```
   Server should be running on `http://localhost:3000`

2. **Supabase Configuration**
   - Ensure environment variables are set:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

3. **Database Schema**
   - All gigs-related tables must exist:
     - `gigs`
     - `gig_dates`
     - `gig_locations`
     - `gig_references`
     - `applications`
     - `crew_availability`
     - `user_profiles`
     - `user_skills`
     - `user_experience`
     - `user_credits`
     - `notifications`

4. **Test User Account**
   - At least one user account with:
     - Valid authentication token
     - Complete profile (first_name, surname, country, city)
     - Optional: Skills, experience, and credits for full testing

### Getting an Authentication Token

To test authenticated endpoints, you'll need a valid JWT token:

**Option 1: From Browser DevTools**
1. Log in to the application
2. Open browser DevTools (F12)
3. Go to Application/Storage → Cookies or Local Storage
4. Find the auth token (usually stored in cookies or localStorage)

**Option 2: Using Supabase Auth API**
```bash
curl -X POST https://YOUR_SUPABASE_URL/auth/v1/token?grant_type=password \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

---

## Test Scripts

Two test scripts are provided in the `/app` directory:

### 1. Node.js Test Script (`test-gigs-api.js`)

**Comprehensive automated testing with detailed output**

```bash
cd /app
node test-gigs-api.js
```

**Features:**
- Color-coded output (PASS/FAIL/SKIP)
- Detailed test results for each endpoint
- Automatic test data management
- Success rate calculation
- Failed test summary

**Customization:**
- Edit `BASE_URL` in the script if not using localhost:3000
- Add `testData.authToken` to enable authenticated tests

### 2. Bash/curl Test Script (`test-gigs-curl.sh`)

**Quick testing using curl commands**

```bash
cd /app
./test-gigs-curl.sh [BASE_URL]
```

**Examples:**
```bash
# Test on localhost
./test-gigs-curl.sh

# Test on custom URL
./test-gigs-curl.sh http://localhost:8080

# Test with authentication
AUTH_TOKEN="your-jwt-token" ./test-gigs-curl.sh
```

**Features:**
- Simple curl-based testing
- No additional dependencies
- Easy to read and modify
- Good for quick smoke tests

---

## Manual Testing with curl

### Test 1: Health Check

```bash
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-01-15T10:00:00.000Z"
  },
  "message": "API is healthy"
}
```

### Test 2: List Gigs (Public)

```bash
curl "http://localhost:3000/api/gigs?page=1&limit=5"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "gigs": [
      {
        "id": "uuid",
        "slug": "video-editor-position",
        "title": "Video Editor Position",
        "description": "...",
        "budgetLabel": "AED 5000",
        "postedOn": "2025-01-15T10:00:00Z",
        "postedBy": {
          "name": "John Doe",
          "avatar": "https://..."
        },
        "dateWindows": [...],
        "location": "Dubai, Abu Dhabi",
        "applicationCount": 5
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalGigs": 95,
      "limit": 5
    }
  }
}
```

### Test 3: Get Gig by Slug (Public)

```bash
curl "http://localhost:3000/api/gigs/slug/video-editor-position"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "slug": "video-editor-position",
    "title": "Video Editor Position",
    "description": "...",
    "qualifyingCriteria": "...",
    "amount": 5000,
    "currency": "AED",
    "budgetLabel": "AED 5000",
    "crewCount": 2,
    "role": "editor",
    "type": "contract",
    "department": "Post-production",
    "company": "Test Company",
    "dateWindows": [
      { "label": "Jan 2025", "range": "15-20" }
    ],
    "calendarMonths": [
      { "month": 0, "year": 2025, "highlightedDays": [15,16,17,18,19,20] }
    ],
    "locations": ["Dubai", "Abu Dhabi"],
    "location": "Dubai, Abu Dhabi",
    "references": [
      { "id": "ref-id", "label": "Document.pdf", "url": "...", "type": "file" }
    ],
    "postedBy": {
      "name": "John Doe",
      "avatar": "https://..."
    },
    "applicationCount": 5
  }
}
```

### Test 4: Create Gig (Authenticated)

```bash
curl -X POST "http://localhost:3000/api/gigs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Camera Operator Needed",
    "description": "Looking for experienced camera operator",
    "qualifyingCriteria": "5+ years experience",
    "amount": 7500,
    "currency": "AED",
    "crewCount": 1,
    "role": "camera",
    "type": "contract",
    "department": "Camera",
    "company": "Production House",
    "isTbc": false,
    "requestQuote": false,
    "expiryDate": "2025-02-15T00:00:00Z",
    "dateWindows": [
      { "label": "Jan 2025", "range": "20-25" }
    ],
    "locations": ["Dubai"],
    "references": [],
    "status": "active"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "new-uuid",
    "slug": "camera-operator-needed",
    "title": "Camera Operator Needed",
    ...
  },
  "message": "Gig created successfully"
}
```

### Test 5: Update Gig (Authenticated, Owner Only)

```bash
curl -X PATCH "http://localhost:3000/api/gigs/GIG_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Updated Camera Operator Position",
    "crewCount": 2,
    "amount": 8000
  }'
```

### Test 6: Apply to Gig (Authenticated)

```bash
curl -X POST "http://localhost:3000/api/gigs/GIG_ID/apply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "coverLetter": "I am very interested in this position...",
    "portfolioLinks": ["https://myportfolio.com"],
    "resumeUrl": "https://storage.com/resume.pdf"
  }'
```

### Test 7: Get Applications (Authenticated, Creator Only)

```bash
curl "http://localhost:3000/api/gigs/GIG_ID/applications" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 8: Get Availability (Authenticated, Creator Only)

```bash
curl "http://localhost:3000/api/gigs/GIG_ID/availability" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 9: Delete Gig (Authenticated, Owner Only)

```bash
curl -X DELETE "http://localhost:3000/api/gigs/GIG_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Automated Testing

### Running the Full Test Suite

```bash
# Basic run (public endpoints only)
node test-gigs-api.js

# With authentication (full test coverage)
# Edit test-gigs-api.js and set:
# testData.authToken = "your-jwt-token-here"
node test-gigs-api.js
```

### Expected Output

```
╔══════════════════════════════════════════════════════════╗
║               GIGS API TEST SUITE                        ║
╚══════════════════════════════════════════════════════════╝

Base URL: http://localhost:3000
Starting tests at: 2025-01-15T10:00:00.000Z

=============================================================
Health Check
=============================================================

[PASS] API Health Check: API is running

=============================================================
Test: GET /api/gigs - List Gigs
=============================================================

[PASS] List Gigs - Basic: Retrieved 5 gigs
[PASS] List Gigs - Pagination: Page 1/10
[PASS] List Gigs - Data Structure: All required fields present

... (more tests)

=============================================================
Test Summary
=============================================================

Passed:  25
Failed:  0
Skipped: 5
Total:   30

Success Rate: 83.3%

Testing completed at: 2025-01-15T10:05:00.000Z
```

---

## API Endpoints Reference

### Public Endpoints (No Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gigs` | List all active gigs with filters |
| GET | `/api/gigs/[id]` | Get gig details by ID |
| GET | `/api/gigs/slug/[slug]` | Get gig details by slug |

**Query Parameters for GET /api/gigs:**
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)
- `search` - Search in title/description
- `role` - Filter by role
- `type` - Filter by type
- `location` - Filter by location
- `createdBy` - Filter by creator (requires auth if `createdBy=me`)

### Authenticated Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/gigs` | Create new gig | Complete profile required |
| PATCH | `/api/gigs/[id]` | Update gig | Owner only |
| DELETE | `/api/gigs/[id]` | Delete gig | Owner only |
| POST | `/api/gigs/[id]/apply` | Apply to gig | Complete profile required |
| GET | `/api/gigs/[id]/applications` | Get applications | Creator only |
| PATCH | `/api/gigs/[id]/applications` | Update application status | Creator only |
| GET | `/api/gigs/[id]/availability` | Get applicant availability | Creator only |

---

## Common Test Scenarios

### Scenario 1: Complete Gig Lifecycle

1. Create a gig (authenticated)
2. List gigs and verify new gig appears
3. Get gig by slug
4. Apply to gig (from different user)
5. View applications (as creator)
6. Check availability (as creator)
7. Update application status
8. Update gig details
9. Delete gig

### Scenario 2: Search and Filter Testing

```bash
# Search by keyword
curl "http://localhost:3000/api/gigs?search=editor"

# Filter by role
curl "http://localhost:3000/api/gigs?role=editor"

# Filter by type
curl "http://localhost:3000/api/gigs?type=contract"

# Combined filters
curl "http://localhost:3000/api/gigs?role=editor&type=contract&search=video"

# Pagination
curl "http://localhost:3000/api/gigs?page=2&limit=10"
```

### Scenario 3: Error Handling Testing

```bash
# 401 - No authentication
curl -X POST "http://localhost:3000/api/gigs" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test"}'

# 403 - Incomplete profile
curl -X POST "http://localhost:3000/api/gigs" \
  -H "Authorization: Bearer INCOMPLETE_PROFILE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "description": "Test"}'

# 404 - Gig not found
curl "http://localhost:3000/api/gigs/invalid-slug"

# 400 - Apply to own gig
curl -X POST "http://localhost:3000/api/gigs/YOUR_GIG_ID/apply" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"coverLetter": "Test"}'

# 400 - Duplicate application
curl -X POST "http://localhost:3000/api/gigs/GIG_ID/apply" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"coverLetter": "Test"}'
# Run twice to test duplicate detection
```

### Scenario 4: Data Validation Testing

```bash
# Missing required fields
curl -X POST "http://localhost:3000/api/gigs" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Invalid date format
curl -X POST "http://localhost:3000/api/gigs" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "description": "Test",
    "expiryDate": "invalid-date"
  }'

# Invalid status
curl -X PATCH "http://localhost:3000/api/gigs/GIG_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "invalid-status"}'
```

---

## Troubleshooting

### Issue: Connection Refused

**Symptom:** `curl: (7) Failed to connect to localhost port 3000: Connection refused`

**Solutions:**
1. Ensure Next.js dev server is running: `npm run dev`
2. Check if port 3000 is being used: `lsof -i :3000` or `netstat -an | grep 3000`
3. Try accessing via browser: `http://localhost:3000/api/health`

### Issue: 401 Unauthorized

**Symptom:** `{ "success": false, "error": "Authentication required" }`

**Solutions:**
1. Verify you're including the Authorization header
2. Check token format: `Bearer YOUR_TOKEN` (note the space)
3. Verify token is valid and not expired
4. Check token in Supabase dashboard

### Issue: 403 Forbidden (Profile Required)

**Symptom:** `{ "success": false, "error": "Please complete your profile before creating gigs" }`

**Solutions:**
1. Complete user profile with required fields:
   - first_name
   - surname
   - country
   - city
2. Verify profile completion via: `curl http://localhost:3000/api/profile -H "Authorization: Bearer YOUR_TOKEN"`

### Issue: 404 Not Found

**Symptom:** `{ "success": false, "error": "Gig not found" }`

**Solutions:**
1. Verify the gig ID or slug is correct
2. Check if gig was deleted
3. Ensure gig status is 'active' (drafts may not be accessible)

### Issue: Slug Already Exists

**Symptom:** Duplicate slug error when creating gig

**Solutions:**
- The `generateUniqueSlug` helper should automatically append numbers
- If error persists, check helper function implementation
- Verify database unique constraint on `gigs.slug` column

### Issue: Date Windows Not Appearing

**Symptom:** `calendarMonths` is empty or missing

**Solutions:**
1. Verify `gig_dates` table has records for the gig
2. Check date format: month should be "Jan 2025" format
3. Verify `transformCalendarMonths` helper function
4. Check console logs for transformation errors

### Issue: Applications Not Showing Applicant Data

**Symptom:** Applicant name/profile is null or "Unknown"

**Solutions:**
1. Verify `user_profiles` table has data for applicant
2. Check join query in `/api/gigs/[id]/applications`
3. Verify `user_id` matches between tables
4. Check RLS policies on `user_profiles` table

### Issue: Availability Data Not Loading

**Symptom:** Empty availability schedule

**Solutions:**
1. Verify `crew_availability` table exists
2. Check if applicants have availability data
3. Verify date parsing in availability endpoint
4. Check `status` column format: should be 'available', 'hold', or 'na'

---

## Database Verification Queries

If issues persist, use these SQL queries in Supabase SQL Editor to verify data:

```sql
-- Check gigs table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'gigs'
ORDER BY ordinal_position;

-- Check for test gigs
SELECT id, slug, title, status, created_at
FROM gigs
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 5;

-- Check gig with relations
SELECT 
  g.id,
  g.slug,
  g.title,
  json_agg(DISTINCT gd.*) AS dates,
  json_agg(DISTINCT gl.*) AS locations
FROM gigs g
LEFT JOIN gig_dates gd ON g.id = gd.gig_id
LEFT JOIN gig_locations gl ON g.id = gl.gig_id
WHERE g.slug = 'your-gig-slug'
GROUP BY g.id;

-- Check applications for a gig
SELECT 
  a.id,
  a.status,
  up.name AS applicant_name,
  a.created_at
FROM applications a
JOIN user_profiles up ON a.applicant_user_id = up.id
WHERE a.gig_id = 'your-gig-id';

-- Check user profile completeness
SELECT 
  user_id,
  first_name,
  surname,
  country,
  city,
  CASE 
    WHEN first_name IS NOT NULL 
      AND surname IS NOT NULL 
      AND country IS NOT NULL 
      AND city IS NOT NULL 
    THEN 'Complete'
    ELSE 'Incomplete'
  END AS profile_status
FROM user_profiles
WHERE user_id = 'your-user-id';
```

---

## Performance Testing

### Load Testing with Apache Bench

```bash
# Test GET /api/gigs endpoint
ab -n 1000 -c 10 http://localhost:3000/api/gigs

# Test with search parameter
ab -n 500 -c 5 "http://localhost:3000/api/gigs?search=editor"
```

### Expected Performance Benchmarks

- **GET /api/gigs**: < 200ms average response time
- **GET /api/gigs/slug/[slug]**: < 150ms average response time
- **POST /api/gigs**: < 300ms average response time
- **GET /api/gigs/[id]/applications**: < 250ms average response time

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Test Gigs API

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Start server
        run: npm run dev &
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      - name: Wait for server
        run: npx wait-on http://localhost:3000/api/health
      - name: Run tests
        run: node test-gigs-api.js
```

---

## Additional Resources

- **API Documentation**: `/app/documentation/API-Docs/API_DOC.md`
- **Gigs Backend Guide**: `/app/documentation/backend-documentation-and-commands/gigs/`
- **Supabase Docs**: https://supabase.com/docs
- **Next.js API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

---

## Support

For issues or questions:
1. Check this testing guide
2. Review API documentation
3. Check Supabase logs
4. Review server logs: `npm run dev` output
5. Inspect browser DevTools Network tab

---

**Last Updated:** January 2025  
**Version:** 1.0
