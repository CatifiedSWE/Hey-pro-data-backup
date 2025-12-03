-- =============================================================================
-- What's On Feature - Saves/Bookmarks Table
-- =============================================================================
-- This file creates the whatson_saves table for bookmark functionality
-- =============================================================================

-- -----------------------------------------------------------------------------
-- whatson_saves (User Bookmarks/Saves)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS whatson_saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES whatson_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT unique_user_event_save UNIQUE (event_id, user_id)
);

COMMENT ON TABLE whatson_saves IS 'Users who saved/bookmarked events for later viewing';
COMMENT ON COLUMN whatson_saves.event_id IS 'Event that was saved';
COMMENT ON COLUMN whatson_saves.user_id IS 'User who saved the event';
COMMENT ON CONSTRAINT unique_user_event_save ON whatson_saves IS 'One save per user per event';

-- -----------------------------------------------------------------------------
-- Indexes for Performance
-- -----------------------------------------------------------------------------
CREATE INDEX idx_whatson_saves_user_id ON whatson_saves(user_id);
CREATE INDEX idx_whatson_saves_event_id ON whatson_saves(event_id);
CREATE INDEX idx_whatson_saves_user_created ON whatson_saves(user_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- Row Level Security (RLS) Policies
-- -----------------------------------------------------------------------------
ALTER TABLE whatson_saves ENABLE ROW LEVEL SECURITY;

-- Users can view their own saves
CREATE POLICY "Users can view own saves"
ON whatson_saves FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own saves
CREATE POLICY "Users can create saves"
ON whatson_saves FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own saves
CREATE POLICY "Users can delete own saves"
ON whatson_saves FOR DELETE
USING (auth.uid() = user_id);

-- Event creators can view who saved their events
CREATE POLICY "Event creators can view saves"
ON whatson_saves FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM whatson_events
    WHERE whatson_events.id = whatson_saves.event_id
    AND whatson_events.created_by = auth.uid()
  )
);

-- -----------------------------------------------------------------------------
-- Verification Queries
-- -----------------------------------------------------------------------------

-- Verify table exists
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name = 'whatson_saves';

-- Verify indexes
-- SELECT indexname FROM pg_indexes 
-- WHERE tablename = 'whatson_saves';

-- Verify RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE tablename = 'whatson_saves';
