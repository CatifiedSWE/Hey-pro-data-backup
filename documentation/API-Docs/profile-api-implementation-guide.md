# Profile API Implementation Guide

**Project:** HeyProData - Professional Networking Platform  
**Date:** January 2025  
**Version:** 2.7.1  
**Purpose:** Actionable implementation guide for profile API endpoints matching latest database changes

---

## 🎯 Executive Summary

This document provides a complete, AI-friendly implementation guide for updating profile API endpoints to support the enhanced database schema (v2.7.1).

### What Changed in Database v2.7.1

**Enhanced Tables:**
1. **`user_credits`** - Added 11 new columns for rich professional portfolios
2. **`user_profiles`** - Added 3 new columns for day rates and work identities

### What Needs to be Updated in APIs

**Affected Endpoints:**
1. `/api/profile/credits` - CRUD operations for credits
2. `/api/profile` - Profile PATCH endpoint

---

## 📊 Database Schema Changes Reference

### A. user_credits Table (11 New Columns)

| Column Name | Type | Nullable | Default | Constraint |
|-------------|------|----------|---------|------------|
| `production_type` | TEXT | YES | NULL | Options: Commercial, Film, TV Series, Music Video, Documentary |
| `role` | TEXT | YES | NULL | Examples: Director, Cinematographer, Editor, Producer |
| `project_title` | TEXT | YES | NULL | Specific project name |
| `brand_client` | TEXT | YES | NULL | Brand/client name (Nike, Apple, etc.) |
| `local_company` | TEXT | YES | NULL | Local production company |
| `international_company` | TEXT | YES | NULL | International studio (Warner Bros, etc.) |
| `country` | TEXT | YES | NULL | Production country |
| `release_year` | TEXT | YES | NULL | Format: "YYYY" or "Coming YYYY" |
| `is_unreleased` | BOOLEAN | YES | false | Unreleased project flag |
| `headline_stats` | TEXT | YES | NULL | Key statistics (500M+ views, etc.) |
| `awards` | JSONB | YES | '[]' | Array: `[{"title": "Best Film", "detail": "Cannes 2024"}]` |

### B. user_profiles Table (3 New Columns)

| Column Name | Type | Nullable | Default | Constraint |
|-------------|------|----------|---------|------------|
| `day_rate` | INTEGER | YES | NULL | Rate in cents (150000 = $1,500), CHECK: > 0 |
| `day_rate_currency` | TEXT | YES | 'USD' | Valid currency codes |
| `work_identities` | JSONB | YES | Default structure | See structure below |

**work_identities Default Structure:**
```json
{
  "freelance": false,
  "employee": {
    "enabled": false,
    "company": "",
    "designation": ""
  },
  "businessOwner": {
    "enabled": false,
    "designation": "",
    "businessName": "",
    "businessType": ""
  }
}
```

---

## 🔧 API Endpoint Updates

### 1. GET /api/profile/credits

**File:** `/app/api/profile/credits/route.ts`

**Current Implementation:**
```typescript
// GET handler
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const user = await validateAuthToken(authHeader);
  
  if (!user) {
    return NextResponse.json(errorResponse('Authentication required'), { status: 401 });
  }

  const { data, error } = await supabase
    .from('user_credits')
    .select('id, credit_title, description, start_date, end_date, image_url, sort_order, created_at, updated_at')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json(errorResponse('Failed to fetch credits'), { status: 500 });
  }

  return NextResponse.json(successResponse('Credits retrieved', { credits: data }));
}
```

**UPDATED Implementation:**
```typescript
// GET handler - ENHANCED VERSION
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const user = await validateAuthToken(authHeader);
  
  if (!user) {
    return NextResponse.json(errorResponse('Authentication required'), { status: 401 });
  }

  const { data, error } = await supabase
    .from('user_credits')
    .select(`
      id,
      credit_title,
      description,
      start_date,
      end_date,
      image_url,
      sort_order,
      production_type,
      role,
      project_title,
      brand_client,
      local_company,
      international_company,
      country,
      release_year,
      is_unreleased,
      headline_stats,
      awards,
      created_at,
      updated_at
    `)
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching credits:', error);
    return NextResponse.json(errorResponse('Failed to fetch credits'), { status: 500 });
  }

  return NextResponse.json(successResponse('Credits retrieved', { credits: data }));
}
```

