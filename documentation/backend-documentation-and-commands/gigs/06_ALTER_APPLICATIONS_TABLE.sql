-- =====================================================
-- GIGS APPLICATION: ADD MISSING COLUMNS
-- =====================================================
-- Purpose: Add columns to store credits, rates, and availability data
-- Execute Order: Run this after other gig migrations
-- Created: January 2025

-- =====================================================
-- 1. ALTER applications TABLE - Add 3 new columns
-- =====================================================

-- Add selected_credits (stores array of credit objects user selected)
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS selected_credits JSONB DEFAULT '[]'::jsonb;

-- Add selected_rate (stores the rate/day rate user selected or entered)
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS selected_rate TEXT;

-- Add availability_data (stores array of {date, status} pairs)
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS availability_data JSONB DEFAULT '[]'::jsonb;

-- Add column comments for documentation
COMMENT ON COLUMN applications.selected_credits IS 'Array of credit objects (work history) selected by applicant';
COMMENT ON COLUMN applications.selected_rate IS 'Day rate selected or entered by applicant (e.g., "500", "1000")';
COMMENT ON COLUMN applications.availability_data IS 'Array of availability objects with date and status (A=available, P1/P2=priority, N/A=not available)';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'applications'
AND column_name IN ('selected_credits', 'selected_rate', 'availability_data')
ORDER BY ordinal_position;

-- =====================================================
-- SAMPLE DATA STRUCTURE (for reference)
-- =====================================================

/*
selected_credits example:
[
  {
    "id": "cred-01",
    "title": "City of Echoes",
    "startDate": "2021-04-12",
    "endDate": "2022-02-18"
  },
  {
    "id": "cred-02",
    "title": "Aurora District",
    "startDate": "2020-11-03",
    "endDate": "2021-06-21"
  }
]

selected_rate example:
"500" or "1000" (day rate in AED or USD)

availability_data example:
[
  {
    "date": "2025-09-15",
    "status": "A"
  },
  {
    "date": "2025-09-16",
    "status": "P1"
  },
  {
    "date": "2025-09-20",
    "status": "N/A"
  }
]

Status codes:
- "A" = Available (confirmed available)
- "P1" = Priority 1 (available with preference)
- "P2" = Priority 2 (available as backup)
- "N/A" = Not Available
*/

-- =====================================================
-- SAMPLE INSERT (for testing)
-- =====================================================

/*
-- Example: Insert an application with all new fields
INSERT INTO applications (
  gig_id, 
  applicant_user_id, 
  cover_letter, 
  portfolio_links,
  resume_url,
  selected_credits,
  selected_rate,
  availability_data,
  status
) VALUES (
  'your-gig-id-here',
  'your-user-id-here',
  'I am interested in this gig...',
  '["https://portfolio.com/work1", "https://vimeo.com/12345"]',
  'https://storage.supabase.co/resumes/resume.pdf',
  '[{"id": "cred-01", "title": "City of Echoes", "startDate": "2021-04-12", "endDate": "2022-02-18"}]',
  '500',
  '[{"date": "2025-09-15", "status": "A"}, {"date": "2025-09-16", "status": "P1"}]',
  'pending'
) RETURNING *;
*/

-- =====================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- =====================================================

/*
-- To rollback:
ALTER TABLE applications DROP COLUMN IF EXISTS selected_credits;
ALTER TABLE applications DROP COLUMN IF EXISTS selected_rate;
ALTER TABLE applications DROP COLUMN IF EXISTS availability_data;
*/

-- =====================================================
-- NOTES
-- =====================================================

/*
1. JSONB data type is used for efficient storage and querying of JSON data in PostgreSQL

2. Default values are set to empty arrays for JSONB fields to avoid NULL issues

3. selected_rate is stored as TEXT to handle various formats:
   - Simple numbers: "500", "1000"
   - With currency: "AED 500", "$1000"
   - Request quote scenarios

4. availability_data format matches frontend calendar component structure

5. These fields are optional - applications without this data will still work

6. Consider adding indexes if you need to query by these fields:
   CREATE INDEX idx_applications_rate ON applications((selected_rate::INTEGER)) WHERE selected_rate ~ '^\d+$';
*/
