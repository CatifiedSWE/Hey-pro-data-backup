-- =====================================================
-- ADD WORK IDENTITIES TO user_profiles TABLE
-- =====================================================
-- Execute this in Supabase SQL Editor
-- Adds work_identities JSONB column for flexible work status
-- Supports: Freelance, Employee, Business Owner configurations
-- =====================================================

-- Add work_identities column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS work_identities JSONB DEFAULT '{"freelance": false, "employee": {"enabled": false, "company": "", "designation": ""}, "businessOwner": {"enabled": false, "designation": "", "businessName": "", "businessType": ""}}'::jsonb;

-- Add column comment for documentation
COMMENT ON COLUMN user_profiles.work_identities IS 'Work identity configuration stored as JSONB: {freelance: boolean, employee: {enabled, company, designation}, businessOwner: {enabled, designation, businessName, businessType}}';

-- Create GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_work_identities_gin ON user_profiles USING GIN (work_identities);

-- Create specific indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_freelance ON user_profiles ((work_identities->>'freelance'))
WHERE (work_identities->>'freelance')::boolean = true;

CREATE INDEX IF NOT EXISTS idx_user_profiles_employee ON user_profiles ((work_identities->'employee'->>'enabled'))
WHERE (work_identities->'employee'->>'enabled')::boolean = true;

CREATE INDEX IF NOT EXISTS idx_user_profiles_business_owner ON user_profiles ((work_identities->'businessOwner'->>'enabled'))
WHERE (work_identities->'businessOwner'->>'enabled')::boolean = true;

-- =====================================================
-- JSONB STRUCTURE VALIDATION
-- =====================================================

