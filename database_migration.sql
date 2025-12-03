-- Highlights Feature: Database Migration
-- This script updates the user_highlights table to support dynamic highlights

-- Step 1: Add new columns to user_highlights
ALTER TABLE user_highlights 
ADD COLUMN IF NOT EXISTS source_type TEXT,
ADD COLUMN IF NOT EXISTS source_id UUID;

-- Step 2: Add constraint for valid source types
ALTER TABLE user_highlights
DROP CONSTRAINT IF EXISTS valid_source_type;

ALTER TABLE user_highlights
ADD CONSTRAINT valid_source_type 
CHECK (source_type IN ('credit', 'slate_post') OR source_type IS NULL);

-- Step 3: Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_highlights_source 
ON user_highlights(user_id, source_type, source_id);

-- Step 4: Make old columns nullable (for backward compatibility)
ALTER TABLE user_highlights 
ALTER COLUMN title DROP NOT NULL,
ALTER COLUMN description DROP NOT NULL;

-- Step 5: Add comments
COMMENT ON COLUMN user_highlights.source_type IS 'Type of content: credit or slate_post';
COMMENT ON COLUMN user_highlights.source_id IS 'Reference to user_credits.id or slate_posts.id';

-- Note: Run this script in your Supabase SQL Editor
