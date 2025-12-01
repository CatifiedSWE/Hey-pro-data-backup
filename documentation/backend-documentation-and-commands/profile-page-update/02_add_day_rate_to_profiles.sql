-- =====================================================
-- ADD DAY RATE FIELDS TO user_profiles TABLE
-- =====================================================
-- Execute this in Supabase SQL Editor
-- Adds day_rate and day_rate_currency columns
-- Enables rate display and filtering for marketplace
-- =====================================================

-- Add day_rate columns to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS day_rate INTEGER,
ADD COLUMN IF NOT EXISTS day_rate_currency TEXT DEFAULT 'USD';

-- Add column comments for documentation
COMMENT ON COLUMN user_profiles.day_rate IS 'Daily rate for work in cents (e.g., 150000 = $1,500/day). Stored as INTEGER to avoid floating point issues.';
COMMENT ON COLUMN user_profiles.day_rate_currency IS 'Currency code for day_rate (e.g., USD, AED, EUR, GBP, INR)';

-- Add check constraint for valid day_rate (must be positive if provided)
ALTER TABLE user_profiles
ADD CONSTRAINT IF NOT EXISTS chk_user_profiles_day_rate_positive
CHECK (day_rate IS NULL OR day_rate > 0);

COMMENT ON CONSTRAINT chk_user_profiles_day_rate_positive ON user_profiles IS 'Ensures day_rate is positive if specified';

-- Add check constraint for valid currency codes
ALTER TABLE user_profiles
ADD CONSTRAINT IF NOT EXISTS chk_user_profiles_currency_valid
CHECK (
    day_rate_currency IS NULL OR
    day_rate_currency IN (
        'USD', 'AED', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 
        'JPY', 'CNY', 'CHF', 'SEK', 'NZD', 'SGD', 'HKD',
        'NOK', 'KRW', 'TRY', 'RUB', 'BRL', 'ZAR', 'MXN'
    )
);

COMMENT ON CONSTRAINT chk_user_profiles_currency_valid ON user_profiles IS 'Validates currency code against common currencies';

-- Create index for day_rate range queries
-- Useful for "Find crew members between $X-$Y per day"
CREATE INDEX IF NOT EXISTS idx_user_profiles_day_rate ON user_profiles(day_rate) 
WHERE day_rate IS NOT NULL;

-- Create composite index for currency and rate
CREATE INDEX IF NOT EXISTS idx_user_profiles_rate_currency ON user_profiles(day_rate_currency, day_rate)
WHERE day_rate IS NOT NULL;

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
WHERE table_name = 'user_profiles' 
AND column_name IN ('day_rate', 'day_rate_currency')
ORDER BY ordinal_position;

-- Verify constraints exist
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'user_profiles'
AND constraint_name LIKE '%day_rate%'
ORDER BY constraint_name;

-- Verify indexes exist
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'user_profiles'
AND (indexname LIKE '%day_rate%' OR indexname LIKE '%rate_currency%')
ORDER BY indexname;

-- =====================================================
-- SAMPLE DATA EXAMPLES
-- =====================================================

-- Example 1: Update a user's day rate (DO NOT RUN - EXAMPLE ONLY)
/*
UPDATE user_profiles
SET 
    day_rate = 200000,  -- $2,000/day (stored in cents)
    day_rate_currency = 'USD'
WHERE user_id = 'YOUR_USER_ID_HERE';
*/

-- Example 2: Update with AED currency
/*
UPDATE user_profiles
SET 
    day_rate = 500000,  -- AED 5,000/day (stored in fils - smallest unit)
    day_rate_currency = 'AED'
WHERE user_id = 'YOUR_USER_ID_HERE';
*/

-- =====================================================
-- SAMPLE QUERY EXAMPLES
-- =====================================================

-- Example 1: Find users with day rates between $500-$2000
/*
SELECT 
    user_id,
    first_name,
    surname,
    day_rate,
    day_rate_currency
FROM user_profiles
WHERE day_rate_currency = 'USD'
AND day_rate BETWEEN 50000 AND 200000  -- $500 to $2000
ORDER BY day_rate ASC;
*/

