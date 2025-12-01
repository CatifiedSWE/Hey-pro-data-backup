# Profile Page Backend Update - SQL Migration Scripts

**Project:** HeyProData  
**Feature:** Profile Page Enhancements  
**Date:** January 2025  
**Status:** Ready for Implementation

---

## 📋 Overview

This directory contains SQL migration scripts and analysis for enhancing the backend database to support full profile page functionality.

### What's Included

| File | Purpose | Type |
|------|---------|------|
| `00_ANALYSIS.md` | Comprehensive analysis of missing fields | Documentation |
| `01_enhance_user_credits_table.sql` | Add 11 columns to user_credits | SQL Migration |
| `02_add_day_rate_to_profiles.sql` | Add day_rate fields to user_profiles | SQL Migration |
| `03_add_work_identities_to_profiles.sql` | Add work_identities JSONB to user_profiles | SQL Migration |
| `04_verify_rls_policies.sql` | Verify RLS policies cover new columns | SQL Verification |
| `README.md` | This file | Documentation |

---

## 🎯 Quick Start

### Prerequisites
- Access to Supabase SQL Editor
- Existing HeyProData database with profile tables
- Understanding of PostgreSQL and JSONB

### Execution Order

```bash
# Step 1: Read the analysis
Open: 00_ANALYSIS.md

# Step 2: Execute migrations in order
1. Run: 01_enhance_user_credits_table.sql
2. Run: 02_add_day_rate_to_profiles.sql
3. Run: 03_add_work_identities_to_profiles.sql

# Step 3: Verify security
4. Review: 04_verify_rls_policies.sql
```

### Estimated Time
- Total execution time: **< 15 seconds**
- Zero downtime (all columns are nullable)

---

## 📊 What's Being Added

### 1. user_credits Table (11 New Columns)

**Current State:** Basic job listings  
**After Update:** Rich professional portfolios

**New Columns:**
- `production_type` - Commercial, Film, TV, Music Video, etc.
- `role` - Director, Cinematographer, Editor, Producer, etc.
- `project_title` - Specific project name
- `brand_client` - Nike, Apple, Government agencies, etc.
- `local_company` - Local production houses
- `international_company` - Warner Bros, Universal, BBC, etc.
- `country` - Production location
- `release_year` - Release year or "Coming 2025"
- `is_unreleased` - Boolean flag
- `headline_stats` - "500M+ views", "Box office $100M", etc.
- `awards` - JSONB array: `[{"title": "Best Film", "detail": "Cannes 2024"}]`

**Impact:** Users can showcase impressive portfolios with full production context, client work, awards, and achievements.

### 2. user_profiles Table (3 New Columns)

**Current State:** Basic profile information  
**After Update:** Complete professional profile with rates and work status

**New Columns:**
- `day_rate` (INTEGER) - Daily rate in cents (e.g., 150000 = $1,500)
- `day_rate_currency` (TEXT) - USD, AED, EUR, GBP, etc.
- `work_identities` (JSONB) - Flexible work status configuration

**Impact:** 
- Marketplace functionality (filter by day rate)
- Professional context (freelance + employee + business owner)
- Transparent pricing for clients

### 3. work_identities Structure

```json
{
  "freelance": true,
  "employee": {
    "enabled": true,
    "company": "Warner Bros",
    "designation": "Senior Cinematographer"
  },
  "businessOwner": {
    "enabled": true,
    "designation": "Founder & CEO",
    "businessName": "Creative Productions LLC",
    "businessType": "Film Production"
  }
}
```

---

## 🔒 Security

### RLS Policies

✅ **All new columns are automatically covered by existing RLS policies**

- **User Ownership:** Users can only edit their own data
- **Public Viewing:** Profiles and credits are publicly viewable (for discovery)
- **Row-Level Security:** Based on `user_id` ownership
- **Column Inheritance:** New columns inherit row-level security automatically

**Conclusion:** No new RLS policies needed. Existing policies cover all scenarios.

---

## 🚀 Migration Details

### Script 01: Enhance user_credits

**What it does:**
- Adds 11 new columns to `user_credits`
- Creates 5 indexes for performance
- Adds validation constraint for release_year
- Includes rollback script

**Safe to run because:**
- All columns are nullable
- No data modification
- Backward compatible

**Performance:**
- Execution: < 5 seconds
- Downtime: None
- Indexes created: 5

### Script 02: Add Day Rate

**What it does:**
- Adds `day_rate` and `day_rate_currency` to `user_profiles`
- Creates indexes for range queries
- Adds validation constraints
- Creates helper function for formatting

**Safe to run because:**
- Nullable columns with defaults
- No existing data affected
- Constraints only validate new data

**Performance:**
- Execution: < 3 seconds
- Downtime: None
- Indexes created: 2

### Script 03: Add Work Identities

**What it does:**
- Adds `work_identities` JSONB column
- Creates GIN index for JSONB queries
- Creates validation function
- Creates helper functions for queries