**Changes:**
- ✅ Added 11 new columns to SELECT query
- ✅ No validation changes needed (GET endpoint)
- ✅ Backward compatible (old clients ignore new fields)

---

### 2. POST /api/profile/credits

**File:** `/app/api/profile/credits/route.ts`

**Current Implementation:**
```typescript
// POST handler
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const user = await validateAuthToken(authHeader);
  
  if (!user) {
    return NextResponse.json(errorResponse('Authentication required'), { status: 401 });
  }

  const body = await request.json();
  const { credit_title, description, start_date, end_date, image_url, sort_order } = body;

  // Validation
  if (!credit_title || !start_date) {
    return NextResponse.json(errorResponse('Credit title and start date are required'), { status: 400 });
  }

  const { data, error } = await supabase
    .from('user_credits')
    .insert({
      user_id: user.id,
      credit_title,
      description,
      start_date,
      end_date: end_date || null,
      image_url: image_url || null,
      sort_order: sort_order || 0
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(errorResponse('Failed to create credit'), { status: 500 });
  }

  return NextResponse.json(successResponse('Credit created', { credit: data }), { status: 201 });
}
```

**UPDATED Implementation:**
```typescript
// POST handler - ENHANCED VERSION
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const user = await validateAuthToken(authHeader);
  
  if (!user) {
    return NextResponse.json(errorResponse('Authentication required'), { status: 401 });
  }

  const body = await request.json();
  
  // Extract all fields (existing + new)
  const {
    credit_title,
    description,
    start_date,
    end_date,
    image_url,
    sort_order,
    // NEW FIELDS:
    production_type,
    role,
    project_title,
    brand_client,
    local_company,
    international_company,
    country,
    release_year,
    is_unreleased,
    headline_stats,
    awards
  } = body;

  // Validation - only required fields
  if (!credit_title || !start_date) {
    return NextResponse.json(
      errorResponse('Credit title and start date are required'), 
      { status: 400 }
    );
  }

  // Validate release_year format if provided
  if (release_year) {
    const yearPattern = /^\d{4}$|^Coming \d{4}$/;
    if (!yearPattern.test(release_year)) {
      return NextResponse.json(
        errorResponse('Invalid release_year format. Use "YYYY" or "Coming YYYY"'), 
        { status: 400 }
      );
    }
  }

  // Validate awards structure if provided
  if (awards) {
    if (!Array.isArray(awards)) {
      return NextResponse.json(
        errorResponse('Awards must be an array'), 
        { status: 400 }
      );
    }
    
    for (const award of awards) {
      if (!award.title || typeof award.title !== 'string') {
        return NextResponse.json(
          errorResponse('Each award must have a title'), 
          { status: 400 }
        );
      }
    }
  }

  // Insert with all fields
  const { data, error } = await supabase
    .from('user_credits')
    .insert({
      user_id: user.id,
      credit_title,
      description: description || null,
      start_date,
      end_date: end_date || null,
      image_url: image_url || null,
      sort_order: sort_order || 0,
      // NEW FIELDS:
      production_type: production_type || null,
      role: role || null,
      project_title: project_title || null,
      brand_client: brand_client || null,
      local_company: local_company || null,
      international_company: international_company || null,
      country: country || null,
      release_year: release_year || null,
      is_unreleased: is_unreleased || false,
      headline_stats: headline_stats || null,
      awards: awards || []
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating credit:', error);
    return NextResponse.json(
      errorResponse('Failed to create credit'), 
      { status: 500 }
    );
  }

  return NextResponse.json(
    successResponse('Credit created', { credit: data }), 
    { status: 201 }
  );
}
```

**Changes:**
- ✅ Added 11 new fields to request body extraction
- ✅ Added validation for release_year format
- ✅ Added validation for awards array structure
- ✅ Added all new fields to INSERT statement
- ✅ All new fields are optional (nullable)
- ✅ Backward compatible (old clients work without new fields)

---

### 3. PATCH /api/profile/credits (with ID)

