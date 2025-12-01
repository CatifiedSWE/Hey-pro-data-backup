-- =====================================================
-- ENHANCE user_credits TABLE - ADD MISSING COLUMNS
-- =====================================================
-- Execute this in Supabase SQL Editor
-- Adds 11 new columns to user_credits for rich credit display
-- All columns are NULLABLE for backward compatibility
-- =====================================================

-- Add new columns to user_credits table
ALTER TABLE user_credits
ADD COLUMN IF NOT EXISTS production_type TEXT,
ADD COLUMN IF NOT EXISTS role TEXT,
ADD COLUMN IF NOT EXISTS project_title TEXT,
ADD COLUMN IF NOT EXISTS brand_client TEXT,
ADD COLUMN IF NOT EXISTS local_company TEXT,
ADD COLUMN IF NOT EXISTS international_company TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS release_year TEXT,
ADD COLUMN IF NOT EXISTS is_unreleased BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS headline_stats TEXT,
ADD COLUMN IF NOT EXISTS awards JSONB DEFAULT '[]'::jsonb;

-- Add column comments for documentation
COMMENT ON COLUMN user_credits.production_type IS 'Type of production (e.g., Commercial, Film, TV Series, Music Video, Documentary)';
COMMENT ON COLUMN user_credits.role IS 'User role in the project (e.g., Director, Cinematographer, Editor, Producer)';
COMMENT ON COLUMN user_credits.project_title IS 'Specific project name or title';
COMMENT ON COLUMN user_credits.brand_client IS 'Brand or client name (e.g., Nike, Apple, Coca-Cola)';
COMMENT ON COLUMN user_credits.local_company IS 'Local production company or studio';
COMMENT ON COLUMN user_credits.international_company IS 'International production company or studio (e.g., Warner Bros, Universal)';
COMMENT ON COLUMN user_credits.country IS 'Production country or location';
COMMENT ON COLUMN user_credits.release_year IS 'Year of release or expected release';
COMMENT ON COLUMN user_credits.is_unreleased IS 'Flag indicating if project is not yet released';
COMMENT ON COLUMN user_credits.headline_stats IS 'Key statistics or achievements (e.g., "500M+ views", "#1 on Netflix")';
COMMENT ON COLUMN user_credits.awards IS 'Array of awards: [{"title": "Best Film", "detail": "Cannes 2024"}]';

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_user_credits_production_type ON user_credits(production_type);
CREATE INDEX IF NOT EXISTS idx_user_credits_role ON user_credits(role);
CREATE INDEX IF NOT EXISTS idx_user_credits_country ON user_credits(country);
CREATE INDEX IF NOT EXISTS idx_user_credits_release_year ON user_credits(release_year);

-- Create GIN index for JSONB awards column (for efficient JSON queries)
CREATE INDEX IF NOT EXISTS idx_user_credits_awards_gin ON user_credits USING GIN (awards);

-- Add composite index for common filtering scenarios
CREATE INDEX IF NOT EXISTS idx_user_credits_type_role ON user_credits(user_id, production_type, role);

-- Add check constraint for release_year format (optional but recommended)
ALTER TABLE user_credits 
ADD CONSTRAINT IF NOT EXISTS chk_user_credits_release_year 
CHECK (release_year IS NULL OR release_year ~ '^[0-9]{4}$' OR release_year ~ '^Coming [0-9]{4}$');

COMMENT ON CONSTRAINT chk_user_credits_release_year ON user_credits IS 'Validates release_year format: "2024" or "Coming 2025"';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify new columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_credits' 
AND column_name IN (
    'production_type', 'role', 'project_title', 'brand_client',
    'local_company', 'international_company', 'country',
    'release_year', 'is_unreleased', 'headline_stats', 'awards'
)
ORDER BY ordinal_position;

-- Verify indexes exist
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'user_credits'
AND indexname LIKE '%production_type%' 
   OR indexname LIKE '%role%'
   OR indexname LIKE '%country%'
   OR indexname LIKE '%awards%'
