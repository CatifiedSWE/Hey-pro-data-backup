-- =====================================================
-- CHAT MODULE - TABLE CREATION
-- =====================================================
-- Description: Creates all tables for the chat messaging system
-- Dependencies: user_profiles table must exist
-- Version: 1.0.0
-- Last Updated: January 2025
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CONVERSATIONS TABLE (1-on-1 Chats)
-- =====================================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_message_id UUID,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT different_users CHECK (user1_id != user2_id),
    CONSTRAINT ordered_users CHECK (user1_id < user2_id),
    CONSTRAINT unique_conversation UNIQUE (user1_id, user2_id)
);

COMMENT ON TABLE conversations IS 'Stores metadata for 1-on-1 conversations between users';
COMMENT ON COLUMN conversations.user1_id IS 'First participant (lower UUID value for consistency)';
COMMENT ON COLUMN conversations.user2_id IS 'Second participant (higher UUID value for consistency)';
COMMENT ON COLUMN conversations.last_message_id IS 'Reference to the most recent message';
COMMENT ON COLUMN conversations.last_message_at IS 'Timestamp of the last message for sorting';

-- =====================================================
-- 2. GROUP CHATS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS group_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    avatar_urls JSONB DEFAULT '[]'::jsonb,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    last_message_id UUID,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 200),
    CONSTRAINT valid_avatar_urls CHECK (jsonb_typeof(avatar_urls) = 'array')
);

COMMENT ON TABLE group_chats IS 'Stores metadata for group chat conversations';
COMMENT ON COLUMN group_chats.name IS 'Group chat display name';
COMMENT ON COLUMN group_chats.avatar_urls IS 'Array of image URLs for group avatar display';
COMMENT ON COLUMN group_chats.created_by IS 'User who created the group (admin by default)';

-- =====================================================
-- 3. GROUP MEMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES group_chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_role CHECK (role IN ('admin', 'member')),
    CONSTRAINT unique_group_member UNIQUE (group_id, user_id)
);

COMMENT ON TABLE group_members IS 'Stores group membership information';
COMMENT ON COLUMN group_members.role IS 'Member role: admin or member';
COMMENT ON COLUMN group_members.joined_at IS 'When the user joined the group';

-- =====================================================
-- 4. MESSAGES TABLE (Both 1-on-1 and Group)
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    group_id UUID REFERENCES group_chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachment_url TEXT,
    attachment_type VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'sent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT message_belongs_to_conversation_or_group CHECK (
        (conversation_id IS NOT NULL AND group_id IS NULL) OR
        (conversation_id IS NULL AND group_id IS NOT NULL)
    ),
    CONSTRAINT valid_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 10000),
    CONSTRAINT valid_status CHECK (status IN ('sending', 'sent', 'delivered', 'read')),
    CONSTRAINT valid_attachment_type CHECK (
        attachment_type IS NULL OR 
        attachment_type IN ('image', 'video', 'file', 'audio')
    )
);

COMMENT ON TABLE messages IS 'Stores all messages for both 1-on-1 and group conversations';
COMMENT ON COLUMN messages.conversation_id IS 'Reference to 1-on-1 conversation (mutually exclusive with group_id)';
COMMENT ON COLUMN messages.group_id IS 'Reference to group chat (mutually exclusive with conversation_id)';
COMMENT ON COLUMN messages.content IS 'Message text content (1-10000 characters)';
COMMENT ON COLUMN messages.attachment_url IS 'URL to attached media/file in Supabase Storage';
COMMENT ON COLUMN messages.attachment_type IS 'Type of attachment: image, video, file, audio';
COMMENT ON COLUMN messages.status IS 'Message status: sending, sent, delivered, read';
COMMENT ON COLUMN messages.deleted_at IS 'Soft delete timestamp';

-- =====================================================
-- 5. MESSAGE READ STATUS TABLE (For Group Messages)
-- =====================================================
CREATE TABLE IF NOT EXISTS message_read_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_message_read UNIQUE (message_id, user_id)
);

COMMENT ON TABLE message_read_status IS 'Tracks read receipts for group messages';
COMMENT ON COLUMN message_read_status.read_at IS 'When the message was read by the user';

-- =====================================================
-- 6. TYPING INDICATORS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS typing_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    group_id UUID REFERENCES group_chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_typing BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT typing_belongs_to_conversation_or_group CHECK (
        (conversation_id IS NOT NULL AND group_id IS NULL) OR
        (conversation_id IS NULL AND group_id IS NOT NULL)
    ),
    CONSTRAINT unique_typing_indicator UNIQUE (conversation_id, group_id, user_id)
);

COMMENT ON TABLE typing_indicators IS 'Stores typing status for real-time indicators';
COMMENT ON COLUMN typing_indicators.is_typing IS 'Whether the user is currently typing';
COMMENT ON COLUMN typing_indicators.updated_at IS 'Last update time (for expiring stale indicators)';

-- =====================================================
-- FOREIGN KEY UPDATES
-- =====================================================

-- Add foreign key constraint for last_message_id in conversations
ALTER TABLE conversations
    ADD CONSTRAINT fk_conversations_last_message
    FOREIGN KEY (last_message_id) REFERENCES messages(id) ON DELETE SET NULL;

-- Add foreign key constraint for last_message_id in group_chats
ALTER TABLE group_chats
    ADD CONSTRAINT fk_group_chats_last_message
    FOREIGN KEY (last_message_id) REFERENCES messages(id) ON DELETE SET NULL;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for conversations
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for group_chats
CREATE TRIGGER update_group_chats_updated_at
    BEFORE UPDATE ON group_chats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for messages
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for typing_indicators
CREATE TRIGGER update_typing_indicators_updated_at
    BEFORE UPDATE ON typing_indicators
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify all tables were created
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
    AND table_name IN (
        'conversations',
        'group_chats',
        'group_members',
        'messages',
        'message_read_status',
        'typing_indicators'
    )
ORDER BY table_name;