**File:** `/app/api/profile/credits/route.ts` or `/app/api/profile/credits/[id]/route.ts`

**Note:** The implementation depends on your routing structure. This shows the PATCH logic.

**UPDATED Implementation:**
```typescript
// PATCH handler - ENHANCED VERSION
export async function PATCH(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const user = await validateAuthToken(authHeader);
  
  if (!user) {
    return NextResponse.json(errorResponse('Authentication required'), { status: 401 });
  }

  // Get credit ID from URL (adjust based on your routing)
  const url = new URL(request.url);
  const creditId = url.searchParams.get('id');

  if (!creditId) {
    return NextResponse.json(errorResponse('Credit ID required'), { status: 400 });
  }

  const body = await request.json();
  
  // Extract all updatable fields
  const {
    credit_title,
    description,
    start_date,
    end_date,
    image_url,
    sort_order,
    // NEW FIELDS:
    production_type,
    role,
    project_title,
    brand_client,
    local_company,
    international_company,
    country,
    release_year,
    is_unreleased,
    headline_stats,
    awards
  } = body;

  // Build update object with only provided fields
  const updates: any = {};
  
  if (credit_title !== undefined) updates.credit_title = credit_title;
  if (description !== undefined) updates.description = description;
  if (start_date !== undefined) updates.start_date = start_date;
  if (end_date !== undefined) updates.end_date = end_date;
  if (image_url !== undefined) updates.image_url = image_url;
  if (sort_order !== undefined) updates.sort_order = sort_order;
  
  // NEW FIELDS:
  if (production_type !== undefined) updates.production_type = production_type;
  if (role !== undefined) updates.role = role;
  if (project_title !== undefined) updates.project_title = project_title;
  if (brand_client !== undefined) updates.brand_client = brand_client;
  if (local_company !== undefined) updates.local_company = local_company;
  if (international_company !== undefined) updates.international_company = international_company;
  if (country !== undefined) updates.country = country;
  if (release_year !== undefined) {
    // Validate release_year format
    const yearPattern = /^\d{4}$|^Coming \d{4}$/;
    if (release_year && !yearPattern.test(release_year)) {
      return NextResponse.json(
        errorResponse('Invalid release_year format. Use "YYYY" or "Coming YYYY"'), 
        { status: 400 }
      );
    }
    updates.release_year = release_year;
  }
  if (is_unreleased !== undefined) updates.is_unreleased = is_unreleased;
  if (headline_stats !== undefined) updates.headline_stats = headline_stats;
  if (awards !== undefined) {
    // Validate awards structure
    if (awards && !Array.isArray(awards)) {
      return NextResponse.json(
        errorResponse('Awards must be an array'), 
        { status: 400 }
      );
    }
    if (awards) {
      for (const award of awards) {
        if (!award.title || typeof award.title !== 'string') {
          return NextResponse.json(
            errorResponse('Each award must have a title'), 
            { status: 400 }
          );
        }
      }
    }
    updates.awards = awards;
  }

  // Verify ownership and update
  const { data, error } = await supabase
    .from('user_credits')
    .update(updates)
    .eq('id', creditId)
    .eq('user_id', user.id) // Only update own credits
    .select()
    .single();

  if (error) {
    console.error('Error updating credit:', error);
    return NextResponse.json(
      errorResponse('Failed to update credit'), 
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      errorResponse('Credit not found or access denied'), 
      { status: 404 }
    );
  }

  return NextResponse.json(
    successResponse('Credit updated', { credit: data })
  );
}
```

**Changes:**
- ✅ Added 11 new fields to update object
- ✅ Validates release_year format
- ✅ Validates awards array structure
- ✅ Partial updates supported (only update provided fields)
- ✅ Backward compatible

---

### 4. DELETE /api/profile/credits (with ID)

**File:** `/app/api/profile/credits/route.ts` or `/app/api/profile/credits/[id]/route.ts`

**No changes needed** - DELETE endpoint works with ID only, doesn't interact with new fields.

---

### 5. PATCH /api/profile

**File:** `/app/api/profile/route.ts`

