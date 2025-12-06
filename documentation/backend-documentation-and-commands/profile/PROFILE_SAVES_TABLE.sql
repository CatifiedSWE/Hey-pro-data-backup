-- =====================================================
-- PROFILE SAVES TABLE
-- =====================================================
-- This file creates the table for saving/bookmarking user profiles
-- Similar to collab_saves but for user profiles
-- =====================================================

-- =====================================================
-- 1. PROFILE_SAVES TABLE
-- Users who saved/bookmarked other user profiles
-- =====================================================

CREATE TABLE IF NOT EXISTS profile_saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_user_id, user_id),
    CHECK (profile_user_id != user_id)
);

CREATE INDEX idx_profile_saves_user_id ON profile_saves(user_id);
CREATE INDEX idx_profile_saves_profile_user_id ON profile_saves(profile_user_id);

COMMENT ON TABLE profile_saves IS 'Users who saved/bookmarked other user profiles for later viewing';
COMMENT ON COLUMN profile_saves.profile_user_id IS 'User profile that was saved';
COMMENT ON COLUMN profile_saves.user_id IS 'User who saved the profile';

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE profile_saves ENABLE ROW LEVEL SECURITY;

-- Users can view their own saves
CREATE POLICY "Users can view their own saves"
    ON profile_saves FOR SELECT
    USING (auth.uid() = user_id);

-- Users can save profiles
CREATE POLICY "Users can save profiles"
    ON profile_saves FOR INSERT
    WITH CHECK (auth.uid() = user_id AND profile_user_id != user_id);

-- Users can delete their own saves
CREATE POLICY "Users can delete their own saves"
    ON profile_saves FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if table exists
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name = 'profile_saves';

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE tablename = 'profile_saves';

-- Check indexes
-- SELECT indexname, indexdef FROM pg_indexes 
-- WHERE tablename = 'profile_saves';

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Example: Save a profile
-- INSERT INTO profile_saves (profile_user_id, user_id)
-- VALUES ('profile-uuid-here', 'current-user-uuid-here');

-- Example: Check if profile is saved
-- SELECT EXISTS (
--   SELECT 1 FROM profile_saves 
--   WHERE profile_user_id = 'profile-uuid-here' 
--   AND user_id = 'current-user-uuid-here'
-- );

-- Example: Get all saved profiles for a user
-- SELECT ps.*, up.name, up.avatar, up.bio 
-- FROM profile_saves ps
-- JOIN user_profiles up ON ps.profile_user_id = up.id
-- WHERE ps.user_id = 'current-user-uuid-here'
-- ORDER BY ps.created_at DESC;

-- Example: Remove a saved profile
-- DELETE FROM profile_saves 
-- WHERE profile_user_id = 'profile-uuid-here' 
-- AND user_id = 'current-user-uuid-here';

-- Example: Get save count for a profile
-- SELECT COUNT(*) as save_count 
-- FROM profile_saves 
-- WHERE profile_user_id = 'profile-uuid-here';
