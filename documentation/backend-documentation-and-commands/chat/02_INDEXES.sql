-- =====================================================
-- CHAT MODULE - INDEX CREATION
-- =====================================================
-- Description: Creates indexes for optimizing chat queries
-- Dependencies: All chat tables must exist
-- Version: 1.0.0
-- Last Updated: January 2025
-- =====================================================

-- =====================================================
-- CONVERSATIONS INDEXES
-- =====================================================

-- Index for finding conversations by user
CREATE INDEX IF NOT EXISTS idx_conversations_user1_id 
    ON conversations(user1_id);

CREATE INDEX IF NOT EXISTS idx_conversations_user2_id 
    ON conversations(user2_id);

-- Composite index for user pair lookup (optimizes finding existing conversation)
CREATE INDEX IF NOT EXISTS idx_conversations_user_pair 
    ON conversations(user1_id, user2_id);

-- Index for sorting conversations by last message
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at 
    ON conversations(last_message_at DESC NULLS LAST);

-- Composite index for user conversations sorted by last message
CREATE INDEX IF NOT EXISTS idx_conversations_user1_last_message 
    ON conversations(user1_id, last_message_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_conversations_user2_last_message 
    ON conversations(user2_id, last_message_at DESC NULLS LAST);

-- =====================================================
-- GROUP CHATS INDEXES
-- =====================================================

-- Index for finding groups by creator
CREATE INDEX IF NOT EXISTS idx_group_chats_created_by 
    ON group_chats(created_by);

-- Index for sorting groups by last message
CREATE INDEX IF NOT EXISTS idx_group_chats_last_message_at 
    ON group_chats(last_message_at DESC NULLS LAST);

-- Index for sorting groups by creation date
CREATE INDEX IF NOT EXISTS idx_group_chats_created_at 
    ON group_chats(created_at DESC);

-- Index for searching groups by name
CREATE INDEX IF NOT EXISTS idx_group_chats_name 
    ON group_chats USING gin(to_tsvector('english', name));

-- =====================================================
-- GROUP MEMBERS INDEXES
-- =====================================================

-- Index for finding all groups a user is member of
CREATE INDEX IF NOT EXISTS idx_group_members_user_id 
    ON group_members(user_id);

-- Index for finding all members of a group
CREATE INDEX IF NOT EXISTS idx_group_members_group_id 
    ON group_members(group_id);

-- Composite index for group membership queries
CREATE INDEX IF NOT EXISTS idx_group_members_group_user 
    ON group_members(group_id, user_id);

-- Index for finding group admins
CREATE INDEX IF NOT EXISTS idx_group_members_role 
    ON group_members(group_id, role) WHERE role = 'admin';

-- Index for sorting members by join date
CREATE INDEX IF NOT EXISTS idx_group_members_joined_at 
    ON group_members(group_id, joined_at DESC);

-- =====================================================
-- MESSAGES INDEXES
-- =====================================================

-- Index for finding messages in a conversation
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
    ON messages(conversation_id, created_at DESC) 
    WHERE deleted_at IS NULL;

-- Index for finding messages in a group
CREATE INDEX IF NOT EXISTS idx_messages_group_id 
    ON messages(group_id, created_at DESC) 
    WHERE deleted_at IS NULL;

-- Index for finding messages by sender
CREATE INDEX IF NOT EXISTS idx_messages_sender_id 
    ON messages(sender_id, created_at DESC)
    WHERE deleted_at IS NULL;

-- Index for message status queries
CREATE INDEX IF NOT EXISTS idx_messages_status 
    ON messages(conversation_id, status) 
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_messages_group_status 
    ON messages(group_id, status) 
    WHERE deleted_at IS NULL;

-- Index for finding unread messages in conversations
CREATE INDEX IF NOT EXISTS idx_messages_conversation_unread 
    ON messages(conversation_id, sender_id, status, created_at DESC) 
    WHERE deleted_at IS NULL AND status != 'read';

-- Index for messages with attachments
CREATE INDEX IF NOT EXISTS idx_messages_attachments 
    ON messages(conversation_id, attachment_type, created_at DESC) 
    WHERE attachment_url IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_messages_group_attachments 
    ON messages(group_id, attachment_type, created_at DESC) 
    WHERE attachment_url IS NOT NULL AND deleted_at IS NULL;

-- Full-text search index for message content
CREATE INDEX IF NOT EXISTS idx_messages_content_search 
    ON messages USING gin(to_tsvector('english', content))
    WHERE deleted_at IS NULL;

-- Index for soft-deleted messages
CREATE INDEX IF NOT EXISTS idx_messages_deleted_at 
    ON messages(deleted_at) 
    WHERE deleted_at IS NOT NULL;

-- =====================================================
-- MESSAGE READ STATUS INDEXES
-- =====================================================

-- Index for finding read status by message
CREATE INDEX IF NOT EXISTS idx_message_read_status_message_id 
    ON message_read_status(message_id);

-- Index for finding read messages by user
CREATE INDEX IF NOT EXISTS idx_message_read_status_user_id 
    ON message_read_status(user_id, read_at DESC);

-- Composite index for checking if user has read a message
CREATE INDEX IF NOT EXISTS idx_message_read_status_message_user 
    ON message_read_status(message_id, user_id);

-- =====================================================
-- TYPING INDICATORS INDEXES
-- =====================================================

-- Index for finding typing users in a conversation
CREATE INDEX IF NOT EXISTS idx_typing_indicators_conversation 
    ON typing_indicators(conversation_id, is_typing, updated_at DESC) 
    WHERE is_typing = TRUE;

-- Index for finding typing users in a group
CREATE INDEX IF NOT EXISTS idx_typing_indicators_group 
    ON typing_indicators(group_id, is_typing, updated_at DESC) 
    WHERE is_typing = TRUE;

-- Index for cleaning up stale typing indicators
CREATE INDEX IF NOT EXISTS idx_typing_indicators_stale 
    ON typing_indicators(updated_at) 
    WHERE is_typing = TRUE;

-- Index for user's typing status
CREATE INDEX IF NOT EXISTS idx_typing_indicators_user 
    ON typing_indicators(user_id, updated_at DESC);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify all indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN (
        'conversations',
        'group_chats',
        'group_members',
        'messages',
        'message_read_status',
        'typing_indicators'
    )
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- =====================================================
-- INDEX USAGE STATISTICS (For Monitoring)
-- =====================================================

-- Query to check index usage
-- Run this periodically to identify unused indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
    AND tablename IN (
        'conversations',
        'group_chats',
        'group_members',
        'messages',
        'message_read_status',
        'typing_indicators'
    )
ORDER BY idx_scan DESC;