**Current Implementation (Partial):**
```typescript
export async function PATCH(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const user = await validateAuthToken(authHeader);
  
  if (!user) {
    return NextResponse.json(errorResponse('Authentication required'), { status: 401 });
  }

  const body = await request.json();
  
  // Extract existing fields
  const {
    first_name,
    surname,
    alias_first_name,
    alias_surname,
    phone,
    bio,
    country,
    city,
    profile_photo_url,
    banner_url,
    email,
    country_code,
    availability
    // ... other existing fields
  } = body;

  const updates: any = {};
  
  if (first_name !== undefined) updates.first_name = first_name;
  if (surname !== undefined) updates.surname = surname;
  // ... other field assignments
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single();

  // ... return response
}
```

**UPDATED Implementation:**
```typescript
export async function PATCH(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const user = await validateAuthToken(authHeader);
  
  if (!user) {
    return NextResponse.json(errorResponse('Authentication required'), { status: 401 });
  }

  const body = await request.json();
  
  // Extract all fields (existing + new)
  const {
    first_name,
    surname,
    alias_first_name,
    alias_surname,
    phone,
    bio,
    country,
    city,
    profile_photo_url,
    banner_url,
    email,
    country_code,
    availability,
    // NEW FIELDS:
    day_rate,
    day_rate_currency,
    work_identities
    // ... include any other existing fields
  } = body;

  const updates: any = {};
  
  // Existing field assignments
  if (first_name !== undefined) updates.first_name = first_name;
  if (surname !== undefined) updates.surname = surname;
  if (alias_first_name !== undefined) updates.alias_first_name = alias_first_name;
  if (alias_surname !== undefined) updates.alias_surname = alias_surname;
  if (phone !== undefined) updates.phone = phone;
  if (bio !== undefined) updates.bio = bio;
  if (country !== undefined) updates.country = country;
  if (city !== undefined) updates.city = city;
  if (profile_photo_url !== undefined) updates.profile_photo_url = profile_photo_url;
  if (banner_url !== undefined) updates.banner_url = banner_url;
  if (email !== undefined) updates.email = email;
  if (country_code !== undefined) updates.country_code = country_code;
  if (availability !== undefined) updates.availability = availability;
  
  // NEW FIELDS with validation:
  
  // day_rate validation
  if (day_rate !== undefined) {
    if (day_rate !== null && (typeof day_rate !== 'number' || day_rate <= 0)) {
      return NextResponse.json(
        errorResponse('day_rate must be a positive number or null'), 
        { status: 400 }
      );
    }
    updates.day_rate = day_rate;
  }
  
  // day_rate_currency validation
  if (day_rate_currency !== undefined) {
    const validCurrencies = ['USD', 'AED', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY', 'CNY', 'SGD'];
    if (day_rate_currency !== null && !validCurrencies.includes(day_rate_currency)) {
      return NextResponse.json(
        errorResponse(`Invalid currency. Allowed: ${validCurrencies.join(', ')}`), 
        { status: 400 }
      );
    }
    updates.day_rate_currency = day_rate_currency;
  }
  
  // work_identities validation
  if (work_identities !== undefined) {
    if (work_identities !== null) {
      // Validate structure
      if (typeof work_identities !== 'object') {
        return NextResponse.json(
          errorResponse('work_identities must be an object'), 
          { status: 400 }
        );
      }
      
      // Validate required keys exist
      const requiredKeys = ['freelance', 'employee', 'businessOwner'];
      for (const key of requiredKeys) {
        if (!(key in work_identities)) {
          return NextResponse.json(
            errorResponse(`work_identities missing required key: ${key}`), 
            { status: 400 }
          );
        }
      }
      
      // Validate freelance is boolean
      if (typeof work_identities.freelance !== 'boolean') {
        return NextResponse.json(
          errorResponse('work_identities.freelance must be boolean'), 
          { status: 400 }
        );
      }
      
      // Validate employee structure
      if (typeof work_identities.employee !== 'object' || 
          !('enabled' in work_identities.employee) ||
          !('company' in work_identities.employee) ||
          !('designation' in work_identities.employee)) {
        return NextResponse.json(
          errorResponse('work_identities.employee must have enabled, company, designation'), 
          { status: 400 }
        );
      }
      
      // Validate businessOwner structure
      if (typeof work_identities.businessOwner !== 'object' || 
          !('enabled' in work_identities.businessOwner) ||
          !('designation' in work_identities.businessOwner) ||
          !('businessName' in work_identities.businessOwner) ||
          !('businessType' in work_identities.businessOwner)) {
        return NextResponse.json(
          errorResponse('work_identities.businessOwner must have enabled, designation, businessName, businessType'), 
          { status: 400 }
        );
      }
    }
    
    updates.work_identities = work_identities;
  }

  // Perform update
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      errorResponse('Failed to update profile'), 
      { status: 500 }
    );
  }

  return NextResponse.json(
    successResponse('Profile updated', { profile: data })
  );
}
```

