-- =====================================================
-- COLLAB FEATURE - ADDITIONAL TABLES
-- =====================================================
-- This file creates additional tables for:
-- - Save/Bookmark feature
-- - Share tracking
-- - Threaded comments system
-- =====================================================

-- =====================================================
-- 1. COLLAB_SAVES TABLE
-- Users who saved/bookmarked collab posts
-- =====================================================

CREATE TABLE IF NOT EXISTS collab_saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collab_id UUID NOT NULL REFERENCES collab_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(collab_id, user_id)
);

CREATE INDEX idx_collab_saves_user_id ON collab_saves(user_id);
CREATE INDEX idx_collab_saves_collab_id ON collab_saves(collab_id);

COMMENT ON TABLE collab_saves IS 'Users who saved/bookmarked collab posts for later viewing';
COMMENT ON COLUMN collab_saves.user_id IS 'User who saved the collab post';
COMMENT ON COLUMN collab_saves.collab_id IS 'Collab post that was saved';

-- =====================================================
-- 2. COLLAB_SHARES TABLE
-- Track when collab posts are shared
-- =====================================================

CREATE TABLE IF NOT EXISTS collab_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collab_id UUID NOT NULL REFERENCES collab_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    share_type TEXT NOT NULL CHECK (share_type IN ('link', 'twitter', 'linkedin', 'facebook')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_collab_shares_collab_id ON collab_shares(collab_id);
CREATE INDEX idx_collab_shares_user_id ON collab_shares(user_id);

COMMENT ON TABLE collab_shares IS 'Track when and how collab posts are shared';
COMMENT ON COLUMN collab_shares.share_type IS 'Type of share: link (copied), twitter, linkedin, facebook';

-- =====================================================
-- 3. COLLAB_COMMENTS TABLE
-- Threaded comments on collab posts
-- =====================================================

CREATE TABLE IF NOT EXISTS collab_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collab_id UUID NOT NULL REFERENCES collab_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES collab_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (LENGTH(content) >= 1 AND LENGTH(content) <= 5000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_collab_comments_collab_id ON collab_comments(collab_id);
CREATE INDEX idx_collab_comments_user_id ON collab_comments(user_id);
CREATE INDEX idx_collab_comments_parent_id ON collab_comments(parent_id);
CREATE INDEX idx_collab_comments_created_at ON collab_comments(created_at DESC);

COMMENT ON TABLE collab_comments IS 'Comments on collab posts with support for threaded replies';
COMMENT ON COLUMN collab_comments.parent_id IS 'Parent comment ID for threaded replies (NULL for top-level comments)';
COMMENT ON COLUMN collab_comments.content IS 'Comment text (1-5000 characters)';

-- =====================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =====================================================

-- Trigger for collab_comments
CREATE TRIGGER trigger_update_collab_comments_updated_at
    BEFORE UPDATE ON collab_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_collab_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE collab_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_comments ENABLE ROW LEVEL SECURITY;

-- COLLAB_SAVES Policies
CREATE POLICY "Users can view their own saves"
    ON collab_saves FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can save collab posts"
    ON collab_saves FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saves"
    ON collab_saves FOR DELETE
    USING (auth.uid() = user_id);

-- COLLAB_SHARES Policies
CREATE POLICY "Users can create shares"
    ON collab_shares FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view share counts"
    ON collab_shares FOR SELECT
    USING (true);

-- COLLAB_COMMENTS Policies
CREATE POLICY "Anyone can view comments on open/closed collabs"
    ON collab_comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM collab_posts
            WHERE collab_posts.id = collab_comments.collab_id
            AND collab_posts.status IN ('open', 'closed')
        )
    );

CREATE POLICY "Authenticated users can create comments"
    ON collab_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
    ON collab_comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
    ON collab_comments FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if all tables exist
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name LIKE 'collab_%'
-- ORDER BY table_name;

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE tablename LIKE 'collab_%';