-- Create a validation function to ensure correct structure
CREATE OR REPLACE FUNCTION validate_work_identities(identities JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if required keys exist
    IF NOT (identities ? 'freelance' AND identities ? 'employee' AND identities ? 'businessOwner') THEN
        RETURN FALSE;
    END IF;
    
    -- Validate freelance is boolean
    IF jsonb_typeof(identities->'freelance') != 'boolean' THEN
        RETURN FALSE;
    END IF;
    
    -- Validate employee structure
    IF NOT (
        identities->'employee' ? 'enabled' AND
        identities->'employee' ? 'company' AND
        identities->'employee' ? 'designation'
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Validate businessOwner structure
    IF NOT (
        identities->'businessOwner' ? 'enabled' AND
        identities->'businessOwner' ? 'designation' AND
        identities->'businessOwner' ? 'businessName' AND
        identities->'businessOwner' ? 'businessType'
    ) THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION validate_work_identities(JSONB) IS 'Validates work_identities JSONB structure';

-- Add check constraint using validation function
ALTER TABLE user_profiles
ADD CONSTRAINT IF NOT EXISTS chk_user_profiles_work_identities_structure
CHECK (work_identities IS NULL OR validate_work_identities(work_identities));

COMMENT ON CONSTRAINT chk_user_profiles_work_identities_structure ON user_profiles IS 'Ensures work_identities JSONB has correct structure';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify new column exists
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'work_identities'
ORDER BY ordinal_position;

-- Verify indexes exist
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'user_profiles'
AND indexname LIKE '%work_identities%'
ORDER BY indexname;

-- Verify constraint exists
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'user_profiles'
AND constraint_name LIKE '%work_identities%';

-- =====================================================
-- SAMPLE DATA STRUCTURES
-- =====================================================

-- Example 1: Freelance only
/*
{
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
*/

-- Example 2: Employee only
/*
{
    "freelance": false,
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
*/

-- Example 3: Business Owner only
/*
{
    "freelance": false,
    "employee": {
        "enabled": false,
        "company": "",
        "designation": ""
    },
    "businessOwner": {
        "enabled": true,
        "designation": "Founder & CEO",
        "businessName": "Creative Productions LLC",
        "businessType": "Film Production"
    }
}
*/

-- Example 4: Multiple identities (Freelance + Employee)
/*
{
    "freelance": true,
    "employee": {
        "enabled": true,
        "company": "BBC Studios",
        "designation": "Contract Director"
    },
    "businessOwner": {
        "enabled": false,
        "designation": "",
        "businessName": "",
        "businessType": ""
    }
}
*/

-- Example 5: All three identities
/*
{
    "freelance": true,
    "employee": {
        "enabled": true,
        "company": "Universal Studios",
        "designation": "Creative Consultant"
    },
    "businessOwner": {
        "enabled": true,
        "designation": "Managing Partner",
        "businessName": "Dubai Media House",
        "businessType": "Media Production & Consulting"
    }
}
*/

-- =====================================================
-- SAMPLE UPDATE EXAMPLES (DO NOT RUN - EXAMPLES ONLY)
-- =====================================================

-- Example 1: Set user as freelance
/*
UPDATE user_profiles
SET work_identities = jsonb_set(
    work_identities,
    '{freelance}',
    'true'::jsonb
)
WHERE user_id = 'YOUR_USER_ID_HERE';
*/

-- Example 2: Add employee information
/*
UPDATE user_profiles
SET work_identities = jsonb_set(
    jsonb_set(
        jsonb_set(
            work_identities,
            '{employee,enabled}',
            'true'::jsonb
        ),
        '{employee,company}',
        '"Warner Bros"'::jsonb
    ),
    '{employee,designation}',
    '"Senior Editor"'::jsonb
)
WHERE user_id = 'YOUR_USER_ID_HERE';
*/

-- Example 3: Complete work identities update
/*
UPDATE user_profiles
SET work_identities = '{
    "freelance": true,
    "employee": {
        "enabled": true,
        "company": "BBC Studios",
        "designation": "Creative Director"
    },
    "businessOwner": {
        "enabled": false,
        "designation": "",
        "businessName": "",
        "businessType": ""
    }
}'::jsonb
WHERE user_id = 'YOUR_USER_ID_HERE';
*/

-- =====================================================
-- SAMPLE QUERY EXAMPLES
-- =====================================================

-- Example 1: Find all freelancers
/*
SELECT 
    user_id,
    first_name,
    surname,
    work_identities
FROM user_profiles
WHERE (work_identities->>'freelance')::boolean = true
ORDER BY first_name;
*/

-- Example 2: Find all employees at specific company
/*
SELECT 
    user_id,
    first_name,
    surname,
    work_identities->'employee'->>'company' as company,
    work_identities->'employee'->>'designation' as designation
FROM user_profiles
WHERE (work_identities->'employee'->>'enabled')::boolean = true
AND work_identities->'employee'->>'company' = 'Warner Bros'
ORDER BY first_name;
*/

-- Example 3: Find all business owners
/*
SELECT 
    user_id,
    first_name,
    surname,
    work_identities->'businessOwner'->>'businessName' as business,
    work_identities->'businessOwner'->>'businessType' as type
FROM user_profiles
WHERE (work_identities->'businessOwner'->>'enabled')::boolean = true
ORDER BY first_name;
*/

-- Example 4: Find users with multiple work identities
/*
SELECT 
    user_id,
    first_name,
    surname,
    (work_identities->>'freelance')::boolean as is_freelance,
    (work_identities->'employee'->>'enabled')::boolean as is_employee,
    (work_identities->'businessOwner'->>'enabled')::boolean as is_business_owner
FROM user_profiles
WHERE (
    ((work_identities->>'freelance')::boolean = true)::int +
    ((work_identities->'employee'->>'enabled')::boolean = true)::int +
    ((work_identities->'businessOwner'->>'enabled')::boolean = true)::int
) >= 2
ORDER BY first_name;
*/

-- Example 5: Get work identity summary statistics
/*
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE (work_identities->>'freelance')::boolean = true) as freelancers,
    COUNT(*) FILTER (WHERE (work_identities->'employee'->>'enabled')::boolean = true) as employees,
    COUNT(*) FILTER (WHERE (work_identities->'businessOwner'->>'enabled')::boolean = true) as business_owners
FROM user_profiles
WHERE work_identities IS NOT NULL;
*/

-- Example 6: Search by business type
/*
SELECT 
    user_id,
    first_name,
    surname,
    work_identities->'businessOwner'->>'businessName' as business,
    work_identities->'businessOwner'->>'businessType' as type
FROM user_profiles
WHERE work_identities->'businessOwner'->>'businessType' ILIKE '%production%'
ORDER BY first_name;
*/

-- =====================================================
-- HELPER FUNCTIONS FOR WORK IDENTITIES
-- =====================================================

-- Function to check if user is freelance
CREATE OR REPLACE FUNCTION is_freelance(identities JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (identities->>'freelance')::boolean;
EXCEPTION WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if user is employee
CREATE OR REPLACE FUNCTION is_employee(identities JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (identities->'employee'->>'enabled')::boolean;
EXCEPTION WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if user is business owner
CREATE OR REPLACE FUNCTION is_business_owner(identities JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (identities->'businessOwner'->>'enabled')::boolean;
EXCEPTION WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get work identity labels
CREATE OR REPLACE FUNCTION get_work_identity_labels(identities JSONB)
RETURNS TEXT[] AS $$
DECLARE
    labels TEXT[] := '{}';
BEGIN
    IF is_freelance(identities) THEN
        labels := array_append(labels, 'Freelance');
    END IF;
    
    IF is_employee(identities) THEN
        labels := array_append(labels, 'Employee');
    END IF;
    
    IF is_business_owner(identities) THEN
        labels := array_append(labels, 'Business Owner');
    END IF;
    
    RETURN labels;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION is_freelance(JSONB) IS 'Returns true if user has freelance work identity';
COMMENT ON FUNCTION is_employee(JSONB) IS 'Returns true if user has employee work identity';
COMMENT ON FUNCTION is_business_owner(JSONB) IS 'Returns true if user has business owner work identity';
COMMENT ON FUNCTION get_work_identity_labels(JSONB) IS 'Returns array of work identity labels for display';

-- Test helper functions (DO NOT RUN - EXAMPLE ONLY)
/*
SELECT 
    user_id,
    first_name,
    is_freelance(work_identities) as freelance,
    is_employee(work_identities) as employee,
    is_business_owner(work_identities) as business_owner,
    get_work_identity_labels(work_identities) as labels
FROM user_profiles
WHERE work_identities IS NOT NULL
LIMIT 10;
*/

-- =====================================================
-- ROLLBACK SCRIPT (USE ONLY IF NEEDED)
-- =====================================================
/*
-- WARNING: This will DROP the column and its data!
-- ONLY use if you need to revert the migration

DROP FUNCTION IF EXISTS validate_work_identities(JSONB);
DROP FUNCTION IF EXISTS is_freelance(JSONB);
DROP FUNCTION IF EXISTS is_employee(JSONB);
DROP FUNCTION IF EXISTS is_business_owner(JSONB);
DROP FUNCTION IF EXISTS get_work_identity_labels(JSONB);

DROP INDEX IF EXISTS idx_user_profiles_work_identities_gin;
DROP INDEX IF EXISTS idx_user_profiles_freelance;
DROP INDEX IF EXISTS idx_user_profiles_employee;
DROP INDEX IF EXISTS idx_user_profiles_business_owner;

ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS chk_user_profiles_work_identities_structure;

ALTER TABLE user_profiles
DROP COLUMN IF EXISTS work_identities;
*/

-- =====================================================
-- END OF MIGRATION SCRIPT
-- =====================================================

-- Status: Ready for execution
-- Estimated execution time: < 5 seconds
-- Impact: Zero downtime (nullable column with default)
-- Rollback: Available (see above)