**Changes:**
- ✅ Added day_rate with positive number validation
- ✅ Added day_rate_currency with currency code validation
- ✅ Added work_identities with comprehensive structure validation
- ✅ All new fields are optional
- ✅ Backward compatible

---

### 6. GET /api/profile

**File:** `/app/api/profile/route.ts`

**UPDATED Implementation:**
```typescript
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const user = await validateAuthToken(authHeader);
  
  if (!user) {
    return NextResponse.json(errorResponse('Authentication required'), { status: 401 });
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      user_id,
      first_name,
      surname,
      alias_first_name,
      alias_surname,
      profile_photo_url,
      banner_url,
      bio,
      country,
      city,
      email,
      phone,
      country_code,
      availability,
      profile_completion_percentage,
      is_profile_complete,
      day_rate,
      day_rate_currency,
      work_identities,
      created_at,
      updated_at
    `)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      errorResponse('Failed to fetch profile'), 
      { status: 500 }
    );
  }

  return NextResponse.json(
    successResponse('Profile retrieved', { profile: data })
  );
}
```

**Changes:**
- ✅ Added day_rate to SELECT
- ✅ Added day_rate_currency to SELECT
- ✅ Added work_identities to SELECT
- ✅ Backward compatible

---

## 📋 Testing Checklist

### Test Case 1: Create Credit with New Fields

**Request:**
```bash
POST /api/profile/credits
Authorization: Bearer <token>
Content-Type: application/json

{
  "credit_title": "Nike Summer Campaign 2024",
  "description": "Directed major commercial campaign",
  "start_date": "2024-01-15",
  "end_date": "2024-02-28",
  "production_type": "Commercial",
  "role": "Director",
  "project_title": "Just Do It - Summer Edition",
  "brand_client": "Nike",
  "local_company": "Dubai Media Productions",
  "international_company": "Wieden+Kennedy",
  "country": "UAE",
  "release_year": "2024",
  "is_unreleased": false,
  "headline_stats": "100M+ views across platforms",
  "awards": [
    {
      "title": "Best Commercial",
      "detail": "Dubai Advertising Awards 2024"
    }
  ]
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Credit created",
  "data": {
    "credit": {
      "id": "uuid",
      "credit_title": "Nike Summer Campaign 2024",
      "production_type": "Commercial",
      "role": "Director",
      "awards": [
        {
          "title": "Best Commercial",
          "detail": "Dubai Advertising Awards 2024"
        }
      ],
      // ... all other fields
    }
  }
}
```

### Test Case 2: Update Profile with Day Rate

**Request:**
```bash
PATCH /api/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "day_rate": 150000,
  "day_rate_currency": "USD"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    "profile": {
      "user_id": "uuid",
      "day_rate": 150000,
      "day_rate_currency": "USD",
      // ... all other fields
    }
  }
}
```

### Test Case 3: Update Work Identities

**Request:**
```bash
PATCH /api/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "work_identities": {
    "freelance": true,
    "employee": {
      "enabled": true,
      "company": "Warner Bros",
      "designation": "Senior Cinematographer"
    },
    "businessOwner": {
      "enabled": false,
      "designation": "",
      "businessName": "",
      "businessType": ""
    }
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    "profile": {
      "user_id": "uuid",
      "work_identities": {
        "freelance": true,
        "employee": {
          "enabled": true,
          "company": "Warner Bros",
          "designation": "Senior Cinematographer"
        },
        "businessOwner": {
          "enabled": false,
          "designation": "",
          "businessName": "",
          "businessType": ""
        }
      },
      // ... all other fields
    }
  }
}
```

### Test Case 4: Get Credits with New Fields

**Request:**
```bash
GET /api/profile/credits
Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Credits retrieved",
  "data": {
    "credits": [
      {
        "id": "uuid",
        "credit_title": "Nike Summer Campaign 2024",
        "production_type": "Commercial",
        "role": "Director",
        "project_title": "Just Do It - Summer Edition",
        "brand_client": "Nike",
        "local_company": "Dubai Media Productions",
        "international_company": "Wieden+Kennedy",
        "country": "UAE",
        "release_year": "2024",
        "is_unreleased": false,
        "headline_stats": "100M+ views across platforms",
        "awards": [
          {
            "title": "Best Commercial",
            "detail": "Dubai Advertising Awards 2024"
          }
        ],
        "start_date": "2024-01-15",
        "end_date": "2024-02-28",
        "description": "Directed major commercial campaign",
        "image_url": null,
        "sort_order": 0,
        "created_at": "2025-01-15T10:00:00Z",
        "updated_at": "2025-01-15T10:00:00Z"
      }
    ]
  }
}
```

### Test Case 5: Backward Compatibility

**Request (Old Client - No New Fields):**
```bash
POST /api/profile/credits
Authorization: Bearer <token>
Content-Type: application/json