-- Example 2: Find all users with rates in AED
/*
SELECT 
    user_id,
    first_name,
    surname,
    day_rate / 100.0 AS day_rate_amount,  -- Convert from fils
    day_rate_currency
FROM user_profiles
WHERE day_rate_currency = 'AED'
AND day_rate IS NOT NULL
ORDER BY day_rate DESC;
*/

-- Example 3: Get users with rates, formatted for display
/*
SELECT 
    user_id,
    first_name || ' ' || surname AS full_name,
    CASE 
        WHEN day_rate IS NOT NULL THEN 
            day_rate_currency || ' ' || (day_rate / 100.0)::text
        ELSE 'Rate not specified'
    END AS formatted_rate
FROM user_profiles
WHERE visible_in_explore = true
ORDER BY day_rate NULLS LAST;
*/

-- Example 4: Count users by currency
/*
SELECT 
    day_rate_currency,
    COUNT(*) as user_count,
    AVG(day_rate / 100.0) as avg_rate,
    MIN(day_rate / 100.0) as min_rate,
    MAX(day_rate / 100.0) as max_rate
FROM user_profiles
WHERE day_rate IS NOT NULL
GROUP BY day_rate_currency
ORDER BY user_count DESC;
*/

-- Example 5: Find users with no rate specified (for admin follow-up)
/*
SELECT 
    user_id,
    first_name,
    surname,
    email,
    is_profile_complete
FROM user_profiles
WHERE day_rate IS NULL
AND is_profile_complete = true
AND visible_in_explore = true
ORDER BY created_at DESC
LIMIT 100;
*/

-- =====================================================
-- CURRENCY CONVERSION HELPER FUNCTION (OPTIONAL)
-- =====================================================

-- Create a function to format day rate for display
CREATE OR REPLACE FUNCTION format_day_rate(
    rate INTEGER,
    currency TEXT
) RETURNS TEXT AS $$
BEGIN
    IF rate IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Convert from cents/fils to main currency unit
    RETURN currency || ' ' || (rate / 100.0)::TEXT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION format_day_rate(INTEGER, TEXT) IS 'Formats day_rate from cents to display string (e.g., "USD 1500.00")';

-- Test the function (DO NOT RUN - EXAMPLE ONLY)
/*
SELECT 
    first_name,
    format_day_rate(day_rate, day_rate_currency) as formatted_rate
FROM user_profiles
WHERE day_rate IS NOT NULL
LIMIT 10;
*/

-- =====================================================
-- DATA MIGRATION HELPER (OPTIONAL)
-- =====================================================

-- If you have existing rate data in a different format,
-- use this script to migrate (CUSTOMIZE AS NEEDED)
/*
-- Example: If you had a text field 'rate' like "$1500"
UPDATE user_profiles
SET 
    day_rate = (REGEXP_REPLACE(old_rate_field, '[^0-9]', '', 'g')::INTEGER * 100),
    day_rate_currency = 'USD'
WHERE old_rate_field IS NOT NULL
AND old_rate_field ~ '^\$[0-9]+$';
*/

-- =====================================================
-- ROLLBACK SCRIPT (USE ONLY IF NEEDED)
-- =====================================================
/*
-- WARNING: This will DROP the columns and their data!
-- ONLY use if you need to revert the migration

DROP FUNCTION IF EXISTS format_day_rate(INTEGER, TEXT);

DROP INDEX IF EXISTS idx_user_profiles_day_rate;
DROP INDEX IF EXISTS idx_user_profiles_rate_currency;

ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS chk_user_profiles_day_rate_positive,
DROP CONSTRAINT IF EXISTS chk_user_profiles_currency_valid;

ALTER TABLE user_profiles
DROP COLUMN IF EXISTS day_rate,
DROP COLUMN IF EXISTS day_rate_currency;
*/

-- =====================================================
-- END OF MIGRATION SCRIPT
-- =====================================================

-- Status: Ready for execution
-- Estimated execution time: < 3 seconds
-- Impact: Zero downtime (nullable columns)
-- Rollback: Available (see above)