**Safe to run because:**
- JSONB column with default value
- No existing data affected
- Validation only checks structure

**Performance:**
- Execution: < 5 seconds
- Downtime: None
- Functions created: 5

---

## 📖 Usage Examples

### Query Credits with New Fields

```sql
SELECT 
    credit_title,
    production_type,
    role,
    brand_client,
    international_company,
    awards
FROM user_credits
WHERE user_id = 'YOUR_USER_ID'
AND production_type = 'Film'
ORDER BY start_date DESC;
```

### Filter by Day Rate Range

```sql
SELECT 
    first_name,
    surname,
    day_rate / 100.0 AS daily_rate,
    day_rate_currency
FROM user_profiles
WHERE day_rate_currency = 'USD'
AND day_rate BETWEEN 50000 AND 200000  -- $500 to $2000
ORDER BY day_rate ASC;
```

### Find Freelancers

```sql
SELECT 
    first_name,
    surname,
    work_identities
FROM user_profiles
WHERE (work_identities->>'freelance')::boolean = true;
```

### Search Awards

```sql
SELECT 
    credit_title,
    awards
FROM user_credits
WHERE awards @> '[{"title": "Best Film"}]'::jsonb;
```

---

## ✅ Verification

After running migrations, verify success:

```sql
-- Check new columns exist in user_credits
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_credits' 
AND column_name IN (
    'production_type', 'role', 'project_title', 
    'brand_client', 'awards'
);

-- Check new columns exist in user_profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN (
    'day_rate', 'day_rate_currency', 'work_identities'
);

-- Check indexes were created
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('user_credits', 'user_profiles')
AND indexname LIKE '%day_rate%' OR indexname LIKE '%production_type%';
```

---

## 🔄 Next Steps

### After Running SQL Migrations

1. **Update API Endpoints**
   - Modify `/api/profile/credits/route.ts`
     - Add new fields to POST validation
     - Add new fields to PATCH validation
     - Include new fields in GET queries
   
   - Modify `/api/profile/route.ts`
     - Add day_rate fields to PATCH validation
     - Add work_identities to PATCH validation
     - Handle JSONB serialization

2. **Update Frontend Components**
   - `CreditView.tsx` - Already expects new fields
   - `CreditsEditor.tsx` - Add form fields for new columns
   - `WorkStatus.tsx` - Already has UI for work_identities
   - `ShortProfile.tsx` - Already displays day_rate

3. **Test End-to-End**
   - Create credit with all new fields
   - View credit as public user
   - Update credit with awards
   - Set day rate and work identities
   - Verify public can view
   - Verify user can only edit own data

4. **Monitor Performance**
   - Check query performance with new indexes
   - Monitor JSONB query performance
   - Add more indexes if needed

---

## 🐛 Troubleshooting

### Issue: Column already exists
**Solution:** Check if migration was already run. Use `IF NOT EXISTS` clauses in scripts (already included).

### Issue: Constraint violation
**Solution:** Check data format. JSONB must be valid JSON. Currency codes must be in allowed list.

### Issue: Slow JSONB queries
**Solution:** Ensure GIN indexes are created. Check `EXPLAIN ANALYZE` output.

### Issue: RLS blocking queries
**Solution:** Review RLS policies. Run queries from `04_verify_rls_policies.sql`.

---

## 📝 Rollback

Each SQL script includes a rollback section (commented out).

**To rollback:**
1. Uncomment the rollback section at the end of each script
2. Execute in reverse order (03 → 02 → 01)
3. **WARNING:** This will DELETE all data in the new columns

---

## 📚 Related Documentation

- **Backend Architecture:** `/documentation/backend-documentation-and-commands/UPDATED_BACKEND_ARCHITECTURE.md`
- **Profile SQL:** `/documentation/backend-documentation-and-commands/profile/`
- **API Documentation:** `/documentation/API-Docs/`
- **Frontend Components:** `/app/(app)/profile/`

---

## 🤝 Contributing

For questions or issues:
1. Review `00_ANALYSIS.md` for context
2. Check `04_verify_rls_policies.sql` for security
3. Test in development environment first
4. Document any changes or issues

---

## 📊 Impact Summary

### User Benefits
- ✅ Showcase professional portfolios with full context
- ✅ Display impressive client work (Nike, Apple, etc.)
- ✅ Highlight awards and achievements
- ✅ Set transparent day rates
- ✅ Show work identity (freelance, employee, business owner)

### Business Benefits
- ✅ Richer user profiles attract more engagement
- ✅ Marketplace functionality (filter by rate)
- ✅ Better search and discovery
- ✅ Professional credibility increases platform value

### Technical Benefits
- ✅ Zero downtime migration
- ✅ Backward compatible
- ✅ Proper indexing for performance
- ✅ JSONB for flexibility
- ✅ Validation constraints for data quality

---

**Version:** 1.0  
**Last Updated:** January 2025  
**Status:** ✅ Ready for Production