ORDER BY indexname;

-- Test JSONB awards structure (sample insert - DO NOT RUN IN PRODUCTION)
-- UNCOMMENT ONLY FOR TESTING:
/*
INSERT INTO user_credits (
    user_id,
    credit_title,
    description,
    start_date,
    production_type,
    role,
    project_title,
    brand_client,
    international_company,
    country,
    release_year,
    headline_stats,
    awards
) VALUES (
    'YOUR_USER_ID_HERE',  -- Replace with actual user_id
    'Major Feature Film',
    'Led cinematography for a major feature film production',
    '2023-01-15',
    'Film',
    'Cinematographer',
    'The Great Adventure',
    'Universal Pictures',
    'Universal Studios',
    'USA',
    '2024',
    'Box Office: $250M+',
    '[
        {"title": "Best Cinematography", "detail": "Academy Awards 2024"},
        {"title": "Golden Globe Nominee"},
        {"title": "ASC Award Winner", "detail": "American Society of Cinematographers"}
    ]'::jsonb
);
*/

-- =====================================================
-- SAMPLE QUERY EXAMPLES
-- =====================================================

-- Example 1: Get all credits for a user with full details
/*
SELECT 
    id,
    credit_title,
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
    start_date,
    end_date,
    description,
    image_url
FROM user_credits
WHERE user_id = 'YOUR_USER_ID_HERE'
ORDER BY start_date DESC;
*/

-- Example 2: Find all Film credits with awards
/*
SELECT 
    credit_title,
    role,
    awards
FROM user_credits
WHERE production_type = 'Film'
AND jsonb_array_length(awards) > 0
ORDER BY start_date DESC;
*/

-- Example 3: Find all credits for a specific brand/client
/*
SELECT 
    user_id,
    credit_title,
    role,
    start_date
FROM user_credits
WHERE brand_client = 'Nike'
ORDER BY start_date DESC;
*/

-- Example 4: Find credits by production company
/*
SELECT 
    credit_title,
    role,
    international_company,
    country
FROM user_credits
WHERE international_company ILIKE '%Warner Bros%'
ORDER BY start_date DESC;
*/

-- Example 5: Search awards for specific keywords
/*
SELECT 
    credit_title,
    awards
FROM user_credits
WHERE awards @> '[{"title": "Best Film"}]'::jsonb
OR awards::text ILIKE '%Cannes%';
*/

-- =====================================================
-- ROLLBACK SCRIPT (USE ONLY IF NEEDED)
-- =====================================================
/*
-- WARNING: This will DROP all new columns and their data!
-- ONLY use if you need to revert the migration

DROP INDEX IF EXISTS idx_user_credits_production_type;
DROP INDEX IF EXISTS idx_user_credits_role;
DROP INDEX IF EXISTS idx_user_credits_country;
DROP INDEX IF EXISTS idx_user_credits_release_year;
DROP INDEX IF EXISTS idx_user_credits_awards_gin;
DROP INDEX IF EXISTS idx_user_credits_type_role;

ALTER TABLE user_credits 
DROP CONSTRAINT IF EXISTS chk_user_credits_release_year;

ALTER TABLE user_credits
DROP COLUMN IF EXISTS production_type,
DROP COLUMN IF EXISTS role,
DROP COLUMN IF EXISTS project_title,
DROP COLUMN IF EXISTS brand_client,
DROP COLUMN IF EXISTS local_company,
DROP COLUMN IF EXISTS international_company,
DROP COLUMN IF EXISTS country,
DROP COLUMN IF EXISTS release_year,
DROP COLUMN IF EXISTS is_unreleased,
DROP COLUMN IF EXISTS headline_stats,
DROP COLUMN IF EXISTS awards;
*/

-- =====================================================
-- END OF MIGRATION SCRIPT
-- =====================================================

-- Status: Ready for execution
-- Estimated execution time: < 5 seconds
-- Impact: Zero downtime (nullable columns)
-- Rollback: Available (see above)