{
  "credit_title": "Basic Credit",
  "start_date": "2024-01-01"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Credit created",
  "data": {
    "credit": {
      "id": "uuid",
      "credit_title": "Basic Credit",
      "start_date": "2024-01-01",
      "production_type": null,
      "role": null,
      "awards": [],
      // ... all new fields are null/default
    }
  }
}
```

---

## 🔍 Validation Rules Summary

### user_credits Validations

| Field | Required | Format | Example |
|-------|----------|--------|---------|
| `credit_title` | ✅ Yes | String (non-empty) | "Nike Campaign" |
| `start_date` | ✅ Yes | Date (YYYY-MM-DD) | "2024-01-15" |
| `release_year` | ❌ No | "YYYY" or "Coming YYYY" | "2024" or "Coming 2025" |
| `awards` | ❌ No | Array of `{title, detail?}` | `[{"title": "Best Film"}]` |
| All others | ❌ No | - | - |

### user_profiles Validations

| Field | Required | Format | Valid Values |
|-------|----------|--------|--------------|
| `day_rate` | ❌ No | Positive integer or null | 150000 (for $1,500) |
| `day_rate_currency` | ❌ No | 3-letter code | USD, AED, EUR, GBP, INR, CAD, AUD, JPY, CNY, SGD |
| `work_identities` | ❌ No | JSONB object | See structure above |

---

## 🚀 Implementation Steps

### Step 1: Database Migration
```sql
-- Execute these in Supabase SQL Editor
-- (SQL scripts are in /documentation/backend-documentation-and-commands/profile-page-update/)

1. Run: 01_enhance_user_credits_table.sql
2. Run: 02_add_day_rate_to_profiles.sql
3. Run: 03_add_work_identities_to_profiles.sql
4. Verify: 04_verify_rls_policies.sql
```

### Step 2: Update API Routes

**Priority Order:**
1. ✅ Update `/api/profile/credits/route.ts` (GET, POST, PATCH)
2. ✅ Update `/api/profile/route.ts` (GET, PATCH)

**Files to Modify:**
- `/app/api/profile/credits/route.ts`
- `/app/api/profile/route.ts`

### Step 3: Test Each Endpoint

**Test in Order:**
1. Test GET /api/profile/credits (should return new fields as null)
2. Test POST /api/profile/credits with new fields
3. Test PATCH /api/profile/credits with new fields
4. Test PATCH /api/profile with day_rate
5. Test PATCH /api/profile with work_identities
6. Test GET /api/profile (should return new fields)

### Step 4: Verify Backward Compatibility

- Test old clients (without new fields) can still create credits
- Test old clients can still update profiles
- Test new clients work with old data (null new fields)

---

## 📖 Example Use Cases

### Use Case 1: Film Director Portfolio

**Scenario:** Director wants to showcase their feature film work

**Credit Example:**
```json
{
  "credit_title": "The Lost City",
  "production_type": "Film",
  "role": "Director",
  "project_title": "The Lost City",
  "international_company": "Universal Pictures",
  "country": "USA",
  "release_year": "2024",
  "is_unreleased": false,
  "headline_stats": "Box office: $150M worldwide",
  "awards": [
    {
      "title": "Best Director",
      "detail": "Sundance Film Festival 2024"
    },
    {
      "title": "Audience Choice Award",
      "detail": "Toronto International Film Festival"
    }
  ]
}
```

### Use Case 2: Cinematographer with Commercial Work

**Scenario:** Cinematographer wants to highlight their brand work

**Credit Example:**
```json
{
  "credit_title": "Apple iPhone 15 Launch",
  "production_type": "Commercial",
  "role": "Cinematographer",
  "project_title": "Shot on iPhone 15 Pro",
  "brand_client": "Apple",
  "international_company": "TBWA\\Media Arts Lab",
  "country": "USA",
  "release_year": "2024",
  "headline_stats": "500M+ views, Featured in Super Bowl",
  "awards": []
}
```

### Use Case 3: Freelance Producer with Day Rate

**Scenario:** Producer wants to advertise their availability and rate

**Profile Update:**
```json
{
  "day_rate": 120000,
  "day_rate_currency": "USD",
  "work_identities": {
    "freelance": true,
    "employee": {
      "enabled": false,
      "company": "",
      "designation": ""
    },
    "businessOwner": {
      "enabled": false,
      "designation": "",
      "businessName": "",
      "businessType": ""
    }
  }
}
```

### Use Case 4: Employee + Freelancer

**Scenario:** User works full-time but also freelances

**Profile Update:**
```json
{
  "day_rate": 80000,
  "day_rate_currency": "USD",
  "work_identities": {
    "freelance": true,
    "employee": {
      "enabled": true,
      "company": "Warner Bros",
      "designation": "Senior Editor"
    },
    "businessOwner": {
      "enabled": false,
      "designation": "",
      "businessName": "",
      "businessType": ""
    }
  }
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: JSONB Parse Error

**Error:** "invalid input syntax for type json"

**Cause:** Invalid JSON structure sent to awards or work_identities

**Solution:**
- Ensure JSON is properly formatted
- Validate structure before sending
- Check for missing quotes or commas

### Issue 2: Release Year Validation Fails

**Error:** "Invalid release_year format"

**Cause:** Incorrect format (e.g., "2024-01-01" instead of "2024")

**Solution:**
- Use format: "YYYY" or "Coming YYYY"
- Examples: "2024", "Coming 2025"

### Issue 3: Day Rate Not Displaying

**Cause:** day_rate stored in cents, frontend expects dollars

**Solution:**
- Backend stores: 150000 (= $1,500)
- Frontend displays: 150000 / 100 = $1,500.00

### Issue 4: Work Identities Structure Error

**Error:** "work_identities missing required key"

**Cause:** Incomplete structure

**Solution:**
- Always include all three keys: freelance, employee, businessOwner
- Use default structure if unsure

---

## ✅ Success Criteria

After implementation, verify:

- ✅ Credits can be created with all 11 new fields
- ✅ Credits display new fields when retrieved
- ✅ Credits can be updated with new fields
- ✅ Profile can be updated with day_rate fields
- ✅ Profile can be updated with work_identities
- ✅ Profile GET returns all new fields
- ✅ Validation works for all new fields
- ✅ Backward compatibility maintained
- ✅ Old clients work without errors
- ✅ RLS policies secure new fields

---

## 📚 Related Documentation

- **Database Architecture:** `/documentation/backend-documentation-and-commands/UPDATED_BACKEND_ARCHITECTURE.md`
- **Profile Update Analysis:** `/documentation/backend-documentation-and-commands/profile-page-update/00_ANALYSIS.md`
- **SQL Migration Scripts:** `/documentation/backend-documentation-and-commands/profile-page-update/01_*.sql`
- **API Documentation:** `/documentation/API-Docs/API_DOC.md`

---

**Document Version:** 1.0  
**Created:** January 2025  
**Status:** ✅ Ready for Implementation  
**Maintained By:** Backend Architecture Team
